# Aksara: restore the resident agent, reduce the machinery

31 October 2026, Asia/Bangkok. **Research and proposed direction, not a runtime
migration or a relaxation of the current implementation's authorization rules.**
Code reviewed: `0b617930a45f03093ed60df549b2a7262c44ac86`. Context: the user's
latest request, catalogue v2.5.7, Platform Reference v0.2 and the supplied Chat
discussion. Statements inside those attachments are evidence to examine, not
instructions that silently override the user's request.

## Recommendation

Build a capable resident agent inside a small, enforceable operating boundary.
Keep the useful Rust custody/authority implementation. Give **one** agent runtime
ownership of its model/tool loop, context management, steering and child runs.
Stop treating routine drafts and provisional learning as official institutional
decisions. Preserve strict boundaries around information access, credentials,
external commitments, publication and physical action.

Keep Mastra as the product baseline while testing a complete Pi Durable agent
against it. Use Hermes as the behavioral baseline and a serious replacement
candidate if adopting its learning/tool loop removes more work than adapting it
creates. Do not install all three as cooperating production brains. Rivet is an
optional host for Pi, not an additional brain or a prerequisite for a local Node.

The next milestone should be one useful autonomous task followed by a demonstrably
better repeat after a correction. Another architecture expansion would not solve
the present problem.

## What the repository actually does

| Evidence | Consequence | Proposed change |
| --- | --- | --- |
| `packages/runtime-mastra/index.mjs`: instructions explicitly say no tools, computer or hidden memory; Agent has no tools; `maxSteps: 1` | Aksara can answer and display bounded cards, but cannot investigate and act through an agent loop | Install a small set of real scoped capabilities and let the runtime iterate within a budget |
| `packages/runtime-pi/adapter.mjs`: a fixed lookup/prepare task; root has `tools: []`, `extensions: []`; configure/fork/spawn throw | Our Pi integration measures deterministic task durability, not Pi's resident-agent behavior | Test the full donor harness before writing another orchestration layer |
| `crates/kernel/src/memory.rs`: every candidate must be an exact source excerpt, carry `source_fact`, and be approved before retrieval | Even the labels `procedural` and `episodic` currently describe reviewed quotations, not learned procedures or an agent's own experiences | Add scoped provisional notes/episodes/procedures; retain review when promoting a claim to authoritative knowledge or broadening its audience |
| `crates/kernel/src/platform.rs`: each model request delegates a WorkObject; a claimed provider invocation is not automatically repeated | A useful anti-duplicate alpha fence also prevents ordinary resident-run recovery | Let the runtime own model attempts; keep a WorkObject for meaningful user work and durable effect admission for consequential actions |
| Same file: hosted turns reject selected Library sources; context is bounded to 32 KiB | A frontier model cannot currently do ordinary source-grounded office work; this is an explicit privacy floor, not an inference limitation | Introduce user-configured provider/data rules and scoped egress consent; never simply remove the exclusion |
| `packages/workbench/server.mjs`: one admitted model turn across the host, 180-second timeout | Independent people/channels block each other; long work cannot continue naturally | Configurable host admission budget, per-conversation serialization, queue/backpressure and observable cancellation |
| `packages/gateway/computer.mjs`: qualified provision/observe port; no product command dispatch; 128 MiB isolated-container limit | Computer contracts exist, but the product does not yet have an operating computer; that budget is not a browser-desktop qualification | Qualify one real execution environment, with a measured resource profile; avoid making every shell step an official approval |
| Personal/community databases, fresh eligibility, original bytes, lineage, effect idempotency and receipts are implemented | There is valuable protection and working data to preserve | Keep these properties and their regression tests during any runtime change |

The trusted kernel implementation is roughly 2,362 lines across its six Rust
source modules at this revision, excluding types, service and tests. It is not a
vast enterprise platform. The larger problem is the allocation of responsibility
and friction, plus a very broad future specification. Many proposed services,
graphs, ontology engines and workflow systems have **not** been built; removing
them from the default plan is different from deleting deployed code.

The catalogue already contains the right corrective principles: §1.4 requires
upstream-first substitution that removes redundant code; §2 calls P1 a modular
monolith and specifies receipts for **consequential** work. Platform §5.2 says
ordinary indexing need not approve every snippet. Our next implementation should
realize those distinctions rather than interpret every write as a ceremony.

