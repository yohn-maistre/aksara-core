# Persistent Aksara and a Docker-free Surface baseline

Review: 31 October 2026, Asia/Bangkok. Implementation inspected at
`3cfb948e5fa24f06b9f441349f5b14110a9fd7e3`.

This is a readiness assessment and proposed next increment, **not a claim that
the changes below have shipped**. The latest catalogue was used as architectural
context. Relevant owning sections were reconciled with source, tests and the
[28-track coverage ledger](component-coverage.csv); the private catalogue is not
redistributed here. No Windows machine was available for execution.

## Recommendation

Keep the current React PWA, Rust authority and bounded Mastra adapter. Make the
next usable target a native Windows x64 portable package for a Surface Pro 3
with 8 GB RAM, without mandatory Docker, WSL2, Electron, local inference or voice.
The exact Windows version and CPU capabilities must be detected before claiming
support. Windows packaging is still work to do; the current release is Linux.

Finish the small navigation/appearance/composer increment, then deliver one
complete local office workflow with files. Further decorative UI work should
not precede that workflow. Keep one product monorepo; existing protocol, SDK and
independent social/hardware release boundaries remain useful.

## What works now, and what does not

| Area | Evidence in the current implementation | Remaining boundary |
| --- | --- | --- |
| Local startup | Python supervisor starts four Rust authority hosts, Node workbench and independent Python simulator, without Docker | This is a multi-person development fixture, not a production installer or native Windows qualification |
| Onboarding | Space/model wizard, local discovery, OpenCode choice, scoped Codex sign-in path and canonical test turns | Real enrollment, Windows credential protection, download/recovery UX and account-specific model access |
| Models | Actual Mastra `Agent` for one bounded turn; local compatible endpoint; focused Codex OAuth/Responses port; OpenCode public-provider path | No general autonomous tool loop, durable Mastra subagent recovery or guaranteed free-provider availability |
| Library/files | UTF-8 original ingestion, eligible listing/search, text/Markdown document review, derived-source lineage and withdrawal | General binary upload/download, MIME-aware viewers, file revisions, editable Office worktrees and Univer |
| Memory | Separately reviewed source excerpts; frozen model inputs and transitive read dependencies | Approved memory is not silently injected by the conversational adapter; ontology, OM, summaries and automatic wiki remain separate qualification work |
| Gateway/packs | Real scoped read-only Mastra MCP resources and validated non-executable knowledge Pack screens | Executable tools/skills, ACP sessions, installation, remote enrollment and effectful MCP operations |
| Computers | Qualified isolated Docker observation/provisioning port and binding contracts | Product command dispatch, persistent private/shared computers, takeover, artifact transfer and Windows bridge |
| Devices/voice | Independent behavior simulator and reviewed device effects; opt-in local Pocket TTS read-aloud port | Physical transport/firmware parity, real hardware, voice input and measured Indonesian/phone voice quality |
| Hosting | Hosted browser-only interactive sample; local PWA reaches a real host | The Pages sample has no live Rust/model backend. Production LAN access, publication and fleet installation are pending |

Mastra is already in use. Its integrations are foundations to adapt, not new
authorities: Rust still checks identity, scope, source eligibility, work and
receipts. The Codex path includes a focused donor-derived provider adapter; it
does not import an entire coding harness or inherit ambient account credentials.

## Fresh checks

Executed on Linux x86-64 in this workspace on 30 October UTC:

- Node platform/adapter/contract/gateway suite: 26 passed, one real-Docker
  qualification intentionally skipped, zero failed.
- Pi runtime: three passed. Python Device SDK/simulator: nine passed.
- Real-host Chromium product suite: 20 checks passed. It uses an actual Mastra
  adapter against a synthetic local compatible model, not a hosted provider.
  It covers source ingest, reviewed document execution/receipt, memory review,
  withdrawal, model replies, scope switching, consent, simulator effects and PWA
  cache boundaries.
- A separate local startup returned HTTP 200 from all four authority health
  endpoints. One idle aggregate RSS sample was **134.5 MiB** for the supervisor,
  four Rust hosts, Node workbench and Python simulator. Browser, model runtime,
  TTS, document renderer and Office editor were excluded. This is not a Windows
  measurement, peak-memory result or Surface performance estimate.
- A synthetic OpenCode setup request was admitted through the real onboarding
  UI and ended in the canonical failed state. Consent reset after admission.
  No user files were selected and no Codex account sign-in was performed. The
  UI intentionally hides provider error bodies, so this attempt does **not**
  establish a specific quota, HTTP status or outage cause. Earlier recorded 429
  evidence remains historical. Do not promise keyless service on first run.

