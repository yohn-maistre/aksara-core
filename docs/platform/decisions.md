# Current decisions

These describe implemented boundaries. The [coverage map](component-coverage.csv) records remaining gates.

| Area | Decision |
| --- | --- |
| Authority | Rust and SQLite own identity, audience, work revisions, source custody, approvals and receipts. |
| Agent | One Mastra durable harness for interactive and background work; no nested Hermes/Pi agent loop. The earlier Pi adapter remains covered by regressions. |
| Memory | Embedded pinned LongMemory is the default derived recall engine. Canonical records and current eligibility remain in Rust. No new daemon or mandatory model download. |
| Custody | Personal data uses a separate database. A private institutional thread is distinct from personal custody. |
| Sources | Preserve original bytes. Derived documents, knowledge, graphs and indexes remain source-linked and rebuildable. |
| Hosted models | Explicit provider connection and turn consent; selected sources only. No automatic paid fallback or silent memory upload. |
| Effects | Exact scoped approval precedes consequential effects. Local effects and receipts commit atomically. External intents precede delivery; uncertainty requires reconciliation. |
| UI | Industrial workbench with graphite/copper and warm light themes, Twenty controls, compact conversation and a persistent private side pane. |
| Artifacts | BlockNote rich documents, Excalidraw vector drawings, Univer CSV worktrees and saved source tables. Shared revisions with conflict detection, not live CRDT collaboration. |
| Packaging | Local Node/Rust host, optional Tauri 2 Windows shell and phone PWA. No required Docker or fleet-management agent. |
| Distribution | Apache-2.0 core, with donor obligations retained. BlockNote core is MPL-2.0; XL exporters are excluded pending a license decision. |
| External services | MCP is read-only and locally authorized. Live channel accounts, public federation and shared isolated computers need separate integration work. |

Internal research and historical design studies are maintained separately from the public implementation documentation. Moving current files does not erase their older public Git history.
