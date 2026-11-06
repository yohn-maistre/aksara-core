# Architecture

Aksara is a local-first workspace with one durable agent harness and one authority layer.

## Runtime

The React client calls the Node workbench over an authenticated, scope-fenced session. Mastra runs interactive and background work, checkpoints progress, and delegates bounded tasks to a configured task model. Rust and SQLite own sources, identity, audience, work revisions, approvals and effect receipts. Restart recovery rechecks current authority; an uncertain external action requires reconciliation rather than an automatic retry.

The personal profile has a separate database from the community profile. A private institutional thread still belongs to that institution. The persistent private side pane uses a separate server-bound personal context for the same configured actor; opening it does not switch the underlying channel or share its selected sources. Production enrollment and identity federation are not implemented.

Home projects recent work from the currently authorized lanes in one custody store. It does not silently merge the personal database into community search. Shared Room and Workbench views use the same channel, sources and saved artifact revisions. They do not provide live simultaneous cursors.

## Memory

`packages/memory` embeds the Apache-2.0 LongMemory core at commit `8badf44d48d0d72a07e1ea3daf1ecbd76ae1a357`. It is the default derived recall engine, not a second canonical database. It runs without external inference, credentials or a graph daemon.

Each recall loads a current Rust-authorized partition, builds a disposable in-memory graph, and checks the partition again before returning cited original text. The current bounded projection includes up to 20 reviewed excerpts and 10 provisional wiki/people/procedure drafts. This is a useful initial recall layer, not a complete archival index. Graph heuristics are never promoted into reviewed facts.

Original bytes, reviewed excerpts, provisional procedures and their source dependencies persist in Rust SQLite. Withdrawal removes dependent material from eligible projections and invalidates derived results. Candidate memory approval is separate from ordinary draft saving. Public memory release is not enabled. The catalogue also evaluated Cognee and Hindsight; neither is a default dependency.

Local model tools can recall eligible memory under the current run's recorded source and memory dependencies. Hosted providers receive only explicitly selected, consented original sources; remembered sources can be selected in the composer. `memory_search` exposes read-only recall over the local Mastra MCP gateway with the same current Rust authority. There is no unauthenticated global memory endpoint or remote enrollment service.

## Artifacts

BlockNote provides rich documents under MPL-2.0. Excalidraw provides vector drawings under MIT; font assets ship locally. Aksara can save bounded declarative diagrams and bar charts through the existing artifact port. Diagram drafts can become editable drawings. No model-supplied HTML, scripts, embeds or remote image URLs execute in these visual artifacts.

Working surfaces use optimistic revisions and retain source dependencies. Immutable drawing snapshots preserve the exact scene JSON. An unreviewed draft is distinct from an approved effect. Univer handles CSV worktrees; PDF/Office conversion and BlockNote XL exporters are not bundled.

## Integrations and limits

Vercel agent-desktop controls an explicitly permitted private native window. It is not an operating-system sandbox. Shared isolated computers, live Telegram/WhatsApp/Slack/Discord adapters, production remote MCP enrollment and Strata publication remain unimplemented. The messaging contract is transport-neutral; no external account is connected by default.

Optional agentgateway relays local inference. The app does not manage every computer it runs on. Hardware behavior is currently simulated. Host-account access can read local data; at-rest encryption against that account is not provided.

See [component coverage](component-coverage.csv), [donor licenses](../donors.md), and [verification](verification.md).
