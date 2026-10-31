import { test } from "node:test";
import assert from "node:assert/strict";
import { MCPClient } from "@mastra/mcp";
import { noopLogger } from "@mastra/core/logger";
import { mkdtemp, rm } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
async function freePort() {
  const s = net.createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise((r) => s.close(r));
  return port;
}
test(
  "real Mastra MCP stdio clients preserve Rust private scope and deny reads after withdrawal",
  { timeout: 20000 },
  async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "aksara-mcp-protocol-")),
      binary = path.resolve("target/debug/aksarad"),
      db = path.join(dir, "kernel.db");
    const dev = JSON.parse(execFileSync(binary, ["--db", db, "init-dev"]));
    const port = await freePort(),
      origin = `http://127.0.0.1:${port}`;
    const host = spawn(
      binary,
      ["--db", db, "serve", "--listen", `127.0.0.1:${port}`],
      { stdio: "ignore" },
    );
    const clients = [];
    try {
      for (let attempt = 0; attempt < 80; attempt++) {
        try {
          if ((await fetch(origin + "/health")).ok) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 30));
      }
      const owner = dev.people[0],
        other = dev.people[1],
        lane = (person) =>
          dev.lanes.find(
            (l) =>
              l.lane.audience.length === 1 &&
              l.lane.audience[0] === person.principal.id,
          ).lane.id;
      async function write(operation, input) {
        const response = await fetch(origin + "/api/" + operation, {
          method: "POST",
          headers: {
            authorization: `Bearer ${owner.token}`,
            "x-aksara-lane": lane(owner),
            "x-aksara-purpose": "knowledge",
            "content-type": "application/json",
          },
          body: JSON.stringify(input),
        });
        assert.equal(response.status, 200);
        return response.json();
      }
      const source = await write("ingest", {
        title: "Private protocol source",
        content: "MCP_PRIVATE_SENTINEL",
        visibility: "private",
        purpose: "knowledge",
        provenance: "test",
      });
      const work = await write("delegate", {
        request: "PRIVATE_MCP_WORK_SENTINEL",
        idempotency_key: "mcp-private-work",
      });
      const memory = await write("memory-candidate", {
        text: "MCP_PRIVATE_SENTINEL",
        source_artifact_id: source.id,
        visibility: "private",
        purpose: "knowledge",
        kind: "semantic",
        evidence_kind: "source_fact",
        retention_seconds: 3600,
      });
      await write("memory-approve", { id: memory.id });
      const create = (person) => {
        const client = new MCPClient({
          id: crypto.randomUUID(),
          registerProcessHooks: false,
          timeout: 5000,
          servers: {
            aksara: {
              command: process.execPath,
              args: [path.resolve("packages/gateway/mcp.mjs")],
              env: {
                AKSARA_URL: origin,
                AKSARA_TOKEN: person.token,
                AKSARA_LANE: lane(person),
              },
            },
          },
        });
        client.__setLogger(noopLogger);
        clients.push(client);
        return client;
      };
      const alice = create(owner),
        bob = create(other);
      const list = await alice.resources.listWithErrors();
      assert.deepEqual(list.errors, {});
      const pack = list.resources.aksara.find(
        (r) => r.uri === "aksara://packs/aksara.knowledge",
      );
      assert.ok(pack);
      const manifest = await alice.resources.read("aksara", pack.uri);
      assert.equal(
        JSON.parse(manifest.contents[0].text).trust,
        "bundled-first-party",
      );
      const resource = list.resources.aksara.find(
        (r) => r.name === "Private protocol source",
      );
      assert.ok(resource);
      const content = await alice.resources.read("aksara", resource.uri);
      assert.equal(
        JSON.parse(content.contents[0].text).content,
        "MCP_PRIVATE_SENTINEL",
      );
      const theirs = await bob.resources.listWithErrors();
      assert.deepEqual(theirs.errors, {});
      assert.ok(
        !JSON.stringify(theirs.resources).includes("Private protocol source"),
      );
      await assert.rejects(
        bob.resources.read("aksara", resource.uri),
        (e) => !String(e).includes("MCP_PRIVATE_SENTINEL"),
      );
      const workList = await alice.resources.read(
        "aksara",
        "aksara://workspace/work",
      );
      assert.equal(JSON.parse(workList.contents[0].text).work[0].id, work.id);
      const workUri = `aksara://work/${work.id}`;
      assert.equal(
        JSON.parse(workList.contents[0].text).work[0].request,
        "PRIVATE_MCP_WORK_SENTINEL",
      );
      // Mastra 2.6 reads advertised resources only; unlisted item URIs are not
      // promoted to a capability through a resource template.
      await assert.rejects(alice.resources.read("aksara", workUri));
      const otherWork = await bob.resources.read(
        "aksara",
        "aksara://workspace/work",
      );
      assert.deepEqual(JSON.parse(otherWork.contents[0].text).work, []);
      await assert.rejects(
        bob.resources.read("aksara", workUri),
        (e) => !String(e).includes("PRIVATE_MCP_WORK_SENTINEL"),
      );
      const tools = await alice.listTools();
      assert.equal(Object.keys(tools).length, 0);
      const recalled = JSON.parse(
        (await alice.resources.read("aksara", "aksara://workspace/knowledge"))
          .contents[0].text,
      );
      assert.equal(recalled.reviewed[0].id, memory.id);
      const otherMemory = JSON.parse(
        (await bob.resources.read("aksara", "aksara://workspace/knowledge"))
          .contents[0].text,
      );
      assert.deepEqual(otherMemory.reviewed, []);
      await write("withdraw", { id: source.id });
      const withdrawnMemory = JSON.parse(
        (await alice.resources.read("aksara", "aksara://workspace/knowledge"))
          .contents[0].text,
      );
      assert.deepEqual(withdrawnMemory.reviewed, []);
      await assert.rejects(
        alice.resources.read("aksara", resource.uri),
        (e) => !String(e).includes("MCP_PRIVATE_SENTINEL"),
      );
      const after = await alice.resources.listWithErrors();
      assert.ok(
        !JSON.stringify(after.resources).includes("Private protocol source"),
      );
    } finally {
      await Promise.allSettled(clients.map((c) => c.disconnect()));
      host.kill("SIGTERM");
      await new Promise((r) => host.once("exit", r));
      await rm(dir, { recursive: true, force: true });
    }
  },
);