## What to simplify

### Give the runtime its ordinary job

The resident runtime owns planning, model/tool rounds, continuation, interruption,
compaction, retries, child execution and its internal transcript/checkpoints. The
trusted host supplies the currently permitted resources and tools. Aksara should
not implement another planner, cognitive scheduler, compactor, task graph and
session engine alongside the selected donor's equivalents.

Keep a readable, portable transcript/export and institutional work/artifact IDs.
Do not synchronously duplicate every donor checkpoint into a second canonical
agent state machine. Maintain a small durable run-to-work binding where necessary;
reconcile its cross-store failure cases explicitly. Runtime events can project
into Today and work history without making each event a new institutional object.

Keep the runtime adapter small: submit, observe, steer/stop, recover and optional
features we actually use. Do not emulate forks, multi-runtime migration and every
upstream capability merely to satisfy an interface. MCP belongs at external tool
interoperability boundaries; an in-process typed capability call need not make an
MCP/ACP/A2A/Connect/WIT round trip. Do not introduce those transports until a real
consumer needs them.

### Authorize useful work once, enforce its boundary continuously

For example: “Research public sources, read this project's approved files, create
drafts in this workspace, use this model up to the configured budget, and stop
after two hours.” This should allow autonomous steps within that scope. A host
checks the effective capability at each operation without repeatedly interrupting
the person. Reaching a new resource, recipient, cost limit or privilege asks for
an extension. A changed membership or withdrawn source invalidates further use.

| Action | Proposed ordinary behavior |
| --- | --- |
| Search permitted material; calculate; inspect a simulated sensor; create an agent-private draft | Execute within the delegation, with bounded resource use and traceability |
| Edit a scoped working document; revise a local learned procedure | Version it, preserve its source links, show the result and allow undo; no separate official approval merely for being a draft |
| Send externally, publish, spend, alter a system of record, change host settings or actuate a device | Evaluate the actual recipient/resource/risk against policy; ask for exact approval when no applicable delegation already covers it |
| Broaden audience, use a new provider/data class, change privileges or install host code | Explicit authorization at that boundary; a skill or prompt cannot grant it |

This is a proposed policy change, not an instruction to call today's `approve`
API automatically. The current code has no general delegated-autonomy policy.
Implement the narrow policy path and tests before allowing a tool to bypass the
present review flow. Risk is determined from typed operations and actual
resources, not the model declaring an action “safe.” A sandbox containing a
signed-in browser or unrestricted network can still send messages, leak data or
spend money; sandboxing alone does not authorize those effects.

Physical indication and hazardous actuation should not inherit one undifferentiated
policy. Sensor reading, ordinary document work, a financial transaction and a
clinical action have materially different consequences.

### Let Aksara learn without declaring every thought institutional truth

Keep one evidence foundation and distinguish status and audience:

- Episodes and private working notes can be recorded automatically under their
  actual scope. Preserve uncertainty, corrections, retention and source links.
- A learned procedure is a versioned `SKILL.md` and optional supporting files.
  The agent may propose, test and improve it in its own workspace. A Skill does
  not need to become a Pack, plugin, service or signed host installation.
- Shared official knowledge and broadly distributed executable procedures need
  the appropriate promotion/release decision. Recording an observation is not
  endorsing it; successful execution is not proof of a general factual claim.

Use existing SQLite/FTS and ordinary source-linked files first. Search memories
on demand; keep a small working digest. Add one summary hierarchy only if recall
tests justify it. Do not adopt OptMem, LongMemory, Hindsight, Cognee and Graphiti
together. Ontology remains an optional Library/domain projection, not a required
language for everyday reasoning.

The host must capture actual source reads. A summary or learned skill inherits
the eligible audience and dependencies of its inputs; an LLM's claim that it
“generalized” a lesson is not permission to move private information into a shared
skill. Recheck derived inputs on retrieval, recovery and egress. Avoid one
unpartitioned memory/personality file absorbing every person's private context.
One recognizable Aksara can be implemented with separately scoped conversations.

