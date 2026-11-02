# Aksara as a resident colleague

2 November 2026, Asia/Bangkok. Research and implementation plan, not a runtime
migration or a claim that the proposed recovery paths are enabled.

## Recommendation

Adopt dsh-superagent's resident-front / task-worker operating model. First qualify
Mastra's installed durable-agent path as the sole owner of the live agent loop.
Keep Pi's existing tested knowledge task until a deliberate consolidation; do not
wrap an entire Mastra loop in Pi and describe that as per-tool durability.

Use the existing authoritative store per custody for identity, tasks, permissions, source
dependencies, intents and receipts. Runtime snapshots are replaceable execution
state. Keep Rust's existing point-of-use fences while making its low-level
workflow concepts less prominent in everyday interaction.

## Sources actually inspected

- [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype/tree/6337fc823ce20251c8de8085948165c81aaa701e),
  MIT, commit `6337fc823ce20251c8de8085948165c81aaa701e`, committed 31 October.
  Inspected README, LICENSE, package manifest, philosophy, authorization,
  execution/deployment/architecture docs, `src/core/intake.ts`, ticket predicates,
  `src/executor/dsh.ts`, `src/app/effects.ts`, store/outbox, main-session tools,
  prompt composition and source admission context. No donor code or DSH packages
  installed in Aksara.
