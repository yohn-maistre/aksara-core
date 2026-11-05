# Reading Room: shared writing and source tables

6 November 2026. Development alpha, platform/desktop 0.3.0, database schema 5.

A shared room now keeps its conversation beside an ordinary rich-text document.
Home is a compact living brief; Library, channels, documents and source tables
are peer screens. The chosen Reading Room concept informs the layout. Lilac on
warm paper is the light default, copper on graphite the dark proposal. The new
shell needs no WebGL atmosphere or animated blob. Palette/Auto overrides remain.

## Try the complete path

1. Run the local app, select a development community profile, and open Common room.
2. Connect a qualified provider or use a local compatible model. Request a brief.
   The existing Mastra foreground/background flow remains available; a successful
   model login and actual reply are separate from seeing a model catalogue.
3. Open the resulting artifact, or Library → New document. Write using the real
   BlockNote toolbar, lists, headings and selection. Saved working pages appear
   in the room’s Library and work panel.
4. “Aksara, help here” saves and freezes the current revision, attaches that source
   and fills this room’s composer. Inspect and send the request yourself. Hosted
   source/turn consent remains required where applicable.
5. Prepare for review. Read the exact document, its destination and linked sources;
   approval and execution remain explicit, with the actual receipt afterward.
6. Library → New table arranges up to eight actual eligible sources. Drag, zoom,
   reopen sources and hand that selection into a same-room request. It is a source
   table, not a drawing board, execution graph or browser sandbox.

The hosted [preview](https://aksara-core-preview.pages.dev) uses fictional,
tab-local examples and the real frontend. It has no model, Rust host or access to
local files. Its API guard rejects live-backend requests rather than pretending
to execute them. Preview changes reset on reload.

## Persistence and custody

Working surfaces belong to the current institution, conversation and purpose.
Every list, read, save and immutable snapshot checks current eligibility and all
source dependencies. Private sources cannot enter shared drafts. Edits cannot
silently remove previous dependencies. Source withdrawal hides dependent drafts,
snapshots and existing derived results.

Schema 5 stores versioned document blocks plus portable Markdown, or source-table
node positions. Writes compare the exact current revision; a stale save returns a
conflict. The editor retains unsaved local text and offers a download before an
explicit saved-version reload. Autosave is debounced and serialized. This is
**saved-revision sharing, not live CRDT collaboration**; no live cursor/presence
transport is claimed. Before navigation, pending saves are flushed. A failed or
conflicting flush keeps the editing screen available.

A snapshot is idempotent for an exact revision and preserves source lineage. It
is an unreviewed source, not an approved institutional record. Reviews still bind
an exact proposal revision, current audience and purpose. Local effects and
receipts retain their transaction boundary. Work links resolve their actual
receipt/model-run artifacts, not an arbitrary Library item.

Storage is bounded: 500 working entries per store, 64 MiB revision storage, last
50 revisions per entry. Body/title/source sizes and canvas coordinates are
validated. The interface does not yet expose revision browsing or table deletion.
Back up data before upgrading: older schema-4 binaries cannot open schema 5;
downgrade requires restoring the pre-upgrade backup.

## Packages and performance limits

BlockNote core/react/shadcn 0.57.0 is MPL-2.0, React Flow 12.10.1 MIT. Both are
loaded on demand. Markdown export is local. BlockNote XL Office/PDF exporters are
not installed pending the GPL/commercial distribution choice. No paid license or
root relicensing has occurred. Inline image upload, arbitrary remote file
resolution and hosted asset proxies are disabled. Unsupported editor content has
a preserved Markdown fallback. Uploaded original bytes remain downloadable.

Each build emits `licenses/frontend-NOTICE.txt` and a bundled dependency inventory,
including the unmodified MPL source location. The desktop package carries them.
The compact Node host build was measured here at about 60.2 MB across 324 files;
that is not a Windows installer, RAM measurement or download-compression result.
The existing Univer spreadsheet bundle remains large and lazy-loaded. No new
Surface Pro 3 or Android hardware performance measurements were made.

## Verification

New Rust tests exercise lane-bound shared edits, concurrent revisions, immutable
idempotent snapshots, retained dependency lineage, withdrawal and private-source
denial. A real-host two-browser fixture verifies shared reading, persisted rich
text, a held stale save preserving unsaved content, and saved source-table handoff.
Existing authority/runtime/browser/preview checks remain required in CI. Desktop,
phone, dark and Home captures live in `.impeccable/review/`; see
[design QA](../../design-qa.md) for the final review and qualification record.

## Remaining seams

Live simultaneous collaboration, Office/PDF export, watches/routines, meeting
transcription, richer freehand canvases, remote channel accounts and isolated
shared computers remain distinct work. Aksara’s existing bounded native private
computer connection remains Vercel agent-desktop; it controls the signed-in OS
session and is not an OS sandbox. Mastra remains the durable agent harness.

[OpenCode/OpenBot and Twenty follow-up](../design/openbot-twenty-assessment-2026-11-06.md)
records optional ACP execution and MIT UI candidates without introducing a second
agent supervisor, copied noncommercial source or duplicate component stack.
