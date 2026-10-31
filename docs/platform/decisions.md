# Current implementation decisions

31 October reassessment: [resident-agent review](resident-agent-reassessment-2026-10-31.md)
and [delivery plan](resident-computer-device-plan-2026-10-31.md) propose reducing
the default architecture and enabling a full tool loop. They distinguish proposals,
mechanical probes and existing product behavior; no runtime migration follows
merely from adding a research candidate to the ledger.

Accepted direction implemented from the v2.5.5 review, 29 October 2026.

Presentation update: the fluid Octopus/shadcn/Cult workspace is implemented, with
an embedded Today composer and a scoped read-only resource-surface port. See the
[implementation checkpoint](fluid-workspace-implementation.md) and
[Mastra integration review](mastra-integration-review.md).

| Decision                                                     | Implementation / qualification                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Rust stays authoritative; evolve the existing alpha          | Schema 3 and new APIs; original effect, lineage and Pi regressions retained                                               |
| One current product monorepo                                 | Core, first-party PWA, broker and adapters change together; independent social/hardware release boundaries retained       |
| React/PWA first; fluid workspace direction                       | Implemented fluid workspace; core OpenDuet primitives retained where useful; no donor backend authority                                                     |
| Mastra qualification, Pi preservation                        | Actual bounded Mastra model turn works; Pi durable retrieval remains tested; Mastra durable tool/recovery gate still open |
| Actual-read dependencies, eligibility before context         | Frozen input digest, conservative read union, source withdrawal tests across reply/follow-up                              |
| Canonical work/messages outlive vendor cache                 | Rust persistence; at-most-one automatic provider invocation per claimed run; no automatic crash replay                    |
| Personal custody differs from a private institutional thread | Separate one-person databases; explicit host/context switching                                                            |
| Offline host differs from disconnected client                | Local host/model path works; shell-only PWA cache; no disconnected intent queue                                           |
| Reviewed effects and public release are distinct             | Exact alpha approvals preserved; real SharingGrant/custodian policy and Ruara publication not enabled                     |
| Donor study and license obligations precede reuse            | Pinned ledger, MIT source license, no Noncommercial Nightly code copied                                                   |
| All domain tracks remain visible                             | Coverage CSV retains all 28 review tracks and their next gates                                                            |

Deferred without creating new authorities: graph/OM memory engines, Duroxide, Cedar/Wasmtime, generic computer execution, LAN pairing, production installer, native Expo/desktop wrappers, biological/physical actuation and public federation. Deferral is not removal from the product vision. Contracts and promotion evidence must precede enabling those capabilities.

Gateway qualification uses official Mastra MCP/Docker providers. MCP is local,
read-only and currently serves protocol 2026-07-28. The computer observation port
requires an explicit host authority callback and validates actual isolation;
interactive command/persistent-workspace promotion remains blocked on durable
Rust intent and provenance/reconciliation gates. See `packages/gateway/README.md`.

30 October presentation checkpoint: the selected atmospheric Home/Library/thread
system is implemented. Home contracts within the current authorized context;
spine expansion is a presentation preference; scoped pinned replies are removed
when their canonical message becomes unavailable. See
[implementation and limits](atmospheric-workspace-implementation.md).

Latest 30 October refinement: expressive desktop/phone docks, scoped blob
conversation expansion, controlled Dynamic Island progress, a denser composer,
procedural local-time atmosphere and Material color roles are implemented.
See [current checkpoint](expressive-workspace-implementation.md). Existing
runtime promotion gates remain unchanged.

31 October increment: persistent navigation blob and origin-return, Auto day/night
roles, bounded composer popover, native-process CLI and Windows CI bundle,
explicit Gemini/Groq/OpenRouter keys through Mastra, byte-preserving Library file
APIs and lazy OSS Univer CSV worktrees. Channel ingress is a strict unconnected
port; generic tool/computer execution and production enrollment remain gated.
See [implementation and run instructions](windows-local.md).

31 October resident increment: actual bounded Mastra tools, recorded actual source
reads and private provisional procedures are implemented. Hosted selected sources
require explicit consent. [Implementation and qualifications](resident-agent-implementation.md).

Resident phase two: schema 4; responsive front agent and one finite background
worker; thread-bound working documents; revocation-aware memory/wiki/people
projection shared with MCP; explicit native private computer permits and durable
Vercel action journals. Real Linux GUI fixture passed. Shared desktop isolation,
live messaging accounts and Strata receiving-side release remain distinct gates.
