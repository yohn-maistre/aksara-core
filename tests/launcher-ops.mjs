/** Real native child startup/restart, custody, stop and CLI inference fixture. */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import http from "node:http";
const exec = promisify(execFile),
  dir = await mkdtemp(path.join(tmpdir(), "Aksara native ü space "));
const node = process.execPath,
  script = path.resolve(
    process.env.AKSARA_LAUNCHER_SCRIPT || "scripts/aksara.mjs",
  );
const common = [
  "--state",
  dir,
  "--port",
  "18741",
  "--service-base",
  "18750",
  ...(process.env.AKSARA_TEST_BINARY
    ? ["--binary", process.env.AKSARA_TEST_BINARY]
    : []),
];
let child;
const model = http.createServer(async (req, res) => {
  if (req.url === "/api/tags") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ models: [{ name: "fixture" }] }));
    return;
  }
  for await (const _ of req) {
  }
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      id: "fixture",
      object: "chat.completion",
      created: 1,
      model: "fixture",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "NATIVE_CLI_REPLY" },
          finish_reason: "stop",
        },
      ],
    }),
  );
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function cli(command, ...args) {
  return exec(node, [script, command, ...common, ...args], {
    timeout: 30000,
    windowsHide: true,
  });
}
async function start() {
  child = spawn(node, [script, "start", ...common], {
    env: { ...process.env, AKSARA_LOCAL_MODEL_PORT: "18760" },
    stdio: "pipe",
    windowsHide: true,
  });
  let logs = "";
  child.stdout.on("data", (b) => (logs += b));
  child.stderr.on("data", (b) => (logs += b));
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      if (JSON.parse((await cli("doctor")).stdout).running) return;
    } catch {}
    await wait(100);
  }
  throw new Error("Native launcher did not start");
}
try {
  await new Promise((r) => model.listen(18760, "127.0.0.1", r));
  await start();
  const response = await fetch("http://127.0.0.1:18741/api/profiles"),
    profiles = await response.json();
  assert.deepEqual(profiles.map((p) => p.mode).sort(), [
    "community",
    "personal",
  ]);
  const doctor = JSON.parse((await cli("doctor")).stdout);
  assert.equal(doctor.simulator, false);
  assert.equal(doctor.development, true);
  assert.match(
    (await cli("chat", "Synthetic prompt")).stdout,
    /NATIVE_CLI_REPLY/,
  );
  await assert.rejects(
    cli(
      "backup",
      path.join(dir, "personal backup.sqlite"),
      "--profile",
      "personal",
    ),
  );
  const exit = new Promise((r) => child.once("exit", r));
  await cli("stop");
  await exit;
  assert.equal(JSON.parse((await cli("doctor")).stdout).running, false);
  await cli(
    "backup",
    path.join(dir, "personal backup.sqlite"),
    "--profile",
    "personal",
  );
  await start();
  const exitAgain = new Promise((r) => child.once("exit", r));
  await cli("stop");
  await exitAgain;
  console.log(
    "PASS native launcher: spaces/Unicode, separate stores, no Python baseline, CLI model reply, backup, authenticated stop and restart",
  );
} finally {
  if (child?.exitCode === null) {
    await cli("stop").catch(() => {});
    child.kill();
  }
  await new Promise((r) => model.close(r));
  await rm(dir, { recursive: true, force: true });
}
