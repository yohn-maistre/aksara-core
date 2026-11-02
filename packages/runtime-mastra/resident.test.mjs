import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { openResident } from "./resident.mjs";
import { generateReply } from "./index.mjs";
test("resident tool journal survives reopen, rejects changed calls, and never repeats uncertain delivery", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "aksara-journal-"));
  let host = await openResident(root),
    effects = 0;
  try {
    await host.journal("run")(
      "one",
      { operation: "save", value: 42 },
      async () => {
        effects++;
        return { artifact: "synthetic" };
      },
    );
    await host.close();
    host = await openResident(root);
    assert.deepEqual(
      await host.journal("run")(
        "one",
        { operation: "save", value: 42 },
        async () => {
          effects++;
        },
      ),
      { artifact: "synthetic" },
    );
    assert.equal(effects, 1);
    await assert.rejects(
      host.journal("run")("one", { operation: "send", value: 42 }, async () => {
        effects++;
      }),
    );
    await assert.rejects(
      host.journal("run")("two", { operation: "send" }, async () => {
        effects++;
        throw Error("synthetic interrupted delivery");
      }),
    );
    assert.equal(host.uncertain("run"), true);
    await assert.rejects(
      host.journal("run")("two", { operation: "send" }, async () => {
        effects++;
      }),
    );
    assert.equal(effects, 2);
  } finally {
    await host.close();
    await rm(root, { recursive: true, force: true });
  }
});
test("actual durable provider path keeps API credentials out of on-disk snapshots and metadata", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "aksara-durable-key-"));
  const host = await openResident(root);
  const secret = "SYNTHETIC_CREDENTIAL_SENTINEL";
  try {
    const reply = await generateReply({
      provider: "gemini",
      model: "gemini-2.5-flash",
      apiKey: secret,
      messages: [{ role: "user", content: "Synthetic prompt" }],
      signal: AbortSignal.timeout(10000),
      durability: {
        storage: host.storage,
        mastra: host.mastra,
        runId: "credential-test",
      },
      fetchImpl: async () => {
        const chunk = (delta, finish_reason = null) => ({
          id: "fixture",
          object: "chat.completion.chunk",
          created: 1,
          model: "fixture",
          choices: [{ index: 0, delta, finish_reason }],
        });
        return new Response(
          `data: ${JSON.stringify(chunk({ role: "assistant", content: "Fixture reply" }))}\n\ndata: ${JSON.stringify(chunk({}, "stop"))}\n\ndata: [DONE]\n\n`,
          { headers: { "content-type": "text/event-stream" } },
        );
      },
    });
    assert.equal(reply, "Fixture reply");
  } finally {
    await host.close();
  }
  try {
    for (const file of ["resident.sqlite", "workflows.sqlite"])
      assert.ok(
        !(await readFile(path.join(root, file))).includes(Buffer.from(secret)),
      );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