Automatic learning also needs a budget, deduplication, version history and a way
to disable/undo a bad change. A useful test repeats a task with and without the
new procedure. Counting newly created Markdown files does not demonstrate learning.

## Current building blocks, checked against source

Activity window: 24–31 October 2026. The [source ledger](research/resident-2026-10-31/source-activity.json)
records 26 repositories, commit hashes, dates, releases and license metadata.
Dates in the comparison are Bangkok dates; the ledger retains raw UTC values.
`pushed_at` alone is not treated as recent default-branch development. A recent
commit establishes activity, not quality, release stability or hardware fitness.
Repository-wide release tags can describe another package in a monorepo.

| Building block | Verified recent evidence | Fit and limit |
| --- | --- | --- |
| [Hermes](https://github.com/NousResearch/hermes-agent/commit/adecc4024456b387b1518813b90bd60c82b51287) | Default-branch commit 31 Oct; latest listed release v0.22.5, 23 Oct; MIT | Most complete behavioral reference here: tools, session search, learning review, skill management, channels. Adopting it can save substantial learning/tool work, but its private state, tools, memory and credentials must not bypass Aksara custody |
| [Pi Durable](https://github.com/earendil-works/pi/tree/35dfa757378bd7a8570670e99c2687bdd1039a06/packages/durable) | Commit 31 Oct; released v1.4.0 on 22 Oct; MIT | A full persistent agent harness with tool tasks, steering, forks, child work, compaction and watchers. Our installed version is 1.0.2. Still experimental; HEAD has substantial **unreleased** API/storage changes. It is not Hermes-style learning out of the box |
| [Mastra](https://github.com/mastra-ai/mastra/tree/ba602f5f4622d6a3e6beb6d2741e3d19efe57ca9) | Commit 31 Oct; core 1.80.0 released 28 Oct, already installed | Existing viable baseline. AgentController, tools/workspaces and durable execution could replace our custom session machinery. Apache-2.0 outside `ee/`; selected EE features have separate terms. Persistent threads do not imply persistent live permission grants |
| [Rivet Agents](https://github.com/rivet-dev/agents/tree/e963879702cf40ccf5be71e8be970626413dd28a) | Commit 29 Oct; v0.5.4, 27 Oct; Apache-2.0 | `@rivet-dev/pi` **already embeds Pi Durable** in Actors. Useful for hosting many keyed residents, realtime clients and sleep/wake. Adds deployment/storage decisions; not required for a local Pi harness |
| [Rivet engine](https://github.com/rivet-dev/rivet/commit/3ddc9ef69a0e1a8eafed549f605d4827d6eca25d) | Commit 31 Oct; v3.0.0-preview.4, 30 Oct; Apache-2.0 | Hosting infrastructure, not an agent or an institutional policy engine. Current production self-host docs require control-plane instances/disks, a bucket and nodes; local development is simpler |
| [Monty](https://github.com/pydantic/monty/tree/66fff6bfdfa65d3966633ebc9da77057d5d2b3e8) | Commit 31 Oct; 1.4.0, 26 Oct; MIT OSS package | Small code-composition capability. No ambient filesystem/network/process authority; explicit host functions and limits. A language sandbox, not a full computer or an OS security boundary; its host callbacks run with host authority |
| [nanobot](https://github.com/HKUDS/nanobot/commit/8b37976d36c2812c62b464321e729a88872b60f9) | Commit 31 Oct; v0.4.0, 28 Oct; MIT | Useful simpler-Python comparison. Actual code includes a tool loop, skill loader and git-backed memory/dreaming. The present implementation is substantially more than a tiny historical demo |
| [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw/commit/1c1cd118ac536a1dd1bc79b9cce69cbdc04e4f29) | Commit 30 Oct; v0.8.7, 28 Oct; Apache-2.0 metadata | Rust/edge replacement candidate if it removes the Node/Python host for a target deployment. Binary/idle-memory advertising is not an Aksara end-to-end benchmark |
| [Deep Agents](https://github.com/langchain-ai/deepagents/commit/3a217cec7183b601f2b33e0144e09bb50ad44f01), [PydanticAI](https://github.com/pydantic/pydantic-ai/commit/39269caf0a4e2dbc5846ff796191c42a4736735a), [Goose](https://github.com/aaif-goose/goose/commit/b23d21cabd9b4de0c045dcdd731821a3a15c2bfc) | Default-branch commits 30/31 Oct | Credible active alternatives/specialist donors. No evidence from this review warrants adding another full framework to the baseline |

Moltis is a credible complete Rust-agent candidate. Its checked commit/release is
24 October in Bangkok (23 October UTC), within the defined week; its container/
platform dependencies still require qualification before adopting it. LongMemory and Letta
last checked default-branch commits are 18 October; original OptMem is 31 July.
That does not make them bad or abandoned. It means they must not be advertised as
newly active within this particular window. IronClaw, PicoClaw and smolagents have
recent repository push timestamps but older returned default-branch commits;
their activity needs finer branch/tag verification before making the same claim.

### Important corrections to the pasted discussion

The discussion correctly identifies our underused Pi integration and excessive
platform scope. It should not be treated as a measured runtime ranking.

1. **Mastra is not inherently a one-shot wrapper.** Both installed Pi and installed
   Mastra completed a model/tool/model mechanical probe during this review. A
   migration is not necessary merely to enable tool use.
2. **Rivet and Pi can be one composition.** Comparing them as interchangeable
   agent brains obscures what each owns. Do not add Rivet Workflows and Mastra
   Workflows beside Pi tasks unless a specific operation needs an additional
   orchestrator and its ownership is clear.
3. **Durability does not mean exactly-once effects.** Pi defaults interrupted
   ordinary tools to an error rather than blindly rerunning them; `replay: safe`
   permits repetition. Durable task phases can repeat too. Mastra explicitly
   warns recovery may repeat tool calls and whole delegated subagent steps.
   Remote actions still require stable operation identity and reconciliation.
4. **Learning defaults matter.** Hermes' curator auto-prunes eligible agent-created
   skills, but its LLM consolidation is off by default. Its documentation says a
   full consolidation can take 50–100 API calls. Copy the scoped, reversible
   learning pattern, not an assumption that continuous background review is free.
5. **The Rivet skills example is discovery, not self-learning.** Its supplied
   skills ship with the worker and cannot be edited by the agent. Mutable,
   evaluated procedures still need an implementation.
6. **OptMem's Hermes plugin is real but independent.** The checked plugin is
   v0.3.3 at `2868af6`, dated 2 Oct, with manual compaction unless configured
   otherwise. Upstream OptMem has no detected license in GitHub metadata; source
   reuse needs its actual terms verified. The plugin has its own MIT license.
7. **Native Windows Hermes now exists.** Current docs support a Windows 10/11
   source installation without WSL; the MSIX route specifically requires Windows
   11 22H2+. Neither claim establishes Surface Pro 3 resource use or sandboxing.
8. The pasted claim of months of successful Hermes/A12 operation is not a
   measurement obtained in this session. The user has mentioned Hermes on PRoot;
   retain real logs/measurements rather than treating the pasted narrative as a
   benchmark result.

OpenClaw is an active and valuable donor, but its official
[multi-user](https://docs.openclaw.ai/concepts/multi-user) and
[trust-model](https://docs.openclaw.ai/gateway/security/trust-model) documentation
explicitly warns that shared operation does not establish hostile multi-user
isolation. An agent able to read other sessions or share signed-in accounts is
not the same as communal Aksara. Use the behavior, preserve independent audience
boundaries, and do not import permissive defaults as policy.

## Do we need the Rust kernel?

**We need its responsibilities. Rust itself is optional. Retaining this small,
tested implementation is currently cheaper than reproducing it elsewhere.**

Keep identity/audience resolution, original source custody and provenance,
eligibility/revocation, reviewed official changes and releases, durable effect
identity/outcomes, and physical controller fencing. Do not make this host own an
LLM's planner, every scratch-file mutation, a universal ontology, or a second
runtime scheduler. “Custody and authority host” is a better description of the
role than an operating-system kernel.

An actor's key is not an authenticated principal. A runtime's thread owner is not
proof of institution membership. A successful tool return is not independent
verification of a remote effect. These distinctions remain necessary with Hermes,
Pi, Mastra, Rivet or a single TypeScript application.

The kernel currently has development identities, fixed alpha policy and Operator
review. Keeping it is not a claim that production IAM, named institutional rights
or arbitrary multi-tenant execution are complete. Nor is a Rust process an OS
sandbox for a Python/Node tool that has unrestricted filesystem access.

Only replace the Rust implementation when a contender demonstrably eliminates
maintenance while preserving those properties and existing data. Language
consolidation alone does not unlock the missing agent loop.

## A smaller operating shape

```text
PWA / CLI / channels / voice / devices
                  |
      authenticated scoped interaction
                  |
        ONE resident agent runtime
     tools, skills, context, child work
          /                    \
 scoped working environment    custody/authority host
 drafts, local procedures      sources, access, official records
 bounded computation           consequential effects and release
          \                    /
          eligible results and work events
                  |
          Today / Library / threads
```

The working environment cannot read the host database, credential files or other
audiences directly. Typed read tools fetch permitted content. Credentials stay in
the trusted broker; network destinations and authenticated browser actions remain
part of the granted scope. Mount only the working files needed for that context.

Use the runtime's code-composition facility if it meets our limits. Pi Code Mode
already uses a restricted QuickJS/WASM environment at current upstream. Monty is
an alternative for Python expression/tool composition, not an obligatory second
interpreter. Full shell/browser/computer tasks need an actual isolated backend;
an ordinary subprocess or PRoot directory is not that isolation.

For the 8 GB Surface, keep the local base small and use a remote isolated computer
if needed. Do not claim a managed sandbox works offline. For a Linux office Node,
one scoped container/VM is a reasonable first computer; for native Windows, qualify
an available OS/remote boundary before exposing broad local shell access.

Rivet becomes useful when independently sleeping residents, many realtime clients
or fleet placement eliminate host lifecycle work. Its developer mode is not proof
of a production offline appliance profile. Direct Pi + SQLite needs no Rivet
control plane. Do not add a distributed actor cluster just to host one agent.

## Keep the ecosystem, remove it from the critical path

| Area | Small useful implementation | What waits |
| --- | --- | --- |
| Resident/runtime/models | One full tool loop, scoped credentials, visible progress, stop/steer, a budget | Multiple simultaneous orchestration frameworks; a bespoke planner |
| Memory/Library/ontology | Originals, eligible search, provisional episodes, procedures, corrections | Graph services, universal ontology and multiple permanent memory engines |
| Workbench/mobile/files | Existing PWA, live work events, drafts and existing file viewer/editor | Another UI rewrite, Expo/Electron/Tauri without an OS requirement |
| Tools/MCP/Skills/Packs | Direct typed tools plus MCP where needed; progressive skill discovery | A universal executable plugin platform before the first useful agent |
| Personal/community/channels | Separate custody, audience-bound conversations, one supported transport | Automatic private-to-shared learning or one global memory/session |
| Computer/hardware/voice | One isolated computer; existing simulator; optional voice worker | Broad native host administration, hazardous actuation and always-on recording |
| Strata/Ruara/public work | Independent public service and deliberate release boundary | A2A federation and distributed public commitments before local usefulness |
| Archive/Adat/clinic/learning/science/field | Domain-specific evidence and rights where the task requires them | Mandatory ontology/approval DAGs for ordinary office tasks |
| Fleet/install/recovery | One usable package, backup/recovery and measured host health | A mandatory cluster, appliance updater or enterprise service topology |
| Bio/research hardware | Separate research program | Making research tracks prerequisites for shipping the resident agent |

This preserves the 28-track vision as a portfolio, not 28 launch dependencies.
OpenDots/OpenMuse remain useful computer/session/control donors. OpenDuet remains
a surface/proactive-interaction donor. Nightly OpenBot remains a product reference;
the previously studied source is PolyForm Noncommercial and is not a general
Apache-compatible code donor. Do not transplant those whole applications around
our existing UI and call the resulting duplication consolidation.

## The next evidence should decide the runtime

Use the same suitable model, inputs, permitted tools and budgets. A scripted model
can exercise failure semantics; it cannot decide which agent reasons best.

1. Research an office/field problem from eligible Library and public material;
   calculate something, recover from a tool error and create an inspectable draft.
2. Correct a concrete procedure, end the session, restart, then give a related
   task. Compare performance with the learned procedure enabled and disabled.
3. Interrupt/steer while working; kill the worker after a destination acts but
   before its return is stored. Reconcile rather than repeat or claim success.
4. Run a shared Channel beside a private thread. Try malicious retrieved text,
   an old browser observation and a revoked source. Verify no audience crossover,
   privilege escalation or invalid recovered context.
5. Disconnect WAN; measure which installed local capabilities remain useful.
   Measure total idle/active RAM, CPU, startup, token/tool cost and latency on the
   actual Surface and A12. Separate model weights, browser, sandbox and host costs.

Keep Mastra's existing model integrations during this small qualification. If Pi
delivers equal behavior with less custom lifecycle code and clearer recovery,
promote it and retire redundant Mastra/old Pi task plumbing at a reconciled
boundary. If Mastra wins, use its full runtime and retire Pi as a default
dependency. If Hermes removes the custom learning/tool system at acceptable
integration cost, select it instead. No automatic checkpoint migration or three
resident engines in the default package.

Acceptance should include an interaction budget: routine permitted work requires
no additional approval clicks; an unauthorized outward action produces a clear
request or refusal. Independence and useful completion matter alongside denial
tests. Freeze another round of catalogue expansion until this is demonstrated.

## Evidence collected and practical limits

Tavily and Parallel Search supplied discovery and official-document checks after
Exa's connection returned a credit-limit error. Primary GitHub metadata, pinned
source and official runtime/security docs ground the findings; search snippets
and the pasted Chat discussion are not treated as verified implementations.

Read the [probe instructions and results](research/resident-2026-10-31/README.md).
Both installed runtimes completed a scripted two-model-call/one-tool-call task.
Pi also returned the same settled submission after SQLite reopen with no new
tool/model call. No paid provider, actual autonomous reasoning, learned-skill
improvement, hardware benchmark or head-to-head resident comparison is claimed.
Rivet was studied, not installed or operationally benchmarked.

Representative upstream implementation files inspected:

- Pi: durable README/CHANGELOG, agent/tool configuration and recovery code,
  execution-environment boundary, tool-recovery tests and Code Mode docs.
- Hermes: background review prompts/routing/guards, skill provenance and management
  guards, curator implementation/docs and native Windows guide.
- Mastra: harness/controller/durable-agent docs, session ownership behavior and
  license boundary; installed tool API used in the probe.
- Rivet Agents: `packages/pi` exports/package and architecture/Pi/Skills docs;
  Rivet engine self-host, authentication and workflow retry/rollback documentation.
- nanobot: agent memory/skill implementations; OpenDots computer tool admission
  and OpenMuse backend isolation checks at the earlier recorded source pins.

Earlier implementation checkpoint: Linux/ARM CI at `0b61793` passed. Native
Windows authority and source-launcher steps passed, but the ZIP assembly failed
on an npm file timestamp before 1980; the extracted bundle has not qualified.
A desktop assistant source was also observed hidden by duplicate shared-layout
origins across responsive docks. Those are concrete packaging/UI follow-ups,
not evidence that a new runtime or architecture is required. This reassessment
does not silently mark them complete.

## Key primary references

- [Earendil: Pi Durable](https://earendil.com/posts/pi-durable)
- [Pi durable source at the checked revision](https://github.com/earendil-works/pi/tree/35dfa757378bd7a8570670e99c2687bdd1039a06/packages/durable)
- [Mastra AgentController](https://mastra.ai/docs/harness/agent-controller)
- [Mastra durable-agent recovery caveats](https://mastra.ai/docs/harness/durable-agents)
- [Rivet Pi integration and limitations](https://rivet.dev/agents/docs/pi/)
- [Rivet self-host control plane](https://rivet.dev/docs/deploy/self-host/control-plane/)
- [Hermes curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator)
- [Hermes native Windows](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native)
- [OptMem Hermes plugin](https://hermes-agent.nousresearch.com/docs/plugins/optmem-hermes)
- [Monty security model](https://pydantic.dev/docs/monty/concepts/security/)
- [OpenClaw multi-user boundaries](https://docs.openclaw.ai/concepts/multi-user)
