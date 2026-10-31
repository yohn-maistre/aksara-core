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

test("resident tools use an actual multi-step Mastra loop and recheck the host boundary", async () => {
  const reads = [],
    notes = [];
  let checks = 0,
    requests = 0;
  const calls = [
    ["library_search", { query: "water" }],
    ["source_read", { source_id: "artifact_fixture" }],
    ["calculate", { operation: "sum", values: [17, 25] }],
    [
      "save_procedure",
      {
        title: "Water briefing",
        content: "Use litres and include the date. Provisional.",
      },
    ],
  ];
  const text = await generateReply({
    provider: "local",
    model: "fixture",
    messages: [
      {
        role: "user",
        content: "Prepare a water briefing and remember the correction.",
      },
    ],
    signal: AbortSignal.timeout(15000),
    toolPort: {
      assertCurrent: async () => {
        checks++;
      },
      retrieve: async (input) => {
        reads.push(input);
        return {
          artifact_id: "artifact_fixture",
          text: "Water 17 + 25 litres",
        };
      },
      procedure: async (input) => {
        notes.push(input);
        return { id: "artifact_note", status: "unreviewed" };
      },
    },
    fetchImpl: async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.tools.length, 4);
      const next = calls[requests++];
      if (!next) {
        const calculation = body.messages.find(
          (m) => m.role === "tool" && m.tool_call_id === "call-3",
        );
        assert.equal(JSON.parse(calculation.content).value, 42);
      }
      return new Response(
        JSON.stringify({
          id: "fixture",
          object: "chat.completion",
          created: 1,
          model: "fixture",
          choices: [
            {
              index: 0,
              message: next
                ? {
                    role: "assistant",
                    content: null,
                    tool_calls: [
                      {
                        id: `call-${requests}`,
                        type: "function",
                        function: {
                          name: next[0],
                          arguments: JSON.stringify(next[1]),
                        },
                      },
                    ],
                  }
                : {
                    role: "assistant",
                    content:
                      "42 litres. A provisional procedure draft was saved.",
                  },
              finish_reason: next ? "tool_calls" : "stop",
            },
          ],
          usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
        }),
        { headers: { "content-type": "application/json" } },
      );
    },
  });
  assert.match(text, /42 litres/);
  assert.equal(requests, 5);
  assert.equal(reads.length, 2);
  assert.equal(notes.length, 1);
  assert.ok(checks >= 13);
});

test("revocation after a tool read prevents the next model request", async () => {
  let current = true,
    requests = 0;
  await assert.rejects(
    generateReply({
      provider: "local",
      model: "fixture",
      messages: [{ role: "user", content: "Read a source" }],
      signal: AbortSignal.timeout(10000),
      toolPort: {
        assertCurrent: async () => {
          if (!current) throw new Error("Scope revoked");
        },
        retrieve: async () => {
          current = false;
          return { text: "PRIVATE_SOURCE" };
        },
        procedure: async () => {
          throw new Error("Must not write");
        },
      },
      fetchImpl: async () => {
        requests++;
        return new Response(
          JSON.stringify({
            id: "fixture",
            object: "chat.completion",
            created: 1,
            model: "fixture",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: null,
                  tool_calls: [
                    {
                      id: "read",
                      type: "function",
                      function: {
                        name: "source_read",
                        arguments: '{"source_id":"artifact_fixture"}',
                      },
                    },
                  ],
                },
                finish_reason: "tool_calls",
              },
            ],
            usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    }),
  );
  assert.equal(requests, 1);
});
