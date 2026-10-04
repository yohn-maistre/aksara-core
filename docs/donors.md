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
