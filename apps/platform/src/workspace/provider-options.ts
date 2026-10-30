import type { Data } from "./shared";
export const KEY_PROVIDERS = ["gemini", "groq", "openrouter-free"];
export const providerName = (id: string) =>
  ({
    local: "this computer",
    preview: "guided preview",
    "opencode-free": "OpenCode",
    "codex-chatgpt": "Codex / ChatGPT",
    gemini: "Google AI Studio",
    groq: "Groq",
    "openrouter-free": "OpenRouter free",
  })[id] || id;
export function modelsFor(providers: Data, id: string): Data[] {
  if (id === "preview")
    return [{ id: "guided-demo", name: "Guided UI demo · no model calls" }];
  if (id === "local") return providers.local?.models || [];
  if (id === "codex-chatgpt") return providers.codex?.models || [];
  if (id === "opencode-free")
    return (providers.opencode?.models || []).map((id: string) => ({ id }));
  return providers.hosted?.[id]?.models || [];
}