The onboarding test also exposes a small clarity issue: the earlier “waiting
for a canonical result” notice remains alongside the final failed result. Replace
it with one state-derived status. Add safe error categories such as unavailable,
quota, authentication, timeout and cancellation without exposing provider echoes
of private prompts. Never substitute a paid provider automatically.

No runtime source changed during this assessment. Existing CI remains the source
for the preceding Rust, native ARM64 and isolated-Docker qualifications; those
results are not relabeled as fresh Windows tests.

## Small UI increment

### One persistent assistant entry

- Put the blob near the top of the desktop navigation, available on every
  screen. Put expand/collapse near the profile/settings footer, with its own
  labeled control. Replace the sprout brand mark with a minimal open triangle.
- Keep the real Cult blob when supported. Reduced effects, loading, reduced
  motion and unavailable WebGL should show a quiet 2D/static **blob**, not a
  different logo. Stop animation when hidden.
- On phones, use Home, Library, the persistent blob, Channels and More. Packs,
  settings and other destinations can live in More; avoid squeezing six primary
  controls into a narrow dock.
- Route every entry through one assistant-opening action. Home's inline prompt
  and a contextual “open conversation” action must use the same lifecycle and
  closing direction as the navigation blob.

An overlay remembers its origin route and presentation state: scroll position,
selection/filter references and inspector mode. It must not retain a screenshot
or copied contents as a substitute for current authorization.

There is an architectural constraint behind the current return-to-Home bug:
the BFF session owns **one active context**. Same-context Library → private
overlay can retain an eligible underlay. Shared channel → private overlay changes
the host context and must clear the now-ineligible shared surface. Closing must
re-admit the original channel before rebuilding it. If access has gone, return
to an authorized destination with a brief explanation. Never blur or animate
restricted old content across that transition.

A future simultaneous private companion and shared workspace needs independently
authorized view sessions, not two React panes sharing one mutable context token.
That larger protocol change is not necessary to fix today's consistent overlay
return. Drafts likewise belong to their scope; do not restore them from a single
global field or put private drafts in browser local storage.

### One ambient clock, accessible appearance

The present atmosphere is procedural CSS; it is no longer a wallpaper asset.
Its hour changes hue/lightness, while the stored Light/Dark preference is still
independent. That is why simulating night does not currently select dark roles.

Use an appearance preference of **Auto / Light / Dark**. Auto resolves local
clock phases into contrast-tested light or dark semantic roles. The same ambient
context drives the smoke/sky field and the preview-hour slider. A preview hour
must never change security expiry, work timestamps, `Date.now()` or audit time.

Keep the gradient slowly fluid and the imagery abstract. Match Material
Expressive principles through hierarchy, palette roles and restrained motion;
do not add another component framework. Use paired foreground/surface roles
through dawn/day/dusk/night, rather than interpolating text and background into
low-contrast gray. Preserve override, reduced motion, reduced effects and a
non-translucent contrast fallback. Local-time phases require no location access;
real weather and astronomical sunrise need a separate optional source and clear
location consent. They are not inferred weather observations.

### Composer controls

Replace the oversized `details` menu with the existing Base UI popover/dialog
primitives: anchored bounded popover on desktop, bottom sheet on phones,
keyboard focus/Escape handling and viewport collision detection. Keep one plus
control and remove inherited disclosure pseudo-icons. Separate model/source
selection from a future upload queue.

The current composer references already-ingested Library sources; it is not a
general attachment uploader. A new upload control must show actual staged bytes,
accepted format/size, transfer state and errors. Filename chips alone must not
imply that content reached Library or a model.

## Native Windows package

The current `aksarad` CLI supports development initialization, serve, doctor,
Library rebuilding and backup. It is not yet an interactive chat CLI.
`scripts/package_release.py` only emits Linux musl archives and does not bundle
Node, Python or installed npm dependencies. Source availability is not equivalent
to a tested Windows portable release.

Proposed distribution:

1. A portable x64 ZIP containing a small `aksara` launcher, `aksarad.exe`, a
   pinned Node runtime, resolved production dependencies, prebuilt PWA and notices.
   No Rust toolchain or npm install should be required on the Surface.
2. Browser/PWA as the interface. Avoid an extra embedded Chromium instance for
   the first package. A desktop shell can follow a demonstrated OS-integration
   need; Electron/Tauri need not be prerequisites.
3. Replace the Python-only supervisor with a cross-platform supervisor. Keep the
   Python SDK/simulator as an optional worker; it need not be permanently resident
   for a person to use Library and chat.
