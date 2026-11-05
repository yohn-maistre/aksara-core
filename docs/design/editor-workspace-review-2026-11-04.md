# Shared work, documents and the next Aksara interface

4 November 2026. Research and visual proposals, not an adopted design system or
an installed editor. Terminus is excluded at the user's request.

**Follow-up:** the user subsequently selected Reading Room, relaxed the star
threshold, accepted MPL and asked us to consider the complete BlockNote XL
package. The strict permissive filter and Plate-first recommendation below are
historical. The [5 November source study](orbit-and-workspace-building-blocks-2026-11-05.md)
records the updated recommendation, Orbit/Kanwas findings and XL distribution
choices. No editor was installed by either research pass.

The user selected **shared channel → watch Aksara work → review a shared artifact**
as the primary redesign journey. Product truth is recorded in
[PRODUCT.md](../../apps/platform/PRODUCT.md).

## Recommendation

Use **Plate's MIT editor and OSS components** for the first proper document
surface, **Excalidraw** for a later canvas surface, and retain the existing OSS
**Univer** spreadsheet worktree. Keep **Tiptap core** as the alternative if schema,
agent patches or collaboration requirements make it a better fit in a small
integration trial. Do not embed a second whole platform merely to replace a
textarea. No editor/package is installed by this review.

Keep Aksara's own identity, canonical sources, reviewed revisions and permissions.
A draft needs autosave/recovery and ordinary writing controls. Shared release
needs a readable document/diff, destination, audience and sources before approval.
Do not require a human to read JSON to approve a document. Do not remove exact
revision binding, provenance or host-side authorization to simplify that screen.

## Repository shortlist

Stars were checked through GitHub repository metadata on 4 November 2026; they
are a snapshot, not a maturity or performance score. The requested permissive
filter here means MIT/Apache-2.0, rather than every license described as open source.
Package and plugin licenses still need checking before integration.

