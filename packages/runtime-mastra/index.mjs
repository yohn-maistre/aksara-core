import { FREE_MODELS, CODEX_MODELS } from "./catalogue.mjs";
export { FREE_MODELS } from "./catalogue.mjs";
export function localEndpoint() {
  const port = Number(process.env.AKSARA_LOCAL_MODEL_PORT || 11434);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("Invalid local model port");
  return `http://127.0.0.1:${port}`;
}
export function modelConfig(provider, model) {
  if (typeof model !== "string" || !/^[a-zA-Z0-9_.:/-]{1,100}$/.test(model))
    throw new Error("Invalid model ID");
  if (provider === "codex-chatgpt" && CODEX_MODELS.includes(model))
    return { name: "codex-chatgpt", transport: "mastra-codex-oauth" };
  if (provider === "local")
    return {
      name: "aksara-local",
      baseURL: localEndpoint() + "/v1",
      apiKey: "local",
    };
  if (provider === "opencode-free" && FREE_MODELS.includes(model))
    return {
      name: "opencode-free",
      baseURL: "https://opencode.ai/zen/v1",
      apiKey: "public",
    };
  throw new Error(
    "Choose a supported local or experimental free model. Paid fallback is disabled.",
  );
}
export const INSTRUCTIONS = `You are Aksara, a thoughtful collaborator in a workspace. Reply plainly and helpfully. You have no tools, computer or hidden memory access in this adapter. Use only the supplied conversation and explicitly supplied source excerpts. Do not claim actions or reading unseen resources. Your response is a draft.
If useful, include a small fenced openui block containing exactly one literal expression:
root = EvidenceCard("Title", "Plain text body")
root = MetricCard("Label", "Value", "Qualification")
Read-only resource components are also registered: WorkList(title, [work IDs]), SourceList(title, [source IDs]), DocumentPreview(title, [one source ID]), ProgressStatus(title, [work IDs]). Use these only with IDs explicitly present in the supplied eligible context; never invent IDs. The current host resolves their data for display and can refuse it. Rendered data is not automatically available to you. Unknown work duration has no percentage.
All arguments must be JSON literals. No Query, Mutation, HTML, URL, imports, nested expressions or action callbacks. Generated UI cannot approve or execute effects, change an audience, or grant access. Do not put private information into generated UI beyond this turn's supplied context.`;

/** Actual Mastra Agent, one bounded provider turn. Rust owns the conversation and run fence.
 * No vendor persistence/automatic crash replay: retry requires a new explicit user turn.
 */
export async function generateReply({
  provider,
  model,
  messages,
  signal,
  fetchImpl,
  modelPort,
}) {
  const config = modelConfig(provider, model);
  const [{ Agent }, { noopLogger }, { createOpenAICompatible }] =
    await Promise.all([
      import("@mastra/core/agent"),
      import("@mastra/core/logger"),
      import("@ai-sdk/openai-compatible"),
    ]);
  const factory = modelPort
    ? null
    : createOpenAICompatible({
        ...config,
        fetch:
          fetchImpl ??
          ((url, options) => fetch(url, { ...options, redirect: "error" })),
      });
  const agent = new Agent({
    id: "aksara-conversation",
    name: "Aksara",
    instructions: INSTRUCTIONS,
    model: modelPort || factory.chatModel(model),
  });
  agent.__setLogger(noopLogger);
  const output = await agent.generate(messages, {
    abortSignal: signal,
    maxSteps: 1,
    maxRetries: 0,
    modelSettings: { maxOutputTokens: 2048 },
  });
  if (typeof output.text !== "string" || !output.text.trim())
    throw new Error("Provider returned no text");
  if (Buffer.byteLength(output.text) > 65536)
    throw new Error("Provider output exceeded the bound");
  return output.text;
}