4. Start only required custody hosts: personal use can need one authority host;
   community use can need the institutional host plus a separate personal host.
   Do not merge those databases to save memory. The four-host fixture remains
   valuable for development tests.

Proposed commands, **not shipped commands**: `aksara setup`, `start`, `chat`,
`doctor --json`, `stop`, `logs`, `backup`, and optional device-simulator commands.
The CLI and PWA must use the same authorized work APIs. Terminal chat is a client,
not another execution engine, database or automatic-approval path.

Store mutable state below the user's local application-data directory. Qualify
NTFS owner ACLs and Windows credential protection/DPAPI rather than assuming Unix
`chmod` protects files. Define credential export/recovery separately from database
backup. Production enrollment must replace the explicit development persona
chooser before this becomes a real multi-user office deployment.

Release gates: Windows/MSVC build and actual process execution; supported Windows
version; CPU features; paths with spaces and Unicode; owned process-tree shutdown;
port collision/restart; suspend/resume; ACL checks; backup/restore; upgrade and
rollback. Job Objects can help lifecycle/resource accounting but are not a code
sandbox. A Node heap limit is not an aggregate resident-memory limit.

Start Surface testing with hosted inference if the user's account has access,
while preserving local-only work. Install local inference and TTS explicitly and
separately. Qualify a small local model for useful results and latency before
recommending it; the earlier tiny-model connectivity run proves neither quality
nor acceptable speed on this device. Admit one heavy task at a time and unload
idle optional workers. Measure browser, renderer, model and host together.

WSL2 is optional, not the default recommendation. Microsoft's documented default
VM memory allocation is 50% of physical RAM. Its NAT versus mirrored localhost
behavior also matters when a Linux workbench talks to a Windows model runtime.
Those are avoidable complications for this initial Windows baseline.

## Files and Univer

Keep three distinct responsibilities:

1. **Library originals:** immutable binary bytes, MIME metadata, custody, hashes,
   bounded upload/download and eligibility. Preserve the existing text APIs.
2. **View/derive:** text, image and PDF viewers; separately budgeted parsing,
   OCR and retrieval projections. A renderer is not the original or a grant.
3. **Editable worktrees:** lazy Univer editor for supported Office content,
   pinned base revision, draft edits, verification/diff and explicit promotion
   to a new artifact version. Human editing need not approve every keystroke;
   agent proposals and release effects still have their own review rules.

Proposed interfaces are a binary `ArtifactVersion`, an authorized `FilePort`,
an `EditorPort` for open/save/diff/dispose and a separate `DocumentParserPort`.
Use existing Rust artifacts/work/receipts; do not introduce a second canonical
Library in a donor daemon. Bind every saved derivation to exact source versions
and current eligibility. Source withdrawal must clear dependent previews, open
editor data and retrieval results, including late worker responses.

Start with text/Markdown and CSV/native Univer sheet snapshots, then qualify
document editing and each desired Office round trip. Lazy-load one Office editor
and dispose it when no longer needed. Bound rows, cells, file bytes and parsing
time. Do not silently run macros, external data/formula fetches or arbitrary
document scripts.

Univer's core is Apache-2.0. Its Pro exchange/import-export, collaboration and
other advanced features have separate terms. Official Docs import/export examples
require an exchange backend; do not promise browser-only DOCX/XLSX fidelity.
Keep all selected Univer packages on the same exact version and record the
feature-level dependency/license matrix before importing code.

The actual `dream-num/univer-cli` source was studied at
`b96357c87be987e14c1771497c25d310d6084746`. Its local SQLite worktree, revision,
compare/merge and viewer patterns are useful. It also brings a daemon, per-file
runtime, native/Pro packages and headless browser rendering. Its README explicitly
says trusted-JavaScript `execute` is **not** a sandbox, and its application runtime
credential rotates every 90 days under separate terms. Do not transplant that
credential or assume the Apache repository license covers all bundled services.
Prefer the small OSS embed first; consider the official CLI as an optional
external adapter only after its dependency, resource and redistribution terms
are qualified. No Univer source/dependency was installed into the product in
this assessment.

## Node actions, agent computers and devices

Use separate ports for these different trust and resource requirements:

| Port | Intended role | Admission |
| --- | --- | --- |
| Local host | Rust authority, workbench and PWA | Trusted application; no arbitrary model command endpoint |
| Native Node bridge | Typed settings reads, selected-file operations, bounded previews and later desktop control | Explicit current grants, exact effect/review where required, fresh observation and receipts |
| Agent computer runtime | Persistent personal, institutional-private and shared-channel workspaces; untrusted code | Qualified isolation, separate credentials/storage/egress, controller generation, takeover and durable recovery |
| Device broker | Semantic SDK operations over qualified USB/BLE/IP transports | Current audience/purpose, device generation, interlocks, stop and verified receipts |

