# Native local development and Surface package

31 October 2026, Asia/Bangkok. This increment keeps Rust authority, the PWA and
Mastra together. It adds a native-process launcher, provider alternatives and a
real first file/editor workflow. This is a **development distribution**, not
production enrollment or a completed autonomous-computer product.

## Windows portable bundle

The [Windows workflow](../../.github/workflows/windows.yml) builds the Rust host,
qualifies startup/CLI/backup/stop/restart, assembles a ZIP with Node 24.19.0 and
production dependencies, then tests the extracted bundle in a path with spaces
and Unicode. Successful runs upload `aksara-windows-x64` in GitHub Actions.
Runner qualification does not establish Surface Pro 3 performance or support
for every Windows version. The ZIP is unsigned.

Extract the entire ZIP. From PowerShell inside its folder:

```powershell
.\aksara.cmd setup
```

Keep that terminal open. Open `http://127.0.0.1:7341` if the browser did not open.
Choose the explicitly labeled development identity and use Settings → Set up
Aksara. The chooser is not production authentication.

No Docker, WSL2, Rust compiler, npm install or Python is needed for the baseline
bundle. The launcher runs two authority processes and one Node workbench, with
separate personal/community databases. The optional `--simulator` worker needs
Python on PATH. Models, TTS and Office converters are not bundled.

Other commands:

```powershell
.\aksara.cmd doctor --json
.\aksara.cmd chat "Hello"
.\aksara.cmd chat --provider codex-chatgpt --cloud-consent "Hello"
.\aksara.cmd stop
.\aksara.cmd backup "D:\Backups\personal.sqlite" --profile personal
```

Connect a model in the PWA before terminal chat. `chat` is one prompt/reply,
not a second agent harness or an interactive REPL. It uses the same scoped BFF
and canonical model/work APIs; personal custody is its default. `--profile
community` chooses the separate institutional private thread. Hosted consent is
explicit for each CLI invocation. No arbitrary shell/tool execution is enabled.

Backups require the host to be stopped. They preserve a selected authority
database; they do not automatically export provider credentials or constitute
a full fleet recovery/restore procedure. Existing databases with missing original
identity files fail closed instead of creating replacement identities.

Mutable data lives at `%LOCALAPPDATA%\Aksara` by default. New state directories
receive owner ACLs via Windows SID/icacls; Unix uses owner-only modes. API-key
records are encrypted, with an adjacent host key protected by those OS rules.
This is not DPAPI/Windows Credential Vault protection against a compromised host.
Do not merge personal/community custody or copy credentials to shared computers.

The owner-only control record authorizes local diagnostics/stop without guessing
or killing a reused PID. Normal shutdown stops owned workers; hard process-kill,
power loss, suspend and legacy Windows behavior still require device-level tests.
The launcher does not yet use Windows Job Objects or signed auto-updates.
On Windows, authority ownership locks a reserved byte outside the database size
budget, so a second host (including one using a hard-link alias) is rejected
without blocking SQLite’s own handles. Windows CI checks this behavior directly.

For source development on Linux/macOS or a Windows Rust environment:

```sh
cargo build --locked --workspace
npm ci
npm run build
npm run aksara -- start
```

The original Python `npm run platform` multi-person fixture is preserved for
conformance tests. The new launcher deliberately exposes only the Operator's
community/private and personal profiles, rather than starting every fixture DB.
Use a separate `--state` directory when comparing the two launchers.

## Model onboarding

| Connection | Setup | Limits |
| --- | --- | --- |
| Local | Install/start Ollama or compatible loopback server, then choose an installed model | Offline after installation; model quality/resource use needs hardware qualification |
| ChatGPT / Codex | Sign in with ChatGPT; enter the displayed device code at OpenAI; polling completes in setup | Account/workspace eligibility, device-auth setting and model entitlement still apply; subscription is not a general OpenAI API key |
| OpenCode | Choose public experimental provider and send a consented test turn | Keyless availability/quotas are not guaranteed; prior live tests failed; no paid fallback |
| Google AI Studio | Save a project API key on the local host, acknowledge project billing/data terms, then test | Account free tier is not enforced by Aksara; free-tier content can be used for product improvement |
| Groq | Save an account API key, review account plan/limits, then test | Limits and billing follow the account; no automatic provider/account rotation |
| OpenRouter free | Save an OpenRouter key, then select its free router | Fixed `openrouter/free`, zero-price routing constraints, no paid plugins or paid-model fallback; availability and provider data terms can change |

These are actual Mastra provider paths, qualified with synthetic HTTP responses.
The test suite does not claim a successful live call on the user's account.
Default model IDs are candidates, not proof of current free entitlement.

Keys never return in provider status responses, never enter prompts and are
scoped by the current Rust institution/principal. Replacement/disconnection
fences in-flight replies. Codex keeps its existing scoped Mastra donor transport;
Hermes credential files, ambient environment-key autodetection, account pools and
automatic provider fallbacks are not imported. Hosted context excludes local-only
and other-provider turns. Library sources require explicit selection and per-turn
source consent; prior sourced turns require those sources to be selected again.
Provider errors use safe
categories rather than returning provider bodies that may echo private content.

## Files and Office worktrees

Library now accepts private uploads up to 1 MiB for UTF-8 TXT/Markdown/CSV/JSON,
PNG/JPEG and PDF. MIME allowlists and basic binary signatures are checked by
Rust; this is not full document validation or a malware scanner. Original bytes,
hash, visibility, provenance and current eligibility remain canonical. Downloads
fetch through fresh host authorization and use attachment-style binary blobs.

