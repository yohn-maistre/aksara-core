# Catalogue review and the first executable slice

The v1 architecture is coherent: institutional authority stays below cognition, every interaction carries a current actor and audience, original evidence survives derived indexes, and a runtime task never becomes an institutional principal. There is no reason to replace that foundation with an all-in-one agent framework.

This repository implements a bounded development slice. It is not the catalogue's complete P1 system, and tests here do not establish production security or physical hardware behavior. The full supplied document is preserved unchanged in `northstar-v1.md`; current sections 0–27 and the v1 decision/donor register take precedence over the repeated historical archives that follow. Historical alternatives are not simultaneous requirements.

## Decisions made concrete

| Catalogue boundary | Current implementation | Remaining boundary |
| --- | --- | --- |
| Institutional authority | Rust kernel owns principal, lane, purpose, WorkObject and effect records | Cedar, richer membership/role administration, policy migrations |
| Identity ingress | Individual opaque dev tokens; unique provider/account/subject bindings; revocation rechecked | Provider-authenticated Hermes ingress and verified binding ceremonies |
| Eligibility before retrieval | Populate a temporary FTS5 corpus only with eligible source blocks before ranking | Hybrid/vector/graph retrieval must preserve the same eligible corpus boundary |
| Library separate from memory | Raw UTF-8 evidence, stable blocks, transitive source lineage and explicit source-excerpt candidates | Rich formats, hierarchy, wiki, concept pages and temporal projections |
| Resident durability | Actual Pi Durable 1.0.2 task/checkpoint storage, actor/lane scoped, SQLite FULL | Model streams, tool streams, child tasks, fork mappings and runtime migration |
| Workflow durability | SQLite institutional state machine and effect intents | Study/adapt Duroxide; no second resident task authority |
| Governed effects | Exact proposal, Operator approval, fenced HMAC lease, verified receipt | Production signed/attenuable leases, Cedar and isolated execution hosts |
| Workbench | Small responsive test client for the implemented paths | Reuse Dim0/canvas-harness view mechanics without importing their canonical runtime/store |
| Devices | Independent behavior simulator with four profiles and persisted controller state | Production renderer shared with firmware, MCU transport and actual hardware validation |

## Improvements to the northstar's implementation plan

1. **Scope the exactly-once claim.** The local SQLite artifact, receipt, ledger and outbox commit together. A remote call cannot share that transaction. Commit its intent first, then record a destination receipt; a lost reply or host crash leaves an unknown outcome. Never blindly retry a non-deduplicated remote effect. Reconciliation may record an effect after cancellation, but it must not resurrect cancelled or revised work.
2. **Bind exact authority, not a broad approval.** An approved lease covers effect ID, canonical argument hash, actor, institution (through the bound actor/lane/work identities), lane revision, purpose, work revision/generation, policy epoch and expiry. Changing an argument, audience, principal or work revision fences it. Device proposals also bind the observed controller generation, so human stop followed by release cannot revive an old command.
3. **Keep a practical phone floor.** Rust + bundled SQLite + Python simulator + plain browser client run without a model, graph service, VM or media server. Pi is an optional Node process. Rich rendering and speech can be added independently once their memory/latency costs are measured.
4. **Preserve evidence atomically.** Sources up to 1 MiB are BLOBs in the same SQLite transaction as metadata, blocks and ledger events. This avoids a filesystem/database dual-write gap. Before large files or rich formats are added, use staged content-addressed files with explicit recovery rather than pretending two writes are atomic.
5. **Version derived projections.** `text-v1` chunks preserve original UTF-8 bytes; block identity binds artifact ID, parser version, ordinal and text digest. Index rebuild keeps IDs stable. Future parsers must introduce explicit versions and citation migrations.
6. **Adopt donor behavior at named seams.** Pi is a dependency, not a replacement authority. Muse's production-renderer/host-stub separation is the simulator target. Vellum's lease generation and Hermes's transport/sender/thread distinctions inform interfaces. Later adapters require pinned source study and license accounting first.

## Development rules and practical limits

The host accepts only loopback connections and resolves context from its own database. Browser input cannot supply an AccessContext, institution, role or actor. The direct Rust `Kernel` API is intended for a trusted host process, not an untrusted plugin ABI. Plugins require the future governed host/WIT boundary.

Private source eligibility requires both ownership and a lane audience containing only that owner. Institution sources require the same institution and purpose. Historical work carries an audience snapshot; expanding a lane does not expose that work. Events carry lane revision and contain IDs/kinds rather than raw evidence. The ledger is hash-linked but unkeyed and not externally anchored; an OS-level attacker can rewrite it and the database together.

The current policy is fixed Rust logic. HMAC leases use one local shared secret in SQLite. These are explicit development substitutions for Cedar and production lease designs. No unrestricted shell, browser, file-write or cloud tool is exposed. The sole network effect is a fixed loopback simulator command. Operator approval does not widen restricted source scope. Declared source lineage remains attached to derived artifacts: withdrawal makes their transitive descendants and dependent memory ineligible before ranking, and effect views redact now-ineligible source content while preserving real receipts. This does not infer undeclared citations or classify pasted sensitive text.

Memory candidates must be exact cited excerpts, with explicit kind, retention, purpose and visibility, and become retrievable only after review. The `source_fact` label is declared, not independently fact-checked: this baseline does not implement semantic secret/hearsay classification. Operator cannot read or approve another person's private lane merely by being Operator. A reviewed sharing/release ceremony is still needed for that case.

Limits: 1 MiB per source/effect argument body, 64 MiB aggregate original source bytes (withdrawn sources still count), 256 MiB main database, 16 KiB ordinary request text, 20,000 eligible blocks per query, 50 search results, 5,000 WorkObjects, 100 proposals per work, 10,000 memory candidates, and 1,000 distinct lineage nodes per derived artifact (including itself). The first UI lists 100 latest work items; full work pagination is pending. State stores retain evidence and receipts; there is no automatic deletion or archival policy yet. The SQLite limit excludes temporary indexes, WAL and Pi/simulator stores. Stop before disk exhaustion and measure those stores separately.

Backups copy state, authority and the lease secret. Protect snapshots as private institutional data. The CLI requires the host to stop because it enforces exclusive database ownership; the library's SQLite backup API can also run under the live host's authority lock. Recovery currently means restart on the same schema or restore a schema-2 snapshot. Schema-1 snapshots migrate transactionally to schema 2, backfilling source lineage from committed effect/receipt records. Stop old hosts before upgrading. Future schemas fail closed.

The controller simulator persists stop/privacy independently of `aksarad`, but both processes still share the phone's OS and power. Capture, pairing and OTA operations in its SDK are behavioral fixtures; no real audio, device identity proof or update signature verification occurs. It cannot validate radio performance, e-paper refresh, power draw, battery behavior or MCU isolation. Host wall-clock expiry is sufficient for this lab; physical firmware needs a tested time/lease model.

## Evidence and next milestones

See `verification.md` for measured tests and architecture. The crash harness covers local commit boundaries, destination ambiguity, cancellation/reconciliation and Pi task checkpoints. It does not cover model-stream interruption, arbitrary external tools or hardware faults.

Next milestones remain donor-led: Cedar policy parity against the existing adversarial fixtures; Duroxide workflow recovery; Hermes verified ingress and transport receipt mapping; governed tools via WIT; Dim0/canvas-harness views; Library hierarchy/wiki/document adapters; production-shared device rendering; then voice and real hardware. Each milestone needs its own measurable conformance gate. A12 capability and latency measurements should determine which sidecars stay resident.
