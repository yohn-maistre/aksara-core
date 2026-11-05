# Current implementation decisions

5 November design direction: the user selected Reading Room's light concept and
open-triangle mark, relaxed the star threshold, accepted MPL and asked us to
consider complete packages including BlockNote XL. The [source study](../design/orbit-and-workspace-building-blocks-2026-11-05.md)
recommends BlockNote with XL exporters, an optional React Flow canvas and existing
Univer/Mastra. XL's GPL/commercial distribution choice is not yet settled; no
license, product dependency or implemented behavior changes in this research pass.

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
| Mastra qualification, Pi preservation                        | Mastra durable agent with local checkpoints and fenced recovery; Pi retrieval remains tested |
| Actual-read dependencies, eligibility before context         | Frozen input digest, conservative read union, source withdrawal tests across reply/follow-up                              |
| Canonical work/messages outlive vendor cache                 | Rust persistence; fenced crash recovery; completed tool replay; uncertain outcomes stop                    |
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

Open workspace polish: private conversation is a peer surface alongside Library,
not a full-screen modal. Home contracts first, with one conversation entry after
its first reply. Navigation's left edge and icon column remain anchored while its
right side folds. The main plane is transparent; smaller objects carry material.
SunCalc solar height drives continuous sky color independently of binary text/
component theme. Approximate location is explicitly chosen; no GPS or automatic
weather egress. The optional weather broker is fixed-endpoint, bounded and
replaceable; the disconnected preview never contacts it.

Aksara's voice is one shared prompt module across Mastra provider routes and the
Codex API envelope: concise, warm, language-adaptive, willing to disagree, with
context-sensitive wit. Conversational style remains separate from host authority
and actual task status. [Voice and live evaluation cases](aksara-voice.md).

3 November checkpoint: [durable Mastra and compact workspace](resident-harness-implementation-2026-11-02.md).
One live Mastra workflow owner; no nested Pi/Mastra loop. Same-connection task
model choice, fresh execution epochs, private snapshot projection and conservative
tool uncertainty journal. First-run connection dialog and native-feeling phone
chat are implemented. Decision-model port is advisory only; no Jev deployment.

3 November packaging increment: [Tauri 2 desktop](desktop-installation.md) wraps
one local host without moving authority into native IPC. Bundle reachable backend
code instead of shipping frontend dependency sources; keep native SQLite outside
the JS bundle. Per-user installation and tray controls do not imply PC/fleet
management. The static preview stays disconnected pending explicit pairing or a
qualified remote host. Desktop build dependencies remain outside the kernel workspace.

## Reading Room implementation — 6 November 2026

The selected second concept is now the structural reference for the web/Tauri
client: labeled navigation, same-room conversation and a peer working document.
Home becomes a compact living brief, not a persistent third column. Warm paper
and lilac are the light defaults; graphite and copper are the implemented dark
proposal. Existing palette/Auto overrides remain. The new main plane has no
mandatory atmosphere shader, floating blob or expanding-window choreography.

BlockNote core/react/shadcn 0.57.0 (MPL-2.0) replaces plain-text document forms.
React Flow 12.10.1 (MIT) provides a saved Library-source table. Schema 5 adds
lane-bound working surfaces, optimistic revisions and idempotent immutable
snapshots. Current source eligibility is rechecked on listing, reading, saving
and snapshot creation. Drafts cannot discard prior source dependencies. Concurrent
stale writes preserve local unsaved text and reject server overwrite.

A draft is not an approved document. “Help here” freezes a source snapshot and
fills the same room’s composer; it does not send without the user. Review keeps
prepare, exact approval, execution and receipt boundaries. Work-result links use
actual receipts/run artifacts rather than the first available Library object.

No live CRDT transport, watches, transcription, remote channel delivery or
isolated shared computer is added. XL GPL/commercial distribution remains an
unanswered user choice; core MPL integration does not require relicensing Aksara.
[Implementation and verification](reading-room-implementation-2026-11-06.md).
