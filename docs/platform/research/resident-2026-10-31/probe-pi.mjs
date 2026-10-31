// Research-only mechanical probe of the installed donor. No hosted model,
// credentials, external tools or product data. Scripted responses prove APIs,
// not reasoning quality, institutional integration or successful learning.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { BACKGROUND_CONTEXT as ctx } from "@earendil-works/chord/context";
import { Type } from "@earendil-works/pi-ai";
import { createModels } from "@earendil-works/pi-ai/models";
import {
  fauxProvider,
  fauxAssistantMessage,
  fauxToolCall,
} from "@earendil-works/pi-ai/providers/faux";
import {
  Harness,
  createRegistry,
  defineExtension,
  defineTool,
} from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";
const dir = await mkdtemp(path.join(tmpdir(), "aksara-pi-probe-"));
const faux = fauxProvider(),
  models = createModels(),
  registry = createRegistry();
models.setProvider(faux.provider);
let calls = 0;
registry.install(
  defineExtension({
    name: "research",
    tools: [
      defineTool({
        name: "add",
        description: "Add two numbers",
        parameters: Type.Object({ a: Type.Number(), b: Type.Number() }),
        replay: "safe",
        execute: async ({ a, b }) => {
          calls++;
          return { content: [{ type: "text", text: String(a + b) }] };
        },
      }),
    ],
  }),
);
faux.setResponses([
  fauxAssistantMessage(fauxToolCall("add", { a: 17, b: 25 }, { id: "sum" }), {
    stopReason: "toolUse",
  }),
  fauxAssistantMessage("The result is 42."),
]);
let harness;
try {
  harness = await Harness.open(
    await openNodeSqliteStorage(path.join(dir, "state.sqlite")),
    { models, registry },
    ctx,
  );
  let root = await harness.root(ctx, {
    agent: {
      model: { provider: faux.provider.id, modelId: faux.getModel().id },
    },
  });
  const first = await root.submit(
    {
      type: "input",
      content: "Add 17 and 25 using the tool.",
      requestId: "task-1",
    },
    ctx,
  );
  assert.equal((await first.wait(ctx)).status, "done");
  assert.equal(calls, 1);
  assert.equal(faux.state.callCount, 2);
  const originalId = first.id;
  await harness.close(ctx);
  harness = await Harness.open(
    await openNodeSqliteStorage(path.join(dir, "state.sqlite")),
    { models, registry },
    ctx,
  );
  root = await harness.root(ctx);
  const duplicate = await root.submit(
    {
      type: "input",
      content: "Add 17 and 25 using the tool.",
      requestId: "task-1",
    },
    ctx,
  );
  assert.equal(duplicate.id, originalId);
  assert.equal((await duplicate.wait(ctx)).status, "done");
  assert.equal(calls, 1);
  assert.equal(faux.state.callCount, 2);
  console.log(
    JSON.stringify({
      installed: "pi-durable 1.0.2",
      toolCalls: calls,
      modelCalls: faux.state.callCount,
      completed: true,
      sameRequestAfterReopen: "same submission; no model/tool reinvocation",
      hostedInference: false,
      learningEvaluated: false,
    }),
  );
} finally {
  await harness?.close(ctx);
  await rm(dir, { recursive: true, force: true });
}
