// Research-only API exercise. Scripted localhost model, no inference credentials.
import assert from "node:assert/strict";
import http from "node:http";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { noopLogger } from "@mastra/core/logger";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
let modelCalls = 0,
  toolCalls = 0;
const server = http.createServer(async (req, res) => {
  let s = "";
  for await (const c of req) s += c;
  const b = JSON.parse(s);
  modelCalls++;
  const called = b.messages.some((m) => m.role === "tool");
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      id: "probe",
      object: "chat.completion",
      created: 1,
      model: "fixture",
      choices: [
        {
          index: 0,
          message: called
            ? { role: "assistant", content: "The result is 42." }
            : {
                role: "assistant",
                content: null,
                tool_calls: [
                  {
                    id: "sum",
                    type: "function",
                    function: {
                      name: "add",
                      arguments: JSON.stringify({ a: 17, b: 25 }),
                    },
                  },
                ],
              },
          finish_reason: called ? "stop" : "tool_calls",
        },
      ],
      usage: { prompt_tokens: 20, completion_tokens: 5, total_tokens: 25 },
    }),
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
try {
  const model = createOpenAICompatible({
    name: "probe",
    baseURL: `http://127.0.0.1:${server.address().port}/v1`,
    apiKey: "fixture",
  }).chatModel("fixture");
  const agent = new Agent({
    id: "probe",
    name: "probe",
    instructions: "Use add.",
    model,
    tools: {
      add: createTool({
        id: "add",
        description: "Add two numbers",
        inputSchema: z.object({ a: z.number(), b: z.number() }),
        execute: async ({ a, b }) => {
          toolCalls++;
          return { sum: a + b };
        },
      }),
    },
  });
  agent.__setLogger(noopLogger);
  const r = await agent.generate("Add 17 and 25 using the tool.", {
    maxSteps: 3,
    maxRetries: 0,
  });
  assert.equal(toolCalls, 1);
  assert.equal(modelCalls, 2);
  assert.match(r.text, /42/);
  console.log(
    JSON.stringify({
      installed: "Mastra core 1.80.0",
      toolCalls,
      modelCalls,
      completed: true,
      hostedInference: false,
      learningEvaluated: false,
    }),
  );
} finally {
  server.close();
}
