/** Real native host + Mastra tools + canonical custody, using a scripted model.
 * Verifies mechanics and restart/withdrawal, not reasoning quality or live OAuth. */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import http from "node:http";
const exec = promisify(execFile);
const dir = await mkdtemp(path.join(tmpdir(), "Aksara resident ü "));
const base = "http://127.0.0.1:19041";
const launcher = path.resolve(
  process.env.AKSARA_LAUNCHER_SCRIPT || "scripts/aksara.mjs",
);
const common = [
  "--state",
  dir,
  "--port",
  "19041",
  "--service-base",
  "19050",
  ...(process.env.AKSARA_TEST_BINARY
    ? ["--binary", process.env.AKSARA_TEST_BINARY]
    : []),
];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let child,
  cookie,
  scope,
  source,
  note,
  requests = 0,
  round = 0;
let fixtureError;
const model = http.createServer(async (req, res) => {
  try {
    res.setHeader("content-type", "application/json");
    if (req.url === "/api/tags") {
      res.end(JSON.stringify({ models: [{ name: "fixture" }] }));
      return;
    }
    let data = "";
    for await (const b of req) data += b;
    const input = JSON.parse(data);
    const tools = input.messages.filter((m) => m.role === "tool");
    const step = tools.length;
    let call;
    if (round === 0) {
      if (step === 0) call = ["library_search", { query: "water" }];
      if (step === 1) {
        const hits = JSON.parse(tools[0].content).hits;
        assert.equal(hits[0].artifact_id, source.id);
        call = ["source_read", { source_id: hits[0].artifact_id }];
      }
      if (step === 2) {
        assert.match(JSON.parse(tools[1].content).content, /17 and 25/);
        call = ["calculate", { operation: "sum", values: [17, 25] }];
      }
      if (step === 3) {
        assert.equal(JSON.parse(tools[2].content).value, 42);
        call = [
          "save_procedure",
          {
            title: "Water briefing",
            content:
              "State litres and the observation date. Treat totals as provisional until checked.",
          },
        ];
      }
      if (step === 4) note = JSON.parse(tools[3].content);
    } else {
      if (step === 0) call = ["library_search", { query: "Procedure draft" }];
      if (step === 1) {
        assert.ok(
          JSON.parse(tools[0].content).hits.some(
            (h) => h.artifact_id === note.id,
          ),
        );
        call = ["source_read", { source_id: note.id }];
      }
      if (step === 2)
        assert.match(JSON.parse(tools[1].content).content, /observation date/);
    }
    requests++;
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
                      id: `call-${requests}`,
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
                  content: round
                    ? "Reusing the private procedure: include litres and observation date."
                    : "42 litres. A private procedure draft was saved.",
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
async function stop() {
  if (child?.exitCode === null) {
    const exit = new Promise((r) => child.once("exit", r));
    await exec(process.execPath, [launcher, "stop", ...common], {
      timeout: 20000,
      windowsHide: true,
    });
    await exit;
  }
}
async function api(op, input) {
  const r = await fetch(base + "/api/" + op, {
    method: input === undefined ? "GET" : "POST",
    headers: {
      origin: base,
      "content-type": "application/json",
      ...(cookie ? { cookie, "x-aksara-scope": scope } : {}),
    },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const value = await r.json();
  assert.ok(r.ok, `${op}: ${r.status} ${JSON.stringify(value)}`);
  if (op === "session") {
    cookie = r.headers.get("set-cookie").split(";")[0];
    scope = value.scope;
  }
  return value;
}
async function start() {
  child = spawn(process.execPath, [launcher, "start", ...common], {
    env: { ...process.env, AKSARA_LOCAL_MODEL_PORT: "19060" },
    stdio: "pipe",
    windowsHide: true,
  });
  let logs = "";
  child.stdout.on("data", (b) => (logs += b));
  child.stderr.on("data", (b) => (logs += b));
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      if ((await fetch(base + "/api/profiles")).ok) break;
    } catch {}
    await wait(100);
  }
  cookie = null;
  scope = null;
  await api("session", { profile: "personal" });
}
async function settled(run) {
  for (let i = 0; i < 300; i++) {
    if (fixtureError) throw fixtureError;
    const messages = await api("kernel/messages");
    const reply = messages.find(
      (m) => m.run.id === run.id && m.role === "assistant",
    );
    if (reply) return reply;
    await wait(100);
  }
  throw new Error("Resident run did not settle");
}
try {
  await new Promise((r) => model.listen(19060, "127.0.0.1", r));
  await start();
  source = await api("kernel/ingest", {
    title: "Water observation",
    content: "Water samples: 17 and 25 litres, observed 31 October.",
    visibility: "private",
    purpose: "knowledge",
    provenance: "synthetic fixture",
  });
  const request = {
    text: "Prepare a water briefing; save my correction to include litres and the observation date.",
    provider: "local",
    model: "fixture",
    idempotency_key: "resident-first",
    source_ids: [],
  };
  const { run } = await api("chat", request);
  const reply = await settled(run);
  assert.match(reply.text, /42 litres/);
  assert.deepEqual(reply.run.source_ids, [source.id]);
  assert.equal(reply.run.tool_reads.length, 2);
  assert.deepEqual(reply.run.note_ids, [note.id]);
  assert.equal((await api("kernel/memories")).length, 0);
  console.log(
    "PASS real native host / Mastra search → read → calculate → provisional procedure → reply",
  );
  await stop();
  await start();
  const replay = await api("chat", request);
  assert.equal(replay.duplicate, true);
  assert.equal(replay.run.id, run.id);
  assert.equal(requests, 5);
  round = 1;
  const second = await api("chat", {
    ...request,
    text: "Use the earlier water briefing procedure.",
    idempotency_key: "resident-second",
  });
  assert.match((await settled(second.run)).text, /observation date/);
  assert.equal(requests, 8);
  console.log(
    "PASS restart retains procedure; duplicate request makes no new model call; later task retrieves it",
  );
  await api("kernel/withdraw", { id: source.id });
  assert.ok(!(await api("kernel/library")).some((a) => a.id === note.id));
  assert.equal(
    (await api("kernel/messages")).filter((m) => m.role === "assistant").length,
    0,
  );
  console.log(
    "PASS original withdrawal hides derived procedure and both dependent replies",
  );
} finally {
  await stop().catch(() => child?.kill());
  await new Promise((r) => model.close(r));
  await rm(dir, { recursive: true, force: true });
}
