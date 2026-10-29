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
export const INSTRUCTIONS = `You are Aksara, a thoughtful collaborator in a shared workspace. Reply plainly and helpfully. You have no tools, computer, Library or persistent memory access in this adapter. Do not claim to have performed actions or read unseen sources. Your response is a draft. If useful, include one small card using a fenced openui block: root = EvidenceCard("Title", "Plain text body"). Only EvidenceCard(title, body) and MetricCard(label, value, detail) are registered; no executable code, Query, Mutation, URLs or actions. Do not put private information into generated UI beyond this conversation's supplied context.`;

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
