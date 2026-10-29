# Current implementation decisions

Accepted direction implemented from the v2.5.5 review, 29 October 2026.

| Decision                                                     | Implementation / qualification                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Rust stays authoritative; evolve the existing alpha          | Schema 3 and new APIs; original effect, lineage and Pi regressions retained                                               |
| One current product monorepo                                 | Core, first-party PWA, broker and adapters change together; independent social/hardware release boundaries retained       |
| React/PWA first; OpenDuet presentation                       | MIT shell/card/orb/motion code and tokens reused; phone-width Today/Ask; no required Intelligence account                                                     |
| Mastra qualification, Pi preservation                        | Actual bounded Mastra model turn works; Pi durable retrieval remains tested; Mastra durable tool/recovery gate still open |
| Actual-read dependencies, eligibility before context         | Frozen input digest, conservative read union, source withdrawal tests across reply/follow-up                              |
| Canonical work/messages outlive vendor cache                 | Rust persistence; at-most-one automatic provider invocation per claimed run; no automatic crash replay                    |
| Personal custody differs from a private institutional thread | Separate one-person databases; explicit host/context switching                                                            |
| Offline host differs from disconnected client                | Local host/model path works; shell-only PWA cache; no disconnected intent queue                                           |
| Reviewed effects and public release are distinct             | Exact alpha approvals preserved; real SharingGrant/custodian policy and Ruara publication not enabled                     |
| Donor study and license obligations precede reuse            | Pinned ledger, MIT source license, no Noncommercial Nightly code copied                                                   |
| All domain tracks remain visible                             | Coverage CSV retains all 28 review tracks and their next gates                                                            |

Deferred without creating new authorities: graph/OM memory engines, Duroxide, Cedar/Wasmtime, generic computer execution, LAN pairing, production installer, native Expo/desktop wrappers, biological/physical actuation and public federation. Deferral is not removal from the product vision. Contracts and promotion evidence must precede enabling those capabilities.
