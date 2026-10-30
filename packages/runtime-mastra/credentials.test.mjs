import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createProviderCredentials } from "./credentials.mjs";
import { generateReply, modelConfig } from "./index.mjs";
import { HOSTED_PROVIDERS, providerFailure } from "./hosted.mjs";
test("provider keys are isolated, encrypted, rollback on lost scope, and fence old leases", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "aksara-keys-")),
    store = createProviderCredentials(dir);
  const current = async () => {};
  try {
    await store.set(
      "institution:alice",
      "gemini",
      "SYNTHETIC_PRIVATE_KEY",
      current,
    );
    assert.equal(
      (await store.status("institution:bob", "gemini")).connected,
      false,
    );
    assert.equal(
      (await store.status("personal:alice", "gemini")).connected,
      false,
    );
    const lease = await store.lease("institution:alice", "gemini");
    const folder = (await readdir(dir))[0];
    assert.ok(
      !(
        await readFile(path.join(dir, folder, "credential.enc"), "utf8")
      ).includes("SYNTHETIC_PRIVATE_KEY"),
    );
    let count = 0;
    await assert.rejects(
      store.set("institution:alice", "gemini", "PROVISIONAL_KEY", async () => {
        if (++count > 1) throw new Error("scope lost");
      }),
    );
    assert.equal(
      (await store.lease("institution:alice", "gemini")).apiKey,
      lease.apiKey,
    );
    await store.delete("institution:alice", "gemini", current);
    assert.throws(lease.assertCurrent);
    await assert.rejects(store.lease("institution:alice", "gemini"));
    await assert.rejects(
      store.set("x", "https://evil.test", "SYNTHETIC_KEY", current),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("each hosted provider uses its fixed endpoint and OpenRouter stays free-only", async () => {
  for (const [provider, entry] of Object.entries(HOSTED_PROVIDERS)) {
    let called = 0;
    const model = entry.models[0];
    assert.throws(() => modelConfig(provider, "paid-arbitrary-model"));
    await assert.rejects(generateReply({ provider, model, messages: [] }));
    const result = await generateReply({
      provider,
      model,
      apiKey: "SYNTHETIC_KEY",
      messages: [{ role: "user", content: "Synthetic test" }],
      fetchImpl: async (url, options) => {
        called++;
        assert.equal(String(url), entry.baseURL + "/chat/completions");
        const headers = new Headers(options.headers);
        assert.equal(headers.get("authorization"), "Bearer SYNTHETIC_KEY");
        const body = JSON.parse(options.body);
        assert.ok(!body.tools?.length);
        if (provider === "openrouter-free") {
          assert.equal(body.model, "openrouter/free");
          assert.deepEqual(body.provider.max_price, {
            prompt: 0,
            completion: 0,
          });
          assert.equal(body.provider.allow_fallbacks, false);
          assert.deepEqual(body.plugins, []);
        }
        return Response.json({
          id: "fixture",
          object: "chat.completion",
          created: 1,
          model,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Fixture reply" },
              finish_reason: "stop",
            },
          ],
        });
      },
    });
    assert.equal(result, "Fixture reply");
    assert.equal(called, 1);
  }
  assert.ok(
    !providerFailure({ statusCode: 429, message: "SECRET_ECHO" }).includes(
      "SECRET_ECHO",
    ),
  );
});
