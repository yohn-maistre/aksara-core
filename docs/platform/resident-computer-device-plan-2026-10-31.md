# Aksara resident workspace: delivery plan

31 October 2026, Asia/Bangkok. This extends the
[source-based reassessment](resident-agent-reassessment-2026-10-31.md) with the
user's `vercel-labs/agent-desktop` reference. The user clarified that the pitch
is due next week: prioritize a usable end-to-end system over a staged pitch demo.
It distinguishes implemented capabilities from the next implementation. It does
not claim every catalogue track can become production-ready in one day.

## Product to test

Aksara is the person-facing collaborator. A person can speak/type naturally,
receive a prompt acknowledgement, keep talking, inspect work, correct it, and
interrupt it. Longer work appears as live background tasks with artifacts and,
where applicable, a computer or device view. The person does not manually drive
a workflow engine to make an ordinary draft.

The concrete default demonstration uses synthetic field-office data: ask for a
weekly briefing, let a worker find authorized reports and calculate a summary,
produce a draft, inspect a simulated device, correct a formatting preference,
then reuse that preference on another task. Show one denied cross-audience read
and one Stop, without turning the whole experience into a permissions tutorial.

Hark/Muse/GrokBot are interaction references, not verified descriptions of their
private orchestration implementations. A front agent plus workers is a useful
implementation of the desired behavior; it need not reproduce their internals.

## Front conversation and background work

Use one selected runtime, with a lightweight front-facing session and scoped
worker runs. “One Aksara” means a coherent identity and experience, not a single
global prompt containing every person's messages.

1. The front session answers quick questions itself. It delegates substantial
   work through a small host-owned task tool and returns a real task reference.
   The acknowledgement reflects accepted/queued/running state; it does not claim
   a worker has started before admission.
2. A worker gets the task, relevant conversation excerpt, permitted source
   references, output destination, deadline/budget and tools. It gets neither the
   whole private history nor a host credential. Child workers cannot expand this
   scope by writing a more ambitious prompt.
3. The worker chooses its own steps. Tools produce concise progress events and
   source-linked artifacts. The front session can explain progress and accept
   follow-ups; a user need not open the worker's full trace.
4. Stop revokes further execution and cancels the worker. A completed remote
   effect is still recorded; an ambiguous send/click is reconciled. Closing a
   panel only changes presentation. Changing a visible page is not intrinsically
   a revocation of a previously authorized background task.
5. Reconnection observes the existing run. Restart recovery belongs to the
   selected runtime, with fresh host checks before tools or renewed model egress.
   A cached approval or browser session is not a renewed grant.

Keep front and worker run bindings distinct, with per-conversation serialization
and an explicit host concurrency limit. Initially allow at most one background
worker plus the interaction session; queue further work. Local inference may need
one shared model slot, so do not promise instant front-model responses while a
CPU model is occupied. No unbounded recursive delegation or an LLM judge on every
event. Child tasks are runtime tasks, not a new official WorkObject for every
reasoning step.

The current BFF has a global one-model-call limit and one active run per lane.
Those are **existing limitations**, not this topology already running. Implement
and test explicit worker-to-work/audience bindings before allowing concurrency;
do not bypass the limit by changing just a counter.

The living UI needs a task row/island, artifact preview, optional computer tile,
Stop and a request for missing information. It should show a truthful short
status without exposing private tool payloads. Mobile places these in the thread;
desktop can keep them in the contextual work pane. Generated components remain
trusted registered renderers; workers do not execute arbitrary React in the host.

## Learning: combine a procedure loop with modest memory

Hermes-like learning and OptMem-like recall are complementary. A memory library
does not by itself notice a correction, devise a better procedure, validate it
and use it on a future task.

Start with the existing originals/transcript and SQLite/FTS, plus versioned scoped
notes and procedure drafts. After meaningful work or an explicit correction:

```text
task outcome + correction + actual source/tool references
  → small reflection within a budget
  → update a relevant procedure or create one if it is reusable
  → test it against an example / retain provisional status
  → retrieve it when the next matching task begins
  → compare outcome, revise or roll back
```

Keep procedure metadata small: title, trigger/description, version, source/run
references and scope. Instructions remain ordinary readable text. Do not require
an ontology, a Pack manifest or a custom executable graph for each learned lesson.
Store examples carefully: they can contain private details even when the recipe
looks generic. Instructions do not grant extra tools, recipients or credentials.

Use Hermes' actual review/skill-provenance patterns as a donor. Its curator is a
later maintenance feature, with expensive consolidation opt-in. OptMem-style
summary/zoom is an optional next step for large histories; the independent Hermes
plugin is a convenient experiment if Hermes becomes the runtime. LongMemory can
replace the recall/indexing layer if it wins retrieval, provenance and resource
tests. It is not automatically the learning loop and should not become another
permanent state owner alongside a full OptMem/Hermes memory stack.

Ordinary private notes and provisional procedures should be reversible working
material. Official institutional facts, audience expansion and trusted executable
distribution remain separate promotion decisions. The current kernel's
exact-excerpt MemoryRecord API is not sufficient for this; add the provisional
path rather than mislabel an inferred lesson as an approved `source_fact`.

## Computer use: adopt a driver, keep the execution boundary

