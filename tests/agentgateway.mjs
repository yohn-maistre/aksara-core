/** Optional real-binary qualification; no cloud credentials or external upstream. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { generateReply } from "../packages/runtime-mastra/index.mjs";
import { openResident } from "../packages/runtime-mastra/resident.mjs";
import { streamingCompletionFixture } from "./completion-fixture.mjs";
const binary = process.env.AKSARA_AGENTGATEWAY_BINARY;
if (!binary)
  throw Error(
    "Set AKSARA_AGENTGATEWAY_BINARY to a verified agentgateway 1.7.0 binary",
  );
const dir = await mkdtemp(path.join(tmpdir(), "aksara-agentgateway-"));
let calls = 0,
  failing = false,
  gateway,
  resident;
const upstream = createServer(async (req, res) => {
  if (req.url === "/api/tags") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ models: [{ name: "fixture-local" }] }));
    return;
  }
  assert.equal(req.url, "/v1/chat/completions");
  assert.equal(req.headers.cookie, undefined);
  assert.equal(req.headers["x-aksara-model-run"], undefined);
  for await (const part of req) {
  }
  calls++;
  if (failing) {
    res.writeHead(503);
    res.end("fixture unavailable");
    return;
  }
  streamingCompletionFixture(res);
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      id: "fixture",
      object: "chat.completion",
      created: 1,
      model: "fixture-local",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "Gateway connection ready." },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
    }),
  );
});
const holder = createServer();
let logs = "";
try {
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  holder.listen(0, "127.0.0.1");
  await once(holder, "listening");
  const port = holder.address().port;
  await new Promise((r) => holder.close(r));
  const config = JSON.parse(
    await readFile(
      new URL("../deploy/agentgateway/local.json", import.meta.url),
    ),
  );
  config.gateways.default.port = port;
  config.routes[0].backends[0].host = `127.0.0.1:${upstream.address().port}`;
  const file = path.join(dir, "gateway.json");
  await writeFile(file, JSON.stringify(config));
  gateway = spawn(binary, ["-f", file], { stdio: ["ignore", "pipe", "pipe"] });
  gateway.stdout.on("data", (b) => (logs += b));
  gateway.stderr.on("data", (b) => (logs += b));
  const endpoint = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(endpoint + "/api/tags");
      if (r.ok) break;
    } catch {}
    if (gateway.exitCode !== null)
      throw Error("Gateway exited before readiness");
    await new Promise((r) => setTimeout(r, 50));
  }
  const tags = await fetch(endpoint + "/api/tags");
  assert.equal(tags.status, 200);
  assert.equal((await tags.json()).models[0].name, "fixture-local");
  assert.equal(
    (await fetch(endpoint + "/api/pull", { method: "POST" })).status,
    404,
  );
  assert.equal(
    (await fetch(endpoint + "/api/tags", { method: "POST" })).status,
    404,
  );
  assert.equal((await fetch(endpoint + "/api/me")).status, 404);
  process.env.AKSARA_LOCAL_MODEL_PORT = String(port);
  resident = await openResident(path.join(dir, "resident"));
  const reply = await generateReply({
    provider: "local",
    model: "fixture-local",
    messages: [{ role: "user", content: "Say ready." }],
    signal: AbortSignal.timeout(10000),
    durability: {
      storage: resident.storage,
      mastra: resident.mastra,
      runId: "gateway-fixture",
    },
  });
  assert.equal(reply, "Gateway connection ready.");
  assert.equal(calls, 1);
  const oversized = await fetch(endpoint + "/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "x".repeat(70000) }),
  });
  assert.equal(oversized.status, 413);
  assert.equal(calls, 1);
  failing = true;
  const before = calls;
  const failed = await fetch(endpoint + "/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: "private=fixture",
      "x-aksara-model-run": "private-run",
    },
    body: "{}",
  });
  assert.equal(failed.status, 503);
  assert.equal(calls, before + 1);
  // The gateway is a loopback transport; it must not become an effect-retry engine.
  assert.ok(!logs.includes("Say ready."));
  let limited = false;
  for (let i = 0; i < 65; i++) {
    const response = await fetch(endpoint + "/api/tags");
    if (response.status === 429) {
      limited = true;
      break;
    }
    assert.equal(response.status, 200);
    await response.arrayBuffer();
  }
  assert.ok(limited, "gateway applies the aggregate request budget");
  console.log(
    "PASS actual agentgateway 1.7.0: model discovery, durable Mastra SSE reply, route/method and oversized-body denial, stripped private headers, no retry on 503, request rate limit, no prompt in logs",
  );
} finally {
  delete process.env.AKSARA_LOCAL_MODEL_PORT;
  await resident?.close();
  if (gateway && gateway.exitCode === null) {
    gateway.kill("SIGTERM");
    await once(gateway, "exit");
  }
  await new Promise((r) => upstream.close(r));
  await rm(dir, { recursive: true, force: true });
}
