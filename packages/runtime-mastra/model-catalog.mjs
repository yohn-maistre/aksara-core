// Codex device-OAuth catalog contract; not the separate SIWC token-sharing API.
// Protocol shape studied in openai/codex 23934d31, endpoint/models.rs and ModelInfo.
const MODEL_ID = /^[a-zA-Z0-9_.:/-]{1,100}$/;
export async function fetchCodexModels(credential, fetchImpl = fetch) {
  const response = await fetchImpl(
    "https://chatgpt.com/backend-api/codex/models?client_version=0.162.1",
    {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: {
        authorization: `Bearer ${credential.access}`,
        "ChatGPT-Account-ID": credential.accountId,
        accept: "application/json",
        "User-Agent": "Aksara/0.2",
      },
    },
  );
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error("Model catalog unavailable");
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > 1048576) throw new Error("Model catalog exceeded its budget");
    chunks.push(Buffer.from(chunk));
  }
  const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!Array.isArray(data.models)) throw new Error("Invalid model catalog");
  const seen = new Set();
  const models = data.models.slice(0, 250).flatMap((m) => {
    if (
      !m ||
      m.visibility !== "list" ||
      typeof m.slug !== "string" ||
      !MODEL_ID.test(m.slug) ||
      seen.has(m.slug)
    )
      return [];
    seen.add(m.slug);
    const modalities = Array.isArray(m.input_modalities)
      ? m.input_modalities.filter((v) => ["text", "image"].includes(v))
      : ["text"];
    if (!modalities.includes("text")) return [];
    // Catalog instructions, approval policies, tools and remote URLs are never
    // imported. These fields describe a choice; they do not grant capabilities.
    return [
      {
        id: m.slug,
        name:
          typeof m.display_name === "string"
            ? m.display_name.slice(0, 120)
            : m.slug,
        input_modalities: modalities,
        ...(Number.isSafeInteger(m.context_window) && m.context_window > 0
          ? { context_window: Math.min(m.context_window, 10000000) }
          : {}),
        reasoning_efforts: Array.isArray(m.supported_reasoning_levels)
          ? m.supported_reasoning_levels
              .map((v) => v?.effort)
              .filter((v) =>
                ["none", "minimal", "low", "medium", "high", "xhigh"].includes(
                  v,
                ),
              )
          : [],
        verified_here: false,
      },
    ];
  });
  if (!models.length) throw new Error("No displayable text models in catalog");
  return models;
}