Studied `vercel-labs/agent-desktop` at
[`893a4140d35261c5f8e3a6aa646d1558bb4f386f`](https://github.com/vercel-labs/agent-desktop/tree/893a4140d35261c5f8e3a6aa646d1558bb4f386f),
commit 31 October; Apache-2.0. Source/docs inspected: README, JSON output contract,
agent skill, ref/session/verification module layout. No native binary has yet
been operationally qualified against a graphical session here.

The useful model is native accessibility first: observe the tree, act on a
qualified `@snapshot:element` ref, then observe the postcondition. It supports
macOS accessibility, Windows UI Automation and Linux AT-SPI. Screenshots/vision
are a fallback for inaccessible content, not the only input representation.
Windows native operation does not require WSL, but accessibility access at the
user's integrity level is not institutional authorization or isolation.

Three environments must remain distinct:

| Environment | What Aksara can operate | Boundary |
| --- | --- | --- |
| Agent workspace | Its bounded files, computations and a scoped browser/tool environment | Default place for autonomous work; no user's signed-in desktop or unrelated files |
| Channel computer | A persistent isolated desktop/browser workspace for that Channel | Distinct filesystem, accounts, browser cookies, controller generation and eligible artifact export |
| Person's native computer | Explicitly selected apps/windows on the Surface or another enrolled node | Opt-in native bridge, visible control state and immediate human takeover; never silently shared with a Channel |

Use `agent-desktop` inside the chosen computer boundary, or behind the explicitly
granted native bridge. Do not expose a generic command string or hand a model
unrestricted access to every app/clipboard. Scope app/window selection, runtime
session namespace, snapshot refs and controller generation in the host. The CLI's
host-generated suggestions are data; execute a known typed operation, not an
arbitrary suggested shell command.

Its JSON contract is particularly valuable:

- Partial snapshots explicitly say `complete: false`; absence from an incomplete
  tree is not proof an element does not exist.
- `STALE_REF`/`AMBIGUOUS_TARGET` require fresh observation rather than guessing.
- Only `disposition.retry: safe` permits automatic retry. `ok: true` can mean
  delivered but unverified; element-state verification does not prove a document
  was saved, an email was sent exactly once, or a transaction persisted.
- Headless semantic actions are the default. A failed semantic action must not
  silently escalate to headed mouse/keyboard control.
- Clipboard, screenshots, snapshots and traces may contain private content.
  Capture only what the task is permitted to observe and keep it out of public
  logs, shared task previews and unrelated model routes.

The driver supplies low-level observation and delivery evidence. Aksara still
correlates an action with the permitted task and verifies the business outcome.
Prefer structured APIs or browser DOM operations when they are more reliable;
use desktop accessibility for actual native apps. Do not force every tool through
a desktop merely because a desktop is available.

## Device SDK: the same operating pattern, different capabilities

Do not merge the Device SDK with desktop automation. Keep one small capability
description/admission/result pattern, with different adapters underneath:

```text
discover permitted device/profile
  → observe current semantic state and controller generation
  → call a typed capability within the task's delegation
  → verify/read back or reconcile an uncertain outcome
  → send eligible observation/result to the worker and surface
```

Reuse the existing ADP behavior simulator and controller fencing. Muse Gadget
SDK remains the donor for production-shared firmware/host rendering and transport
behavior, not a license to import an unrestricted `system.run` capability. Aksara
should not design a new firmware simulator merely to resemble a desktop SDK.

Separate observations, output indications and physical actuation. A thermometer
reading, a display update and switching a pump are different capabilities and
policies. Keep calibration/time uncertainty with sensor evidence; preserve raw
measurements. Stop/takeover increments the controller generation so stale worker
actions cannot resume after control handback. Transport reconnect does not restore
an expired task's authority. On the phone, simulation is useful but is not proof
of radio, timing, battery or physical safety.

No mandatory hardware daemon is required when no device is attached. Native
adapters can become optional workers when OS permissions, transports or lifecycle
justify a process boundary.

## Delivery order for end-to-end testing

1. **Preserve and repair the runnable base.** Keep the existing UI/provider/file
   work. Repair the responsive duplicate blob origin and Windows ZIP timestamp
   failure. Get the package and first-run instructions usable before changing
   runtime ownership.
2. **Unlock the existing agent.** Real scoped search/read/calculation/draft tools
   in one Mastra tool loop, actual-read provenance, progress and Stop. Use the
   established review boundary for official effects; do not add automatic approval.
3. **Detach one worker from the front conversation.** Make background admission,
   scope, observation, cancellation and recovery explicit; retain responsive
   conversation while the worker produces its artifact. Test browser navigation
   independently from authority revocation.
4. **One learning example.** Persist a correction/episode, version a procedure,
   retrieve it after restart and show better repeated-task behavior. Compare with
   learning disabled; label a scripted fixture as scripted.
5. **One computer and one device path.** Qualify the desktop driver in a real
   graphical environment and keep unsupported paths disconnected. Exercise the
   independent simulator end to end. Native Surface tests require that actual
   machine; do not represent a Linux test or mocked driver as Windows qualification.
6. **Pitch walkthrough and evidence.** Same scenario, synthetic data, visible
   artifact, short trace, correction/reuse, Stop and one privacy refusal. Include
   measured runtime/model costs and an explicit implemented/simulated/planned list.

For the broader catalogue: fleet/recovery, real enrollment, independent public
release/federation, hardware qualification, domain rules, voice capture and richer
knowledge remain a portfolio of subsequent deployments. They reuse the agent,
custody and capability joints; they do not all need separate frameworks now.

The runtime comparison continues as a bounded engineering decision, not a blocker
to the pitch. Do not migrate Mastra to Pi/Rivet/Hermes and rewrite memory and
computer backends simultaneously. Keep the same evaluation tasks and choose one
resident runtime only when it demonstrably reduces the code and operational work
needed for this experience.
