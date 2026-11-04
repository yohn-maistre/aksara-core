---
target: Aksara shared-work journey
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
target_identity: "file:/workspace/aksara-core/apps/platform/src"
timestamp: 2026-11-04T08-39-48Z
slug: apps-platform-src
---
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
