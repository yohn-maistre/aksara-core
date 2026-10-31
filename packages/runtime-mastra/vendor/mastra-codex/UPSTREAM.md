# Mastra Code focused provider port

Source: https://github.com/mastra-ai/mastra/tree/c6a8570543f716d8a0edd70001abd0b89d365a74/mastracode/sdk/src

Apache-2.0. Upstream files: auth/providers/openai-codex.ts and providers/openai-codex.ts.
SHA-256: auth 6689af3d74f65a2128124e3453b172690d632af67f5defbd9511b048a0fe4ec1; provider fa6a111f3a397b6ec6c7433cdacae56de3b473a2d3d6fd5e90dff581d01ff0f9.

Only device authorization/refresh and the OAuth Responses transport/SSE aggregation are retained. Browser callback servers, Stagehand integration, global AuthStorage, other providers, environment credentials, arbitrary base URLs and test-key fallback are removed. Aksara supplies an explicit per-custody credential port and its own Agent instructions. Non-streaming Mastra turns use the donor's SSE aggregation path, with required completion and a 1 MiB bound. Redirects are rejected. The full Code SDK would also install unrelated databases, embedding/browser backends and provider runtimes; this port keeps the phone host small. Node24 JavaScript output is generated from the pinned TypeScript using TypeScript5.9.3 and reviewed.

31 October resident update: the required Codex instructions now permit only the
host-provided tools instead of asserting that every turn has no tools. The host
still controls discovery, scope, consent and effects. No donor implicit tools or
account authority is enabled.

31 October voice update: the required Codex API instruction envelope imports the
same Aksara voice as the main Mastra prompt. Provider selection does not introduce
a separate personality; consent and tool limits remain supplied by the host.
