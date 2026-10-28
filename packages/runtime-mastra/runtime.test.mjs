import { test } from "node:test";
import assert from "node:assert/strict";
import { generateReply, modelConfig } from "./index.mjs";

test("paid fallback and arbitrary provider destinations are rejected", () => {
  assert.throws(() => modelConfig("opencode-free", "gpt-paid"));
  assert.throws(() => modelConfig("https://evil.test", "big-pickle"));
  assert.throws(() => modelConfig("local", "bad model\n"));
  assert.equal(modelConfig("opencode-free", "big-pickle").apiKey, "public");
});
test("actual Mastra Agent consumes a provider response without granting tools", async () => {
  let called = 0;
  const text = await generateReply({
    provider: "local",
    model: "fixture",
    messages: [{ role: "user", content: "Synthetic fixture" }],
    signal: AbortSignal.timeout(10000),
    fetchImpl: async (url, options) => {
      called++;
      assert.equal(new URL(url).hostname, "127.0.0.1");
      const body = JSON.parse(options.body);
      assert.ok(!body.tools?.length);
      assert.ok(
        !body.messages.some((m) => m.content?.includes?.("SECRET_SOURCE")),
      );
      return new Response(
        JSON.stringify({
          id: "fixture",
          object: "chat.completion",
          created: 1,
          model: "fixture",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "A synthetic draft." },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
        }),
        { headers: { "content-type": "application/json" } },
      );
    },
  });
  assert.equal(text, "A synthetic draft.");
  assert.equal(called, 1);
});
test("provider failure does not log a private prompt or provider response body", async () => {
  const messages = [];
  const original = console.error;
  console.error = (...args) => messages.push(args);
  try {
    await assert.rejects(
      generateReply({
        provider: "local",
        model: "fixture",
        messages: [{ role: "user", content: "SECRET_PROMPT_SENTINEL" }],
        signal: AbortSignal.timeout(5000),
        fetchImpl: async () =>
          new Response(
            JSON.stringify({ error: { message: "SECRET_PROVIDER_ECHO" } }),
            { status: 403, headers: { "content-type": "application/json" } },
          ),
      }),
    );
    assert.ok(!JSON.stringify(messages).includes("SECRET_PROMPT_SENTINEL"));
    assert.ok(!JSON.stringify(messages).includes("SECRET_PROVIDER_ECHO"));
  } finally {
    console.error = original;
  }
});
