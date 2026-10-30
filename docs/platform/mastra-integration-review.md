# Mastra integration review — 29 October 2026

Source inspected at `c6a8570543f716d8a0edd70001abd0b89d365a74`; the installed Core
remains 1.80.0. A package name alone does not establish compatible authority,
replay, licensing or phone resource use.

| Integration | What the upstream code actually supplies | Aksara decision |
| --- | --- | --- |
| Mastra Agent / AI SDK | Supported model objects and OpenAI-compatible transport | Used for local, keyless OpenCode and Codex subscription turns; one bounded turn, no ambient tools |
| Mastra Code Codex | Device/browser OAuth, refresh, Responses fetch and SSE adaptation in `mastracode/sdk/src/{auth/providers,providers}/openai-codex.ts` | Focused Apache port with explicit per-custody CredentialStore; standard Mastra Agent remains the caller |
| `@mastra/opencode` | Observational Memory plugin installed inside OpenCode, including transcript conversion, compaction and credential discovery | Not the free-model provider adapter. Its ungoverned transcript/observation store cannot replace canonical Aksara memory |
| Core durable Agent | Resumable streams and evented/Inngest workflow integration | Canonical run fences and receipts remain Rust-owned. Automatic recovery that may reissue a provider/effect call is not silently enabled |
| Pi durable | Separate installed Pi/Chord durable runtime | Preserved and tested as a runtime port; not represented as a Mastra built-in |
| `@mastra/docker` | Long-lived DockerSandbox, process/filesystem APIs, resource and Docker HostConfig controls | Qualified isolated observation/provisioning port; product command execution remains gated on reviewed durable intents; native object never exposed to a model |
| `@mastra/cloudflare-sandbox` | Workspace provider calling a deployed Cloudflare Sandbox Bridge | Reuse when a funded/enrolled bridge exists. Pages cannot host the Rust kernel or a container runtime; do not change account billing implicitly |
| `@mastra/mcp` | MCP client/server and tool/resource adapters | Implemented read-only stdio resource gateway with current-subject reads and real private/revoke protocol tests; remote/external effects remain gated |
| Mastra Code ACP | Agent Client Protocol adapter and conformance fixtures in the Code SDK | Study as a runtime transport; ACP session IDs do not establish Aksara rights |
| Pydantic / Monty | No native Monty/Pydantic integration found in the inspected current Mastra tree | Separate qualification target for bounded computation; not evidence that arbitrary Python or host processes are isolated |

The complete Code SDK is useful for coding-agent products but pulls unrelated
provider, database, embedding and browser packages. Ordinary Aksara conversation
uses only the qualified Core Agent and narrowly selected provider pieces. The
computer/tool phase should use official workspace/protocol providers where their
configuration and failure behavior satisfy Aksara's contracts.
