# Aksara ↔ ETNOS integration handoff

3 November 2026. Notes for the agents working on ETNOS deployment, Strata and
Honai. No change to those repositories or production services was made here.

## Owners and current state

| Component | Owns |
| --- | --- |
| Aksara | Interactive/private/institutional conversations; protected Library and reviewed memory; task execution; approvals; computer and device access |
| Strata | Independent community membership, public/shared conversation, Wiki review, agent participation mandates and public delivery |
| Honai | User interface to the selected community engine; it must remain usable without an LLM |
| MCP / optional agentgateway | Protocol transport and discovery; neither creates membership, a source grant or an execution mandate |

Repository discovery found a 31 October commit on Strata main and a 20 August
commit on Honai Metro main. No accessible exact repository named Honai Connected
was found. Those dates describe the inspected default branches, not unpublished
work in another agent's workspace. Strata's current API implementation was read;
there is no MCP endpoint in that inspected tree. Older Honai documents describe
an earlier Aksara runtime and must not override current Aksara code or decisions.
Private repository implementation/architecture text is not copied into this note.

## What Aksara actually exposes

- Native local Rust/SQLite authority and Node workbench. Personal custody and an
  institutional private thread use separate databases. The local development
  identity chooser is not production enrollment.
- One actual Mastra durable agent owner, a finite task worker, checkpoint recovery
  with execution epochs and a conservative tool journal. Work/results remain
  bound to their originating current context and source dependencies.
- A read-only Mastra MCP **stdio** server at `packages/gateway/mcp.mjs`. It exposes
  eligible Library, work, knowledge/procedure projections and bundled Pack metadata.
  Every read returns to current Rust authorization; a previous listing is no grant.
  Explicit individual `AKSARA_URL`, `AKSARA_TOKEN`, `AKSARA_LANE` configuration is
  required. Never forward a steward's credential as another member's identity.
- Installed `@mastra/mcp` 2.6.0 includes an actual `MCPClient`. Existing conformance
  uses real Mastra clients/stdio against Rust hosts, including privacy and withdrawal.
  Current Aksara server revision is MCP 2026-07-28. A new client integration must
  negotiate/pin the peer's actual supported revision and test legacy behavior.
- The optional agentgateway profile currently relays local inference only. It is
  not remote MCP enrollment, a connector marketplace or a general publishing bridge.

See [gateway ports](../../packages/gateway/README.md) and
[durable harness](../platform/architecture.md).

## Smallest useful integration

Use Strata's engine contract, not Honai DOM scraping. Begin with authenticated,
read-only capabilities/discovery, eligible community metadata, bounded feed/search
and access-checked public/shared records. Strata can expose these as MCP resources
or explicit read tools; a thin API-to-MCP adapter is also viable. Keep its HTTP/API
semantics authoritative rather than implementing another ACL database in the adapter.

On Aksara's side, use Mastra's existing MCPClient behind a small host-owned port:

1. Fixed configured peer/transport; explicit per-subject credentials; exact allowed
   origins/hosts; no ambient browser-cookie, owner-token or environment fallback.
2. Fresh host context before and after each await, plus the peer's own current
   authorization. Do not pool a client/toolset across different people or audiences.
3. Bounded discovery/results/timeouts and explicit capability allowlists. Peer tool
   descriptions, annotations, prompts and returned content are untrusted input.
   A readOnlyHint is not sufficient authority to execute a tool.
4. Preserve peer resource identity, revision/digest, retrieval time and provenance.
   Admission into a conversation/Library/memory needs an explicit supported policy;
   a copied remote result must not silently outlive revoked access or withdrawal.
5. Disconnect/revoke cleanly; distinguish an unavailable server from an empty result.
   Never put raw credentials or MCP client closures into durable agent snapshots.

MCP resources can support a first read-only test without enabling agent-to-agent
execution, global memory sharing or publishing. Do not auto-install every discovered
tool into the main agent. Protocol compatibility is not application authorization.

## Outward changes are a later, separate slice

Aksara private/institutional memory is not Strata's shared Wiki or public commons.
A public post/Wiki proposal requires an actual reviewed projection/release, an
identified receiving actor and the receiving engine's membership/mandate rules.
An agent posting mandate does not grant Wiki approval, source custody or device
access. No Aksara SharingGrant evaluator or live Strata publication is claimed here.

For the first write qualification, bind exact reviewed arguments/digest and a
stable operation identity, commit intent, then deliver once. Treat an interrupted
remote outcome as uncertain; reconcile rather than retrying blindly. Receiving-side
idempotency, result receipts and correction/withdrawal need tests on both systems.
A human review screen or source-schema field alone does not implement those rights.

Test the joint using synthetic nodes: two subjects, public/private/hidden
communities, removal during an in-flight read, revoked memory/source, malformed
peer output, wrong-origin redirects and uncertain writes. Preserve independent
operation without either Aksara or Honai. No live accounts or real public posts
are needed for that qualification.

## Composio and client shells

MCP itself needs no Composio service. Use direct, scoped Mastra client connections
for our own Strata/ETNOS endpoints. A connection broker can be an optional adapter
for third-party SaaS OAuth if needed; it must not become the source of community
rights or a mandatory self-hosting dependency. Do not assume an open SDK proves
a complete self-hosted broker backend is available.

The selected near-term client direction is shared React web UI, Tauri 2 desktop,
and an initial Tauri 2 Android client feasibility pass. Keeping one shell is
attractive; Capacitor is a fallback if mobile plugins/lifecycle prove simpler there.
The current desktop launcher/tray and Node sidecar are not an Android runtime.
Android initially needs an enrolled connection to an available office/server host;
CORS removal or the desktop localhost development chooser is not remote enrollment.
Expo remains an option if substantial native mobile screens, capture, push or
background work justify its additional app/tooling. Expo DOM components can reuse
web UI, but this still adds another runtime and packaging surface; no rewrite now.

BoardUI (https://www.boardui.com/) is recorded as a later component-library
candidate only. It has not been audited, installed or adopted into the design system.

## Helpful Aksara files

- `packages/workbench/server.mjs`: browser session/context fences and live agent admission.
- `packages/runtime-mastra/{index,resident,tools}.mjs`: durable loop and host-controlled tools.
- `packages/gateway/{mcp,read-port}.mjs`: existing authorized resource server.
- `packages/contracts/channels.mjs`: channel boundary (inspect actual exports before reuse).
- `docs/platform/component-coverage.csv`: implementation versus promotion gates.
- `docs/platform/desktop-installation.md`: package, state directory and host lifecycle.

These notes define seams, not a claim that a live ETNOS MCP integration is already
connected. No peer deployment, DNS, public actor origin or credential was changed.
