/** A build-time preview transport. The regular app always uses its real host. */
export const PREVIEW = import.meta.env.VITE_AKSARA_PREVIEW === "true";
const preview = PREVIEW ? import("./preview") : undefined;
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  if (preview) return (await preview).previewRequest(path, init);
  return fetch(path, init);
}
