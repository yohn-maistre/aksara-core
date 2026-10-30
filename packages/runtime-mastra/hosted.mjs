// Fixed provider destinations; credentials are scoped by the trusted workbench.
// Provider free tiers are account entitlements, never guaranteed by model names.
export const HOSTED_PROVIDERS = Object.freeze({
  gemini: {
    name: "Google AI Studio",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.5-flash"],
    url: "https://aistudio.google.com/apikey",
    notice:
      "Use a free-tier project. Billing and data-use terms follow your Google project; free-tier content may be used to improve products.",
  },
  groq: {
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile"],
    url: "https://console.groq.com/keys",
    notice:
      "Free-plan access and rate limits depend on your account. A key does not establish a free entitlement.",
  },
  "openrouter-free": {
    name: "OpenRouter free",
    baseURL: "https://openrouter.ai/api/v1",
    models: ["openrouter/free"],
    url: "https://openrouter.ai/settings/keys",
    notice:
      "Routes among free models. Providers, availability, rate limits and data terms can change. Paid models and plugins are disabled.",
  },
});
export function hostedConfig(provider, model) {
  if (!Object.hasOwn(HOSTED_PROVIDERS, provider)) return null;
  const entry = HOSTED_PROVIDERS[provider];
  if (!entry.models.includes(model))
    throw new Error(
      "Choose an advertised provider model. No paid fallback is enabled.",
    );
  return { name: provider, baseURL: entry.baseURL };
}
export function providerFailure(error, signal) {
  if (signal?.aborted)
    return "Model turn interrupted or timed out. No action was performed.";
  // Never include provider body/message: it can echo private prompts or keys.
  const status = error?.statusCode ?? error?.status;
  if (status === 429)
    return "Provider rate or usage limit reached. Retry later or explicitly choose another connection.";
  if (status === 401 || status === 403)
    return "Provider sign-in or access was rejected. Check this connection in setup.";
  if (status === 404)
    return "The selected model is unavailable. Check the provider's current model access.";
  if (status === 402)
    return "Provider credits or billing access are unavailable. No paid fallback was used.";
  return "Provider unavailable or turn interrupted. No action was performed.";
}
