/** Optional actual Vercel driver → native Aksara → Mastra → GUI fixture.
 * Run within a disposable signed-in desktop, with AKSARA_DESKTOP_BINARY set.
 * Model decisions are scripted; the native actions, journal and readback are real. */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
if (!process.env.AKSARA_DESKTOP_BINARY) {
  console.log(
    "SKIP actual desktop fixture: explicit native driver and graphical session required",
  );
  process.exit(0);
}
const exec = promisify(execFile),
  dir = await mkdtemp(path.join(tmpdir(), "Aksara desktop ü "));
const base = "http://127.0.0.1:19241",
  common = ["--state", dir, "--port", "19241", "--service-base", "19250"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const walk = (n) => [n, ...(n.children || []).flatMap(walk)];
let cookie,
  scope,
  browser,
  host,
  fixtureError,
  calls = 0;
const fixture = http.createServer((req, res) =>
  res.end(
    '<!doctype html><title>Aksara isolated office fixture</title><h1>Office fixture</h1><label>Report title<input aria-label="Report title"></label><button onclick="document.querySelector(\'output\').textContent=document.querySelector(\'input\').value">Save draft</button><output aria-live="polite"></output>',
  ),
);
const model = http.createServer(async (req, res) => {
  try {
    res.setHeader("content-type", "application/json");
    if (req.url === "/api/tags") {
      res.end(JSON.stringify({ models: [{ name: "fixture" }] }));
      return;
    }
    let data = "";
    for await (const b of req) data += b;
    const body = JSON.parse(data),
      tools = body.messages.filter((m) => m.role === "tool"),
      step = tools.length;
    let call;
    if (step === 0 || step === 2 || step === 4) call = ["computer_observe", {}];
    if (step === 1) {
      const obs = JSON.parse(tools[0].content).observation;
      const field = walk(obs.tree).find(
        (n) => n.name === "Report title" && n.ref,
      );
      assert.ok(
        field,
        `Synthetic field absent from native observation: ${JSON.stringify(obs)}`,
      );
      call = [
        "computer_act",
        {
          operation: "type",
          ref: field.ref,
          value: "Aksara native end-to-end report",
        },
      ];
    }
    if (step === 3) {
      const obs = JSON.parse(tools[2].content).observation;
      assert.ok(
        walk(obs.tree).some(
          (n) => n.value === "Aksara native end-to-end report",
        ),
      );
      const button = walk(obs.tree).find(
        (n) => n.name === "Save draft" && n.ref,
      );
      call = ["computer_act", { operation: "click", ref: button.ref }];
    }
    if (step === 5) {
      const obs = JSON.parse(tools[4].content).observation;
      assert.ok(
        JSON.stringify(obs).includes("Aksara native end-to-end report"),
      );
      call = [
        "save_document",
        {
          title: "Verified office result",
          content:
            "The synthetic office form displayed Aksara native end-to-end report. Application-level disk persistence was not tested.",
        },
      ];
    }
    calls++;
    res.end(
      JSON.stringify({
        id: "fixture",
        object: "chat.completion",
        created: 1,
        model: "fixture",
        choices: [
          {
            index: 0,
            message: call
              ? {
                  role: "assistant",
                  content: null,
                  tool_calls: [
                    {
                      id: `call-${calls}`,
                      type: "function",
                      function: {
                        name: call[0],
                        arguments: JSON.stringify(call[1]),
                      },
                    },
                  ],
                }
              : {
                  role: "assistant",
                  content:
                    "The test form was filled and its displayed result verified. A report was saved in Library.",
                },
            finish_reason: call ? "tool_calls" : "stop",
          },
        ],
        usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
      }),
    );
  } catch (e) {
    fixtureError = e;
    res.writeHead(500);
    res.end("{}");
  }
});
async function api(route, input) {
  const r = await fetch(base + "/api/" + route, {
    method: input === undefined ? "GET" : "POST",
    headers: {
      origin: base,
      "content-type": "application/json",
      ...(cookie ? { cookie, "x-aksara-scope": scope } : {}),
    },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const value = await r.json();
  assert.ok(r.ok, `${route} ${r.status} ${JSON.stringify(value)}`);
  if (route === "session") {
    cookie = r.headers.get("set-cookie").split(";")[0];
    scope = value.scope;
  }
  return value;
}
try {
  await new Promise((r) => fixture.listen(19261, "127.0.0.1", r));
  await new Promise((r) => model.listen(19260, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: false,
    args: ["--force-renderer-accessibility"],
    env: { ...process.env, ACCESSIBILITY_ENABLED: "1" },
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:19261");
  host = spawn(process.execPath, ["scripts/aksara.mjs", "start", ...common], {
    env: { ...process.env, AKSARA_LOCAL_MODEL_PORT: "19260" },
    stdio: "pipe",
  });
  let logs = "";
  host.stdout.on("data", (b) => (logs += b));
  host.stderr.on("data", (b) => (logs += b));
  for (let i = 0; i < 150; i++) {
    if (host.exitCode !== null) throw Error(logs);
    try {
      if ((await fetch(base + "/api/profiles")).ok) break;
    } catch {}
    await wait(100);
  }
  await api("session", { profile: "personal" });
  let windows = [],
    lastComputer;
  for (let i = 0; i < 50; i++) {
    lastComputer = await api("computer");
    windows = lastComputer.windows;
    if (windows.some((w) => w.title.includes("Aksara isolated office fixture")))
      break;
    await wait(100);
  }
  const window = windows.find((w) =>
    w.title.includes("Aksara isolated office fixture"),
  );
  assert.ok(window, JSON.stringify(lastComputer));
  // A visible Chromium window can precede its renderer's native accessibility
  // tree. Wait on the real synthetic field, not a fixed sleep or a test rerun.
  // This read-only probe has its own namespace/store; none of its refs reach
  // Aksara. The agent must still observe and qualify fresh refs through its port.
  const { stdout: readyTree } = await exec(
    process.env.AKSARA_DESKTOP_BINARY,
    [
      "snapshot",
      "--app",
      window.app_name,
      "--window-id",
      window.id,
      "--max-depth",
      "20",
      "--wait-for",
      "textfield:Report title",
      "--wait-timeout",
      "30000",
      "--session",
      "fixture-readiness",
    ],
    {
      env: { ...process.env, AGENT_DESKTOP_HOME: path.join(dir, "readiness") },
      timeout: 40000,
      maxBuffer: 1024 * 1024,
    },
  );
  const nativeReady = JSON.parse(readyTree);
  assert.equal(nativeReady.ok, true, readyTree);
  assert.ok(
    walk(nativeReady.data.tree).some(
      (n) => n.name === "Report title" && n.ref_id,
    ),
  );
  assert.ok(
    walk(nativeReady.data.tree).some(
      (n) => n.name === "Save draft" && n.ref_id,
    ),
  );
  console.log(
    "PASS synthetic window exposes its form through native accessibility before task admission",
  );
  const grant = await api("computer/connect", {
    window_id: window.id,
    allow_actions: true,
    allow_headed: true,
    acknowledge: true,
  });
  const { run } = await api("chat", {
    provider: "local",
    model: "fixture",
    kind: "background",
    text: "Fill the connected synthetic form and save a result report.",
    source_ids: [],
    idempotency_key: "native-computer-fixture",
  });
  let reply;
  for (let i = 0; i < 300; i++) {
    if (fixtureError) throw fixtureError;
    reply = (await api("kernel/messages")).find(
      (m) => m.run.id === run.id && m.role === "assistant",
    );
    if (reply) break;
    await wait(100);
  }
  assert.ok(reply, "Agent did not finish");
  assert.match(reply.text, /verified/);
  assert.equal(calls, 7);
  assert.equal(
    await page.locator("output").textContent(),
    "Aksara native end-to-end report",
  );
  assert.ok(
    (await api("kernel/library")).some(
      (a) => a.title === "Verified office result",
    ),
  );
  assert.equal(
    reply.run.tool_reads.filter((r) => r.operation === "computer_observe")
      .length,
    3,
  );
  assert.equal((await api("computer")).grant.actions, 2);
  await api("computer/stop", { id: grant.id });
  assert.equal((await api("computer")).grant, null);
  console.log(
    "PASS native Aksara background worker → Vercel observation → permitted physical typing → semantic click → independent GUI readback → saved artifact → Stop",
  );
} finally {
  if (host?.exitCode === null) {
    const exited = new Promise((r) => host.once("exit", r));
    await exec(process.execPath, ["scripts/aksara.mjs", "stop", ...common], {
      timeout: 20000,
    }).catch(() => host.kill());
    await exited;
  }
  await browser?.close();
  fixture.closeAllConnections();
  model.closeAllConnections();
  await Promise.all([
    new Promise((r) => fixture.close(r)),
    new Promise((r) => model.close(r)),
  ]);
  await rm(dir, { recursive: true, force: true });
}
