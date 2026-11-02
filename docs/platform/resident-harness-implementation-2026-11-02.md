# Durable Aksara and a compact workspace

Implementation begun 2 November 2026; checked 3 November (Asia/Bangkok). This
implements the Mastra-first direction selected after the [resident-colleague
review](resident-superagent-review-2026-11-02.md), whose live-code descriptions
are superseded here.

## Agent execution

The workbench wraps its live Mastra agent with `createDurableAgent`, using one
host-owned Mastra instance and an on-disk LibSQL workflow store. The interactive
agent can delegate one finite background task and remain available for another
conversation turn. Setup has an optional task-model choice on the **same
connection**; otherwise the worker uses the conversation model. Workers inherit
admitted audience, source dependencies and hosted-source consent. They cannot
recursively create workers or switch providers themselves. Saved working
documents and verified results return to the originating thread and Library.

Rust remains authoritative for identity, lane, work, dependencies and effects:

1. Canonical admission precedes execution. A local job projection stores context
   coordinates and execution state, never host tokens or browser cookies.
2. After a crash, the host reconstructs configured identity and credentials,
   rechecks input and current dependencies, then acquires a new execution epoch.
3. Stale executors cannot read another step or commit output. Revocation, changed
   policy, cancellation and expired budgets prevent resumption.
4. The persisted tool journal returns completed matching results. Pending delivery
   is uncertain: stop for inspection instead of blindly repeating it. Operation
   identity and arguments are bound together.
5. Completed replies are staged before canonical delivery. A staged reply can be
   delivered after restart without another provider call, under current authority.

This is qualified crash recovery, **not exactly-once execution at every failure
boundary**. Interrupted provider requests may recur. Uncertain tools need
inspection/reconciliation, not an assertion that nothing happened. Callback
closures and credentials are reconstructed. Snapshots contain eligible prompts
and tool results and must remain private even though credentials are excluded.

`resident.sqlite` and `workflows.sqlite` live under the host's provider-state
directory. Unix files are owner-only; Windows uses the launcher's owner ACLs.
CLI backups export a selected canonical Rust database, **not** credentials or
workflow checkpoints. Snapshot retention, full-state restore and production
multi-host coordination are not implemented.

Bounds remain one interactive and one background slot per workbench, eight
agent steps, twelve journaled tool calls, three minutes per interactive run and
ten minutes per worker, measured from initial admission. Restart does not reset
the deadline. This is not an unbounded job queue. Explicit stop/logout/cancel
can terminate work; normal shutdown currently aborts active runs. A stopped or
sleeping Surface cannot provide always-on compute: use an office node or server.

## Workspace

First use opens a two-step connection dialog adapted from Cult's actual
onboarding source, with Base UI dialog semantics, stable footer, bounded body,
reduced motion and Explore first. Closing preserves the originating page/draft.
The local seen flag is a display preference, not proof of sign-in or enrollment.
Only a completed test turn verifies inference. Safe failure categories now appear
on failed work. Account model discovery and explicit hosted consent remain.
Direct keyless OpenCode is unavailable pending its required runtime integration.

Home keeps a flat line input, shorter title and expandable calendar. Library,
Channels and capabilities no longer display an unrelated chat composer. Phone
chat uses the main screen, smaller message padding and grouped sender labels.
Activity is a switchable view. Spaces shares the composer row and opens labeled
navigation with Escape/focus handling. Outside chat, Spaces and Aksara are small
floating controls; a second dock no longer competes with the input.

Normal scrollbars are hidden; forced-color mode retains them. Scroll edges mask
actual authorized content instead of blurring a duplicate. Focused controls are
not masked. Existing solar atmosphere and Motion remain; no extra motion engine.

## System One seam

`decisions.mjs` defines an optional injected adapter for task complexity, memory
relevance, notification value and privacy-review flags. It accepts bounded
eligible state and typed probabilities, abstaining without an adapter or on
malformed output. Memory review preserves the supplied visibility and requires
review. No score grants access or publishes memory. This is a tested port,
**not an installed Jev model or an active memory classifier**.

[Jev-Mem](https://arxiv.org/html/2609.23986v1) and
[Releasing the Inner Jev](https://arxiv.org/abs/2610.17205) support studying cheap
structured decisions separately from answer generation. Jev weights are not a
dependency here; research benchmarks are not Aksara measurements.

## Product reference study

Exa helped find product walkthroughs; primary docs and code supported technical
checks. These were text/transcript reads, not a visual audit of videos or a
controlled comparison of search engines.

- [Muse design](https://introducing.muse.ai/): ongoing conversation, concurrent
  work, side conversations, generated files and selective updates.
- [Muse security](https://research.meta.ai/blog/security-and-safety-for-ai-agents-our-approach-with-muse):
  isolated agent computers; our selected local window is not equivalent to a VM.
- [Muse hands-on](https://www.theverge.com/tech/993391/meta-muse-ai-hands-on) and
  [walkthrough](https://www.youtube.com/watch?v=2ocXTWgzZk8): connection friction
  reinforces verified setup and retry paths.
- [Grok Bot overview](https://docs.x.ai/grok-bot/overview),
  [guide](https://x.ai/bot/guides/grok-bot-101) and
  [hands-on transcript](https://www.youtube.com/watch?v=ezANo2RNryU): persistent
  conversations, delegation, visible computers and explicit local/cloud context.

No commercial product code, branding or screenshots were copied.

## Qualification and limits

Linux fixtures actually kill the native host during delegated work and restart
it: Mastra resumes under epoch two and produces one saved artifact. Other checks
cover worker-model choice, credential exclusion from snapshots, uncertain replay,
stale attempts, withdrawal, Codex completed/incomplete SSE, onboarding and phone
navigation. Inference fixtures are synthetic HTTP traffic; the user's ChatGPT
account still needs a live retest.

Private native computer tools still require a local model and a finite window
permit. Hosted screen egress, isolated shared desktops, real Windows GUI actions
and cloud computer provisioning are not enabled here. Telegram/WhatsApp remain
ports without live account adapters. Schedules, event wakeups, front-agent
completion wakeups, production enrollment, rich LongMemory, public sharing and
Strata delivery remain separate gates. Existing reviewed memory/wiki/people and
read-only MCP remain the shared authorized memory surface.