Absence of Docker must not enable an unrestricted host-shell fallback. A
native Windows bridge can be useful before a fully isolated agent computer is
available. `cua-driver` is a candidate with Windows capture/input support; its
driver/SDK are MIT by default, while the full Spaces stack has different terms
and optional perception extensions have additional licensing. This is a donor
candidate, not an implemented or Surface-qualified Aksara adapter. Study and pin
the actual Windows source before reuse. Desktop actions require a fresh capture,
human takeover/stop and exact current resource bindings.

Preserve the catalogue's three computer custodianships. Personal custody differs
from an institutional private thread, which differs from a channel's shared
workspace. A shared computer can have several eligible observers and one current
controller. Cookie stores and secrets do not follow a UI route change.

Local site previews should bind loopback and an exact artifact revision, with
untrusted HTML on a separate origin without authority cookies. Public publishing
needs a durable reviewed remote intent, confirmed outcome and reconciliation;
it is not merely opening a local server port. Windows file operations need
handle/root validation for junctions, reparse points, alternate streams and UNC
paths, not string-prefix path checks.

Keep hardware semantic: the model proposes a device operation, the broker
authorizes it, and the SDK/firmware returns the observation/receipt. Never turn
freeform device text into GPIO commands. The current simulator remains useful
on a Docker-free machine; it does not establish physical Muse/controller parity.

## Delivery order and acceptance

1. **Small UI closure:** persistent blob, correct overlay return, open-triangle
   brand, Auto appearance and bounded composer. Check desktop/360 px, keyboard,
   reduced motion, simulated day/night and shared-to-private return/revocation.
2. **Native package:** build/execute on Windows, portable launcher, diagnostics,
   scoped onboarding and local model fixture. No mandatory model, Docker or WSL.
3. **Complete file workflow:** real original → supported viewer/editor → verified
   revision → reviewed memory/retrieval → withdrawal removes dependent results.
4. **One bounded action workflow:** selected office document → local site preview,
   plus a reviewed simulated Presence update through the existing authority.
   Add remote publish only when its receiving system and reconciliation work.
5. **Qualified expansion:** durable Mastra tools/subagents, executable skills and
   computer bridge; then physical SDK transports, voice input, richer memory and
   community publication against their existing gates.

Two first office fixtures: a synthetic budget CSV with checked totals and a
reviewable agent edit; a synthetic office notice with a versioned local preview.
Both should survive restart and demonstrate current scope, source withdrawal,
cancel/retry behavior and truthful receipts. They provide stronger product
evidence than enabling every catalogue label in navigation.

Nothing is removed from the [coverage ledger](component-coverage.csv). Strata/
Ruara keeps receiving-side membership/publication authority; ontology/knowledge
views remain rebuildable; hardware, field, archive, science, learning and domain
packs retain their independent evidence gates. The catalogue's earlier OpenBot
shell recommendation and old as-built commit references need editorial
reconciliation with its later overrides and this repository's actual checkpoints.

## Primary references

- [Univer core and licensing](https://github.com/dream-num/univer)
- [Univer Docs import/export](https://docs.univer.ai/guides/docs/features/import-export)
- [Univer CSV import example](https://docs.univer.ai/blog/csv-import-plugin)
- [Univer package/version guidance](https://docs.univer.ai/guides/skills)
- [Pinned Univer CLI source](https://github.com/dream-num/univer-cli/tree/b96357c87be987e14c1771497c25d310d6084746)
- [Cua Driver](https://github.com/trycua/cua/blob/main/libs/cua-driver/README.md)
- [Cua Driver platform requirements](https://cua.ai/docs/cua-driver/quickstart)
- [Cua SDK and license boundaries](https://cua.ai/docs/cua-sdk)
- [Microsoft WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)
- [Microsoft WSL networking](https://learn.microsoft.com/en-us/windows/wsl/networking)

Repository evidence: [launcher](../../scripts/start_platform.py),
[release packager](../../scripts/package_release.py),
[Rust CLI](../../services/aksarad/src/main.rs),
[Mastra adapter](../../packages/runtime-mastra/index.mjs),
[gateway limits](../../packages/gateway/README.md),
[onboarding](../../apps/platform/src/workspace/SetupView.tsx),
[appearance](../../apps/platform/src/workspace/appearance.ts),
[product checks](../../tests/platform-browser.mjs).