| Repository | Stars | License/scope | Fit and tradeoff |
| --- | ---: | --- | --- |
| [Plate](https://github.com/udecode/plate) | 16,688 | MIT core and inspected OSS UI/CLI | Best match for React/shadcn-style block editing; headings, lists, menus and extensible rich text. The complete Notion-style **Potion** template is a separate Pro offering, not the free template to import blindly. |
| [Tiptap](https://github.com/ueberdosis/tiptap) | 38,953 | MIT editor core | Strong headless ProseMirror foundation; custom document nodes, controlled UI and a Yjs collaboration ecosystem. More UI assembly. Pro extensions, some templates and hosted services have separate terms. |
| [Lexical](https://github.com/meta/lexical) | 23,993 | MIT | Extensible React-capable editor, undo/redo, structured state and Yjs integration. A good engine but more work to create an office-ready block UI. |
| [Editor.js](https://github.com/codex-team/editor.js) | 31,993 | Apache-2.0 core | Block-oriented editor with JSON output. Useful for structured artifacts; advanced collaborative editing and individual tool/plugin terms need separate evaluation. |
| [Milkdown](https://github.com/Milkdown/milkdown) | 12,043 | MIT | Markdown-oriented WYSIWYG with ProseMirror; useful for portable knowledge/wiki documents. Less of a complete Notion workspace. |
| [Slate](https://github.com/ianstormtaylor/slate) | 31,746 | MIT | Flexible underlying rich-text framework. Plate already supplies much of the missing product UI; prefer that over assembling everything from raw Slate. |
| [Novel](https://github.com/steven-tey/novel) | 16,464 | Apache-2.0 | A close Notion-style editor reference. Metadata's last push was **18 January 2025**; do not select a fresh foundation from star count alone. |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | 135,142 | MIT | Best first embeddable whiteboard/diagram canvas candidate. Scene persistence, assets and collaborative transport still need Aksara integration. |
| [draw.io](https://github.com/jgraph/drawio) | 9,168 | Apache-2.0 | Stronger formal diagramming; a larger, more separate editing interface than Excalidraw. Not a document editor. |
| [Univer SDK](https://github.com/dream-num/univer) | 22,878 | Apache-2.0 OSS SDK | Office sheets/docs/slides foundation; Aksara already uses a lazy OSS CSV sheet editor. SDK stars do not transfer to the separate Workspace application; Pro capabilities retain separate terms. |
| [SilverBullet](https://github.com/silverbulletmd/silverbullet) | 6,456 | MIT | A whole programmable knowledge/wiki application with Markdown live preview. Personal-first, not a drop-in team Notion editor; adopting it adds a separate server/space model. |
| [Etherpad](https://github.com/ether/etherpad) | 18,617 | Apache-2.0 | A whole, extensible collaborative rich-text editor with authorship and revision history. Good shared-note reference; not an all-in-one Notion/canvas system and adds its own server/plugin integration. |

### Close matches that do not pass this filter

- [AFFiNE](https://github.com/toeverything/AFFiNE), 74,200 stars: attractive
  documents/whiteboard workspace, but not uniformly permissive. Its root license
  delegates backend/native code to a separate license; CE/client-side provisions
  there use MPL-2.0 and non-CE parts use Enterprise terms. See
  [root license](https://github.com/toeverything/AFFiNE/blob/canary/LICENSE) and
  [backend license](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/LICENSE).
- [BlockSuite](https://github.com/toeverything/blocksuite), 6,082: MPL-2.0.
- [BlockNote](https://github.com/TypeCellOS/BlockNote), 10,353: MPL-2.0 core;
  XL packages GPL-3.0/commercial. MPL allows commercial use but is file-level
  copyleft, not the strict permissive category requested. See its
  [license](https://github.com/TypeCellOS/BlockNote/blob/main/LICENSE.txt).
- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy), 78,171: AGPL-3.0.
- [Outline](https://github.com/outline/outline), 41,160: BSL-1.1 with a Document
  Service restriction; [current license](https://github.com/outline/outline/blob/main/LICENSE).
- [tldraw](https://github.com/tldraw/tldraw), 51,234: current production use needs
  separate permission/license terms; [license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md).
- [Univer Workspace](https://github.com/dream-num/univer-workspace), 2,269:
  a particularly relevant Apache-2.0 application/worktree reference, but below
  5,000 stars. Its SDK/runtime capabilities need their own license qualification.
- [TOAST UI Editor](https://github.com/nhn/tui.editor), 17,988, MIT: passes license
  and stars, but the repository is archived; not recommended for a new foundation.

Among the checked projects, none gives us the complete Notion + canvas + team
platform under a uniformly permissive license with no integration tradeoff.
The practical choice is a strong embedded editor and optional canvas under the
existing workspace, rather than claiming an entire platform is a simple component.

## Impeccable critique

Method: dual-agent (A: `/root/impeccable_design_review` · B:
`/root/impeccable_detector_review`). A completed its independent design verdict
before B's detector findings entered synthesis. The platform is a web UI even
when hosted in Tauri. This is not a native iOS/Android audit.

Six fresh locally rendered, synthetic QA screenshots and current source were
reviewed: setup, Home, Library, document form, phone chat and phone Home. The
full chosen shared journey was assessed in source, not captured end to end in a
live office. No Windows/Surface performance, assistive-technology session or full
contrast/focus audit was performed. No browser overlay is available or claimed.

The independent design assessment was **17/40**. These are qualitative heuristic
scores for the inspected interface, not an engineering score or a measured user test.

| Heuristic | /4 | Main issue |
| --- | ---: | --- |
| System status | 2 | Work/result continuity is weak. |
| Real-world language | 2 | Review exposes effect/payload vocabulary. |
| Control and freedom | 2 | Draft recovery and withdrawal safeguards need work. |
| Consistency | 2 | Several navigation models coexist. |
| Error prevention | 2 | Strong exact approvals, weak draft durability. |
| Recognition | 2 | Hidden labels and generic result selection. |
| Efficiency | 2 | Too many transitions for writing/review. |
| Minimalism | 1 | Atmosphere and Home compete with urgent work. |
| Error recovery | 1 | Conflict/auth paths can clear in-memory drafts. |
| Help | 1 | Task-focused recovery/joining guidance is weak. |

### Five priorities

1. **P1 — Channel/work/artifact continuity.** Keep the channel and audience in
   view, show named contributors, and bind results to the work that produced
   them. `WorkActivity` currently chooses `artifacts[0]` for its generic Library
   item; that is not evidence of a task/result relationship. This is not a proven
   cross-scope leak. Suggested Impeccable action: `layout`.
2. **P1 — Human review.** Present the document/diff, destination, audience and
   sources before technical arguments/hashes. Preserve exact approval semantics
   but use an action name people understand. Suggested action: `clarify`.
3. **P1 — Calm hierarchy.** Put pending review/current work ahead of slogans,
   setup housekeeping and a continuing Home pane. Keep graphite/lilac warmth;
   reduce atmospheric competition. Suggested actions: `quieter`, `layout`.
4. **P1 — A working document.** Replace the modal textarea with a persistent
   editor, save state and appropriately scoped draft recovery. A working draft
   and an approved shared revision remain distinct. Suggested action: `shape`.
5. **P1 — Phone navigation/recovery.** Stable labeled destinations, clear send
   state, concise provider/source disclosure and recovery after interruption.
   Qualify keyboard, safe area and focus behavior. Suggested actions: `adapt`, `harden`.

The strengths are real source/audience safeguards, explicit provider consent,
exact approvals, recognizable Library rows, focus/reduced-motion support and a
warm conversational voice. Retain them. Cognitive load is high across the whole
journey because users must bridge conversation, work, payload review and artifact
detail. The emotional low point is a friendly request ending in execution jargon
instead of a readable, named document.

First-timers need visible labels and a clear next step. Keyboard/low-vision users
need actual focus/zoom/contrast checks, not conclusions from screenshots alone.
Interrupted phone users need recoverable permitted drafts and pending review
above the fold. The existing empty-state capture cannot prove how a busy office
would perform.

The detector succeeded: **two platform warnings**, both the same `overused-font`
decision, at `duet.css:247` and `style.css:3`. A separate scan of the changed
desktop bootstrap emitted **one** Inter warning. These are not independent
usability defects or a reason to replace a coherent product font. No other
detector finding does not mean that usability, contrast or performance passed.

## Visual proposals

The three independently generated concepts are proposals with fictional content,
not screenshots of implemented features. Display order in the conversation:

1. [Commons](concepts/commons.png): balanced channel conversation and open artifact.
2. [Reading Room](concepts/reading-room.png): document-led reading/editing and review.
3. [Workstream](concepts/workstream.png): conversation-led work, result and computer context.

No replacement UI has been implemented or deployed. The user's next choice can
select one or combine parts into a revised target before implementation.

## Computer use and desktop status

Current native computer driver: **Vercel agent-desktop v1.0.2**, JSON contract
**2.5**, through Aksara's scoped window permits and action journal. Mastra owns
the durable agent loop. This operates an explicitly connected local window;
it is not an isolated VM. Current model/tool and real Windows action qualification
limits remain in the implementation ledger; shared isolated computers are not
made real by a new thumbnail in a design.

Desktop **0.2.1** unifies GUI/headless runtime lookup, reports safe startup stages,
adds retry, and tests the actual installed WebView2/React chooser and failure UI.
[Windows qualification](https://github.com/yohn-maistre/aksara-core/actions/runs/41798119929)
and [kernel/runtime conformance](https://github.com/yohn-maistre/aksara-core/actions/runs/41798119882)
passed on runtime commit `9bf4449`. Cold startup on the user's Surface remains
the real-device follow-up. Automatic signed updating is a documented direction,
not enabled infrastructure.