- [Mastra durable agents](https://mastra.ai/docs/harness/durable-agents), plus the
  installed `@mastra/core` 1.80.0 durable-agent, storage and recovery interfaces.
  Both docs and installed declarations warn about recovery replay and delegation.
- [Pi Durable](https://github.com/earendil-works/pi/tree/7b991fd96aee530b2ecfb5327f6c82d197f36395/packages/durable),
  MIT. Current default-branch SHA checked 2 November; npm `pi-durable` 1.5.0 was
  published at 10:58:39 UTC that day. Aksara still installs 1.0.2. Installed README,
  existing adapter and earlier persisted-loop probe were checked. No upgrade or
  compatibility claim for 1.5.0 is made here.
- Cult UI source at `d71b1428b811c2779d46ea41b7ef8c9f9c9991c2`:
  `onboarding.tsx`, `intro-disclosure.tsx`, `wizard-expandable.tsx`; current
  [Onboarding](https://www.cult-ui.com/docs/components/onboarding) and
  [Intro Disclosure](https://www.cult-ui.com/docs/components/intro-disclosure)
  documentation. This is component study, not a new source import.

Exa surfaced 22 search results across four queries, 19 distinct returned URLs.
That is discovery volume, not 22 fully audited sources. The primary source/code
reads above support the conclusions. The broader Super-agent article was seen
through a secondary adaptation; the released repository is the implementation
evidence. Its README explicitly distinguishes the prototype from the article and
from a production DeepSeek product.

## What dsh contributes

The strongest transferable pattern is a front session that stays available while
each accepted job gets a worker session and directory. Incoming events are stored
once, related threads feed the appropriate worker, and results return through an
outbox to the original conversation. Jobs that need a person take precedence in
the panel. Healthy work stays quiet. The Engine mutates its domain in transactions;
adapters perform queued work after commit.

Its restart mechanism resumes assignments with context and instructions to inspect
the worktree, git history and remote state before repeating actions. It is not
evidence of exactly-once execution of every shell command. The effects queue can
retry a handler after a crash between delivery and settlement. Stable operation
identities and destination-side deduplication or reconciliation are still needed.

Do not copy its trust assumptions wholesale. Execution docs say commands run
without approval as the operator's OS user. A separate working directory is not
a separate OS security boundary. The main session can call a settings-save tool;
its description requires a human configuration request, but that description is
not a separately verified authorization proof. Aksara must keep changes to rights,
public release and protected device access outside model self-authorization.

## Where Aksara stands

| Capability | Current implementation | Missing for the resident model |
| --- | --- | --- |
| Interactive front and worker | Actual Mastra tool loop; one interactive and one background slot; source-linked saved results | Durable worker mailbox, completion wake-up of the front session, independent task contexts and managed worker lifecycle |
| Recovery | Canonical turns, claims and receipts persist; completed duplicate turns do not invoke the provider again | Mid-loop checkpoints, fenced attempt recovery, tool-by-tool uncertainty reconciliation |
| Channels | Tested normalized admission/binding port; shared web conversations | Live Telegram/WhatsApp adapters, persistent delivery outbox, verified cross-channel identity bindings |
| Computer | Qualified Linux Vercel driver against a permitted private window, durable intents and delivery status | Isolated shared execution environments, real Windows qualification, transfer of finished artifacts from remote workers |
| Memory | Eligible source-backed knowledge/MCP projection, reviewed excerpts, provisional procedures | Scoped compaction, procedure revision/deduplication and evaluated reuse; no unpartitioned global memory |
| Proactivity | Work can be delegated while the person continues talking | Persisted schedules/subscriptions, bounded event admission, quiet notification policy |
| Hosting | Native local stack; optional development host profile | Continuously available production node, enrollment and secure remote access |

The live code uses `Agent.generate()` inside `packages/workbench/server.mjs`.
It does not yet use `createDurableAgent`. Pi's product adapter durably executes
a scoped retrieval/proposal task; it is not the live front agent. Closing the
browser differs from closing the host. A Surface that is asleep cannot supply
always-on compute; an office node or remote host can serve the same thin client.

Background runs currently also check the admitting web session; logout and
session expiry fence them. A resident team worker needs a separately admitted,
revocable task mandate and execution identity. Detaching a browser should stop
observation without cancelling that authorized job. Explicit cancellation, revoked
rights and expired task authority must still stop new execution. Do not solve
this by retaining a browser cookie forever or falling back to an owner account.

## Mastra and Pi: one owner for the loop

Mastra already supplies a durable wrapper, background/evented execution,
observe/reconnect, snapshots and recovery APIs. Its default event cache is
in-memory; persistent workflow storage and explicit snapshot/recovery policy are
additional configuration, not consequences of calling the wrapper. Recovery can
repeat model/tool calls. Replaying a delegation can repeat its entire worker.
Per-call closures may not survive recovery, so authority must be rebuilt through
host-owned ports using serializable identifiers.

Pi is a complete durable harness, not merely a scheduler. Installed 1.0.2 commits
tool intent and distinguishes interrupted ordinary tools from explicitly
`replay: safe` tools. It offers a coherent future replacement if its model,
compaction, worker and storage behavior better fits the qualified workload.
Switching would require porting scoped credential access and egress as well as
the loop. Putting one opaque Mastra generation inside a Pi task leaves a crash
window across all the internal model/tool steps and adds another state owner.

The new `research/resident-2026-11-02/probe-mastra-durable.mjs` completed a scripted
model → tool → model cycle through installed `createDurableAgent`: two model calls,
one tool call, answer 42. It uses **InMemoryStore**. This confirms API compatibility,
not disk persistence, crash recovery, live model access or institutional safety.
Its compatible fixture emits SSE because durable `generate` drains a streamed
loop. The earlier ordinary-generator JSON fixture is insufficient for that path.

## Qualification before enabling recovery

1. Persist a run binding to the canonical task, actor, institution, audience,
   revision/generation, provider consent and actual read dependencies. Store
   credential references, not credential values or authority-bearing closures.
2. Add explicit recovery admission to Rust's execution-claim protocol. Claim an
   execution attempt with a fence; don't bypass the existing claimed-turn guard.
   Rebuild each tool port from current authority and stop stale executions.
3. Configure one local persistent workflow adapter. Runtime state needs an
   identified owner, migration/backup rules and restricted access, without a
   second institution/identity database. Do not expose its replay cache directly
   to arbitrary clients.
4. Revalidate source and memory eligibility before recovered context reaches a
   model. A checkpoint or summary cannot preserve access to withdrawn content.
   Reconcile uncertain computer/network effects before invoking another action.
5. Kill after a committed tool result, after delivery but before receipt, during
   child work, and after permission/source revocation. Verify no duplicate effect,
   no stale private context, one front notification, and an inspectable recovery
   outcome. Run the same bounded scenario through Pi if Mastra fails the needed
   behavior. Measure memory/startup on the target machine before ranking cost.

## Small resident architecture

Reuse current task/run identities rather than adding dsh's entire Ticket,
Assignment and policy domain beside ours.

```text
Web / verified messaging / explicit routines
                 ↓
     durable inbox and task routing
                 ↓
        Aksara front conversation
                 ↓
      task worker with its own context
                 ↓
   permitted tools / execution environment
                 ↓
       artifacts and delivery outbox
                 ↓
         original conversation
```

Rust checks identity, grants, dependencies, budgets and receipts at the boundary;
the model chooses its plan within that envelope. Start with deterministic trigger
deduplication and routing for explicit replies/mentions; ask the front model only
when interpretation is needed. Do not call an LLM on every poll or bot event.

Use a small runtime interface: start, steer, observe, cancel and recover. Keep
channel delivery and execution environments replaceable. Independent workers get
their own durable run IDs; the parent receives a compact, source-linked result,
not their whole transcript. A database outbox supplies at-least-once delivery;
retries require stable destination keys or reconciliation.

Proactivity begins with explicit routines and subscriptions. Let people describe
them in ordinary language; compile their permitted scope once and retain the
authorization separately from retrieved content. Drafting in the granted work
area can proceed freely. Sending externally, changing rights or controlling a
physical device follows the relevant scope. An AI command reviewer can advise;
it cannot replace a sandbox, least-privilege credential or current grant.

A watchdog should first use deterministic leases, deadlines and liveness checks.
Use a model for ambiguous stalled work within a budget. It must not repair a
failure by expanding privileges or disabling source/approval checks.

## Communities and institutions

One recognizable Aksara should serve several separately scoped conversations.
Verified channel bindings connect the same person across deployments, while
audience and source permissions decide what that conversation can recall. Avoid
copying every private person-note into a workspace-wide router prompt.

A useful acceptance scenario: staff request meeting follow-up in a shared room;
Aksara acknowledges once, a worker reads only that room's eligible notes, saves
a cited document/spreadsheet, and returns one artifact message to the room. A
duplicate messaging event creates no second job. Restarting the worker preserves
progress; withdrawing a note invalidates its use. A restricted personnel file
remains absent. The UI works from a phone while compute stays on the office node.

The same mechanism can support grant monitoring, preparation of public notices,
and device-status checks. Public release remains a distinct authorized action.
Procedural learning starts as versioned source-linked drafts in the proper scope;
test reuse before promoting a procedure. This requires no new ontology or memory
daemon in the default installation.

## UI direction accepted for the next pass

The first dialog concept is the selected direction. Use Cult's headless
`Onboarding` state/choice/navigation primitives inside the existing accessible
Base UI dialog, with Motion transitions. Our current `WizardExpandable` already
comes from Cult, but its expandable toolbar is a poor fit for this first-run flow.
`IntroDisclosure` supplies a useful desktop-dialog/mobile-sheet reference; its
feature-tour content, Next Image dependency and saved-dismissal behavior should
not be confused with real connection verification.

Keep setup to connection choice, authorization and a real first reply. Advanced
model choices unfold when needed. The footer stays reachable; skipping means
exploring, not a working connection. Dismissal restores the page and draft that
were open. Credentials remain on the host.

Home should keep its open, sentence-like interaction. Combine date/context into
one quiet line; use one shorter heading and a borderless input immediately below
it. The field gains space when someone writes, rather than reserving a large chat
box. Put the provider/context affordance inline. Show one genuine acknowledgement
after admission and one path to the continuing thread. Use a compact needs-you /
working summary and a collapsed week glance; custom panels follow at useful
density. Compact Home drops the hero and full calendar.

On mobile, replace the always-visible five-item dock with a small **Spaces**
trigger that opens labeled, 44 px circular destinations above the input. In a
thread it shares the composer's bottom row; elsewhere it can float. Keep Aksara's
own launcher meaning consistent: talk to Aksara. A radial menu should not require
long press, hover or remembering unlabeled icons. Keep decorative gooey filtering
off text, focus outlines and hit targets. Respect reduced motion, safe areas,
virtual-keyboard changes, focus restoration and unsent drafts. Close the fan after
navigation without closing the conversation or changing custody implicitly.

These UI changes are specified here, not implemented by this research pass.