Text viewers/editable drafts and image previews are present. PDFs are stored for
download; PDF rendering, OCR, DOCX/XLSX exchange and collaboration are not enabled.
Binary originals do not enter FTS, model inputs or exact-excerpt memory without
a qualified text projection. Rebuilding indexes verifies original hashes and
skips binary parsing.

CSV editing lazy-loads the actual OSS Univer 1.3.1 preset, using Papa Parse 5.7.0.
Only one open editor instance is mounted. Initial CSV editing is limited to
50,000 characters, 1,000 rows, 100 columns and 20,000 imported cells; output is
also bounded before review. These are import/save bounds, not a claim that every
interactive spreadsheet operation has a hard CPU/RSS budget.

Select a cell in the grid and edit it in the compact cell-value bar; double-click
focuses that input. Changes use Univer’s public Facade API and actual workbook
model. This avoids a hidden canvas-input selection problem inside modal dialogs.
Text replacement and a calculated SUM are exercised in the real browser test.
Imported formula-like strings stay text. Formulas explicitly entered by a person
are included in the reviewed CSV. CSV does not retain spreadsheet formatting.
The worktree makes a source-linked **new document** through prepare → exact
approval → execution → verified receipt. It never overwrites the original.
This first revision uses existing artifact lineage, not a full version-browser or
concurrent merge protocol. Source withdrawal removes dependent editor/review data
and hides derived revisions under current eligibility.

The editor chunk is approximately 6.66 MB uncompressed / 1.76 MB gzip and is
loaded only on demand. It adds no daemon, Pro conversion service or embedded
application runtime credential. Its resident-memory cost on the Surface remains
to be measured. Original DOCX/XLSX uploads and editing need a later format gate;
do not rename those files to pretend they are CSV.

## Persistent assistant and appearance

The blob now lives near the top of desktop navigation and in the phone dock.
Expansion moved to the sidebar footer; the brand is an open triangle. Static/
reduced-effects fallbacks retain a blob. The phone dock keeps Home, Library,
Aksara, Channels and More; capabilities are still available through More.

Closing private conversation restores its origin route. When it changed from a
shared channel to private, the host reauthorizes the previous channel before
rebuilding that route. Ineligible old content is not retained as a blur texture.
Simultaneous independently scoped private/shared panes remain a later protocol
increment. Browser drafts are not persisted as a workaround.

Auto appearance uses local clock phases (07:00–18:00 light, otherwise dark), with
explicit Light/Dark overrides. Simulation drives theme and procedural atmosphere
together, without changing canonical/security time. This is a local clock, not
measured weather or astronomical sunrise. The composer uses Base UI anchored
popover semantics on desktop and a bounded modal sheet presentation on phones.

## Hermes, channels and integration brokers

Hermes was studied at `5057eaa3a4d0cbef0e30078418a5115faa62889e` (MIT).
Its device-code OAuth confirms the existing Codex direction. Its separation of
transport account/channel/thread/sender coordinates and delivery result categories
informs the new `aksara.channel-message/1` and ingress port.

The ingress requires injected transport verification, current identity binding,
current-context assertion and canonical admission. Replayed IDs carry stable
idempotency keys and content digests; atomic deduplication/revalidation belongs
in Rust. The current port is contract/fixture qualification, **not a live Telegram,
Slack or Discord adapter**. No external messages were sent. Outbound delivery,
credentials, receiving audience, durable intent and uncertain-send reconciliation
must qualify before deployment. A donor session key is never an Aksara grant.

Useful next donor slices: deferred tool-schema discovery, bounded file tools,
explicit search backends such as SearXNG, media delivery categories and learned
skill proposals. Arbitrary terminal execution, generated skill auto-install,
scheduled permanent grants and automatic credential/provider fallback are not
enabled by importing those ideas.

The pinned Hermes catalogue's Composio entry is a community connection manager
using Composio's backend/CLI. The public Composio repository is an MIT SDK
monorepo; it does not establish a free complete self-hosted backend. Composio
documents enterprise self-hosting separately. Activepieces is a credible optional
self-hosted connector donor: MIT outside its EE directories, with each connector
still requiring source and license qualification. Neither service is a default
Surface dependency or a substitute for Aksara's authorization/effect protocol.

## Evidence and remaining gates

Linux validation of this increment: 38 Rust integration tests, 30 passing Node
platform checks with one intentionally skipped real-Docker test, three Pi tests,
nine Python device tests, 24 real-host product browser checks, 26 preview checks,
eight preserved privacy/approval browser checks and 22 process-stress checks.
The native launcher fixture additionally checks spaces/Unicode, model reply,
separate stores, offline backup, authenticated stop and restart. Windows evidence
is recorded by its separate workflow, not inferred from these Linux results.

Still open: real enrollment and named review rights; full Office fidelity/version
history; durable tool/subagent execution; interactive isolated computers/native
desktop driver; physical SDK transports; voice capture; richer memory/ontology;
publication/federation; Surface/A12 performance and production recovery. The
[coverage ledger](component-coverage.csv) retains all 28 tracks.

Sources: [Hermes providers](https://hermes-agent.nousresearch.com/docs/integrations/providers),
[OpenAI Codex auth](https://developers.openai.com/codex/auth),
[Gemini pricing/data terms](https://ai.google.dev/gemini-api/docs/pricing),
[Groq limits](https://console.groq.com/docs/rate-limits),
[OpenRouter limits](https://openrouter.ai/docs/api_reference/limits),
[Composio SDK](https://github.com/ComposioHQ/composio),
[Composio enterprise self-hosting](https://composio.dev/content/self-hosted-mcp-gateway),
[Activepieces license](https://github.com/activepieces/activepieces/blob/main/LICENSE).
