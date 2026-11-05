# Aksara: a working document, a shared room, a persistent colleague

5 November 2026, Asia/Bangkok. Source research and proposed design, not a runtime
change. The selected journey remains **shared channel → watch Aksara work →
review a shared artifact**. The user chose Reading Room, the second displayed
concept, with the open-triangle mark. This updates the [4 November review](editor-workspace-review-2026-11-04.md).

## Recommendation

Use **BlockNote with its XL document exporters** as the preferred document stack.
It gives us one block model for writing, wiki pages, agent-proposed edits, comments,
review snapshots and Word/PDF/ODT/email export. Evaluate the actual complete
experience, rather than excluding useful capabilities merely to keep every
dependency permissive. Retain **Univer** for spreadsheets, **Mastra** for durable
agent work, and Aksara's existing Rust/SQLite authority.

MPL is acceptable to the user; the old 5,000-star threshold is a discovery guide.
XL's GPL/commercial distribution choice is still material. The recommendation
does not change repository licensing, buy a subscription or install dependencies.

For the next end-to-end implementation, build one channel with a readable editor,
named work, linked result and review. Make that path excellent before adding a
canvas, a second AI framework or a full project-management platform.

## What Orbit actually uses

Correct repository: [coollabsio/orbit](https://github.com/coollabsio/orbit), linked
from orbit.so. Studied commit `cf5ca05228a96d4fd99b5d058240de810c608911`.
GitHub metadata: 369 stars; last push 4 November 2026; root Apache-2.0. Stars are
dated observations, not proof of field maturity. Search summaries lagged actual
source, including an outdated claim that MCP only had three read-only tools.

| Function | Actual source at the studied revision | What Aksara should reuse |
| --- | --- | --- |
| Document editing | BlockNote 0.55 core/react/shadcn; shared `packages/editor`; custom schema, menus, mentions, uploads and safe links in `apps/web/src/features/docs/editor/PageEditor.tsx` | A real block editor plus explicit callbacks for files, page links and comments. The surrounding wiki is application work, not something installing BlockNote creates. |
| Collaboration | Yjs 13.6, y-websocket, y-prosemirror; Rust Yrs 0.28 in `apps/server/src/collab/` | Per-document rooms, persisted updates/compaction, reset epochs and authorization-aware connection lifecycle. |
| Access changes | `collab/socket.rs` checks Origin, current member/document access and epoch; session or scoped ticket; periodic and event-driven rechecks | Revoke sockets and cached content when access changes. A room name or presence cursor is not permission. |
| Task list/board/timeline | TanStack Query/Virtual; custom `TaskBoard.tsx`, grouping/drop/nesting hooks | Separate task data and views. Orbit is not secretly using a complete off-the-shelf work-management engine. |
| Document tree | Custom `DocTree.tsx` and row/drag logic | Useful behavior reference; a reusable tree library can save Aksara more work. |
| Chat | Own conversations, messages, threads, files and search over the same API | Keep conversation, work and document navigation coherent. Do not copy a second conversation database. |
| UI and client data | React 19.3, Router 8.3, Base UI 1.8, shadcn, Tailwind 4.3, Query/Virtual, cmdk, Sonner, Mermaid; generated typed API client | Mostly familiar building blocks already close to our stack. Keep Aksara's current versions unless a feature needs an upgrade. |
| Native mobile | Expo 58 / React Native; `PageEditor.dom.tsx` uses a WebView DOM editor with a native toolbar/action bridge | Share the editor/schema instead of rewriting it natively. This does not justify an immediate Expo rewrite of our responsive PWA. |
| Server and packaging | Axum/Tokio/SQLx; SQLite or Postgres; local/S3 files; `include_dir` embeds React in a Rust binary | Compact packaging reference. It does not eliminate our Node/Mastra runtime or implement signed automatic updates. |
| MCP | rmcp 3.5; scoped task create/update/delete, task/project reads, document reads and chat/thread reads in `apps/server/src/mcp.rs` | Fine-grained scopes and a useful domain tool vocabulary. Server-side effect authorization still applies. |
| Harness | Inspected manifests expose no Mastra or embedded autonomous model loop; operational durable jobs handle service work | Do not mistake durable maintenance jobs or an MCP server for a durable autonomous agent. Orbit is a workspace reference, not the replacement Aksara harness. |

Orbit's README labels mail **in progress, mock data**. Do not present it as a
working mail integration. Repository code is Apache-2.0, but BlockNote remains
MPL and other dependencies keep their terms. Notably `collab/blocknote.rs` says
it ports BlockNote/y-prosemirror conversion functions: audit upstream provenance
before copying that converter under the root repository label.

Primary source entry points:
[web manifest](https://github.com/coollabsio/orbit/blob/cf5ca05228a96d4fd99b5d058240de810c608911/apps/web/package.json),
[server manifest](https://github.com/coollabsio/orbit/blob/cf5ca05228a96d4fd99b5d058240de810c608911/apps/server/Cargo.toml),
[editor](https://github.com/coollabsio/orbit/blob/cf5ca05228a96d4fd99b5d058240de810c608911/apps/web/src/features/docs/editor/PageEditor.tsx),
[collaboration socket](https://github.com/coollabsio/orbit/blob/cf5ca05228a96d4fd99b5d058240de810c608911/apps/server/src/collab/socket.rs),
[MCP](https://github.com/coollabsio/orbit/blob/cf5ca05228a96d4fd99b5d058240de810c608911/apps/server/src/mcp.rs).

## BlockNote XL: a complete document toolkit worth using

Studied [BlockNote](https://github.com/TypeCellOS/BlockNote) commit
`262fb815a25e892b7a6e4d06b63df19a9ae5d6a8`; package manifests and npm report
**0.57.0**. That differs from Orbit's 0.55 and Kanwas's 0.46. Pin a coherent
package family for a trial; do not combine snippets from those versions blindly.

| Capability | Package/license | Integration consequence |
| --- | --- | --- |
| Blocks, menus, tables, UI, comments, Yjs binding | core/react/shadcn: MPL-2.0 | Good default editor, without a subscription. Collaboration still needs authorized transport, durable storage, identity and recovery. |
| Word export | `xl-docx-exporter`: GPL-3.0 or commercial; uses `docx` | Converts our blocks to editable DOCX. Supports custom mappings and document/section options. Does not promise lossless editing of arbitrary imported Word files. |
| PDF export | `xl-pdf-exporter` plus Typst packages: GPL-3.0 or commercial | Current path uses a bundled WASM compiler and fonts, with tagged PDFs and conditional PDF/UA-1 claims. Compile failures/violations must be visible. Previous react-pdf path is deprecated. |
| ODT and email export | `xl-odt-exporter`, `xl-email-exporter`: GPL-3.0 or commercial | Useful office interoperability and reusable correspondence artifacts. Email export is content generation, not an email account/gateway or permission to send. |
| Multi-column layouts | `xl-multi-column`: GPL-3.0 or commercial | Useful for briefs and public documents; make narrow-phone reading linear. |
| Inline AI writing/review | `xl-ai`: GPL-3.0 or commercial | Ready-made AI menus and editing machinery; adapt its transport to Aksara/Mastra. Current package depends on AI SDK 7; our runtime uses AI SDK 6. This is a real compatibility trial, not a drop-in backend replacement. |

**Prefer the whole document experience, load it in pieces.** Editor code loads on
opening a document; export code on export. Upstream describes the PDF compiler
as approximately **25 MB WASM**, before its fonts and other assets. That is not an
Aksara bundle measurement or a Surface memory benchmark. A background worker and
an optional host-side export path are candidates; neither is implemented here.
Keep Home/chat fast and avoid a live PDF compile on every keystroke.

**Local assets require an explicit override.** DOCX and current PDF options default
to `corsProxyResolveFileUrl`, a BlockNote-hosted file proxy. Supply an Aksara asset
resolver that reads only currently eligible local files, snapshots asset digests,
and rejects unsupported/external assets rather than silently reaching the proxy.
Bundled fonts/compiler do not make arbitrary external image references offline.

**Full export is not full Office round-trip.** Official import guidance covers
HTML and Markdown; output mappings may simplify constructs (for example, a
toggle list becomes a textual marker in DOCX). Tables, custom blocks, citations,
images, comments, fonts and page breaks require representative document checks.
Spreadsheets remain in Univer. If exact imported Office fidelity later matters,
evaluate a dedicated Office engine then; do not represent BlockNote as that engine.

**Keep Aksara's AI and custody.** XL's demo backend accepts client tool definitions,
injects document state/history and executes client-side edit tools. Adapt this
through validated document operations and current permission checks. Do not send
all editor history by default, introduce direct browser provider keys, or let a
browser-generated tool definition create host authority. AI edits can be ordinary
working-draft changes within existing permission; reviewed release still binds
the exact resulting revision. Avoid requiring approval for every keystroke.

Sources: [license split](https://github.com/TypeCellOS/BlockNote/blob/262fb815a25e892b7a6e4d06b63df19a9ae5d6a8/LICENSE.txt),
[DOCX](https://www.blocknotejs.org/docs/features/export/docx),
[PDF](https://www.blocknotejs.org/docs/features/export/pdf),
[imports](https://www.blocknotejs.org/docs/features/import),
[AI backend integration](https://www.blocknotejs.org/docs/features/ai/backend-integration),
[collaboration](https://www.blocknotejs.org/docs/features/collaboration).

### Distribution choices, without unnecessarily ruling XL out

1. **Open community distribution under GPL-3.0-compatible terms.** XL is available
   without buying a subscription when the relevant combined distribution complies
   with GPL-3.0. Apache-2.0 code can participate in a GPLv3 combined work while
   retaining its original notices; that does not mean the combined app can still
   be offered as Apache-only. Decide the actual distributed work and provide its
   corresponding source and license notices. A separate package or lazy import
   is not an automatic copyleft exemption. Ordinary institution documents and
   private records do not become public merely because the editor uses GPL.
2. **Commercial XL license for the required deployments.** Published Business
   pricing is **$390 monthly**, or **$2,340 yearly** ($195/month equivalent), before
   applicable taxes. The current agreement covers one Application/production
   environment and five concurrent frontend developers; continued production use
   needs an active license. Its definition distinguishes domains and executable
   application instances. Do not assume one subscription covers Aksara web,
   desktop, ETNOS and unlimited independent institutional deployments. An OEM /
   multi-app agreement needs explicit terms from the vendor.

The preferred community path is to evaluate GPL-compliant distribution seriously,
not discard useful software because it has copyleft. This report authorizes no
license change or purchase. If future proprietary deployments require different
terms, resolve those commercially rather than maintaining homemade exporters.
MPL alone has narrower, file-level obligations and is already acceptable here.

Sources: [pricing](https://www.blocknotejs.org/pricing),
[commercial terms](https://www.blocknotejs.org/legal/blocknote-xl-commercial-license)
(especially 2.4–2.7, 3.2, 5.3 and 7.2). Prices and terms are dated observations.

## The multiplayer-agent workspace we were looking for

[Kanwas](https://github.com/kanwas-ai/kanwas) is a particularly useful concrete
reference: 755 stars, declared Apache-2.0 at commit
`7c2292aec94ff0dcab3c72155d253a73ee794a89`; last push 13 August 2026. It is not
presented as a project updated in the last week. Its GitHub license classifier
returned NOASSERTION, so the declared license and package/per-file terms matter.

Actual composition: **BlockNote + React Flow + react-arborist + Yjs**, with
dnd-kit and TanStack components. The backend uses AdonisJS, AI SDK 6's
`ToolLoopAgent`, Redis, a separate Yjs service and Docker/E2B sandbox adapters.
`execenv/src/sync-manager.ts` mirrors collaborative workspace content into a
sandbox filesystem and brings file edits back, with path validation, content
hashes, suppression of write echoes and Markdown three-way merge helpers.

This is the strongest studied pattern for letting people watch an agent produce
documents/files on a shared canvas. Use the **surface composition and worktree
pattern**, not its entire infrastructure on the Surface Pro. Its shared CRDT graph
is canonical there; in Aksara, room presence, graph position and raw filesystem
changes cannot overwrite membership, reviewed revisions or verified work state.
An agent edits a bounded worktree, then returns proposed artifact revisions.

Durability also needs precision: Kanwas's runtime lease recovery detects dead
invocations and records an error (`agent_runtime_service.ts`, `recoverInvocation`).
That is valuable failure handling, but not proof of resuming every tool step
without replay. Keep our existing Mastra durable checkpoints and effect journal.

Source: [system overview](https://github.com/kanwas-ai/kanwas/blob/7c2292aec94ff0dcab3c72155d253a73ee794a89/docs/SYSTEM_OVERVIEW.md),
`frontend/src/components/canvas/CanvasFlowSurface.tsx`,
`backend/libs/agent/tool_loop_runner.ts`,
`backend/app/services/{agent_runtime_service,sandbox_registry}.ts`,
`execenv/src/sync-manager.ts`.

[OpenLoaf](https://github.com/OpenLoaf/OpenLoaf) is another useful whole-workspace
reference: 113 stars, AGPL-3.0 at
`f7eccf6064317cb2923137079b68d79b8e5c5f3e`, last push 14 May 2026. Its actual
manifests show **Plate 52, React Flow, Yjs/Hocuspocus, Monaco/xterm, AI SDK 6 and
Claude Agent SDK**, with Electron 40. The studied source does not support calling
it a Mastra application. `agentManager.ts` spawns bounded background agents,
queues input and restores history from JSONL; `browserAutomationTools.ts` binds
CDP targets to client/session/tab context and checks expired targets. Useful
patterns, not evidence of our crash/effect guarantees. No AGPL source was copied.
Keep our lighter Tauri wrapper and Mastra loop rather than transplanting this app.

## A small set of complete building blocks

These are candidates and sequencing decisions, not new installed dependencies.
Star snapshots were checked on 4–5 November; licenses were read where noted.

| Layer | Preferred building block | Fit, cost and boundary |
| --- | --- | --- |
| Documents and wiki pages | [BlockNote + XL](https://github.com/TypeCellOS/BlockNote) | Preferred trial. One editor/schema/export family; core MPL, XL GPL/commercial. Wiki links, collections, ACLs, search and page history still belong to Aksara. Plate/Tiptap remain alternatives if the trial fails. |
| Agent/evidence canvas | [React Flow](https://github.com/xyflow/xyflow), 38,895 stars, MIT library | Custom document/task/computer nodes, edges and focused document opening. Yjs/persistence/authorization are separate. Pro examples are optional. Load only on a canvas. |
| Freehand whiteboard | [Excalidraw](https://github.com/excalidraw/excalidraw), MIT | A different artifact type from an evidence canvas; add when drawing is needed. Do not ship two canvas engines just to decorate Home. |
| File/document tree | [react-arborist](https://github.com/jameskerr/react-arborist), 3,714 stars, MIT | Virtualization, keyboard navigation, rename, selection and drag/drop. Use controlled data and authoritative mutations. Current canonical repo is jameskerr, not the older brimdata link. |
| Explorer rows and work boards | [TanStack Table](https://github.com/TanStack/table) / [Virtual](https://github.com/TanStack/virtual), MIT; [dnd-kit](https://github.com/clauderic/dnd-kit), MIT | Reuse actual list/board mechanics. Sorting/filtering in the UI never expands the authorized dataset. A dragged card is not proof that an agent action completed. |
| Conversation UI | [assistant-ui](https://github.com/assistant-ui/assistant-ui), 12,949 stars, MIT | Trial `ExternalStoreRuntime` with existing canonical Aksara messages/actions. Full controls, attachments, tool views and accessibility beat building every chat primitive ourselves. No required Assistant Cloud or second history store. |
| Stateful generative surfaces | assistant-ui Interactables; [AI Elements](https://github.com/vercel/ai-elements), 2,507 stars, Apache-2.0 | Interactables can expose versioned editable surfaces, but current API is explicitly `unstable`. Use as a bounded UI adapter or pattern, not canonical state. Compare with our existing registered OpenUI surfaces before adding another renderer. |
| Portable tool UI | [MCP Apps](https://github.com/modelcontextprotocol/ext-apps), 3,047 stars | Useful future tool-owned sandboxed widgets; current license is transitioning MIT → Apache-2.0, with separate documentation terms. Register resources and validate the host bridge. Not a permission service. |
| Agent events | [AG-UI](https://github.com/ag-ui-protocol/ag-ui), 17,017 stars, MIT | Optional interchange adapter, not another executor or persistence system. Defer unless a real integration needs it. |
| Dedicated browser worker | [Vercel agent-browser](https://github.com/vercel-labs/agent-browser), 45,531 stars, Apache-2.0; [Stagehand](https://github.com/browserbase/stagehand), 25,948 stars, MIT | Compare actual isolated-browser control paths separately from local OS use. Neither provides a shared OS sandbox just by installing its client. Not integrated by this study. |
| Shared remote desktop display | [noVNC](https://github.com/novnc/noVNC), 14,165 stars, MPL core | A viable renderer for an authorized remote VNC session. It does not create the VM, isolation, identity, network boundary or takeover policy. Remaining assets have their own licenses. |
| Sheets | Existing OSS Univer CSV worktree | Keep what already works. A document export package does not replace it. |
| Persistent colleague | Existing durable Mastra + Rust/SQLite | Keep one front agent and bounded task workers, one admission path and effect journal. Borrow tools/surfaces without nesting donor harnesses. |

assistant-ui's current Mastra page is an integration guide, **not a prebuilt
`@assistant-ui/react-mastra` package**. Its standard AI SDK stream examples differ
from our commit-before-visible-output policy. `ExternalStoreRuntime` is the
practical starting point, with unsupported edit/retry/branch controls disabled
until the corresponding Aksara backend operation exists. Interactables' automatic
app-wide update tools must never cross current institution/lane context.

Safe Content Frame/MCP Apps examples use separate cross-origin widget domains;
that needs a deliberately configured host, especially offline/inside Tauri.
Do not paste an iframe demo and claim it establishes our execution sandbox.

[Tambo](https://github.com/tambo-ai/tambo), MIT, and
[CopilotKit](https://github.com/CopilotKit/CopilotKit), MIT, are credible broader
generative UI frameworks. They are alternatives to compare against one complete
UI seam, not additional mandatory orchestration layers beside Mastra. The old
standalone `assistant-ui/tool-ui` repository is archived. The checked Daytona
repository is also archived; neither is a sensible fresh default from stars alone.

## Home with personality

Reading Room is the visual foundation, but Home should be a **living brief**.
The next action emerges from real work instead of a dashboard of generic cards.

- Keep a quiet open triangle, community name and truthful connection/work state.
  No perpetual animated blob pretending that an idle model is thinking.
- One warm, contextual sentence: “The meeting brief is ready for your eye.”
  Use neutral copy when there is no actual activity. Avoid a permanent slogan.
- One flat input line: “Ask, find, or continue…”; typing can start or resume a
  conversation. Keep the clean Home input rather than a huge empty chat box.
- Put a readable excerpt of the most relevant pending artifact below it, with
  author/channel, audience and a clear **Review** action. Supporting items can be
  compact rows. Do not manufacture three priorities to fill space.
- A small “Moving quietly” row links to real running work; “Pick up where you
  left off” holds a few documents/threads. A deliberate handoff earns a small
  animation. No productivity score or mandatory calendar.
- Allow people to pin a calendar, useful custom panel or canvas; they do not have
  to configure a dashboard before using Aksara.

This is also a natural place for personality: concise language, names and useful
acknowledgments, adapting to how the group talks. The agent's confidence, warmth
and occasional wit should never fabricate work status or assume intimacy.

Inside a channel, keep the channel and audience stable while Conversation,
Document and Work change. Desktop can show conversation beside an active artifact;
the work/computer view expands on demand. On phones, switch the primary view in
that same context instead of shrinking three columns or opening another window.
Home no longer needs to occupy a permanent third of every working screen.

## Color family and Material 3 Expressive

Keep lilac in Reading Room's warm light theme. Proposed dark theme: ink/graphite,
warm readable text and **muted copper**. Suggested starting roles, not audited
final tokens: light canvas `#FAF8F5`, ink `#242329`, accent `#75529A`; dark canvas
`#191A1B`, surface `#222425`, text `#ECE8E1`, accent `#D9A47E`. Status colors stay
semantic and use labels/icons. Test contrast on actual components before shipping.

Aksara and ETNOS can share spacing, type, document typography, icon proportions,
selection, focus, navigation and motion. Give each product its own accent alias,
mark and voice. ETNOS's discussion/publication surfaces remain quieter; Aksara's
conversation and work handoffs give it personality. No shared design package
implicitly merges private memory or publication authority.

**Borrow M3 Expressive's interaction principles, using our existing Motion 13.**
Google's web documentation says Material Web is in maintenance mode and **M3
Expressive is not implemented in its web component library**. The motion physics
specification is usable; installing `@material/web` does not deliver the requested
React experience. Keep Base UI/shadcn and define a small spring token family.

Use modest press/selection feedback, anchored sidebar folding, interruptible pane
changes and a clear artifact handoff. Use functional motion for ordinary controls,
slightly more expression for a meaningful transition, and reduced-motion
alternatives. Avoid slow mandatory entrances, elastic document text, perpetual
glows and stacking several animation engines. The next design should feel direct
on an old Surface, not merely look animated in a promo.

Sources: [Google's web status](https://m3.material.io/develop/web),
[motion physics](https://m3.material.io/styles/motion/overview/how-it-works),
[Material Web roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md).

## The next implementation slice and its proof

1. Integrate one lazy BlockNote document experience, including XL export in the
   agreed distribution profile. First establish the schema, saved revision and
   approved file resolver. No custom imitation editor or exporter suite.
2. Make channel → named work → correct resulting artifact → human-readable review
   continuous. The generic first Library item is not an acceptable result link.
3. Add authorized Yjs transport and named presence with bounded durable updates,
   recovery and access withdrawal. Choose one provider implementation after a
   small Yrs-vs-existing-Node-host trial; do not start multiple collaboration servers.
4. Route agent editing through scoped draft operations and Mastra; let the agent
   work while people converse. Exact review of a shared/published revision remains
   separate from ordinary draft edits.
5. Qualify representative DOCX/ODT/PDF exports, offline image/font resolution,
   comments/suggestion behavior, failed export recovery, reload/conflicts, current
   access after member removal and keyboard/phone editing. Measure startup/idle/
   active editing on the actual Surface; source reading is not that measurement.
6. Add the canvas/browser-worker surface only after it advances that real journey.
   Keep native Vercel agent-desktop v1.0.2 for explicitly permitted local windows;
   shared isolated computers remain a separate backend qualification.

Research method: Exa discovery across editor, collaboration/canvas, harness,
browser/tool UI and Material motion questions, followed by actual primary
licenses, manifests and selected implementations at the recorded revisions.
Search excerpts and stars alone did not determine selection. Reference clones
remain outside the product; no dependency or donor source is copied in this pass.
No new app UI, live collaboration, Office export, model integration or deployment
is claimed by this document.
