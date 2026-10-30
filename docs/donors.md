# Pinned donor ledger

Read code at a pinned revision before implementing its associated adapter. Clones used for this first study live outside the deliverable repository; no donor app has been bulk-vendored. This ledger records actual study and reuse rather than claiming that every catalogue reference has been audited.

## Studied now

| Donor / license | Pinned revision | Actual role in this slice |
| --- | --- | --- |
| [Pi](https://github.com/earendil-works/pi), MIT | `200387122ca450d6387f033949423114a270b96c` | Actual dependency: chord, pi-ai and pi-durable exactly 1.0.2; task definitions, scheduler, registry and SQLite used through upstream APIs |
| [Muse Gadget SDK](https://github.com/facebookincubator/muse-gadget-sdk), Apache-2.0 | `693cde9a884ad1edc87251b9f8944815f8de4809` | Simulator/firmware architecture and Linux transport study; no Muse service dependency or copied source |
| [Vellum Assistant](https://github.com/vellum-ai/vellum-assistant), MIT | `56dfa96fd56d5e0e153a380be2b3bd7a353f0523` | Current-turn identity, stale-observation fencing and reviewed memory architecture study; no imported guardian ontology |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent), MIT | `819cc3cbe02104c420ea32f1f1a924247d42eaf8` | Channel/session key semantics studied; provider adapters not implemented |
| [Dim0](https://github.com/vcmf/dim0), MIT | `bae17f5ec6eecefb3b157ebc13e5f30418c5fbf7` | Board op replay, persistence and view/layer boundaries studied; Workbench reuse pending |
| [canvas-harness](https://github.com/winlp4ever/canvas-harness), MIT | `b1d2dfe49330571c60cbee7ea65a2e9809848b6a` | Headless store and sync transport boundary studied; canvas integration pending |

**Pi files:** `packages/durable/src/tasks.ts`, `src/harness/harness.ts`, `src/harness/scheduler.ts`, `src/storage/sqlite/node.ts`, `src/storage/sqlite/database.ts`, `src/storage/sqlite/storage.ts`, package export/type declarations, and upstream task/storage examples. Verified against the installed npm API. Study found that the Node adapter defaults to SQLite `NORMAL`; Aksara opens the upstream database facade, sets `FULL`, binds its actor/lane scope, and hands it to upstream `SqliteStorage`. Aksara's task prepares a kernel proposal and never approves or executes it. Fault fixtures kill it after lookup and after proposal preparation, then resume from the same upstream store.

**Muse files:** `esp32/simulator/README.md`, `CMakeLists.txt`, simulator scenarios/tests, `linux/README.md`, `linux/src/musegadget/executor.py` and `link_client.py`. The official product name is **Muse Gadget SDK**, by Meta's Muse team. Its ESP32 simulator compiles the production LVGL UI/state/text/avatar renderer against host stubs, captures PPM frames with SDL's dummy driver, and checks deterministic repeated renders. It explicitly does not emulate silicon, audio, radio, power or memory pressure. Its Linux executor dispatches registered commands and bounds command time/output; Link carries capability registration, encrypted sessions and command results. Those transport and execution identities must not become Aksara authority. Do not import its `system.run` capability as ambient agent shell access. Aksara's Python simulator is an original ADP behavior prototype, not a fork of the Muse renderer or a Muse-compatible device. Production-shared rendering remains pending. Upstream headless CTest passed locally on x86-64 after adding `-DCMAKE_C_FLAGS=-D_DEFAULT_SOURCE`: GCC 14 otherwise rejects LVGL's `usleep` declaration under its POSIX 200809L flags. This is a local build workaround; no donor source was edited or vendored.

**Vellum files:** `assistant/docs/architecture/turn-actor.md`, `docs/trusted-contact-access.md`, `docs/architecture/memory.md`, and `assistant/src/desktop/desktop-automation-lease.ts`. Current acting actor differs from a resting transcript actor; ingress trust and binding live at the gateway. The computer lease is exclusive to actor/conversation, invalidates stale observations and generations, releases on cancellation/desktop loss, bounds actions and handles human help. Aksara generalizes those mechanics to institutional principals and WorkObjects. Memory's buffered concept-page substrate is a donor for future consolidation/UX, not an automatic path from every message into institutional memory.

**Hermes files:** `gateway/session.py` (`SessionSource`, `_canonical_participant`, `build_session_key`), gateway identity/scope instructions. Keys distinguish platform, account/workspace scope, chat, thread and participant; a deterministic session is not a principal. Receiving transport and runtime/delivery routing differ and must survive restart. Future ChannelGateway maps verified provider/account/subject to a kernel binding, carries the current sender and audience, and authorizes each incoming turn. No display-name binding or ambient owner fallback.

**Dim0/canvas-harness files:** Dim0 `webui/src/features/board/persist/local/board-persistence.ts`, `features/board/model/layer.ts`; canvas-harness `packages/core/src/store/store.ts`, `store/sync.ts`, package architecture and README. Dim0 replays persisted operations through the existing canvas engine rather than reimplementing semantics; snapshots and acknowledged operations compact atomically. Layer projection does not redefine whole-board persistence. canvas-harness requires causal delivery or adapter-owned CRDT behavior; its store and sync port are view mechanics, not an institutional event log. Reuse the engine for governed View/Surface projections rather than recreating a canvas stack.

## Pending studies before their adapters

The v1 donor table assigns narrow roles. The baseline raw-text/FTS5 Library implements canonical evidence primitives; it does not pretend to replace these richer donor components.

| Seam | Reference to study next | Boundary to preserve |
| --- | --- | --- |
| Policy | [Cedar](https://github.com/cedar-policy/cedar) | Kernel facts/context, fail-closed policies, no post-retrieval-only authorization |
| Institutional workflow | [Duroxide](https://github.com/microsoft/duroxide) | Institutional effects/receipts separate from Pi resident checkpoints |
| Library hierarchy | [OpenViking](https://github.com/volcengine/OpenViking) | L0/L1/L2 projections over Aksara source truth |
| Derived wiki | [OpenKB](https://github.com/VectifyAI/OpenKB) | Provenance and eligibility on every derived summary/concept |
| Long documents | [PageIndex](https://github.com/VectifyAI/PageIndex) | Specialist local index through LongDocumentIndexPort |
| Temporal graph | [Graphiti](https://github.com/getzep/graphiti) | Derived institutional relationships, no paragraph-adjacency authority |
| Extension management | [OpenClaw](https://github.com/openclaw/openclaw) | Static manifests, lazy activation, health/quarantine/doctor before execution |
| Computer isolation | [BoxLite](https://github.com/boxlite-ai/boxlite) | KVM-capable production host; PRoot is only a dev profile |
| Voice | [OpenLive](https://github.com/katipally/openlive), [HF speech-to-speech](https://github.com/huggingface/speech-to-speech), Pipecat | Bounded interaction/capture; cloud egress and authority explicit |

For a new adapter record revision, upstream license/NOTICE, exact files studied, what code is reused, what is replaced, hardware/resource costs and the conformance fixture. Check a copied file's own headers and transitive assets, not only a repository badge. Pin dependencies and preserve upstream notices in distributed artifacts.

## Platform foundation donor study — 29 October 2026

| Donor | Studied pin / license | Files and actual use |
| --- | --- | --- |
| OpenDuet | `60fd4c71d9d82e13739dce00827278154d13c947`, MIT | `openbot/app/src/components/duet/{morning-brief-card,kit,icons,build-in,mic-orb}.tsx`, `mic-orb-draw.ts`, `lib/{motion,reduced-motion}.ts`, `styles.css`, and `shell/{app-shell,header,tab-bar,menu-sheet}.tsx`. Actual card/icon/motion/orb implementation and tokens reused; shell geometry, header, floating tab capsule and menu adapted to Aksara navigation with Base UI dialogs. Upstream's phone-width layout is retained on Today and Ask, with wider secondary forms. Composer/Chat source studied for separate transcript scrolling and a docked composer; provider consent/source controls remain ours. Router/query hooks, CopilotKit/Intelligence/backend, upload, dictation and tool authority are not imported. License retained. |
| Mastra | `d42a194c29b6ce75787a86e3b3bfdf51d976d2f3`, Apache-2.0 outside separately licensed EE | `packages/core/src/agent/durable/{index,create-durable-agent,durable-agent}.ts`, durable approval/controller fixture and LibSQL store source; installed public Agent/model/logger types. Actual Core 1.80.0 conversational Agent dependency. No EE code or vendor authority imported. Durable stream cache is not canonical history; replay can reissue model/tool calls. No automatic recovery enabled in this adapter. |
| OpenUI | `1492107c8d24805a19651ad57420156f702bbda5`, MIT | `packages/react-lang/README.md`, component/library/Renderer source/API. Actual `@openuidev/react-lang` 1.0.2 dependency, two bounded text components. No generic Query/Mutation or arbitrary renderer/tool provider. |
| OpenCode | `506ac20c8086b4fb525fa1772a7e89273a95ff3c`, MIT | `packages/core/src/plugin/provider/opencode.ts` and `packages/ai/src/providers/opencode.ts`: public credential/free-model filtering, current SystemOne route; legacy Zen chat-completion compatibility tested independently. No source copied. Actual public-credential synthetic completion received 429 quota denial. Model hints do not establish entitlement. |
| Octopus SI OS | `b07d76a2ad4466377c7bb162a3418e13557409d1`, MIT | `docs/client.md`, `docs/UX.md`, `docs/contracts/EXTENSION_SURFACES.md`, architecture/scenarios. Living Home, compact widgets and client/runtime separation studied. No source copied; single-operator self-modification authority not imported. |
| Nightly Labs OpenBot | `da9108f1fcd195549b71465e4ca5d84fa601d09a`, PolyForm Noncommercial | `src/backend/agent/provider-models.ts`, provider architecture, mobile/desktop manifests. Interaction/stack/endpoint facts studied only. **No source copied.** Expo is a later native candidate, not a promise of trivial DOM-component portability. |
| Buzz | `a324b436cc536f507dffb6e6145082be20b6996c`, Apache-2.0 plus asset notices | Prior review of frontend/Cordis/Nostr boundary retained. No Buzz code copied yet; any composer reuse needs its own file-level attribution and authority adaptation. |
| Pocket TTS | `77c3d76b63d6cfe08c674b4f728db6774cf01df6`, MIT software | README, pyproject, `docs/CLI Commands/serve.md`, `tests/test_serve_default_voice.py`, installed 4.0.1 API. Optional separate local worker used through `/tts` form text only; no voice URL/cloning input. Real `english_2m_2026-10` CPU synthesis tested. Model terms are separate from code; no weights shipped. |
| Pamir Lapis One | Official vendor page, retrieved 28 October UTC | Appliance hardware/OS/KVM/SDK claims used as a product reference. No reusable licensed source established; no Pamir code or verified hardware claim. |

The new frontend intentionally starts from permissible OpenDuet components, with Aksara's own context, Library and review semantics. Donor account/session/thread/transport identities never establish Aksara rights. Dependency/source pins document this checkpoint rather than claiming every catalogue donor is fully audited.

## UI audit tooling — 29 October 2026

Taste Skill v2 / `design-taste-frontend` 2.1.5 is copied project-local from
[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), MIT, revision
`12af471f627f866411b4bd785b19646d3672784c`. `SKILL.md`, the full app-screen
reference, inspector/linter and CDP launch/profile cleanup code were studied.
The installed tree retains its MIT license and pin in `UPSTREAM.md`. No install
script was executed and it adds no product runtime dependency. The user's
explicit OpenDuet-fidelity direction overrides randomly dealt art direction
and three documented aesthetic checks. [Audit evidence](platform/ui-audit.md).

Inter Variable is self-hosted using exact npm dependency
`@fontsource-variable/inter@5.3.0`, OFL-1.1. The package CSS/font exports and
license were inspected; its original license is distributed with the static
site in `public/licenses/inter-OFL.txt`. No font CDN is contacted.

## Fluid workspace planning study — 29 October 2026

The user selected a new visual direction before implementation. No Octopus,
Cult component or Gooey runtime source has been imported into the product in
this pass. [Detailed reuse plan and findings](platform/fluid-workspace-plan.md).

| Donor | Pin / license | Studied source and intended reuse |
| --- | --- | --- |
| Octopus SI OS | `49ba24226981dcdaadf32ff124dd3dc3a303371f`, MIT | `app/package.json`, `docs/client.md`, `components/shell/{AppShell,HomeSurface,SurfacePage,WorkspacePaneManager,PanelResizeHandle}.tsx`, associated CSS, `NavigationRail.tsx`, Home/voice composition, `client-surfaces/{types,documentRegistry,homePresentation,useHomeSurfaceDocuments}.ts`. Source port candidate for continuing Home, panes and bounded surfaces; replace Electron/runtime/identity/command bindings. Closing-pane child retention must respect immediate scope invalidation. |
| Cult UI | `d71b1428b811c2779d46ea41b7ef8c9f9c9991c2`, MIT | Actual `apps/www/registry/default/ui/{expandable-screen,expandable,morph-surface,floating-panel,speech-bubble,halo-progress,collab-toolbar,ai-blob-warp}.tsx`, official markdown docs, agent guidance, MCP setup and registry. Component-by-component adaptation plan records focus/scroll handling, submit-success semantics, external avatar fallback and shader dependency. No product components installed. |
| shadcn/ui | CLI `4.23.0`, MIT; official Base Nova sidebar-08/sidebar registry snapshot retrieved 29 October | Six block files and sidebar primitives studied. `variant=inset` is already present; explicitly set `collapsible=icon` and `defaultOpen=false`. App configured for Base UI, Cult registry and existing aliases. Separate MCP process initialize/list/search succeeded through the project launcher. |
| Libraries.dev / Gooey | Repository `bad63221ebafa08d830586aa1721ecbd4ea02fcb`; `liquid-gooey@0.2.2`, MIT | Package manifest/LICENSE, public README, Gooey skill reference, `src/Gooey.tsx`, observer wake/settle/dispose loop and reduced-motion helpers. Small interaction enhancement candidate; silhouette filter keeps DOM content crisp. No runtime dependency installed, no Studio/Pro recipes or model assets copied, no A12 performance claim. |

The project-authored Cult skill copies/adapts the official agent guidance with
its upstream MIT license. `@paper-design/shaders-react` is a possible later
AI Blob dependency (current manifest 0.0.82, Apache-2.0); importing it later
requires the usual package notices and rendering-cost checks.

## Implemented fluid workspace and provider port — 29 October

- Octopus SI OS `49ba24226981dcdaadf32ff124dd3dc3a303371f` (MIT): actual
  `SurfacePage`, responsive container CSS, `PanelResizeHandle`, measured split
  limits. Copied source adapted for Aksara context panes. No retained closing
  private content or native runtime imports. `third_party/octopus/LICENSE`.
- shadcn CLI 4.23.0, `base-nova/sidebar-08` (MIT): SidebarProvider, inset/icon
  sidebar, Base UI sheet/tooltip and source primitives. Demo navigation/accounts
  replaced with current Aksara data. `third_party/shadcn/LICENSE`.
- Cult UI `d71b1428b811c2779d46ea41b7ef8c9f9c9991c2` (MIT): registry-installed
  Expandable, ExpandableScreen, HaloProgress and WizardExpandable. Base UI owns
  dialog semantics; motion is reduced where requested, progress is truthful,
  materials are flat, setup persistence/consent are host-owned. License retained
  in `third_party/cult-ui/LICENSE`.
- Mastra Code `c6a8570543f716d8a0edd70001abd0b89d365a74` (Apache-2.0 outside EE):
  focused device OAuth/refresh and Codex Responses/SSE provider port; source
  hashes and adaptations in `packages/runtime-mastra/vendor/mastra-codex/UPSTREAM.md`.
  Explicit scoped CredentialStore, no environment or global auth fallback, no
  full coding harness. `third_party/mastra-code/LICENSE`.
- OpenDots `8091324942b86789ed0da7facbee855145d933b0` and OpenMuse
  `a4944f4c471d3dc93b8bfc060b5da309b5216ab2` (MIT): computer store, supervisor,
  Docker identity/inspection/lease and takeover source studied for the next
  computer port. OpenDuet computer/runtime surfaces and Nightly provider/onboarding
  flow also studied; no Nightly Noncommercial source copied.

The old phone-shell entries document earlier checkpoints. The fluid workspace
replaces that shell while retaining permissible feature primitives and notices.

The gateway uses installed `@mastra/mcp` 2.6.0 and `@mastra/docker` 0.12.1,
Apache-2.0. Their actual server/resource handlers, Docker start/reconnect,
HostConfig controls and process API were studied at Mastra `c6a8570` before use.
The read-only MCP port is tested against real Rust hosts. The computer port is
qualified with an immutable, non-root, network-disabled test image; interactive
command dispatch/persistence is not enabled. No donor thread/account grants
replace current Aksara authorization.
