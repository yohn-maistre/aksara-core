# Abstraksi / Aksara Open-Core Systems Catalogue

**Version:** 1.0.0  
**Date:** 4 October 2026  
**Status:** P1 implementation baseline  
**Supersedes:** v0.9 architectural decisions. v0.9 remains the research archive and provenance source where this document does not repeat historical deliberation.

> **Abstraksi builds open communal-intelligence infrastructure, operates and deploys it for real institutions, and turns the same substrate into focused products and public knowledge systems.**

---

# 0. Aksara in 60 seconds

Aksara is an **open, local-first communal intelligence runtime** for institutions, teams, communities and places.

Humans interact with one persistent Aksara through web, voice, messaging, email, physical surfaces and local devices. A fast **Interaction Plane** handles presence, short answers, clarification and delegation. Deeper work runs durably in a **Work Plane** and appears to users as shared Threads. A small Rust **Authority Plane** owns identity, audience, institutional state, memory policy, WorkObjects, approvals, Capability Leases, evidence, receipts and recovery.

```text
people / rooms / channels / devices
               │
               ▼
      InteractionRuntime
 answer · ask · delegate · pass
               │
        ┌──────┴───────┐
        │              │
    inline/local     Thread
                       │
                 Pi Durable + Pi AI
                       │
       Library / Packs / Computer / tools
                       │
                       ▼
              Aksara Rust kernel
 identity · audience · memory · policy · work
 evidence · leases · effects · receipts · sync
```

The institution persists even when models, runtimes, processes, channels or networks disappear. External frameworks implement replaceable ports; **Aksara owns institutional meaning**.

P1 is a production-shaped public-alpha foundation, not a disposable demo.

---

# Table of contents

1. Company and product contract  
2. Architectural invariants  
3. System map and deployment profiles  
4. Trusted kernel and contract boundaries  
5. Identity, audience and conversation lanes  
6. Interaction runtime and channels  
7. Threads, WorkObjects and durable work  
8. Resident cognition and cognitive durability  
9. Institutional workflow durability  
10. Memory  
11. Library  
12. Graphs, attention and derived projections  
13. Extensions: Plugins, Packs, Skills and Capabilities  
14. Workbench  
15. UI, views and surface protocols  
16. Computer and external-system bridges  
17. Voice and realtime media  
18. Device SDK  
19. Hardware and deployment profiles  
20. Networking and offline continuity  
21. Gateway, federation and sharing  
22. Model ecology and bounded decisions  
23. Observability, evals and governed improvement  
24. P1 implementation architecture  
25. P1 acceptance program  
26. P1 decision register  
27. Build order  
Appendices: object mapping, donor ledger, deferred/watch register, migration notes, legacy fixtures, provenance archive

---

# 1. Company and product contract

Abstraksi is an **open-core infrastructure company building communal intelligence systems**. Aksara Core is the open communal substrate; managed deployments, operations, support, fleet services, focused products and qualified hardware bundles are commercial layers around it.

Aksara is not primarily a proprietary appliance, a generic agent harness, a token reseller, a vector database or a chatbot. Commodity models, agent runtimes, plugins, computers and device SDKs are inputs. The durable value is the coherent system that turns them into **shared, governed, local-first institutional intelligence**.

Primary commercial lines remain:

- managed deployment and integration;
- managed control plane/fleet operations;
- support, maintenance, recovery and operator training;
- qualified deployment bundles using commodity/refurbished compute;
- focused products such as Aksara Science built over the same substrate;
- future contributor/data-collection and governed asset-sharing networks.

**Hardware doctrine:** infrastructure first, identity second. Use existing servers, refurbished Tiny/Mini/Micro PCs and commodity radios/controllers whenever they satisfy the deployment. When Abstraksi sells hardware, the visible system may carry a coherent Aksara industrial identity without requiring custom compute silicon.

**Competitive doctrine:** localize the frontier rather than worship novelty. Similar capabilities will commoditize. Taste, execution, trust, localization, field reliability, language support, institutional fit and operational responsibility remain defensible.

---

# 2. Architectural invariants

These are stronger than implementation choices.

1. **Institution > model.** The institution persists; model and agent processes are disposable.
2. **One Aksara.** Users do not meet separate online/offline/voice/channel assistants. Capability degrades; identity does not.
3. **Authority below cognition.** A model may propose. The kernel authorizes effects.
4. **Conversation is not memory.** Persistence passes through the Memory Firewall.
5. **Library is not memory.** Documents may be searchable without their claims becoming accepted institutional facts.
6. **Raw evidence is preserved.** Parsed text, embeddings, graphs, summaries and wiki pages are derived and rebuildable.
7. **Audience is explicit.** A shared room, group chat, private DM and public surface are different information boundaries.
8. **Effects are receipted.** Consequential work uses prepare → authorize → commit intent → execute → verify/reconcile → receipt.
9. **Runtime objects are not institutional objects.** Pi Conversation, tool task, browser session or LiveKit room never silently becomes canonical Aksara state.
10. **Local operation is real.** A Node retains an offline floor for identity, Library, interaction, queued work and approved local capabilities.
11. **Open standards first.** Prefer Agent Skills, Agent Plugins, MCP, A2A, AG-UI, A2UI, OCI/ORAS, W3C WoT and OpenSharing where they solve interoperability.
12. **New capability without new sovereignty.** New projects implement ports, donate patterns, become Packs/Plugins, or remain research candidates.
13. **P1 is a modular monolith.** Add process/service boundaries only for security, language, hardware or lifecycle reasons.

---

# 3. System map and deployment profiles

## 3.1 Three operational planes

```text
                         AKSARA
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
  INTERACTION PLANE     WORK PLANE      AUTHORITY PLANE
   immediate / live      durable/deep      sovereign
          │                │                │
 voice · room · web      Pi Durable       Rust kernel
 WA · Telegram · SMS    Packs / tools      Cedar
 email · Card           Computer           leases
 surfaces               research           Memory Firewall
```

**Interaction** asks: what should Aksara do or say now?  
**Work** asks: how should this task continue?  
**Authority** asks: may this happen, what can be seen, what persists, and what counts as institutional state?

## 3.2 Deployment profiles

- **Existing infrastructure / hosted:** web/channel-first Aksara on existing servers.
- **Node Core:** local compute, storage, inference, sync queue and trust anchor.
- **Node + Physical Endpoints:** Node serving room/public Presence and Information surfaces.
- **Node Complete:** supported integrated appliance composition.
- **Existing compute + Physical Endpoints:** reuse installed infrastructure while adding room/public embodiment.
- **Targeted Card:** principal-bound portable interaction/approval/capture/private-handoff endpoint.
- **Commons/federation:** institutions participating through ETNOS, A2A and governed sharing.

Standard Node baseline remains **32 GB RAM / ≥512 GB NVMe** on qualified x86-64 Tiny/Mini/Micro-class hardware. **64 GB Node+** targets larger local models, concurrency and heavier workers; voice alone does not require 64 GB.

---

# 4. Trusted kernel and contract boundaries

## 4.1 Trusted services

```text
aksarad
  canonical institutional state and invariants

aksara-execd
  leases, idempotency, governed invocation, receipts

aksara-hwd
  device registry, physical I/O and hardware mediation

aksara-updated
  signed appliance lifecycle and recovery
```

The trusted nucleus stays small. It owns semantics that must not drift with agent-framework updates.

## 4.2 Contract stack

**Normal cross-language services:** Protobuf Editions + Buf + ConnectRPC.  
**Bounded capability ABI:** WIT + WebAssembly Component Model + Wasmtime.  
**Agent/tool interoperability:** MCP.  
**Independent agent federation:** A2A.  
**Frontend event/state stream:** AG-UI.  
**Declarative generated UI:** A2UI with Aksara's trusted component catalog.  
**Distribution:** OCI artifacts + ORAS + cosign/Sigstore.

## 4.3 Device wire protocol

Freeze the **semantic** Aksara Device Protocol and its versioning/idempotency rules. Do **not** yet freeze CBOR versus Protobuf/nanopb. P1 benchmarks both on the real MCU target and then records the wire-format decision.

## 4.4 Authoritative state

- SQLite/files remain the P1 canonical local state substrate.
- Institutional source artifacts retain original bytes and hashes.
- Ledger/outbox state is durable and inspectable.
- Graphs, vectors, summaries, derived wiki pages and runtime caches are projections.
- The `any/any-sync/anyrt` consolidation experiment is demoted to WATCH until actual sync pain justifies reopening the substrate.

---

# 5. Identity, audience and conversation lanes

A communal deployment is **not one shared login**. Individual humans authenticate independently into one institutional environment.

Core chain:

```text
InstitutionActor / Tenant
        ↓
Principal
        ↓
IdentityBinding(s)
        ↓
ConversationLane / Surface
        ↓
Actor + Initiator + Audience + Purpose
        ↓
AccessContext
```

An external Telegram ID, WhatsApp number, email address, Card or browser login is evidence/binding, not the canonical person object by itself.

`ConversationLane` is the interaction/history boundary. It remains separate from:

- execution isolation;
- memory scope;
- WorkObject state;
- Pi conversation IDs;
- provider-specific chat/thread IDs.

Shared audiences are resolved **before retrieval**. A group conversation cannot retrieve a private-DM memory merely because the same person initiated both.

---

# 6. Interaction runtime and channels

## 6.1 `InteractionRuntime`

Voice is not a separate assistant. All human-facing modalities normalize into one fast interaction contract.

```text
InteractionEvent
      ↓
AccessContext
      ↓
InteractionRuntime
      │
      ├─ ANSWER_INLINE
      ├─ DELEGATE
      ├─ ASK
      ├─ WAIT
      ├─ REQUEST_APPROVAL
      ├─ PRIVATE_HANDOFF
      └─ PASS
```

`PASS` is first-class: Aksara should not reply to every utterance in a room or every line in a group chat.

The Interaction layer may use a small local model, deterministic rules and local Library access. It should expose a deliberately small tool surface such as:

```text
library.lookup
thread.delegate
thread.steer
thread.cancel
thread.status
request.clarification
request.private_handoff
request.approval
session.control
```

Dangerous shell/browser/database mutation does not belong directly in the face model.

## 6.2 Channel gateway

**P1 primary donor/implementation:** Hermes Gateway-derived adapters.

```text
Telegram / WhatsApp / Slack / Teams / Matrix / Email / SMS / ...
                           ↓
                    ChannelGatewayPort
                           ↓
             IdentityBinding + ConversationLane
                           ↓
                    InteractionRuntime
```

Hermes session/profile/memory state is transport/runtime state only. OpenClaw contributes identity-link, scope and extension-manager patterns; Vellum contributes ingress/actor normalization patterns.

## 6.3 `DelegationEnvelope`

A delegation carries at least:

```text
thread/work reference
source session/lane
principal + audience
purpose
request
revision
allowed context reference
capability scope
idempotency key
optional deadline/cancel policy
```

WAN loss does not erase delegated work. It may move through `WORKING_LOCAL → BLOCKED_NETWORK → RESUME_ON_CONNECT`.

---

# 7. Threads, WorkObjects and durable work

**Thread** is the user-facing unit for meaningful delegated work. It is not a fourth sovereign state machine.

Internally, a Thread is an aggregate/projection over existing objects:

```text
WorkThread / ThreadView
├─ WorkObject ref
├─ ConversationLane ref
├─ resident runtime run/conversation ref
├─ artifacts
├─ sources
├─ activity
├─ approvals
└─ receipts
```

A Thread survives voice/session closure, channel switching, runtime restart and WAN interruption.

Typical states:

```text
HEARD
WORKING
BLOCKED
NEEDS_INPUT
AWAITING_APPROVAL
COMPLETED
FAILED
CANCELLED
```

Task updates carry separate projections:

```text
internal_context
workbench/display_safe_summary
speech_safe_summary
```

The interaction model should never receive protected internal details merely so it can redact them after the fact.

**WorkObject remains canonical institutional work.** Threads are how people experience that work.

---

# 8. Resident cognition and cognitive durability

## 8.1 P1 selected runtime

**P1 SELECTED:** Pi Durable + Pi AI behind `ResidentRuntimePort`.  
**P1 ALTERNATE:** Strands Harness SDK.  
**Pack runtime:** PydanticAI for Python-heavy typed/scientific workflows.

The choice is deliberately reversible:

```text
ResidentRuntimePort
  submit
  steer
  cancel
  watch
  fork
  spawn
  configure
```

Pi won the P1 bakeoff hypothesis narrowly because its hardest-to-recreate features align with communal Aksara:

- durable turns and tool tasks;
- commit/replay semantics;
- safe/unsafe tool replay behavior;
- request-id deduplication;
- crash continuation;
- forks;
- persistent/background subagents;
- multi-client watching and steering;
- materialized committed views;
- durable working documents;
- storage conformance tests.

Pi Durable remains young/experimental; promotion to long-term default requires the P1 crash + multiplayer fixture.

Runtime-object rule:

```text
Pi Conversation ≠ ConversationLane
Pi Task         ≠ WorkObject
Pi Document     ≠ MemoryRecord
Pi Extension    ≠ Pack/Plugin
Pi Tool         ≠ capability authority
```

## 8.2 Strands role

Strands remains a real alternate runtime and donor, especially for:

- Interventions: `Proceed`, `Deny`, `Guide`, `Confirm`, `Transform`;
- evals and trajectory testing;
- OTel semantics;
- structured output;
- Graph/Swarm patterns;
- MCP/A2A integration patterns.

Use Strands-style interventions as a **cognition gate**, not as institutional authorization.

## 8.3 Vellum / Flue / Mecatl

- **Vellum:** code donor for computer leases, stale-observation fencing, dynamic Skill→tool projection, ingress identity, concept-page memory UX and attention/notification signals.
- **Flue:** durability/runtime/channels/observability design donor; not a second resident durability layer.
- **Mecatl:** systems architecture reference for externalized state, leases, events, isolation and implementation discipline.

---

# 9. Institutional workflow durability

Cognitive durability and institutional durability are different jobs.

## 9.1 Cognitive durability

Owned by Pi Durable:

```text
model turns
streaming work
tool tasks
subagents
steering
forks
working documents
```

## 9.2 Institutional durability

Owned by Aksara WorkObjects plus a durable-workflow adapter:

```text
case
mandate
approval
deadline
procurement
publication
external submission
long-lived cross-system process
```

**P1 workflow candidate:** Duroxide.  
**Hosted/mature alternative:** Temporal.  
Restate/DBOS remain adapters/watch candidates.

The workflow engine never becomes the source of institutional meaning.

## 9.3 Effect lifecycle

```text
prepare
  ↓
authorize
  ↓
commit intent
  ↓
execute
  ↓
verify / reconcile
  ↓
receipt
```

Every tool/capability declares replay characteristics. Interrupted non-idempotent effects default to reconciliation rather than blind retry.

---

# 10. Memory

No single project is “Aksara memory.”

## 10.1 Canonical memory path

```text
ephemeral interaction
       ↓ async
MemoryCandidateCompiler
       ↓
Memory Firewall
  rules / provenance / scope / retention
  optional bounded decision model
       ↓
approved MemoryRecord
       ↓
rebuildable projections
```

The live interaction model does not decide persistence.

Independent dimensions remain:

- meaning/type;
- visibility/scope;
- data class;
- retention;
- event/valid/record/review time;
- provenance/evidence;
- confidence and contradiction status.

## 10.2 Multi-principal retrieval

```text
AccessContext
  ↓
MemoryViewPolicy
  ↓
eligible record IDs/scopes
  ↓
FTS/vector/graph/trigger search only inside eligibility
  ↓
MemoryView
```

Never “search everything then redact.”

## 10.3 Derived memory projections

- Graphiti temporal graph;
- continuity tree inspired by OptMem/TiMem/HORMA;
- associative Trigger Index inspired by T-Mem;
- human-readable concept/summary projections where useful.

These remain distinct from the Library hierarchy.

## 10.4 Memory decision models

Memory persistence is a good bounded-decision use case, but deterministic exclusions happen first. Hearsay, secrets, sensitive personal material and audience-restricted context retain provenance and policy semantics; a scorer cannot promote them into institutional fact by confidence alone.

---

# 11. Library

The Library is a first-class subsystem for institutional sources and derived knowledge. It is **not a monolithic RAG database**.

```text
RAW / VERSIONED SOURCES
          │
          ▼
   DocumentParserPort
          │
          ▼
 STRUCTURED DOCUMENTS
stable blocks / hierarchy / pages / assets
          │
   ┌──────┼───────────────┐
   ▼      ▼               ▼
 FTS5   vector       Library Graph
           │               │
   └───────┼───────────────┘
           ▼
    DERIVED KNOWLEDGE
 summaries · concepts · entities · wiki
 folder abstracts · overviews
           │
           ▼
     Retrieval Planner
           │
           ▼
 authorized evidence + citations
```

## 11.1 Canonical storage

- source bytes + hash + provenance: canonical evidence;
- SQLite: metadata/index state;
- parsed/normalized structure: rebuildable;
- summaries/wiki/vector/graph indexes: rebuildable.

## 11.2 Parsing

`DocumentParserPort` keeps the implementation replaceable.

P1 bakeoff/candidates:

- AnyDoc for fast/native conversion;
- MinerU for layout-heavy/scanned/mixed documents;
- Docling as typed-document alternative/reference;
- pdf-inspector for classification/routing;
- local OCR/VLM for restricted data;
- hosted OCR/VLM only through `EgressPolicy`.

Univer remains a candidate for editable Office artifact worktrees, not the Library parser.

## 11.3 Retrieval stack

**Required baseline:** SQLite FTS5.  
**Optional semantic baseline:** sqlite-vec exact/flat path; do not depend on alpha approximate indexes.  
**Long documents:** PageIndex local behind `LongDocumentIndexPort`.  
**Hierarchical navigation:** OpenViking-inspired L0/L1/L2 abstracts/overviews/details.  
**Derived wiki:** OpenKB-inspired summaries/concepts/entities/explorations, with Aksara provenance and policy.  
**Cross-document traversal:** SQLite Library Graph + neighborhood/PPR; HippoRAG2/Synaptic patterns are algorithm/eval donors, not persistent graph authorities.

## 11.4 Library Graph

Cheap retrieval topology only:

```text
Document
Section
Block
Folder
ConceptPage
EntityMention

PARENT_OF
NEXT_BLOCK
CITES
REFERENCES
MENTIONS
VERSION_OF
DERIVED_FROM
```

Do not put paragraph adjacency into Graphiti.

## 11.5 Search routing

```text
exact name / code / identifier
  → SQL / FTS5

ordinary natural-language retrieval
  → FTS5 + optional vector fusion

broad topic/navigation
  → L0/L1 hierarchy + derived wiki

one huge structured document
  → PageIndex

cross-document relationship
  → Library Graph PPR + Graphiti where institutionally meaningful

ambiguous case
  → runtime/model routing
```

Do not run a 2B model where FTS or SQL is sufficient.

---

# 12. Graphs, attention and derived projections

## 12.1 Graphiti

Graphiti remains the derived **temporal institutional graph**:

```text
Person · Institution · Role · Project · Policy
Decision · Case · Place · Evidence · Fact
```

It is rebuildable from authoritative records/episodes and does not own truth.

## 12.2 Library Graph

The Library Graph is separate, cheap and retrieval-oriented. It may be implemented in SQLite adjacency tables initially.

## 12.3 Continuity hierarchy

The memory Continuity Tree organizes institutional experience across time. It is **not** the same thing as the Library's folder/document hierarchy.

## 12.4 Attention / proactivity

Retire the `Irama` codename as a frozen primitive. Preserve the semantics with boring contracts such as `AttentionSignal` / `AttentionState`.

```text
calendar / sensor / task / external event / temporal condition
                     ↓
               AttentionSignal
                     ↓
     deterministic + bounded relevance logic
                     ↓
  preload | prepare | notify | delegate | PASS
                     ↓
              policy / audience
```

Vellum's typed notification signals are a strong implementation donor. Not every relevant signal becomes a user notification.

---

# 13. Extensions: Plugins, Packs, Skills and Capabilities

## 13.1 Vocabulary

**Extension** — umbrella term.  
**Plugin** — reusable technical extension/integration.  
**Pack** — coherent domain/application environment.  
**Skill** — reusable procedural knowledge.  
**Capability** — typed operation exposed to cognition/workflow.

Examples:

```text
Science Pack
  uses Zotero Plugin
  includes literature-review Skill
  calls search/document Capabilities
```

## 13.2 Portable package floor

Adopt **Agent Plugins 1.0.0** as the portable floor:

```text
plugin.json
skills/
mcp.json
```

Aksara-specific richness uses the reverse-domain extension namespace:

```text
dev.abstraksi.aksara/
  pack.yaml
  agents/
  screens/
  objects/
  graph/
  models/
  policies/
  runtimes/
  migrations/
  evals/
```

A Pack is therefore compatible where possible with other Agent Plugin hosts while carrying richer Aksara semantics when installed here.

## 13.3 Pack contents

A Pack may contribute:

- agents/runtime profiles;
- Skills;
- tools/capabilities;
- screens and view definitions;
- WorkObject/domain object types;
- ontology/graph extensions;
- deterministic DAGs/workflows;
- model requirements;
- libraries/datasets;
- device/instrument adapters;
- policy templates;
- migrations;
- evals.

**Graph Packs are removed as a separate installable concept.** Graph/ontology extensions belong inside the relevant Pack.

## 13.4 Capability classes

Replace the old `Observe / Interpret / Act` taxonomy with operational effect classes:

```text
read
  obtains state without intended external mutation

derive
  transforms/analyzes and produces candidate artifacts or judgments

effect
  changes external/institutional state
```

Orthogonal metadata carries what policy actually needs:

```text
read_only
idempotent
replay_safe
reversible
destructive
network_egress
authority_class
data_class
resource_envelope
validation_scope
```

## 13.5 Distribution

```text
Agent Plugin / Aksara Pack
        ↓
OCI artifact
        ↓
ORAS
        ↓
cosign / Sigstore
        ↓
Aksara install / trust policy
```

OpenClaw is the main extension-manager donor: manifest-first discovery, static metadata before code execution, lazy loading, health state, quarantine and `doctor`-style diagnostics.

---

# 14. Workbench

The Workbench is the **reference shared institutional experience**, not the moat by itself.

**Primary P1 code donor:** Dim0 / canvas-harness.  
**Lower-level mature reference:** tldraw.  
**Product-flow donor:** OpenDots.

Dim0 is valuable because it already combines an infinite canvas, rich notes, nested boards, persistent mini-apps/artifacts, code/document nodes, multiplayer and agent manipulation. Aksara should reuse/fork/adapt the useful UI machinery while replacing its agent runtime, memory, canonical persistence and sandbox authority.

## 14.1 Object/view separation

**Workspace objects:**

```text
Space
Document
Dataset
Artifact
Evidence
Notebook
BrowserSession
ComputerSession
WorkObject
ThreadView
```

**Views:**

```text
Canvas
Board
Table
Map
Graph
Timeline
DocumentView
ComputerView
Inspector
```

**Interaction primitives:**

```text
Approval
Form
Queue
Presence
Activity
Progress
```

A view is not the canonical object it renders.

## 14.2 User-facing grammar

The public product may simply be **Aksara**. “Workbench” is an internal/reference-client term.

Likely navigation primitives:

```text
Today
Threads
Library
People
Decisions
```

Spatial/canvas work appears where useful rather than forcing every task onto an infinite board.

---

# 15. UI, views and surface protocols

Aksara retains its semantic `SurfaceState` / `ViewPrimitive` layer above any frontend framework.

```text
institutional state
      ↓
Aksara Interface Contract
      ↓
objects + typed views + allowed actions
      ↓
AG-UI / A2UI / web renderer / MatrixUI / message renderer
```

## 15.1 AG-UI

**P1 SELECTED** for agent/runtime ↔ Workbench event and state transport where appropriate.

## 15.2 A2UI

**P1 SELECTED** for safe declarative generated interfaces with a constrained Aksara component catalog.

Arbitrary generated executable UI runs as a sandboxed candidate artifact; it does not bypass policy merely because an LLM produced it.

## 15.3 Deterministic visualization

Keep typed semantic diagrams and Flint-style semantic chart specs as useful patterns. Mermaid remains an explanatory fallback, not the institutional UI model.

## 15.4 MatrixUI and persistent surfaces

The 64×64/ambient visual grammar remains intentionally tiny. E-paper and other persistent displays receive only fully audience-authorized composed frames; sensitive information is never rendered first and redacted afterward.

---

# 16. Computer and external-system bridges

Aksara should conceptually possess governed browser/files/shell/computer capability without conflating conversation, memory and execution isolation.

## 16.1 Ports

```text
ComputerRuntime
  create/open persistent logical computer
  browser/files/shell/desktop operations
  snapshot/status/takeover

WorkAgentRuntime
  create bounded heavy-work environment
  materialize inputs
  run/checkpoint/suspend/resume
  export artifacts
```

The two may share an implementation but are not the same semantic contract.

## 16.2 P1 local isolation

**Production spike:** BoxLite.  
**Fallback:** Docker/gVisor or other qualified backend.  
**PRoot/dev:** `ProcessComputerRuntime`, explicitly unsafe and development-only.

BoxLite cannot gate mobile/PRoot development because it requires real virtualization/KVM on Linux. The same conformance fixtures run later against the production backend on a real Node.

## 16.3 OpenBot donor

Use OpenBot patterns for computer supervisor, browser/files/shell abstraction, live inspection, human takeover, audit and AG-UI separation. Do not inherit its coworker ontology.

## 16.4 Vellum automation lease

Generalize Vellum's lease pattern:

```text
ComputerLease
  principal
  lane/thread
  execution context
  observation_id / generation fence
  action budget
  idle deadline
  human takeover
  abort
```

A computer action based on a stale observation must fail and re-observe.

## 16.5 Execution escalation

Prefer the least invasive route:

```text
typed API/capability
   ↓
MCP/direct integration
   ↓
sandboxed program/CLI
   ↓
headless browser
   ↓
foreground computer
   ↓
human handoff
```

## 16.6 Browser verification

A click is not success. Consequential browser workflows declare postconditions such as `value_equals`, `element_exists`, `text_present`, `url_matches`, `list_count_delta` or domain-specific predicates, and emit expected/actual/evidence/trace/verification state.

---

# 17. Voice and realtime media

Voice is a make-or-break **interaction modality**, not a second cognition system.

## 17.1 Media/session plane

**P1 SELECTED:** LiveKit for WebRTC/session/media infrastructure where deployment permits.

```text
phone / browser / room / device
             ↓
          LiveKit
             ↓
    Aksara Voice Worker
             ↓
    InteractionRuntime
             ↓
   inline local or delegate
```

LiveKit does not own institutional memory, tools or authority.

## 17.2 Local voice architecture

Default P1 architecture is cascaded and auditable:

```text
mic
 ↓
VAD / turn handling
 ↓
streaming ASR
 ↓
InteractionRuntime / local face
 ↓
text response
 ↓
TTS
 ↓
speaker
```

This retains a canonical textual interaction/effect trail while allowing later audio-native/full-duplex models.

Initial model bakeoff, not architectural freeze:

- ASR: Qwen3-ASR 0.6B first, 1.7B/Whisper/MOSS references;
- local interaction model: Qwen3.5-4B no-thinking first, Qwen3.5-2B and Gemma 4 E2B challengers;
- local TTS: Pocket-TTS Indonesian vs sherpa-onnx/Piper Indonesian;
- live diarization: Nemotron 3 Diarization where compute/license profile fits;
- long-form/canonical post-session challenger: MOSS Transcribe-Diarize.

OpenLive is the primary local cascaded-interaction UX/code donor. Hugging Face speech-to-speech is a local realtime speech/runtime donor. Pipecat is the alternate orchestration/turn-detection runtime. DuplexOmni, Gemma duplex, MiniCPM-o and PersonaPlex/Moshi remain full-duplex research references.

## 17.3 Same Aksara, multiple tempos

The live face handles `LISTEN / WAIT / ACK / ANSWER / ASK / DELEGATE / STEER / CANCEL / HANDOFF / PASS`. Deeper work continues in Pi Durable and returns audience-safe progress to the interaction layer.

## 17.4 Room privacy

Diarization gives anonymous speaker evidence, not identity. Gathering/capture policy remains explicit. Room/public speech uses a `speech_safe_summary`; protected results route to private handoff rather than trusting the model to improvise redaction.

## 17.5 Long-term model opportunity

A strategically useful Abstraksi model is a compact **Aksara Interaction Model**, eventually trained/distilled for Indonesian, Papuan Malay, code-switching, local names, noisy rooms, interruptions and communal turn-taking. It is a much more relevant local-model target than training a generic “PapuaGPT” from scratch.

---

# 18. Device SDK

Introduce a first-class **Aksara Device SDK** shared by official physical devices.

Profiles:

```text
Node Controller
Presence Surface
Information Surface
Card
Sensor
Actuator
Instrument
Field Relay
```

## 18.1 Architecture

```text
MCU / Linux device
      │
Aksara Device SDK
      │
Aksara Device Protocol
      │
 USB / BLE / IP / Zenoh binding
      │
      ▼
  aksara-hwd
      │
      ├ identity / commissioning
      ├ registry / health
      ├ WoT descriptions
      ├ telemetry
      ├ OTA
      └ media bridge
      │
      ▼
 Aksara kernel
```

The Node Controller is just another profile, not a second agent runtime.

## 18.2 Semantic device boundary

Models request semantic operations such as `surface.indicate(approval-required)` or governed device capabilities. They never address GPIOs directly.

## 18.3 W3C WoT

Use W3C Web of Things Thing Descriptions as the interoperable external capability description for properties/actions/events/security/bindings where impedance remains low.

## 18.4 Zenoh

Zenoh/zenoh-pico is a candidate data plane for observations, presence, health and telemetry. It does **not** define Aksara device semantics. Commands/effects retain explicit governed operation paths and SQLite/outbox remains offline durable truth.

## 18.5 Media

Audio/video does not ride the ordinary control protocol. Devices advertise capture/playback capabilities and use a `MediaStreamPort` to bridge into local/LiveKit media paths.

## 18.6 Provisioning/security

Developer devices may use self-generated identities and physical-confirm pairing. Certified devices should support factory identity, signed firmware, Secure Boot/flash encryption where practical, rollback protection, local institution binding and revocation.

The Node/institution claims devices; an Abstraksi cloud account is optional, not the primary authority.

## 18.7 OTA and simulator

Signed local-first A/B OTA with health-check/rollback is the target pattern. Ship simulators for each device profile and an agent-readable `hardware/AGENTS.md` so coding agents can build, flash, monitor and test hardware consistently.

---

# 19. Hardware and deployment profiles

## 19.1 Node

Reference P1:

- refurbished qualified x86-64 Tiny/Mini/Micro PC;
- 32 GB RAM baseline, 64 GB Node+;
- ≥512 GB NVMe;
- Debian 13 appliance profile;
- independent ESP32-S3-class Node Controller;
- UPS/network qualification as deployment requires.

The Node can be headless. Physical presence comes from endpoints.

## 19.2 Presence Surface

Room-scale, low-latency embodiment: RGB/matrix/diffused light, microphone, speaker/earcon, mute/stop, privacy indicator and optional explicitly controlled vision.

## 19.3 Information Surface

Persistent public/shared information, likely e-paper in the reference prototype. It may also carry microphone/speaker/NFC/status indicator, but slow e-paper refresh is not used for realtime listening animation.

## 19.4 Card

Principal-bound portable endpoint for identity evidence, private handoff, approvals, capture, voice/haptic interaction and offline queueing. It normally relies on a nearby Node/Gateway for heavier cognition.

## 19.5 Product identity

Commodity/refurbished internals remain first-class. Abstraksi-sold hardware should still have coherent casing, labeling, interaction grammar and serviceability.

---

# 20. Networking and offline continuity

P1 hard requirement:

> A nearby authenticated user can still reach the Node when WAN connectivity is unavailable.

Connectivity ladder:

```text
internet channels
     ↓
ordinary LAN / aksara.local
     ↓
secure fallback Node Wi-Fi
     ↓
BLE local interaction where appropriate
     ↓
optional cellular SMS
     ↓
optional Meshtastic/LoRa degraded text
```

Fallback Wi-Fi is connectivity, not authorization. Prefer pre-provisioned or explicit physical activation, ephemeral credentials/QR/NFC and normal Principal authentication after joining.

**Meshtastic:** optional P1 showcase/field adapter, not a core acceptance dependency.  
**Reticulum/LXMF:** asynchronous/store-and-forward research reference.  
**Wi-Fi HaLow/OpenMANET:** medium-bandwidth field-network watch/prototype lane.

Offline degradation should look like reduced cognition, not a new assistant identity.

---

# 21. Gateway, federation and sharing

## 21.1 Northbound gateway

**P1 primary:** agentgateway.

Responsibilities include model traffic, MCP federation, A2A perimeter traffic, auth, routing/failover, budgets and observability. Exact institutional authorization remains below in Aksara.

Bifrost remains an alternate/provider-gateway reference. Smart model routing remains behind replaceable `model.route`/decision contracts.

## 21.2 A2A / MCP / ActivityPub

```text
MCP         agent → tool/resource
A2A         independent agent → agent task/artifact
ActivityPub public/social federation where ETNOS uses it
```

Public ETNOS publication remains an explicit boundary; private A2A work does not become public by default.

## 21.3 OpenSharing

OpenSharing is a promising cross-organization protocol for governed sharing of tables, volumes, Agent Skills and models through scoped credentials. Treat current AI-asset proposals according to their specification maturity.

Aksara may expose **approved** assets through OpenSharing; raw private institutional memory does not become shareable merely because a protocol adapter exists.

OCI/ORAS solves software/Pack distribution. OpenSharing solves controlled cross-organization asset access. Keep those jobs distinct.

---

# 22. Model ecology and bounded decisions

Aksara cognition is deliberately heterogeneous.

```text
deterministic typed code / rules
        ↓
tiny bounded decision model
        ↓
small interaction/local model
        ↓
resident/deeper reasoning model
        ↓
Gateway/specialist models
```

## 22.1 `DecisionModelPort`

Use bounded models for repeated fuzzy judgments:

```text
memory.persistence
memory.scope_candidate
retrieval.route
capability.route
model.route
reasoning.effort
browser.risk
computer.ambiguity
surface.compose
```

They propose typed decisions/probabilities. They do not grant authority.

Candidate ladder to benchmark on one Aksara-owned corpus:

- Bekko 17M / 68M / ~400M;
- Von ~395M;
- Strands Decider 2B;
- Clef-Flash 9B for multimodal Node+/Gateway cases;
- Clef 27B as Gateway/evaluator reference;
- Jev/OpenJev-class hosted/reference paths.

Never call a model when exact SQL/FTS/policy/state checks solve the problem.

## 22.2 Local interaction model

Freeze the role, not the weights. The local face should optimize responsiveness, natural interaction, clarification, delegation, Library use and simple local tasks rather than pretending to be a frontier reasoning model.

## 22.3 Graceful intelligence ladder

```text
L0 rules + physical controls
L1 local ASR/TTS + interaction model
L2 local Library + search + simple capabilities
L3 optional local deeper work model
L4 Gateway frontier models
L5 remote specialist/cluster workers
```

The same Aksara spans all levels.

---

# 23. Observability, evals and governed improvement

## 23.1 Telemetry

OpenTelemetry remains the interoperability floor. Pi's vendor-neutral telemetry contracts are attractive low-level plumbing; normalize Aksara traces so runtime changes do not break evaluation history.

The institutional ledger is not replaced by telemetry.

## 23.2 Evals

Strands Evals is a useful direct tool even when the resident runtime is Pi. Evaluate outputs, trajectories, tool use, sessions, Skills, safety and multimodal cases against Aksara fixtures.

Langfuse/Phoenix-class systems remain optional development/eval UIs, never sources of truth.

## 23.3 Governed capability evolution

Reef is a future code/reference donor for:

```text
trace/outcome
  ↓
evaluation dataset
  ↓
candidate Skill/prompt/router/model change
  ↓
isolated evaluation
  ↓
human/policy approval
  ↓
signed versioned artifact
  ↓
staged rollout / rollback
```

May evolve: Skills, prompts, retrieval/routing heuristics, Pack configuration, specialist adapters/models.  
May **not** self-modify: identity, authority, Memory Firewall, Capability Lease semantics, approval requirements, audit/security or data-sovereignty policy.

---

# 24. P1 implementation architecture

P1 is a **modular monolith** with a few justified sidecars, not a distributed-systems cosplay project.

## 24.1 Process shape

```text
Rust trusted host
  aksarad
  aksara-execd
  aksara-hwd
  aksara-updated

TypeScript application/runtime
  InteractionRuntime
  Pi Durable adapter
  Threads projection
  channels
  Workbench backend
  plugin/pack manager

Web
  Aksara reference client / Dim0-derived workspace

Optional sidecars
  Python Pack workers / specialist models
  Graphiti
  LiveKit
  ComputerRuntime backend
```

## 24.2 Repository strategy

Retain three first-party repositories unless implementation proves otherwise:

1. `abstraksi` — Aksara software monorepo: kernel, contracts, runtimes, Workbench, Device SDK/firmware, simulator and Packs.
2. `etnos` — public/federated product.
3. `aksara-hardware` — mechanical/electrical manufacturing truth; rename/migrate from stale `plakat-hardware` when convenient.

Suggested v1 monorepo direction:

```text
abstraksi/
├── Cargo.toml
├── pnpm-workspace.yaml
├── pyproject.toml
├── proto/
├── wit/
├── schemas/
│
├── crates/
│   ├── core-types/
│   ├── kernel/
│   ├── identity/
│   ├── lane/
│   ├── access-context/
│   ├── state/
│   ├── memory/
│   ├── library/
│   ├── graph/
│   ├── attention/
│   ├── policy/
│   ├── lease/
│   ├── ledger/
│   ├── outbox/
│   ├── capability/
│   ├── capability-host/
│   ├── device-protocol/
│   └── sync/
│
├── services/
│   ├── aksarad/
│   ├── aksara-execd/
│   ├── aksara-hwd/
│   └── aksara-updated/
│
├── packages/
│   ├── interaction/
│   ├── threads/
│   ├── runtime-pi/
│   ├── runtime-strands/
│   ├── channels/
│   ├── library/
│   ├── workbench/
│   ├── computer/
│   ├── ui/
│   ├── plugins/
│   └── sdk/
│
├── adapters/
│   ├── graphiti/
│   ├── gateway/
│   ├── a2a/
│   ├── opensharing/
│   ├── etnos/
│   └── systems/
│
├── python/
│   ├── sdk/
│   ├── models/
│   └── pack-workers/
│
├── packs/
│   └── science/
│
├── device-sdk/
├── firmware/
│   ├── node-controller/
│   ├── presence/
│   ├── information/
│   └── card/
│
├── apps/
│   ├── web/
│   ├── cli/
│   ├── simulator/
│   └── device-simulator/
│
├── fixtures/
├── evals/
└── docs/
```

Do not create a package merely because the tree looks lonely. Create it when a stable contract or second consumer exists.

## 24.3 PRoot development

The Android/Termux/PRoot environment is a legitimate architecture-seam test but not a production security environment. Use a dev `ProcessComputerRuntime`, mocks/simulators for hardware, SQLite/files, local web client and portable model stubs. Re-run the same fixtures later on a real Node with BoxLite, MCU and media hardware.

---

# 25. P1 acceptance program

P1 is complete when every major architectural seam has been exercised once, not when every research candidate has been installed.

## 25.1 End-to-end vertical slice

```text
authenticated Principal
      ↓
ConversationLane + AccessContext
      ↓
InteractionRuntime
      ↓
DELEGATE
      ↓
Thread / WorkObject
      ↓
Pi Durable
      ↓
Library lookup
      ↓
governed CapabilityRequest
      ↓
Rust kernel / lease / execd
      ↓
receipt
      ↓
Thread update
      ↓
AG-UI
      ↓
Workbench
```

Then deliberately kill components and repeat.

## 25.2 Required fixture families

**Runtime:** model-stream kill, safe-tool kill, unsafe-tool kill, restart, second client attach, steer, fork, cancel.  
**Identity/audience:** same person across web/channel, separate lanes, group/private isolation, room-safe rendering.  
**Memory:** hearsay rejected/attributed, accepted fact persists, projection rebuild.  
**Library:** raw→parse→block IDs→FTS; wiki traces to source; long-PDF retrieval; graph/PPR cross-document query.  
**Computer:** stale observation denied, human takeover, browser postcondition verification, denied network path.  
**Voice:** interruption, one-word response, Papuan Malay/Indonesian names, delegation/progress, WAN loss, private handoff.  
**Hardware:** privacy state survives Linux failure, deterministic button fast path, fallback local access, OTA rollback, simulator parity.  
**Extensions:** signed Pack install, Skill activation, selective tool projection, uninstall without kernel corruption.  
**Workflow:** long-lived approval/deadline state survives cognition restart.  
**Federation:** A2A private task + explicit public ETNOS publication gate + approved OpenSharing asset.

---

# 26. P1 decision register

Use only these statuses in the current register: **P1 SELECTED**, **P1 ALTERNATE**, **CODE DONOR / REFERENCE**, **WATCH / RESEARCH**, **DEFERRED**.

| Concern | P1 decision | Alternate / donor | Status |
|---|---|---|---|
| trusted kernel | Rust/Tokio + SQLite/files | — | P1 SELECTED |
| resident cognition | Pi Durable + Pi AI | Strands Runtime | P1 SELECTED |
| specialist Pack cognition | PydanticAI | Strands/plain Python | P1 SELECTED |
| cognitive durability | Pi Durable | Strands/Flue semantics | P1 SELECTED |
| institutional workflow durability | Duroxide adapter | Temporal | P1 SELECTED candidate |
| policy | Cedar | relation store/OpenFGA when needed | P1 SELECTED |
| capability lease | Biscuit/custom signed lease profile | — | P1 SELECTED candidate |
| narrow sandbox | Wasmtime/WASI Component Model | native sidecar | P1 SELECTED |
| local computer isolation | BoxLite | Docker/gVisor; Process dev backend | P1 SELECTED spike |
| cluster work runtime | AX + Agent Substrate adapter | remote sandbox | WATCH / RESEARCH |
| channels | Hermes-derived ChannelGateway | OpenClaw/Vellum patterns | P1 SELECTED donor |
| northbound gateway | agentgateway | Bifrost | P1 SELECTED |
| interaction media | LiveKit | Pipecat | P1 SELECTED |
| local interaction UX | OpenLive patterns | HF speech-to-speech | CODE DONOR / REFERENCE |
| local ASR | Qwen3-ASR 0.6B bakeoff | 1.7B/Whisper/MOSS | P1 SELECTED candidate |
| local face | Qwen3.5-4B no-thinking bakeoff | Qwen3.5-2B / Gemma 4 E2B | P1 SELECTED candidate |
| local TTS | Pocket-TTS ID vs sherpa/Piper | future ID/MS voices | P1 bakeoff |
| diarization | Nemotron 3 Diarization | MOSS/pyannote/etc. | P1 ALTERNATE/Node+ |
| authoritative state | SQLite + files + ledger | PostgreSQL hosted | P1 SELECTED |
| lexical Library search | SQLite FTS5 | — | P1 SELECTED |
| semantic Library search | sqlite-vec exact/flat | LanceDB/Qdrant adapter | P1 ALTERNATE/optional |
| Library hierarchy | Aksara implementation | OpenViking donor | P1 SELECTED semantics |
| derived wiki | Aksara implementation | OpenKB donor | P1 SELECTED semantics |
| long-doc retrieval | PageIndex local adapter | ordinary hybrid retrieval | P1 ALTERNATE |
| Library graph | SQLite adjacency + PPR | HippoRAG/Synaptic algorithms | P1 SELECTED |
| temporal institutional graph | Graphiti | custom/Cognee-class | P1 SELECTED projection |
| Workbench | Aksara UI using Dim0/canvas-harness donor | tldraw lower-level | P1 SELECTED donor |
| frontend event transport | AG-UI | SSE/WebSocket custom | P1 SELECTED |
| generated UI | A2UI + Aksara catalog | sandboxed app artifacts | P1 SELECTED |
| notebook | marimo | Jupyter compatibility | P1 SELECTED |
| plugin package floor | Agent Plugins 1.0.0 | client adapters | P1 SELECTED |
| Skills | Agent Skills | — | P1 SELECTED |
| tool protocol | MCP | direct typed adapter | P1 SELECTED |
| agent federation | A2A | provider-specific | P1 SELECTED |
| Pack distribution | OCI + ORAS + cosign | distro-specific packages | P1 SELECTED |
| cross-org AI/data sharing | OpenSharing adapter | bespoke SharingGrant export | P1 ALTERNATE / early |
| device description | W3C WoT TD | custom generated manifest | P1 SELECTED candidate |
| device data plane | Zenoh | MQTT/NATS | P1 SELECTED candidate |
| device wire encoding | benchmark CBOR vs Protobuf/nanopb | — | P1 DECISION PENDING FIXTURE |
| degraded text mesh | Meshtastic | Reticulum/LXMF | OPTIONAL P1 / WATCH |
| medium-bandwidth field mesh | OpenMANET/HaLow | ordinary IP | WATCH / RESEARCH |
| bounded decision models | one `DecisionModelPort` | Bekko/Von/Strands Decider/Clef/Jev | P1 SELECTED contract |
| evals | Aksara fixtures + Strands Evals + OTel | Langfuse/Phoenix UI | P1 SELECTED |
| governed self-improvement | explicit evaluation/promotion seam | Reef donor | DEFERRED implementation |

---

# 27. Build order

## Phase 0 — repository and contracts

1. Create monorepo, Rust workspace, pnpm workspace and Python workspace.
2. Define protobuf/WIT/schema packages and `core-types`.
3. Implement `InstitutionActor`, `Principal`, `IdentityBinding`, `ConversationLane`, `AccessContext`, `WorkObject`, `CapabilityRequest/Result`, `Receipt` and basic Library artifact IDs.
4. Establish SQLite migrations, ledger/outbox and deterministic fixtures.

## Phase 1 — first governed path

5. Implement `aksarad` + `aksara-execd` skeleton.
6. Add one read capability and one effect capability with lease/idempotency/receipt semantics.
7. Implement `ResidentRuntimePort` and Pi Durable adapter.
8. Implement InteractionRuntime with `ANSWER_INLINE / DELEGATE / ASK / PASS` minimum.
9. Expose an ugly web client over AG-UI.

## Phase 2 — Thread + Library loop

10. Add WorkThread projection.
11. Add raw-file Library ingest, stable blocks and FTS5.
12. Delegate a task that searches the Library, emits progress and produces an artifact.
13. Kill/restart Pi and prove the Thread resumes without duplicating effects.

## Phase 3 — shared Workbench and computer

14. Introduce Dim0/canvas-harness-derived UI primitives.
15. Add `ProcessComputerRuntime` for PRoot development and browser postcondition fixtures.
16. Add BoxLite adapter on real Linux/KVM hardware.
17. Add marimo Notebook object/view.

## Phase 4 — channels and voice

18. Add Hermes-derived Telegram first, then WhatsApp Cloud/API path.
19. Add LiveKit Voice Worker and local cascaded voice path.
20. Implement speech-safe/display-safe TaskUpdate projections and private handoff.
21. Benchmark local ASR/face/TTS on the actual 32 GB Node candidate.

## Phase 5 — Packs and devices

22. Implement Agent Plugins loader + `dev.abstraksi.aksara` Pack extension.
23. Ship Science Pack as the first brutal Pack.
24. Implement Device SDK simulator and `aksara-hwd` registry.
25. Build Node Controller prototype and local fallback-access path.

## Phase 6 — federation and field validation

26. Add A2A and explicit ETNOS publication gate.
27. Add OpenSharing adapter for one approved asset type.
28. Test SMS/Meshtastic only after core acceptance fixtures are green.

**Anti-safari rule:** from this point forward, research should be triggered by an implementation seam, failed fixture or clearly superior donor—not by the existence of another trending agent framework.

---

# Appendix A — canonical one-line model

> **InstitutionActor + Tenant → TrustDomain + DataCustodian + StoragePlacement → Principal + IdentityBinding → Surface / ConversationLane + optional GatheringSession → current Actor + Initiator + Audience + Purpose (`AccessContext`) → Library/authorized sources + Memory Firewall / authorized MemoryView → Authoritative Memory + rebuildable Graph/Continuity/Trigger projections → InteractionRuntime → inline response or WorkThread/WorkObject → ResidentRuntime (Pi Durable by P1 default) → Authority + Capability Lease → governed execution → verified outcome + Receipt + Ledger → optional SharingGrant / ETNOS / A2A / OpenSharing boundary.**

---

# Appendix B — donor and upstream ledger added in v1

| Ref | Source | v1 role | Boundary |
|---|---|---|---|
| `REF-PI` | https://github.com/earendil-works/pi | Pi AI + Pi Durable resident runtime candidate | runtime state never becomes institutional truth/authority |
| `REF-PI-DURABLE` | https://earendil.com/posts/pi-durable/ | durable tasks, replay semantics, forks, multiplayer steering | experimental; behind `ResidentRuntimePort` |
| `REF-STRANDS` | https://github.com/strands-agents/harness-sdk | alternate runtime; interventions/evals/OTel/multiagent donor | non-sovereign cognition only |
| `REF-DIM0` | https://github.com/vcmf/dim0 | primary Workbench code/product donor | Aksara replaces canonical runtime/memory/authority |
| `REF-CANVAS-HARNESS` | https://github.com/winlp4ever/canvas-harness | low-level canvas engine donor | view engine, not institutional object model |
| `REF-BOXLITE` | https://github.com/boxlite-ai/boxlite | local production computer-isolation spike | requires KVM/virtualization; not PRoot dev backend |
| `REF-OPENKB` | https://github.com/VectifyAI/OpenKB | derived Library/wiki code donor | derived/provenanced knowledge, not canonical source truth |
| `REF-OPENVIKING` | https://github.com/volcengine/OpenViking | L0/L1/L2 hierarchy/navigation donor | not canonical Aksara memory/context DB |
| `REF-PAGEINDEX` | https://github.com/VectifyAI/PageIndex | long-document retrieval adapter | specialist index, not corpus-wide sovereign Library |
| `REF-AGENT-PLUGINS` | https://github.com/agentplugins/agent-plugins-spec | portable Plugin 1.0 package floor | Aksara richness lives in extension namespace |
| `REF-OPENSHARING` | https://github.com/OpenSharing-IO/OpenSharing | governed cross-org data/AI asset sharing | current AI asset proposals tracked by maturity; policy remains Aksara-owned |
| `REF-MARIMO` | https://github.com/marimo-team/marimo | native reactive notebook | notebook artifacts remain governed Aksara objects |
| `REF-OPENLIVE` | https://github.com/katipally/openlive | local interaction/voice UX donor | ears/mouth/eyes around Aksara, not institutional brain |
| `REF-HF-S2S` | https://github.com/huggingface/speech-to-speech | local realtime speech runtime donor | replaceable speech pipeline |
| `REF-DUPLEXOMNI` | https://github.com/MuyeHuang/DuplexOmni | realtime System-1 → deeper System-2 architecture donor | research/reference |
| `REF-REEF` | https://github.com/Human-Agent-Society/reef | governed capability-evolution donor | candidate generation/eval only; no authority self-modification |
| `REF-AGENT-PLUGINS-SPEC` | https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md | exact portable component contract | v1 only standardizes Skills + MCP core components |

---

# Appendix C — deferred / watch register

Keep visible without allowing them to dominate P1 implementation:

- Microsoft Agent Framework: durable/A2A/enterprise reference.
- Mastra: workspace/agent-controller/product-runtime reference.
- Flue: conversation durability/channels/deployment donor.
- Vellum: computer/proactivity/Skill/identity code donor.
- OpenClaw: extension registry + memory/context separation donor.
- NemoClaw/OpenShell: hardened security/deployment reference.
- smolvm: BoxLite alternate.
- AX + Agent Substrate: cluster runtime.
- `any/any-sync/anyrt`: future state/sync consolidation experiment.
- Caura: optional governed derived multi-agent memory backend.
- Clef/Clef-Flash, Bekko, Von, Strands Decider, Jev: DecisionModelPort bakeoff.
- MiniCPM-o, PersonaPlex/Moshi, Gemma duplex, DuplexOmni: full-duplex research.
- Reticulum/LXMF, Meshtastic, OpenMANET/HaLow: degraded/field networking.
- World Motion Models and Dyna3: Aksara Science robotics/spatial research watch.
- Reef: future governed capability-improvement pipeline.

---

# Appendix D — v0.9 → v1 migration summary

Major changes:

1. Vellum is replaced as resident-runtime default by **Pi Durable + Pi AI**, behind a stable port; Strands becomes alternate/runtime donor.
2. One generic durability section becomes **cognitive durability + institutional workflow durability**.
3. The buried realtime voice fast path becomes modality-independent **InteractionRuntime**.
4. Delegated work becomes visible through **Threads/WorkThread projections** rather than invisible background queues.
5. Institutional documents/search become a first-class **Library**, separate from Memory.
6. OpenKB/OpenViking/PageIndex/HippoRAG patterns are assigned narrow Library roles rather than introduced as new authorities.
7. Graph Packs and Capability Packs collapse into one domain **Pack** concept; Plugin/Pack/Skill/Capability vocabulary is clarified.
8. `Observe / Interpret / Act` is replaced with operational `read / derive / effect` plus orthogonal policy metadata.
9. Dim0/canvas-harness becomes the primary Workbench donor while Aksara View/Surface semantics remain canonical.
10. AG-UI and A2UI move to P1-selected protocol roles.
11. A first-class `ComputerRuntime` complements `WorkAgentRuntime`; BoxLite becomes production spike and Process backend handles PRoot development.
12. LiveKit is explicitly the media/session plane, not the voice brain.
13. The **Aksara Device SDK** unifies Node Controller, surfaces, Card and future devices.
14. Device wire **semantics** freeze; CBOR vs Protobuf is reopened only for one MCU benchmark.
15. Hermes moves from resident-cognition discussion to ChannelGateway donor/implementation.
16. Vellum/OpenClaw/Hermes/Mecatl are retained as deliberate code donors rather than co-sovereign frameworks.
17. `Irama` is retired as a frozen name; `AttentionSignal` semantics remain.
18. `any/any-sync` is demoted until implementation demonstrates real need.
19. The component register is simplified into selected/alternate/donor/watch/deferred statuses.
20. The repository scaffold is updated around Interaction, Threads, Library, Workbench, Computer, Plugins/Packs and Device SDK.

---

# Appendix E — implementation mantra

> **Aksara does not need its own agent loop. Aksara needs its own semantics.**

Pi can keep thought alive. LiveKit can carry speech. Hermes can deliver WhatsApp. Dim0 can show shared work. BoxLite can isolate a computer. Graphiti can project relationships. OpenKB can help compile knowledge. MCP/A2A can connect the ecosystem. The Device SDK can give Aksara a body.

Aksara owns:

```text
identity
audience
authority
institutional truth
memory
work
consent
provenance
effects
receipts
continuity
```

That is the seam we build and defend.


---

# Appendix F — detailed acceptance fixtures retained from v0.9

The following detailed fixtures are carried forward as a test-design archive. Where terminology conflicts with v1, v1 semantics above take precedence.

# 28. Memory acceptance tests

Memory is not “done” because a vector search returned something plausible.

P1 should test:

## Persistence boundary

Casual talk can become:

- nothing,
- ephemeral context,
- expiring continuity,
- candidate fact,
- approved institutional knowledge,

without raw conversation automatically becoming permanent.

## Temporal correction

A fact may be superseded without deleting its historical validity/provenance.

## Correction / withdrawal propagation

Change or remove an eligible canonical item and verify that:

- FTS/vector/graph/trigger projections no longer surface the invalidated version as current evidence,
- cached Node views are expired/rebuilt,
- the Ledger preserves only the minimum event metadata required by policy,
- immutable backups respect their retention/legal-hold limits rather than claiming impossible immediate erasure,
- any already-public/federated copy is reported as an external disclosure boundary rather than silently presented as deleted.

## Hierarchical recall

A long institutional history can answer broad questions from summaries and drill down to source evidence only when needed.

## Associative zero-overlap recall

Create benchmark cases in which the current query/event shares no meaningful keywords with the old memory, but the old memory is operationally relevant.

Compare:

1. FTS,
2. vector search,
3. Graphiti retrieval,
4. hybrid retrieval,
5. Trigger Index,
6. Trigger Index + `decision.score(memory.activation)`.

## Access-first recall

Restricted triggers must not be searched/revealed for an actor who is outside the source memory scope.

## Irama activation

A calendar/sensor/forecast event can activate a relevant memory even when no person asks a question.

The result may prepare context or propose an action, but cannot bypass policy/approval.

## Rebuildability

Delete derived:

- embeddings,
- Continuity Tree,
- Graphiti projection,
- Trigger Index,

and rebuild them from authoritative records without loss of institutional truth.

---

# 28A. Multi-principal / audience / lane acceptance tests

v0.5 adds institutional multi-user tests alongside the existing memory tests.

## Cross-channel identity continuity

The same verified person interacts over Web, WhatsApp and Edge:

- all three resolve to one canonical Principal,
- each keeps an independent ConversationLane,
- role/membership state is shared,
- transcripts are not merged,
- durable relationship/work facts may be retrieved according to policy.

## Identity collision

Two people share a display name. No binding occurs by name alone. A channel/account subject already bound to another Principal cannot silently rebind.

## Current-turn actor vs lane owner

A second authorized person posts into a lane previously owned/resting on someone else. Authorization and provenance must use the current turn actor. No private context from the resting owner may leak. [REF-VELLUM-IDENTITY]

## Group audience leak test

A staff member asks in a group about something known only from their private DM. The private record is not retrieved into the group response unless policy produces an explicitly safe transformation.

## Email CC change

A private email thread gains a new CC recipient. The next response rebuilds audience authorization; previously accessible private context is not assumed safe merely because the thread ID stayed the same.

## Shared Node / speaker

An authenticated person approaches a communal Node. Private detail is routed to Edge/phone/web unless the shared display/speaker audience policy permits it.

## Memory type vs retention

Create:

```text
semantic office gossip       → visible to participants but drop/short TTL
procedural safety checklist  → institution scope + reviewed durable
episodic patient event       → restricted case scope + governed retention
```

Verify that semantic type does not imply durable/global persistence.

## Runtime isolation

Two lanes share a local worker only when the workspace policy explicitly permits it. A conversation ID alone never grants filesystem/credential isolation. [REF-OPENHANDS]

## Native harness-memory bypass

Attempt direct Vellum/Hermes persistent-memory write while in Aksara institutional mode. It must route through the Aksara Memory Firewall or remain a clearly non-authoritative runtime cache.

## Caura backend equivalence

Run the same authorized memory fixture through:

1. local SQLite/Graphiti/FTS-vector stack;
2. Caura derived backend profile.

Verify:

- identical Aksara policy eligibility set,
- no cross-scope leakage,
- source/provenance linkage survives,
- authoritative store can rebuild either profile,
- deleting the derived backend does not delete institutional truth.

---

# 28B. Security, recovery, voice and field acceptance tests

These join, rather than replace, the memory/multi-principal/harness suites.

## Device trust

```text
disk removed → no plaintext
unsigned/modified UKI rejected
measured-boot/PCR policy change blocks protected auto-unlock
authorized signed update can transition vault policy without losing data
PCR policy includes every intended trust-critical component
SHA-256-or-better bank/policy only
remote attestation failure withholds/revokes remote capability credentials
Node continues bounded local operation when verifier/Gateway is absent
```

## Backup/recovery

```text
snapshot during normal writes remains transactionally consistent
immutable target resists ordinary delete/overwrite credential
expired/missing object-lock extension raises explicit health failure
restore onto replacement hardware succeeds
derived graph/vector/search state is rebuilt from canonical sources
completed external effect is not re-executed after restore
lost Node device identity is re-enrolled rather than copied
recovery without Abstraksi infrastructure is documented and exercised
```

## Voice

```text
Papuan/Indonesian/code-switch corpus runs on every promoted ASR profile
far-field/noise/overlap test, not studio-only evaluation
identifier/name exact-match tracked separately from WER
diarization label never becomes authentication
communal speaker cannot render protected detail
cloud TTS/ASR path is denied when EgressPolicy forbids it
offline local TTS still produces understandable Indonesian
```

## Field/power

```text
abrupt mains loss during idle
abrupt mains loss during canonical write
abrupt mains loss during update
repeated cold boots
NVMe health warning
thermal throttling/load soak
Gateway outage
low-bandwidth/high-RTT sync
```

Acceptance numbers are **targets to measure on selected P1 hardware**, not claims inherited from a model card.


---

# 28C. Workstation, observation and governance acceptance tests

## Browser / computer use

- a read-only browser task cannot acquire write tools because a page tells it to;
- credentials inserted through a browser variable/session broker do not appear in the model prompt, ordinary trace or MemoryRecord;
- actor change or session handoff invalidates/reissues the `ComputerSession`;
- a changed page can trigger re-observation, but an effectful action is not silently self-healed into a different destination/action;
- disconnect after submit yields `OutcomeUnknown` until destination reconciliation;
- browser profile/cookies can be revoked independently of institutional memory;
- KVM ATX/virtual-media/HID capabilities are denied unless explicitly leased;
- physical/UI stop prevents new actions and reports any already-uncertain effect.

## Observation / actuation

- stale/missing sensor data is not rendered as current/safe;
- derived observations preserve raw/reference observation and transform/model version;
- calibration/version changes are visible in later comparisons;
- sensitive location precision follows TrustDomain/disclosure policy;
- model interpretation cannot directly bypass an actuator's deterministic safety/interlock layer.

## Community governance lifecycle

- removing a member invalidates future access and applicable offline authority without deleting records they legitimately authored;
- a custodian change transfers recovery authority without making the technical host the default custodian;
- disputed authority blocks disclosure rather than resolving via admin/root convenience;
- a withdrawn source disappears from active derived retrieval and is marked in dependent summaries;
- sponsor/operator exit leaves an exportable, decryptable-by-authorized-custodian archive and documented recovery path;
- model-training permission is tested separately from archive/analysis/publication permission.

---

# 28D. Card, gathering and physical-presence acceptance tests

## Card identity and privacy

- a lost/revoked Card cannot resume private institutional context after revocation;
- Card identity never substitutes for current role/membership/authority checks;
- microphone hardware privacy-off state cannot be bypassed by ordinary application firmware;
- camera capture is visibly explicit and cannot silently become continuous capture;
- sensitive result can hand off to phone/web without speaking or rendering the protected detail publicly;
- Node and Gateway paths produce the same authorization result for the same principal/context.

## Gathering / capture

- several nearby Cards do not automatically start or multiply-record a gathering;
- `capture.audio` requires an explicit lease and named source;
- capture transfer requires new acceptance and does not silently leave two primary sources;
- WAN loss preserves/buffers permitted capture locally and reports degraded state;
- live transcript errors do not become approved institutional facts;
- post-session canonical transcript and extracted actions remain reviewable before memory/work promotion;
- speaker labels remain session evidence and never become authentication.

## Social presence

- Aksara can be configured to remain silent while still showing/private-cueing relevant context;
- a private haptic cue does not leak the topic on communal MatrixUI;
- verbal interjection obeys current social-role/attention policy;
- simple start/stop/mark/mute/private-handoff controls remain responsive during resident-model/provider slowdown;
- cached acknowledgment never claims completion of an action whose receipt has not arrived.

## Multiplayer shell / channel continuity

- the same principal/task can continue across Card, email, messaging and web without merging unrelated lanes;
- public/shared/private memory scopes remain access-equivalent across channel adapters;
- proactive triage can choose silence/PASS without losing an explicit request;
- borrowed/leased teammate capability expires and does not become ambient shared credentials;
- channel outage or agent restart resumes pending approvals/work without duplicating effects.

---

---

# Appendix G — v0.9 upstream provenance archive

The following provenance ledger is retained from v0.9 for traceability. Entries may describe candidates that v1 demotes to donor/watch status.

# Appendix C — Inspiration & upstream provenance ledger

The point of this table is not to claim endorsement by upstream projects. It records **why a source influenced Aksara**, and the boundary where Aksara diverges.

| Ref | Source | What we borrow | Aksara-specific divergence |
|---|---|---|---|
| `REF-RUST` | https://www.rust-lang.org/ | native safe systems substrate | small trusted nucleus only; not “Rust everywhere” |
| `REF-TOKIO` | https://tokio.rs/ | async systems runtime | institutional semantics stay above runtime |
| `REF-CONNECT` | https://connectrpc.com/ and https://buf.build/ | cross-language typed RPC/contracts | domain model is independent of transport |
| `REF-WASMTIME` | https://wasmtime.dev/ and https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.1 | embeddable WebAssembly sandbox; reviewed 49.0.1 release line as of 2026-09-26 | capability runtime versions are security-pinned and regression-tested |
| `REF-WASI-CM` | https://component-model.bytecodealliance.org/ | WIT/component capability contracts | Aksara manifest adds authority, validation and provenance |
| `REF-BEND` | https://github.com/bendlang/bend | pure parallel computation + laws/proofs | experimental pack runtime, never P1 authority/kernel |
| `REF-SQLITE` | https://sqlite.org/ | durable local transactional store + FTS | canonical institutional meaning defined by Aksara |
| `REF-SQLITE-VEC` | https://github.com/asg017/sqlite-vec | low-footprint local vector search | embeddings remain rebuildable indexes |
| `REF-LANCEDB` | https://lancedb.com/ | embedded vector/data alternative | optional implementation |
| `REF-GRAPHITI` | https://github.com/getzep/graphiti | temporal knowledge graph, episodes/provenance | derived projection; approved records/ledger remain authoritative |
| `REF-OPTMEM` | https://github.com/VictorTaelin/OptMem | append-only memory + rebuildable hierarchical summaries | institutional scopes, provenance and policy added |
| `REF-TIMEM` | https://aclanthology.org/2026.findings-acl.1091/ | temporal-hierarchical consolidation and complexity-aware recall | hierarchy represents institutional continuity, not persona profiling |
| `REF-HORMA` | https://arxiv.org/abs/2606.11680 | hierarchical organize-and-retrieve navigation | navigation remains constrained by actor/policy context |
| `REF-TMEM` | https://arxiv.org/abs/2606.15405 | write-time future-oriented triggers for associative recall | event-conditioned, policy-first, provenance-linked institutional Trigger Index |
| `REF-ASSOMEM` | https://github.com/facebookresearch/AssoMem | multi-signal associative retrieval benchmark/reference | not a second canonical graph system |
| `REF-CEDAR` | https://www.cedarpolicy.com/ | explicit principal/action/resource/context authorization | mandates/collective governance remain Aksara domain objects |
| `REF-BISCUIT` | https://www.biscuitsec.org/ | attenuable offline-verifiable capability tokens | short TTL + local revocation + ledger semantics |
| `REF-DUROXIDE` | https://github.com/microsoft/duroxide | embeddable durable execution in Rust | must pass P1 fault-injection before adoption |
| `REF-RESTATE` | https://restate.dev/ | distributed durable objects/workflows | better hosted candidate than tiny-node default |
| `REF-DBOS` | https://www.dbos.dev/ | durable workflows around ordinary code | adapter, not domain truth |
| `REF-TEMPORAL` | https://temporal.io/ | mature durable workflow model | hosted/heavier alternative |
| `REF-CF-WORKFLOWS` | https://developers.cloudflare.com/workflows/ | durable cloud workflow adapter | never canonical institutional workflow state |
| `REF-VELLUM` | https://github.com/vellum-ai/vellum-assistant | resident cognition, tools, workflows, credential/sandbox patterns | identity, memory truth, authority and ledger stay outside |
| `REF-MAF` | https://github.com/microsoft/agent-framework | production agent/workflow fallback | alternative harness, not co-sovereign runtime |
| `REF-PYDANTICAI` | https://ai.pydantic.dev/ | typed Python agent/science workflows | pack-level runtime |
| `REF-AGENTOS` | https://github.com/rivet-dev/agentos | bounded agent computer/workspace | only via WorkAgentRuntime |
| `REF-EVE` | https://vercel.com/docs/eve | filesystem-first durable-agent design | reference/alternative, not P1 substrate |
| `REF-CFOS` | https://github.com/cloudflare/cloudflare-os | Gatekeeper/speculative action pattern | semantics reimplemented locally under Aksara policy |
| `REF-AGENTGATEWAY` | https://agentgateway.dev/ | MCP/A2A/LLM perimeter, routing/auth/guardrails | exact semantic authorization remains Aksara |
| `REF-BIFROST` | https://github.com/maximhq/bifrost | provider gateway, fallbacks, budgets, governance | optional gateway implementation |
| `REF-ORCAROUTER` | https://github.com/Continuum-AI-Corp/OrcaRouter-Lite | capability/cost-aware model routing | sits behind `model.route` |
| `REF-LIVEKIT` | https://docs.livekit.io/agents/ | realtime voice session mechanics | identity, retention, memory and audit remain Aksara |
| `REF-A2UI` | https://a2ui.org/ | declarative catalog-driven generated UI | Aksara defines trusted component catalogs and semantic surfaces |
| `REF-AGUI` | https://github.com/ag-ui-protocol/ag-ui | agent↔frontend events/state | optional transport, not MatrixUI visual semantics |
| `REF-EMBEDDED-GRAPHICS` | https://github.com/embedded-graphics/embedded-graphics | deterministic tiny-display rendering + simulator | Aksara MatrixUI defines visual grammar |
| `REF-LVGL` | https://lvgl.io/ | richer embedded UI alternative | preferred later for higher-resolution displays |
| `REF-WOT` | https://www.w3.org/TR/wot-thing-description11/ | interoperable Properties/Actions/Events device descriptions | Aksara maps Things into Observe/Interpret/Act capabilities |
| `REF-EMBEDDED-HAL` | https://github.com/rust-embedded/embedded-hal | portable embedded peripheral traits | higher semantic device contract stays above |
| `REF-ZENOH` | https://zenoh.io/ | edge pub/sub/query data plane | durable offline truth remains Aksara SQLite/outbox |
| `REF-BUBBALOOP` | https://github.com/kornia/bubbaloop | Zenoh + physical AI/node discovery patterns | adapter/reference, not institutional kernel |
| `REF-AETHEREDGE` | https://github.com/EvanL1/AetherEdge | deterministic edge/industrial runtime patterns | adapter/reference pending maturity |
| `REF-ORAS` | https://oras.land/ | OCI artifacts for non-container packages | Aksara defines pack semantics |
| `REF-SIGSTORE` | https://www.sigstore.dev/ | signatures/provenance | local trust policy determines acceptance |
| `REF-MCP-REGISTRY` | https://modelcontextprotocol.io/registry | capability/tool discovery input | local Aksara Registry remains authoritative |
| `REF-OTEL-GENAI` | https://opentelemetry.io/docs/specs/semconv/gen-ai/ | trace interoperability | trace never replaces institutional ledger |
| `REF-LANGFUSE` | https://langfuse.com/ | LLM/agent traces, eval datasets/experiments | development/eval backend, not source of truth |
| `REF-CF-DO` | https://developers.cloudflare.com/durable-objects/ | cloud stateful simulator peer | browser/local node remains true offline path |
| `REF-VJEPA2` | https://github.com/facebookresearch/vjepa2 | video temporal representation/prediction | Perceive/Represent capability only |
| `REF-TIMESFM` | https://github.com/google-research/timesfm | general time-series forecasting | benchmark against simpler/domain models |
| `REF-TTM` | https://github.com/ibm-granite/granite-tsfm | compact time-series foundation models | implementation behind `timeseries.forecast` |
| `REF-A2A` | https://a2a-protocol.org/v1.0.0/specification/ | independent-agent discovery, Agent Cards, Tasks, Artifacts, auth/streaming/push | receiver policy/leases remain Aksara-owned; public ETNOS projection is separate |
| `REF-ACTIVITYPUB` | https://www.w3.org/TR/activitypub/ | federated actor inbox/outbox and social delivery | ETNOS adds product semantics without breaking federation |
| `REF-ACTIVITYSTREAMS` | https://www.w3.org/TR/activitystreams-core/ and https://www.w3.org/TR/activitystreams-vocabulary/ | standard Person/Organization/Service/Application/Group actor types | Aksara remains presentation/governance metadata rather than a bespoke federation actor type |
| `REF-PIEFED17` | https://join.piefed.social/2026/07/03/piefed-v1-7-is-released-following-users-faster-browsing-smarter-moderation/ | current social substrate capabilities including following users; PieFed social grammar | ETNOS sidecar adds public-work/artifact/trace semantics |
| `REF-FALKORDB-LITE` | https://github.com/getzep/graphiti | embedded Graphiti backend path via FalkorDB Lite; Kuzu deprecation | authoritative truth remains SQLite/files; graph backend replaceable |
| `REF-KOLIBRI` | https://learningequality.org/kolibri/about-kolibri/ | offline-first classroom/content delivery | Aksara adds governed institutional memory/objective/evidence layer |
| `REF-OPENEMIS` | https://www.openemis.org/ | open education management + offline/interoperability patterns | school admin substrate/reference, not Aksara core |
| `REF-SATUSEHAT-FHIR` | https://satusehat.kemkes.go.id/platform/docs/id/fhir/ | Indonesian HL7 FHIR interoperability boundary | Aksara does not become an EMR or bypass clinical authority |
| `REF-LOCALCONTEXTS` | https://localcontexts.org/ | community-defined provenance/protocol/permission metadata for Indigenous knowledge/data | reference for community authority semantics; local Papua governance remains locally defined |
| `REF-AX` | https://github.com/google/ax | Task/Workspace/Gateway/Model execution control-plane patterns for agent workloads | optional `WorkAgentRuntime` backend; Aksara institutional state remains above it |
| `REF-AGENT-SUBSTRATE` | https://github.com/agent-substrate/substrate | actor/worker separation, suspend/checkpoint/resume, gVisor/microVM worker pools | experimental Node+/cluster execution only; snapshots are never canonical memory |
| `REF-INTENT` | https://github.com/intent-hq/intent | local Rust daemon, thin clients, isolated workspaces, provider-agnostic sessions, harness/version reproducibility | code/reference donor; Aksara ontology remains institutional rather than coding-workspace-centric |
| `REF-INTENT-DIAGRAMS` | https://github.com/intent-hq/cloudlands-fe/tree/main/src/lib/components/diagrams | typed semantic diagram grammars, walkthrough states, camera/highlight/narrative, real-object bindings | adapted into trusted Aksara `ViewPrimitive`s; not arbitrary executable UI |
| `REF-OPENMUSE` | https://github.com/CopilotKit/openmuse | AG-UI web/mobile agent workspace, durable visible work, structured results, human takeover patterns | UX/reference shell only; not institutional identity/memory substrate |
| `REF-OPENBOT` | https://github.com/CopilotKit/OpenBot | governed browser/file/MCP gateway, initiator-aware policy, per-bot computer, take-the-wheel/audit patterns | Aksara authority remains Cedar/lease/execd; Bot is not the institutional principal |
| `REF-ALEXANDRIA` | https://firecrawl.dev/alexandria | external data/provider capability discovery, progressive contract disclosure, terms/cost/idempotency/receipt patterns | optional discovery/broker adapter; local Aksara Capability Registry remains authoritative |
| `REF-ANYDOC` | https://github.com/firecrawl/anydoc | local Rust multi-format document normalization into structured document/Markdown representations | derived parser; original artifact remains canonical; hosted OCR is governed egress |
| `REF-PDF-INSPECTOR` | https://github.com/firecrawl/pdf-inspector | PDF text/scanned/mixed inspection and OCR routing | feeds Aksara document triage; local OCR required by policy for sensitive classes |
| `REF-STRANDS` | https://github.com/strands-agents/harness-sdk | SDK-first Python/TypeScript agent loop, lifecycle limits, hooks/steering, MCP, sessions, tracing/evals | resident-cognition alternative only; Aksara still owns identity, memory truth, policy, leases, ledger and effects |
| `REF-MONTY` | https://github.com/pydantic/monty and https://github.com/pydantic/monty/releases/tag/v1.0.0 and https://ai.pydantic.dev/harness/code-mode/ | v1 language sandbox for programmatic composition of host capabilities, sessions/suspension/resume and typed code mode | generated control flow never receives ambient authority; durable institutional lifecycle/effects remain Aksara-owned |
| `REF-WINDMILL` | https://github.com/windmill-labs/windmill | worker pools, durable job/approval ergonomics, resource handles and workflow observability | implementation reference only; P1 avoids its heavier API/Postgres/worker platform footprint |
| `REF-JEV-MEM` | https://arxiv.org/abs/2609.23986 and https://github.com/libingzheren/Jev-Mem | fast typed memory-control plane, multi-relational budgeted retrieval, adaptive stopping | authorization and persistence remain Aksara policy-first; not every valid observation is retained |
| `REF-SYSTEM-ONE-OPEN` | https://github.com/mithalouni/system-one-open | open Jev-style one-pass typed scorer; evidence on held-out/generalization limits and task tuning | trace/evaluate before local adoption; scorer never becomes policy |
| `REF-OPEN-JEV-FINETUNE` | https://github.com/daseinlabs/open-jev/blob/main/docs/design/per-task-finetuning-with-gemma.md | distinction between zero-shot option likelihoods and task-calibrated trained scorer | supports trace-first, specialize-second Aksara deployment strategy |
| `REF-ASTRA-ARES` | https://github.com/miuuyy/Astra-Ares | bounded System-One selection of reasoning effort and decision lease duration | reference for `decision.score(reasoning.effort)`, not a runtime dependency |
| `REF-UNIVER` | https://github.com/dream-num/univer-cli and https://github.com/dream-num/univer-workspace | Office-native agent CLI/workspace, isolated worktrees, render/verify/review/merge for Sheets/Docs/Slides/Base/Board | candidate-artifact runtime only; source bytes and Aksara authority remain external; Pro terms pinned separately |
| `REF-DRAC` | https://arxiv.org/abs/2609.24220 | visual normalization, retrieval-oriented Markdown, immutable ID units and chunk planning over IDs | preserve native structure/original bytes; local/Gateway multimodal path follows data policy |
| `REF-CLI-ANYTHING` | https://github.com/HKUDS/CLI-Anything | source-driven generation/refinement/testing of stateful JSON CLIs for GUI-heavy software | dev-time capability factory only; generated adapter is untrusted until reviewed, tested, annotated and signed |
| `REF-TREG` | https://github.com/superdesigndev/treg | unified metered broker for many external commercial tools/providers without distributing vendor credentials | optional egress/provider adapter; local Capability Registry and policy remain authoritative |
| `REF-SCIENCEBUDDY` | https://github.com/Gen-Verse/ScienceBuddy | evaluated inner-loop harness improvement plus outer-loop model learning for scientific agents | research-only reference; operational/training data separation and human promotion remain mandatory |
| `REF-NEMOTRON-DIAR` | https://huggingface.co/nvidia/Nemotron-3-Diarization | open-weight streaming/offline up-to-eight-speaker diarization | Node+/Gateway candidate; speaker channel is evidence, never identity/authority |
| `REF-GEMINI38-TTS` | https://ai.google.dev/gemini-api/docs/changelog and https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/ | expressive/low-latency cloud TTS, voice design/replication and provider interchange | Gateway-only candidate; replicated voice requires consent/provenance/disclosure/revocation |
| `REF-HERMES` | https://github.com/NousResearch/hermes-agent | broad messaging gateway, deterministic user/chat/thread sessions, searchable durable session history, replaceable memory/provider adapters | P0/P1 cognition/channel adapter; sessions and native memory never define institutional authority |
| `REF-OPENCLAW` | https://docs.openclaw.ai/concepts/multi-agent and https://docs.openclaw.ai/concepts/session | agent/account/peer bindings, DM/group/thread scopes, cross-channel `identityLinks`, isolated agent session stores | identity/session routing ideas become Aksara `IdentityBinding`/`ConversationLane`; agent profile is not top-level institution |
| `REF-VELLUM-IDENTITY` | https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/architecture/turn-actor.md and https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/trusted-contact-access.md | gateway-owned ingress trust, multi-channel contacts, acting-vs-resting actor distinction, provenance and current-turn authorization | generalized from personal guardian/contact model into Institution/Principal/Membership/Role/Audience; no owner fallback for auth |
| `REF-VELLUM-MEMORY-V3` | https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/architecture/memory.md | concept-page substrate, buffered capture/consolidation, hybrid retrieval, per-turn v3 lane/section selection, provenance-aware imports | cognitive memory reference only; Aksara Memory Firewall and authoritative records remain canonical |
| `REF-CAURA` | https://github.com/caura-ai/caura | governed multi-tenant fleet memory, agent/team/org scopes, credentials/trust tiers, audit, hybrid search, contradiction/supersession, graph, Rail/MCP | optional derived memory backend; Aksara adds human principals, purpose/audience, work-object/compartment scope, valid-time/evidence/authority semantics |
| `REF-AIM-MULTIUSER` | https://arxiv.org/abs/2609.12320 | private/shared multi-user memory and index-level access-control evaluation | evidence for scope-aware memory and for keeping automated visibility classification outside the security boundary |
| `REF-COLLAB-MEMORY` | https://arxiv.org/abs/2505.18279 | dynamic user↔agent/resource access graphs, private/shared tiers, read/write policies, immutable provenance | inspires audience/purpose-aware MemoryViews; Aksara uses its own Cedar/domain model |
| `REF-MIRIX` | https://arxiv.org/abs/2507.07957 | distinct semantic memory types (core/episodic/semantic/procedural/resource/vault) and routed retrieval | taxonomy reference; type remains independent from visibility/retention |
| `REF-GMEMORY` | https://arxiv.org/abs/2506.07398 | interaction/query/insight graph hierarchy for multi-agent organizational memory | research reference for collaboration-history abstraction, not P1 canonical storage |
| `REF-OPENHANDS` | https://docs.openhands.dev/enterprise/conversations-and-sandboxes | explicit separation of conversation and sandbox; sandbox sharing is not a security boundary | reinforces separate ConversationLane, runtime-isolation and memory-governance boundaries |
| `REF-LIBRECHAT-ACL` | https://www.librechat.ai/docs/features/access_control | users/groups/roles/public principals, feature permissions, per-resource ACLs and admin grants | authorization-model reference; Aksara authority remains Cedar + mandates/delegation |
| `REF-OPENWEBUI-CHANNELS` | https://docs.openwebui.com/features/channels/ | persistent shared human+AI channels with group/public/private access | shared-workspace UX reference; conversation channel is not institutional memory |
| `REF-LETTA-SHARED` | https://docs.letta.com/guides/core-concepts/memory/shared-memory/index.md | shared memory blocks and explicit concurrency caveats | bounded handoff/shared-working-state reference only; not transactional institutional state |
| `REF-GROKBOT` | https://cursor.com/docs/grok-bot | persistent named coworkers, per-user computer isolation, team rules/approvals and bot coordination | personal-coworker/runtime reference; Aksara inverts ownership so institution, not each person/bot, is the durable sovereign identity |
| `REF-SYSTEMD-CRYPT` | https://www.freedesktop.org/software/systemd/man/latest/systemd-cryptenroll.html | TPM2/FIDO2/PKCS#11 enrollment for LUKS2 and signed PCR-policy unlock | local key policy remains deployment-governed; TPM auto-unlock is not universal authorization |
| `REF-SYSTEMD-UKI` | https://www.freedesktop.org/software/systemd/man/latest/ukify.html | signed Unified Kernel Images and embedded signed PCR policy material | one part of Aksara's boot trust chain, not an updater/authority system |
| `REF-SYSTEMD-SYSUPDATE` | https://www.freedesktop.org/software/systemd/man/latest/systemd-sysupdate.html and https://www.freedesktop.org/software/systemd/man/latest/systemd-repart.html | image/partition A/B-style atomic updates, verity resources and boot-attempt patterns | evaluate for Debian appliance profile; institutional state lives outside rebuildable OS image |
| `REF-KEYLIME` | https://keylime.readthedocs.io/en/latest/design/overview.html and https://keylime.readthedocs.io/en/latest/design/push_model.html | TPM/UEFI/IMA attestation, verifier/registrar and revocation; NAT-friendly push design | stable pull model/reference for P1; push model stays research while upstream marks it experimental |
| `REF-EVE-SECURITY` | https://github.com/lf-edge/eve/blob/master/docs/SECURITY.md and https://github.com/lf-edge/eve/tree/master/pkg/pillar/evetpm | unattended-edge physical threat model, TPM-sealed vault, measured boot, attestation and upgrade-key recovery patterns | code/pattern reference only; Aksara remains Debian/systemd-based and fixes authority above the OS |
| `REF-KOPIA` | https://kopia.io/docs/features/ and https://kopia.io/docs/advanced/ransomware-protection/ | mandatory client-side encryption, deduplicated snapshots, verification and S3 Object Lock extension | backup implementation behind Aksara snapshot/recovery contracts; maintenance/retention health is explicit |
| `REF-BIZNET-OBJECTLOCK` | https://support.biznetgio.com/portal/id/kb/articles/mengenal-object-lock-pada-layanan-neo-object-storage and https://support.biznetgio.com/portal/id/kb/articles/getting-started-neo-object-storage | Indonesia S3-compatible object storage, Governance/Compliance/Legal Hold and published GB pricing | policy-selected backup target, never owner of plaintext recovery keys |
| `REF-R2-BUCKETLOCK` | https://developers.cloudflare.com/r2/buckets/bucket-locks/ | native R2 age/date/indefinite delete/overwrite protection | distinct provider capability; do not mislabel it as S3 Object Lock API support |
| `REF-R2-PRICING` | https://developers.cloudflare.com/r2/pricing/ | current R2 storage/operation economics and zero Internet egress charge | pricing snapshot only; Aksara budget model remains provider-neutral |
| `REF-B2-OBJECTLOCK` | https://www.backblaze.com/docs/cloud-storage-object-lock and https://www.backblaze.com/cloud-storage/pricing | low-cost S3-compatible DR storage and compliance/governance retention | cross-border secondary target only when deployment policy permits |
| `REF-CF-AIG-SPEND` | https://developers.cloudflare.com/ai-gateway/features/spend-limits/ | cost-based budgets scoped by provider/model/custom metadata and fallback routing | inspiration/adapter for `ComputeBudget`; canonical UsageLedger stays Aksara-owned |
| `REF-CF-AIG-LOGGING` | https://developers.cloudflare.com/ai-gateway/observability/logging/ | request/payload logging controls and metadata-only/no-log options | Aksara EgressPolicy chooses what may be logged; provider logs never become institutional memory |
| `REF-DEKA-LLM` | https://www.cloudeka.id/products/deka-llm/ | Indonesia-hosted OpenAI-compatible managed LLM lane and residency claim | provider candidate only; not evidence of confidential-compute/TEE execution |
| `REF-GEMINI-ZDR` | https://ai.google.dev/gemini-api/docs/zdr | explicit zero-data-retention conditions and Live session-resumption retention caveat | provider policy input to EgressPolicy; does not relax room/audience privacy |
| `REF-GEMINI-TERMS` | https://ai.google.dev/gemini-api/terms | paid-service data-use and limited abuse/security logging terms | contractual/provider fact pinned by date; sensitive egress still requires deployment approval |
| `REF-QWEN3-ASR` | https://huggingface.co/Qwen/Qwen3-ASR-0.6B and https://huggingface.co/Qwen/Qwen3-ASR-1.7B | Apache-2.0 multilingual offline/streaming ASR including Indonesian and Malay | candidate only; Papuan Malay/code-switch/room performance must be measured locally |
| `REF-SHERPA-TTS-ID` | https://k2-fsa.github.io/sherpa/onnx/tts/all/Indonesian/index.html | explicit offline Indonesian ONNX/Piper-style TTS options across CPU/mobile architectures | availability/privacy floor; not assumed to match cloud expressive quality |
| `REF-GLINER25-DECIDE` | https://huggingface.co/fastino/GLiNER2.5-Decide | 340M non-generative typed operational classification with arbitrary label sets | bounded scorer only; vendor benchmark is not independent authority evidence |
| `REF-GLINER25-MULTI` | https://huggingface.co/fastino/gliner2.5-multi-v1 | multilingual 287M extraction/classification/records/relations checkpoint | benchmark for Indonesian/multilingual System-One tasks; distinct from Decide |
| `REF-MIMO26-9B` | https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | MIT 9B Qwen3.5-derived agentic SFT for coding/general tools/visual coding | local planner candidate; P1 CPU/RAM/latency must be measured on actual hardware |
| `REF-MINERU` | https://github.com/opendatalab/MinerU | local document parsing with pipeline/VLM/hybrid modes, Office/PDF/image support and multilingual OCR | one `DocumentParserPort` implementation; original bytes remain canonical and exact release/license is pinned |
| `REF-PARSEBENCH` | https://arxiv.org/abs/2604.08538 | enterprise-oriented evidence that document-parser capability remains fragmented across tables/charts/grounding/faithfulness | supports parser bakeoff/validation rather than declaring one universal engine |
| `REF-VERCEL-AI-SDK-LOOP` | https://ai-sdk.dev/docs/agents/loop-control | typed/streaming TS tool-loop primitives, explicit stop/prepare controls and custom-loop escape hatch | code donor for Aksara Minimal Loop TS; no framework-owned institutional memory/authority |
| `REF-YOAGENT` | https://github.com/yologdev/yoagent | stateless Rust `agent_loop`, native provider streams, tool middleware, cancellation/limits and mock testing | young reference/bakeoff candidate; Aksara disables/ignores optional state layers it does not own |
| `REF-RIG` | https://rig.rs/docs/concepts/agent/ | Rust provider/tool abstractions, streaming, sans-I/O run state and hookable runner | broader alternative/code donor; RAG/memory/workflows remain outside Aksara authority |

| `REF-ODK` | https://docs.getodk.org/central-intro/ | mature offline/field forms, projects, roles, entities and API surface | integrate where useful; Aksara keeps work/evidence/authority semantics above it |
| `REF-OPENFN` | https://docs.openfn.org/adaptors | public-service/humanitarian integration workflows and adapters | hosted/regional interoperability candidate; external effects still pass Aksara policy/receipts |
| `REF-DHIS2` | https://dhis2.org/android/ | offline-capable longitudinal/program data capture where already deployed | integrate, do not rebuild a registry |
| `REF-OPENSID` | https://github.com/OpenSID/opensid and https://panduan.opendesa.id/id/api-satu-data | village information-system and Satu Data integration patterns | named/versioned adapter; actual access/permissions confirmed per deployment |
| `REF-MUKURTU` | https://docs.mukurtu.org/communities-cultural-protocols-categories/UnderstandingCommunitiesAndCulturalProtocols/ | communities, membership and cultural protocol patterns | governance inspiration/integration for Indigenous packs; local custodians decide the rules |
| `REF-PAPERLESS` | https://github.com/paperless-ngx/paperless-ngx | mature document archive/search/operator patterns | benchmark before writing a full DMS; original/canonical artifacts remain policy-governed |
| `REF-OPENFGA` | https://openfga.dev/docs/learn/policy-engine | relationship-heavy authorization and reverse membership queries | benchmark against local relationship store + Cedar; not automatically a P1 dependency |
| `REF-ZITADEL` | https://github.com/zitadel/zitadel | external OIDC/identity-provider reference | prefer existing institution IdP; Aksara still owns offline identity binding/access context |
| `REF-DECIDIM` | https://decidim.org/features/ | participatory spaces/processes and accountable civic workflow patterns | benchmark for deliberation; not a substitute for local mandate/consent semantics |
| `REF-RAPIDPRO` | https://www.unicef.org/innovation/rapidpro | multichannel outreach/survey/response patterns | channel/reference only; public chat remains budgeted and consented |
| `REF-OPEN311` | https://wiki.open311.org/GeoReport_v2/ and https://github.com/mysociety/fixmystreet | service request identity, status, jurisdiction routing and tracking | domain-model reference for WorkObject, not required implementation |
| `REF-FRAPPE-HELPDESK` | https://github.com/frappe/helpdesk and https://docs.frappe.io/helpdesk/service-level-agreement | ticket assignment, SLA and operator workflow semantics | code donor/reference; Aksara canonical case/work state remains local |
| `REF-CHATWOOT` | https://github.com/chatwoot/chatwoot | mature omnichannel inbox/team/webhook surface | optional channel adapter; not the canonical WorkObject store |
| `REF-MESHTASTIC` | https://meshtastic.org/ | open low-bandwidth mesh/store-and-forward reference for future continuity transport | research transport only; Aksara semantics remain transport-independent and large/model payloads stay off this path |


| `REF-FLUE` | https://github.com/withastro/flue and https://flueframework.com/docs/guide/durability/ | durable accepted submissions, continuing conversation streams, recovery/fencing, Node/Cloudflare targets | candidate for resident session/turn durability only; WorkObject/workflow/effect truth remains Aksara-owned |
| `REF-PLAYWRIGHT-MCP` | https://playwright.dev/mcp/introduction | accessibility-snapshot browser control, persistent/isolated profiles, tracing/storage/vision capabilities | deterministic browser baseline behind `WorkstationBridgeRuntime`; session authority remains Aksara |
| `REF-STAGEHAND` | https://docs.stagehand.dev/v4/basics/observe | AI-assisted `observe`/`act`/`extract`, deterministic replay and secret placeholder variables | browser hands only; resident planner, approval and institutional effects stay outside |
| `REF-BROWSER-USE` | https://github.com/browser-use/browser-use | mature autonomous browser-agent implementation and authenticated profile patterns | bounded benchmark/reference; not canonical institutional browser state |
| `REF-SKYVERN` | https://github.com/Skyvern-AI/skyvern | visual/browser workflow automation and operational RPA patterns | benchmark/reference; AGPL and runtime ownership require deliberate deployment decision |
| `REF-STEEL` | https://github.com/steel-dev/steel-browser | self-hostable browser sandbox/API for agent sessions | optional hosted/regional browser pool, not Node requirement |
| `REF-BROWSERBASE` | https://docs.browserbase.com/platform/browser/observability/session-live-view | managed browser sessions, persistent contexts and human live takeover | optional egress/provider path under Aksara privacy/session policy |
| `REF-PIKVM` | https://docs.pikvm.org/api/ | mature authenticated KVM video/HID/state APIs | KVM substrate only; Aksara adds machine/session authority, TTL, stop and reconciliation |
| `REF-LAPIS-PAMIR` | https://www.pamir.ai/ and https://shop.pamir.ai/products/lapis-one-white | integrated agent-computer/peripheral/KVM product pattern | product reference, not field/reliability/local-LLM proof |
| `REF-GUARDIAN-CONNECTOR` | https://docs.guardianconnector.net/overview/ and https://docs.guardianconnector.net/overview/design-principles/data-sovereignty/ | Indigenous guardianship connective infrastructure, community-controlled hosting, open formats and integration-first field data | integrate/partner for field data; Aksara adds conversational intelligence, memory, action and federation |
| `REF-COMAPEO` | https://awana.digital/comapeo | offline Indigenous territorial mapping/monitoring and peer-to-peer secured data sharing | integrate field observations/mapping rather than rebuild them |
| `REF-ERPNEXT` | https://docs.frappe.io/erpnext/integrating-erpnext-with-other-applications | self-hostable operational records with consistent REST DocType APIs/webhooks | cooperative/back-office system of record; Aksara remains intelligence/action layer |
| `REF-MOODLEBOX` | https://moodlebox.net/en/ | low-cost local/offline Moodle appliance and Wi-Fi learning server pattern | education substrate/reference, not Aksara Node replacement |
| `REF-EARTHRANGER` | https://www.earthranger.com/news/serca and https://support.earthranger.com/en_US/step-17-integrations-api-data-exports/earthranger-api | mature conservation field/command platform, offline/mobile direction, sensor/event APIs and SMART integration | integrate/partner; do not rebuild conservation operations |
| `REF-SENSORTHINGS` | https://ogcapi.ogc.org/sensorthings/overview.html | interoperable Thing/Sensor/Datastream/Observation/FeatureOfInterest semantics | semantic reference for Aksara Observation, not a mandatory server |
| `REF-HOMEASSISTANT-WYOMING` | https://www.home-assistant.io/integrations/wyoming | small protocol wiring local ASR/TTS/wake services into a device/room ecosystem | room/voice subsystem candidate behind Aksara audience/policy |
| `REF-ESPHOME` | https://esphome.io/components/voice_assistant/ | microcontroller voice-satellite/device integration and local control primitives | peripheral subsystem/reference; Aksara owns conversation identity/audience |
| `REF-FLEDGE` | https://fledge-iot.readthedocs.io/en/develop/storage.html | edge sensor buffering/storage and pluggable north/south services | field/industrial data-plane candidate; observation semantics remain Aksara/SensorThings-derived |
| `REF-BLUESKY` | https://blueskyproject.io/ | plan/run/document model for scientific experiments | research-pack execution substrate; research authority/review stays outside agent |
| `REF-OPHYD` | https://blueskyproject.io/ophyd/architecture.html | instrument/device abstraction for Bluesky | pack-level integration rather than rebuilding instrument drivers |
| `REF-LABGRID` | https://labgrid.readthedocs.io/en/stable/overview.html | controlled remote hardware test/automation infrastructure | research/hardware-test pack candidate |
| `REF-OPENFLEXURE` | https://openflexure.org/projects/microscope/ | accessible open instrument infrastructure | research/education reference, no implied diagnostic use |
| `REF-LF-EVE` | https://github.com/lf-edge/eve and https://eve-os.readthedocs.io/docs/SECURITY-HARDWARE/ | managed edge OS, TPM/attestation/vault/update/workload isolation patterns | later appliance/fleet bakeoff; does not replace Aksara institutional kernel |
| `REF-BALENA` | https://www.balena.io/os and https://blog.balena.io/queued-os-updates-managed-by-the-supervisor/ | mature edge fleet OS/update/device operations patterns | operations benchmark/alternative, not current P1 base |
| `REF-ANY` | https://docs.any.org/index.html and https://docs.any.org/understanding/architecture.html and https://github.com/anyproto/any-store | developer-preview local-first reactive database, FTS/vector indexes and embedded runtime direction | consolidation candidate below Aksara semantics; preview/auth/ops caveats block promotion |
| `REF-ANY-SYNC` | https://tech.anytype.io/any-sync/overview and https://github.com/anyproto/any-sync | encrypted CRDT local-first/LAN/P2P synchronization and self-hostable network | bakeoff input; Any space/account semantics never become Aksara authority implicitly |
| `REF-MCP-GATEWAY-REGISTRY` | https://github.com/agentic-community/mcp-gateway-registry and https://agentic-community.github.io/mcp-gateway-registry/ | governed registry/gateway for MCP, A2A, skills, inference and generic REST with credentials/scopes/audit | consolidation candidate; Aksara keeps institutional authority/budget/public-private semantics |
| `REF-AGNTCY` | https://docs.agntcy.org/ and https://dir.agntcy.org/latest/ | OASF metadata plus federated Agent Directory for framework-neutral agent/MCP/skill discovery | standards/reference before proprietary Aksara global capability directory |
| `REF-SMOLVM` | https://github.com/smol-machines/smolvm | portable hardware-isolated local microVMs, no daemon, network-off-default and egress allowlists | local heavy-worker isolation bakeoff; Aksara retains effects/credentials/artifacts |
| `REF-OPENCONNECTOR` | https://github.com/oomol-lab/open-connector | Apache-2.0 self-hostable connector catalogue with OAuth/API-key brokerage and MCP/HTTP/OpenAPI surfaces | generic connector substrate candidate; capability policy/receipts stay Aksara-owned |
| `REF-AGENT-DESKTOP` | https://github.com/lahfir/agent-desktop | Rust OS-accessibility-tree computer control with stable refs and CDP handoff | native-computer code donor; current macOS-first support blocks Linux-P1 dependency |
| `REF-MOSS-TRANSCRIBE` | https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize | 0.9B Apache-2.0 long-form ASR + timestamps + diarization + acoustic-event model | combined speech challenger; Indonesian/Papuan quality must be measured locally |
| `REF-VOXCPM2` | https://github.com/OpenBMB/VoxCPM | Apache-2.0 2B multilingual expressive TTS with Indonesian/Malay support and voice design/cloning | Node+ expressive candidate; does not replace CPU privacy floor; benchmark compute/RTF |
| `REF-K2-HORIZON` | https://ifm.ai/blog/k2/ and https://huggingface.co/collections/IFM/k2-horizon | Apache-2.0 0.9B/3.7B/7B+ model family with open training artifacts and tool/reasoning support | local cognition bakeoff; upstream benchmark claims require reproduction |
| `REF-TABDPT` | https://pypi.org/project/tabdpt/1.3.0/ and https://huggingface.co/Layer6/TabDPT | tabular in-context foundation model for classification/regression; v1.3 adds improved performance/probabilistic regression | evaluate against GBDT baselines on Aksara tables |
| `REF-TABICLV2` | https://github.com/soda-inria/tabicl and https://arxiv.org/abs/2602.11139 | open tabular FM checkpoints/inference for classification/regression, ICML 2026 | evaluate; verify exact commercial/license posture before deployment |
| `REF-FOUNDATIONFORECAST` | https://pypi.org/project/foundationforecast/ and https://timecopilot.dev/ | unified API over multiple time-series foundation models and reproducible evaluation tooling | capability substrate/code donor; not authority or scientific validation by itself |
| `REF-GRANITE-TS-R2` | https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r2 | ~385M probabilistic forecasting/imputation TSFM under permissive model licensing | time-series candidate; reproduce on local vertical data |
| `REF-CARBON-DNA` | https://huggingface.co/HuggingFaceBio/Carbon-3B and https://huggingface.co/HuggingFaceBio/Carbon-8B | 500M/3B/8B genomic foundation-model family for DNA/RNA research | Aksara Science watch; license/compute/domain validation required |
| `REF-FLUX3-ACTION` | https://bfl.ai/models/flux-3-action and https://github.com/black-forest-labs/flux-action | 7B open-weight world-action model with LeRobot adaptation path | research/robotics watch; FLUX Kommunity weight license and GPU cost block base use |
| `REF-FLINT` | https://github.com/microsoft/flint-chart | semantic chart intermediate language compiling to multiple web/office renderers with MCP support | deterministic visualization code donor for Aksara/Klerk |
| `REF-GEOLIBRE` | https://github.com/opengeos/geolibre | MIT local/private geospatial workspace using MapLibre + DuckDB-WASM across browser/desktop/mobile/Jupyter | field/science GIS adapter candidate; custody/state remain external/Aksara-governed |
| `REF-OPENMANET` | https://github.com/OpenMANET/docs and https://github.com/OpenMANET/firmware | Wi-Fi HaLow/OpenWrt IP MANET with mesh routing and optional GPS/PTT/camera services | future medium-bandwidth TransportPort candidate; regulatory/link-budget tests required |
| `REF-JETKVM-MINI` | https://jetkvm.com/products/jetkvm-mini | announced low-cost ESP32-P4X Ethernet KVM with 1080p capture and open-source firmware direction | watch until shipping; compare with mature PiKVM before promotion |
| `REF-LEMONADE` | https://github.com/lemonade-sdk/lemonade/releases | rapidly evolving local-AI server/runtime with strong AMD APU/NPU/GPU focus and multi-platform packages | Node+ bakeoff; pin known-good versions due high release velocity |
| `REF-ESP32-AI` | https://github.com/slvDev/esp32-ai | experimental flash-heavy tiny language-model inference pattern on ESP32-S3 | code-donor watch for compact classifiers/representations, not P1 chat model |
| `REF-DECIMEN` | https://github.com/bashalarmistalt/decimen-optical-transfer | fountain-coded animated-QR optical transfer experiment | low-priority air-gap/bootstrap reference only |

| `REF-COMPANY-BRAIN` | https://github.com/supermemoryai/company-brain | Apache-2.0 multi-user Slack/company-agent harness with durable execution, scoped/shared memory UX, approvals, schedules, MCP/apps and proactive team participation | high-priority code donor for Aksara multiplayer/channel shell; Aksara keeps canonical identity, memory authority, effects and offline/custody semantics |
| `REF-XIAOZHI` | https://github.com/78/xiaozhi-esp32 | MIT ESP32 agent-device firmware with wake/VAD/AEC, Opus/realtime voice transports, displays, cameras, battery/device support and MCP patterns | primary Card firmware/code donor; replace hosted semantics with Aksara session/privacy/device contracts |
| `REF-XIAO-SENSE` | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html | compact ESP32-S3 prototype board with PSRAM, camera/mic expansion, Wi-Fi/BLE, storage/battery-development path | immediate Card prototype core, not final production BOM |
| `REF-OMI-HW` | https://github.com/BasedHardware/omi/tree/main/omi/hardware/consumer | open wearable hardware/firmware/manufacturing references for RF, microphones, battery, charging, storage, haptics and mechanical production | industrialization/code donor; Aksara does not inherit Omi product/backend semantics |
| `REF-RESPEAKER-CLIP` | https://github.com/Seeed-Studio/reSpeaker_Clip and https://wiki.seeedstudio.com/respeaker_clip/ | open low-power wearable dual-mic/local-storage/Opus/Zephyr/DFU/power-management design | Card audio/storage/power donor and capture reference; not the complete Card architecture |
| `REF-FOLOTOY-PASSPORT` | https://ai-passport.folotoy.cn/en/ and https://github.com/FoloToy/ai-passport | low-cost badge-like ESP32/NFC/display/mic/speaker open-firmware interaction reference | UI/proportion/NFC prototype donor; no longer the primary Card substrate |
| `REF-CF-EMAIL` | https://developers.cloudflare.com/email-routing/ and https://developers.cloudflare.com/email-service/ | programmable inbound email routing/Workers and outbound email service patterns for managed domains | optional hosted email channel adapter; canonical `InstitutionActor`/identity/effects remain Aksara-owned |


---

# Appendix H — complete v0.9 research archive (NON-NORMATIVE)

> **Do not implement from this appendix when it conflicts with the v1 main body.** It is retained verbatim so no research rationale, candidate notes, product scenarios or historical freeze decisions are lost during the v1 consolidation. The v1 P1 Decision Register and normative sections above have precedence.

<details>
<summary>Expand the complete v0.9 catalogue archive</summary>

# Abstraksi / Aksara Open-Core Systems Catalogue

**Version:** v0.9.0  
**Status:** unified ground-truth candidate · open-core company/product consolidation · communal-intelligence substrate · P1/component/model bakeoffs tracked explicitly  
**Date:** 3 October 2026  
**Supersedes:** `Aksara_P1_Component_Stack_Catalogue_v0_8_1.md`  
**Canonical architecture companion:** `Abstraksi_Proposal_Whitepaper_v6_4.md`  
**Scope:** Abstraksi company and commercialization posture; Aksara open-source/open-core communal-intelligence substrate; Aksara Workbench; institutional second-brain behavior; work objects; trust domains and custodianship; software-only and local-node deployment profiles; principal-bound Aksara Card; multi-principal identity; GatheringSession/social grammar; cross-channel conversation lanes; institutional multiplayer shell; institutional kernel; cognition/runtime; memory and Memory Firewall; anticipation; graph; capability/plugin system; existing-system integration; vertical profiles; Aksara Science; ETNOS; experimental personal-goal systems; data-collection marketplace expansion lane; browser/computer-use Workstation Bridge; work-agent execution; document ingestion; model catalogue; observation/actuation contracts; hardware abstraction; Node threat model and key custody; backup/recovery; networking; Gateway egress/compute economics; branded physical interaction endpoints; cross-surface UI; simulator; federation; implementation order; and a living radar candidate ledger.

> **Reference convention.** Major architectural choices carry stable `REF-*` source pins. These are deliberately more durable than prose line numbers. A generated line map is appended at the end so the inspiration for a choice can be traced quickly even as the catalogue evolves.

---


# 0.0 Abstraksi company contract

Abstraksi is an **open-core infrastructure company building communal intelligence systems**.

The durable company thesis is not “sell an AI appliance,” “sell an agent harness,” or “build a proprietary model stack.” Abstraksi builds the shared computational substrate through which groups of people, institutions, places, software agents, knowledge stores and physical devices can remember, coordinate, deliberate and act together under explicit authority.

The unit of design is therefore broader than one user with one assistant:

```text
people + institution/community + shared state + authority + tools + agents + devices + place
                                      ↓
                           communal intelligence system
```

Aksara is the reusable substrate for that thesis. It should become more valuable as models, agent harnesses, UI protocols, device SDKs and commodity compute improve upstream. Abstraksi should **adopt, integrate or replace commodity layers aggressively** rather than defending implementations that the wider ecosystem can build better.

The company may also build focused products on top of this substrate. Those products are allowed to look much more opinionated than Aksara itself.

A useful company-layer model is:

```text
ABSTRAKSI
open-core infrastructure + applied communal intelligence systems
│
├─ Aksara Core
│  open communal runtime / institutional state / authority / sync
│
├─ Aksara Workbench
│  shared collaborative workspace and reference interface
│
├─ Domain products
│  ├─ Aksara Science
│  └─ later education / field / public-information / other focused products
│
├─ Public / network surfaces
│  └─ ETNOS and related observatory / commons / publication surfaces
│
├─ Experimental products
│  └─ personal-goal / trajectory system (working name formerly Elaris/Gate)
│
├─ Managed deployments
│  local nodes · hosted control plane · integrations · support · fleet operations
│
└─ Expansion lanes
   data collection / contributor marketplace · specialized datasets · field networks
```

**Portfolio rule:** do not force every idea into Aksara Core. If an experience has a clear user, job and interaction model, it may be a product over Aksara rather than another permanent primitive in the kernel.

**Continuity rule:** this reframing is a layer correction, not a demolition. Existing work on Aksara runtime, memory, policy, work objects, ETNOS, capability packs, surfaces, Node deployments, Aksara Science, field sensing and other components remains useful where it implements the revised boundaries.

---

# 0.1 Open-core boundary

Aksara's default strategic posture is **open source at the substrate, commercial at operation, deployment and focused product experience**.

The exact repository-by-repository licenses remain a legal/maintainer decision, but the intended boundary is:

| Layer | Default posture | Why |
|---|---|---|
| institutional contracts / schemas / protocols | open | interoperability and independent implementation |
| Aksara local runtime / kernel | open | trust, auditability, local sovereignty and adoption |
| Workbench reference client | open or source-available with a strong self-host path | avoid hostage-taking by the vendor; maximize ecosystem contribution |
| Device protocol / MCU SDK / reference firmware | open | commodity hardware should be easy to attach |
| Capability/Pack specification and pack tooling | open | packs should compose with the wider agent/tool ecosystem |
| simulator and conformance tests | open | alternative implementations must be testable |
| ETNOS federation/public protocol work | open | public coordination should not depend on one operator |
| managed cloud/control plane | commercial service | recurring operations, fleet, observability and support |
| managed deployments / support / integration | commercial service | Abstraksi carries operational responsibility |
| domain products such as Aksara Science | product-specific; may mix open client/core with paid managed features | value lives in workflow, data/evidence operations and execution |
| hardware deployment bundles | commercial | integration, QA, enclosure, logistics, warranty and field support |
| specialist data services / marketplace | commercial expansion lane | collection, rights, QA, provenance and distribution are operational businesses |

The core rule is:

> **Self-hosting Aksara should remain real, while paying Abstraksi should make operating it dramatically easier.**

Abstraksi must avoid creating an artificial dependency where a local institution loses its own memory, policies or work history merely because it stops paying for a hosted service.

---

# 0.2 What Aksara is — and is not

Aksara is an **open communal runtime and shared-work substrate**, not the commercial product by itself.

Its durable responsibilities are:

```text
shared institutional state
identity and principal binding
trust domains / custodianship
memory and evidence
authority / approvals / capability leases
work and commitments
sync / recovery / offline continuity
channel + device abstraction
agent/model/provider substitution
public/private publication boundaries
```

Aksara is **not** differentiated merely because it has:

- agents;
- a chat box;
- a kanban board;
- a canvas;
- generated UI;
- plugins;
- computer use;
- an ESP32;
- local models;
- a mini PC;
- a model router.

Those are increasingly commodity ingredients. The differentiation must emerge from how they are composed around **shared state, place, authority, continuity and real deployment conditions**.

Aksara should therefore be able to consume upstream standards and ecosystems wherever practical: MCP-style tools, app/plugin-style UI surfaces, A2A-style remote agents, existing scientific software, existing workflow systems, commodity hardware SDKs and whatever newer equivalents become dominant.

---

# 0.3 Aksara Workbench reference experience

The reference Workbench remains important even though generic workspace UI is not the moat.

It should make communal state legible and useful through a coherent collaborative environment:

```text
shared canvas / workspace
├─ channels / conversations
├─ documents / sources
├─ tasks / Paperclip-style kanban and WorkObjects
├─ decisions / approvals / receipts
├─ people / roles / audiences
├─ generated or pack-provided screens
├─ data / artifacts / notebooks where relevant
├─ agents / activity / hand-offs
└─ devices / rooms / public surfaces
```

The Workbench should feel like **one place where the institution works**, not a control panel for a bag of AI frameworks. Specialist packs may contribute their own screens, but those screens inherit Aksara identity, authority, provenance and lifecycle contracts.

“Capability Pack” should be understood as a packaging/conformance concept, not a claim that Abstraksi invented plugins. A pack may contain some combination of:

```text
tools + schemas + prompts/policies + UI/screens + workflows + data adapters
+ evaluations + permissions + hardware/instrument declarations
```

Where an upstream plugin/app format already solves part of this job, Aksara should adapt to it rather than recreate it.

---

# 0.4 Commercial model

Abstraksi should not depend on reselling model tokens as its primary margin. Model/API usage may be passed through, pooled or bundled, but it is an input cost rather than the company thesis.

Primary revenue lines:

1. **Managed deployments.** Design, install, configure, secure and operate Aksara for institutions and communities.
2. **Managed control plane / cloud.** Fleet management, backups, observability, remote support, governed model routing and optional hosted services while local sites retain an offline floor.
3. **Support and maintenance.** Updates, incident response, recovery, hardware replacement, security maintenance and operator training.
4. **Deployment bundles.** Pre-qualified compute, storage, UPS/networking and optional branded interaction endpoints sold as a supported system rather than as novel compute hardware.
5. **Domain products.** Focused software/workbench products such as Aksara Science, with product-specific subscriptions, deployments or institutional licenses.
6. **Integration and solution engineering.** Paid work connecting real institutional systems, with a strong bias toward reusable adapters, packs, tests and primitives.
7. **Data services / marketplace expansion.** Opt-in collection, curation, annotation, QA, rights/provenance and distribution of specialized datasets where the economics and governance are sound.

Internal rule:

> **Services should compile into product whenever possible.**

A deployment that teaches Abstraksi something reusable should leave behind a connector, pack, evaluation, schema, workflow, device driver, deployment recipe, localization asset or other reusable primitive. Bespoke consulting that never improves the platform is accepted only when it is consciously priced and scoped as bespoke work.

---

# 0.5 Competitive doctrine: localize the frontier, do not worship novelty

Crowding is not by itself a reason to abandon a useful product category. Similar products launch constantly; users still choose based on **taste, execution, reliability, distribution, trust, localization and fit**.

Abstraksi should not try to outrun frontier labs at generic model research, generic agents or generic AI workspaces. It should instead practice a deliberate **commodity-in / situated-system-out** strategy:

```text
fast-moving global frontier
models · agents · plugins · device SDKs · computer use · scientific tools
                         ↓ adopt / integrate / replace
                 Aksara open substrate
                         ↓ contextualize
Papua / Indonesia / Melanesia / low-resource and institutional operating reality
                         ↓
             focused products and deployments
```

This means:

- use upstream infrastructure when it is good enough;
- fork only when the local semantic or operating gap is real;
- build polished localized experiences even in categories that look “saturated” globally;
- prefer problems whose last mile is poorly served by global defaults;
- treat design quality and product taste as legitimate differentiation;
- keep models/providers replaceable;
- avoid creating internal prestige around rebuilding commodity infrastructure;
- preserve the option to sell outside Papua wherever the same operating constraints recur.

The strongest moat is expected to be cumulative rather than singular: deployment experience, trusted local relationships, reusable institutional workflows, domain evaluations, multilingual/localized UX, field reliability, public knowledge networks, contributor ecosystems and the installed base.

---

# 0.6 Expansion lane: data collection and contributor marketplace

Abstraksi should explicitly retain the option to expand into a **data collection marketplace / contributor network**.

This is not required for P1 Aksara and should not be forced into the runtime, but it fits the broader infrastructure thesis because many valuable systems in Papua and comparable regions fail at the data-acquisition layer.

Possible demand:

```text
speech / language
image / video
3D / spatial capture
documents / OCR ground truth
biodiversity / bioacoustics
environmental and infrastructure observations
agriculture / field measurements
human preference / evaluation tasks
specialized scientific samples and metadata
```

Possible supply:

```text
individual contributors
schools / universities
local research groups
communities / customary institutions
field teams
NGOs / civil-society organizations
small specialist contractors
```

The marketplace must treat **consent, community authority, provenance, licensing, benefit sharing, withdrawal/correction, privacy and data residency** as product primitives rather than paperwork added after collection.

Abstraksi may earn through collection fees, QA/curation, managed campaigns, enterprise access, dataset licensing or revenue sharing. Dataset ownership is not assumed to transfer merely because Abstraksi operated the marketplace.

Aksara and ETNOS can support the marketplace without becoming the marketplace: Aksara may host governed local collection/review workflows; ETNOS may surface public calls, contributor communities and deliberately public datasets/results.

---

# 0.7 Hardware doctrine: infrastructure first, identity second

Abstraksi is **not** primarily pursuing a proprietary hardware ecosystem.

Compute, radios and commodity controllers should be purchased, refurbished, white-labelled or replaced whenever that lowers cost and risk. Aksara should run well on existing servers, refurbished Tiny/Mini/Micro PCs, modern mini PCs, Raspberry-Pi-class devices where appropriate, and future commodity platforms.

Hardware becomes justified when it improves one of:

```text
offline continuity
local custody / security
repairability
power / networking resilience
physical interaction
field sensing / actuation
installation simplicity
supportability
```

If Abstraksi sells a physical unit, however, it should still have a **coherent Abstraksi/Aksara industrial identity**. Off-the-shelf internals do not imply a random pile of visible donor hardware.

Commercially sold deployments should converge on:

- coherent enclosure families / faceplates / labels;
- consistent material, typography and interaction language;
- serviceable fasteners and clear field-replacement paths;
- explicit disclosure of replaceable underlying compute where relevant;
- standardized ports, power and mounting where practical;
- white-label or custom casing around commodity internals when the economics justify it;
- one visual family across Node, Presence Surface, Information Surface and future field devices.

Industrial design is **TBD and downstream of the deployment contract**. Abstraksi should not commit to custom boards, custom compute or expensive tooling until repeated deployments prove that commodity internals plus coherent enclosures are insufficient.

---

# 0. Aksara system and deployment contract

Aksara is the **open-source/open-core local-first communal and institutional intelligence substrate** for communities, teams and local institutions. It is not positioned as a proprietary appliance or a generic agent product. Its purpose is broader than workflow automation: it should make shared knowledge easier to retrieve and use, preserve continuity across people and time, surface relevant context, support coordination, connect digital and physical channels, and help carry consequential work into accountable action.

The system contract for v0.9 remains intentionally concrete:

- **Ask and understand:** answer questions against authorized institutional sources with citations and uncertainty.
- **Remember and continue:** preserve approved facts, decisions, obligations, relationships and history without treating every conversation as memory.
- **Surface what matters:** show deadlines, unresolved obligations, relevant prior decisions and other context when policy permits.
- **Coordinate:** route requests, people, documents and capabilities across teams or institutions.
- **Act under control:** prepare or execute bounded work only through explicit authority, approval and receipt semantics.
- **Remain useful under weak infrastructure:** preserve a deterministic/offline floor when WAN access or cloud inference is unavailable.

A `WorkObject` is therefore **not the ontology for every interaction**. It is the operational envelope used when an observation, question, request, decision or obligation acquires an owner, state, due date, approval requirement, external effect or follow-up. Ordinary retrieval, exploration and conversation may remain outside a `WorkObject`.

Common operational spine when work exists:

```text
question / observation / request
        ↓
authorized context + evidence
        ↓
optional WorkObject
        ↓
proposal / decision request
        ↓
authorized action or hand-off
        ↓
destination receipt / outcome
        ↓
follow-up / correction / closure
```

The architecture is organized around four product planes:

| Plane | Responsibility |
|---|---|
| **Cognition** | sources, approved memory, retrieval, reasoning, temporal context, associative recall and proactive preparation |
| **Work** | work objects, ownership, deadlines, proposals, approvals, external actions, receipts and follow-up |
| **Presence / commons** | web, phone, messaging, voice, room Node, ETNOS and cross-institution discovery/coordination |
| **Sovereignty / control** | identity, trust domains, custodianship, policy, storage placement, offline authority, audit, backup and recovery |

The first deployed experience should be focused even though the platform remains broad. A P1 institution should be able to complete one real daily loop well, while the same runtime still supports question answering, institutional memory and other capability packs. Product validation is based on repeated use and measured outcomes, not on the number of enabled components.

### Deployment profiles

Aksara is software; the Node is an important deployment profile rather than a mandatory purchase. **Physical Interaction Endpoints** provide optional place-bound embodiment, while the **Card** remains the portable principal-bound endpoint. Either can be useful even where dedicated Node hardware is unnecessary.

| Profile | Intended environment | Core value |
|---|---|---|
| **Existing infrastructure / hosted** | institutions with reliable devices, networks and servers | Aksara runtime on existing infrastructure; web/phone/email/messaging remain first-class; optional Physical Endpoints/Cards add embodied interaction |
| **Aksara Node Core** | places that benefit from local compute, local storage or intermittent connectivity | offline continuity, local custody, LAN service, local inference and trust anchor without requiring a built-in display |
| **Node + Physical Endpoint(s)** | schools, clinics, offices, homes and community sites wanting local sovereignty plus shared physical interaction | one local compute/custody appliance serving one or more Presence/Information endpoints |
| **Node Complete** | small business/home/communal sites wanting one coherent appliance | Node Core + integrated Information/Presence surface(s) + shared interaction hardware |
| **Existing compute + Physical Endpoint(s)** | digitally mature offices, schools, clinics, labs and organizations | reuse installed compute while adding Aksara room/public interaction surfaces |
| **Targeted Cards** | mobile/key personnel where portable identity/capture/approval/private handoff is valuable | principal-bound interaction without assuming universal per-person hardware |
| **Commons / federation** | communities and institutions participating in ETNOS/A2A | public coordination, discovery and governed artifact exchange with separate inference budgets |

The Node remains strategically important for the original Papua deployment thesis: in sites where computers, reliable connectivity or local servers are still scarce, it may be the institution's local server, archive, inference endpoint, sync queue and trust anchor. In well-provisioned environments, those functions may run on existing infrastructure while Abstraksi Physical Endpoints provide room/public embodiment. The Card does not turn into a miniature autonomous agent computer; it is normally a lightweight principal-bound endpoint served by a nearby Node, existing Aksara deployment or authorized Gateway.

A useful deployment gradient is therefore:

```text
low infrastructure             hybrid institution                 digitally mature
Node Complete / Node+surfaces → Node/server + surfaces/Cards → existing compute + surfaces
+ local LAN                     + PCs/phones                       + normal digital channels
```

### User-facing product grammar

The default product surface should emphasize a small set of durable concepts rather than exposing the component catalogue:

```text
Ask · Today · Work · Sources · People · Decisions
```

Every consequential proposal should show the evidence used, current audience, uncertainty where material, next responsible person or system, and whether the result is merely prepared, approved, submitted or accepted by the destination system.

---

# 0B. Place, presence and experience contract

Aksara has four recurring interaction contexts. These are **experience modes, not new ontology objects**:

| Context | Typical surface | Default audience posture |
|---|---|---|
| **Private / with me** | phone, web, private voice lane | current principal only unless explicitly shared |
| **Shared place** | room Node, larger display, meeting interface | room/shared audience; private detail is suppressed or handed to a personal surface |
| **Governed knowledge** | archive, sources, memory review | trust-domain and custodian policy |
| **Between places** | ETNOS, A2A/institution exchange, export bundle | explicit publication or `SharingGrant`; never implicit access to source vaults |

Moving between contexts re-evaluates actor, audience and authority. A room session must not silently inherit a person's private account permissions, and a public ETNOS interaction must not inherit an institutional staff lane.

For any shared physical interaction endpoint (including one integrated into a Node Complete SKU), the minimum **Presence Contract** is:

1. users can tell whether the microphone path is physically enabled;
2. listening, processing and speaking states are distinguishable without relying on colour alone;
3. the current audience and private-handoff option are understandable;
4. a physical stop/mute control has defined semantics independent of the model;
5. loss of WAN changes the available capability set visibly rather than pretending the service is unchanged;
6. the communal display does not expose names, case existence or restricted status through text or distinctive animations;
7. private continuation can move to a phone/web/Card session without copying private context into the room lane.

A communal Presence Surface remains a presence/state surface, not the place for detailed consent, evidence review or consequential approvals. Those move to a personal or larger authenticated surface; an Information Surface may show richer public/shared material only when its effective audience permits it.

---

# 0C. Social, gathering and physical-presence grammar

Aksara's physical and social behavior should generalize across office meetings, Balai deliberations, classes, shift handovers, field briefings, interviews, service counters and research sessions. The product therefore does **not** define a permanent “meeting-room endpoint” as a core object. It uses existing Nodes, Cards, phones, PCs and other surfaces inside temporary session context.

## 0C.1 Shared Physical Endpoints and Card have different social jobs

The simplest product rule is:

> **Shared Physical Endpoints are place/audience-bound; Card is principal-bound. Node is infrastructure unless an endpoint is integrated into it.**

A Presence/Information endpoint presents room/institution/public-safe state, shared voice and bounded sensing appropriate to its effective audience. A Card represents one principal/device binding and can carry private prompts, approvals, haptics, capture authority and personal handoff. A Node Complete may physically combine these roles, but enclosure integration does not collapse their authorization semantics.

## 0C.2 `GatheringSession` is a session profile, not a new authority root

A `GatheringSession` composes existing Aksara semantics for temporary co-presence:

```text
GatheringSession
  session_id
  ConversationLane / TrustDomain / Purpose
  participants + claimed roles
  current audience
  Aksara social role
  active Capability Leases
  capture source(s)
  live artifacts / transcript
  draft decisions / actions
  privacy + retention policy
  private handoffs
```

It does not replace `ConversationLane`, `AccessContext`, `WorkObject`, `CapabilityLease` or identity binding. A meeting can create WorkObjects, but ordinary discussion does not become a case simply because Aksara was present.

Useful Aksara social-role profiles include:

| Role | Default behavior |
|---|---|
| **SCRIBE** | capture/structure; rarely interrupt |
| **FACILITATOR** | agenda/time/clarification/participation cues |
| **RESEARCHER** | retrieve/check facts when asked or when configured relevance is high |
| **WITNESS** | preserve agreed evidence/decisions without turning every utterance into fact |
| **TRANSLATOR** | mediate language continuously within audience/privacy policy |
| **COORDINATOR** | turn accepted decisions into owners, WorkObjects and follow-up |
| **OBSERVER** | capture or prepare context without proactive speech |

These are policy/interaction profiles, not personas with independent authority.

## 0C.3 Capture is leased, explicit and singular by default

One physical gathering should normally have **one elected primary audio source**. A `CapabilityLease(capability=capture.audio)` binds that source to the current gathering, actor/purpose and retention policy. Remote participant tracks can remain separate because they are genuinely distinct sources; nearby Cards do not each stream the same room merely because they can.

Example:

```text
Head: “Nanti Maria pu kartu yang rekam saja.”
        ↓
Aksara proposes CaptureLease to Maria
        ↓
Maria's Card vibrates / shows approval
        ↓
Maria approves
        ↓
that Card becomes primary room capture for this GatheringSession
```

If the capture device leaves, loses power or is revoked, Aksara may propose transfer; it does not silently switch to another person's microphone.

Proximity/group detection may later create a **gathering candidate** (for example several recognized Cards remaining close together), but proximity is never consent to record, authenticate a person or create institutional memory.

## 0C.4 Physical proactivity uses an attention ladder

Speech is socially expensive. Aksara should be able to become useful without interrupting the room. The default escalation ladder is:

```text
0 ambient / invisible
1 peripheral presence change (matrix/light)
2 private haptic/Card cue
3 shared visual cue (“relevant context available”)
4 request the floor / short earcon
5 verbal interjection only when the current role/policy allows it
```

The same semantic state can render differently across MatrixUI, Card display/haptic, phone/web and future e-ink/RLCD variants. This extends the existing Interface Contract rather than creating a separate physical UI ontology.

---

# 0A. Executive architecture posture

P1 is the first real Aksara deployment target, not a disposable demo.

The architectural rule remains:

> **Freeze institutional meaning and contracts. Keep models, harnesses, providers, memory indexes, device runtimes, and specialist capability implementations replaceable.**

v0.6 keeps one durable public/institutional Aksara identity as the human-facing model while separating it from internal trust and deployment boundaries:

> **An institution may present one durable Aksara actor while containing multiple trust domains, custodians, devices, roles, channels, conversation lanes and temporary runtimes. Public identity does not imply common access to all institutional data.**

Aksara therefore separates **InstitutionActor**, **Tenant**, **TrustDomain**, **DataCustodian**, **Node**, **GovernanceNamespace**, **Principal**, **IdentityBinding**, **ConversationLane**, **WorkObject**, **AccessContext**, **MemoryRecord** and **Runtime**. A persistent relationship does not require one eternal transcript, and a persistent transcript does not require a persistent process. [REF-VELLUM-IDENTITY] [REF-OPENCLAW] [REF-HERMES]

P1 still avoids cluster machinery on the base Node. Narrow capabilities run under Wasmtime/WASI; richer local jobs run in bounded local workspaces; AX + Agent Substrate is an optional Node+/cluster backend behind the same `WorkAgentRuntime` contract. [REF-AX] [REF-AGENT-SUBSTRATE] [REF-INTENT]

v0.6 carries forward the v0.5.1 security/recovery/voice hardening and clarifies product focus, deployment profiles and the minimum operated stack. It adds explicit trust-domain/custodianship semantics, a bounded WorkObject grammar, existing-system adapter contracts, a focused product proof sequence, and a measured TypeScript/Rust resident-loop baseline **alongside**, not instead of, Vellum, Hermes, Strands and the existing harness candidates.

The status label is intentionally narrower than “the stack is frozen.” **Product semantics, safety invariants and ports are the freeze candidate; concrete runtimes, models, parsers, backup clients, attestation implementations and providers remain in bakeoff until measured.**


The capability ecosystem may be polyglot, but the **base deployed Node should be operationally small**. A normal P1 image should aim for one Rust system service/process group, one TypeScript application/cognition service, SQLite/files, and optional Python workers started only for capabilities that require the Python ML ecosystem. Additional languages and runtimes remain behind stable ports rather than becoming always-on peers.

The system is polyglot only where the boundary corresponds to a real trust, ecosystem, or deployment boundary:

- **Rust** owns the small trusted institutional/hardware substrate. [REF-RUST] [REF-TOKIO]
- **TypeScript** owns Vellum integration, Cloudflare/web surfaces, simulator plumbing, and fast-moving agent/application code. [REF-VELLUM]
- **Python** owns scientific/ML capability implementations where the ecosystem is materially stronger. [REF-PYDANTICAI]
- **WASM/WASI** is the preferred narrow capability ABI and sandbox. [REF-WASMTIME] [REF-WASI-CM]
- **Bend 2** is an experimental runtime for pure, deterministic, AI-generated capability kernels with machine-checkable laws; it is not the kernel. [REF-BEND]

The physical P1 remains modular:

```text
Aksara Node Core
  ├─ refurbished x86-64 Tiny/Mini/Micro PC
  ├─ 32 GB RAM baseline; 64 GB Node+ supported
  ├─ independent ESP32-S3-class Node Controller
  ├─ local durable institutional state
  ├─ modular audio/vision/surface I/O
  ├─ optional fingerprint/navigation experiment
  ├─ optional isolated KVM lab module
  └─ offline-first operation

Physical Interaction Endpoints
  ├─ Presence Surface: 64×64 HUB75 or diffused RGB + room interaction
  ├─ Information Surface: 7.5-inch class e-paper + public/shared interaction
  └─ may be standalone, distributed or integrated into Node Complete

Aksara Card
  ├─ P0/P1 prototype: XIAO ESP32-S3 Sense + Xiaozhi-derived firmware
  ├─ principal-bound identity/session endpoint
  ├─ mic + speaker + small display + haptic + bounded still capture
  ├─ Wi-Fi/BLE + NFC + local queue/storage
  └─ physical sensor privacy controls

Abstraksi Gateway
  └─ governed egress + model/provider perimeter
```

The Card hardware path borrows industrialization patterns from Omi, audio/storage/power-management patterns from reSpeaker Clip and interaction lessons from FoloToy AI Passport rather than adopting any one product wholesale. [REF-XIAOZHI] [REF-XIAO-SENSE] [REF-OMI-HW] [REF-RESPEAKER-CLIP] [REF-FOLOTOY-PASSPORT]

---

# 1. Hard invariants

1. **Identity is not role. Recognition is not authorization.**
2. **Ephemeral conversation is the default.** Persistence requires the Memory Firewall path.
3. **The model may propose memory. Policy decides whether memory persists.**
4. **The model is never institutional authority.**
5. **The institutional graph may be cyclic and temporal. A concrete execution plan is an acyclic DAG.**
6. **Capabilities remain stable while implementations may change.**
7. **A Capability Lease is scoped, time-bound authority to use a capability.**
8. **Conversation input is not authority.**
9. **External cognition is permitted only through governed egress.**
10. **Private institutional memory does not automatically become ETNOS/public content.**
11. **Offline continuity is a first-class operating mode.**
12. **The simulator uses real contracts and is an integration/failure-rehearsal harness, not evidence of product validation.**
13. **The institution is persistent. Agent processes and subagents may be temporary.**
14. **Source, evidence, policy, authority, capability, decision, and outcome remain distinct concepts.**
15. **Derived indexes, summaries, embeddings, triggers and graph projections are rebuildable. They are not canonical truth.**
16. **Memory activation is not authority to act.**
17. **Predictive systems may prepare and surface work; consequential actions still pass policy, approval and execution gates.**
18. **One institution may present one durable Aksara institutional identity; personnel do not each become separate institutional Aksaras, and restricted trust domains may still remain distinct behind that identity.**
19. **Principal, role, device, channel identity, lane owner, acting actor, initiator and audience are distinct.**
20. **Relationship continuity is not conversation continuity.** One principal may have many lanes; lanes may be reset without erasing durable relationship/work state.
21. **Cross-channel identity linking is explicit and verified.** A phone number, email, Edge credential or ETNOS account is an `IdentityBinding`, not the person itself.
22. **Authorization filters the candidate memory domain before retrieval.** Retrieval never searches secrets first and apologizes later.
23. **Audience is part of authorization.** A response may use only information permitted for the response's effective audience or a policy-approved transformation of it.
24. **Memory type is not visibility.** Episodic/semantic/procedural/resource/etc. describe meaning; personal/team/case/institution/restricted/public describe governance.
25. **Visibility is not retention.** Casual interpersonal chatter can remain ephemeral even when all participants could technically see it.
26. **Classifier output is evidence for policy, not the security boundary.** Jev-like scorers may propose persistence/sensitivity/scope/retention; deterministic policy owns enforcement. [REF-AIM-MULTIUSER]
27. **Conversation history is not automatically institutional memory.** Durable memory is produced through the Memory Firewall with provenance, time, scope and retention.
28. **Conversation isolation is not runtime isolation.** A separate thread sharing a filesystem/credential sandbox is not a security boundary. [REF-OPENHANDS]
29. **A local work agent never receives ambient access to the Node root, canonical memory vault or service manager.**
30. **Current-turn actor identity is explicit.** A conversation's resting/owner principal may seed hydration but may not silently substitute for authorization. [REF-VELLUM-IDENTITY]
31. **Ingress identity/trust is resolved before cognition.** Runtime code consumes a stamped identity/access verdict rather than re-inferring it from prose or usernames.
32. **Native harness memory is non-sovereign.** Vellum/Hermes/OpenClaw memory may assist cognition only through the Aksara memory adapter; canonical institutional persistence stays in Aksara.
33. **External memory engines are derived backends.** They may be rebuilt, replaced or disabled without losing authoritative institutional records.
34. **Initiator matters.** A human-triggered action, unattended routine, delegated child agent and federation request may operate under different authority even when associated with the same person. [REF-OPENBOT]
35. **Programmatic tool code is orchestration, not authority.** Generated control flow may compose already-allowed capabilities, but every external effect still crosses `aksara-execd`, policy and lease checks. [REF-MONTY]
36. **System-One is an optimization layer, not a P1 dependency.** Deterministic routing and resident cognition remain valid fallbacks; compact scorers are promoted only after Aksara-specific traces show measurable value. [REF-SYSTEM-ONE-OPEN] [REF-OPEN-JEV-FINETUNE]
37. **Office-agent edits are candidates until promoted.** An isolated document worktree or agent revision cannot silently replace the authoritative institutional artifact. [REF-UNIVER]
38. **Diarization is not identity.** A speaker channel is evidence about who spoke when, never authentication or authority by itself. [REF-NEMOTRON-DIAR]
39. **InstitutionActor, Tenant, TrustDomain, DataCustodian, GovernanceNamespace and Node are distinct.** Public representation, operations/billing, cryptographic/data boundaries, stewardship, social governance and deployment topology may differ.
40. **One Node may host several trust domains; one trust domain may span several Nodes.** Storage placement follows policy and custodianship rather than device ownership.
41. **A WorkObject is not required for every conversation.** It becomes canonical when work acquires ownership, state, deadline, decision, external effect or follow-up.
42. **Offline authority is bounded in time and scope.** Consequential commits recheck actor, audience, mandate, resource version, policy epoch and lease before effect; stale authority degrades safely.
43. **The base Node is operationally small even when the capability ecosystem is broad.** Specialist runtimes, graph services and ML workers are activated only when a measured capability requires them.
44. **Existing systems of record remain authoritative where they already exist.** Aksara distinguishes prepared, approved, submitted and destination-accepted states and records the destination receipt or manual hand-off.
45. **Federation grants reachability, not access to protected data, tools or compute.** Each receiving trust domain applies its own sharing, capability and inference policy.
46. **A derived memory mechanism must earn promotion against a simpler baseline.** FTS, explicit facts and timeline retrieval remain valid fallbacks when graph, associative or predictive layers do not improve measured outcomes.

---

# 2. Adoption taxonomy

| Status | Meaning |
|---|---|
| **FREEZE** | Architectural choice. Build contracts around it. |
| **ADOPT** | Default implementation unless testing finds a blocker. |
| **PROTOTYPE** | Strong candidate; prove with a bounded spike. |
| **EVALUATE** | Keep behind an interface and benchmark alternatives. |
| **RESEARCH** | Frontier direction; no P1 dependency. |

---

# 2A. Current decision precedence

This catalogue deliberately keeps historical decisions and deliberation instead of rewriting the record after every bakeoff. To prevent implementers from accidentally deploying the union of every previous choice, **current status is resolved in this order**:

1. §55 current v0.8.1 physical-endpoint freeze decisions;
2. §54 current v0.8 systems/model/science freeze decisions;
3. §45 v0.7 physical/social freeze decisions where not superseded by §55;
4. §41 v0.6 base freeze decisions;
5. §26A Consolidation Decision Register;
6. §26 Primary + alternative register;
7. newer section-specific status text;
8. historical freeze/change sections only as rationale.

Status words have one meaning:

| Status | Meaning |
|---|---|
| **FREEZE** | semantic/product invariant for the current release candidate |
| **ADOPT** | default implementation hypothesis; replacement still possible behind the stable port |
| **PROTOTYPE** | implement enough to exercise real scenarios; not yet operational default |
| **EVALUATE** | same-fixture bakeoff or integration spike required before promotion |
| **RESEARCH** | keep on the roadmap/reference ledger; do not add to the base deployment |

A broader framework may consolidate several implementation responsibilities without acquiring the institutional authority represented by those components. Conversely, retaining a semantic box in the architecture does not require a dedicated process, database or library for that box.

---

# 3. Canonical system tower

The tower below is an implementation view of the four product planes. The base deployment does not require every optional component to run continuously.

```text
                         PEOPLE / COMMUNITY / PEERS
                                   │
          ┌──────────────┬───────────────┬───────────────┐
          ▼              ▼               ▼               ▼
      Voice / Card      Web / App      Messaging/Email    ETNOS / A2A
          │              │               │               │
      LiveKit +       AG-UI/A2UI      channel shell    federation/adapters
      device runtime      │               │               │
          └──────────────┴───────────────┼───────────────┘
                                   ▼
                            INGRESS / GATEWAY
                    identity binding + audience
                      + channel/lane resolution
                                   │
                                   ▼
                        ACCESS / TURN CONTEXT
      Principal · Membership/Role · Initiator · Audience · Purpose
 TrustDomain · DataCustodian · ConversationLane · WorkObject · DataClass
                                   │
                                   ▼
                    RESIDENT COGNITION PORT
                 Vellum current target; measured bakeoff
                                   │
                 ┌─────────────────┼──────────────────┐
                 ▼                 ▼                  ▼
            PydanticAI          Graphiti         Context Assembler
       specialist workflows   temporal graph            │
                 │                 │            ┌───────┼─────────┐
                 │                 │            ▼       ▼         ▼
                 │                 │       Continuity Trigger   Search
                 │                 │          Tree      Index  FTS/vector
                 │                 │       OptMem/TiMem T-Mem
                 └─────────────────┴──────────────┬───────────────┘
                                                 ▼
╔══════════════════════════════════════════════════════════════════════╗
║                       AKSARA KERNEL · RUST                          ║
║ InstitutionActor · Tenant · TrustDomain · DataCustodian · Node       ║
║ Principal · IdentityBinding · ConversationLane · GatheringSession*     ║
║ WorkObject · AccessContext · SharingGrant · OfflineAuthorityEnvelope  ║
║ Memory Firewall · Institutional State · Evidence · Ledger · Outbox    ║
║ Capability Registry · Interface Contract · Sync Semantics           ║
╚═══════════════════════════════════╤══════════════════════════════════╝
                                    │
                              Cedar authorization
                                    │
                               Biscuit lease
                                    │
                                    ▼
                              aksara-execd
                                    │
             ┌──────────────────────┼───────────────────────┐
             ▼                      ▼                       ▼
       Wasmtime / WIT       Local Workspace Worker    WorkAgentRuntime
      narrow capability      bounded OS workspace        backend
             │                      │                 ┌────┴─────┐
             │                      │                 ▼          ▼
             │                      │                AX       remote
             │                      │                 │
             │                      │          Agent Substrate
             │                      │          gVisor / microVM
             └──────────────────────┼────────────────────────────┘
                                    ▼
                              Capabilities / Devices
                                    │
                     WoT · embedded-hal · Zenoh

WORLD-SIDE ANTICIPATION / IRAMA
calendar · deadlines · thresholds · TimesFM/TTM · JEPA representations
                            + Horizon signals
                                    │
                                    ▼
                          Institutional Event
                                    │
                                    ▼
                         Associative Trigger Index
                                    │
                                    ▼
                      decision.score(memory.activation)
                                    │
                                    ▼
                      preload / surface / prepare

Northbound perimeter:
external agents / tools / models ↔ agentgateway ↔ Aksara

External capability discovery:
Aksara Capability Registry ← governed import/wrapping ← MCP Registry / Alexandria

Derived memory backends:
authoritative Aksara records → Graphiti / FTS-vector / Continuity / Triggers
                           └→ optional Caura profile on Node+/hosted
```

`GatheringSession*` above is a session profile/composite over existing lane/context/lease semantics, not a new independent authority root. AG-UI remains event/state plumbing; A2UI and the Aksara Interface Contract drive rich-client rendering; MatrixUI is the deterministic 64×64 renderer. Intent's typed interactive-diagram work is a reference for richer `ViewPrimitive` semantics, not a replacement for the Interface Contract. [REF-AGUI] [REF-A2UI] [REF-INTENT-DIAGRAMS]

**Why this composition matters:** identity answers *who is acting*; the lane answers *where this interaction belongs*; audience/purpose answer *which authorized view may be constructed*; Graphiti answers *what is related and when*; the Continuity Tree answers *what level of past detail is needed*; the Trigger Index answers *when otherwise unrelated memory becomes relevant*; Irama predicts or detects *what situation is happening or approaching*. None is institutional truth by itself. [REF-GRAPHITI] [REF-OPTMEM] [REF-TIMEM] [REF-TMEM]

---

# 4. Language boundary

**Deployment rule:** capability implementations may use the strongest ecosystem for the job, but the normal P1 image should minimize always-on runtimes. Polyglot capability breadth is acceptable; polyglot operational dependence on every request is not.

## 4.1 Rust: small trusted nucleus

**Status: FREEZE**  
**Source pins:** [REF-RUST] [REF-TOKIO]

Rust owns:

- institutional state transitions,
- Actor Context resolution,
- Memory Firewall policy path,
- authority inputs,
- Capability Lease validation,
- ledger/outbox records,
- governed execution,
- device/hardware boundary,
- update/recovery services,
- deterministic MatrixUI rendering.

Rust deliberately does **not** own prompts, ordinary conversation loops, web UI, research orchestration or provider-SDK churn.

## 4.2 TypeScript

**Status: FREEZE**

TypeScript owns Vellum adaptation, simulator/web/Card surfaces, AG-UI/A2UI integration, Cloudflare deployment glue and high-churn provider/tool integrations.

## 4.3 Python

**Status: FREEZE**

Python owns specialist ML/scientific capabilities, PydanticAI workflows, PyTorch/Hugging Face research code and evaluation harnesses. [REF-PYDANTICAI]

## 4.4 Bend 2

**Status: RESEARCH, contract-visible**  
**Source pin:** [REF-BEND]

Use only for pure, deterministic, parallelizable capability kernels where AI-generated code plus explicit laws/proofs has real value.

Candidate future jobs:

```text
evidence.closure
graph.constraint_check
graph.subgraph_compile
ranking.aggregate
schedule.optimize
signal.transform
image.tile_process
scientific numeric kernels
```

A Bend implementation still passes the same capability manifest, policy, provenance, test and lease boundaries.

---

# 5. Repository strategy

**Status: FREEZE**

Three first-party repositories:

1. `abstraksi` — polyglot monorepo for Aksara/Klerk substrate, simulator, kernel, runtimes, packs, firmware and contracts.
2. `etnos` — separate public/federated product.
3. `plakat-hardware` — enclosure, PCB, wiring, manufacturing, physical BOM and qualification.

Optional upstream forks exist only when a thin adapter is insufficient.

```text
abstraksi/
├── Cargo.toml
├── pnpm-workspace.yaml
├── pyproject.toml
├── proto/
├── wit/
├── schemas/
├── crates/
│   ├── kernel/
│   ├── identity/
│   ├── lane/
│   ├── access-context/
│   ├── state/
│   ├── memory/
│   ├── trigger-index/
│   ├── graph/
│   ├── policy/
│   ├── lease/
│   ├── ledger/
│   ├── outbox/
│   ├── surface/
│   ├── view/
│   ├── matrix-ui/
│   ├── capability-host/
│   ├── device/
│   └── sync/
├── services/
│   ├── aksarad/
│   ├── aksara-execd/
│   ├── aksara-hwd/
│   └── aksara-updated/
├── runtime/
│   ├── vellum/
│   └── hermes/              # P0/P1 development adapter; not canonical state
├── adapters/
│   ├── etnos/
│   ├── a2a/
│   ├── activitypub/
│   ├── channels/
│   ├── caura/
│   ├── alexandria/
│   └── gateway/
├── apps/
│   ├── cli/                 # thin universal operator/agent client
│   ├── simulator/
│   ├── console/
│   └── card-sim/
├── python/
│   ├── sdk/
│   ├── models/
│   └── capability-workers/
├── packs/
│   ├── capabilities/
│   ├── graphs/
│   └── domains/
├── firmware/
└── scenarios/
```

---

# 6. Contract stack

## 6.1 Process/network contracts

**Primary:** Protobuf Editions + Buf + ConnectRPC.  
**Status:** PROTOTYPE → likely ADOPT.  
**Source pin:** [REF-CONNECT]

Use for Rust ↔ TS ↔ Python services, browser-compatible RPC where appropriate, streaming interfaces, generated clients and compatibility checks.

## 6.2 Capability ABI

**Primary:** WIT + WebAssembly Component Model + Wasmtime.  
**Status:** ADOPT progressively.  
**Source pins:** [REF-WASI-CM] [REF-WASMTIME]

MCP is an interoperability protocol, not the pack ABI.

## 6.3 MCU protocol

**Status: FREEZE**

Versioned binary USB protocol, CBOR initially, with message IDs, explicit versioning, idempotency and bounded payload sizes.

---

# 7. Trusted kernel and governed execution

## `aksarad`

**Status: FREEZE**

Owns entity state, Person Registry, Membership/RoleAssignment references, sessions, memory classes, Memory Firewall decisions, objective/evidence state, authority inputs, local Capability Registry, ledger/outbox, SurfaceState and offline/sync state.

## `aksara-execd`

**Status: FREEZE**

Owns:

- Capability Lease validation,
- idempotency fencing,
- controlled implementation invocation,
- evidence/result recording,
- receipts,
- preview/speculative execution,
- proposal-versus-commit separation.

## `aksara-hwd`

**Status: FREEZE**

Owns Linux-side NFC, fingerprint/navigation, audio health, KVM plumbing, device discovery, WoT Thing descriptions and hardware health.

## Gatekeeper-style speculative actions

**Status: ADOPT as semantics**  
**Source pin:** [REF-CFOS]

```text
propose(action)
  → SimulatedOutcome

approve(proposal)
  → CommittedOutcome

reject(proposal)
  → ReconciliationOutcome
```

Cloudflare OS is inspiration, not the Node runtime.

---

# 8. Authorization and Capability Leases

## Cedar

**Status: PROTOTYPE**  
**Source pin:** [REF-CEDAR]

Cedar evaluates Principal / Action / Resource / Context. Aksara owns the domain semantics that create those inputs: Membership, RoleAssignment, Delegation, Mandate, constituency/approval state and evidence closure.

## Biscuit

**Status: PROTOTYPE**  
**Source pin:** [REF-BISCUIT]

Candidate concrete Capability Lease:

```text
short TTL
+ resource scope
+ operation scope
+ actor/session binding
+ local revocation set
+ ledger
```

The attraction is attenuation: a lease may become narrower without becoming more powerful.

Alternative: purpose-built signed COSE/PASETO/JWT-like lease envelope if Biscuit complexity is not justified.

---

# 8A. Multi-principal identity, bindings, audience and conversation lanes

**Status: FREEZE semantics; PROTOTYPE implementation.**  
**Primary inspirations:** current Vellum actor/gateway model, OpenClaw identity/session routing, Hermes gateway sessions, OpenBot initiator-aware policy, LibreChat resource ACLs.  
**Source pins:** [REF-VELLUM-IDENTITY] [REF-OPENCLAW] [REF-HERMES] [REF-OPENBOT] [REF-LIBRECHAT-ACL]

Aksara is institutional before it is conversational. For a 100-person office there is still one institutional Aksara identity, not 100 institutional minds and not one 100-person transcript.

```text
Institution
  ├─ Principals
  │    ├─ human
  │    ├─ role
  │    ├─ group/team
  │    ├─ device/service principal
  │    ├─ temporary agent principal
  │    └─ external/federated principal
  ├─ IdentityBindings
  │    ├─ SSO/OIDC subject
  │    ├─ email address
  │    ├─ phone / WhatsApp
  │    ├─ Slack/Teams/Telegram account
  │    ├─ Edge credential / NFC handoff
  │    └─ ETNOS / federation identity
  ├─ ConversationLanes
  ├─ WorkObjects
  └─ governed MemoryRecords
```

## 8A.1 Principal and `IdentityBinding`

Recognition and authorization stay separate.

```yaml
IdentityBinding:
  id: bind_...
  institution_ref: inst_...
  principal_ref: person_...
  provider: oidc | email | whatsapp | slack | telegram | edge | etnos | other
  account_ref: ...
  external_subject: ...
  assurance: observed | verified | strong
  status: active | suspended | revoked
  verified_at: ...
  verified_via: ...
  provenance: ...
```

A binding contains no ambient role authority. Membership/role assignment, delegation, mandate and policy are resolved separately into `AccessContext`.

OpenClaw's `identityLinks` and peer/channel session routing demonstrate the practical value of canonicalizing the same person across several transports. Vellum now models a contact independently from one or more `contact_channels`, with a canonical principal link and a gateway-owned ACL plane. Aksara adopts those patterns but generalizes them beyond personal `guardian/trusted_contact` semantics into institutional `Principal + Membership + RoleAssignment`. [REF-OPENCLAW] [REF-VELLUM-IDENTITY]

The **Edge** is therefore primarily a principal-bound credential/surface, not the sole home of that person's institutional memory. It may keep encrypted offline cache, queued signed events and an optional explicitly personal vault. The Node remains the institutional source of truth.

## 8A.2 Turn actor, resting principal and initiator

Vellum's current architecture separates the **acting actor** of a turn from the **resting actor** associated with the conversation while idle. That distinction exists because shared/multi-actor conversations make the two diverge, and conflating them caused authorization/history-scoping failures upstream. Aksara freezes the distinction explicitly. [REF-VELLUM-IDENTITY]

```text
ConversationLane
    resting_owner?     # useful default/hydration hint
          │
incoming event
          ▼
TurnContext
    actor_principal    # who is acting now
    initiator          # human | routine | agent | federation | system
    audience
    purpose
    work_object
```

Rules:

1. authorization uses the current `actor_principal`, never a silent owner fallback;
2. `resting_owner` may seed hydration only where policy explicitly permits it;
3. persisted provenance records the turn actor and, separately, the author/source of individual inbound content;
4. an unattended routine does not automatically inherit the full interactive authority of the person who created it;
5. context is scoped **at assembly time** from the current access context rather than destructively mutating one shared transcript.

OpenBot's actor/bot/initiator separation is a useful action-policy reference: human-triggered and autonomous work can receive different gates even when associated with the same user. [REF-OPENBOT]

## 8A.3 Conversation lanes

Relationship continuity and conversation continuity are separate.

A principal may maintain durable relationship/work state while having many independent lanes:

```text
Maria
  ├─ WhatsApp DM
  ├─ email thread: "Q3 report"
  ├─ web workspace: procurement case #44
  ├─ meeting-room session
  └─ ETNOS discussion
```

Suggested object:

```yaml
ConversationLane:
  id: lane_...
  institution_ref: ...
  channel: web | edge | whatsapp | email | voice | etnos | ...
  external_account_ref: ...
  external_conversation_ref: ...
  external_thread_ref: ...
  lane_type: direct | group | thread | room | workspace | public
  owner_principal_ref: ...      # optional; not authority
  work_object_refs: [...]
  declared_audience_refs: [...]
  persistence: ephemeral | durable
  created_at: ...
  updated_at: ...
```

Hermes provides a strong implementation reference for deterministic session keys built from platform/chat/user/thread and for keeping DMs private while making group/thread sharing configurable. OpenClaw adds explicit per-peer/per-channel-peer/per-account-channel-peer scoping and identity linking. Aksara uses the ideas but keeps lane identity separate from institutional memory and authority. [REF-HERMES] [REF-OPENCLAW]

## 8A.4 `AccessContext`

Every cognition/retrieval/execution turn resolves a typed context before the model runs:

```yaml
AccessContext:
  institution_ref: ...
  actor_principal_ref: ...
  acting_binding_ref: ...
  membership_refs: [...]
  role_refs: [...]
  initiator:
    kind: human | routine | agent | federation | system
    ref: ...
  audience_refs: [...]
  surface_ref: ...
  conversation_lane_ref: ...
  work_object_refs: [...]
  purpose: ...
  data_class_ceiling: ...
  assurance: ...
  policy_epoch: ...
```

This is the common input to MemoryView construction, Cedar authorization, capability discovery and surface composition.

## 8A.5 Audience-safe context

Hard rule:

> **Aksara never constructs a response context containing information that is not authorized for the effective audience of that response, unless policy explicitly authorizes a transformed/redacted representation.**

Examples where audience differs from the actor:

```text
WhatsApp group
email with CC recipients
shared meeting-room Node
classroom display
multi-user web workspace
ETNOS/public post
voice through a communal speaker
```

A user asking a question in a group does not authorize Aksara to inject that user's private DM memory into the group response.

The Context Assembler therefore operates:

```text
AccessContext
  ↓
eligible authoritative memory domain
  ↓
audience / purpose / data-class policy
  ↓
retrieval over eligible domain only
  ↓
transform/redact if explicitly permitted
  ↓
active context
```

Collaborative Memory's dynamic user↔agent/resource access graphs and policy-conditioned read/write views are a direct research reference. AIM is useful evidence that automated private/shared classification can be accurate but is not reliable enough to serve as the sole security boundary. [REF-COLLAB-MEMORY] [REF-AIM-MULTIUSER]

## 8A.6 Ingress gateway boundary

Vellum's current gateway is a strong reference for keeping all public channel ingress outside the cognition runtime: external webhooks/connections are validated at the gateway, canonical actor identity is resolved there, a trust verdict is stamped, and the runtime consumes that verdict. Its ACL/info split also keeps authorization data in the gateway store while descriptive contact information lives in the assistant store. [REF-VELLUM-IDENTITY]

Aksara generalizes:

```text
channel adapter
  → signature / transport validation
  → canonical external identity
  → IdentityBinding resolution
  → Principal resolution
  → audience/lane resolution
  → membership/role snapshot
  → IngressVerdict / AccessContext seed
  → cognition runtime
```

The model never decides who sent the message from display names or prose.

For public service channels, an external person may have a Principal without becoming an institutional member. For internal channels, membership/role resolution can grant richer access. Both use the same contract.

## 8A.7 Personnel scale

One hundred personnel do **not** imply one hundred resident LLM processes.

```text
100 principals
   ↓
many durable lane/work-object records
   ↓
authorized context assembly
   ↓
shared local/cloud cognition pool
   ↓
temporary workers as needed
```

Persistent state provides continuity; model processes are scheduled resources. This preserves the invariant that the institution survives model/runtime replacement.

---

# 8B. Node threat model, root of trust and key custody

**Status:** FREEZE threat classes and key semantics; PROTOTYPE implementation.  
**Source pins:** [REF-SYSTEMD-CRYPT] [REF-SYSTEMD-UKI] [REF-KEYLIME] [REF-EVE-SECURITY]

P1 is expected to hold institutional memory in ordinary offices and community spaces. Physical possession of the machine is therefore part of the threat model, not an exotic datacenter scenario.

Minimum threat classes:

```text
T1  powered-off Node stolen
T2  NVMe removed and imaged elsewhere
T3  malicious/replaced bootloader, kernel or initrd
T4  alternate boot media / boot-order change
T5  local OS/runtime modification
T6  Node seized or stolen while unlocked/running
T7  technician/support-account compromise
T8  Gateway/controller compromise
T9  malicious or compromised update
T10 ransomware / operator deletion
T11 institution loses all ordinary credentials/key holders
T12 Abstraksi infrastructure disappears
```

P1 security claims must be phrased narrowly. The target is **encrypted-at-rest, measured, tamper-evident, revocable and recoverable**. Do not claim “seizure proof.” Once protected plaintext is deliberately mounted, relevant keys necessarily exist in live system state and physical capture becomes a different threat class.

## 8B.1 Boot-to-vault trust chain

Preferred modern Linux appliance pattern:

```text
UEFI Secure Boot
      ↓
signed Unified Kernel Image (UKI)
      ↓
measured boot / TPM 2.0 PCR evidence
      ↓
signed PCR policy
      ↓
LUKS2 encrypted mutable state
      ↓
Aksara vault domains
```

`systemd-cryptenroll`, `ukify`/`systemd-measure` and LUKS2 provide a practical upstream path for TPM2/FIDO2 enrollment and signed PCR policies. Prefer signed PCR policy over blindly sealing a long-lived key to one exact kernel hash: the vendor can authorize known-good future UKIs without normal updates becoming recovery incidents. [REF-SYSTEMD-CRYPT] [REF-SYSTEMD-UKI]

Procurement requirement: the exact P1 unit, not merely its product family, must expose a usable TPM 2.0 and UEFI Secure Boot path. A refurb listing saying “TPM” is insufficient.

## 8B.2 Two vault domains

Do not make one automatic unlock decision equivalent to access to every class of institutional data.

```text
Operational Vault
  ordinary case/work state
  queue/outbox
  normal institutional memory
  local credentials wrapped/scoped for routine work

Restricted Vault
  culturally restricted archive
  especially sensitive person-level records
  recovery/key material
  data explicitly requiring custodian presence
```

The Operational Vault may be available offline after a valid device state plus local institutional unlock policy.

The Restricted Vault must support a stricter policy such as:

```text
TPM state + authorized custodian credential
```

or for community governance:

```text
TPM state + threshold custodian authorization
```

A fingerprint can be one authentication signal for a Principal or approval. It is **not** the sole disk-encryption root: biometrics cannot be rotated like secrets and must not become the only recovery path.

## 8B.3 Device identity and attestation

Each Node receives a distinct device identity. Prefer non-exportable TPM-backed device/attestation keys when hardware permits.

Remote attestation is **an admission signal**, not the mechanism that lets a Node exist locally:

```text
Node boot
   ↓
TPM quote + boot/IMA evidence
   ↓
Gateway verifier
   ├─ trusted   → cloud/sync credentials and remote leases may be issued
   └─ unhealthy → remote credentials/leases withheld or revoked; steward alerted
```

Keylime is the primary implementation reference for TPM quotes, UEFI/IMA evidence, verifier/registrar roles and revocation. Its stable pull model requires verifier reachability to the agent; its NAT-friendly push model is explicitly experimental in current upstream and therefore remains a research path rather than a P1 dependency. [REF-KEYLIME]

LF Edge EVE is the strongest design reference for an unattended edge appliance under physical attack: TPM-sealed vault keys, measured boot, remote attestation and a controller-assisted encrypted backup-key path across legitimate upgrades. Aksara borrows the pattern, not EVE as the base OS. [REF-EVE-SECURITY]

A particularly useful 2026 lesson is negative: EVE published fixes for incomplete PCR coverage and SHA-1 PCR sealing. Aksara therefore adds **PCR-policy completeness/regression tests and SHA-256-or-better measurement policy** rather than assuming “TPM enabled” means the measured boundary is correct. [REF-EVE-SECURITY]

## 8B.4 Powered-on capture boundary

When a vault is unlocked, disk encryption alone cannot protect the plaintext the running system is authorized to use.

Mitigations:

- no long-lived provider/API secrets in model context;
- short-lived scoped Capability Leases and remote credentials;
- automatic re-lock for Restricted Vault material;
- session/Principal idle lock;
- ability to revoke device/cloud credentials remotely when connectivity returns;
- minimum plaintext cache and explicit scratch-data retention;
- restricted data never copied into ordinary telemetry;
- no support shell with ambient access to vault + policy + service-manager authority.

## 8B.5 Verified appliance OS and updates

Separate the trust base from mutable institutional state:

```text
VERIFIED / REBUILDABLE
  boot chain
  kernel/initrd/UKI
  root OS
  aksarad / execd / hwd / updater
  policy runtime

MUTABLE / ENCRYPTED
  authoritative SQLite/files
  ledger/outbox
  institutional artifacts
  queues
  approved local model/cache material
```

Target deployment form is an **image-based Debian 13 appliance profile**, even if development machines remain package-managed.

`systemd-sysupdate` + `systemd-repart` provide a current upstream path for whole-image A/B-style updates of a root image, matching dm-verity data and a UKI, including multiple installed versions and boot-attempt accounting. [REF-SYSTEMD-SYSUPDATE]

P1 update acceptance requires:

```text
signed release manifest/image
download into inactive slot/version
verify before activation
boot-attempt fence
health/readiness confirmation
rollback on failed boot/readiness
vault reseal/recovery path tested
```

Agent cognition never calls the update mechanism directly; it may only request a typed supervisor action under policy.


---

# 8C. Trust domains, custodianship and offline authority

The public/institutional actor is not the data boundary. v0.6 adds explicit semantics for deployments where one institution, community or regional host contains information governed by different custodians.

```text
InstitutionActor   = who is represented publicly / conversationally
Tenant             = who operates or pays for a deployment
TrustDomain        = cryptographic + access boundary
DataCustodian      = who may define sharing/retention/export rules
StoragePlacement   = where canonical/derived data may physically reside
SharingGrant       = explicit cross-domain permission for an artifact/query/result
GovernanceNamespace= social/delegated governance grouping in ETNOS
Node               = a physical execution/storage device
```

A trust domain can be smaller than an institution. Example: an adat body may cooperate with a provincial institution while retaining a restricted domain whose keys and sharing rules remain under community custodianship. A regional host therefore does not become the owner of every domain it physically hosts.

## 8C.1 `TrustDomain`

Minimum fields:

```text
id
custodian_refs[]
member/role policy ref
data_class ceiling
storage_policy_ref
sharing_policy_ref
retention_policy_ref
key_domain_ref
recovery_policy_ref
```

Canonical data, backup keys, derived projections and remote providers all resolve against the effective trust domain before use.

## 8C.2 `SharingGrant`

Cross-domain collaboration transfers an approved artifact, capability result or bounded query response rather than ambient access to the source domain. A grant records:

```text
source_domain
recipient_domain/principal
resource or transform
purpose
audience
validity window
redistribution rule
revocation semantics
receipt refs
```

Public ETNOS publication is a separate, effectively irreversible sharing path and must not be treated as an ordinary revocable grant.

## 8C.3 `OfflineAuthorityEnvelope`

Offline operation uses a locally verifiable envelope rather than silently assuming the last online role snapshot is still valid:

```text
principal / role snapshot
issued_at / expires_at
policy_epoch
allowed action classes
maximum data class
resource/version constraints
local revocation snapshot
must_reconnect effects[]
```

Read/search and low-risk preparation can receive longer offline windows than consequential effects. At commit, Aksara rechecks the current actor, audience, mandate, resource version, policy epoch and lease. If freshness requirements cannot be satisfied, the workflow moves to a safe degraded state such as `AWAITING_RECONNECT` or `AWAITING_REAUTHORIZATION` instead of silently executing.

---

# 8D. Community governance lifecycle and operator separation

`TrustDomain`, `DataCustodian` and `SharingGrant` need a lifecycle, not only creation-time access rules. This is especially important where a community, funder, government office, host operator and technical maintainer are different parties. [REF-MUKURTU] [REF-LOCALCONTEXTS]

P1 defines the following governance cases explicitly:

| Case | Required system behavior |
|---|---|
| **custodian succession** | transfer stewardship/recovery authority under an approved process; old credentials and recovery shares are revoked or retired |
| **disputed authority** | enter a contested state; do not let host admin convenience resolve the social dispute |
| **membership change** | recompute future access and offline envelopes; cached/derived access paths are invalidated where applicable |
| **community split/reorganisation** | records may remain jointly held, copied, restricted or contested according to an explicit agreement; namespace migration does not imply ownership transfer |
| **withdrawal/correction** | stop active use, invalidate derived indexes/caches and record the correction; disclose backup/publication limits honestly |
| **sponsor departure** | funding/operator access can end without deleting the community's usable records, keys or export path |
| **research reuse** | listening, operational use, preservation, publication, analysis and model training remain separate permissions |

A hosting administrator may still have powers below an application ACL. The deployment contract therefore states who can technically read an **unlocked** vault, who controls host/root access, who controls backup keys, and what remote support can inspect. Where protection from the host operator itself is required, use separately controlled machines/vaults or a stronger isolation profile rather than marketing logical tenancy as adversarial-host protection.

For Indigenous/cultural material, Mukurtu's community and cultural-protocol model is a concrete design reference: content can be assigned to open or strict protocols, and protocols may be shared across communities under steward control. [REF-MUKURTU] Local Contexts is complementary rather than a repository: its Labels/Notices and API can keep community-defined provenance and usage expectations attached to external collections. Aksara should evaluate eventual **Local Contexts Integration Partner** compatibility instead of copying those governance labels into a proprietary equivalent. [REF-LOCALCONTEXTS]

Sponsor, operator and custodian stay separate:

```text
payer/sponsor  !=  DataCustodian
host operator  !=  automatic archive authority
ETNOS admin     !=  private TrustDomain member
Abstraksi       !=  universal recovery-key holder
```

---

# 9. Durable execution

**Primary P1 candidate:** Duroxide. [REF-DUROXIDE]  
**Hosted/distributed alternative:** Restate. [REF-RESTATE]  
**Other adapters:** DBOS, Temporal, Cloudflare Workflows. [REF-DBOS] [REF-TEMPORAL] [REF-CF-WORKFLOWS]

**Status:** PROTOTYPE.

Expose:

```text
DurableRuntime
  start()
  signal()
  cancel()
  status()
```

Required fault tests:

```text
kill -9 mid-step
power loss
reboot
late approval
duplicate signal
schema migration
network loss
clock discontinuity
retry after partial external success
```

Vellum workflows remain cognitive workflows, not canonical institutional durability.

**Windmill reference.** Windmill is deliberately not adopted as the base P1 workflow substrate. Its API server + Postgres queue + worker estate is heavier than Aksara needs on one Node and overlaps Duroxide plus the Local Workspace Worker. It remains a useful implementation reference for worker tagging, script-to-schema ergonomics, durable approval steps, resource/secret handles, job replay and operational observability. [REF-WINDMILL]

---

# 9A. Snapshot, backup, restore and institutional recovery

**Status:** FREEZE semantics; PROTOTYPE P1.  
**Source pins:** [REF-KOPIA] [REF-BIZNET-OBJECTLOCK] [REF-R2-BUCKETLOCK] [REF-B2-OBJECTLOCK]

Synchronization is not backup. A replicated bad write is merely highly available corruption.

Aksara distinguishes:

```text
1 OS image
  signed/rebuildable; not precious institutional state

2 device identity material
  TPM/non-exportable where possible
  back up enrollment/recovery metadata, not a copied TPM private key

3 authoritative state
  SQLite + canonical files + reviewed institutional memory

4 ledger / receipts
  append-heavy institutional history with integrity metadata

5 derived state
  embeddings / graph projections / search indexes / caches
  rebuild rather than treating as irreplaceable backup payload
```

## 9A.0 Content-minimal ledger and correction propagation

The institutional Ledger should prove that an event/effect occurred without becoming a second hidden archive of sensitive payloads. Default ledger records use opaque object references, digests, actor/authority metadata, state transitions and destination receipts rather than full prompts, transcripts or document contents. Sensitive payloads remain in separately governed vault/storage objects with their own retention policy.

Correction, consent withdrawal or authorized removal follows an explicit invalidation path:

```text
canonical record / source status changes
        ↓
new ledger event + tombstone/supersession marker
        ↓
Memory Firewall re-evaluation
        ↓
invalidate/rebuild FTS/vector/graph/trigger projections
        ↓
expire eligible device/cache copies
        ↓
update public projection when possible
        ↓
record backup/legal-hold limits on deletion
```

Aksara does not claim that already federated/public information can always be erased from third-party servers. Product UI must distinguish local correction/removal, future non-disclosure, and the practical limits of public dissemination.

## 9A.1 Consistent snapshot envelope

A backup snapshot is a typed institutional operation:

```text
BackupSnapshot
  snapshot_id
  node_id / institution_id
  canonical_schema_version
  policy_epoch
  source_high_watermark
  manifest_digest
  created_at
  encrypted_repository_ref
  restore_test_status
```

Preferred cycle:

```text
prepare snapshot
   ↓
quiesce/coordinate canonical writers briefly
   ↓
SQLite online-backup/WAL-consistent capture
   ↓
capture canonical artifact tree + ledger boundary
   ↓
manifest + hashes + schema/policy metadata
   ↓
resume writers
   ↓
client-side encryption/deduplication
   ↓
immutable off-site object target
```

The Gateway may coordinate schedules, health and retention policy. It must not need the plaintext repository password or an omnipotent recovery key.

## 9A.2 Backup client bakeoff

**Primary P1 prototype candidate: Kopia over S3-compatible storage.** Kopia provides mandatory client-side encryption, deduplicated content-addressed snapshots, consistency verification and first-class S3 Object Lock support. Its ransomware-protection path can apply Compliance retention and extend object locks during full maintenance. [REF-KOPIA]

Important operational rule: full maintenance must run more frequently than the lock-retention period when Kopia is responsible for extending locks, and storage quotas/budgets must prevent compromised clients from weaponizing immutable retention into an unlimited bill.

**Mature alternative: restic.** Keep restic in the bakeoff because of its long operational history and simple deployment. Strict S3 Object Lock layouts are less ergonomic because repository lock-file mutation/deletion must be handled carefully.

**Research alternative: rustic.** It is attractive for low-resource Rust deployment and restic repository compatibility, but current upstream still describes the client as beta; do not make it the sole P1 recovery path before its own maturity statement changes.

## 9A.3 Object-store targets

Storage selection is policy-driven. Encryption does not silently erase residency/community-governance requirements.

**Indonesia-resident candidate:** Biznet Gio NEO Object Storage. Current public documentation lists S3-compatible storage at approximately:

```text
Single Region     Rp1,000 / GB / month
two-region class  Rp2,000 / GB / month
three-region      Rp3,000 / GB / month
```

and supports Governance, Compliance and Legal Hold. Biznet describes Compliance-locked objects as non-modifiable/non-deletable even by full-access users for the retention period. Before promotion, verify the exact S3 Object Lock API behavior Kopia needs, including retention extension and repository maintenance, against the selected Biznet endpoint. [REF-BIZNET-OBJECTLOCK]

**Cloudflare R2:** v0.5.1 corrects an earlier assumption. R2 now has native **Bucket Locks** that prevent deletion/overwrite by age, date or indefinitely and take precedence over lifecycle deletion. This is useful for immutable backup copies. However, it is a Cloudflare-specific lock API; R2 still rejects the S3 `x-amz-bucket-object-lock-enabled=true` compatibility path. Treat “R2 Bucket Lock” and “S3 Object Lock” as different provider capabilities in the adapter. **Do not assume Kopia's S3 Object Lock extension works on R2.** A direct Kopia→R2 repository must pass mutation/maintenance tests, or R2 should receive separately exported immutable snapshot bundles rather than a repository layout that expects lock-file/index mutation. Standard storage is currently $0.015/GB-month with no Internet egress charge. [REF-R2-BUCKETLOCK] [REF-R2-PRICING]

**Cross-border DR candidate:** Backblaze B2, only when policy allows. It remains a low-cost S3-compatible secondary copy with Object Lock/Compliance support. [REF-B2-OBJECTLOCK]

P1 should not require two remote providers. The contract supports one primary immutable target plus an optional independent disaster-recovery target.

## 9A.4 Recovery social contract

The backup encryption key is generated/held under institutional governance. Abstraksi does not receive a default vendor master key.

Possible recovery policies:

```text
ordinary institution:
  offline recovery credential/package
  + designated institutional custodians

community/adat:
  threshold shares, e.g. 2-of-3 or policy-defined quorum

managed deployment:
  institution may explicitly authorize Abstraksi to hold one recovery share
  never enough by itself unless the institution deliberately chooses that model
```

Restore is considered functional only after a drill:

```text
new/reimaged Node
  → authenticate recovery authority
  → restore canonical state
  → verify manifest/ledger
  → rebuild graph/vector/search derivatives
  → re-enroll device identity if hardware changed
  → resume durable work without replaying completed external effects
```

A backup that has never been restored is an optimistic story told by a storage bill.


---

# 9B. Work objects, cases and institutional commitments

Aksara needs a durable operational object when cognition turns into owned work. `WorkObject` is intentionally narrower than conversation or memory.

Minimum visible fields:

```text
id / type
title / summary
trust_domain
initiator / current_owner
audience
status
priority
due_at / review_at
source_refs[]
evidence_refs[]
disputed_or_uncertain[]
decision_requests[]
work_items[]
external_effects[]
destination_receipts[]
follow_up[]
closure_reason
```

Canonical lifecycle vocabulary should remain small and explicit:

```text
RECEIVED → TRIAGED → ASSIGNED → IN_PROGRESS
                          ├→ AWAITING_USER
                          ├→ AWAITING_APPROVAL
                          ├→ AWAITING_EXTERNAL
                          └→ AWAITING_RECONNECT
                                     ↓
                                  RESOLVED → CLOSED
                                      ├→ REOPENED
                                      └→ APPEALED / CORRECTION
```

Domain Packs may refine sub-states but should map back to the common lifecycle. The model may propose a transition; policy or the appropriate actor performs restricted transitions.

Keep these concepts separate:

```text
Conversation = interaction history / interface context
WorkObject    = real institutional issue, request or obligation
WorkItem      = one task assigned to a person/team/agent
WorkflowRun   = durable orchestration of steps/timers/retries
Receipt       = evidence that a consequential effect or hand-off occurred
```

Open311/FixMyStreet are useful references for jurisdiction-independent service requests; Frappe Helpdesk and Zammad are useful references for assignment/SLA semantics; Chatwoot is a possible channel adapter rather than the canonical case engine. Aksara should borrow mature patterns without making any of these systems its source of institutional truth. [REF-OPEN311] [REF-FRAPPE-HELPDESK] [REF-CHATWOOT]

---

# 10. Resident cognition and specialist workflows

## Vellum

**Status: ADOPT as resident cognition**  
**Source pin:** [REF-VELLUM]

Use for conversation, planning, tool use, browser/computer use, skills, bounded workflows, temporary leaf processes and credential separation.

Current upstream also provides useful concrete patterns for multi-channel contacts/identity, gateway-owned ingress verdicts, acting-vs-resting conversation actors and v3 concept-page memory. Aksara deliberately consumes these as adapter/reference semantics rather than allowing the personal-assistant data model to become institutional truth. [REF-VELLUM-IDENTITY] [REF-VELLUM-MEMORY-V3]

**Institutional-mode rule:** Vellum native long-term memory writes are disabled, redirected through the Aksara Memory Firewall, or explicitly labeled non-authoritative cognitive cache. Vellum may receive the current authorized `MemoryView`; it does not independently decide what a staff member or institution remembers.

Vellum does **not** own canonical Institution/Principal/IdentityBinding, institutional memory truth, Membership/RoleAssignment, authority, Capability Lease issuance, ledger or ETNOS public boundary.

## Hermes Agent

**Status: ADOPT as P0/P1 compatibility and messaging harness; non-sovereign.**  
**Source pin:** [REF-HERMES]

Hermes is valuable because its gateway already normalizes many messaging surfaces and persists platform/chat/user/thread-aware sessions with restart recovery and session search. It can also use external memory providers.

For Aksara:

```text
Hermes gateway/session
      ↓
Aksara IdentityBinding + ConversationLane resolver
      ↓
AccessContext
      ↓
Aksara MemoryView / capabilities
```

Hermes' own profile/session/memory files remain runtime state. They cannot become the canonical personnel registry, institutional memory, authority or ledger.

## Microsoft Agent Framework

**Status: EVALUATE / strategic fallback**  
**Source pin:** [REF-MAF]

Backup harness, not a co-resident second sovereign runtime.

## PydanticAI

**Status: ADOPT at pack level**  
**Source pin:** [REF-PYDANTICAI]

Preferred for typed scientific/research/data workflows inside specialist capabilities.

## Strands Harness SDK

**Status: EVALUATE as the strongest current forkable resident-cognition alternative; no P1 migration yet.**  
**Source pin:** [REF-STRANDS]

Strands is unusually interesting for Aksara because it is a library/harness rather than a hosted control plane, is Apache-2.0, ships both Python and TypeScript implementations, and already exposes lifecycle limits, tools, structured output, MCP, sessions/memory, model portability, hooks/steering, tracing and evals. That makes it a cleaner candidate for an Aksara-owned cognition fork than another end-user assistant product.

The boundary remains unchanged: Strands may own the **agent loop**, never institutional truth, identity, authority, Memory Firewall, leases, receipts or effects. The near-term decision is a bounded Vellum-vs-Strands bakeoff after the ETNOS governed vertical slice, not an architecture rewrite caused by a trending page.


## Aksara Minimal Loop benchmark

This benchmark is an executable baseline and escape hatch, not a presumption that Aksara should replace mature harnesses. Vellum remains the current default hypothesis; Strands, Hermes and the minimal loops are evaluated on the same corpus. P1 should operate **one resident loop as the production default**, with compatibility adapters around it rather than several co-equal resident harnesses.


**Status: EVALUATE / internal reference implementation.**

This candidate is added **without removing Vellum, Hermes, Strands, Microsoft Agent Framework or PydanticAI**. Its purpose is to measure the harness tax by implementing the smallest resident loop that can satisfy Aksara contracts.

The loop is explicitly non-sovereign:

```text
AccessContext + assembled messages
        ↓
ResidentCognitionPort
        ↓
model stream
        ↓
complete typed tool call
        ↓
CapabilityRequest
        ↓
Aksara policy / lease / execd
        ↓
typed CapabilityResult
        ↓
continue or finish
```

It owns no authoritative memory, identity, approval state, institutional durability or credentials.

### TypeScript reference path

Vercel AI SDK Core is a useful code donor because its current loop primitives expose typed tools, streaming, explicit stop conditions, `prepareStep`, per-run context and provider portability; its own documentation explicitly shows using `generateText`/`streamText` to drive a fully custom loop when maximum control is required. [REF-VERCEL-AI-SDK-LOOP]

The P1 benchmark should therefore test **our loop over AI SDK Core primitives**, not make `ToolLoopAgent` a new institutional runtime owner.

### Rust reference path

Two Rust references are worth measuring:

- **yoagent:** unusually close to the desired shape: a stateless `agent_loop()` free function, optional stateful wrapper, native provider protocols, event stream, cancellation/limits, mock provider and one `ToolMiddleware` choke point that can allow/modify/deny calls. It deliberately does not require a vector store or task graph. It is young and therefore a code donor/bakeoff candidate, not an automatic dependency. [REF-YOAGENT]
- **Rig:** broader and more mature; offers provider portability, typed tools, streaming, a sans-I/O run state machine and hook-aware `AgentRunner`. Its RAG/memory/workflow features remain optional and would stay outside Aksara authority. [REF-RIG]

### Same failure-oriented benchmark

Compare:

```text
Vellum
Hermes
Strands Harness/SDK
Aksara Minimal Loop TS
Aksara Minimal Loop Rust
```

against one compatibility matrix:

```text
P1 Harness Failure Suite pass rate
partial-tool-call safety
cancellation + stale-write fencing
provider-stream completion semantics
tool gating through CapabilityRequest
idempotency/retry behavior
context-budget control
startup RSS / cold start
dependency count / binary or bundle size
adapter LOC
provider-specific feature preservation
offline mockability
trace/receipt reconstruction
```

Demo smoothness is not the promotion metric. A thin loop wins only if it measurably lowers integration cost while passing the same institutional tests.


---

# 10A. Programmatic Tool Runtime

**Primary P1 candidate:** Pydantic Monty v1.x.  
**Alternative:** QuickJS/WASM-style evaluator.  
**References:** [REF-MONTY]

**Current upstream note (verified 26 September 2026):** Monty v1.0.0 was published on 25 September 2026. The v1 release drops the earlier experimental framing and adds, among other hardening work, session IDs/forking/ephemeral sessions/auto-resume, stricter memory-growth checks, broader OS/time support and snapshot/wire changes. This corrects an earlier radar false negative caused by stale release indexing. Upstream v1 status strengthens the prototype case; it does **not** bypass Aksara's own failure/authority fixtures. [REF-MONTY]

Monty fills the missing layer between direct tool calling and a full sandboxed computer. The model may generate short Python-subset control flow for loops, joins, filtering, aggregation and parallel calls, while host calls suspend back into Aksara governance. Monty therefore sits **above** execution backends rather than beside Wasmtime or AX.

```text
resident cognition
      │
      ├─ direct capability call ───────────────┐
      │                                        │
      └─ ProgrammaticToolRuntime / Monty       │
             loops · joins · filtering         │
             suspend on host call              │
                         │                      │
                         └──────────┬───────────┘
                                    ▼
                            CapabilityRequest
                                    ▼
                              aksara-execd
                                    ▼
                         policy · lease · claim
                                    ▼
                 Wasmtime / native / MCP / API
                                    ▼
                    Local Workspace / AX if needed
```

Stable port:

```text
ProgrammaticToolRuntime
  compile()
  typecheck()
  start()
  suspend()
  resume()
  dump()
  restore()
  cancel()
```

A Monty continuation is an **opaque execution artifact**, not durable institutional state. Duroxide owns workflow lifecycle; canonical work objects and receipts remain in Aksara. Monty workers run under an unprivileged profile with no ambient Node credentials, network, service-manager access or canonical filesystem mounts. Host functions are capability-shaped operations, never generic `shell()`, `fetch()` or unrestricted filesystem callbacks.

Decision ladder:

```text
one/few simple calls                         → direct capability calls
many calls + loops/filtering/aggregation    → Monty
fixed narrow implementation                  → Wasmtime/WIT
arbitrary packages/files/processes/browser   → Local Workspace Worker
scalable/suspendable full agent computer     → AX / remote WorkAgentRuntime
```

---

# 11. Work-agent filesystem and execution boundary

P1 does not boot a heavy sandbox for ordinary conversation.

```text
ordinary interaction
  → resident cognition + typed capabilities

small deterministic capability
  → Wasmtime/WASI component

bounded local coding/research/file/browser/science task
  → sandboxed Local Workspace Worker

cluster-scale / long-lived suspendable computer task
  → WorkAgentRuntime backend (AX + Agent Substrate candidate)
```

## 11.1 Wasmtime/WASI

**Status: ADOPT progressively.**  
**Source pins:** [REF-WASMTIME] [REF-WASI-CM]

This remains the preferred narrow sandbox when a job can be expressed as a bounded component with explicit host calls/preopens. Wasmtime is not the same category as a general task computer.

**Security/version rule:** the P1 capability host pins an explicitly reviewed Wasmtime release rather than following `latest` implicitly. As of 26 September 2026, upstream v49.0.1 is the current reviewed radar target following the 49.0 release line. Capability-pack qualification includes the approved Wasmtime/WASI version because sandbox-runtime fixes can change the security envelope without changing an Aksara pack. [REF-WASMTIME]

## 11.2 Local Workspace Worker

**Status: PROTOTYPE → preferred P1 heavy-work default.**  
**Primary inspiration:** Intent's local daemon/workspace model. [REF-INTENT]

A “local worker” never means “give an agent the Node filesystem.”

Suggested materialized workspace:

```text
/var/lib/aksara/jobs/<run_id>/
  input/      # read-only materialized inputs
  work/       # mutable scratch
  output/     # candidate outputs
  tmp/        # disposable
```

The worker may receive shell/process/package/browser/native-library access required by the capability, but receives no ambient access to:

```text
/etc
service-manager sockets
canonical memory/vault paths
other users' workspaces
credentials not explicitly leased
arbitrary removable/media mounts
```

Outputs remain candidate artifacts until `aksara-execd` validates/promotes them.

Intent is a useful reference for a long-lived local Rust daemon, thin clients, per-task workspace isolation and copy-on-write/reflink-style local working trees without Kubernetes. Aksara borrows the pattern, not Intent's coding-specific ontology. [REF-INTENT]

**New isolation bakeoff: smolvm.** smolvm is a compact portable microVM layer with no resident daemon, hardware virtualization backends on Linux/macOS/Windows, network-off-by-default behavior and host/CIDR egress allowlists. It is a serious candidate to own the *generic machine-isolation/lifecycle* portion of a local heavy worker while Aksara retains leases, credentials, artifact promotion and institutional effects. [REF-SMOLVM]

P1 experiment:

```text
same workspace fixture
  native bounded worker
  vs smolvm

measure:
  cold start · RSS/disk · network fence · file materialization
  package install · cancellation · crash cleanup · artifact recovery
```

Do not add smolvm merely to make the diagram more isolated; promote it only if the reduction in custom isolation code and failure modes exceeds its VM/image operational cost.

## 11.3 Cluster WorkAgent backend: Google AX + Agent Substrate

**Status: EVALUATE / preferred experimental Node+ backend.**  
**Source pins:** [REF-AX] [REF-AGENT-SUBSTRATE]

AX is treated as an execution control plane, not as the Aksara agent/kernel. Its Task/Workspace/Gateway/Model abstraction and Agent Substrate's actor/worker separation provide a credible implementation of isolated, suspendable, resumable agent computers at cluster scale.

```text
aksara-execd
   │
WorkAgentRuntime
   │
   ├─ local workspace backend        P1 / single Node
   ├─ AX backend                     Node+ / lab / regional cluster
   │    └─ Agent Substrate
   │         └─ gVisor / microVM / Kubernetes workers
   └─ remote sandbox backend         optional burst/special workload
```

Agent Substrate execution snapshots are never canonical institutional memory. A failed/restored actor may lose execution progress without making the institution forget its authoritative record.

Do not install Kubernetes on the base P1 Node merely because the industry discovered another YAML-shaped hobby.

## 11.4 Stable port

```text
WorkAgentRuntime
  create(spec)
  exec(command_or_task)
  materialize_input(ref)
  read_artifact(ref)
  write_artifact(candidate)
  checkpoint()
  suspend()
  resume()
  destroy()
  status()
```

A backend may report `checkpoint/suspend/resume` as unsupported. Institutional workflows must tolerate backend replacement and rebuild from canonical work state.

## 11.5 Existing alternatives

- agentOS — bounded agent-computer reference/backend candidate. [REF-AGENTOS]
- Vercel Eve — filesystem-first durable-agent reference. [REF-EVE]
- Vellum sandbox/computer path — resident-harness integration reference.
- remote VM/sandbox providers — optional implementation.

None owns authoritative institutional state.

## 11.6 Conversation vs sandbox

OpenHands makes an important operational distinction explicit: a conversation and a sandbox are different objects, and multiple conversations sharing one sandbox remain separate conversationally but **do not gain a security boundary from that separation**. Aksara freezes the same rule. [REF-OPENHANDS]

```text
ConversationLane   = interaction/history boundary
Workspace/Actor    = execution isolation boundary
Memory scope       = information-governance boundary
```

Never substitute one for another.


---

# 11A. Workstation Bridge: browser, computer and legacy-system use

Browser/computer use is a first-class Aksara capability because many real institutional systems expose incomplete APIs, desktop-only applications, instrument software or browser workflows that cannot be replaced during a P1 deployment. It is **not** a shortcut around authorization, integration agreements or destination receipts.

The preferred execution ladder is:

```text
1. documented API / structured export-import
2. local CLI or application plugin
3. deterministic browser automation
4. AI-assisted browser observation / self-healing
5. bounded autonomous browser worker
6. remote browser with human takeover
7. dedicated KVM / remote desktop for legacy/native software or recovery
```

Higher rungs are used only when the lower rung cannot perform the job reliably.

## 11A.1 Stable `WorkstationBridgeRuntime`

```text
open_session(target, principal, access_context, purpose, ttl) -> ComputerSession
observe(session, scope) -> ComputerObservation[]
prepare(session, intended_effect) -> EffectPreview
act(session, approved_effect) -> ExecutionClaim
reconcile(claim) -> DestinationReceipt | OutcomeUnknown
handoff(session, principal) -> HumanControlLease
close(session)
```

A `ComputerSession` binds:

- named target machine/browser profile and owner;
- trust domain and responsible institution;
- current actor, purpose and audience;
- allowed sites/apps/devices;
- credential profile without exposing raw secrets to model context;
- read-only vs effectful capability class;
- maximum duration and idle timeout;
- screenshot/video/transcript retention class;
- physical or UI stop/handoff path.

Computer observations are **observations**, not authority. Text shown in a browser, OCR from a screenshot, or a desktop notification never grants a new tool permission or changes a mandate.

## 11A.2 Browser control baseline

**Playwright / Playwright MCP** is the deterministic baseline. Its current MCP server exposes structured accessibility snapshots and element references, persistent or isolated browser state, storage controls, tracing, screenshots and optional coordinate-based vision. [REF-PLAYWRIGHT-MCP]

**Stagehand v4** is the strongest current AI-assisted browser-control candidate for P1 because it is explicitly usable as the *hands* behind another harness rather than requiring its own planner. `observe()` returns structured candidate actions that can be inspected and replayed deterministically through `act()`, and placeholder variables can keep credential values out of model prompts. [REF-STAGEHAND]

Recommended browser path:

```text
known stable flow       -> Playwright selectors/refs
changed/unknown page    -> Stagehand observe/extract
validated action        -> deterministic replay
complex bounded task    -> browser specialist behind WorkAgentRuntime
consequential submit    -> human/policy approval + EffectClaim
post-submit             -> destination verification/reconciliation
```

**Native accessibility automation:** `agent-desktop` enters the Workstation Bridge as a **CODE DONOR / BAKEOFF** between browser control and pixel/KVM control. Its current Rust implementation exposes structured OS accessibility trees with stable references plus window/keyboard/mouse/clipboard/screenshot actions and CDP handoff for Chromium/Electron. Current upstream support is macOS-first, with Windows/Linux planned, so it is not a P1 Linux dependency yet. [REF-AGENT-DESKTOP]

The preferred native-computer escalation is therefore:

```text
API/CLI
  → Playwright
  → Stagehand
  → OS accessibility tree when supported
  → bounded autonomous browser/computer worker
  → KVM / raw pixel+HID fallback
```

**browser-use** and **Skyvern** remain autonomous-browser benchmarks/reference implementations, not default owners of institutional browser state. They are useful to compare success rate and repair behavior on unknown workflows. Skyvern's AGPL licensing also makes deployment posture a deliberate decision. [REF-BROWSER-USE] [REF-SKYVERN]

## 11A.3 Browser infrastructure and human handoff

For hosted/regional profiles, **Steel** is a strong self-hostable browser-infrastructure candidate, while **Browserbase** is an optional managed backend. Aksara does not require either for a local Node. [REF-STEEL] [REF-BROWSERBASE]

A managed browser is valuable when a human must take over for MFA, passkeys, CAPTCHA, sensitive credential entry or an ambiguous step. Browserbase's Live View/Context pattern is a useful reference: the browser session can be handed to a user while retaining session state for later automation. Any hosted browser remains an egress/storage decision under `EgressPolicy`.

Browser cookies, local storage, passkeys and session tokens are **credentials/session state**, not institutional memory. They live under a credential/session store with independent retention/revocation. Screenshots and videos are ephemeral diagnostics unless a specific WorkObject requires preservation.

## 11A.4 KVM / native-computer profile

KVM remains an active research profile rather than disappearing from P1. It covers native applications, legacy desktops, laboratory instruments, firmware/recovery screens and portals that cannot be reached safely through browser/API automation. [REF-PIKVM]

PiKVM is the preferred reference substrate for this layer instead of custom video-capture/HID plumbing. The Aksara layer adds:

- named machine/session identity;
- actor and purpose binding;
- default-disabled ATX power and virtual media unless explicitly leased;
- time-bounded HID permission;
- physical stop and operator takeover;
- destination-state verification after effectful actions;
- retention policy for captured frames.

The Lapis One/Pamir product is a useful appliance reference because it integrates compute, peripheral I/O and KVM-like control in one device, but its current pre-order/early-production status is **not field validation** for Aksara. [REF-LAPIS-PAMIR]

## 11A.5 Unknown outcomes and replay

Browser and KVM effects are frequently not transactionally idempotent. If connectivity or process state disappears after a click/keystroke that may have committed:

```text
DO NOT blindly retry
       ↓
record OutcomeUnknown
       ↓
inspect destination state / receipt / unique reference
       ↓
resolve accepted | rejected | still unknown
```

The same external-effect semantics apply whether the action came from Vellum computer-use, Stagehand, Playwright, OpenHands, a human operator or PiKVM.

---

# 12. Memory architecture

This section is a deliberate synthesis. **No single project is “Aksara memory.”**

The source design principles are:

- plain/exportable institutional records and rebuildable indexes,
- Graphiti-style temporal graph projection,
- OptMem/TiMem/HORMA-style hierarchical continuity,
- T-Mem-style prospective associative triggers,
- strict policy-first retrieval,
- a separate world-side anticipation/Irama layer,
- multi-principal scope/audience governance independent of memory type,
- replaceable derived fleet-memory engines where useful.  
  [REF-GRAPHITI] [REF-OPTMEM] [REF-TIMEM] [REF-HORMA] [REF-TMEM] [REF-COLLAB-MEMORY] [REF-CAURA]

## 12.0 Memory dimensions and Memory Firewall

The Memory Firewall must decide more than “remember / forget.” A durable candidate is evaluated across **independent dimensions**.

```text
MEANING / TYPE
episodic · semantic · procedural · resource · prospective · narrative · ...

VISIBILITY / SCOPE
personal · role/team · work-object · institution · compartment/restricted · public

DATA CLASS
ordinary · internal · confidential · health · student-welfare · HR · cultural · ...

RETENTION
drop · turn-only · expiring · work-object lifetime · reviewed durable · legally governed

TIME
event time · valid time · record time · review/expiry time
```

MIRIX is a useful reference for typed memory stores; Vellum's current personal memory also separates several semantic memory types. Aksara deliberately does **not** encode visibility or retention into those types. [REF-MIRIX] [REF-VELLUM-MEMORY-V3]

A harmless piece of office gossip may be visible to Maria and her coworker while still being classified `drop` or short-lived `ephemeral`. Conversely, a procedural emergency checklist may be institution-wide and durable. Human beings have spent enough millennia proving that “people heard it” and “archive forever” are not synonyms.

Suggested authoritative record:

```yaml
MemoryRecord:
  id: mem_...
  institution_ref: ...
  type: semantic | episodic | procedural | resource | prospective | ...
  subject_refs: [...]
  author_principal_ref: ...
  custodian_ref: ...
  scope:
    kind: personal | team | work_object | institution | restricted | public
    refs: [...]
  audience_policy_ref: ...
  data_class: ...
  purpose_constraints: [...]
  source_event_refs: [...]
  artifact_refs: [...]
  derived_from: [...]
  valid_from: ...
  valid_until: ...
  recorded_at: ...
  state: candidate | approved | superseded | revoked
  retention:
    mode: ephemeral | ttl | work_object | durable_reviewed
    expires_at: ...
    review_at: ...
  consent_or_mandate_refs: [...]
  provenance: ...
```

A Jev-like compact model is a strong candidate for bounded judgments such as:

```text
memory.persistence
memory.type
memory.sensitivity
memory.scope_candidate
memory.retention_candidate
memory.activation
```

but the model output is an input to deterministic/policy enforcement, not an ACL. AIM's multi-user results are an explicit warning against treating visibility classification accuracy as authorization correctness. [REF-AIM-MULTIUSER]

Write path:

```text
conversation / observation / artifact
          ↓
memory candidate extraction
          ↓
small bounded scorers + deterministic features
          ↓
Memory Firewall policy
          ↓
optional human/domain review
          ↓
AUTHORITATIVE MemoryRecord / artifact / event
          ↓
derived indexes/backends
```

Native Vellum/Hermes memory writes must be disabled, redirected, or treated as non-authoritative caches for an Aksara deployment. There must be one canonical institutional persistence path.

## 12.0A Multi-principal read view

The Context Assembler does not query “all memories then filter.”

```text
AccessContext
  ↓
MemoryViewPolicy
  ↓
eligible MemoryRecord IDs/scopes
  ↓
FTS/vector/graph/trigger search inside eligible domain
  ↓
current MemoryView
```

For shared audiences, policy must consider every recipient or explicitly produce a redacted/aggregate transformation. [REF-COLLAB-MEMORY]

## 12.0B Caura (formerly MemClaw)

**Status: PROTOTYPE as optional derived multi-agent memory backend; not canonical institutional memory.**  
**Source pin:** [REF-CAURA]

Caura is the strongest current open-source candidate found for **governed fleet memory**, and it deserves more than a footnote. It already provides:

- multi-tenant storage,
- `scope_agent` / fleet-team / cross-fleet organization scopes,
- agent-scoped credentials and trust tiers,
- audit logs,
- hybrid vector + keyword retrieval,
- entity/relationship graph expansion,
- PII flags,
- contradiction detection and supersession chains,
- per-agent retrieval tuning,
- MCP/REST clients and a turn-oriented Rail SDK,
- self-hosted/offline-capable deployment.

That overlaps enough of Aksara's *derived* memory plumbing that we should benchmark it rather than reflexively reimplementing every search/governance mechanism. [REF-CAURA]

However, Caura cannot simply become “Aksara memory” because its native ontology is fleet-oriented:

```text
tenant
agent
fleet/team
organization
```

while Aksara additionally requires:

```text
human Principal + IdentityBinding
Membership / RoleAssignment / Mandate
ConversationLane + audience
WorkObject / case / patient / class / project scope
purpose-bound and cultural/clinical compartments
event-time + valid-time institutional facts
evidence/authority separation
Memory Firewall retention semantics
Trigger Index + Irama
public ETNOS boundary
```

Caura also currently brings PostgreSQL + pgvector + Redis + API/storage services in the normal self-hosted profile. That is reasonable for Node+/hosted deployments but materially heavier than the P1 SQLite-first baseline. [REF-CAURA]

Therefore freeze the port, not the dependency:

```text
DerivedMemoryBackend
  index(approved_record)
  remove(record_ref)
  query(authorized_scope, query, filters)
  lineage(record_ref)
  rebuild(authoritative_records)
  health()
```

Candidate profiles:

```text
P1 local:
  SQLite + FTS
  Graphiti/FalkorDB Lite
  optional sqlite-vec/LanceDB
  Continuity Tree
  Trigger Index

Node+ / hosted experiment:
  Caura for fleet-scale recall/governance/search
  + only the Aksara projections Caura does not replace
```

Do **not** automatically run Caura, Graphiti, LanceDB and every other database simultaneously like we're collecting Pokémon. Benchmark overlap. If Caura can absorb FTS/vector/contradiction/fleet-search duties for a profile, remove redundant derived components there.

Every Caura request still receives a pre-resolved Aksara authorization scope. Caura's agent trust tier may narrow access; it may never widen access beyond Cedar/Aksara policy.

## 12.1 Four memory mechanisms, one governed system

```text
                   AUTHORITATIVE MEMORY
        artifacts · ledger · events · approved facts
                        │
       ┌────────────────┼──────────────────┐
       ▼                ▼                  ▼
   Graphiti        Continuity Tree     Trigger Index
 temporal graph      compression       associative reach
       │                │                  │
       └────────────────┼──────────────────┘
                        ▼
                 Context Assembler
      FTS + semantic + temporal + associative
                        │
                        ▼
                   Active Context
```

The mechanisms answer different questions:

| Mechanism | Question |
|---|---|
| Authoritative store | What happened / what is recorded? |
| Graphiti | What is related, when was it true, and where did it come from? |
| Continuity Tree | At what temporal abstraction level should history be recalled? |
| Trigger Index | Under what future situation should an otherwise unrelated memory come back? |
| Context Assembler | Which authorized subset belongs in the current working context? |

## 12.2 Authoritative store

**Status: FREEZE**  
**Source pin:** [REF-SQLITE]

Primary:

- SQLite WAL for transactional state/event indexes,
- files/object store for source artifacts,
- structured/signed ledger records,
- human-readable export where appropriate.

Derived graph, vector, trigger and summary structures must be rebuildable.

## 12.2A Local-first substrate bakeoff: `any` / any-sync / anyrt

**Status: BAKEOFF; do not replace SQLite P1 baseline yet.**  
**Source pins:** [REF-ANY] [REF-ANY-SYNC]

The 2026 `any` developer-preview stack is unusually relevant because it combines several implementation concerns that Aksara currently keeps separate:

```text
any-store
  local document database
  SQLite-backed storage
  full-text + vector indexes
  live/reactive queries

any-sync
  local-first CRDT replication
  encrypted/signed change history
  LAN/P2P collaboration
  space/access metadata

anyrt
  Rust-hosted Python-in-Wasm jobs/agents/triggers
```

This is a **consolidation candidate below Aksara semantics**, not a replacement for `TrustDomain`, Memory Firewall, Ledger, WorkObject or policy. The correct question is whether it can reduce the amount of state/sync/search/job plumbing Aksara owns while preserving Aksara's contracts.

Important current caveats:

- the new `any` database/runtime is explicitly developer preview and pre-1.0;
- current preview HTTP/local API security must be treated as local-development scope rather than an Aksara trust boundary;
- any-sync self-hosted network infrastructure can introduce coordinator/consensus/file-store dependencies that may be inappropriate for a single P1 Node;
- its spaces/ACL/account semantics must not silently become Aksara institutional identity/authority;
- explicit local/staging configuration is required in tests so a development instance cannot accidentally join an unrelated production sync network.

Deciding fixture:

```text
two Nodes
  → create/write fully offline
  → divergent edits
  → membership/authority change while partitioned
  → rejoin + conflict resolution
  → FTS/vector query
  → backup/export/restore
  → revoked-device test
  → measure services/RAM/disk/support burden
```

Promotion can be partial. `any-store`, any-sync or anyrt may be useful independently even if the complete stack is not.

## 12.3 Temporal institutional graph

**Primary:** Graphiti.  
**Status:** ADOPT as derived projection.  
**Source pin:** [REF-GRAPHITI]

**P1 local profile:** prefer Graphiti with FalkorDB Lite where Python 3.12+ is available; use standalone FalkorDB as the fallback. Kuzu is no longer a new-deployment target because Graphiti upstream marks it deprecated. The graph remains rebuildable from authoritative Aksara records, so this backend choice is intentionally replaceable. [REF-FALKORDB-LITE]

Use for:

- entities,
- temporal facts,
- relationship edges,
- source episodes/provenance,
- supersession/history,
- custom ontology.

Graphiti is not the sole source of truth.

## 12.4 Continuity Tree

**Primary design:** OptMem/TiMem-inspired, with HORMA as a navigation/retrieval reference.  
**Status:** PROTOTYPE.  
**Source pins:** [REF-OPTMEM] [REF-TIMEM] [REF-HORMA]

Purpose:

- bounded context,
- progressive consolidation,
- reversible drill-down toward source evidence,
- cheap long-horizon continuity.

Possible levels:

```text
raw retained fragments
  ↓
session / work-unit summary
  ↓
day / work-period summary
  ↓
week / project-period summary
  ↓
long-term continuity abstraction
```

The tree is a context structure, not institutional truth.

## 12.5 Associative Trigger Index

**Primary inspiration:** T-Mem.  
**Status:** PROTOTYPE / EVALUATE against hybrid retrieval.  
**Source pin:** [REF-TMEM]

T-Mem's important idea is **write-time rehearsal for future retrieval**. A memory is stored with cues for situations in which it may matter later, so recall is not limited to lexical or embedding similarity.

Aksara adopts the idea but changes the operating model from personal conversational memory to governed institutional memory.

Suggested derived object:

```yaml
Trigger:
  id: trig_...
  source_memory_ref: mem_...
  trigger_family: entity | bridge | scene | horizon
  cue: "when severe weather approaches and oxygen stock is near one week"
  valid_from: ...
  valid_until: ...
  source_policy_ref: ...
  visibility: restricted
  provenance:
    generator_model: ...
    generated_at: ...
    source_revision: ...
  rebuildable: true
```

Rules:

1. **Trigger text inherits the same or stricter access class as its source.**
2. **Authorization filters the eligible memory domain before trigger matching.**
3. **Triggers are derived indexes, not evidence.**
4. **Triggers may expire or be superseded.**
5. **A trigger always links back to the source memory/fact/episode.**
6. **Changing the trigger generator may rebuild triggers without migrating institutional truth.**

Retrieval order:

```text
Actor Context
    ↓
authorized memory scopes
    ↓
current event / query
    ↓
trigger match + temporal/graph/search retrieval
    ↓
decision.score(memory.activation)
    ↓
context budget / policy
    ↓
preload | surface | background | ignore
```

Not:

```text
search all secrets first
  → discover later that the actor should never have seen them
```

## 12.6 Memory activation

`decision.score(memory.activation)` is a bounded judgment, not policy.

Candidate classes:

```text
irrelevant
background
inject
surface
urgent-review
```

Inputs may include:

- Trigger,
- current objective,
- actor/role,
- source quality,
- memory age,
- valid-time status,
- institutional state,
- predicted future state,
- context budget.

A tiny Jev-like model is a strong candidate for this job; deterministic heuristics remain a baseline.

## 12.6A Jev-Mem control-plane reference

**Status: ADOPT the control pattern; do not adopt the storage ontology wholesale.**  
**Source pin:** [REF-JEV-MEM]

Jev-Mem is the clearest external validation yet for separating frequent memory-control judgments from expensive deliberation. Its useful pattern is a three-plane system: a fast typed controller, a shared multi-relational memory plane, and a slower System-Two answerer. On read it routes the query, allocates retrieval budget, expands relation views, scores candidates and stops adaptively rather than asking an autoregressive LLM to narrate every memory operation.

Aksara should borrow the **budgeted closed-loop retrieval controller**, batched bounded questions, and deterministic handling of exact IDs/timestamps. It should *not* inherit Jev-Mem's default assumption that every valid observation is worth preserving. Institutional Aksara has a stricter problem: persistence itself is governed by retention, purpose, sensitivity, audience, legal/clinical/cultural compartment and provenance.

```text
AccessContext
   ↓
authorized candidate domain
   ↓
anchors: FTS/vector/entity/time/trigger
   ↓
System-One control loop
   route relations
   allocate budget
   score novelty/evidence/usefulness
   expand if needed
   stop when sufficient
   ↓
selected evidence
   ↓
System-Two synthesis
```

The System-One controller never widens the authorized domain and never turns retrieval confidence into authority.

## 12.7 Full-text / semantic recall

- SQLite FTS5: FREEZE lexical baseline. [REF-SQLITE]
- sqlite-vec: EVALUATE low-footprint vector index. [REF-SQLITE-VEC]
- LanceDB: EVALUATE stronger embedded alternative. [REF-LANCEDB]
- AssoMem: research/eval baseline for graph-style associative retrieval, not a replacement for Graphiti + T-Mem triggers. [REF-ASSOMEM]

## 12.8 Memory framework alternatives

Caura is promoted to a first-class **derived-backend prototype** for Node+/hosted fleet memory. MemOS, Letta, Mem0, Supermemory and Cognee remain benchmark/reference providers rather than canonical architecture. Letta shared blocks are useful for small bounded handoff/task state but are not a substitute for transactional institutional state; its own concurrency guidance highlights lost-update risk for concurrent whole-block rewrites. [REF-CAURA] [REF-LETTA-SHARED]

Aksara retains its own persistence classes, human/institution principal model, purpose/audience policy, authority/evidence semantics, temporal facts, Trigger Index and public/private boundary regardless of derived backend.

---

# 13. Irama / anticipatory institutional work

The older Aksara “Irama” idea and T-Mem-style recall are complementary, not duplicates.

**Irama is world-side anticipation.**  
**T-Mem-style triggers are memory-side prospective reachability.**

```text
         WORLD / INSTITUTIONAL STATE
calendar · quarter · deadlines · inventory · weather · sensors
                         │
              deterministic schedules
                         │
              TimesFM / TTM forecasts
                         │
       JEPA-style temporal representations
                         │
              external Horizon signals
                         ▼
               CURRENT / PREDICTED EVENT
                         │
                         ▼
                ASSOCIATIVE TRIGGERS
         "which old knowledge matters now?"
                         │
                         ▼
          decision.score(memory.activation)
                         │
                         ▼
        contextual preload / preparation proposal
                         │
                         ▼
               policy / approval / lease
                         │
                         ▼
                    execution
```

## 13.1 P1 order

1. deterministic calendar/deadline registry,
2. institutional statistics and thresholds,
3. ordinary time-series forecasting,
4. JEPA-style representation research where it adds value,
5. trigger matching against current/predicted state,
6. governed preparation.

## 13.2 Examples

```text
Historical memory:
"Printer toner takes 3–4 weeks to reach this district."

Trigger:
"relevant before high-volume reporting / printing periods"

Irama signal:
quarter-end reporting period enters 30-day horizon

Result:
surface procurement readiness memory,
check stock,
propose reorder if threshold is crossed
```

```text
Historical memory:
"Field acoustic recorders failed after prolonged >90% humidity."

Trigger:
"relevant when planning a field campaign or prolonged humidity is forecast"

Irama signal:
field campaign objective created + wet-season forecast

Result:
preload failure evidence and propose protective equipment/checklist
```

The memory system may prepare context or propose work. It does not autonomously spend money, publish, sign, or change records.

---

# 14. Memory Firewall and `decision.score`

## Stable interface

**Status: FREEZE**

```json
{
  "task": "memory.persistence",
  "candidates": ["drop", "turn_only", "expiring", "durable_candidate"],
  "features": {},
  "context_ref": "..."
}
```

`memory.persistence` must not smuggle visibility into a retention label. Separate bounded jobs propose orthogonal dimensions:

```text
decision.score(memory.persistence)
decision.score(memory.type)
decision.score(memory.sensitivity)
decision.score(memory.scope_candidate)
decision.score(memory.retention_candidate)
decision.score(memory.activation)
decision.score(observation.salience)
decision.score(capability.route)
decision.score(model.route)
decision.score(reasoning.effort)
decision.score(surface.compose)
decision.score(document.triage)
decision.score(voice.state)
```

Example:

```text
type        = semantic
scope       = personal
sensitivity = ordinary
retention   = expiring
```

is perfectly valid. So is:

```text
type        = procedural
scope       = institution
retention   = durable_reviewed
```

A compact scorer may suggest these labels, but Memory Firewall policy and, where required, domain/human review determine the persisted record. [REF-AIM-MULTIUSER]

## Jev-like model family

**Status: EVALUATE / preferred tiny-decision direction**

Compact scorers are appropriate where a frontier model would be absurdly expensive.

Alternatives:

- GLiClass/classifier-class models,
- small Qwen/Gemma structured scoring,
- classical classifiers,
- larger Decider-class models for harder bounded judgments.

Hard rule:

> `decision.score` may judge relevance, likelihood, class or routing. It may not invent authority.

## System-One deployment rule: cascade, not universal middleware

The P1 mistake would be to insert a tiny System-One model before **every** tool choice just because the abstraction exists. Generic open replicas are useful, but recent open work also shows that zero-shot behavior and probability calibration degrade on unseen task families and may improve sharply after narrow task-specific tuning. [REF-SYSTEM-ONE-OPEN] [REF-OPEN-JEV-FINETUNE]

Use a cascade:

```text
1. deterministic route
   schema/work-object/state implies the capability

2. resident LLM direct choice
   small tool set or routing entangled with deliberation

3. System-One scorer
   high-frequency + bounded + batchable decision
   large candidate set / repeated routing

4. low-confidence / OOD / disagreement
   escalate to resident LLM

5. policy/lease/approval
   deterministic below every path
```

For P1, `decision.score(...)` is the stable API while the backend may be heuristics or resident-LLM scoring. The preferred route to a genuinely useful local System-One cortex is **trace first, specialize second**: collect Aksara's real routed decisions and outcomes, curate/evaluate them, then distill or fine-tune a compact scorer on the actual institutional distribution.

This is especially compelling for memory, document triage, model/effort routing, surface composition and other repetitive bounded judgments. Astra-Ares is a useful experimental reference for `decision.score(reasoning.effort)`, but not an Aksara dependency. [REF-ASTRA-ARES]

---

# 15. Institutional graph and Graph Packs

```text
Ontology
  ↓
Temporal Institutional Knowledge Graph
  ↓
Objective Subgraph
  ↓
Requirements + Evidence + Authority
  ↓
Execution DAG
  ↓
Capabilities
  ↓
Evidence / Outcome
  ↓
Graph / State Update
```

**Status: FREEZE**

Graphiti helps maintain the temporal projection; Aksara owns objective/evidence/authority semantics. [REF-GRAPHITI]

Graph Packs define:

- ontology extensions,
- objective templates,
- requirements,
- evidence schema,
- authority rules,
- provenance rules,
- capability bindings,
- migrations,
- tests/evals.

P1 breadth packs:

- government/institution,
- education,
- clinic,
- science/field,
- balai masyarakat adat.

---

# 16. Capability system

Stable classes:

```text
Observe   read/capture/query
Interpret classify/embed/forecast/analyze/transform
Act       publish/submit/control/change external state
```

A capability may use:

```text
wasi-component
native-rust
python-worker
mcp-service
remote-api
hardware-driver
agentos-workspace
bend-kernel
```

Implementation selection depends on policy, offline state, hardware, latency, validation, data class, licensing and resource envelope.

## Capability adapter factory

**Status: EVALUATE as development tooling, never runtime authority.**  
**Source pin:** [REF-CLI-ANYTHING]

CLI-Anything is a strong methodology for turning GUI-heavy/open-source software into stateful, testable, JSON-speaking agent harnesses by inspecting the real application backend rather than teaching an agent to click pixels forever. For Aksara this belongs in the **capability factory**: scientific desktop tools, EDA, GIS, media, legacy office utilities and similar software can be wrapped, tested and then promoted into a governed Capability Pack.

Generated harnesses are untrusted candidate code until they pass:

```text
source/backend review
→ typed schema wrapping
→ sandboxed integration tests
→ deterministic output validation where possible
→ authority/data-class annotation
→ pack signing/provenance
→ explicit promotion
```

A generated CLI never receives institutional credentials merely because its tests passed.

## Pack distribution

**Primary:** OCI artifact + ORAS. [REF-ORAS]  
**Signing:** Sigstore/cosign. [REF-SIGSTORE]  
**Discovery input:** MCP Registry. [REF-MCP-REGISTRY]

Aksara extends external metadata with side-effect class, authority class, offline behavior, hardware/calibration requirements, resource envelope, sensitivity, validation geography/language/environment and local approval status.

**v0.9 packaging posture:** Capability Packs remain useful, but they are not treated as a moat or a proprietary app-store thesis. A Pack is Aksara's governed packaging/conformance envelope around capabilities that may originate from MCP servers, external app/plugin ecosystems, local WASM/native modules, Python workers, remote APIs, instrument drivers or other standards. Where upstream systems already provide a good UI or integration surface, prefer adapters and compatibility over reimplementation.

A Pack may optionally provide one or more **screens** to the Workbench. Those screens are subordinate to Aksara identity, authority, data-class and provenance contracts; UI generation does not bypass policy.

## External capability/data discovery: Alexandria

**Status: EVALUATE as optional discovery/broker adapter.**  
**Source pin:** [REF-ALEXANDRIA]

Firecrawl Alexandria is useful as a remote provider/data-capability catalogue and execution surface, especially for Horizon/research work. It is **not** the canonical Aksara Capability Registry.

Borrow:

- search results that can surface both information and relevant callable providers,
- progressive provider → capability → contract disclosure,
- explicit price/access metadata,
- provider terms represented by version + digest and explicit human acceptance,
- stable request IDs for uncertain/retried operations,
- provider operation receipts.

Aksara wrapping flow:

```text
Alexandria / MCP / external catalogue
        ↓ discovery only
Aksara import/wrapper
        ↓
local Capability Registry metadata
  policy · side-effect class · cost · license/terms
  network requirement · data class · geography validation
        ↓
Capability Lease
        ↓
execution + receipt
```

Terms acceptance must itself be a governed artifact; original user intent never silently implies acceptance of third-party terms. [REF-ALEXANDRIA]

---

# 16A. Existing-system adapters and ready-made operational substrate

Aksara should not rebuild operational software that already works merely to keep the architecture conceptually self-contained. Capability Packs may compose mature field, records, workflow and community systems while preserving Aksara's authority, evidence and receipt semantics.

## 16A.1 System-of-record adapter contract

Every first-party system adapter exposes at least:

```text
system identity + version
read model + provenance/version
authentication/credential boundary
resource identifiers
draft/preparation mapping
operator approval point
idempotent submit/commit operation when available
destination receipt / accepted state
reconciliation / retry rules
manual hand-off path when API access is unavailable
```

Aksara's visible state distinguishes:

```text
PREPARED → APPROVED → SUBMITTED → ACCEPTED_BY_DESTINATION
```

A successful local workflow is not represented as a completed external action until the destination system or responsible human provides the corresponding receipt. Public documentation for an API does not by itself authorize a deployment to use it.

## 16A.1A Generic connector substrate: OpenConnector

**Status: HIGH-PRIORITY SPIKE / ADAPTER candidate.**  
**Source pin:** [REF-OPENCONNECTOR]

OpenConnector is a current Apache-2.0 self-hostable integration layer advertising a shared catalogue of **1,000+ providers and 10,000+ actions**, with OAuth/API-key handling, schemas/scopes, policy controls and MCP/HTTP/OpenAPI/CLI surfaces. The exact provider catalogue and quality are empirical questions, but the project is already broad enough that Aksara should benchmark it **before writing another generic SaaS OAuth connector by hand**.

Aksara wrapping rule:

```text
OpenConnector provider/action
        ↓ discovery + credential brokerage
Aksara capability wrapper
        ↓
side-effect class · purpose · audience · budget · policy
        ↓
Capability Lease / approval
        ↓
execution + destination receipt
```

OpenConnector does not own the institutional capability registry, user mandate, WorkObject or Ledger. A successful vendor action is not considered accepted until the destination state/receipt is reconciled under Aksara semantics.

## 16A.2 Ready-made components to integrate or benchmark

| Need | Candidate | v0.6 posture |
|---|---|---|
| offline/field forms and longitudinal intake | ODK Central | **High-priority integration/spike**; Aksara adds evidence, memory, decisions and follow-up rather than rebuilding forms [REF-ODK] |
| public-service/humanitarian cross-system workflows | OpenFn | **High-priority regional/hosted adapter**; side effects still cross Aksara policy/receipts [REF-OPENFN] |
| existing health/education program capture | DHIS2 Tracker/Android where already deployed | integrate rather than compete with a registry [REF-DHIS2] |
| village information systems | OpenSID where adopted | named/versioned adapter; confirm actual deployment/API permissions [REF-OPENSID] |
| cultural collections/protocols | Mukurtu + Local Contexts | governance/reference integration for adat and Indigenous packs, not a generic ACL substitute [REF-MUKURTU] [REF-LOCALCONTEXTS] |
| document management/operator UX | Paperless-ngx / Mayan EDMS | benchmark before building a full DMS [REF-PAPERLESS] |
| ticket/SLA/assignment semantics | Frappe Helpdesk | code donor/reference for `WorkObject`/`WorkItem`, not canonical Aksara state [REF-FRAPPE-HELPDESK] |
| omnichannel support intake | Chatwoot | optional channel adapter; cases remain Aksara-owned [REF-CHATWOOT] |
| relationship-heavy authorization | OpenFGA / SpiceDB | benchmark when reverse membership/sharing queries exceed the local relationship store + Cedar profile [REF-OPENFGA] |
| identity provider | institution OIDC / ZITADEL / Keycloak | integrate rather than implement a general IdP; offline Node binding/revocation stays Aksara-specific [REF-ZITADEL] |
| civic deliberation | Decidim | benchmark for consultation/process semantics; not a substitute for local mandate rules [REF-DECIDIM] |
| outreach/surveys | RapidPro / U-Report patterns | benchmark for consented notification/feedback channels [REF-RAPIDPRO] |

The design priority is to reuse mature application chunks while keeping Aksara's institutional semantics portable. A Capability Pack may therefore be mostly policy, mappings and adapters rather than a new application.

---

# 16B. Vertical profiles: integrate mature systems, keep one Aksara substrate

A vertical is a **profile of adapters, policies, evidence rules, surfaces and evaluation**, not a separate Aksara product or a reason to rebuild the domain's existing system of record. The same Aksara semantics should survive across verticals; what changes is the operational substrate and authority boundary.

## 16B.1 Balai / community / cultural stewardship

**Existing systems to integrate or learn from:** Mukurtu, Local Contexts, CoMapeo/Awana Digital, Guardian Connector, ODK/Kobo where used. [REF-MUKURTU] [REF-LOCALCONTEXTS] [REF-COMAPEO] [REF-GUARDIAN-CONNECTOR] [REF-ODK]

Guardian Connector is especially close to part of Aksara's mission. Its current design explicitly combines community-controlled infrastructure, open/file-first formats and integrations with tools communities already use rather than replacing them. That is a validation of the **connective infrastructure** strategy, not a reason to duplicate its environmental-data warehouse. [REF-GUARDIAN-CONNECTOR]

Aksara contributes:

- conversational/local-language access to approved material;
- provenance-aware memory and preservation of disagreement;
- community meetings, drafting and bounded mandates;
- protected institutional/cultural TrustDomains;
- cross-tool retrieval and explanation;
- reviewed public projection to ETNOS;
- governed requests/exchange between communities and institutions.

Do not rebuild CoMapeo's territorial field capture or Mukurtu's cultural-collection model simply because Aksara can generate a form.

## 16B.2 Education / learning centre

**Operational substrates:** Kolibri and Moodle/MoodleBox for offline/local learning content; Dapodik/Rapor Pendidikan or other official systems where a school is required to use them. [REF-KOLIBRI] [REF-MOODLEBOX]

Kolibri is particularly relevant to Aksara's original low-infrastructure thesis: a local server can serve learners and synchronize activity/content over a LAN without WAN. Current Kolibri workflows still have constraints around creating new content channels fully offline, so community-authored material should not be assumed to flow through Kolibri Studio during long partitions. [REF-KOLIBRI]

Aksara contributes:

- cited explanation/tutoring over approved local content;
- teacher/institution continuity and meeting/admin memory;
- local-language assistance and translation with explicit uncertainty;
- document/form preparation and existing-system handoff;
- optional shared room presence;
- school-to-community or school-to-institution requests through governed exchange.

Aksara does **not** become the LMS or student record system.

## 16B.3 Cooperative / small local institution

**Operational substrate:** ERPNext/Frappe is the leading open/self-hostable integration candidate for stock, purchasing, sales, accounting and basic operations. Its DocType model exposes consistent REST APIs and webhooks with scoped integration users. [REF-ERPNEXT]

Aksara contributes:

- natural-language explanation of stock/orders/cashflow from authorised records;
- handover/continuity across staff;
- discrepancies, due items and transport/supply coordination;
- correspondence and document preparation;
- bounded action proposals that ERPNext remains authoritative for.

Odoo remains a market/comparator option, but its current external API availability depends on deployment/commercial plan; it is not the default open P1 integration assumption.

## 16B.4 Government / local public institution

Government deployments remain a first-class vertical without defining Abstraksi as a government-only product. Aksara interoperates with the systems an office is already required or authorized to use: SRIKANDI, OpenSID, SIPD, sector systems, approved data exchanges and local document repositories.

Preferred path:

```text
read/API/export where documented and authorized
  -> prepare/draft
  -> human approval
  -> API/import if supported
  -> Workstation Bridge/manual handoff if not
  -> destination receipt/reconciliation
```

The Workstation Bridge is especially relevant here because many government systems remain browser-oriented and may expose only partial integration surfaces. Browser automation does not create API authorization and is never used to bypass access controls. Community deployments and government deployments may exchange approved artifacts without sharing administrators, root keys or source archives.

## 16B.5 Clinic / Puskesmas

**Operational substrates:** SATUSEHAT/FHIR at the national interoperability boundary where applicable; OpenMRS/Bahmni/OpenSRP/DHIS2 and local systems where actually deployed. [REF-SATUSEHAT-FHIR] [REF-DHIS2] [REF-OPENFN]

Aksara contributes administrative/institutional continuity, inventory/procedure retrieval, reporting preparation, correspondence and bounded non-clinical coordination. Clinical decisions, patient records and mandatory reporting systems retain their own authority and assurance requirements.

Health remains a **higher-assurance vertical**: deployment requires explicit clinical/privacy review and should not be used as the easiest P1 demo merely because the architecture can connect to FHIR.

## 16B.6 Field / conservation / territorial monitoring

**Operational substrates:** Guardian Connector, CoMapeo, ODK, SMART/EarthRanger/SERCA and their integration tooling where present. [REF-GUARDIAN-CONNECTOR] [REF-COMAPEO] [REF-ODK] [REF-EARTHRANGER]

The conservation software ecosystem is already mature and increasingly consolidated. SMART and EarthRanger are actively integrating their field, offline and command-centre capabilities; EarthRanger also exposes APIs for events/observations and existing hardware/data integration. Aksara should plug into that ecosystem rather than rebuild patrol, mapping or telemetry management. [REF-EARTHRANGER]

Aksara contributes:

- place-based conversational interpretation of permitted observations;
- institutional memory across field seasons and staff turnover;
- local research/analysis workflows;
- calibration/provenance-aware observation interpretation;
- community-controlled publication/exchange;
- low-bandwidth coordination and Node-local continuity.

## 16B.7 Research station / lab / field science

**Operational substrates:** Bluesky/Ophyd for instrument/experiment plans and records, labgrid for controlled hardware testing, Jupyter-compatible environments for analysis, OpenFlexure-class instruments where useful. [REF-BLUESKY] [REF-OPHYD] [REF-LABGRID] [REF-OPENFLEXURE]

Aksara contributes question formation, literature/context, reproducible data preparation, code/research workers, review, provenance, institutional memory and governed cross-institution requests. Instrument interlocks and domain safety remain in the instrument/controller layer.

## 16B.8 Vertical evaluation rule

A new vertical is promoted only when it strengthens the same underlying contracts:

```text
identity + trust domain + sources/memory + observation/evidence
+ authority + work/effects + surfaces + continuity + export/exit
```

A bespoke application that does not reuse those contracts belongs outside the base Aksara roadmap even if an LLM could be added to it.

---

# 17. Northbound gateway and model routing

## agentgateway

**Status: PROTOTYPE → likely ADOPT**  
**Source pin:** [REF-AGENTGATEWAY]

Use for commodity perimeter concerns:

- MCP,
- A2A,
- LLM/provider traffic,
- HTTP/gRPC routing,
- authentication,
- coarse authorization,
- virtual/federated MCP,
- retries/failover,
- guardrails,
- telemetry.

Aksara still decides exact semantic/action authorization.

## Alternatives

- **Bifrost**: strong provider gateway/governance option. [REF-BIFROST]
- **OrcaRouter Lite**: model-selection implementation behind `model.route`. [REF-ORCAROUTER]

Do not stack multiple AI proxies without measured value.

Aksara Gateway owns data/egress class, residency, redaction, provider allow/deny, budget class and logging policy.

## 17.1 `EgressPolicy`

Every external processor, including ASR/TTS/Live speech, OCR/VLM, model inference and remote tools, crosses the same semantic boundary:

```text
EgressRequest
  actor / institution / namespace
  workload
  data_class
  destination/provider
  region/residency class
  transformation/redaction
  retention requirement
  payload-logging policy
  budget class
```

A “voice provider” is not exempt because its output happens to be audio.

## 17.2 `InferenceAdmission` and `ComputeBudget`

Federation/public reachability does not imply free inference.

```text
Inbound request
   ↓
InferenceAdmission
   ├─ cached/public artifact
   ├─ deterministic/local retrieval
   ├─ local small model
   ├─ low-cost cloud model
   ├─ frontier model
   └─ defer/reject/requires sponsored budget
```

`ComputeBudget` can be scoped by institution, `GovernanceNamespace`, Principal class, public/remote caller class, capability, provider or time window. It belongs in Aksara's `UsageLedger`, even when a gateway adapter also implements provider budgets.

Cloudflare AI Gateway is a strong implementation reference for cost-based spend limits by model/provider/custom metadata, fallback to cheaper routes, BYOK secret storage and per-request payload logging controls. Aksara adopts these semantics but does not delegate institutional authority or its canonical UsageLedger to Cloudflare. [REF-CF-AIG-SPEND] [REF-CF-AIG-LOGGING]

Sensitive Gateway adapters must default to metadata-only or no provider-side gateway payload logging where supported; “observability” must not become a second shadow memory system.

## 17.2A Unified gateway/registry bakeoff

**Candidates:** `mcp-gateway-registry` + AGNTCY/OASF.  
**Status: SERIOUS BAKEOFF / DESIGN REFERENCE.**  
**Source pins:** [REF-MCP-GATEWAY-REGISTRY] [REF-AGNTCY]

The open ecosystem is converging on a larger control-plane problem than “MCP proxy.” The current `mcp-gateway-registry` project can register/govern MCP servers, A2A agents, skills, inference endpoints and generic REST backends, with encrypted backend credentials, caller/service credential modes, scopes, audit/rate controls and optional A2A proxying. AGNTCY's OASF + Agent Directory addresses federated description/discovery of agents, MCP resources and skills across organizations.

Before Aksara implements a proprietary combined Capability/A2A registry, run a consolidation fixture against:

```text
current:
  model gateway/routing
  + capability registry
  + MCP discovery
  + A2A agent discovery
  + credential brokerage

candidate building blocks:
  mcp-gateway-registry
  + AGNTCY/OASF Directory
  + Aksara semantic/policy layer
```

Aksara still owns `InstitutionActor`, `TrustDomain`, `Capability`, lease/authority semantics, UsageLedger and public-vs-private federation boundaries. External registry metadata is a **claim/discovery input**, never authority.

## 17.3 Indonesia-hosted provider lane

Deka LLM/Lintasarta is a useful **provider candidate**, not a trust-kernel dependency: it exposes an OpenAI-compatible managed model API hosted in Indonesia with pay-per-token billing and states that prompts/context/outputs remain in Indonesian jurisdiction. This is valuable when a deployment's policy favors domestic processing. [REF-DEKA-LLM]

No current research result establishes a broadly available Indonesian confidential-VM/TEE service suitable for P1. AMD SEV-SNP / Intel TDX / NVIDIA confidential GPU paths remain Node+/future options, not assumptions in the base architecture.

---

# 17A. Messaging/channel runtime references

**Status: ADOPT semantics; implementations remain replaceable.**  
**Source pins:** [REF-HERMES] [REF-OPENCLAW] [REF-VELLUM-IDENTITY]

P1 may use Hermes' mature messaging gateway where expedient. Hermes already carries normalized platform/chat/user/thread identity into durable sessions and supports multiple users over common channels. Aksara wraps those events into its own `IdentityBinding`, `ConversationLane` and `AccessContext`; Hermes session IDs never become institutional identity or memory scope. [REF-HERMES]

OpenClaw remains a particularly strong routing reference because it distinguishes agent identity, channel account, peer bindings and conversation scope, and supports explicit cross-channel identity links. Those semantics are folded into Aksara contracts rather than importing OpenClaw's whole state model. [REF-OPENCLAW]

Vellum's current gateway provides the strongest security reference of the three for gateway-only public ingress and stamped actor/trust verdicts. Aksara should aim for the same property: cognition receives already-resolved identity/access evidence and does not parse trust from conversation text. [REF-VELLUM-IDENTITY]

Channel adapters must expose a common envelope:

```text
InboundEnvelope
  channel
  channel_account
  external_message_id
  external_conversation_id
  external_thread_id?
  actor_external_subject
  audience_external_subjects?
  reply_target
  attachments
  transport_evidence
```

The identity/lane layer resolves this to an `AccessContext` before model invocation.

---

## 17A.1 Company Brain as institutional multiplayer-shell donor

**Candidate:** Supermemory `company-brain`.  
**Status: HIGH-PRIORITY CODE DONOR / BAKEOFF.**  
**Source pin:** [REF-COMPANY-BRAIN]

Company Brain is unusually close to Aksara's software-first institutional interaction problem: a multi-user Slack teammate with shared/private memory scopes, durable agent execution, tool approvals, scheduled work, MCP/app integrations and proactive participation. The open repository is valuable because it contains the operational lessons of a real multi-user product rather than only a framework abstraction.

Aksara should reuse/adapt the following patterns where they survive the fixture:

- normalized organization/user/channel/thread context before cognition;
- memory visibility scoped to the narrowest appropriate conversation/organization context;
- shared vs private recall without treating the whole workspace as one transcript;
- approval UX embedded in the conversation where the request originated;
- temporary/leased use of another principal's connected capability instead of ambient shared credentials;
- proactive triage that allows **PASS/silence** to win when a message does not need the agent;
- durable resume after tool approval/interruption;
- scheduled/long-running work and compact team-facing status;
- one-click/self-hostable operational packaging patterns.

Aksara does **not** inherit Company Brain's cloud-first assumptions, Supermemory-as-canonical-memory requirement, Slack tenancy as institutional identity, or its authority/effect semantics. Its code sits behind Aksara contracts:

```text
Slack / WhatsApp / Email / Web / Card / ETNOS
             ↓
Company-Brain-derived multiplayer/channel patterns
             ↓
Aksara IdentityBinding + ConversationLane + AccessContext
             ↓
Aksara Memory Firewall / Work / Capability Lease / Receipt
             ↓
resident harness (Vellum default hypothesis; measured alternatives)
```

Company Brain therefore challenges **channel/multiplayer shell code we might otherwise write ourselves**, not the Rust kernel, Vellum/Strands cognition bakeoff, Temporal/Flue durable institutional work, or canonical memory authority.

## 17A.2 Addressable institutional Aksara: email as a first-class channel

Each deployment may expose a stable email address in addition to ETNOS, A2A, web, messaging and voice. The address is a binding to an `InstitutionActor`, not the actor's canonical security identity.

Examples:

```text
aksara@institution.example
aksara@balai-x.etnos.example
```

Email enables ordinary users and external institutions to:

- CC Aksara into an existing thread;
- forward documents/attachments into governed ingest;
- request asynchronous work without installing an app;
- receive reports/artifacts;
- continue a task whose richer interaction happened on Card/phone/web.

The same actor can expose several channel bindings:

```text
InstitutionActor
  ├─ ETNOS ActivityPub actor
  ├─ email address
  ├─ A2A Agent Card/endpoint
  ├─ WhatsApp/Telegram/channel account
  ├─ web surface
  ├─ Node identities
  └─ principal-bound Cards
```

Existing institutional mail infrastructure is preferred when available. For managed Aksara/ETNOS subdomains, Cloudflare Email Routing/Email Service + Workers is an implementation candidate for inbound routing and programmatic outbound mail, behind the normal identity, egress and audit contracts. [REF-CF-EMAIL]

Email transport evidence (sender/address/thread IDs and authentication results where available) is input to identity resolution, not automatic proof of role or authority. Attachments follow the normal document-ingest and Memory Firewall path.

---

# 18. Voice

**Primary realtime session plumbing:** LiveKit Agents where deployment permits.  
**Alternative:** Pipecat or direct local modular chain.  
**Status:** ADOPT plumbing semantics; FREEZE privacy contracts; EVALUATE model profile.  
**Source pins:** [REF-LIVEKIT] [REF-QWEN3-ASR] [REF-NEMOTRON-DIAR] [REF-SHERPA-TTS-ID] [REF-GEMINI38-TTS] [REF-GEMINI-ZDR]

LiveKit owns VAD/turn handling, interruption, endpointing, streaming media plumbing and provider modularity when used.

Aksara owns speaker identity evidence, consent, transcript retention, audience/privacy class, Memory Firewall, session context and audit semantics.

## 18.1 Speech is an egress boundary

All external speech providers go through the Gateway exactly like text/model providers:

```text
microphone/audio
  → speech ingress policy
  → local processing where required
  → governed cloud ASR/Live only if permitted

response text
  → speech.render
  → audience/surface/data-class policy
  → local TTS or governed cloud TTS
```

Redacting a protected identifier before cloud reasoning and then restoring it **before cloud TTS** still sends the identifier to a third party. `speech.synthesize` therefore receives an `EgressPolicy` decision rather than being treated as a harmless renderer.

Google's paid Gemini Developer API terms state that paid prompts/responses are not used to improve Google's products, while limited abuse/safety logging can still occur. Gemini's Zero Data Retention guidance requires explicit configuration/feature avoidance; Live session resumption can retain text/audio/video state for up to 24 hours. Cloud TTS is still data processing, not a privacy bypass. [REF-GEMINI-ZDR] [REF-GEMINI-TERMS]

## 18.2 `speech.render` and room privacy

Stable high-level rendering call:

```text
speech.render(
  content,
  audience,
  surface,
  data_class,
  privacy_context
)
```

Profiles:

```text
AMBIENT / PUBLIC
  communal Node speaker
  mask or omit protected identifiers/person-level detail
  cloud or local TTS only after egress policy

PRIVATE ORDINARY
  Card/phone/headset/private room
  ordinary personal content
  provider path permitted by policy

PRIVATE PROTECTED
  sensitive case/health/identity/cultural content
  prefer local synthesis
  approved cloud path only when policy/contract permits
```

Even perfect local synthesis does not authorize a communal speaker to announce private content.

## 18.3 P1 ASR candidates

**Primary new evaluation candidate:** Qwen3-ASR-0.6B, with 1.7B as the quality reference. Upstream explicitly supports Indonesian and Malay among 52 languages/dialects and exposes offline + streaming inference under Apache-2.0. Streaming currently relies on the vLLM backend. Timestamp output uses a separate forced-aligner path with narrower language coverage and must be validated for the target language rather than assumed. [REF-QWEN3-ASR]

Keep Whisper-class models as a reference/fallback, particularly for CPU/runtime comparison and future Papuan Malay adaptation.

**Combined ASR + diarization challenger:** OpenMOSS `MOSS-Transcribe-Diarize` (0.9B, Apache-2.0) enters the bakeoff because it combines long-form transcription, timestamps, anonymous speaker diarization and acoustic-event awareness in one model. Upstream advertises broad multilingual support, but currently published competition/language evidence does not establish Indonesian/Papuan Malay quality strongly enough to assume parity. Promotion requires the same Aksara Voice Acceptance Corpus used for the modular Qwen3-ASR + Nemotron path. [REF-MOSS-TRANSCRIBE]

The deciding question is architectural as well as accuracy:

```text
Qwen3-ASR + Nemotron diarization
  vs
MOSS-Transcribe-Diarize

accuracy · DER · RTF · memory · streaming behavior · repair rate · deployability
```

The ASR winner is chosen on **Aksara's corpus and approved P1 hardware**, not by a generic English/Chinese leaderboard.

## 18.4 Speaker diarization

NVIDIA Nemotron 3 Diarization is a 100M open-weight candidate supporting streaming/offline operation and up to eight anonymous speaker channels. The lowest recommended streaming input-buffer configuration is currently 0.32 s; this number excludes model compute time. License is OpenMDW 1.1 rather than Apache/MIT and must stay in provenance metadata. [REF-NEMOTRON-DIAR]

Diarization answers “who spoke when” in session-local labels. It does **not** authenticate a person.

## 18.5 Local TTS floor

P1 now has an explicit CPU-friendly Indonesian fallback candidate: sherpa-onnx can run the Piper-derived `id_ID-news_tts-medium` VITS voice fully offline, including x86/ARM/Android paths. It is a one-speaker 22.05 kHz voice and should be treated as the **privacy/availability floor**, not presumed equal to frontier cloud voice quality. [REF-SHERPA-TTS-ID]

TTS is now maintained as a **three-tier bakeoff**, not one model choice:

```text
P1 CPU / offline privacy floor
  sherpa-onnx Indonesian Piper/VITS + future compact ID/MS voices

Node / Node+ local expressive quality
  VoxCPM2 + any newer open/open-weight expressive Indonesian/Malay candidates

Gateway / cloud quality
  Gemini TTS + other policy-approved providers
```

**VoxCPM2** re-enters the active catalogue as a Node+/local-quality candidate: the current 2B Apache-2.0 model publishes 30-language support including Indonesian and Malay plus voice design/cloning and 48 kHz synthesis. It is GPU-oriented and therefore does not replace the CPU privacy floor; measure actual VRAM, RTF, first-audio latency and long-form stability on selected Node+ hardware. [REF-VOXCPM2]

Do **not** anchor the radar on VoxCPM2. The standing research query is: *what is the smallest currently active open/open-weight expressive Indonesian or Malay TTS model that meets Aksara quality and licensing requirements?* Every candidate is sorted into CPU-floor, Node/Node+, or Gateway tier and run through the same intelligibility/naturalness/latency corpus.

CosyVoice 3.5 cloud APIs support Indonesian, but current official open repository weights remain on the 3.0 line whose published language set does not include Indonesian. Therefore do not cite “CosyVoice 3.5” as an offline P1 model until matching downloadable weights exist.

Gemini 3.8 Flash/Flash-Lite TTS remain governed Gateway candidates for high-quality/cloud speech. [REF-GEMINI38-TTS]

## 18.6 Voice Acceptance Corpus

Voice becomes a first-class P1 acceptance program rather than one benchmark sentence.

Required evaluation strata:

```text
formal Indonesian
informal Indonesian
Papuan Malay
Indonesian ↔ Papuan Malay code-switch
English technical terms inside ID/PM speech
Papuan personal/place/institution names
numbers, dates and identifier-like digit strings
near-field quiet
normal office
far-field room
fan/rain/traffic/background speech
2–8 speakers
overlap / interruptions
echo/reverberation
soft speech / varied ages and voices
```

Metrics:

```text
WER / CER
proper-name accuracy
number/digit exact match
code-switch preservation
diarization error rate
real-time factor
first-partial latency
end-of-turn latency
repair/repeat rate
human comprehension / "had to repeat" rate
```

Operational voice collection does not automatically become model-training data. Fine-tuning/training consent is a separate governance decision.


---

## 18.7 Realtime fast path and latency budget

The realtime voice front must not wait for the heaviest resident model to acknowledge simple physical interaction. P1 separates a **fast local interaction path** from deeper institutional cognition:

```text
wake / button / mic-open
  → local VAD / bounded intent / session control
  → immediate visual/haptic/earcon or cached acknowledgment
  → DelegationEnvelope to Node/Gateway institutional backend
  → asynchronous progress / needs-input / approval / completed updates
  → audience-cleared speech or text
```

Commands such as start/stop gathering capture, mark this moment, mute, cancel, hand off privately, accept/deny a capture lease and basic status should be deterministic/bounded wherever practical. They should not require a frontier model round-trip merely to make the object feel alive.

**Prototype experience targets (targets, not current performance claims):**

| Event | Target |
|---|---:|
| button/wake → visible listening state | `<100 ms` |
| accepted simple command → acknowledgment begins | p50 `<300 ms`, p95 `<700 ms` |
| gathering capture safely committed locally after approval | `<500 ms` after lease acceptance |
| ordinary conversational first useful speech on healthy path | p50 `<900 ms`, p95 `<1.5 s` |
| deep work | immediate truthful progress state; final result asynchronous |

Cached/local acknowledgments such as a short “iyo/bisa/sa catat” or earcon may cover the perception gap, but they never claim that a consequential effect completed before a receipt exists.

Addendum G remains the evidence/bakeoff record for LiveKit, Pipecat and cloud full-duplex candidates. The stable architectural requirement is the small responsive media/control loop + governed asynchronous backend, not any one provider.

## 18.8 Gathering capture: live evidence first, institutional memory later

Aksara distinguishes three stages:

```text
live transcript / diarization
        ≠
post-session canonical transcript / repaired speaker timeline
        ≠
approved institutional facts / decisions / WorkObjects
```

During a gathering, the low-latency path may maintain a live transcript, bookmarks and draft decision/action candidates. After the gathering, a slower pass may rerun higher-accuracy ASR/diarization, repair overlap/timestamps, reconcile names/context and produce reviewable decisions/actions. Only accepted/promoted results cross the normal Memory Firewall/Work path.

The primary room capture source is selected by a `capture.audio` Capability Lease as described in §0C. Multiple nearby Cards do not duplicate the same room audio by default. A Card may buffer/record locally when explicitly leased and policy permits; loss of uplink should not silently discard the capture.

---

# 19. Surfaces: Interface Contract, View Primitives, A2UI, AG-UI and MatrixUI

## 19.1 Internal semantic contract

**Status: FREEZE**

The core is not AG-UI, A2UI, Mermaid or raw pixels. Aksara emits semantic state and typed views.

```text
SurfaceIntent / SurfaceState
  entities
  signals
  relations
  metric/progress
  attention
  prompt
  approval
  presence
  privacy
  salience
  confidence
  age
  priority
  status
```

v0.5 extends this into trusted `ViewPrimitive`s:

```text
diagram
stepper
timeline
map
comparison
status
queue
approval
form
document
metrics
evidence
mandate
artifact
```

A view is data, state and allowed action semantics, not arbitrary model-generated executable UI.

```yaml
View:
  id: ...
  type: stepper | diagram | timeline | ...
  data: ...
  state: ...
  bindings: [...]
  allowed_actions: [...]
  audience_class: ...
  presentation_hints: ...
  provenance: ...
```

The main LLM may propose a view. A Jev-like scorer may choose salience/component family/density. Deterministic/trusted renderers own final layout and allowed interaction.

## 19.2 Intent-style semantic diagrams and walkthroughs

**Status: PROTOTYPE / strong code-and-design reference.**  
**Source pins:** [REF-INTENT] [REF-INTENT-DIAGRAMS]

Intent's custom diagram layer is substantially more useful than plain Mermaid for institutional UX because the diagram is a typed model with states rather than a string of boxes.

Useful grammars:

```text
architecture
sequence
state machine
data flow
network
flowchart
timeline
dependency graph
```

A diagram state can control visibility, highlights, camera/focus, narrative, overlays and transitions. Nodes can bind to real artifacts, files, logs or other entities. Aksara should adapt the paradigm to institutional objects:

```text
Case
Decision
Evidence
Mandate
Approval
Person/Role
Capability
Artifact
Sensor
Place
ETNOS object
```

Example:

```text
received ✓
   │
checked  ✓
   │
KTP      !
   │
approval ○
   │
done     ○
```

The user can drill into “why?” or source evidence rather than reading a paragraph before discovering the current state.

**Rule:** show state/structure first on visual work surfaces; explain on demand. This does not abolish prose.

## 19.3 Surface-specific rendering

One semantic state can render differently:

```text
Web / desktop workspace
  rich interactive diagrams, timeline, evidence, forms, approvals

Edge / phone
  compact stepper/cards + drill-down

64×64 Node
  one salient communal state via MatrixUI

WhatsApp / messaging
  natural coworker prose + compact structured summary/buttons
  complex views may become image/SVG snapshots plus actions

Email
  natural prose + HTML/table/view snapshot

Voice
  state narrative + optional synchronized visual state

ETNOS
  posts/discussion/public artifacts/trace projections
```

Busy office staff should not have to mine a wall of prose for “what do I need to do this week,” while WhatsApp/email should still feel like correspondence with a coworker rather than a malfunctioning ERP terminal.

Intent's state `narrative` pattern is especially useful for keeping visual and spoken explanations synchronized across languages. [REF-INTENT-DIAGRAMS]

## 19.4 A2UI

**Status: ADOPT with constrained Aksara catalog**  
**Source pin:** [REF-A2UI]

Use for declarative generated rich interfaces on browser/mobile/Card-class surfaces. A2UI is one renderer/protocol target of the Aksara Interface Contract, not the source of institutional state.

## 19.5 AG-UI

**Status: EVALUATE → preferred agent/frontend event-state transport where useful**  
**Source pins:** [REF-AGUI] [REF-OPENMUSE] [REF-OPENBOT]

OpenMuse/OpenBot demonstrate that AG-UI can carry a polished workspace, plans, approvals, live browser state, takeover and rich components without dictating a “generic chat UI.” Aksara may use AG-UI underneath web/mobile agent interactions while keeping its own view grammar and authority model.

## 19.6 Mermaid

**Status: ADOPT as ad-hoc explanatory fallback.**

Use Mermaid for disposable/static diagrams where semantic interaction is unnecessary.

```text
Mermaid                  typed ViewPrimitive.diagram
quick explanation        institutional interactive UI
string source             structured bindings + state
```

## 19.6A Deterministic generated charts: Microsoft Flint

**Status: SPIKE / CODE DONOR.**  
**Source pin:** [REF-FLINT]

Flint defines a compact semantic visualization intermediate language and compiles it deterministically into renderers including Vega-Lite, ECharts, Chart.js, Plotly and Excel-oriented outputs. This is a useful pattern for Aksara/Klerk because the agent can request *what the chart means* without generating a full plotting program or renderer-specific grammar every time.

Preferred experiment:

```text
Aksara typed metric/table result
   → Flint semantic chart spec
   → deterministic web/office chart
   → source bindings + provenance retained
```

Flint complements A2UI/AG-UI rather than replacing them.

## 19.6B Local/private geospatial workspace: GeoLibre

**Status: SPIKE / ADAPTER for field and science profiles.**  
**Source pin:** [REF-GEOLIBRE]

GeoLibre combines MapLibre, DuckDB-WASM Spatial and local/browser processing across web/desktop/mobile/Jupyter surfaces. It is worth testing as a reusable private geospatial workspace for Aksara Field/Science and ETNOS map artifacts before growing another bespoke GIS analysis environment. Canonical source/custody semantics remain Aksara/vertical-system concerns.

## 19.7 64 × 64 Node: MatrixUI

**Status: FREEZE**

Tiny vocabulary:

```text
Glyph · Label · Number · Meter · Ring · Sparkline
Timeline · Status · Progress · Choice · Presence · Alert · Transition
```

State grammar:

```text
Present/idle        sparse breathing point topology
Listening           particles converge toward focus
Thinking locally    compact morphing topology
Working externally  particles expand outward / return
Waiting for human   stable paused marker
Approval            bounded ring / minimal choice
Success             resolve briefly then dissolve
Offline             sparse constellation + queue count
Sync                packet motion between regions
Problem             fragmented but calm geometry
```

The Node does not render an entire dashboard. It renders the most salient authorized communal state from the same semantic view used elsewhere.

## 19.8 Renderer

**Primary:** Rust `embedded-graphics`.  
**Status:** PROTOTYPE → likely ADOPT.  
**Source pin:** [REF-EMBEDDED-GRAPHICS]

```text
ViewPrimitive / SurfaceState
   ↓
MatrixUI deterministic compositor
   ↓
embedded-graphics framebuffer
   ├─ Web/WASM simulator
   ├─ golden screenshots
   └─ USB frame/scene → ESP32-S3 → HUB75
```

Alternative: LVGL for future richer/higher-resolution displays. [REF-LVGL]


---

# 20. Device abstraction and data plane

## W3C WoT Thing Description

**Status: PROTOTYPE → ADOPT if impedance remains low**  
**Source pin:** [REF-WOT]

Describe device Properties, Actions, Events, schemas, bindings and security metadata.

```text
Thing property/event → Observe
model/algorithm       → Interpret
Thing action          → Act
```

## embedded-hal / embedded-io

**Status: ADOPT for Rust firmware/drivers**  
**Source pin:** [REF-EMBEDDED-HAL]

Do not invent GPIO/I2C/SPI traits.

## Zenoh

**Status: PROTOTYPE → likely ADOPT**  
**Source pin:** [REF-ZENOH]

Candidate internal data plane for observations, presence, sensors, health and telemetry.

```text
ConnectRPC = commands / explicit operations
Zenoh      = observations / signals / pubsub / query
```

SQLite outbox remains durable offline truth.

## Bubbaloop / AetherEdge

**Status: EVALUATE as references/adapters**  
**Source pins:** [REF-BUBBALOOP] [REF-AETHEREDGE]

Reuse ideas for physical-node discovery, Zenoh conventions, industrial protocols, commissioning, deterministic automation, alarms and device history without making either the institutional kernel.

---

## 20.1 Store-and-forward continuity transport

**Status: RESEARCH; not a P1 dependency.**

The device/data plane should leave room for very-low-bandwidth or intermittently connected transports without coupling Aksara semantics to any specific radio stack. A future `TransportPort` may carry compact signed envelopes over local mesh/store-and-forward systems such as Meshtastic/LoRa-class links: [REF-MESHTASTIC]

```text
request available
approval needed
small status update
artifact digest + retrieval pointer
node health / sync intent
```

Large documents, model traffic and ordinary ETNOS federation do not ride this path. The value is delayed institutional coordination when IP connectivity is unavailable, with the same identity, sharing and receipt semantics used by ordinary transports.

### 20.1A Medium-bandwidth mesh: Wi-Fi HaLow / OpenMANET

**Status: WATCH → field prototype candidate; not P1 dependency.**  
**Source pin:** [REF-OPENMANET]

OpenMANET provides a useful second transport class between ordinary Wi-Fi and LoRa/Meshtastic. Current releases use Wi-Fi HaLow (802.11ah) on Raspberry Pi/OpenWrt nodes with IP mesh routing and optional GPS/PTT/camera services. That makes it suitable for richer local-network traffic than tiny LoRa envelopes while retaining longer-range/sub-GHz characteristics.

```text
WAN / ordinary Wi-Fi
        ↓
Wi-Fi HaLow / OpenMANET
  IP mesh · files/voice/status where link budget permits
        ↓
LoRa / Meshtastic-class
  tiny signed envelopes / extreme-range degraded mode
```

Aksara keeps one transport-independent signed envelope/session contract. Radio choice remains deployment/regulatory/BOM policy. Before any Papua pilot, verify Indonesian frequency/channel certification, real non-line-of-sight range, power draw, hardware availability and interoperability with selected HaLow modules.

---

# 20A. Observation and actuation contract

Device discovery alone does not establish the quality or meaning of a sensor reading. Aksara therefore separates device capability from an `Observation` record. OGC SensorThings is the primary semantic reference for Things, Sensors, Datastreams, ObservedProperties, Observations and FeaturesOfInterest; W3C WoT remains the capability/device-description reference. [REF-SENSORTHINGS] [REF-WOT]

Minimum observation fields:

```text
Observation
  device_id / sensor_id
  observed_property
  value + unit
  observed_at + received_at
  clock_quality
  location + location_precision
  calibration_reference / calibrated_at
  firmware/config version
  quality_flags / stale / missing / out_of_range
  uncertainty (when known)
  raw_artifact_ref
  transform/model version (when derived)
  TrustDomain + retention + disclosure policy
```

The interpretation ladder is explicit:

```text
measurement
   ↓
interpretation / derived observation
   ↓
proposed response
   ↓
authorised action
```

A turbidity reading is not a chemical diagnosis, an acoustic classifier is not a definitive species record, and missing data is not a safe reading. Derived observations keep the raw/reference observation and transform version.

## 20A.1 Device subsystem profiles

Aksara does not need one universal IoT daemon. Two profiles cover different operational shapes:

- **Room/building profile:** Home Assistant + ESPHome + Wyoming is a strong code/subsystem donor for device integrations, local voice satellites, wake word, ASR/TTS service wiring and deterministic local automations. [REF-HOMEASSISTANT-WYOMING] [REF-ESPHOME]
- **Field/industrial profile:** Fledge is a stronger reference where sensor streams, buffering, north/south adapters and disconnected storage dominate. [REF-FLEDGE]

Only one subsystem owns deterministic device rules for a deployment. Aksara interprets, proposes and coordinates; it should not run a second hidden automation engine fighting Home Assistant/Fledge for the same actuator.

## 20A.2 Actuation safety

An LLM can propose a bounded command. Independent firmware/controller logic enforces:

- physical bounds and interlocks;
- watchdog/timeouts;
- rate limits;
- safe state after loss of control;
- manual/local override;
- actuator-specific approval class.

Institutional authorization and physical safety are separate gates. P1 starts with harmless outputs/simulators before pumps, mains power or other consequential equipment.

---

# 21. Model and intelligence catalogue

The architecture is model-name independent.

```text
PERCEIVE / REPRESENT
        ↓
JUDGE
        ↓
DELIBERATE
        ↓
POLICY / AUTHORITY
        ↓
EXECUTE
```

## Perceive / Represent

| Capability | Primary direction | Alternative / note | Status |
|---|---|---|---|
| `vision.embed` | compact DINO-class encoder | SigLIP/CLIP-class | EVALUATE |
| `video.represent` | **V-JEPA 2.x** | compact video encoder | PROTOTYPE |
| `timeseries.represent` | JEPA-style TS research | TS2Vec-class | RESEARCH |
| `timeseries.forecast` | TimesFM / TTM / Granite PatchTST-FM-r2 | classical/domain models | EVALUATE |
| `tabular.predict` | TabDPT / TabICLv2 bakeoff | CatBoost/LightGBM/XGBoost | EVALUATE |
| `text.embed` | compact multilingual embedding | provider/local alternatives | EVALUATE |
| `audio.represent` | specialist embeddings | ASR/bioacoustic encoders | EVALUATE |

**Source pins:** [REF-VJEPA2] [REF-TIMESFM] [REF-TTM] [REF-GRANITE-TS-R2] [REF-TABDPT] [REF-TABICLV2] [REF-FOUNDATIONFORECAST]

**Time-series substrate candidate:** FoundationForecast/TimeCopilot provides a unified Python interface across Chronos, Moirai, TimesFM, TiRex, Granite/PatchTST and other foundation models. Treat it as a capability-layer/code-donor candidate so Aksara does not maintain one bespoke adapter per forecasting family. [REF-FOUNDATIONFORECAST]

**Current compact TSFM candidate:** IBM Granite Time Series PatchTST-FM-r2 is ~385M parameters and adds probabilistic forecasting plus missing-value imputation under permissive model licensing. Its current GIFT-Eval position is upstream/model-card evidence and must be reproduced on Aksara-relevant time series before promotion. [REF-GRANITE-TS-R2]

**Tabular foundation-model lane:** TabDPT v1.3 and TabICLv2 enter the research/government/cooperative/science bakeoff for classification/regression over ordinary institutional tables. They do not replace CatBoost/LightGBM baselines until they beat them on accuracy, calibration, latency, memory and operator simplicity. TabICLv2's exact production/license posture must be reviewed from the repository before commercial deployment. [REF-TABDPT] [REF-TABICLV2]

JEPA belongs primarily to representation/prediction of temporal structure. It does not replace forecasting, classification, deliberation or policy.

## Judge

Tiny Jev-like models or similarly compact scorers are preferred for:

```text
memory.persistence
memory.type
memory.sensitivity
memory.scope_candidate
memory.retention_candidate
memory.activation
observation.salience
capability.route
model.route
surface.compose
document.triage
voice.state
```

**New bounded-decision candidates:** Fastino's GLiNER2.5-Decide is a 340M DeBERTa-v3-large operational classifier that accepts user-defined label sets for routing, intent, priority, policy-like classification and multi-label tags without token generation. Its published 17-domain result is Fastino's own held-out suite, so treat it as a screening signal rather than an independent universal ranking. [REF-GLINER25-DECIDE]

For Indonesian/multilingual work, benchmark the separate `gliner2.5-multi-v1` 287M mDeBERTa checkpoint as well; it exposes multilingual classification/record/relation heads but is not the same model as Decide. [REF-GLINER25-MULTI]

Neither model enforces access. They may propose a typed decision that Cedar/Aksara policy validates.

## Deliberate

Local general cognition remains a replaceable small/medium model implementation. Larger 27B-class local cognition belongs to Node+ profiling, not the P1 minimum.

**K2 Horizon small-model family** enters the local-cognition bakeoff beside Qwen/Gemma-class models. IFM currently publishes 0.9B, 3.7B and 7B dense checkpoints under Apache-2.0 with training artifacts/recipes and tool-use/reasoning support; upstream benchmark claims are treated as screening signals. The 0.9B checkpoint is particularly interesting for constrained Node/Edge experiments, while 3.7B/7B belong in Node/Node+ tests. [REF-K2-HORIZON]

**MiMo-V2.6-Distill-Qwen-9B** enters the local agentic-planner bakeoff. Xiaomi publishes it as a 9B MIT-licensed Qwen3.5-derived SFT aimed at coding, general agent tasks, visual coding and cybersecurity, with SGLang as the documented serving path. Community quantizations make 32 GB system-RAM testing plausible, but upstream does not publish a representative refurbished-x86 CPU latency result; P1 promotion therefore requires our own TTFT/tokens-per-second/RSS benchmark. [REF-MIMO26-9B]

Gateway cognition remains provider-agnostic.

## Documents

Stable capabilities:

```text
document.inspect
document.parse
document.ocr
document.extract
document.normalize.retrieval
document.chunk.plan
office.inspect
office.edit
office.render
office.verify
```

**Fast/native conversion candidate:** Firecrawl AnyDoc. [REF-ANYDOC]  
**PDF routing/reference:** Firecrawl pdf-inspector. [REF-PDF-INSPECTOR]  
**Complex-document candidate:** MinerU pipeline / hybrid/VLM. [REF-MINERU]  
**Typed-document alternative/reference:** Docling. [REF-PARSEBENCH]  
**Editable Office runtime candidate:** Univer CLI / Univer Workspace. [REF-UNIVER]  
**Retrieval-aware ingestion reference:** D-RAC. [REF-DRAC]

The document stack now separates **artifact editing** from **retrieval normalization**. Univer is attractive for Office-native work because Sheets, Docs, Slides, Base and Board can be inspected/edited/rendered inside isolated worktrees and then reviewed before merge. That maps cleanly to Aksara's candidate-artifact model. It does **not** replace AnyDoc or the institutional artifact store.

D-RAC contributes a different idea: render heterogeneous documents into a stable visual form, use one multimodal normalization pass to produce retrieval-oriented Markdown, then plan chunks over immutable block IDs instead of regenerating source text. Aksara adopts the retrieval-aware principle while keeping richer native structure when it exists. PDF is a **derived visual normal form**, never the canonical replacement for DOCX/XLSX/PPTX or original scans.

Recommended pipeline:

```text
original bytes (canonical evidence)
   ↓
format inspection
   ├─ editable Office task ─→ Univer worktree → verify/render → candidate artifact
   │
   └─ retrieval/ingestion
          ↓
      deterministic/native parse when sufficient
          │
          ├─ text-native ─────────→ AnyDoc / format parser
          │
          └─ layout-heavy/scanned/mixed
                 ↓
             DocumentParserPort
                 ├─ MinerU pipeline
                 ├─ MinerU hybrid/VLM
                 ├─ Docling
                 └─ policy-approved future parser
                 ↓
             PDF/visual derived view when needed
                 ↓
             local OCR / local VLM by default for restricted data
             Gateway multimodal normalization only when policy permits
                 ↓
             ID-addressable structured blocks / Markdown
                 ↓
             retrieval-aware chunk plan over IDs
                 ↓
             FTS/vector/graph indexes
                 ↓
             Memory Firewall / artifact links
```

Markdown, OCR text, rendered PDF, document models, embeddings, chunks and summaries are derived/rebuildable representations. Source text is not regenerated merely to make chunk boundaries. Hosted OCR/VLM is governed egress, not a parser implementation detail.

MinerU's current project now advertises native PDF/DOCX/PPTX/XLSX/image/web parsing, pipeline/VLM/hybrid modes and broad multilingual OCR. That makes it a materially stronger candidate than it was in earlier Aksara passes. Do not turn this into a universal-parser declaration: recent enterprise/document benchmarks continue to show fragmented strengths across tables, charts, visual grounding and OCR, which is exactly why Aksara freezes `DocumentParserPort` rather than one implementation. [REF-MINERU] [REF-PARSEBENCH]

Licensing also stays explicit: Univer's open repositories are Apache-2.0, while Pro SDK/native packages and runtime credentials can carry separate terms; P1 must pin the exact feature/license surface before bundling.

## Scientific / specialist model candidates

These are **Capability Pack candidates**, not base-P1 dependencies. The point of the living catalogue is to retain promising domain models without forcing every Node to install them.

| Capability family | Current candidate(s) | Why keep it visible | Status |
|---|---|---|---|
| genomics / DNA | Carbon 500M / 3B / 8B | open model family for sequence generation/variant-effect/retrieval research | WATCH / Aksara Science [REF-CARBON-DNA] |
| time-series forecasting/imputation | Granite PatchTST-FM-r2 + FoundationForecast adapters | compact zero-shot TSFM + unified multi-model substrate | EVALUATE [REF-GRANITE-TS-R2] [REF-FOUNDATIONFORECAST] |
| tabular classification/regression | TabDPT v1.3 / TabICLv2 | institutional CSV/tabular work without per-dataset training | EVALUATE [REF-TABDPT] [REF-TABICLV2] |
| robotics/world-action | FLUX 3 Action 7B | open-weight action/video policy with LeRobot adaptation path | WATCH; license/compute gate [REF-FLUX3-ACTION] |

Promotion always records validation geography/population/environment, compute tier, license, calibration/sensor requirements and whether an output is descriptive evidence, a scientific hypothesis or an actionable recommendation.

## Speech

Stable model-facing capabilities:

```text
speech.transcribe
speech.synthesize
speaker.evidence
```

The privacy/audience contract is defined in §18 through `speech.render` and `EgressPolicy`.

**ASR:** Qwen3-ASR-0.6B/1.7B remain the Indonesian/Malay P1 baseline bakeoff; Whisper-class models remain references/adaptation candidates. `MOSS-Transcribe-Diarize` joins as a combined ASR+diarization challenger that may reduce runtime/model count if it passes the local language/room corpus. [REF-QWEN3-ASR] [REF-MOSS-TRANSCRIBE]

**Diarization:** NVIDIA Nemotron 3 Diarization remains a Node+/GPU or Gateway candidate: 100M, streaming/offline, up to eight anonymous speaker channels. Speaker labels remain evidence only, never authentication. [REF-NEMOTRON-DIAR]

**TTS tiers:** sherpa-onnx + Indonesian Piper/VITS remains the CPU/offline floor; VoxCPM2 is an active Node+/GPU expressive Indonesian/Malay candidate; the radar continuously searches for smaller open expressive ID/MS models rather than treating VoxCPM2 as the permanent answer. [REF-SHERPA-TTS-ID] [REF-VOXCPM2]

**Cloud TTS:** Gemini 3.8 Flash TTS / Flash-Lite behind the Gateway when EgressPolicy permits. Voice design/replication remains a governed identity-like artifact with explicit consent/mandate, provenance, disclosure and revocation. [REF-GEMINI38-TTS]

Promotion requires the Voice Acceptance Corpus in §18, not generic benchmark reputation.

## Scientific/field packs

Optional, not base image:

- Earth observation,
- weather/hydrology,
- bioacoustics,
- time-series,
- genomics/eDNA,
- materials,
- language preservation,
- visual event understanding.

---

# 22. Simulator-first implementation

**Status: FREEZE**

The simulator is a deployment, not a mock.

Simulate:

- Node A / B,
- Card A / B,
- onboarding/NFC,
- identity resolution,
- voice/listening,
- Memory Firewall,
- Graphiti projection,
- Continuity Tree,
- Trigger Index,
- Irama signals,
- approvals,
- speculative preview,
- Capability Lease,
- offline queue,
- synchronization,
- Card privacy handoff,
- KVM lease state,
- domain scenarios.

## Cloudflare topology

```text
React/Vite frontend
      │
      ├─ Rust/WASM kernel pieces where practical
      ├─ local IndexedDB NodeStore for true browser-offline behavior
      └─ Cloudflare Worker / Durable Object peer
```

Cloudflare Durable Objects/Workflows are adapters, not the domain architecture. [REF-CF-DO] [REF-CF-WORKFLOWS]

Phone UX:

```text
ROOM ↔ CARD ↔ TRACE
```

Desktop:

```text
ROOM / SURFACES       TRACE / ENGINE
```

Trace examples:

```text
presence.detected
identity.evidence
session.opened
memory.candidate
memory.persisted
memory.trigger.generated
irama.signal
memory.trigger.matched
decision.score.memory_activation
objective.created
capability.lease.requested
approval.received
capability.executed
ledger.appended
```

---

# 23. Observability and evaluation

## OpenTelemetry

**Status: ADOPT**  
**Source pin:** [REF-OTEL-GENAI]

Use standard traces where mature enough. Aksara-specific semantic events remain separate.

## Langfuse

**Status: EVALUATE / likely ADOPT in development**  
**Source pin:** [REF-LANGFUSE]

Hard distinction:

```text
Ledger = what the institution says happened
Trace  = how software produced it
```

Trace retention may be short. The ledger is governed institutional history.

## 23.1 Product and deployment metrics

P1 evaluation must not collapse all value into chat volume or closed tickets. Track at least five families:

| Gate | Measures | Failure signal |
|---|---|---|
| **Knowledge utility** | time to find a correct source; citation correctness; repeated questions avoided; continuity after staff change; useful recall accepted vs dismissed | users still search chats/files manually or cannot tell which source is current |
| **Operational utility** | correctly progressed/closed WorkObjects; staff minutes saved/added; overdue/lost work; destination acceptance rate | conversation rises while work completion does not improve |
| **Trust / agency** | unauthorized retrieval/publication rate; correction latency; proposals with source/authority/receipt; opt-out/export exercised | users cannot tell who decided, who saw data, or whether an action actually happened |
| **Robustness** | offline completion/reconciliation; crash/duplicate/restore tests; p50/p95 wall latency; device swap/repair time | weak network or reboot loses state, repeats effects or makes the system unusable |
| **Economics** | fully loaded monthly cost/site; inference/voice/storage; support/moderation time; cost per useful answer and per correctly closed WorkObject | value depends on uncapped public inference or uncompensated founder support |

Every optional memory/runtime/model mechanism under bakeoff should report its **incremental** effect on these measures against the simpler baseline.

## 23.2 Economics planning model

Until real pilot telemetry exists, economics remain a planning model rather than a price claim:

```text
monthly cost/site = hardware amortization + power + connectivity
                  + backup/storage + support/travel + moderation
                  + inference/voice/OCR + integration maintenance

cost/closed work object = allocated operating cost / correctly closed objects

knowledge-service cost = allocated operating cost / useful verified answers or recalls
```

Track both operational and knowledge value. A site that prevents repeated document searches or preserves continuity may be useful even when it does not close many formal WorkObjects. Conversely, high conversation volume is not success if staff review time, support travel or inference spend exceeds the value created. Public ETNOS inference receives a separate sponsored/tenant quota rather than being subsidized implicitly by institutional deployments.

---

# 24. P1 physical product decisions

Hardware is a **deployment SKU**, not the definition of Aksara. A dedicated Node is justified when local custody, intermittent connectivity, shared access, local inference, local archive/service availability or a local trust anchor materially improve the site. Software-only deployments remain first-class. Physical presence is supplied by one or more **Physical Interaction Endpoints**, which may be integrated into the Node enclosure or deployed separately.

P1 therefore separates three physical roles:

- **Node:** institution-bound compute, custody, connectivity, local inference and hardware-control appliance where dedicated local infrastructure is useful.
- **Physical Interaction Endpoint:** shared/place-bound device through which Aksara can display, listen, speak, signal and optionally sense; optimized variants include Presence and Information surfaces.
- **Card:** portable, principal-bound physical endpoint for identity, voice, approval, capture, haptics and private handoff; useful even when Aksara runs on existing infrastructure.

This is an architectural separation, not a requirement for visually separate products. A **Node Complete** SKU may place Node compute, one or more Physical Interaction Endpoints and shared audio/vision/control hardware inside one coherent enclosure while preserving the same internal contracts.

## 24.1 Aksara Node P1

Base Node target:

- refurbished x86-64 Tiny/Mini/Micro PC or qualified equivalent compute module;
- 32 GB RAM baseline; 64 GB Node+ supported;
- ≥512 GB NVMe;
- Debian 13 / qualified image-based appliance profile;
- independent ESP32-S3-class **Node Controller**;
- NFC/session handoff where useful;
- modular audio/vision and surface I/O rather than assuming one mandatory front display;
- serviceable metal enclosure or re-housed commodity chassis;
- external certified mains adapter;
- optional short UPS/graceful-shutdown profile for power-cut tolerance.

The Node Controller is not a second agent runtime. It owns fast/reliable physical functions that should remain responsive while Linux, model services or WAN are unavailable:

```text
PhysicalEndpoint discovery/control
hardware mic/privacy state
buttons / optional encoder
Card/NFC handshake
power + shutdown + watchdog
UPS/battery state where present
thermal/enclosure telemetry
boot/recovery/error state
earcons / bounded immediate acknowledgments where practical
```

This boundary keeps the physical system alive through model/provider/service restarts and lets commodity compute, interaction surfaces and enclosure design evolve independently.

The Node is **not required to contain a display**. It may run headless, drive nearby wired surfaces, serve network-attached surfaces, or be packaged with one or more surfaces as an integrated appliance. The reference P1 integrated SKU may combine an Information Surface, a Presence Surface and a shared interaction stack; this is a composition of the same primitives rather than a separate architecture.

Separately approved experiments, **not required in the ordinary P1 image**:

- fingerprint/navigation sensor;
- UVC capture + RP2040/Pico-class KVM HID;
- mmWave/proximity sensing;
- alternate e-paper/RLCD/front-panel technologies;
- long-distance PoE or low-bandwidth wireless Physical Endpoint transport.

Fingerprint must demonstrate a usability/accessibility benefit over Card/PIN/existing SSO before promotion and never becomes sole authority or recovery material. KVM is a privileged path into unrelated computers and remains isolated/lab-only until threat review and a concrete integration need justify deployment.

## 24.2 Aksara Card P1 direction

The Card is upgraded from an NFC/onboarding surrogate to a **portable principal-bound Aksara surface**. It does not need to run the resident LLM locally. Its job is to provide low-latency physical interaction, authenticated device identity, bounded sensing/capture and an offline queue while a nearby Node or authorized Gateway performs heavier intelligence.

Target Card capability set:

```text
mic / near-field voice input
speaker / streamed voice output
small non-touch display
haptic feedback
main action / talk button
physical privacy control
optional explicit still-image camera
Wi-Fi + BLE
NFC
local storage / offline queue
cryptographic device identity
battery + USB-C charging
```

Preferred execution path:

```text
nearby Node available
  → local low-latency Aksara session

Node unavailable + policy allows
  → governed Gateway session

offline
  → deterministic local controls + capture/queue + later sync
```

### Card donor stack

| Candidate | Role | Current posture |
|---|---|---|
| **Xiaozhi ESP32** | wake/VAD/AEC/audio streaming, realtime voice/device protocol, display/camera/device patterns | **PRIMARY FIRMWARE/CODE DONOR** [REF-XIAOZHI] |
| **XIAO ESP32-S3 Sense** | cheap immediate prototype core with camera/mic/PSRAM/Wi-Fi/BLE/storage path | **P0/P1 PROTOTYPE BOARD** [REF-XIAO-SENSE] |
| **Omi open hardware** | wearable PCB/RF/battery/charging/mechanical/production-test lessons | **HARDWARE/INDUSTRIALIZATION DONOR** [REF-OMI-HW] |
| **reSpeaker Clip** | low-power dual-mic recording, local storage, Opus, Zephyr/DFU/power-management patterns | **AUDIO/STORAGE/POWER DONOR** [REF-RESPEAKER-CLIP] |
| **FoloToy AI Passport** | badge proportions, visible UI/NFC interaction and fast prototype reference | **UI/INTERACTION REFERENCE; no longer primary architecture** [REF-FOLOTOY-PASSPORT] |

Prototype 0 may therefore be built from **XIAO ESP32-S3 Sense + small display + amp/speaker + LiPo + haptic + NFC + physical privacy controls + Xiaozhi-derived firmware** before committing to a custom PCB. A production board should move from dev modules to a compact ESP32-S3-class module/SoC only after interaction/battery/RF tests justify it.

### Card privacy contract

The Card must make sensing physically legible:

- microphone privacy control should cut or gate the sensor path at hardware level, not merely set a software flag;
- camera use, if retained, is explicit still capture by default, with a physical shutter and/or hardware power gate;
- the active-sensor indicator should be electrically difficult/impossible for ordinary application software to suppress while that sensor rail is enabled;
- passive always-on camera/lifelogging is not a P1 requirement;
- recording/capture always carries current `GatheringSession`/purpose/retention context where applicable.

The camera's initial value proposition is narrow: explicit capture of a document, whiteboard, label, page, form or field observation into the existing document/VLM pipeline.

### Card memory and loss model

The Card is not the sole canonical store of a person's memory. It may cache an encrypted **memory/session capsule** containing device identity, recent tasks, active sessions, offline queue, selected context and safe preferences. Canonical approved memory remains in the appropriate TrustDomain/storage placement. A lost Card is revoked and replaced; approved context can be rehydrated after re-authentication.

### Card cost target

**Engineering target:** custom electronics BOM at modest volume **≤ Rp500,000 per Card** if achievable without compromising privacy, RF/audio quality or serviceability. This is a cost target, not a promised retail price. Early module-based prototypes and low-volume manufactured units may be materially higher because enclosure, assembly, certification, QA, rejects, freight and support are outside raw electronics BOM.

## 24.3 Current Node/Node+ hardware candidates

- **JetKVM Mini:** WATCH / hardware bakeoff once generally available. The announced ESP32-P4X Ethernet unit is a low-cost 1080p KVM reference that may cover a useful portion of the optional Workstation Bridge hardware without a custom board. Do not make P1 depend on unreleased hardware; compare it with PiKVM after availability. [REF-JETKVM-MINI]
- **AMD local-AI / Lemonade profile:** Node+ research lane for large unified-memory APUs and AMD-friendly local serving. Lemonade is moving quickly and can simplify local server/runtime integration, but its release velocity means Aksara should pin/test known-good versions rather than auto-update production Nodes. [REF-LEMONADE]

## 24.4 Procurement and field service

v0.5.1's **procurement acceptance checklist** remains mandatory for each actual refurb unit:

```text
TPM 2.0 present and usable
UEFI Secure Boot usable with our key/update plan
firmware admin password / boot-order control tested
AC-loss recovery setting tested
NVMe SMART/health readable
sustained CPU/model thermal soak
Ethernet/Wi-Fi/USB/audio/display/KVM ports tested
RTC/time recovery behavior
actual idle/load power measured
serial/asset identity recorded
```

Do not infer these properties from a family name such as “Tiny/Mini/Micro.” Refurb batches can differ in TPM generation, firmware and storage.

Field-service profile:

```text
FRU: mini-PC
FRU: NVMe
FRU: external PSU
FRU: matrix/controller/front
FRU: USB audio
FRU: optional KVM microcontroller
FRU: Card (replace/re-enroll, not repair in field)

aksara doctor
  → hardware/SMART/thermal
  → TPM/Secure Boot/attestation status
  → service readiness
  → backup freshness/last restore-test
  → Card/Node-controller health
  → redacted offline support bundle
```

Power/resilience tests include abrupt mains loss, repeated reboot, degraded storage and optional small UPS/graceful-shutdown profiles where site conditions justify them. The P1 goal is **power-cut tolerance**, not carrying the Node between rooms; the Card/phone provides human mobility. Environmental claims follow selected OEM/enclosure test evidence; P1 does not invent an IP rating because the brochure would look heroic.

---

# 24A. Appliance platform and fleet-management bakeoff

The current P1 base remains **Debian + systemd-native security/update primitives** because it keeps the first Node understandable and serviceable. This is a baseline, not a claim that a custom appliance stack will remain cheaper forever.

| Profile | Why evaluate | Current posture |
|---|---|---|
| Debian + signed UKI/LUKS2/systemd-sysupdate | minimum custom surface; matches current P1 | **ADOPT baseline** |
| LF Edge EVE | TPM/vault/attestation, A/B images, workload isolation, fleet controller patterns | **EVALUATE when fleet/tenant isolation burden becomes material** [REF-LF-EVE] |
| balenaOS | mature device fleet/update experience and increasingly resilient queued updates | **EVALUATE operations reference** [REF-BALENA] |
| Mender/RAUC-class updater | narrower OTA/rollback alternative | **RESEARCH/benchmark** |

The deciding fixture is operational rather than aesthetic: provisioning, TPM enrollment, peripheral access, offline boot, rollback, backup restore, field diagnostics, update after long disconnection, and recovery by a local steward.

The Node enclosure/matrix/audio/radio should outlive one compute board where practical. Product references such as Lapis One/Pamir validate demand for coherent agent-computer hardware and KVM/peripheral integration, but they do not establish Aksara's environmental, repair or local-inference targets. [REF-LAPIS-PAMIR]

## 24.3 Physical Interaction Endpoints and surface family

**Status: FREEZE semantics; PROTOTYPE reference hardware.**

A Physical Interaction Endpoint is a place-bound Aksara endpoint that may combine output and input capabilities. A display is therefore not merely signage: depending on the SKU it may also provide microphone input, speaker output, buttons/touch/NFC, physically legible privacy state and optional explicitly controlled vision.

```text
PhysicalInteractionEndpoint
  endpoint_id
  binding: Node | existing_server | Gateway
  audience: public | shared_place | principal
  output: display? | lighting? | speaker? | haptic?
  input: microphone? | camera? | touch? | buttons? | NFC?
  privacy: mic_state | camera_state | capture_indicator | audience_state
  capabilities: resolution | colour | refresh | audio | vision | sensing
  transport: USB | Ethernet/PoE | Wi-Fi | other bounded transport
  local_fallback: renderer | privacy | offline/error | stop/mute
```

`PhysicalInteractionEndpoint` is distinct from the broader product notion of a surface/channel. **ETNOS, web, phone and messaging are digital interaction surfaces/channels, not Physical Interaction Endpoints.** This keeps the hardware contract from leaking device assumptions into ETNOS or other software surfaces.

### 24.3.1 Reference Presence Surface

The current **64×64 HUB75 RGB matrix** is reclassified from an intrinsic Node front into the reference **Presence Surface**. It is optimized for ambient state, motion, attention, turn-taking, privacy cues and room-scale legibility. It may include:

- 64×64 HUB75 or a cheaper diffused addressable-RGB field/strip where resolution is unnecessary;
- far-field microphone path;
- speaker/earcon output;
- physical mute/stop;
- explicit capture/privacy indicator;
- optional camera with a physically legible shutter or disconnect;
- NFC/buttons where the placement benefits from them;
- local MCU renderer so immediate presence/privacy/error state does not depend on the resident model.

The existing MatrixUI/Presence Grammar remains valid. Dense/private information still does not belong on the RGB surface.

### 24.3.2 Reference Information Surface

A **7.5-inch class monochrome e-paper display, approximately 800×480**, becomes the reference P1 **Information Surface** prototype. It is optimized for persistent communal/public information, low-power static state, QR/private handoff, schedules, notices, public metrics and approved summaries. It may also include microphone, speaker, physical mute, small RGB/status indicator, NFC and an optional physically controlled camera.

E-paper is not used for high-frequency listening/processing/speaking animation. Immediate interaction state should render through a small LED/RGB indicator, audio earcon or companion Presence Surface while the e-paper renderer handles slower semantic state.

Because e-paper retains a frame without power, the security rule is stronger than for an ordinary transient screen:

> **Only an audience-authorized, fully composed frame may be committed to a persistent e-paper surface. Sensitive material must not be rendered first and redacted afterward.**

For public-facing deployments, the Information Surface consumes a **public projection** or equivalently policy-bounded data view rather than retrieving over the entire institutional memory and asking the model to hide sensitive fields after retrieval. Public voice turns use a public conversation lane. Requests requiring personal or restricted information hand off to an authenticated phone/web/Card/private endpoint.

### 24.3.3 Interaction and capture semantics

Presence Surface, Information Surface, integrated Node microphones and Cards may all act as physical interaction sources. Existing `GatheringSession`, `AccessContext`, audience and Capability Lease semantics still apply. A room with several microphones does **not** automatically stream all of them: one primary `capture.audio` source is elected by default and may be transferred explicitly. Camera/vision follows the same principle and is never silently activated by proximity.

### 24.3.4 Integrated and distributed compositions

Reference compositions:

```text
Node Core
  → headless compute/custody appliance

Node + Presence
  → Node Core + interactive RGB Presence Surface

Node + Information
  → Node Core + interactive e-paper Information Surface

Node Complete
  → Node Core + Information Surface + Presence Surface
     + one shared interaction stack where physically co-located

Existing compute + Physical Endpoint(s)
  → Aksara runtime on existing infrastructure + Abstraksi surfaces
```

When co-located in one enclosure, mic/speaker/camera/power/control should be shared where practical rather than duplicated per display. When distributed through a room/site, each endpoint advertises its capabilities and audience/location to the Node. USB is the simplest P1 local transport; Ethernet/PoE is a strong later option for longer-distance institutional surfaces. Raw HUB75/SPI/I²C should remain internal to the endpoint enclosure rather than becoming the external product interface.

### 24.3.5 Commercial posture

Physical endpoints are optional deployment components, not mandatory per-user hardware and not the center of Abstraksi's moat. A small office may need one Presence Surface; a school or clinic may use one Node with several Information Surfaces; a digitally mature institution may use existing compute with only Aksara Physical Endpoints; Cards remain targeted to principals for whom portable identity/capture/approval/private handoff creates measurable value.

The commercial object is the **supported deployment**, not novelty in the compute box. Refurbished or off-the-shelf internals are first-class. When Abstraksi sells hardware directly, the visible unit should still follow one coherent Abstraksi/Aksara industrial identity through custom/white-label enclosure, labeling, interaction and service design. The enclosure may be ours even when the motherboard is not. Industrial design remains TBD; it must not force premature custom electronics.

---

# 25. Initial vertical profiles and scenarios

The verticals below exercise different parts of the same Aksara substrate. They are **not independent product forks** and they are not a claim that every vertical ships in P1. The purpose of the vertical set is to discover which shared contracts survive real operating environments.

## 25.1 Balai / community knowledge and governance

```text
question / story / observation / discussion
  → audience + consent + source/original language
  → protected archive or ephemeral lane
  → retrieval / synthesis with disagreement preserved
  → optional issue / proposal / bounded mandate
  → reviewed publication or SharingGrant
```

Primary proof: community custodians can inspect, correct, restrict, export and withdraw material without asking Abstraksi to become the permanent administrator. Mukurtu/Local Contexts/CoMapeo/Guardian Connector are integration/governance references rather than features Aksara should clone.

## 25.2 Education / learning centre

```text
question / resource issue / learning objective
  → local approved content + school context
  → explanation / plan / practice / WorkObject
  → teacher review where needed
  → existing LMS/admin handoff
```

Aksara can be useful for learning and teacher/institution continuity without becoming an LMS. Kolibri/MoodleBox-class systems carry offline course/content delivery; official education systems remain authoritative for regulated records.

## 25.3 Cooperative / local organisation

```text
stock / order / delivery / correspondence / handover
  → authoritative ERP/ledger + local documents
  → explanation / discrepancy / next action
  → proposal
  → human approval
  → ERPNext or existing-system commit
  → receipt + follow-up
```

This vertical is commercially useful because benefits can be expressed in time, missed deliveries, stock discrepancies and staff continuity. Accounting truth remains in the accounting/ERP system.

## 25.4 Government / institutional office

```text
question / incoming letter / citizen or internal request
  → source + prior context
  → answer or WorkObject
  → requirements/evidence
  → approval
  → API/import/browser/manual submission
  → destination receipt + follow-up
```

Aksara also serves institutional recall and continuity when no case needs to be opened. Government integrations remain named adapters to actual systems rather than a fictional universal government API. The Workstation Bridge covers authorized browser/legacy paths where structured integration is incomplete.

Community deployments and government deployments share protocols only at explicit boundaries. A government payer/host does not inherit access to a community TrustDomain.

## 25.5 Clinic / Puskesmas

Institutional knowledge, administrative continuity, workflow/records/inventory support and hand-off, **not autonomous diagnosis**. Existing clinical/public-health systems remain authoritative where deployed. Patient-level access and any clinical suggestion require a dedicated assurance profile beyond ordinary P1.

## 25.6 Conservation / field monitoring

```text
field observation / map / sensor event
  → existing field platform or Observation Contract
  → provenance + quality / calibration state
  → local interpretation / comparison with history
  → reviewed response / report / research artifact
  → governed sharing or destination adapter
```

This profile should integrate CoMapeo, Guardian Connector, ODK and SMART/EarthRanger where appropriate. Aksara adds intelligence and continuity around those systems rather than replacing their collection/patrol/mapping layers.

## 25.7 Research station / science

```text
question → literature/context → protocol / observation
  → reproducible environment / instrument plan
  → data + provenance
  → analysis / model result
  → human/domain review
  → reviewed artifact / publication / sharing
```

This is where JEPA-style representation, Bend experimental computation, PydanticAI research workflows, OpenHands/software workers, Bluesky/Ophyd instrument integration and anticipatory memory can be exercised together. A generated hypothesis remains a proposal; an instrument observation remains linked to method/calibration; the domain reviewer owns the conclusion.

## 25.8 Cross-vertical proof

A particularly useful P1 test is not six isolated demos but one bounded exchange across two independently governed verticals, for example:

```text
community/field team records approved watershed observations
  → local analysis
  → custodian approves an aggregate artifact
  → ETNOS/A2A request from school/lab/local office
  → SharingGrant
  → receiving Aksara uses the artifact without receiving the source archive
```

This simultaneously tests custody, evidence, federation, compute admission and institutional usefulness.

# 26. Primary + alternative register

| Concern | Primary | Alternative | Status |
|---|---|---|---|
| Trusted kernel | Rust/Tokio | TypeScript kernel | FREEZE |
| Resident cognition | Vellum | **Strands Harness** / Microsoft Agent Framework / Aksara Minimal Loop | ADOPT current; measured bakeoff |
| Specialist workflows | PydanticAI | plain Python/MAF | ADOPT pack-level |
| Programmatic tool runtime | **Monty** | QuickJS/WASM / provider code mode | PROTOTYPE P1 |
| Authoritative state | SQLite + files/ledger | PostgreSQL hosted | FREEZE |
| Temporal graph | Graphiti | Cognee/custom | ADOPT projection |
| Continuity memory | OptMem/TiMem-inspired | HORMA/MemOS patterns | PROTOTYPE |
| Associative recall | T-Mem-inspired Trigger Index | AssoMem/hybrid retrieval | PROTOTYPE |
| Memory activation | Jev-like scorer + heuristics | small Qwen/Gemma/classifier | EVALUATE |
| Memory control plane | **Aksara cascade, Jev-Mem-inspired** | LLM-only / MAGMA-style controller | PROTOTYPE |
| Policy | Cedar | OPA/OpenFGA/SpiceDB | PROTOTYPE |
| Capability lease | Biscuit | custom signed lease | PROTOTYPE |
| Durable local workflow | Duroxide | Restate/DBOS | PROTOTYPE |
| Narrow sandbox | Wasmtime/WASI | native sidecar | ADOPT progressive |
| Heavy workspace | **sandboxed local worker** | agentOS/Eve/remote | PROTOTYPE P1 |
| Cluster work-agent runtime | **AX + Agent Substrate** | remote sandbox / custom | EVALUATE Node+ |
| Pure AI-generated kernel | Bend 2 | Rust/WASM/Python | RESEARCH |
| Northbound gateway | agentgateway | Bifrost | PROTOTYPE |
| Smart model routing | `decision.score(model.route)` | OrcaRouter | EVALUATE |
| Adaptive reasoning effort | `decision.score(reasoning.effort)` | Astra-Ares pattern | EVALUATE |
| Voice | LiveKit Agents | Pipecat/local modular | ADOPT where allowed |
| Speaker diarization | Nemotron 3 Diarization | pyannote/Sortformer/lighter local | EVALUATE Node+/Gateway |
| ASR | **Qwen3-ASR 0.6B/1.7B** | Whisper-class / provider ASR | EVALUATE P1 |
| Local TTS floor | **sherpa-onnx + Indonesian Piper/VITS** | future local Indonesian models | EVALUATE P1 |
| Cloud TTS | Gemini 3.8 Flash / Flash-Lite TTS | other approved provider | EVALUATE Gateway |
| Rich generated UI | A2UI + Aksara View Primitives | custom/MCP Apps | ADOPT |
| Interactive semantic diagrams | Intent-style typed diagram model | Mermaid/static SVG | PROTOTYPE |
| Agent/frontend transport | AG-UI | WebSocket/SSE | EVALUATE |
| 64×64 UI | MatrixUI + embedded-graphics | LVGL | PROTOTYPE |
| Device description | W3C WoT TD | custom manifest | PROTOTYPE |
| Data plane | Zenoh | MQTT/NATS | PROTOTYPE |
| Hardware runtime refs | Bubbaloop/AetherEdge | native adapters | EVALUATE |
| Pack artifact | OCI/ORAS | distro package | PROTOTYPE |
| Signing | Sigstore/cosign | deployment PKI | PROTOTYPE |
| Vector search | sqlite-vec | LanceDB | EVALUATE |
| Fleet-memory backend | Aksara local stack | Caura derived backend | PROTOTYPE Node+/hosted |
| Office artifact runtime | **Univer CLI / Workspace** | LibreOffice headless / format libraries | EVALUATE → PROTOTYPE |
| Document conversion | AnyDoc for fast/native path | MinerU / Docling via `DocumentParserPort` | PROTOTYPE bakeoff |
| Retrieval-aware document normalization | **D-RAC-inspired ID/block pipeline** | recursive/fixed chunking | EVALUATE |
| PDF inspection/OCR routing | pdf-inspector + local OCR | hosted Parse/VLM by policy | EVALUATE |
| Capability adapter generation | **CLI-Anything methodology** | handwritten adapters / MCP wrappers | EVALUATE dev-time |
| External capability discovery | MCP Registry + Alexandria adapter | custom catalogues | EVALUATE |
| Metered external tool broker | Treg adapter | direct provider integrations | EVALUATE optional |
| Telemetry | OpenTelemetry | native logs | ADOPT |
| Eval UI | Langfuse | Phoenix/etc. | EVALUATE |
| Cloud simulator | Cloudflare Workers/DO + local replica | VPS | ADOPT |
| Node disk/key protection | **Secure Boot + signed UKI + TPM2/LUKS2 policy** | deployment-specific HSM/FIDO path | PROTOTYPE P1 |
| Remote attestation | Keylime-pattern verifier | custom TPM quote verifier | EVALUATE; push mode research |
| Appliance update | **systemd-sysupdate/repart + Verity/UKI pattern** | OSTree/other image updater | EVALUATE P1 |
| Backup client | **Kopia S3 prototype** | restic / rustic research | EVALUATE P1 |
| Immutable backup target | Biznet S3 Object Lock where residency fits | R2 Bucket Lock / B2 Object Lock | EVALUATE policy-driven |
| Gateway spend control | Aksara `ComputeBudget`/`UsageLedger` | Cloudflare AI Gateway adapter | FREEZE semantics; EVALUATE adapter |
| Bounded decision model | GLiNER2.5-Decide / multilingual sibling | Jev/OpenJev/SemIf-class | EVALUATE |
| Local agentic planner | MiMo-V2.6-Distill-Qwen-9B | Qwen/Gemma-class | EVALUATE |
| Field/offline intake | ODK Central adapter | custom forms | HIGH-PRIORITY SPIKE |
| Cross-system interoperability | OpenFn regional/hosted adapter | custom adapters | HIGH-PRIORITY SPIKE |
| Case/SLA semantics | native Aksara WorkObject inspired by Open311/Frappe | Frappe Helpdesk adapter | FREEZE semantics; EVALUATE adapter |
| Omnichannel intake | native channels / Chatwoot adapter | RapidPro | EVALUATE |
| Institutional multiplayer/channel shell | Aksara contracts + thin adapters | **Supermemory Company Brain code donor** | HIGH-PRIORITY BAKEOFF / CODE DONOR |
| Deployment email channel | existing institutional mail where available | **Cloudflare Email Service/Workers adapter** | EVALUATE hosted/managed-domain profile |
| Card device runtime | **Xiaozhi-derived Aksara firmware** | custom-from-scratch ESP-IDF/Zephyr runtime | PROTOTYPE / CODE DONOR |
| Card prototype hardware | **XIAO ESP32-S3 Sense + modular peripherals** | FoloToy / other finished badges | PROTOTYPE P0/P1 |
| Card production hardware | custom ESP32-S3-class board informed by **Omi + reSpeaker Clip** | finished third-party wearable | RESEARCH → prototype after P0 evidence |
| Relationship authorization | local relation store + Cedar | OpenFGA / SpiceDB | EVALUATE on scale need |
| Local-first state/sync substrate | SQLite/files + explicit Aksara sync contracts | **any / any-sync / anyrt** | BAKEOFF; keep SQLite baseline |
| Local heavy-worker isolation | bounded local worker | **smolvm** | BAKEOFF |
| Generic SaaS connector substrate | handwritten adapters where needed | **OpenConnector** | HIGH-PRIORITY SPIKE |
| Unified MCP/A2A/API registry/gateway | AgentGateway/Bifrost + local Capability Registry | **mcp-gateway-registry + AGNTCY/OASF** | SERIOUS BAKEOFF |
| Native accessibility computer use | browser layer then KVM | **agent-desktop** | CODE DONOR / BAKEOFF; macOS-first |
| Combined ASR + diarization | Qwen3-ASR + Nemotron | **MOSS-Transcribe-Diarize** | BAKEOFF |
| Node+ expressive local TTS | none frozen | **VoxCPM2 + future compact ID/MS expressive models** | EVALUATE |
| Small local cognition | Qwen/Gemma-class | **K2 Horizon 0.9B/3.7B/7B** | BAKEOFF |
| Tabular FM | classical GBDT baseline | **TabDPT / TabICLv2** | EVALUATE |
| Time-series FM adapter | direct TimesFM/TTM integrations | **FoundationForecast** | SPIKE / CODE DONOR |
| Medium-bandwidth field mesh | ordinary IP + LoRa degraded mode | **OpenMANET / Wi-Fi HaLow** | WATCH → field prototype |
| Generated chart grammar | renderer-specific chart code | **Microsoft Flint** | SPIKE / CODE DONOR |
| Local/private GIS workspace | custom map/science surfaces | **GeoLibre** | SPIKE / ADAPTER |

---

# 26A. Consolidation Decision Register

This table is the current implementation-level ground truth for major consolidation candidates. It **adds to** the component register rather than deleting historical rationale. A candidate can absorb generic machinery only while Aksara keeps the stable semantics named in the final column.

| Responsibility chunk | Candidate(s) | Current action | Aksara retains |
|---|---|---|---|
| resident assistant/product shell | **Vellum Assistant** | **default hypothesis; continue adapter** | actor/access context, memory authority, effects, ledger, TrustDomains [REF-VELLUM] |
| institutional multiplayer/channel shell | **Supermemory Company Brain** | **HIGH-PRIORITY CODE DONOR / BAKEOFF** | InstitutionActor, IdentityBinding, ConversationLane, AccessContext, Memory Firewall, Work/Effect semantics [REF-COMPANY-BRAIN] |
| principal-bound Card runtime | **Xiaozhi ESP32 + XIAO ESP32-S3 Sense prototype** | **PROTOTYPE; fork device runtime, not backend semantics** | device identity, privacy, session/capture leases, Node/Gateway routing [REF-XIAOZHI] [REF-XIAO-SENSE] |
| wearable industrialization | **Omi + reSpeaker Clip** | **CODE DONORS** | Aksara Card product/identity/privacy semantics [REF-OMI-HW] [REF-RESPEAKER-CLIP] |
| deployment email | **existing institution mail / Cloudflare mail adapter** | **SPIKE** | canonical institutional identity, identity resolution, Memory Firewall, egress/effects [REF-CF-EMAIL] |
| SDK-first resident loop | **Strands Harness SDK** | same-fixture challenger | institutional state/authority; verify TS feature parity [REF-STRANDS] |
| durable continuing-agent submissions/session reconnect | **Flue** | **promote to serious bakeoff candidate** | WorkObject/workflow truth, external-effect reconciliation, TrustDomains [REF-FLUE] |
| minimal resident loop | Aksara TS loop / yoagent / Rig references | benchmark/specification/escape hatch | all Aksara semantics; do not default to bespoke unless it wins total ownership cost [REF-YOAGENT] [REF-RIG] |
| software/research worker | **OpenHands Software Agent SDK + Agent Server** | **EVALUATE as WorkAgentRuntime implementation** | vault boundary, credentials, artifact import/export, effect gate [REF-OPENHANDS] |
| deterministic browser control | **Playwright / Playwright MCP** | **ADOPT baseline interface candidate** | browser session authority, credentials, EffectClaims [REF-PLAYWRIGHT-MCP] |
| AI-assisted browser control | **Stagehand v4** | **high-priority spike** | planner/harness, policy, approval and session ownership [REF-STAGEHAND] |
| autonomous unknown-site browser | browser-use / Skyvern | benchmark bounded tasks; not default substrate | approval/effect/cost policy [REF-BROWSER-USE] [REF-SKYVERN] |
| hosted/self-hosted browser pool | Steel / Browserbase | optional regional/hosted profile | session/credential policy; no requirement on offline Node [REF-STEEL] [REF-BROWSERBASE] |
| native/KVM computer control | PiKVM | active Workstation Bridge experiment | principal/purpose/TTL, allowed controls, reconciliation [REF-PIKVM] |
| field/Indigenous data connective layer | Guardian Connector | integrate/partner before rebuilding | Aksara memory/agent/action/ETNOS semantics [REF-GUARDIAN-CONNECTOR] |
| territorial mapping/field capture | CoMapeo | integrate formats/workflows | cross-source intelligence, custody exchange, institutional continuity [REF-COMAPEO] |
| cultural archive/access protocol | Mukurtu + Local Contexts | integrate/reference; investigate Local Contexts Integration Partner path | local community process, TrustDomain, memory/action semantics [REF-MUKURTU] [REF-LOCALCONTEXTS] |
| offline education content | Kolibri / MoodleBox | integrate/reference per site | Aksara learning assistant + institution memory [REF-KOLIBRI] [REF-MOODLEBOX] |
| cooperative operations | ERPNext/Frappe | **high-priority vertical spike** | Aksara explanation/memory/work/effect semantics [REF-ERPNEXT] |
| conservation operations | SMART/EarthRanger/SERCA | integrate/API/partner | community custody + intelligence across approved data [REF-EARTHRANGER] |
| room devices/local voice | Home Assistant + ESPHome + Wyoming | evaluate coherent subsystem | Aksara identity/audience/voice policy [REF-HOMEASSISTANT-WYOMING] [REF-ESPHOME] |
| field sensor gateway | Fledge + SensorThings vocabulary | evaluate field profile | observation quality/authority/retention semantics [REF-FLEDGE] [REF-SENSORTHINGS] |
| research instruments | Bluesky/Ophyd + labgrid/OpenFlexure | pack-level integration | research agreement, review, cross-institution memory [REF-BLUESKY] [REF-OPHYD] |
| edge OS/fleet | Debian/systemd baseline; LF Edge EVE/balenaOS bakeoff | keep Debian now; benchmark when fleet cost appears | institutional kernel/state and recovery contract [REF-LF-EVE] [REF-BALENA] |
| local state + sync + indexes + job runtime | SQLite/files + separate sync/projections/workers vs **any/any-sync/anyrt** | torture-test as a potentially large consolidation | TrustDomain, Memory Firewall, WorkObject, Ledger, export/recovery [REF-ANY] [REF-ANY-SYNC] |
| generic SaaS connections | handwritten first-party connectors vs **OpenConnector** | spike one OAuth read/write provider before writing more connectors | capability policy, leases, destination receipts [REF-OPENCONNECTOR] |
| gateway + MCP/A2A/asset registry | AgentGateway/Bifrost/local registry vs **mcp-gateway-registry + AGNTCY/OASF** | serious consolidation fixture | Aksara institutional identity, authority, budgets and public/private boundary [REF-MCP-GATEWAY-REGISTRY] [REF-AGNTCY] |
| local worker isolation | custom bounded workspace vs **smolvm** | benchmark lifecycle/network/artifact path | lease/credential/effect semantics [REF-SMOLVM] |
| speech ASR+speaker segmentation | Qwen3-ASR + Nemotron vs **MOSS-Transcribe-Diarize** | same-corpus bakeoff; simplify only if quality/deployability wins | identity evidence, retention and room policy [REF-MOSS-TRANSCRIBE] |
| expressive local TTS | CPU floor + Gateway cloud vs **VoxCPM2 / future compact ID-MS models** | establish Node+ lane and keep blind radar search open | audience/consent/voice provenance [REF-VOXCPM2] |
| field network | IP + LoRa store/forward vs **Wi-Fi HaLow/OpenMANET** | measure range/power/regulatory fit | transport-independent signed envelopes [REF-OPENMANET] |

### Promotion rule

Score every consolidation candidate against the same dimensions:

1. product coverage;
2. semantic fit;
3. restart/offline behavior;
4. authority/effect interception;
5. data portability;
6. operational footprint;
7. maintenance/licensing/upstream velocity;
8. migration/fork cost.

**Authority, custody, recovery and export are pass/fail gates.** Feature breadth cannot compensate for failing them. Prefer an adapter first, a narrow upstreamable patch second, and a maintained fork only when the semantic difference is stable and worth owning.

Shared fixture set for Vellum/Strands/Flue/minimal-loop and relevant worker/browser candidates:

```text
authorized recall
denied recall
actor change mid-turn
power/process loss during tool call
abort + late result
provider EOF / partial tool call
duplicate inbound event
unknown external outcome
expired offline authority
archive export + restore
```

---

# 27. Build order

v0.6 separates **product proof** from **surface development**. ETNOS may continue in parallel because it is already useful as a public/community surface, but an ETNOS publishing demo is not treated as proof that the institutional second-brain/runtime works.

## Parallel Track E — ETNOS now

Continue the existing PieFed/ETNOS implementation and design work with the stable subset of Aksara semantics:

```text
InstitutionActor
GovernanceNamespace
Principal / IdentityBinding
Audience / visibility
PublicWork / PublicArtifact
InferenceAdmission / ComputeBudget
public capability profile
```

Ship public federation, local private communities and one request/outcome path. Do not block ETNOS on the full memory/runtime stack; do not let ETNOS-specific objects become the canonical institutional ontology merely because this surface ships first.

## Parallel Track V — vertical and Workstation Bridge spikes

Run small integration spikes without promoting them into the base Node:

- Playwright MCP + Stagehand on one harmless government/office-style browser workflow;
- OpenHands on one bounded software/research workspace;
- Guardian Connector/CoMapeo/ODK compatibility trace for one field/community dataset;
- Kolibri or MoodleBox local-content trace for one education site;
- ERPNext read/draft/approved-write trace for one cooperative scenario;
- Home Assistant/ESPHome/Wyoming or Fledge trace only when a real Node/device use requires it.

The output is adapter knowledge, failure fixtures and footprint measurements. These spikes do not block ETNOS or the minimal institutional vertical slice.

## Parallel Track P — multiplayer shell, Card and gathering interaction

Run this in parallel without blocking the institutional vertical slice:

- fork/trace Supermemory Company Brain and map its org/user/channel/thread, memory visibility, approval and proactivity flow to `InstitutionActor` / `Principal` / `ConversationLane` / `AccessContext`;
- prototype the same bounded task across Slack or another text channel, email, web and Card without giving any channel its own canonical memory;
- build XIAO ESP32-S3 Sense + Xiaozhi Card prototype with display, speaker, haptic, NFC and explicit privacy controls;
- exercise `GatheringSession` + one `capture.audio` Capability Lease, including transfer/revocation and WAN loss;
- validate fast-path wake/button → presence/ack behavior independently of resident LLM latency;
- wire one deployment email address to document ingest and asynchronous task continuation;
- measure Card battery, RF, audio quality, local buffering and Node/Gateway handoff before designing a custom PCB.

The output is reusable code/fixtures and interaction evidence. Promotion to custom hardware or Company-Brain-derived production shell requires passing the same identity/privacy/effect boundaries as existing surfaces.

## Phase A — real work traces + minimal contracts

Before expanding the schema again, document several complete traces across the intended early environments using real or realistic institutional artifacts:

```text
question/observation/intake
  → authorized sources
  → optional WorkObject
  → evidence / proposal
  → human or collective decision
  → manual/API hand-off
  → destination receipt
  → correction/follow-up
```

Freeze only semantics exercised by more than one trace or required by hard safety invariants. Scaffold the minimal shared objects first:

```text
InstitutionActor
Tenant
TrustDomain
DataCustodian
StoragePlacement
Principal
IdentityBinding
Membership / RoleAssignment
ConversationLane
AudienceRef
Initiator
AccessContext
SourceRef / EvidenceRef
WorkObject / WorkItem / DecisionRequest
Capability / CapabilityLease / CapabilityResult
SharingGrant
OfflineAuthorityEnvelope
ActionReceipt / LedgerRecord / Outbox
MemoryRecord
EgressRequest
InferenceAdmission / ComputeBudget
BackupSnapshot / VaultRef / DeviceAttestation
GovernanceNamespace
```

Proto/Buf/WIT definitions remain useful, but the full research object list stays in an appendix/register until exercised.

## Phase B — useful institutional vertical slice

Build one end-to-end daily loop on phone/web or an existing channel before requiring hardware:

```text
intake / Ask
  → authorized retrieval
  → source-linked answer or WorkObject
  → one proposal
  → human decision
  → manual or named system adapter
  → receipt
  → correction / follow-up
```

Base profile:

```text
Rust institutional service/process group
TypeScript UI + one resident cognition harness
SQLite + files + FTS
one channel adapter
optional on-demand Python capability worker
```

Vellum remains the current resident-cognition default hypothesis. Run the same trace corpus through Strands, Hermes adapters and the TS/Rust Aksara Minimal Loop; choose one production loop based on reliability, integration effort, latency, cost and failure behavior rather than framework preference.

## Phase C — trust, offline and recovery boundary

Add and adversarially test:

- multiple principals/audiences,
- multiple trust domains/custodians,
- `SharingGrant`,
- `OfflineAuthorityEnvelope`,
- stale role/mandate/revocation behavior,
- Memory Firewall correction/deletion propagation,
- Secure Boot/TPM/LUKS2,
- snapshot + immutable off-site backup,
- replacement-Node restore,
- duplicate/external-effect reconciliation.

Exit criterion is safe degraded operation, not maximum autonomy.

## Phase D — second environment + ETNOS bridge

Apply the same institutional grammar in a second domain. Publish one approved public request, artifact or outcome from a real internal WorkObject into ETNOS and carry one ETNOS-originated request back into an authenticated institutional path. Restricted negotiation remains outside ActivityPub visibility.

This phase validates that the abstraction is genuinely cross-domain rather than merely generic.

## Phase E — Node qualification + voice

Qualify 2–3 exact refurb candidates against:

```text
TPM2 / Secure Boot
NVMe health
AC-loss recovery
thermal soak
idle/load power
local ASR/TTS/planner p50 + p95 latency
LAN/offline behavior
backup/restore
field swap procedure
```

Then add MatrixUI, NFC/session handoff and room audio. Fingerprint and KVM remain separately approved experiments. Voice promotion requires the Aksara Voice Acceptance Corpus rather than model-card rankings.

## Phase F — measured cognition/memory breadth

Start from SQLite/files + FTS + explicit facts/timeline. Add richer mechanisms in response to measured failures:

```text
Graphiti / FalkorDB Lite
Continuity Tree
Trigger Index
vector recall
Jev/GLiNER-style scorers
Irama predictive preparation
MiMo/Qwen/Gemma local planners
```

Every addition must report incremental utility, false recall/exposure, latency and operating cost against the simpler profile.

## Phase G — capability breadth and execution ladder

Add capabilities as demanded by real deployments:

- named existing-system adapters, ODK/OpenFn/OpenSID/DHIS2 where applicable,
- AnyDoc/MinerU/Docling parser bakeoff,
- Wasmtime for a real third-party capability pack,
- Monty when programmatic orchestration measurably simplifies a workflow,
- richer local workspace worker,
- AX + Agent Substrate only for workloads that actually require cluster-scale isolated computers,
- scientific/field packs, JEPA/time-series models and Bend research.

The execution ladder remains broad; the base Node does not need every rung installed and resident from day one.

# 28. Memory acceptance tests

Memory is not “done” because a vector search returned something plausible.

P1 should test:

## Persistence boundary

Casual talk can become:

- nothing,
- ephemeral context,
- expiring continuity,
- candidate fact,
- approved institutional knowledge,

without raw conversation automatically becoming permanent.

## Temporal correction

A fact may be superseded without deleting its historical validity/provenance.

## Correction / withdrawal propagation

Change or remove an eligible canonical item and verify that:

- FTS/vector/graph/trigger projections no longer surface the invalidated version as current evidence,
- cached Node views are expired/rebuilt,
- the Ledger preserves only the minimum event metadata required by policy,
- immutable backups respect their retention/legal-hold limits rather than claiming impossible immediate erasure,
- any already-public/federated copy is reported as an external disclosure boundary rather than silently presented as deleted.

## Hierarchical recall

A long institutional history can answer broad questions from summaries and drill down to source evidence only when needed.

## Associative zero-overlap recall

Create benchmark cases in which the current query/event shares no meaningful keywords with the old memory, but the old memory is operationally relevant.

Compare:

1. FTS,
2. vector search,
3. Graphiti retrieval,
4. hybrid retrieval,
5. Trigger Index,
6. Trigger Index + `decision.score(memory.activation)`.

## Access-first recall

Restricted triggers must not be searched/revealed for an actor who is outside the source memory scope.

## Irama activation

A calendar/sensor/forecast event can activate a relevant memory even when no person asks a question.

The result may prepare context or propose an action, but cannot bypass policy/approval.

## Rebuildability

Delete derived:

- embeddings,
- Continuity Tree,
- Graphiti projection,
- Trigger Index,

and rebuild them from authoritative records without loss of institutional truth.

---

# 28A. Multi-principal / audience / lane acceptance tests

v0.5 adds institutional multi-user tests alongside the existing memory tests.

## Cross-channel identity continuity

The same verified person interacts over Web, WhatsApp and Edge:

- all three resolve to one canonical Principal,
- each keeps an independent ConversationLane,
- role/membership state is shared,
- transcripts are not merged,
- durable relationship/work facts may be retrieved according to policy.

## Identity collision

Two people share a display name. No binding occurs by name alone. A channel/account subject already bound to another Principal cannot silently rebind.

## Current-turn actor vs lane owner

A second authorized person posts into a lane previously owned/resting on someone else. Authorization and provenance must use the current turn actor. No private context from the resting owner may leak. [REF-VELLUM-IDENTITY]

## Group audience leak test

A staff member asks in a group about something known only from their private DM. The private record is not retrieved into the group response unless policy produces an explicitly safe transformation.

## Email CC change

A private email thread gains a new CC recipient. The next response rebuilds audience authorization; previously accessible private context is not assumed safe merely because the thread ID stayed the same.

## Shared Node / speaker

An authenticated person approaches a communal Node. Private detail is routed to Edge/phone/web unless the shared display/speaker audience policy permits it.

## Memory type vs retention

Create:

```text
semantic office gossip       → visible to participants but drop/short TTL
procedural safety checklist  → institution scope + reviewed durable
episodic patient event       → restricted case scope + governed retention
```

Verify that semantic type does not imply durable/global persistence.

## Runtime isolation

Two lanes share a local worker only when the workspace policy explicitly permits it. A conversation ID alone never grants filesystem/credential isolation. [REF-OPENHANDS]

## Native harness-memory bypass

Attempt direct Vellum/Hermes persistent-memory write while in Aksara institutional mode. It must route through the Aksara Memory Firewall or remain a clearly non-authoritative runtime cache.

## Caura backend equivalence

Run the same authorized memory fixture through:

1. local SQLite/Graphiti/FTS-vector stack;
2. Caura derived backend profile.

Verify:

- identical Aksara policy eligibility set,
- no cross-scope leakage,
- source/provenance linkage survives,
- authoritative store can rebuild either profile,
- deleting the derived backend does not delete institutional truth.

---

# 28B. Security, recovery, voice and field acceptance tests

These join, rather than replace, the memory/multi-principal/harness suites.

## Device trust

```text
disk removed → no plaintext
unsigned/modified UKI rejected
measured-boot/PCR policy change blocks protected auto-unlock
authorized signed update can transition vault policy without losing data
PCR policy includes every intended trust-critical component
SHA-256-or-better bank/policy only
remote attestation failure withholds/revokes remote capability credentials
Node continues bounded local operation when verifier/Gateway is absent
```

## Backup/recovery

```text
snapshot during normal writes remains transactionally consistent
immutable target resists ordinary delete/overwrite credential
expired/missing object-lock extension raises explicit health failure
restore onto replacement hardware succeeds
derived graph/vector/search state is rebuilt from canonical sources
completed external effect is not re-executed after restore
lost Node device identity is re-enrolled rather than copied
recovery without Abstraksi infrastructure is documented and exercised
```

## Voice

```text
Papuan/Indonesian/code-switch corpus runs on every promoted ASR profile
far-field/noise/overlap test, not studio-only evaluation
identifier/name exact-match tracked separately from WER
diarization label never becomes authentication
communal speaker cannot render protected detail
cloud TTS/ASR path is denied when EgressPolicy forbids it
offline local TTS still produces understandable Indonesian
```

## Field/power

```text
abrupt mains loss during idle
abrupt mains loss during canonical write
abrupt mains loss during update
repeated cold boots
NVMe health warning
thermal throttling/load soak
Gateway outage
low-bandwidth/high-RTT sync
```

Acceptance numbers are **targets to measure on selected P1 hardware**, not claims inherited from a model card.


---

# 28C. Workstation, observation and governance acceptance tests

## Browser / computer use

- a read-only browser task cannot acquire write tools because a page tells it to;
- credentials inserted through a browser variable/session broker do not appear in the model prompt, ordinary trace or MemoryRecord;
- actor change or session handoff invalidates/reissues the `ComputerSession`;
- a changed page can trigger re-observation, but an effectful action is not silently self-healed into a different destination/action;
- disconnect after submit yields `OutcomeUnknown` until destination reconciliation;
- browser profile/cookies can be revoked independently of institutional memory;
- KVM ATX/virtual-media/HID capabilities are denied unless explicitly leased;
- physical/UI stop prevents new actions and reports any already-uncertain effect.

## Observation / actuation

- stale/missing sensor data is not rendered as current/safe;
- derived observations preserve raw/reference observation and transform/model version;
- calibration/version changes are visible in later comparisons;
- sensitive location precision follows TrustDomain/disclosure policy;
- model interpretation cannot directly bypass an actuator's deterministic safety/interlock layer.

## Community governance lifecycle

- removing a member invalidates future access and applicable offline authority without deleting records they legitimately authored;
- a custodian change transfers recovery authority without making the technical host the default custodian;
- disputed authority blocks disclosure rather than resolving via admin/root convenience;
- a withdrawn source disappears from active derived retrieval and is marked in dependent summaries;
- sponsor/operator exit leaves an exportable, decryptable-by-authorized-custodian archive and documented recovery path;
- model-training permission is tested separately from archive/analysis/publication permission.

---

# 28D. Card, gathering and physical-presence acceptance tests

## Card identity and privacy

- a lost/revoked Card cannot resume private institutional context after revocation;
- Card identity never substitutes for current role/membership/authority checks;
- microphone hardware privacy-off state cannot be bypassed by ordinary application firmware;
- camera capture is visibly explicit and cannot silently become continuous capture;
- sensitive result can hand off to phone/web without speaking or rendering the protected detail publicly;
- Node and Gateway paths produce the same authorization result for the same principal/context.

## Gathering / capture

- several nearby Cards do not automatically start or multiply-record a gathering;
- `capture.audio` requires an explicit lease and named source;
- capture transfer requires new acceptance and does not silently leave two primary sources;
- WAN loss preserves/buffers permitted capture locally and reports degraded state;
- live transcript errors do not become approved institutional facts;
- post-session canonical transcript and extracted actions remain reviewable before memory/work promotion;
- speaker labels remain session evidence and never become authentication.

## Social presence

- Aksara can be configured to remain silent while still showing/private-cueing relevant context;
- a private haptic cue does not leak the topic on communal MatrixUI;
- verbal interjection obeys current social-role/attention policy;
- simple start/stop/mark/mute/private-handoff controls remain responsive during resident-model/provider slowdown;
- cached acknowledgment never claims completion of an action whose receipt has not arrived.

## Multiplayer shell / channel continuity

- the same principal/task can continue across Card, email, messaging and web without merging unrelated lanes;
- public/shared/private memory scopes remain access-equivalent across channel adapters;
- proactive triage can choose silence/PASS without losing an explicit request;
- borrowed/leased teammate capability expires and does not become ambient shared credentials;
- channel outage or agent restart resumes pending approvals/work without duplicating effects.

---

# 29. Freeze decisions for v0.3

1. The v0.2 trusted-kernel/polyglot architecture remains.
2. No generic memory framework becomes “Aksara memory.”
3. Memory now has four explicit mechanisms: **authoritative store, temporal graph, Continuity Tree, Associative Trigger Index**.
4. **T-Mem is adopted as design inspiration, not as a wholesale memory dependency.**
5. T-Mem-style triggers are write-time, rebuildable, provenance-linked, temporal and policy-scoped.
6. Trigger text/embeddings inherit the source memory's access class or stricter.
7. Authorized scope is resolved **before** trigger retrieval.
8. `decision.score(memory.activation)` becomes a first-class bounded-judgment task.
9. Graphiti remains the temporal relational projection.
10. OptMem/TiMem/HORMA remain the primary references for hierarchical continuity/compression/navigation.
11. **Irama and Trigger Index are separate but composable:** Irama predicts/detects the situation; Trigger Index identifies old knowledge relevant to that situation.
12. Deterministic schedules/deadlines precede ML anticipation in P1.
13. TimesFM/TTM remain forecasting candidates; JEPA remains primarily Perceive/Represent research for temporal structure.
14. Memory activation may preload/surface/propose; it does not grant authority.
15. The simulator must include zero-keyword-overlap associative-recall scenarios before Trigger Index is promoted from PROTOTYPE to ADOPT.
16. Every major external technology in this catalogue carries a stable `REF-*` inspiration/source pin.
17. The source ledger documents both **what Aksara borrowed** and **where Aksara intentionally diverges**, so future maintainers do not cargo-cult upstream architecture.

---

# 30. Research radar

Allowed to move without destabilizing P1 contracts:

- Jev/OpenJev-like decision models and Aksara-specific distillation/fine-tuning,
- Jev-Mem-style budgeted retrieval control,
- adaptive reasoning-effort routing,
- V-JEPA and time-series JEPA variants,
- T-Mem implementations and follow-up associative-memory work,
- OptMem/TiMem/HORMA-style consolidation,
- Graphiti backends,
- local general LLMs and MiMo/Qwen/Gemma agentic-planner candidates,
- Qwen3-ASR / MOSS-style integrated transcription-diarization / Indonesian-Papuan speech adaptation,
- continuously search the open ecosystem for smaller expressive Indonesian/Malay TTS across CPU, Node/Node+ and Gateway tiers; VoxCPM2 is a benchmark anchor, not a fixed winner,
- GLiNER2.5-Decide/multilingual bounded decision scorers,
- document-parser bakeoff across AnyDoc/MinerU/Docling and future engines,
- TPM2 measured-boot/attestation patterns and appliance update hardening,
- confidential-compute/TEE Gateway options where locally procurable,
- backup client/object-lock interoperability,
- minimal TS/Rust resident-loop experiments,
- Bend 2 maturity,
- Duroxide,
- A2UI,
- agentgateway,
- agentOS/Eve,
- AetherEdge/Bubbaloop,
- Zenoh,
- sqlite-vec,
- capability/MCP registry convergence,
- science models,
- ScienceBuddy-style evaluated harness/capability improvement loops, with operational data kept separate from training by policy/consent. [REF-SCIENCEBUDDY]

Research may change implementations. It may not silently change institutional semantics.

---


# 31. ETNOS + A2A public coordination architecture

**Status: FREEZE semantics; PROTOTYPE implementation.**  
**Source pins:** [REF-A2A] [REF-ACTIVITYPUB] [REF-ACTIVITYSTREAMS] [REF-PIEFED17]

ETNOS is the public social/federated coordination plane. A2A is the structured peer-work plane. They intentionally overlap in *identity, discovery and public outcome*, but not in private execution.

```text
                   PUBLIC / SOCIAL PLANE
          humans · communities · institutions · agents
                         ETNOS
                    ActivityPub/PieFed
                         │
        post · discussion · request · public artifact
                         │
                   PublicWork object
                         │ optional governed bridge
                         ▼
                    A2A TASK PLANE
              Agent Card · Task · Artifact
                         │
                  receiver's policy
                         │
               Capability Lease / approval
                         │
                 local capabilities/tools
                         │
                         ▼
                  safe public projection
                         │
                         └────────→ ETNOS trace/artifact
```

Hard boundary:

> **A public ETNOS post may initiate or advertise work, but comment text is never the execution protocol. An A2A task may produce a public result, but A2A messages/history are never public merely because the task originated on ETNOS.**

This matches A2A's own separation between Messages (communication) and Artifacts (task outputs), and its explicit support for long-running stateful Tasks, streaming/push updates, authentication requirements and `AUTH_REQUIRED` / `INPUT_REQUIRED` interruption states. [REF-A2A]

## 31.0 GovernanceNamespace and compute boundary

ETNOS needs a governance grouping that is **not** the same thing as topic taxonomy, server deployment or government department.

Canonical internal object:

```text
GovernanceNamespace
  id
  instance_ref
  governance_type
  authority/custodian refs
  membership/admission policy
  visibility defaults
  federation policy
  compute policy ref
```

A Topic answers **“what is this about?”**. A GovernanceNamespace answers **“under whose delegated governance does this set of spaces operate?”**

Examples:

```text
Papua commons instance:
  Meepago / Lapago / Anim Ha / ...

Papua Tengah institutional deployment:
  provincial / Nabire / Deiyai / Mimika / ...

other deployments:
  nation / iwi / territorial council / diaspora federation /
  association / campus / cooperative / other locally valid structure
```

A dinas, school, clinic, lab or NGO is normally an **Organization/actor inside** a namespace rather than requiring its own namespace. Small deployments may expose no namespace UI at all.

Hard distinction:

> **Deployment topology is not social topology.**

A namespace may begin inside one shared server and later move to its own independently operated ETNOS instance without becoming a different community object.

Second hard distinction:

> **Federation grants reachability, not compute entitlement.**

Following, federating with or messaging an institutional Aksara does not automatically authorize frontier inference paid by Abstraksi or the receiving institution. Public/remote calls pass `InferenceAdmission` and `ComputeBudget`.

## 31.1 ETNOS stays agent-agnostic

ETNOS core must work for:

```text
human
organization
community
institutional_agent
service_agent
watch/evidence_monitor
```

`Aksara` is a Papua deployment presentation/implementation identity, not a protocol primitive. Other communities can run ETNOS with entirely different agent stacks.

## 31.2 ActivityPub actor compatibility

ActivityStreams already defines `Application`, `Group`, `Organization`, `Person` and `Service` actor types, and ActivityPub explicitly allows an actor to represent software, a bot or an automated process. [REF-ACTIVITYSTREAMS] [REF-ACTIVITYPUB]

ETNOS therefore should **not invent a federation-breaking `AksaraActor` type**. Keep public federation on ordinary ActivityPub actor semantics and store richer ETNOS/Aksara presentation metadata in the ETNOS sidecar and, only where interoperability proves useful, a small namespaced JSON-LD extension.

Recommended rule:

- an account representing the institution itself may remain an ordinary substrate-compatible Organization/Person-style actor depending on PieFed constraints;
- automation is represented by ETNOS metadata such as `actor_role=institutional_agent`, `automation=assisted|autonomous-with-gates`, and an optional A2A Agent Card link;
- a clearly separate software-only agent account may use `Service` where federation compatibility is good;
- UI remains explicit: **institution first, machine status second**.

Example presentation:

```text
Dinas Kehutanan Papua Tengah · Aksara
Lab Ekologi UNCEN · Aksara
Puskesmas Doyo · Aksara
Balai Adat X · Aksara
```

## 31.3 Public actor profile ↔ A2A Agent Card

A2A v1.x exposes standardized Agent Cards at `/.well-known/agent-card.json`, with declared interfaces, capabilities, security schemes, skills, optional signatures and an authenticated Extended Agent Card path. [REF-A2A]

Aksara should map these cautiously:

```text
ETNOS public profile
  institution identity
  machine-label / automation status
  public capabilities
  public governance note
  public Agent Card URL (optional)

A2A public Agent Card
  only safe/discoverable skills
  supported interfaces
  auth requirements
  streaming/push support

A2A Extended Agent Card
  authenticated capabilities
  quotas / restricted skills
  deployment-specific detail
```

The public Agent Card is discovery, **not authority**. Receiving an A2A request still creates an Aksara `ActorContext` and passes policy/lease checks locally.

## 31.4 A2A → Aksara semantics

| A2A primitive | Aksara meaning |
|---|---|
| Agent Card | discoverable remote capability claim |
| Agent Skill | advertised operation family; maps to local capability/Graph Pack metadata, not automatically callable authority |
| Message | peer communication/input; never evidence merely because another agent said it |
| Task | remote work request lifecycle |
| Artifact | candidate result/output; may become evidence/artifact after local validation |
| Context | cross-task continuity reference, not institutional memory scope |
| `AUTH_REQUIRED` | remote side needs authorization; may map to a human/collective approval gate |
| `INPUT_REQUIRED` | more information is needed; no implied permission escalation |
| streaming/push | transport for task progress; not public trace by default |

## 31.5 PublicWork sidecar

Keep PieFed thinking in ordinary social objects initially. Add an ETNOS sidecar keyed by canonical ActivityPub/post ID rather than forking PyFedi's social domain model prematurely.

```yaml
PublicWork:
  id: work_...
  canonical_post_ref: https://.../post/...
  work_type: data_request | literature_request | collaboration | review | release | service_request
  status: open | active | waiting_human | completed | closed
  owner_actor_ref: ...
  steward_ref: ...
  communities: [...]
  places: [...]
  contributors: [...]
  requested_capabilities: [...]
  artifacts: [...]
  visibility: public | bounded | outcome_only
  provenance: ...
  public_trace_ref: ...
  a2a_context_refs: [...]      # private/internal by default
  created_at: ...
  updated_at: ...
```

## 31.6 Public trace is a projection, not an observability dump

The ETNOS mock's trace concept is accepted.

Allowed examples:

```text
request accepted
policy checked
peer contacted
human review requested
public-safe aggregate received
artifact published
outcome recorded
```

Never project:

```text
chain-of-thought / hidden reasoning
private prompts
credentials/tokens
raw restricted payloads
patient/student/person-level data
private A2A messages
internal memory snippets
sensitive tool arguments
```

OpenTelemetry and the institutional Ledger remain separate internal/audit layers. Public trace is a redacted semantic view derived from them.

---

## 31.7 Federated capability and agent discovery

**Status: EVALUATE standards before proprietary registry.**  
**Source pins:** [REF-MCP-REGISTRY] [REF-A2A] [REF-AGNTCY] [REF-MCP-GATEWAY-REGISTRY]

Aksara/ETNOS now distinguishes four discovery layers:

```text
ActivityPub / ETNOS profile
  social/public identity + public posts

A2A Agent Card
  endpoint + advertised skills/interfaces/security schemes

Official MCP Registry / local capability imports
  MCP server/tool discovery

AGNTCY OASF + Agent Directory
  framework-neutral, potentially federated descriptions of agents/skills/MCP resources
```

The layers may cross-link but none grants execution authority. An external listing becomes a local `CapabilityClaim` / `RemoteAgentClaim`; the receiving Aksara still resolves trust, purpose, cost, data class, `SharingGrant` and Capability Lease.

Before implementing a globally federated Aksara capability directory, test whether OASF can describe the public/non-sensitive portion of Aksara capabilities and whether AGNTCY Directory federation can provide acceptable provenance, signing, lookup and namespace behavior. Preserve an Aksara extension only for semantics not representable upstream.

`mcp-gateway-registry` is complementary: it can be evaluated as the governed local/regional front door through which discovered MCP/A2A/REST/inference resources are exposed after local policy.

---

# 32. ETNOS product grammar from the HTML design lab

**Status: ADOPT as product direction.**  
**Source pins:** [REF-PIEFED17]

The current HTML design lab is aligned with the architecture and should be treated as the product-picture input, not as a constraint to preserve an older ETNOS repository structure.

Freeze these product decisions:

1. **ETNOS feels like a place/social network, not an AI console.** Ordinary human posts remain the dominant texture.
2. **Agents participate in existing subject/place communities.** `c/aksara` is meta/interoperability only, not the agent ghetto humanity would inevitably create if given half a chance.
3. **Institution identity stays primary.** Machine status is explicit and secondary.
4. **PieFed social primitives are reused:** communities, feeds, topics/grouping, flairs, Q&A/solved, wikis, events, polls, local/private rooms and crosspost/comment consolidation where supported. [REF-PIEFED17]
5. **Public work blooms only when needed.** Home/feed stays socially familiar; work detail exposes trace, gates, contributors and artifacts.
6. **Artifacts are first-class objects**, not blobs buried in comments.
7. **Watch is a generic evidence/presentation grammar**, not a hardcoded Papua product primitive.
8. **Follow is attention, not ontology.** PieFed 1.7's user-following feature makes institutional actors followable without forcing work into dedicated agent communities. [REF-PIEFED17]

The first implementation may use a sidecar/index over PyFedi/PieFed rather than an invasive fork. Fork only after the semantic gap is proven by working flows.

---

# 33. Demo ecosystem: three primary verticals + one shared field stress case

**Status: FREEZE demo breadth; PROTOTYPE packs.**  
**Source pins:** [REF-KOLIBRI] [REF-OPENEMIS] [REF-SATUSEHAT-FHIR] [REF-LOCALCONTEXTS]

The demo should not be three unrelated chatbots. It should demonstrate one institutional substrate expressed through different Graph Packs and Capability Packs, coordinated through ETNOS/A2A.

```text
                          ETNOS
          public work · communities · artifacts · traces
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
            SCHOOL        CLINIC      INSTITUTION
             Node          Node          Node
               │            │            │
               └────────── A2A ──────────┘
                            │
                    optional FIELD Node
```

## 33.1 School Node

**Problem frame:** teacher/learner continuity, curriculum evidence, offline resources and institutional reporting without inventing another LMS/SIS.

Reuse candidates:

- **Kolibri** for offline-first learning content and classroom delivery; it is explicitly designed to run without Internet and can distribute content by local server, peer-to-peer or removable storage. [REF-KOLIBRI]
- **OpenEMIS School** for school-level student/staff/attendance/progress administration where useful; OpenEMIS also provides offline options and interoperability. [REF-OPENEMIS]
- Aksara Graph Pack for curriculum objectives/prerequisites/evidence and local institutional continuity.

Candidate capabilities:

```text
school.roster.read
school.attendance.read
school.attendance.record
school.curriculum.objective.read
school.learning.evidence.record
school.resource.search
school.resource.assign
school.lesson.prepare
school.progress.aggregate
school.report.draft
school.notice.draft
school.publication.propose
```

Demo scenario:

```text
teacher asks Aksara about a class objective
→ retrieve curriculum objective + learner evidence
→ find offline Kolibri resources
→ prepare differentiated activity
→ record reviewed evidence
→ class aggregate updates
→ school Aksara can answer an A2A request from education office with an approved aggregate
→ public-safe resource/result may be posted to ETNOS
```

Never make student-level data public through ETNOS. No biometric ranking/surveillance.

## 33.2 Clinic / Puskesmas Node

**Problem frame:** records/workflow/inventory/referral/reporting continuity with clinician authority and Indonesian interoperability.

Reuse candidates:

- OpenMRS/Bahmni-class EMR substrate rather than a bespoke patient record system.
- **SATUSEHAT FHIR** as the national interoperability boundary. SATUSEHAT explicitly uses HL7 FHIR and publishes resources including Patient, Encounter, Observation, Medication*, ServiceRequest, Task, DiagnosticReport, QuestionnaireResponse and others. [REF-SATUSEHAT-FHIR]

Candidate capabilities:

```text
clinic.queue.read
clinic.encounter.read
clinic.encounter.summarize
clinic.inventory.read
clinic.inventory.threshold_check
clinic.referral.prepare
clinic.report.aggregate
clinic.fhir.validate
clinic.satusehat.prepare
clinic.public_notice.draft
```

Demo scenario using synthetic data only:

```text
clinic sees stock running low
→ Irama/threshold surfaces prior lead-time memory
→ Aksara prepares stock/reorder or neighboring-facility availability request
→ A2A request asks another authorized institution for an aggregate availability answer
→ human approval gate where needed
→ result recorded locally
→ ETNOS can receive only a public-safe notice or aggregate if explicitly approved
```

A medical model may assist analysis, but the clinician remains final clinical authority.

## 33.3 Institution Node: government office + balai masyarakat adat variants

This is one technical family with two governance profiles rather than two separate products.

### Government-office profile

Core objects:

```text
Case
Requirement
Evidence
Document
Obligation
Decision
Approval
Submission
Receipt
PublicStatus
```

Candidate capabilities:

```text
case.open
case.requirements.read
case.evidence.attach
records.search
records.draft
archive.srikandi.prepare
portal.submit.prepare
approval.request
status.publish
etnos.request.publish
```

Aksara integrates with SRIKANDI/legacy portals rather than replacing them; browser/CUA is a fallback when no API exists.

### Balai masyarakat adat profile

Core objects extend the same substrate:

```text
Issue
Participant / Constituency
Evidence / Story / Source
Position
Condition
Dissent
Mandate
CulturalProtocol
Decision
Expiry / Review
PublicPosition
```

Candidate capabilities:

```text
adat.issue.open
adat.source.record
adat.position.record
adat.conditions.record
adat.dissent.record
adat.mandate.propose
adat.mandate.review
adat.protocol.apply
adat.publication.propose
```

Local Contexts is a strong external reference for attaching community-defined provenance, protocol and permission metadata to knowledge/materials; ETNOS/Aksara should support this *kind* of community authority without pretending that imported labels replace local governance. [REF-LOCALCONTEXTS]

Demo scenario:

```text
community issue opened
→ evidence/stories recorded with visibility/cultural protocol
→ positions and dissent remain distinct
→ Aksara synthesizes a candidate, never "infers consensus"
→ authorized council process approves/conditions/expires mandate
→ only approved public position crosses to ETNOS
→ another institution may reference/request it over A2A
```

## 33.4 Field / essential-service stress pack

Keep as the optional fourth Node because it tests observations, sensors, prediction, intermittent connectivity and cross-institution coordination better than the three desk-heavy verticals.

Candidate capabilities:

```text
field.observation.record
field.sensor.read
field.timeseries.forecast
field.threshold.evaluate
field.incident.open
field.status.aggregate
field.public_alert.propose
```

This pack is ideal for later Jayapura water/watershed resilience scenarios and for exercising Zenoh, WoT, Irama and JEPA/forecasting without contaminating the P1 base image.

---

# 34. Cross-vertical scenario for the simulator

**Status: ADOPT as the flagship ecosystem demo.**

A single scenario should force the architecture to prove Person → Institution → Network value.

Example:

```text
1. Field Node detects/receives a water-service disruption signal.
2. It records observation + provenance locally.
3. Field Aksara asks the government/institution Aksara over A2A to confirm service status.
4. Government Aksara returns a public-safe status and/or requests human confirmation.
5. Clinic Aksara receives an authorized operational notice and checks its local water/stock continuity plan.
6. School Aksara receives a separate authorized operational notice and adjusts a local plan/announcement.
7. ETNOS receives one approved public update, discussion thread and public trace.
8. No raw clinic/student/internal-government memory is centralized or posted publicly.
```

The same simulator can swap the initiating event for a dataset request, public-health logistics question, school closure/service disruption, research collaboration or community mandate issue.

This is the canonical demonstration of:

```text
Person → Aksara
Institution → Aksara
Aksara ↔ Aksara
Aksara → ETNOS
```

---

# 35. Graphiti P1 profile

**Status: PROTOTYPE → likely ADOPT.**  
**Source pins:** [REF-GRAPHITI] [REF-FALKORDB-LITE]

Graphiti has become materially easier to run locally. Current upstream supports FalkorDB Lite as an embedded/zero-config option on Python 3.12+, while standalone FalkorDB remains available. Kuzu support is deprecated upstream and must not become a new Aksara dependency. [REF-FALKORDB-LITE]

Recommended P1 profile:

```text
Authoritative SQLite/files
        │
        ├── Graphiti adapter
        │      └── FalkorDB Lite (preferred local dev / small Node)
        │          or standalone FalkorDB
        │
        ├── FTS5
        ├── vector index
        ├── Continuity Tree
        └── Trigger Index
```

Important implementation rule:

> The ETNOS/Hermes vertical slice does not wait for Graphiti. When Graphiti is present, it enriches retrieval/context; when absent, canonical state and capabilities still work.

Early Graphiti test cases should use institutional objects from the demo verticals rather than generic chat memories:

```text
Person ↔ Role ↔ Institution
Case ↔ Requirement ↔ Evidence
LearnerAggregate ↔ Objective ↔ Evidence
InventoryItem ↔ Facility ↔ Threshold
Issue ↔ Position ↔ Mandate
PublicWork ↔ Artifact ↔ Contributor
```

---

# 36. Physical hardware design-lab alignment

**Status: ALIGNED; hardware semantics are product contract while geometry, enclosure and module composition remain design/simulator inputs.**

The design lab should no longer model one mandatory square Node with an intrinsic display. It should model a coherent **hardware family** built from separable primitives:

- **Node Core:** refurbished/serviceable x86 compute, NVMe, Node Controller, local custody/networking and modular interaction I/O;
- **Presence Surface:** 64×64 HUB75 reference or lower-cost diffused RGB variant, with optional/shared voice and vision;
- **Information Surface:** 7.5-inch class 800×480 e-paper reference with public/shared information renderer, QR handoff and optional/shared voice and vision;
- **Card:** principal-bound portable surface;
- **Node Complete:** integrated industrial design combining Node Core + Presence + Information surfaces and shared interaction hardware without changing the underlying contracts.

The current 64×64 Node HTML lab remains useful as the **Presence Surface** reference: smoked/dead-front or grid/diffuser treatment, MatrixUI state/motion grammar, offline/gateway/approval simulator events and clinic/school/field/ETNOS fixtures remain valid. The square matrix is no longer frozen as the geometry of the compute appliance itself.

The design lab should add:

1. a headless/metal-brick Node Core;
2. a standalone 64×64 Presence Surface;
3. a cheaper diffused RGB Presence Mini variant;
4. a standalone 7.5-inch Information Surface;
5. a Node Complete monolith with e-paper + diffused RGB or 64×64 matrix + shared mic/speaker/camera/privacy controls;
6. multi-surface site layouts where one Node serves several endpoints;
7. the existing Card simulator using semantic `ViewPrimitive`/Presence state: tiny text, approval, haptic intent, privacy state, task/gathering state and capture lease.

Renderer rule:

> semantic state is display-independent; MatrixUI, EInkUI, Card UI and web/mobile renderers consume the same audience-safe interface state but expose only capabilities appropriate to their endpoint.

Presence Surface rule:

> the RGB endpoint is an ambient institutional interaction surface, not a tiny bureaucratic spreadsheet with delusions of grandeur.

Information Surface rule:

> persistent/public e-paper renders only audience-authorized composed frames; public endpoints operate on public/policy-bounded projections and hand private work to authenticated surfaces.

Card rule:

> Card state is principal-bound; it may carry identity, private prompts, approval, haptic cues and explicitly leased capture without turning the Card into an independent institutional authority.

Two cleanup notes remain:

1. labels such as `P2` / `P2.5` mean **pixel pitch**, not Aksara product generation; make that explicit to avoid P1/P2 confusion;
2. the visible catalogue revision should track the canonical catalogue when the lab is next edited.

---

# 37. Minimal production-shaped scaffold

**Status: FREEZE.**

The scaffold should maximize future survival while keeping present implementation small.

```text
abstraksi/
├── proto/
├── wit/
├── schemas/
│   ├── core/
│   ├── etnos/
│   ├── a2a/
│   └── domains/
├── crates/
│   ├── core-types/
│   ├── kernel/
│   ├── principal/
│   ├── identity/
│   ├── lane/
│   ├── actor-context/
│   ├── state/
│   ├── policy/
│   ├── lease/
│   ├── ledger/
│   ├── outbox/
│   ├── capability/
│   ├── capability-host/
│   └── cli/
├── services/
│   ├── aksarad/
│   └── aksara-execd/
├── runtime/
│   ├── hermes/
│   └── vellum/
├── adapters/
│   ├── etnos/
│   ├── a2a/
│   ├── activitypub/
│   ├── graphiti/
│   ├── caura/
│   ├── channels/
│   └── alexandria/
├── packs/
│   ├── capabilities/
│   │   ├── etnos/
│   │   ├── school/
│   │   ├── clinic/
│   │   ├── institution/
│   │   └── field/
│   └── graphs/
│       ├── school/
│       ├── clinic/
│       ├── institution/
│       └── field/
├── apps/
│   ├── simulator/
│   ├── console/
│   └── card-sim/
└── scenarios/
    ├── etnos-public-work/
    ├── school-learning/
    ├── clinic-continuity/
    ├── adat-mandate/
    └── cross-node-water/
```

Do not create shared packages merely because the folder tree looks lonely. The anti-sprawl rule still applies: a package exists because a stable contract or a second real consumer exists.

---

# 38. v0.4 freeze decisions

1. ETNOS repository history/implementation does **not** constrain the product model; the current HTML design lab is the product-picture input for the next ETNOS fork/refactor.
2. ETNOS remains agent-agnostic and open/federated; Aksara is the governed institutional implementation that participates especially well.
3. Aksara agents are ordinary federation-compatible actors with explicit machine/institution metadata, not a bespoke ActivityPub actor type.
4. A2A becomes the canonical independent-agent peer-work protocol; ActivityPub remains the public/social protocol; MCP remains agent→tool.
5. A public ETNOS post may initiate work, but agent execution does not occur through comment text.
6. A2A Messages stay private/internal by default; A2A Artifacts become public only through an explicit publication gate.
7. `PublicWork`, `PublicArtifact` and `PublicTraceEvent` become first-class Aksara/ETNOS contract objects.
8. The ETNOS sidecar approach is preferred before a deep PyFedi fork.
9. The first implemented end-to-end slice is `aksara-cli → kernel/execd → ETNOS capability → receipt/ledger`, exercised by Hermes.
10. Vellum remains the target resident cognition substrate, but the ETNOS slice must prove runtime portability before Vellum is required.
11. QuickJS-WASM is cognition/workflow machinery; Wasmtime/WIT is capability execution; Duroxide is institutional durability; agentOS is optional heavy workspace. These are separate ports.
12. Graphiti may be integrated early using FalkorDB Lite/standalone FalkorDB, but remains a rebuildable projection and cannot block base functionality.
13. The three primary demo verticals are School, Clinic/Puskesmas, and Institution with government/adat governance profiles; Field/Essential-Service is the fourth stress pack.
14. Kolibri/OpenEMIS, SATUSEHAT FHIR/OpenMRS-class systems, SRIKANDI/legacy government systems, and Local Contexts-style governance metadata are integration/reference surfaces, not things Aksara replaces.
15. The flagship simulator scenario must demonstrate safe cross-Node coordination and public ETNOS projection without centralizing raw institutional data.
16. The current physical Node design lab is aligned with P1; square 64×64 remains baseline and dual-panel forms remain experiments.
17. Simulator, CLI and physical Node must use the same core object/trace/capability contracts.

---

# 39. v0.3 → v0.4 change summary

v0.4 keeps the v0.3 memory/anticipation architecture and adds the missing **public coordination + agent interoperability + demo-vertical layer**:

- ETNOS + ActivityPub + A2A separation is now explicit;
- generic agent/institution actor semantics are defined;
- A2A Agent Card/Task/Artifact semantics are mapped onto Aksara authority and ETNOS public projections;
- `PublicWork`, `PublicArtifact`, and safe `PublicTraceEvent` objects are introduced;
- the ETNOS HTML product grammar is folded into architecture without binding Aksara to an older ETNOS repo shape;
- School, Clinic/Puskesmas, Institution/Adat and Field capability/Graph Pack directions are fleshed out;
- Kolibri/OpenEMIS, SATUSEHAT FHIR and Local Contexts become explicit reference/integration surfaces;
- Graphiti gets a lighter P1 profile using FalkorDB Lite where available;
- the build order now starts with a real CLI + ETNOS governed slice that Hermes can exercise immediately;
- the physical Node design lab is checked against the architecture and retained as a simulator/design input.

---

# 40. v0.5 consolidation: institution → principal → lane → governed memory → runtime

**Status: FREEZE semantics; implementation staged.**

v0.5 consolidates the September architecture research into one operating model.

## 40.1 The institutional sharing model

```text
                           INSTITUTION
                                │
                        one Aksara identity
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
    Principals              WorkObjects              Public peer
 humans/roles/teams       cases/projects/etc.       ETNOS / A2A
        │                       │
 IdentityBindings               │
        │                       │
        └───────────┬───────────┘
                    ▼
             ConversationLane
                    │
             current TurnContext
                    │
       actor + initiator + audience
          + purpose + work objects
                    │
                    ▼
              MemoryView policy
                    │
                    ▼
             Resident cognition
                    │
                    ▼
             governed execution
                    │
                    ▼
            outcome + ledger
```

This is intended to remain valid for offices, schools, clinics, adat institutions, labs and eventually households. The Graph Packs, Capability Packs and governance profiles change; the identity/lane/memory/execution contracts do not.

## 40.2 Vellum role after the latest upstream changes

Vellum remains the strongest current resident-cognition reference, and its September 2026 architecture has converged further toward several Aksara needs:

- gateway-owned public ingress and actor/trust resolution,
- a contact record with multiple channel bindings,
- explicit current-turn actor vs resting conversation actor semantics,
- provenance stamping,
- per-user/per-channel memory isolation,
- v3 concept-page memory with section/lane selection,
- credential separation and sandboxed tool use.  
  [REF-VELLUM] [REF-VELLUM-IDENTITY] [REF-VELLUM-MEMORY-V3]

Aksara should **adapt, not delegate sovereignty**:

```text
Vellum handles:
  conversation loop
  planning/tool reasoning
  proactive cognition
  browser/computer workflow
  skills
  channel-facing UX where useful

Aksara handles:
  Institution/Principal/IdentityBinding
  Membership/Role/Mandate
  ConversationLane semantics
  audience/purpose AccessContext
  canonical MemoryRecord + Memory Firewall
  authority/Cedar/lease
  objective/evidence/ledger
  public ETNOS boundary
```

For institutional mode, Vellum's native durable memory becomes either disabled, an explicitly local cognitive cache, or an adapter whose durable writes are proposed to the Aksara Memory Firewall. Avoid two independent systems believing they own the same person's/institution's long-term truth.

Vellum's current actor/resting-actor distinction also gives us a useful anti-pattern: do not mutate one shared transcript into a supposedly actor-scoped version and hope concurrency keeps the attribution straight. Build the authorized context view for the **current turn** at assembly time. [REF-VELLUM-IDENTITY]

## 40.3 Hermes and OpenClaw role

Hermes remains the quickest broad messaging/development harness and a good reference for durable multi-platform session keys, restart recovery, searchable session history and external-memory adapters. [REF-HERMES]

OpenClaw remains the cleanest reference for:

- per-agent/workspace separation,
- channel-account → agent bindings,
- DM/group/thread session scopes,
- `identityLinks` across channels,
- explicit cross-agent/session visibility controls. [REF-OPENCLAW]

Aksara folds the routing ideas into `IdentityBinding` and `ConversationLane`; it does not inherit their assumption that one “agent profile” is the top-level governance unit.

## 40.3A Same-version harness bakeoff

Strands Harness is added as the strongest current owned/forkable alternative to Vellum because its SDK-first architecture exposes the agent loop, lifecycle, hooks, model portability and tooling without requiring a hosted control plane. It remains a cognition implementation only. No kernel contract changes and no immediate migration are authorized. [REF-STRANDS]

Vellum remains the current target. Hermes remains first-class for compatibility/development channels. The bakeoff does **not** delete mature harnesses merely because Aksara can write a `while` loop.

## 40.3B Bespoke loop control experiment

Add two deliberately boring internal adapters:

```text
Aksara Minimal Loop TS
Aksara Minimal Loop Rust
```

Both implement `ResidentCognitionPort` only. They may borrow provider/stream/tool-call machinery from AI SDK Core, yoagent or Rig, but they must route every real tool effect back through Aksara capability/lease semantics and must not grow a second memory, workflow engine or authority model. [REF-VERCEL-AI-SDK-LOOP] [REF-YOAGENT] [REF-RIG]

Promotion criterion is lower integration tax **and** equal-or-better failure-suite behavior, not aesthetic minimalism.

## 40.4 Runtime stack after AX + Intent

Freeze the execution ladder:

```text
Level 0  trusted resident host services
         aksarad / execd / hwd / updated

Level 1  Wasmtime/WIT capability
         tiny, narrow, explicit host surface

Level 2  Local Workspace Worker
         bounded normal OS task on one Node
         Intent-inspired local isolation / CoW

Level 3  WorkAgentRuntime / AX
         suspendable cluster actor computer
         Agent Substrate / gVisor/microVM / Kubernetes

Level 4  remote specialist sandbox/provider
         optional
```

The institutional workflow lives above every level. [REF-INTENT] [REF-AX] [REF-AGENT-SUBSTRATE]

Generated tool-composition code sits orthogonally to this ladder: Monty orchestrates already-governed capabilities and can suspend at host calls, while the actual effect still lands on Level 1/2/3 as appropriate. [REF-MONTY]

## 40.5 Interface stack after Intent + OpenMuse/OpenBot

Freeze semantics:

```text
institutional state
    ↓
Aksara Interface Contract
    ↓
ViewPrimitive / SurfaceState
    ↓
┌──────────────┬──────────────┬────────────┬──────────────┐
web/A2UI      AG-UI client   MatrixUI     prose channels
workspace     event/state     64×64        WhatsApp/email
```

Intent supplies the strongest reference for semantic, stateful, interactive diagrams. OpenMuse/OpenBot demonstrate that AG-UI can underpin polished agent workspaces and human takeover without becoming the visual language itself. [REF-INTENT-DIAGRAMS] [REF-OPENMUSE] [REF-OPENBOT]

## 40.6 Document and capability ingestion

```text
document ingest:
  pdf-inspector → DocumentParserPort {AnyDoc | MinerU | Docling} → local OCR/VLM by policy → optional D-RAC-style retrieval normalization → ID blocks/chunks → Memory Firewall

office editing:
  source artifact → Univer isolated worktree → inspect/edit/render/verify → candidate merge/promote

external capabilities:
  MCP Registry / Alexandria / optional Treg broker → local wrapper → Capability Registry → policy/lease

capability factory:
  source-backed app → CLI-Anything methodology → tests/schema/policy → signed Capability Pack
```

Original artifacts and local registry decisions remain canonical. [REF-ANYDOC] [REF-PDF-INSPECTOR] [REF-DRAC] [REF-UNIVER] [REF-ALEXANDRIA] [REF-TREG] [REF-CLI-ANYTHING]

## 40.7 Harness reproducibility

Borrow Intent's explicit harness/version snapshot idea and extend every consequential Aksara run with:

```text
cognition_profile_version
harness_name
harness_version / build_digest
model_execution_policy
policy_epoch
graph_pack_digests
capability_pack_digests
interface_schema_version
memory_backend_profile
```

This data belongs in execution/trace metadata and, where material to an institutional effect, is referenced by the Ledger receipt. [REF-INTENT]

## 40.8 Memory implementation profiles

The catalogue keeps the full memory design, but v0.6 separates **semantic capability** from **base operational requirement**. Sophisticated derived memory must beat the simpler baseline on real institutional tasks before becoming mandatory on deployed Nodes.

```text
P1 BASE
  SQLite/files authoritative
  Memory Firewall
  explicit approved facts / obligations / decisions
  timeline + FTS
  deterministic due-date/calendar activation

P1 MEASURED EXTENSIONS
  Graphiti + FalkorDB Lite
  Continuity Tree
  Trigger Index
  sqlite-vec/LanceDB
  compact decision scorers
  richer local OCR / document parsers

NODE+ / HOSTED EXPERIMENT
  Caura as derived fleet-memory backend
  AX + Agent Substrate
  hosted/regional model pool
```

The richer mechanisms remain first-class Aksara capabilities; they are not stripped from the design. Promotion criterion is measured improvement in time-to-correct-answer/outcome, continuity or useful proactive recall **without** regressions in unauthorized exposure, false confidence, latency or field operability. A Node can move between profiles without changing institutional object semantics.

---

# 41. v0.6 freeze decisions

1. **Aksara remains broader than workflow automation.** Institutional retrieval, memory, continuity, proactive context and coordination remain first-class; `WorkObject` becomes canonical only when work acquires ownership/state/decision/effect semantics.
2. The first product experience is intentionally focused: prove one repeated institutional loop end to end before treating breadth as validated.
3. Aksara supports software-only, Local Node, Node+room-presence and commons/federation deployment profiles. Hardware is important where local custody, compute, connectivity or shared access justify it, but is not mandatory everywhere.
4. `InstitutionActor`, `Tenant`, `TrustDomain`, `DataCustodian`, `StoragePlacement`, `GovernanceNamespace` and `Node` are distinct objects.
5. One institutional actor may contain multiple restricted trust domains; physical hosting does not transfer custodianship.
6. `SharingGrant` is the explicit cross-trust-domain exchange primitive; public federation is a separate disclosure path.
7. `OfflineAuthorityEnvelope` bounds offline action by time, policy epoch, data class, resource/version and action class; consequential commits revalidate freshness/authority.
8. Existing systems of record remain authoritative where deployed. Adapter state distinguishes prepared, approved, submitted and destination-accepted, with manual hand-off when no API exists.
9. Capability Packs may compose ODK, OpenFn, OpenSID, DHIS2, Mukurtu/Local Contexts and other mature systems instead of rebuilding them.
10. The base Node aims for a small operational surface: Rust institutional service/process group + one TS application/cognition service + SQLite/files + optional on-demand Python workers.
11. Capability implementations may remain polyglot behind stable ports; reducing the base operational surface does **not** remove Aksara capability breadth.
12. Vellum remains the current resident-cognition target. Hermes, Strands, MAF and PydanticAI keep their existing roles. The TS/Rust Aksara Minimal Loop is a benchmark baseline and escape hatch, not a framework purge.
13. P1 should operate one resident loop as the default production path. Other harnesses are adapters/bakeoff candidates rather than simultaneous co-sovereign runtimes.
14. SQLite/files + explicit approved facts/timeline + FTS form the minimum deployed memory profile. Graphiti, Continuity Tree, Trigger Index, vectors and compact scorers remain first-class measured extensions.
15. Derived memory mechanisms are promoted by measured utility/continuity/proactive recall and must not regress authorization, provenance, latency or field operability.
16. `WorkObject`, `WorkItem`, `WorkflowRun`, `Conversation` and `Receipt` remain separate concepts.
17. Frappe Helpdesk/Open311/Zammad-style case semantics and Chatwoot-style omnichannel intake are references/adapters, not authoritative Aksara state.
18. ETNOS may continue as an early parallel product surface, but ETNOS publishing alone is not treated as proof of the institutional runtime.
19. `GovernanceNamespace` remains the delegated social-governance object and stays orthogonal to Topics and server topology.
20. Federation grants reachability, not protected memory, tool authority or free inference.
21. Public ETNOS coordination and authenticated restricted institutional exchange remain separate planes.
22. The Node remains a meaningful sovereignty/continuity appliance for low-infrastructure deployments; in well-provisioned environments Aksara may use existing servers/cloud and web/phone interfaces.
23. The 64×64 display is for coarse communal state, turn-taking and privacy cues; dense/private work remains on personal or larger surfaces.
24. Fingerprint and KVM move out of the ordinary P1 BOM into separately approved experiments until user value and threat review justify them.
25. Node theft/seizure, TPM-bound vaults, verified boot/update, immutable backup and recovery custodians remain P1 hardening requirements for production-shaped Node pilots.
26. Voice remains a major adoption workstream: Qwen3-ASR/local Indonesian TTS/Nemotron diarization and cloud speech all remain behind measurable privacy/room/noise acceptance criteria.
27. `EgressPolicy` treats LLM, OCR/VLM, ASR, Live and TTS as data processors; provider terms never override audience/room privacy.
28. `InferenceAdmission`, `ComputeBudget` and UsageLedger remain canonical so public/federated access cannot create unbounded provider spend.
29. `DocumentParserPort` remains replaceable; MinerU, AnyDoc/pdf-inspector, Docling and other parsers are benchmarked on Aksara documents.
30. Simulator remains a real-contract integration and failure-rehearsal tool; actual users/institutions provide product validation.
31. Product metrics include knowledge utility and institutional continuity in addition to closed work, trust, robustness and economics.
32. Low-bandwidth mesh/store-and-forward transport remains a future `TransportPort` research direction; it carries compact signed coordination envelopes, not model traffic or large documents.
33. “Freeze” continues to mean semantic invariants and stable ports, not permanent commitment to every current dependency.
34. Workstation Bridge is a first-class capability profile. Prefer API/CLI, then deterministic browser control, then AI-assisted browser control, autonomous browser workers, hosted browser handoff, and finally KVM/native control.
35. Playwright/Playwright MCP is the deterministic browser baseline; Stagehand v4 is the high-priority AI-assisted browser-control spike because it can sit behind Aksara's own harness/policy and replay validated actions without new inference.
36. Browser-use and Skyvern are bounded autonomous-browser benchmarks, not default owners of institutional browser state. Steel/Browserbase are optional browser infrastructure for hosted/regional profiles.
37. PiKVM is the preferred KVM substrate/reference. KVM remains active research for legacy/native software and instruments but does not return to the ordinary base BOM until value is measured.
38. Vellum remains the default resident-assistant hypothesis. Strands remains the SDK challenger. Flue is promoted to a serious durability/session bakeoff candidate, but its conversation durability does not replace institutional WorkObject/workflow truth or external-effect reconciliation.
39. OpenHands Software Agent SDK/Agent Server is evaluated as a WorkAgentRuntime implementation for software/research workers rather than as the resident room assistant.
40. `GovernanceLifecycle` cases include custodian succession, disputed authority, membership changes, splits/reorganisation, withdrawal, sponsor exit and separate research/model-training permissions.
41. Mukurtu/Local Contexts are concrete community-governance integration references. Aksara should investigate a Local Contexts integration-partner path before inventing proprietary equivalents to TK/BC Labels/Notices.
42. Guardian Connector and CoMapeo are high-priority integration/partnership references for community/field deployments. Aksara does not rebuild their field-data/mapping functions merely to own the full stack.
43. Education profiles integrate Kolibri/MoodleBox-class offline learning infrastructure where useful; cooperative profiles evaluate ERPNext/Frappe rather than rebuilding inventory/accounting.
44. Conservation profiles integrate existing SMART/EarthRanger/Guardian/CoMapeo ecosystems; Aksara contributes governed intelligence, memory, coordination and cross-system action around them.
45. `Observation` becomes a first-class contract distinct from a WoT device capability. Measurement, interpretation, proposed response and authorised actuation stay separate.
46. Home Assistant + ESPHome + Wyoming and Fledge are subsystem candidates for different device profiles; Aksara does not operate a second conflicting device-automation truth.
47. Research Station capabilities integrate mature instrument/workflow systems such as Bluesky/Ophyd/labgrid rather than rebuilding experiment orchestration.
48. Debian/systemd remains the P1 appliance baseline. LF Edge EVE/balenaOS are operations/fleet bakeoff candidates once deployment scale makes that complexity worth measuring.
49. Current status precedence is §41 → §26A → §26 → newer section-specific status → historical freeze sections. Historical rationale remains readable but cannot mandate obsolete dependencies.
50. The catalogue is a **living ground truth**: radar discoveries enter a candidate ledger first and move into current component choices only after verification/fixture review.
51. Scheduled radar runs may read the latest Library catalogue and emit a `Catalogue Delta`, but they do not autonomously overwrite the canonical catalogue.
52. Monty v1.0.0 is now the upstream programmatic-tool runtime target; release maturity strengthens, but does not replace, Aksara's sandbox/authority fixtures.
53. `any`/any-sync/anyrt is a serious local-first consolidation bakeoff; SQLite/files remain the P1 authoritative baseline until partition/ACL/export/recovery tests pass.
54. OpenConnector is the default generic-SaaS integration spike before new handwritten OAuth connector work.
55. `mcp-gateway-registry` + AGNTCY/OASF must be evaluated before Aksara invents a proprietary combined MCP/A2A/skill/inference directory/control plane.
56. smolvm is evaluated for local heavy-worker isolation; it never owns leases, credentials, artifact promotion or institutional effects.
57. MOSS-Transcribe-Diarize joins Qwen3-ASR + Nemotron in the same speech corpus bakeoff; model-count reduction is valuable only if local-language accuracy and deployability hold.
58. Expressive TTS is a tiered open search: CPU privacy floor, Node/Node+ local expressive quality and Gateway/cloud quality. VoxCPM2 is an active Node+ candidate, not the permanent search boundary.
59. K2 Horizon small models join the local-cognition bakeoff; official benchmark claims remain screening evidence until reproduced on Aksara hardware/tasks.
60. TabDPT/TabICLv2 and FoundationForecast/Granite-TS enter scientific/government/cooperative capability evaluation; classical baselines remain required comparisons.
61. Wi-Fi HaLow/OpenMANET is the current medium-bandwidth mesh watch candidate between ordinary IP and LoRa-class degraded transport; regulatory/link-budget/power tests precede any field promotion.
62. Flint and GeoLibre are UI/science code-donor/adaptor candidates, not new sources of institutional truth.

---

# 42. v0.5.1 → v0.6.0 product/deployment consolidation

v0.6 does not narrow Aksara into a ticketing/workflow product and does not remove the existing harness or capability research. It changes what must be present in the **base deployment** and clarifies which concepts are product semantics versus optional machinery.

Main changes:

- adds a product/deployment contract before the component architecture;
- treats institutional second-brain behavior and accountable work as complementary rather than interchangeable;
- makes `WorkObject` the operational envelope for consequential/owned work, not the container for every conversation;
- adds `TrustDomain`, `DataCustodian`, `StoragePlacement`, `SharingGrant` and `OfflineAuthorityEnvelope`;
- separates public institution identity from tenant, custody, storage and device topology;
- defines software-only, Node, Node+room and commons/federation deployment profiles;
- reduces the always-on P1 operational surface while retaining the polyglot capability ecosystem behind stable ports;
- keeps Vellum, Hermes, Strands, MAF and PydanticAI and reframes the bespoke loops as measured baselines rather than replacements;
- makes mature operational systems and adapters a first-class source of leverage;
- introduces a concrete WorkObject/WorkItem/receipt grammar and destination-system reconciliation;
- moves Graphiti/Continuity/Trigger/vector mechanisms from mandatory base profile to measured extensions without removing them from Aksara;
- allows ETNOS work to continue in parallel while requiring an internal institutional loop as the proof of the runtime;
- moves fingerprint/KVM out of the ordinary P1 BOM while preserving the Node's local-compute/custody/presence role;
- preserves a future low-bandwidth store-and-forward transport port without making mesh radio a P1 dependency;
- expands evaluation to knowledge utility, continuity, operational outcomes, trust, robustness and fully loaded economics.

The resulting implementation posture is **broad institutional-intelligence scope, focused product surfaces, a small base deployment, replaceable borrowed machinery, and deployment profiles matched to local infrastructure**.

---

# 43. v0.6.0 → v0.6.1 north-star, vertical and computer-use consolidation

v0.6.1 keeps v0.6.0 as the architectural base and incorporates the North Star review only where research and current project evidence support the addition. It does not remove the existing government, memory, harness, Node or capability architecture.

Main additions:

- adds current-decision precedence so historical freeze tables cannot accidentally become cumulative requirements;
- formalizes Place/Presence experience modes without turning them into new ontology;
- adds community governance lifecycle and host/root truthfulness to TrustDomain semantics;
- makes browser/computer use a full Workstation Bridge profile with Playwright, Stagehand, optional autonomous browser backends and PiKVM/KVM escalation;
- promotes Flue to the resident-session/durability bakeoff while preserving Vellum as current default and Strands/minimal loops as challengers;
- promotes OpenHands as a WorkAgentRuntime candidate rather than a resident assistant;
- expands vertical strategy around mature systems: Guardian Connector/CoMapeo/Mukurtu/Local Contexts, Kolibri/MoodleBox, ERPNext, government systems, health systems, SMART/EarthRanger and research instrumentation;
- adds an Observation/Actuation contract and separate room-device vs field-sensor subsystem profiles;
- keeps Debian/systemd as the P1 appliance baseline while preserving LF Edge EVE/balenaOS as later fleet-management bakeoffs;
- adds workstation/observation/governance acceptance tests and parallel integration spikes;
- preserves government deployments as one vertical and interoperability partner rather than making them the identity of Aksara.

The consolidated implementation posture remains: **broad institutional/community intelligence, small trusted base, mature domain systems reused where they already work, and Aksara-specific ownership concentrated in custody, memory, authority, presence, coordination and accountable action.**

---

# 44. v0.6.1 → v0.6.2 living-radar consolidation

v0.6.2 incorporates the first full blind-horizon Radar pass without turning every discovery into a dependency. The main change is procedural: the catalogue now has an explicit **candidate lifecycle** so new OSS/models/hardware can remain visible, comparable and source-pinned without destabilizing the current P1 stack each day.

Material changes:

- verifies Monty v1.0.0 and corrects the earlier stale-index false negative;
- adds `any`/any-sync/anyrt as a potentially major local-first state/sync/search/runtime consolidation bakeoff while keeping SQLite/files authoritative for P1;
- adds smolvm to the local-workspace isolation bakeoff;
- adds OpenConnector before further generic OAuth connector work;
- adds mcp-gateway-registry + AGNTCY/OASF to the Gateway/Capability Registry/A2A discovery consolidation study;
- expands Workstation Bridge with OS-accessibility automation as a layer before KVM;
- expands speech to MOSS-Transcribe-Diarize and a tiered, permanently open Indonesian/Malay expressive-TTS search with VoxCPM2 as a Node+ reference;
- adds K2 Horizon small cognition models, tabular FMs, a time-series model substrate and compact scientific-model watch entries;
- adds OpenMANET/Wi-Fi HaLow as the medium-bandwidth mesh transport candidate;
- adds Flint and GeoLibre as reusable UI/science substrates;
- adds JetKVM Mini and AMD/Lemonade as hardware/runtime watch items;
- formalizes a living candidate ledger for future daily Radar deltas.

## 44.1 Radar candidate lifecycle

```text
DISCOVERED
  → VERIFIED
  → WATCH / CODE DONOR / ADAPTER / PARTNER / SPIKE / BAKEOFF
  → fixture + ownership-cost evidence
  → PROMOTE into current component register
       or
     DOWNGRADE / REMOVE
```

A daily report is not an architecture decision. The Radar's scheduled output provides merge-ready `Catalogue Delta` rows; a deliberate catalogue pass performs promotions/downgrades.

## 44.2 Living Radar Candidate Ledger

**Last consolidated:** 2 October 2026.  
This table is deliberately compact. Detailed rationale belongs in the relevant section once a candidate is promoted.

| Area | Candidate | Current status | Tier / likely fit | Deciding test / reason to keep | Last reviewed |
|---|---|---|---|---|---|
| local-first state/sync | `any` / any-store / any-sync / anyrt | **BAKEOFF** | P1 substrate candidate | two-node partition + ACL/revocation + search + export/restore + ops footprint | 2026-09-26 [REF-ANY] [REF-ANY-SYNC] |
| gateway/registry | mcp-gateway-registry | **BAKEOFF** | Gateway / regional | inference+MCP+A2A+REST, per-user auth, audit, egress fixture | 2026-09-26 [REF-MCP-GATEWAY-REGISTRY] |
| agent/capability discovery | AGNTCY / OASF Directory | **DESIGN REFERENCE / BAKEOFF** | ETNOS/A2A/Gateway | map Aksara public capability metadata to OASF + federation/provenance test | 2026-09-26 [REF-AGNTCY] |
| local worker isolation | smolvm | **BAKEOFF** | P1 heavy-worker backend | lifecycle/network/artifact fixture vs current bounded worker | 2026-09-26 [REF-SMOLVM] |
| SaaS connectors | OpenConnector | **HIGH-PRIORITY SPIKE** | Gateway/CLI/capabilities | one OAuth read/write provider + policy + receipt integration | 2026-09-26 [REF-OPENCONNECTOR] |
| native computer use | agent-desktop | **CODE DONOR / WATCH** | Workstation Bridge | Linux support + accessibility/ref-action fixture | 2026-09-26 [REF-AGENT-DESKTOP] |
| programmatic tool runtime | Monty v1.x | **PROTOTYPE / PRIMARY CANDIDATE** | P1 | Aksara code-mode/failure/authority suite | 2026-09-26 [REF-MONTY] |
| capability sandbox | Wasmtime v49.x | **ADOPT / SECURITY-PINNED** | P1 | approved-version regression suite and security review | 2026-09-26 [REF-WASMTIME] |
| speech ASR+diarization | MOSS-Transcribe-Diarize 0.9B | **BAKEOFF** | Node+/Gateway; maybe P1 depending runtime | Aksara Indonesian/Papuan Malay room corpus vs Qwen3-ASR+Nemotron | 2026-09-26 [REF-MOSS-TRANSCRIBE] |
| expressive local TTS | VoxCPM2 2B | **EVALUATE** | Node+/GPU | ID/MS naturalness + VRAM/RTF/latency + long-form stability | 2026-09-26 [REF-VOXCPM2] |
| expressive local TTS | future compact open Indonesian/Malay models | **PERMANENT SEARCH LANE** | CPU P1 / Node / Node+ | same corpus; minimize compute without losing intelligibility/naturalness | 2026-09-26 |
| small local cognition | K2 Horizon 0.9B/3.7B/7B | **BAKEOFF** | Edge/P1/Node+ by size | tool-use/reasoning/latency/RAM vs current Qwen/Gemma family | 2026-09-26 [REF-K2-HORIZON] |
| tabular foundation model | TabDPT v1.3 | **EVALUATE** | government/cooperative/science | accuracy/calibration/latency/RAM vs CatBoost/LightGBM | 2026-09-26 [REF-TABDPT] |
| tabular foundation model | TabICLv2 | **EVALUATE + LICENSE REVIEW** | government/cooperative/science | same benchmark + production-license verification | 2026-09-26 [REF-TABICLV2] |
| time-series substrate | FoundationForecast / TimeCopilot | **SPIKE / CODE DONOR** | science/field/operations | unified-model adapter usefulness + dependency/VRAM management | 2026-09-26 [REF-FOUNDATIONFORECAST] |
| time-series model | Granite PatchTST-FM-r2 | **EVALUATE** | Node+/Gateway/science | local hydrology/power/operations datasets vs TimesFM/TTM/classical | 2026-09-26 [REF-GRANITE-TS-R2] |
| genomics | Carbon 500M/3B/8B | **WATCH** | Aksara Science | license/compute + a real genomics research question/partner | 2026-09-26 [REF-CARBON-DNA] |
| world-action/robotics | FLUX 3 Action 7B | **WATCH** | Research Station | license + LeRobot/simulator task; not base Node | 2026-09-26 [REF-FLUX3-ACTION] |
| generated visualization | Microsoft Flint | **SPIKE / CODE DONOR** | Aksara/Klerk/web/office | typed metric→chart→editable artifact fixture | 2026-09-26 [REF-FLINT] |
| local/private GIS | GeoLibre | **SPIKE / ADAPTER** | field/science/ETNOS maps | CoMapeo/Guardian artifact → local analysis → reviewed public projection | 2026-09-26 [REF-GEOLIBRE] |
| medium-bandwidth mesh | OpenMANET / Wi-Fi HaLow | **WATCH → FIELD PROTOTYPE** | future TransportPort | Indonesia regulatory + range/power/BOM/throughput test | 2026-09-26 [REF-OPENMANET] |
| KVM hardware | JetKVM Mini | **WATCH** | optional Workstation Bridge | wait for shipping; compare security/latency/repairability to PiKVM | 2026-09-26 [REF-JETKVM-MINI] |
| Node+ AMD runtime | Lemonade | **WATCH / BAKEOFF** | Node+ local inference | pinned-version stability + AMD unified-memory throughput/economics | 2026-09-26 [REF-LEMONADE] |
| MCU inference pattern | ESP32-AI flash/table architecture | **CODE-DONOR WATCH** | Edge/MCU | reproduce useful bounded classifier/embedding rather than tiny chat | 2026-09-26 [REF-ESP32-AI] |
| air-gap transfer | Decimen optical transfer | **LOW-PRIORITY WATCH** | provisioning/recovery | only promote for a concrete air-gap/bootstrap requirement | 2026-09-26 [REF-DECIMEN] |
| institutional multiplayer shell | Supermemory Company Brain | **HIGH-PRIORITY CODE DONOR / BAKEOFF** | software-first institutional/channel shell | map memory scopes, proactive triage, approvals/leases and restart behavior to Aksara semantics without importing cloud-first authority | 2026-09-27 [REF-COMPANY-BRAIN] |
| Card firmware/runtime | Xiaozhi ESP32 | **PRIMARY CODE DONOR / PROTOTYPE** | Aksara Card | fork transport/device runtime; prove Node/Gateway handoff, wake/VAD/audio/display/camera/privacy contract | 2026-09-27 [REF-XIAOZHI] |
| Card prototype core | XIAO ESP32-S3 Sense | **P0/P1 PROTOTYPE BOARD** | Card | integrated prototype with display/speaker/haptic/NFC; measure battery/RF/audio/camera/storage | 2026-09-27 [REF-XIAO-SENSE] |
| wearable hardware | Omi open hardware | **HARDWARE / INDUSTRIALIZATION DONOR** | future custom Card | reuse RF/battery/charging/mechanical/production-test lessons; no need to copy product semantics | 2026-09-27 [REF-OMI-HW] |
| wearable audio/storage | reSpeaker Clip | **CODE DONOR / HARDWARE REFERENCE** | Card capture/audio | reuse Zephyr/audio/storage/DFU/power patterns; compare battery and local-buffer behavior | 2026-09-27 [REF-RESPEAKER-CLIP] |
| Card interaction | FoloToy AI Passport | **UI/INTERACTION REFERENCE** | Card | retain badge/display/NFC lessons; no longer primary architecture due compute/storage constraints | 2026-09-27 [REF-FOLOTOY-PASSPORT] |
| institutional email | Cloudflare Email Service/Workers | **SPIKE / CHANNEL ADAPTER** | hosted/managed-domain deployments | inbound attachment + threaded task + outbound reply fixture under IdentityBinding/EgressPolicy | 2026-09-27 [REF-CF-EMAIL] |

---

# 45. v0.7 freeze decisions

These decisions supersede conflicting physical/social assumptions in older sections while leaving the v0.6 kernel/security/runtime decisions intact.

1. **Node remains Node.** Do not rename the compute/custody appliance into a new product ontology merely to describe different form factors.
2. **Card becomes the universal portable physical primitive.** It is principal-bound and useful in both low-infrastructure and digitally mature deployments.
3. Dedicated Node hardware remains optional where existing compute/storage/network infrastructure already provides the required local guarantees.
4. Node is communal; Card is principal-bound. Neither surface creates authority beyond the current `AccessContext`/leases.
5. P1 Node keeps the refurbished/serviceable x86 Tiny/Mini/Micro + 32 GB baseline + 64×64 HUB75 + modular audio direction.
6. The Node Controller becomes an explicit independent MCU boundary for physical presence, privacy state, Card/NFC handshake, watchdog/power and bounded instant feedback; it is not another agent runtime.
7. 64×64 HUB75 remains the P1 communal display. E-paper/RLCD stays a future front/variant; the Interface Contract/Presence Grammar remains display independent.
8. The Node is designed for power-cut tolerance and local serviceability, not routine physical portability between rooms. Human mobility comes from Card/phone/web/channels.
9. Card P0/P1 prototypes use XIAO ESP32-S3 Sense + Xiaozhi-derived firmware unless a clearly better current substrate wins the same fixture.
10. A future custom Card should borrow hardware/industrialization patterns from Omi, audio/storage/power patterns from reSpeaker Clip and interaction lessons from FoloToy rather than wholesale-adopting one product.
11. Card target capabilities are mic, speaker, small display, haptic, button, BLE/Wi-Fi, NFC, local queue/storage, device identity, physical privacy controls and optional explicit still-image capture. A local general-purpose LLM is not required.
12. The current Card electronics BOM target is ≤ Rp500k at modest production volume if it can be met without compromising privacy/RF/audio/reliability; it is not a retail-price promise.
13. Microphone and camera privacy should have hardware-enforced/physically legible controls. Passive always-on Card camera/lifelogging is not a P1 requirement.
14. `GatheringSession` is a temporary session profile over existing lane/context/lease semantics, not a new root of institutional authority.
15. One physical gathering has one elected primary capture source by default, expressed as a scoped `capture.audio` Capability Lease. Nearby Cards do not automatically duplicate the room stream.
16. Proximity/co-presence may propose a gathering or useful context but never grants recording consent, identity or memory persistence.
17. Aksara social roles (scribe/facilitator/researcher/witness/translator/coordinator/observer) are interaction policies with different proactivity thresholds, not autonomous authorities.
18. Physical proactivity follows an attention ladder; private haptic or shared visual cues should often precede verbal interruption.
19. Simple physical/session controls use a bounded fast path and must not wait on the heavy resident model when deterministic handling is sufficient.
20. Live transcript, canonical post-session transcript and approved institutional memory/work remain distinct stages.
21. Addendum G's stable outcome is the two-lane pattern: replaceable realtime voice front + governed asynchronous institutional backend. LiveKit/Pipecat/provider choice remains a bakeoff.
22. Supermemory Company Brain is a high-priority code donor/bakeoff for the multi-user institutional interaction shell: channel/thread context, scoped memory UX, approvals, proactive triage, scheduled work and temporary capability use. It does not replace Aksara kernel/memory authority/Temporal/Flue/Vellum semantics.
23. Channel proactivity must support silence/PASS as a first-class outcome; an agent that replies to every group message is a product failure.
24. Each deployment may expose a stable email address as a first-class channel. Email/ETNOS/A2A/WhatsApp/web/Card are bindings to one `InstitutionActor`, not independent institutional identities.
25. Existing institutional email/domain infrastructure is preferred when available; managed Aksara/ETNOS subdomain mail may use a replaceable programmable mail adapter.
26. Card, Node, phone/web, messaging, email and ETNOS are surfaces/channels for the same institutional Aksara. No one surface owns canonical memory.
27. Historical v0.7 precedence was §54 → §45 → §41 → §26A → §26; v0.8.1 supersedes this with the §2A order led by §55.

---

# 46. v0.6.2 → v0.7.0 physical/social/multiplayer consolidation

v0.7.0 consolidates the September 27 product-interaction pass without changing Aksara into a hardware-only product or a generic enterprise chat agent.

Main changes:

- promotes Card from temporary onboarding surrogate to the universal principal-bound physical Aksara surface;
- keeps Node as the communal compute/custody appliance and retains the 64×64 P1 direction;
- introduces an explicit Node Controller hardware boundary so physical privacy/presence/power behavior does not depend on Linux/model responsiveness;
- defines the Card donor stack: Xiaozhi + XIAO ESP32-S3 Sense prototype, Omi industrialization donor, reSpeaker Clip audio/storage/power donor and FoloToy UI reference;
- adds Card privacy/capture/cost/loss contracts and a replaceable Node/Gateway/offline execution path;
- formalizes `GatheringSession`, social-role profiles, one-source `capture.audio` leases and the physical attention/proactivity ladder;
- moves the low-latency voice lesson from Addendum G into the main contract: deterministic fast path, immediate truthful acknowledgment, asynchronous deep work and separate live/canonical/memory stages;
- adds Supermemory Company Brain as a high-priority institutional multiplayer/channel-shell code donor while preserving Aksara identity/memory/authority/effect semantics;
- makes deployment email a first-class optional channel tied to `InstitutionActor`;
- adds build/acceptance fixtures so these concepts can be validated before custom Card PCB or deeper Company Brain reuse.

The resulting product direction is intentionally simple: **Aksara may run on existing infrastructure or a local Node; the Card is the portable principal surface; the same institutional intelligence continues across physical, web, messaging, email and federated channels under one governed identity/state model.**

---


# 47. v0.8 cognition architecture: heterogeneous intelligence, bounded decisions and authority separation

The post-v0.7 Radar makes one architectural point strong enough to promote: **Aksara cognition is deliberately heterogeneous.** A generative resident model is not the default computational primitive for every decision. Deterministic logic, tiny bounded models, non-generative decision/scoring models, specialist models and large language models occupy different cost/latency/risk tiers.

```text
deterministic rules / typed code
        ↓
tiny bounded inference (Needle-class)
        ↓
non-generative decision/scoring (Decider/Jev-class)
        ↓
small resident language model
        ↓
specialist model (speech/vision/time-series/science)
        ↓
large local / Gateway cognition
```

The governing invariant is **inference is not authority**. A model may classify intent, rank a capability, estimate risk or recommend escalation; only the institutional kernel may resolve principal, policy, mandate, lease, approval and effect authority. Confidence may cause escalation but never self-grant privilege.

## 47.1 System-One candidate lane

- **Strands Decider 2B — HIGH-PRIORITY SPIKE / ADOPT CANDIDATE.** Non-generative explicit-choice decision architecture. Test capability routing, local-vs-Gateway routing, parser selection, memory-write proposals, approval classification and argument checks on an Aksara-owned labelled corpus. Promotion requires calibration as well as accuracy and must preserve the authority boundary.
- **Needle / Cactus Compute — EDGE SYSTEM-ONE SPIKE.** Tiny function/tool-selection model candidate for Card/Edge/low-power devices. It may emit a typed capability *request* only; it never authorizes execution.
- **Jev-like typed scorers — KEEP OPEN CONTRACT.** Do not couple the `decision.score` contract to one model family. Conventional classifiers, compact transformers, pointer models and deterministic scorers compete on the same fixture.
- **ASSERT / Agent Control Specification — CODE DONOR / POLICY-EVAL ABI REFERENCE.** Useful for deterministic fail-closed verdict/evaluation semantics; it does not own Aksara authority, identity, approvals or backend authorization.

## 47.2 Model Ecology register

The model catalogue is explicitly broader than chat LLMs. Radar and bakeoffs should classify candidates into: **language/cognition; System-One/bounded; retrieval/memory; speech/audio; perception/world; time-series/signals; scientific/specialist; tiny/embedded**. A model enters the main register only when a concrete capability/profile and deciding fixture exist.

K2 Horizon remains a model candidate but gains a second role as a **MODEL-RESEARCH SUBSTRATE / CODE+DATA DONOR** because staged checkpoints/training artifacts can support Abstraksi-native small-model experiments. Xing4.0-29B-A4B remains a **Node+/Gateway sparse-model SPIKE/WATCH**, not a P1 default. Holo4-27B remains **BENCHMARK/CODE-DONOR ONLY** while its non-commercial licensing blocks normal production adoption. Naive-N0.5-Flash remains **Gateway WATCH** because its footprint/runtime maturity does not fit Node deployment.

---

# 48. v0.8 harness, execution and enforcement separation

The Radar strengthens a separation already implicit in §§7, 10, 11 and 11A:

```text
institutional kernel / authority
          ↓ CapabilityLease
resident or work harness
          ↓
execution runtime
          ↓
enforcement boundary
          ↓
OS / network / credentials / external system
```

**Harness != authority != durable workflow != execution != enforcement.** Temporal remains the durable institutional-work substrate. Wasmtime/WIT remains the narrow bounded-capability sandbox. Local Workspace / WorkAgentRuntime remains the richer workspace class.

- **Mecatl — BAKEOFF + CODE DONOR** against Vellum/Strands/minimal loop. Its importable engine, externalized state, durable events, locks/permissions, identity-on-action and observability are unusually aligned with Aksara's non-sovereign harness contract. Use the same institutional-turn failure fixture; reject any path that makes Mecatl canonical institutional state.
- **TrueForge — BAKEOFF + CODE DONOR.** Broad local-first harness reference spanning MCP, skills, sandboxing, approvals, persistence, subagents and generative UI. Useful only if Aksara can keep semantics/authority outside it.
- **SandBase Harness — WATCH / CODE DONOR.** Local SQLite/files, credentials, sandbox, MCP and audit/replay patterns; not a production owner yet.
- **Atomic Agent — BAKEOFF + CODE DONOR.** Useful thin local-first TS reference for tools/skills/scheduling/approvals/traces/replay. Telemetry, environment inheritance and isolation must be tested rather than assumed.
- **NVIDIA OpenShell — WORKSPACE ENFORCEMENT SPIKE / BAKEOFF.** Candidate enforcement layer for rich autonomous workspaces: filesystem/syscall/network policy and destination-scoped credential injection. It complements rather than replaces Wasmtime.
- **smolvm — KEEP BAKEOFF** as a microVM-class local-workspace backend.
- **OpenHands WorkAgentRuntime — KEEP CANDIDATE** for heavyweight autonomous work; it does not replace resident cognition or Temporal.

Security fixture: one identical rich-worker task must exercise destination allow/deny, credential scoping, filesystem escape, subprocess limits, cancellation, crash/restart, artifact export, network egress and receipt reconstruction across candidate backends.

---

# 49. v0.8 External System Bridges: browser, workstation, phone, instruments and KVM

`WorkstationBridgeRuntime` in §11A remains stable. v0.8 generalizes the pattern without renaming the existing contract:

```text
External System Bridge family
├── Browser / Workstation Bridge
├── Phone Bridge
├── Instrument Bridge
└── KVM / raw HID+pixel fallback
```

All bridges preserve **observe → prepare → preview/approve → act → reconcile**, with credentials/session state separate from institutional memory.

## 49.1 Phone Bridge

A phone is both a surface and a governed actuator. Candidate capabilities include app/UI observation, notifications, camera/mic/sensors, location when explicitly permitted, SMS/calls, calendar, maps, Wi-Fi/Bluetooth and approved messaging actions.

**FoneClaw — CODE DONOR / ADAPTER REFERENCE.** Its Android Accessibility/UI-tree and risk-graded action patterns make it useful for defining `phone.observe.*`, `phone.act.*`, `phone.communicate.*` and `phone.configure.*`. It is young and must not receive ambient Accessibility authority. Every effectful action remains lease-scoped and reconcilable.

## 49.2 Computer/browser candidates retained

Playwright remains deterministic baseline; Stagehand remains AI-assisted hands; browser-use/Skyvern remain autonomous-browser benchmarks; Steel/Browserbase remain optional infrastructure; agent-desktop remains OS-accessibility code donor; PiKVM/JetKVM remain KVM references. Holo4-class computer-use VLMs are perception/planning benchmarks, never authorization layers.

---

# 50. Aksara Science: domain product and evidence lifecycle

Aksara Science is promoted from scattered vertical/model candidates into an explicit **domain-product candidate** over the same Aksara kernel. It may ship as a standalone collaborative workbench, a managed institutional deployment, and/or a surface exposed through external assistants and app/plugin ecosystems. It does **not** create a second authority/memory system.

```text
question / field observation / literature
        ↓
evidence acquisition + provenance
        ↓
research workspace (Python/R/GIS/notebook/remote compute)
        ↓
specialist models + instruments + mature scientific software
        ↓
analysis / experiment / reviewer
        ↓
Evidence Package
(code · data · environment · model · run · artifact · review)
        ↓
approved institutional memory / ETNOS / publication
```

The product experience should make the **research object**, not the chat transcript, persistent. A useful default workspace combines literature/dataset discovery, research graph, open questions, mathematical/structural motifs, hypotheses, experiments, code/notebooks, collaborators, instruments/sensors, evidence packages, reviews and publication state. Chat and agents are interfaces into that workspace rather than the workspace itself.

Aksara Science is currently the clearest commercial wedge because it can absorb commodity frontier capabilities while retaining differentiated value in collaborative scientific state, provenance, long-running work, instrumentation, field data and publication.

- **AIPOCH Open-Science — SPIKE / CODE DONOR / COMPETITOR.** Study its local-first scientific workspace, Python/R, remote compute, connectors, specialists, immutable artifacts/provenance and portable research packages. It is a workbench reference, not institutional authority.
- **Wisp Science — UX/WORKBENCH REFERENCE / SECONDARY CODE STUDY.** Retain differentiated patterns; do not duplicate AIPOCH functionality merely because both exist.
- **Paper2Agent — CODE DONOR / SPIKE.** Literature/repository → tested MCP/skill conversion is a strong candidate pattern for verified scientific Capability Packs.
- **Evidence Capsule / Evidence Package — PROMOTE AS PROFILE CONTRACT.** A research result intended for institutional reuse should retain source identity, code/config, environment, model/runtime version, input hashes, execution claims, artifacts and reviewer/verification evidence.

## 50.1 Specialist-model watch

Keep compact candidates until a real research question exists: **HyperSAM** (hyperspectral/EO), **TerraNova** (mixed Earth/societal representation research), **Carbon DNA** (genomics), tabular FMs, time-series FMs, robotics/world-action models, ecology/agriculture, chemistry/materials, microscopy/spectroscopy and scientific retrieval. Specialist models are Capability Pack substrates, not additions to resident cognition by default.

---

# 51. v0.8 speech/audio deployment tiers

Speech is split by deployment economics rather than one universal model:

| Tier | Goal | Current candidates |
|---|---|---|
| P1 CPU / offline privacy floor | intelligible local speech with WAN absent | **Pocket-TTS Indonesian — HIGH-PRIORITY SPIKE**; compact ASR/VAD/endpointing |
| Node / Node+ local quality | richer expressive local speech | VoxCPM2; Qwen3-TTS 0.6B Indonesian; FireRedTTS3; Fun-ASR-MLT-Nano; MOSS |
| Gateway / specialist | highest quality / unified audio / heavy models | FireRedAudio-class models and replaceable providers |

**Pocket-TTS Indonesian** is promoted from the permanent-search lane into the leading P1 CPU experiment; measure RTF, RSS, cold start, first-audio latency, intelligibility and failure cases on Indonesian + Papuan Malay/code-switch material. **Qwen3-TTS Indonesian** remains experimental due small ecosystem. **FireRedTTS3** remains Node+/Gateway bakeoff. **Fun-ASR-MLT-Nano** joins the multilingual ASR bakeoff. **FireRedAudio** remains Science/Gateway watch.

The **Breeze low-resource speech evaluation methodology** is retained as a CODE DONOR for a Mee/Papuan-language speech benchmark: curated paired speech, normalized reference text, automatic recognition metrics and human pronunciation/naturalness review.

---

# 52. v0.8 interface protocol stack and institutional UI grammar

§19 remains authoritative but the post-v0.7 evidence sharpens the layering:

```text
Aksara institutional state / WorkObjects / approvals
        ↓
AG-UI-class event + state transport
        ↓
A2UI-class declarative generated view when needed
        ↓
trusted Aksara renderer + component grammar
        ↓
web · mobile · desktop · room · embedded
```

- **AG-UI 1.0 — SPIKE / ADOPT CANDIDATE** for agent↔surface event/state transport. It does not define Aksara authority or institutional ontology.
- **A2UI — KEEP constrained adoption** for generated/declarative views.
- **AGenUI — ADAPTER / SPIKE** for native/mobile A2UI rendering.
- **OpenUI — BAKEOFF**, only if it beats A2UI on the same payload/latency/token/custom-component fixture.
- **Tambo — CODE DONOR / WATCH** for typed trusted component registration and streaming props.
- **Microsoft Flint — KEEP SPIKE/CODE DONOR** for deterministic editable visualization artifacts.

Generated UI output is data. It cannot introduce executable code, grant capability, weaken an approval or hide the destination/data/credential/effect/duration delta of a consequential action.

---

# 53. v0.8 networking, provenance, memory and supply-chain refinements

## 53.1 Network capability tiers

OpenMANET/Wi-Fi HaLow is retained and strengthened by practical HaLow hardware such as the **Morse Micro MM8108 USB class**. Treat radios as different capability envelopes rather than interchangeable transports: LAN/Ethernet/Wi-Fi for local high bandwidth; HaLow for longer-range medium-bandwidth institutional links; LoRa/LoRaWAN/Meshtastic-class links for low-bandwidth telemetry/events; mesh for degraded/community operation. Indonesia certification, power, range, throughput and repairability remain deciding constraints.

**ClusterShell — WATCH / OPERATOR TOOL / CODE DONOR** for small fleets of Linux Nodes where SSH/systemd fan-out/gather is enough and Kubernetes would be unnecessary complexity.

## 53.2 Evidence-first memory

The JAM research pattern strengthens, rather than replaces, the existing memory architecture: preserve governed source evidence cheaply; persist approved institutional facts deliberately; construct expensive query-specific context when needed. Do not eagerly summarize every experience into permanent semantic memory. SQLite/files/FTS remains the floor; Graphiti/TMem/learned retrieval remain measured extensions.

## 53.3 Technical provenance receipts

Institutional receipt semantics extend to technical production. CI/build/deploy systems should emit compact durable evidence independent of vendor UI retention: source/commit hash, workflow/config hash, dependency lock hash, test result, artifact/model digest, build environment, actor, deployment target, timestamp and outcome. GitHub Actions or another CI UI is not the canonical long-term provenance store.

## 53.4 Package/supply-chain practice

Use short-lived workload identity/OIDC trusted publishing for future Abstraksi packages when supported; avoid long-lived publishing tokens. Preserve package provenance attestations and pin/review security-critical runtime versions. Wasmtime remains **ADOPT / SECURITY-PINNED**; later security fixes reinforce malicious-guest/resource-exhaustion regression testing rather than changing the architecture.

## 53.5 Threat-model update

Codetta-style steganographic/collusion research is retained as a **THREAT-MODEL REFERENCE**: readable transcripts and ordinary audit logs are necessary but are not proof that multiple learned agents cannot communicate covertly. Multi-agent deployments therefore require bounded channels, capability separation, independent enforcement and outcome auditing rather than trust in transcript inspection alone.

---

# 54. v0.8 freeze decisions and reconciled Radar ledger

These decisions supersede conflicting post-v0.7 candidate interpretations while preserving §45 physical/social decisions unless changed by the later §55 v0.8.1 physical-endpoint freeze.

1. Aksara cognition is explicitly heterogeneous; generative language models are not the default primitive for deterministic or bounded decisions.
2. Model inference never grants authority. Authority remains in the institutional kernel and Capability Lease path.
3. Keep one production resident harness; Mecatl/Strands/Vellum/minimal-loop/Atomic/TrueForge candidates compete on one failure-oriented fixture rather than becoming co-sovereign runtimes.
4. Harness, durable workflow, execution and enforcement are separate layers. Temporal remains durable workflow; Wasmtime remains narrow bounded execution; rich workspaces may bake off OpenShell/smolvm/native backends.
5. `WorkstationBridgeRuntime` remains stable. Add Phone Bridge and Instrument Bridge as sibling External System Bridge profiles rather than renaming the existing contract.
6. Aksara Science becomes an explicit profile with an Evidence Package lifecycle; it reuses Aksara identity, authority, memory, receipts and execution.
7. Speech is tiered by deployment economics. Pocket-TTS Indonesian becomes the leading P1 CPU/offline TTS spike; no single expressive model becomes a permanent exclusive default.
8. AG-UI and A2UI occupy different layers: event/state transport vs declarative generated view. Trusted Aksara renderers own final institutional presentation.
9. OpenMANET/HaLow remains a field prototype candidate; practical USB HaLow hardware strengthens the experiment but does not alter P1 networking requirements.
10. Evidence-first/query-time memory is preferred over indiscriminate eager semantic summarization.
11. CI/build/deploy provenance is part of the receipt model and must survive vendor retention windows.
12. Security-critical runtimes remain version-pinned and regression-tested; new CVEs/fixes update pins, not architecture by reflex.
13. Paperclip is a Klerk organizational-control-plane **CODE DONOR / COMPETITOR**, not an Aksara kernel ontology.
14. AIPOCH/Wisp/Paper2Agent inform Aksara Science; mature scientific and vertical software should still be integrated rather than rebuilt.
15. Speculative models/hardware remain in the Radar ledger until a concrete profile and fixture exist.

## 54.1 Post-v0.7 reconciled candidate ledger

| Area | Candidate | v0.8 status | Fit | Deciding fixture / note |
|---|---|---|---|---|
| resident harness | Mecatl | **BAKEOFF + CODE DONOR** | Aksara cognition | institutional-turn failure suite |
| broad harness | TrueForge | **BAKEOFF + CODE DONOR** | Aksara/CLI | same fixture; reject semantic ownership |
| local harness | SandBase | **WATCH / CODE DONOR** | local-first runtime | audit/replay/sandbox patterns |
| local harness | Atomic Agent | **BAKEOFF + CODE DONOR** | TS/minimal-loop reference | tool/approval/replay + isolation fixture |
| rich workspace enforcement | NVIDIA OpenShell | **SPIKE / BAKEOFF** | WorkAgentRuntime | egress/credential/filesystem/crash fixture |
| organizational control | Paperclip | **KLERK CODE DONOR / COMPETITOR** | Klerk | goals/tasks/budgets/approvals/audit mapping |
| bounded decision | Strands Decider 2B | **HIGH-PRIORITY SPIKE** | System-One | 500-decision calibration/latency corpus |
| tiny tool decision | Needle | **EDGE SPIKE** | Card/Edge/System-One | 30–50 tool schemas + ID/Papuan Malay |
| policy/eval ABI | ASSERT / ACS | **CODE DONOR / SPIKE** | policy/eval boundary | fail-closed verdict fixture |
| P1 TTS | Pocket-TTS Indonesian | **HIGH-PRIORITY SPIKE** | P1 CPU/privacy | RTF/RSS/latency/intelligibility corpus |
| local TTS | Qwen3-TTS 0.6B Indonesian | **EXPERIMENTAL BAKEOFF** | Node | same speech corpus |
| expressive TTS | FireRedTTS3 | **BAKEOFF / WATCH** | Node+/Gateway | quality/VRAM/license-use review |
| multilingual ASR | Fun-ASR-MLT-Nano | **BAKEOFF** | Node/Node+ | room/code-switch corpus |
| unified audio | FireRedAudio | **WATCH** | Science/Gateway | promote only for concrete audio workflow |
| speech evaluation | Breeze methodology | **CODE DONOR** | local-language benchmark | Mee/Papuan pilot benchmark |
| phone actuation | FoneClaw | **CODE DONOR / ADAPTER** | Phone Bridge | five-action observe/approve/act/reconcile spike |
| UI transport | AG-UI 1.0 | **SPIKE / ADOPT CANDIDATE** | all interactive surfaces | same WorkObject across web/mobile/room |
| native generated UI | AGenUI | **ADAPTER / SPIKE** | mobile | Aksara approval card offline/reconnect |
| generated UI challenger | OpenUI | **BAKEOFF** | surfaces | identical payload benchmark vs A2UI |
| typed React UI | Tambo | **CODE DONOR / WATCH** | web/Klerk | trusted component registry pattern |
| science workbench | AIPOCH Open-Science | **SPIKE / CODE DONOR / COMPETITOR** | Aksara Science | three Papua research trajectories |
| science workbench | Wisp Science | **UX REFERENCE / SECONDARY CODE STUDY** | Aksara Science | retain only differentiated patterns |
| paper→capability | Paper2Agent | **CODE DONOR / SPIKE** | Aksara Science | paper+repo → tested capability fixture |
| memory research | JAM | **RESEARCH REFERENCE / SPIKE** | memory | institutional-history query benchmark |
| EO/hyperspectral | HyperSAM | **WATCH** | Science/EO | code + Papua imagery benchmark |
| Earth representation | TerraNova | **RESEARCH WATCH** | Living Atlas/Science | no promotion without concrete dataset/task |
| accelerator DSL | TileLang | **WATCH / CODE DONOR** | future Gateway/cluster | heterogeneous-hardware need first |
| sparse cognition | Xing4.0-29B-A4B | **SPIKE / WATCH** | Node+/Gateway | local agent fixture/economics |
| model research | K2 Horizon | **UPGRADED RESEARCH SUBSTRATE** | model R&D | small ID/Papuan continuation experiment |
| computer-use VLM | Holo4-27B | **BENCHMARK / CODE DONOR ONLY** | Workstation research | non-commercial license blocks production |
| large sparse model | Naive-N0.5-Flash | **WATCH** | Gateway | runtime availability/economics |
| field mesh | OpenMANET / Wi-Fi HaLow | **KEEP FIELD PROTOTYPE** | TransportPort | regulatory/range/power/BOM/throughput |
| HaLow hardware | Morse Micro MM8108 class | **HARDWARE SPIKE** | field networking | Linux/Indonesia/range/power test |
| small-fleet ops | ClusterShell | **WATCH / OPERATOR TOOL** | Node fleet | 10-node fan-out/gather fixture |
| AI camera | CVITEK CV1842H-P / Ovis-class | **WATCH** | field perception | shipping/Linux/power/quality first |
| deterministic field MCU | NXP FRDM-IMXRT1186 | **WATCH / REFERENCE** | future field controller | real-time use case before adoption |
| threat model | Codetta collusion research | **REFERENCE** | multi-agent security | bounded-channel threat exercise |
| CI provenance | durable build/deploy receipt | **ADD CONTRACT** | developer infrastructure | reconstruct deployment without CI UI |
| package publishing | OIDC trusted publishing | **ADOPT PRACTICE** | developer infrastructure | tokenless sandbox publish |

## 54.2 Reconciliation note

The pre-existing §44 ledger remains valid and is intentionally preserved: `any`/any-sync/anyrt, mcp-gateway-registry, AGNTCY/OASF, smolvm, OpenConnector, agent-desktop, Monty, Wasmtime, MOSS, VoxCPM2, K2, TabDPT/TabICLv2, FoundationForecast/TimeCopilot, Granite time-series, Carbon DNA, FLUX Action, Flint, GeoLibre, OpenMANET, JetKVM, Lemonade, ESP32-AI, Decimen, Supermemory Company Brain, Xiaozhi/XIAO Card, Omi, reSpeaker Clip, FoloToy and Cloudflare Email remain tracked unless §54 explicitly upgrades their interpretation. v0.8 adds the post-27-September candidates above without silently deleting the older discovery surface.

---

# 55. v0.8.1 physical interaction endpoint freeze decisions

These decisions supersede conflicting physical-hardware assumptions in §24/§36/§45 while preserving the social, privacy, identity, capture, Node security and runtime semantics that do not depend on enclosure geometry.

1. **Separate compute from embodiment.** The Node is the reference local compute/custody/connectivity/hardware-control appliance; a display is not an intrinsic requirement of Node.
2. **Physical Interaction Endpoints are first-class deployment components.** They may be integrated into a Node enclosure or deployed separately and connected to Aksara running on a Node, existing server or governed Gateway.
3. **Do not overload “surface” in the hardware contract.** ETNOS, web, phone and messaging remain digital interaction surfaces/channels; hardware-specific capability negotiation uses `PhysicalInteractionEndpoint`.
4. **The 64×64 HUB75 becomes the reference Presence Surface**, not the definition of the Node. A lower-cost diffused RGB field/strip is a legitimate Presence Surface variant when full matrix resolution does not create measured value.
5. **A 7.5-inch class 800×480 monochrome e-paper device becomes the reference Information Surface prototype.** E-paper is promoted from a vague later-front option to a concrete P1 bakeoff because current cost and utility justify testing it.
6. **Physical surfaces are interaction endpoints, not passive displays.** A Presence or Information Surface may include microphone, speaker, buttons/NFC, privacy indicators and optional camera/vision, subject to the same audience, lease and privacy contracts as Card/Node interaction.
7. **Camera is optional and physically controlled.** Public/shared endpoints do not require ambient vision; where installed, camera state must be physically legible and support a shutter/disconnect or equivalent hardware-enforced control.
8. **Persistent e-paper has a pre-render authorization rule.** Only fully audience-authorized frames may be committed; sensitive content is never rendered then visually redacted.
9. **Public Information Surfaces use a public/policy-bounded projection and public lane.** Private or restricted requests hand off to an authenticated phone/web/Card/private endpoint rather than widening the public endpoint's context.
10. **One gathering still elects one primary capture source by default.** Eligible sources now include integrated Node microphones, Presence Surfaces, Information Surfaces and Cards; proximity never activates capture automatically.
11. **Immediate state remains on a fast deterministic path.** RGB/status LEDs, mute/privacy indicators, stop controls and earcons do not wait for the resident model. E-paper handles slower semantic/persistent state.
12. **Node Complete is a SKU composition, not a new architecture.** It may integrate Node Core + Information Surface + Presence Surface + shared mic/speaker/camera/power/control in one coherent enclosure.
13. **Shared components should be shared physically where co-located.** An integrated product does not duplicate microphones, speakers, cameras, power supplies or controllers merely because it contains several display modalities.
14. **Distributed surfaces are supported.** One Node may serve several room/site endpoints; each endpoint advertises capability, effective audience/location and health. USB is the simplest local P1 path; Ethernet/PoE remains a strong expansion path.
15. **Raw display buses stay internal.** HUB75/SPI/I²C are endpoint implementation details; external product connectivity should use a bounded versioned endpoint protocol.
16. **Cards become targeted rather than assumed universal purchases.** Principal-bound portable hardware is deployed where mobility, authenticated capture/approval, haptics or private handoff justify its marginal cost; phones/web remain first-class alternatives.
17. **Hardware pricing is evaluated per deployment role.** Node Core, Presence Surface, Information Surface, Card and Node Complete receive separate BOM/field-support measurements; value is measured against institutional utility rather than attachment rate.
18. The forthcoming dedicated **Aksara Hardware Family** document may expand BOMs, industrial design, SKU composition, connectors, acoustics, thermal/power, field service, certification and ETNOS interaction, but it does not supersede this catalogue's institutional authority/security contracts unless explicitly reconciled back into a later catalogue revision.
19. **Hardware ecosystem ambition is deprioritized.** P1 should optimize for deployability, repairability and support on commodity/refurbished hosts rather than attachment rate or proprietary accessory breadth.
20. **Branded hardware still matters when sold.** Commercial units should use a coherent Abstraksi/Aksara casing/white-label language even when internal compute is third-party or refurbished; design details remain deliberately unfrozen.
21. **Custom electronics require repeated evidence.** Move from commodity boards to custom PCBs only when cost, reliability, power, integration, certification or supply-chain measurements justify the engineering burden.

## 55.1 v0.8.0 → v0.8.1 surgical consolidation

v0.8.1 intentionally does **not** rewrite the software/model/memory/radar catalogue. It narrows one physical-product assumption that had become too coupled: the former P1 equation of `Node = compute/custody appliance + built-in 64×64 front`. The preserved stable ideas are the Node Controller boundary, MatrixUI/Presence Grammar, Card principal binding, GatheringSession, one-source capture leases, audience-safe context, physical privacy controls and display-independent interface semantics. The new decomposition allows those semantics to survive across standalone surfaces, integrated monoliths and installations using existing compute.

---


# 56. v0.9 company, product and commercialization freeze decisions

These decisions supersede conflicting company/product assumptions elsewhere in the catalogue while leaving the technical contracts intact unless explicitly stated.

1. **Abstraksi is an open-core infrastructure company building communal intelligence systems.**
2. **Aksara Core is open communal infrastructure, not a proprietary commercial appliance.**
3. **The Workbench is a reference collaborative experience, not the moat by itself.** Canvas, channels, kanban, generated UI, agents and plugins are commodity ingredients; the durable layer is shared state + authority + evidence + continuity + place.
4. **Self-hosting remains a real path.** Commercial value comes primarily from operation, support, deployment, managed control plane, focused products and field reliability.
5. **Existing work is retained.** This revision reassigns layers rather than throwing away the runtime, Node, surfaces, Card, ETNOS, packs, memory, policy, Science or field work.
6. **Capability Packs are an interoperability/conformance layer.** They should consume upstream plugin/app/tool ecosystems where possible; Abstraksi does not need a walled proprietary capability store.
7. **Aksara Science is promoted as the leading focused product experiment.** Its value is the persistent collaborative research/evidence workspace, not merely an “AI science agent.”
8. **ETNOS remains the outward/public knowledge and coordination layer.** Aksara is inward/local communal computation; deliberate publication can flow outward without exposing private source state.
9. **The personal-goal system remains an experimental product lane.** Its durable object is the goal/trajectory graph rather than chat; it may first ship through existing assistant/app ecosystems instead of requiring a new full-stack consumer platform.
10. **Managed deployments are a first-class business.** Installation, security, updates, backup, model routing, fleet operations, networking, recovery and local support are sellable value.
11. **Integration work is acceptable and useful when it compounds.** Prefer projects that create reusable adapters, packs, evaluations, workflows, localizations, schemas or deployment recipes.
12. **Token resale is not the thesis.** Usage credits may be bundled or passed through, but model-provider margin is not a durable moat.
13. **Hardware is deployment infrastructure, not the company identity.** Existing compute and refurbished Tiny/Mini/Micro PCs are first-class targets.
14. **Any hardware Abstraksi sells should still look intentional.** Coherent custom/white-label casings, markings and interaction language are required even when internals are commodity; detailed industrial design is deferred.
15. **A proprietary hardware ecosystem is not a P1 objective.** Custom boards and broad accessory programs wait for repeated field evidence.
16. **Global saturation does not automatically kill a product idea.** Abstraksi may enter crowded categories when local fit, taste, execution, trust, distribution or deployment reality creates a meaningful wedge.
17. **Localize the frontier mindfully.** Let global labs and open-source communities commoditize generic capabilities; integrate them into products designed for Papua, Indonesia, Melanesia and similar operating environments.
18. **The data-collection marketplace is retained as an explicit expansion lane.** It may coordinate paid collection, QA, provenance, licensing and benefit-sharing for language, multimodal, environmental, scientific and other specialized data.
19. **Data marketplace operation does not imply data expropriation.** Rights, consent, provenance, residency, correction/withdrawal and community benefit-sharing remain explicit.
20. **Abstraksi's moat is expected to compound.** Installed deployments, field competence, institutional workflows, local trust, domain evaluations, localization, contributor networks, public knowledge networks and product taste matter more than owning one agent harness.

## 56.1 Portfolio continuation map

| Existing thread | v0.9 action | Strategic role |
|---|---|---|
| Aksara kernel/runtime | **KEEP + OPEN** | communal state, authority, memory, sync, execution contracts |
| Workbench / shared canvas / kanban / channels | **KEEP + SIMPLIFY + POLISH** | coherent reference experience over Aksara |
| Capability Packs | **KEEP + REFRAME** | governed plugin/app/tool packaging and interoperability |
| Node Core | **KEEP as deployment profile** | local compute/custody/offline continuity |
| Presence / Information Surfaces | **KEEP selectively** | physical interaction where place matters |
| Aksara Card | **TARGETED EXPERIMENT** | portable identity/capture/private handoff where justified |
| bespoke hardware ecosystem | **DEPRIORITIZE** | build only after field evidence |
| ETNOS | **KEEP + STRENGTHEN** | public knowledge/coordination/discovery network |
| Aksara Science | **PROMOTE** | focused standalone/managed product wedge |
| Elaris/Gate personal-goal concept | **RENAME + EXPERIMENT** | goal/trajectory layer; possibly assistant app/plugin first |
| managed cloud/control plane | **PROMOTE** | recurring operations business |
| integrations / deployments | **PROMOTE with compounding rule** | revenue + learning engine |
| model/API credit resale | **UTILITY ONLY** | pass-through/bundled cost, not primary moat |
| data collection marketplace | **ADD expansion lane** | contributor/data economy with rights/provenance/QA |

## 56.2 Company one-line model

> **Abstraksi builds open communal-intelligence infrastructure, operates and deploys it for real institutions, and turns the same substrate into focused products and public knowledge systems.**

## 56.3 Business flywheel

```text
open Aksara substrate
        ↓
real deployments + contributors
        ↓
reusable adapters / packs / evaluations / localizations
        ↓
better Workbench + domain products
        ↓
managed operations / support / hardware bundles
        ↓
public or opt-in outputs
        ↓
ETNOS / datasets / contributor network
        ↓
more adoption, trust and deployment knowledge
```

The flywheel should be evaluated by **repeated useful work and reuse across deployments**, not repository stars, number of models integrated or number of hardware SKUs.

---

## 55.2 v0.8.1 → v0.9.0 strategic consolidation

v0.9.0 changes the **company and product boundary** more than the technical stack. Aksara is explicitly treated as the open communal substrate; commercial emphasis moves to managed deployments, operations, domain products and compounding integrations. Hardware remains important where infrastructure or physical presence demands it, but proprietary hardware breadth is no longer a north-star. The revision also promotes Aksara Science, keeps the personal-goal system as an experiment, records the data-collection marketplace as an expansion lane, and makes “localize the frontier” an explicit product-selection doctrine.


# Appendix A — Canonical one-line model

> **InstitutionActor + Tenant → TrustDomain + DataCustodian + StoragePlacement → Principal + IdentityBinding → Surface / ConversationLane + optional GatheringSession → current Actor + Initiator + Audience + Purpose (`AccessContext`) → Memory Firewall / authorized MemoryView → Authoritative Memory + optional derived Graph/Continuity/Trigger indexes → Context → [when work becomes owned/consequential: WorkObject / DecisionRequest] → Authority + OfflineAuthorityEnvelope → Capability Lease → Deterministic Execution / hand-off → destination Receipt + Ledger → optional SharingGrant / Public Boundary → Federation.**

# Appendix B — Canonical anticipation line

> **Calendar / sensor / external signal / temporal model → Irama state → authorized trigger matching → memory activation score → contextual preload or preparation proposal → policy/approval → execution.**

# Appendix C — Inspiration & upstream provenance ledger

The point of this table is not to claim endorsement by upstream projects. It records **why a source influenced Aksara**, and the boundary where Aksara diverges.

| Ref | Source | What we borrow | Aksara-specific divergence |
|---|---|---|---|
| `REF-RUST` | https://www.rust-lang.org/ | native safe systems substrate | small trusted nucleus only; not “Rust everywhere” |
| `REF-TOKIO` | https://tokio.rs/ | async systems runtime | institutional semantics stay above runtime |
| `REF-CONNECT` | https://connectrpc.com/ and https://buf.build/ | cross-language typed RPC/contracts | domain model is independent of transport |
| `REF-WASMTIME` | https://wasmtime.dev/ and https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.1 | embeddable WebAssembly sandbox; reviewed 49.0.1 release line as of 2026-09-26 | capability runtime versions are security-pinned and regression-tested |
| `REF-WASI-CM` | https://component-model.bytecodealliance.org/ | WIT/component capability contracts | Aksara manifest adds authority, validation and provenance |
| `REF-BEND` | https://github.com/bendlang/bend | pure parallel computation + laws/proofs | experimental pack runtime, never P1 authority/kernel |
| `REF-SQLITE` | https://sqlite.org/ | durable local transactional store + FTS | canonical institutional meaning defined by Aksara |
| `REF-SQLITE-VEC` | https://github.com/asg017/sqlite-vec | low-footprint local vector search | embeddings remain rebuildable indexes |
| `REF-LANCEDB` | https://lancedb.com/ | embedded vector/data alternative | optional implementation |
| `REF-GRAPHITI` | https://github.com/getzep/graphiti | temporal knowledge graph, episodes/provenance | derived projection; approved records/ledger remain authoritative |
| `REF-OPTMEM` | https://github.com/VictorTaelin/OptMem | append-only memory + rebuildable hierarchical summaries | institutional scopes, provenance and policy added |
| `REF-TIMEM` | https://aclanthology.org/2026.findings-acl.1091/ | temporal-hierarchical consolidation and complexity-aware recall | hierarchy represents institutional continuity, not persona profiling |
| `REF-HORMA` | https://arxiv.org/abs/2606.11680 | hierarchical organize-and-retrieve navigation | navigation remains constrained by actor/policy context |
| `REF-TMEM` | https://arxiv.org/abs/2606.15405 | write-time future-oriented triggers for associative recall | event-conditioned, policy-first, provenance-linked institutional Trigger Index |
| `REF-ASSOMEM` | https://github.com/facebookresearch/AssoMem | multi-signal associative retrieval benchmark/reference | not a second canonical graph system |
| `REF-CEDAR` | https://www.cedarpolicy.com/ | explicit principal/action/resource/context authorization | mandates/collective governance remain Aksara domain objects |
| `REF-BISCUIT` | https://www.biscuitsec.org/ | attenuable offline-verifiable capability tokens | short TTL + local revocation + ledger semantics |
| `REF-DUROXIDE` | https://github.com/microsoft/duroxide | embeddable durable execution in Rust | must pass P1 fault-injection before adoption |
| `REF-RESTATE` | https://restate.dev/ | distributed durable objects/workflows | better hosted candidate than tiny-node default |
| `REF-DBOS` | https://www.dbos.dev/ | durable workflows around ordinary code | adapter, not domain truth |
| `REF-TEMPORAL` | https://temporal.io/ | mature durable workflow model | hosted/heavier alternative |
| `REF-CF-WORKFLOWS` | https://developers.cloudflare.com/workflows/ | durable cloud workflow adapter | never canonical institutional workflow state |
| `REF-VELLUM` | https://github.com/vellum-ai/vellum-assistant | resident cognition, tools, workflows, credential/sandbox patterns | identity, memory truth, authority and ledger stay outside |
| `REF-MAF` | https://github.com/microsoft/agent-framework | production agent/workflow fallback | alternative harness, not co-sovereign runtime |
| `REF-PYDANTICAI` | https://ai.pydantic.dev/ | typed Python agent/science workflows | pack-level runtime |
| `REF-AGENTOS` | https://github.com/rivet-dev/agentos | bounded agent computer/workspace | only via WorkAgentRuntime |
| `REF-EVE` | https://vercel.com/docs/eve | filesystem-first durable-agent design | reference/alternative, not P1 substrate |
| `REF-CFOS` | https://github.com/cloudflare/cloudflare-os | Gatekeeper/speculative action pattern | semantics reimplemented locally under Aksara policy |
| `REF-AGENTGATEWAY` | https://agentgateway.dev/ | MCP/A2A/LLM perimeter, routing/auth/guardrails | exact semantic authorization remains Aksara |
| `REF-BIFROST` | https://github.com/maximhq/bifrost | provider gateway, fallbacks, budgets, governance | optional gateway implementation |
| `REF-ORCAROUTER` | https://github.com/Continuum-AI-Corp/OrcaRouter-Lite | capability/cost-aware model routing | sits behind `model.route` |
| `REF-LIVEKIT` | https://docs.livekit.io/agents/ | realtime voice session mechanics | identity, retention, memory and audit remain Aksara |
| `REF-A2UI` | https://a2ui.org/ | declarative catalog-driven generated UI | Aksara defines trusted component catalogs and semantic surfaces |
| `REF-AGUI` | https://github.com/ag-ui-protocol/ag-ui | agent↔frontend events/state | optional transport, not MatrixUI visual semantics |
| `REF-EMBEDDED-GRAPHICS` | https://github.com/embedded-graphics/embedded-graphics | deterministic tiny-display rendering + simulator | Aksara MatrixUI defines visual grammar |
| `REF-LVGL` | https://lvgl.io/ | richer embedded UI alternative | preferred later for higher-resolution displays |
| `REF-WOT` | https://www.w3.org/TR/wot-thing-description11/ | interoperable Properties/Actions/Events device descriptions | Aksara maps Things into Observe/Interpret/Act capabilities |
| `REF-EMBEDDED-HAL` | https://github.com/rust-embedded/embedded-hal | portable embedded peripheral traits | higher semantic device contract stays above |
| `REF-ZENOH` | https://zenoh.io/ | edge pub/sub/query data plane | durable offline truth remains Aksara SQLite/outbox |
| `REF-BUBBALOOP` | https://github.com/kornia/bubbaloop | Zenoh + physical AI/node discovery patterns | adapter/reference, not institutional kernel |
| `REF-AETHEREDGE` | https://github.com/EvanL1/AetherEdge | deterministic edge/industrial runtime patterns | adapter/reference pending maturity |
| `REF-ORAS` | https://oras.land/ | OCI artifacts for non-container packages | Aksara defines pack semantics |
| `REF-SIGSTORE` | https://www.sigstore.dev/ | signatures/provenance | local trust policy determines acceptance |
| `REF-MCP-REGISTRY` | https://modelcontextprotocol.io/registry | capability/tool discovery input | local Aksara Registry remains authoritative |
| `REF-OTEL-GENAI` | https://opentelemetry.io/docs/specs/semconv/gen-ai/ | trace interoperability | trace never replaces institutional ledger |
| `REF-LANGFUSE` | https://langfuse.com/ | LLM/agent traces, eval datasets/experiments | development/eval backend, not source of truth |
| `REF-CF-DO` | https://developers.cloudflare.com/durable-objects/ | cloud stateful simulator peer | browser/local node remains true offline path |
| `REF-VJEPA2` | https://github.com/facebookresearch/vjepa2 | video temporal representation/prediction | Perceive/Represent capability only |
| `REF-TIMESFM` | https://github.com/google-research/timesfm | general time-series forecasting | benchmark against simpler/domain models |
| `REF-TTM` | https://github.com/ibm-granite/granite-tsfm | compact time-series foundation models | implementation behind `timeseries.forecast` |
| `REF-A2A` | https://a2a-protocol.org/v1.0.0/specification/ | independent-agent discovery, Agent Cards, Tasks, Artifacts, auth/streaming/push | receiver policy/leases remain Aksara-owned; public ETNOS projection is separate |
| `REF-ACTIVITYPUB` | https://www.w3.org/TR/activitypub/ | federated actor inbox/outbox and social delivery | ETNOS adds product semantics without breaking federation |
| `REF-ACTIVITYSTREAMS` | https://www.w3.org/TR/activitystreams-core/ and https://www.w3.org/TR/activitystreams-vocabulary/ | standard Person/Organization/Service/Application/Group actor types | Aksara remains presentation/governance metadata rather than a bespoke federation actor type |
| `REF-PIEFED17` | https://join.piefed.social/2026/07/03/piefed-v1-7-is-released-following-users-faster-browsing-smarter-moderation/ | current social substrate capabilities including following users; PieFed social grammar | ETNOS sidecar adds public-work/artifact/trace semantics |
| `REF-FALKORDB-LITE` | https://github.com/getzep/graphiti | embedded Graphiti backend path via FalkorDB Lite; Kuzu deprecation | authoritative truth remains SQLite/files; graph backend replaceable |
| `REF-KOLIBRI` | https://learningequality.org/kolibri/about-kolibri/ | offline-first classroom/content delivery | Aksara adds governed institutional memory/objective/evidence layer |
| `REF-OPENEMIS` | https://www.openemis.org/ | open education management + offline/interoperability patterns | school admin substrate/reference, not Aksara core |
| `REF-SATUSEHAT-FHIR` | https://satusehat.kemkes.go.id/platform/docs/id/fhir/ | Indonesian HL7 FHIR interoperability boundary | Aksara does not become an EMR or bypass clinical authority |
| `REF-LOCALCONTEXTS` | https://localcontexts.org/ | community-defined provenance/protocol/permission metadata for Indigenous knowledge/data | reference for community authority semantics; local Papua governance remains locally defined |
| `REF-AX` | https://github.com/google/ax | Task/Workspace/Gateway/Model execution control-plane patterns for agent workloads | optional `WorkAgentRuntime` backend; Aksara institutional state remains above it |
| `REF-AGENT-SUBSTRATE` | https://github.com/agent-substrate/substrate | actor/worker separation, suspend/checkpoint/resume, gVisor/microVM worker pools | experimental Node+/cluster execution only; snapshots are never canonical memory |
| `REF-INTENT` | https://github.com/intent-hq/intent | local Rust daemon, thin clients, isolated workspaces, provider-agnostic sessions, harness/version reproducibility | code/reference donor; Aksara ontology remains institutional rather than coding-workspace-centric |
| `REF-INTENT-DIAGRAMS` | https://github.com/intent-hq/cloudlands-fe/tree/main/src/lib/components/diagrams | typed semantic diagram grammars, walkthrough states, camera/highlight/narrative, real-object bindings | adapted into trusted Aksara `ViewPrimitive`s; not arbitrary executable UI |
| `REF-OPENMUSE` | https://github.com/CopilotKit/openmuse | AG-UI web/mobile agent workspace, durable visible work, structured results, human takeover patterns | UX/reference shell only; not institutional identity/memory substrate |
| `REF-OPENBOT` | https://github.com/CopilotKit/OpenBot | governed browser/file/MCP gateway, initiator-aware policy, per-bot computer, take-the-wheel/audit patterns | Aksara authority remains Cedar/lease/execd; Bot is not the institutional principal |
| `REF-ALEXANDRIA` | https://firecrawl.dev/alexandria | external data/provider capability discovery, progressive contract disclosure, terms/cost/idempotency/receipt patterns | optional discovery/broker adapter; local Aksara Capability Registry remains authoritative |
| `REF-ANYDOC` | https://github.com/firecrawl/anydoc | local Rust multi-format document normalization into structured document/Markdown representations | derived parser; original artifact remains canonical; hosted OCR is governed egress |
| `REF-PDF-INSPECTOR` | https://github.com/firecrawl/pdf-inspector | PDF text/scanned/mixed inspection and OCR routing | feeds Aksara document triage; local OCR required by policy for sensitive classes |
| `REF-STRANDS` | https://github.com/strands-agents/harness-sdk | SDK-first Python/TypeScript agent loop, lifecycle limits, hooks/steering, MCP, sessions, tracing/evals | resident-cognition alternative only; Aksara still owns identity, memory truth, policy, leases, ledger and effects |
| `REF-MONTY` | https://github.com/pydantic/monty and https://github.com/pydantic/monty/releases/tag/v1.0.0 and https://ai.pydantic.dev/harness/code-mode/ | v1 language sandbox for programmatic composition of host capabilities, sessions/suspension/resume and typed code mode | generated control flow never receives ambient authority; durable institutional lifecycle/effects remain Aksara-owned |
| `REF-WINDMILL` | https://github.com/windmill-labs/windmill | worker pools, durable job/approval ergonomics, resource handles and workflow observability | implementation reference only; P1 avoids its heavier API/Postgres/worker platform footprint |
| `REF-JEV-MEM` | https://arxiv.org/abs/2609.23986 and https://github.com/libingzheren/Jev-Mem | fast typed memory-control plane, multi-relational budgeted retrieval, adaptive stopping | authorization and persistence remain Aksara policy-first; not every valid observation is retained |
| `REF-SYSTEM-ONE-OPEN` | https://github.com/mithalouni/system-one-open | open Jev-style one-pass typed scorer; evidence on held-out/generalization limits and task tuning | trace/evaluate before local adoption; scorer never becomes policy |
| `REF-OPEN-JEV-FINETUNE` | https://github.com/daseinlabs/open-jev/blob/main/docs/design/per-task-finetuning-with-gemma.md | distinction between zero-shot option likelihoods and task-calibrated trained scorer | supports trace-first, specialize-second Aksara deployment strategy |
| `REF-ASTRA-ARES` | https://github.com/miuuyy/Astra-Ares | bounded System-One selection of reasoning effort and decision lease duration | reference for `decision.score(reasoning.effort)`, not a runtime dependency |
| `REF-UNIVER` | https://github.com/dream-num/univer-cli and https://github.com/dream-num/univer-workspace | Office-native agent CLI/workspace, isolated worktrees, render/verify/review/merge for Sheets/Docs/Slides/Base/Board | candidate-artifact runtime only; source bytes and Aksara authority remain external; Pro terms pinned separately |
| `REF-DRAC` | https://arxiv.org/abs/2609.24220 | visual normalization, retrieval-oriented Markdown, immutable ID units and chunk planning over IDs | preserve native structure/original bytes; local/Gateway multimodal path follows data policy |
| `REF-CLI-ANYTHING` | https://github.com/HKUDS/CLI-Anything | source-driven generation/refinement/testing of stateful JSON CLIs for GUI-heavy software | dev-time capability factory only; generated adapter is untrusted until reviewed, tested, annotated and signed |
| `REF-TREG` | https://github.com/superdesigndev/treg | unified metered broker for many external commercial tools/providers without distributing vendor credentials | optional egress/provider adapter; local Capability Registry and policy remain authoritative |
| `REF-SCIENCEBUDDY` | https://github.com/Gen-Verse/ScienceBuddy | evaluated inner-loop harness improvement plus outer-loop model learning for scientific agents | research-only reference; operational/training data separation and human promotion remain mandatory |
| `REF-NEMOTRON-DIAR` | https://huggingface.co/nvidia/Nemotron-3-Diarization | open-weight streaming/offline up-to-eight-speaker diarization | Node+/Gateway candidate; speaker channel is evidence, never identity/authority |
| `REF-GEMINI38-TTS` | https://ai.google.dev/gemini-api/docs/changelog and https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/ | expressive/low-latency cloud TTS, voice design/replication and provider interchange | Gateway-only candidate; replicated voice requires consent/provenance/disclosure/revocation |
| `REF-HERMES` | https://github.com/NousResearch/hermes-agent | broad messaging gateway, deterministic user/chat/thread sessions, searchable durable session history, replaceable memory/provider adapters | P0/P1 cognition/channel adapter; sessions and native memory never define institutional authority |
| `REF-OPENCLAW` | https://docs.openclaw.ai/concepts/multi-agent and https://docs.openclaw.ai/concepts/session | agent/account/peer bindings, DM/group/thread scopes, cross-channel `identityLinks`, isolated agent session stores | identity/session routing ideas become Aksara `IdentityBinding`/`ConversationLane`; agent profile is not top-level institution |
| `REF-VELLUM-IDENTITY` | https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/architecture/turn-actor.md and https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/trusted-contact-access.md | gateway-owned ingress trust, multi-channel contacts, acting-vs-resting actor distinction, provenance and current-turn authorization | generalized from personal guardian/contact model into Institution/Principal/Membership/Role/Audience; no owner fallback for auth |
| `REF-VELLUM-MEMORY-V3` | https://github.com/vellum-ai/vellum-assistant/blob/main/assistant/docs/architecture/memory.md | concept-page substrate, buffered capture/consolidation, hybrid retrieval, per-turn v3 lane/section selection, provenance-aware imports | cognitive memory reference only; Aksara Memory Firewall and authoritative records remain canonical |
| `REF-CAURA` | https://github.com/caura-ai/caura | governed multi-tenant fleet memory, agent/team/org scopes, credentials/trust tiers, audit, hybrid search, contradiction/supersession, graph, Rail/MCP | optional derived memory backend; Aksara adds human principals, purpose/audience, work-object/compartment scope, valid-time/evidence/authority semantics |
| `REF-AIM-MULTIUSER` | https://arxiv.org/abs/2609.12320 | private/shared multi-user memory and index-level access-control evaluation | evidence for scope-aware memory and for keeping automated visibility classification outside the security boundary |
| `REF-COLLAB-MEMORY` | https://arxiv.org/abs/2505.18279 | dynamic user↔agent/resource access graphs, private/shared tiers, read/write policies, immutable provenance | inspires audience/purpose-aware MemoryViews; Aksara uses its own Cedar/domain model |
| `REF-MIRIX` | https://arxiv.org/abs/2507.07957 | distinct semantic memory types (core/episodic/semantic/procedural/resource/vault) and routed retrieval | taxonomy reference; type remains independent from visibility/retention |
| `REF-GMEMORY` | https://arxiv.org/abs/2506.07398 | interaction/query/insight graph hierarchy for multi-agent organizational memory | research reference for collaboration-history abstraction, not P1 canonical storage |
| `REF-OPENHANDS` | https://docs.openhands.dev/enterprise/conversations-and-sandboxes | explicit separation of conversation and sandbox; sandbox sharing is not a security boundary | reinforces separate ConversationLane, runtime-isolation and memory-governance boundaries |
| `REF-LIBRECHAT-ACL` | https://www.librechat.ai/docs/features/access_control | users/groups/roles/public principals, feature permissions, per-resource ACLs and admin grants | authorization-model reference; Aksara authority remains Cedar + mandates/delegation |
| `REF-OPENWEBUI-CHANNELS` | https://docs.openwebui.com/features/channels/ | persistent shared human+AI channels with group/public/private access | shared-workspace UX reference; conversation channel is not institutional memory |
| `REF-LETTA-SHARED` | https://docs.letta.com/guides/core-concepts/memory/shared-memory/index.md | shared memory blocks and explicit concurrency caveats | bounded handoff/shared-working-state reference only; not transactional institutional state |
| `REF-GROKBOT` | https://cursor.com/docs/grok-bot | persistent named coworkers, per-user computer isolation, team rules/approvals and bot coordination | personal-coworker/runtime reference; Aksara inverts ownership so institution, not each person/bot, is the durable sovereign identity |
| `REF-SYSTEMD-CRYPT` | https://www.freedesktop.org/software/systemd/man/latest/systemd-cryptenroll.html | TPM2/FIDO2/PKCS#11 enrollment for LUKS2 and signed PCR-policy unlock | local key policy remains deployment-governed; TPM auto-unlock is not universal authorization |
| `REF-SYSTEMD-UKI` | https://www.freedesktop.org/software/systemd/man/latest/ukify.html | signed Unified Kernel Images and embedded signed PCR policy material | one part of Aksara's boot trust chain, not an updater/authority system |
| `REF-SYSTEMD-SYSUPDATE` | https://www.freedesktop.org/software/systemd/man/latest/systemd-sysupdate.html and https://www.freedesktop.org/software/systemd/man/latest/systemd-repart.html | image/partition A/B-style atomic updates, verity resources and boot-attempt patterns | evaluate for Debian appliance profile; institutional state lives outside rebuildable OS image |
| `REF-KEYLIME` | https://keylime.readthedocs.io/en/latest/design/overview.html and https://keylime.readthedocs.io/en/latest/design/push_model.html | TPM/UEFI/IMA attestation, verifier/registrar and revocation; NAT-friendly push design | stable pull model/reference for P1; push model stays research while upstream marks it experimental |
| `REF-EVE-SECURITY` | https://github.com/lf-edge/eve/blob/master/docs/SECURITY.md and https://github.com/lf-edge/eve/tree/master/pkg/pillar/evetpm | unattended-edge physical threat model, TPM-sealed vault, measured boot, attestation and upgrade-key recovery patterns | code/pattern reference only; Aksara remains Debian/systemd-based and fixes authority above the OS |
| `REF-KOPIA` | https://kopia.io/docs/features/ and https://kopia.io/docs/advanced/ransomware-protection/ | mandatory client-side encryption, deduplicated snapshots, verification and S3 Object Lock extension | backup implementation behind Aksara snapshot/recovery contracts; maintenance/retention health is explicit |
| `REF-BIZNET-OBJECTLOCK` | https://support.biznetgio.com/portal/id/kb/articles/mengenal-object-lock-pada-layanan-neo-object-storage and https://support.biznetgio.com/portal/id/kb/articles/getting-started-neo-object-storage | Indonesia S3-compatible object storage, Governance/Compliance/Legal Hold and published GB pricing | policy-selected backup target, never owner of plaintext recovery keys |
| `REF-R2-BUCKETLOCK` | https://developers.cloudflare.com/r2/buckets/bucket-locks/ | native R2 age/date/indefinite delete/overwrite protection | distinct provider capability; do not mislabel it as S3 Object Lock API support |
| `REF-R2-PRICING` | https://developers.cloudflare.com/r2/pricing/ | current R2 storage/operation economics and zero Internet egress charge | pricing snapshot only; Aksara budget model remains provider-neutral |
| `REF-B2-OBJECTLOCK` | https://www.backblaze.com/docs/cloud-storage-object-lock and https://www.backblaze.com/cloud-storage/pricing | low-cost S3-compatible DR storage and compliance/governance retention | cross-border secondary target only when deployment policy permits |
| `REF-CF-AIG-SPEND` | https://developers.cloudflare.com/ai-gateway/features/spend-limits/ | cost-based budgets scoped by provider/model/custom metadata and fallback routing | inspiration/adapter for `ComputeBudget`; canonical UsageLedger stays Aksara-owned |
| `REF-CF-AIG-LOGGING` | https://developers.cloudflare.com/ai-gateway/observability/logging/ | request/payload logging controls and metadata-only/no-log options | Aksara EgressPolicy chooses what may be logged; provider logs never become institutional memory |
| `REF-DEKA-LLM` | https://www.cloudeka.id/products/deka-llm/ | Indonesia-hosted OpenAI-compatible managed LLM lane and residency claim | provider candidate only; not evidence of confidential-compute/TEE execution |
| `REF-GEMINI-ZDR` | https://ai.google.dev/gemini-api/docs/zdr | explicit zero-data-retention conditions and Live session-resumption retention caveat | provider policy input to EgressPolicy; does not relax room/audience privacy |
| `REF-GEMINI-TERMS` | https://ai.google.dev/gemini-api/terms | paid-service data-use and limited abuse/security logging terms | contractual/provider fact pinned by date; sensitive egress still requires deployment approval |
| `REF-QWEN3-ASR` | https://huggingface.co/Qwen/Qwen3-ASR-0.6B and https://huggingface.co/Qwen/Qwen3-ASR-1.7B | Apache-2.0 multilingual offline/streaming ASR including Indonesian and Malay | candidate only; Papuan Malay/code-switch/room performance must be measured locally |
| `REF-SHERPA-TTS-ID` | https://k2-fsa.github.io/sherpa/onnx/tts/all/Indonesian/index.html | explicit offline Indonesian ONNX/Piper-style TTS options across CPU/mobile architectures | availability/privacy floor; not assumed to match cloud expressive quality |
| `REF-GLINER25-DECIDE` | https://huggingface.co/fastino/GLiNER2.5-Decide | 340M non-generative typed operational classification with arbitrary label sets | bounded scorer only; vendor benchmark is not independent authority evidence |
| `REF-GLINER25-MULTI` | https://huggingface.co/fastino/gliner2.5-multi-v1 | multilingual 287M extraction/classification/records/relations checkpoint | benchmark for Indonesian/multilingual System-One tasks; distinct from Decide |
| `REF-MIMO26-9B` | https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | MIT 9B Qwen3.5-derived agentic SFT for coding/general tools/visual coding | local planner candidate; P1 CPU/RAM/latency must be measured on actual hardware |
| `REF-MINERU` | https://github.com/opendatalab/MinerU | local document parsing with pipeline/VLM/hybrid modes, Office/PDF/image support and multilingual OCR | one `DocumentParserPort` implementation; original bytes remain canonical and exact release/license is pinned |
| `REF-PARSEBENCH` | https://arxiv.org/abs/2604.08538 | enterprise-oriented evidence that document-parser capability remains fragmented across tables/charts/grounding/faithfulness | supports parser bakeoff/validation rather than declaring one universal engine |
| `REF-VERCEL-AI-SDK-LOOP` | https://ai-sdk.dev/docs/agents/loop-control | typed/streaming TS tool-loop primitives, explicit stop/prepare controls and custom-loop escape hatch | code donor for Aksara Minimal Loop TS; no framework-owned institutional memory/authority |
| `REF-YOAGENT` | https://github.com/yologdev/yoagent | stateless Rust `agent_loop`, native provider streams, tool middleware, cancellation/limits and mock testing | young reference/bakeoff candidate; Aksara disables/ignores optional state layers it does not own |
| `REF-RIG` | https://rig.rs/docs/concepts/agent/ | Rust provider/tool abstractions, streaming, sans-I/O run state and hookable runner | broader alternative/code donor; RAG/memory/workflows remain outside Aksara authority |

| `REF-ODK` | https://docs.getodk.org/central-intro/ | mature offline/field forms, projects, roles, entities and API surface | integrate where useful; Aksara keeps work/evidence/authority semantics above it |
| `REF-OPENFN` | https://docs.openfn.org/adaptors | public-service/humanitarian integration workflows and adapters | hosted/regional interoperability candidate; external effects still pass Aksara policy/receipts |
| `REF-DHIS2` | https://dhis2.org/android/ | offline-capable longitudinal/program data capture where already deployed | integrate, do not rebuild a registry |
| `REF-OPENSID` | https://github.com/OpenSID/opensid and https://panduan.opendesa.id/id/api-satu-data | village information-system and Satu Data integration patterns | named/versioned adapter; actual access/permissions confirmed per deployment |
| `REF-MUKURTU` | https://docs.mukurtu.org/communities-cultural-protocols-categories/UnderstandingCommunitiesAndCulturalProtocols/ | communities, membership and cultural protocol patterns | governance inspiration/integration for Indigenous packs; local custodians decide the rules |
| `REF-PAPERLESS` | https://github.com/paperless-ngx/paperless-ngx | mature document archive/search/operator patterns | benchmark before writing a full DMS; original/canonical artifacts remain policy-governed |
| `REF-OPENFGA` | https://openfga.dev/docs/learn/policy-engine | relationship-heavy authorization and reverse membership queries | benchmark against local relationship store + Cedar; not automatically a P1 dependency |
| `REF-ZITADEL` | https://github.com/zitadel/zitadel | external OIDC/identity-provider reference | prefer existing institution IdP; Aksara still owns offline identity binding/access context |
| `REF-DECIDIM` | https://decidim.org/features/ | participatory spaces/processes and accountable civic workflow patterns | benchmark for deliberation; not a substitute for local mandate/consent semantics |
| `REF-RAPIDPRO` | https://www.unicef.org/innovation/rapidpro | multichannel outreach/survey/response patterns | channel/reference only; public chat remains budgeted and consented |
| `REF-OPEN311` | https://wiki.open311.org/GeoReport_v2/ and https://github.com/mysociety/fixmystreet | service request identity, status, jurisdiction routing and tracking | domain-model reference for WorkObject, not required implementation |
| `REF-FRAPPE-HELPDESK` | https://github.com/frappe/helpdesk and https://docs.frappe.io/helpdesk/service-level-agreement | ticket assignment, SLA and operator workflow semantics | code donor/reference; Aksara canonical case/work state remains local |
| `REF-CHATWOOT` | https://github.com/chatwoot/chatwoot | mature omnichannel inbox/team/webhook surface | optional channel adapter; not the canonical WorkObject store |
| `REF-MESHTASTIC` | https://meshtastic.org/ | open low-bandwidth mesh/store-and-forward reference for future continuity transport | research transport only; Aksara semantics remain transport-independent and large/model payloads stay off this path |


| `REF-FLUE` | https://github.com/withastro/flue and https://flueframework.com/docs/guide/durability/ | durable accepted submissions, continuing conversation streams, recovery/fencing, Node/Cloudflare targets | candidate for resident session/turn durability only; WorkObject/workflow/effect truth remains Aksara-owned |
| `REF-PLAYWRIGHT-MCP` | https://playwright.dev/mcp/introduction | accessibility-snapshot browser control, persistent/isolated profiles, tracing/storage/vision capabilities | deterministic browser baseline behind `WorkstationBridgeRuntime`; session authority remains Aksara |
| `REF-STAGEHAND` | https://docs.stagehand.dev/v4/basics/observe | AI-assisted `observe`/`act`/`extract`, deterministic replay and secret placeholder variables | browser hands only; resident planner, approval and institutional effects stay outside |
| `REF-BROWSER-USE` | https://github.com/browser-use/browser-use | mature autonomous browser-agent implementation and authenticated profile patterns | bounded benchmark/reference; not canonical institutional browser state |
| `REF-SKYVERN` | https://github.com/Skyvern-AI/skyvern | visual/browser workflow automation and operational RPA patterns | benchmark/reference; AGPL and runtime ownership require deliberate deployment decision |
| `REF-STEEL` | https://github.com/steel-dev/steel-browser | self-hostable browser sandbox/API for agent sessions | optional hosted/regional browser pool, not Node requirement |
| `REF-BROWSERBASE` | https://docs.browserbase.com/platform/browser/observability/session-live-view | managed browser sessions, persistent contexts and human live takeover | optional egress/provider path under Aksara privacy/session policy |
| `REF-PIKVM` | https://docs.pikvm.org/api/ | mature authenticated KVM video/HID/state APIs | KVM substrate only; Aksara adds machine/session authority, TTL, stop and reconciliation |
| `REF-LAPIS-PAMIR` | https://www.pamir.ai/ and https://shop.pamir.ai/products/lapis-one-white | integrated agent-computer/peripheral/KVM product pattern | product reference, not field/reliability/local-LLM proof |
| `REF-GUARDIAN-CONNECTOR` | https://docs.guardianconnector.net/overview/ and https://docs.guardianconnector.net/overview/design-principles/data-sovereignty/ | Indigenous guardianship connective infrastructure, community-controlled hosting, open formats and integration-first field data | integrate/partner for field data; Aksara adds conversational intelligence, memory, action and federation |
| `REF-COMAPEO` | https://awana.digital/comapeo | offline Indigenous territorial mapping/monitoring and peer-to-peer secured data sharing | integrate field observations/mapping rather than rebuild them |
| `REF-ERPNEXT` | https://docs.frappe.io/erpnext/integrating-erpnext-with-other-applications | self-hostable operational records with consistent REST DocType APIs/webhooks | cooperative/back-office system of record; Aksara remains intelligence/action layer |
| `REF-MOODLEBOX` | https://moodlebox.net/en/ | low-cost local/offline Moodle appliance and Wi-Fi learning server pattern | education substrate/reference, not Aksara Node replacement |
| `REF-EARTHRANGER` | https://www.earthranger.com/news/serca and https://support.earthranger.com/en_US/step-17-integrations-api-data-exports/earthranger-api | mature conservation field/command platform, offline/mobile direction, sensor/event APIs and SMART integration | integrate/partner; do not rebuild conservation operations |
| `REF-SENSORTHINGS` | https://ogcapi.ogc.org/sensorthings/overview.html | interoperable Thing/Sensor/Datastream/Observation/FeatureOfInterest semantics | semantic reference for Aksara Observation, not a mandatory server |
| `REF-HOMEASSISTANT-WYOMING` | https://www.home-assistant.io/integrations/wyoming | small protocol wiring local ASR/TTS/wake services into a device/room ecosystem | room/voice subsystem candidate behind Aksara audience/policy |
| `REF-ESPHOME` | https://esphome.io/components/voice_assistant/ | microcontroller voice-satellite/device integration and local control primitives | peripheral subsystem/reference; Aksara owns conversation identity/audience |
| `REF-FLEDGE` | https://fledge-iot.readthedocs.io/en/develop/storage.html | edge sensor buffering/storage and pluggable north/south services | field/industrial data-plane candidate; observation semantics remain Aksara/SensorThings-derived |
| `REF-BLUESKY` | https://blueskyproject.io/ | plan/run/document model for scientific experiments | research-pack execution substrate; research authority/review stays outside agent |
| `REF-OPHYD` | https://blueskyproject.io/ophyd/architecture.html | instrument/device abstraction for Bluesky | pack-level integration rather than rebuilding instrument drivers |
| `REF-LABGRID` | https://labgrid.readthedocs.io/en/stable/overview.html | controlled remote hardware test/automation infrastructure | research/hardware-test pack candidate |
| `REF-OPENFLEXURE` | https://openflexure.org/projects/microscope/ | accessible open instrument infrastructure | research/education reference, no implied diagnostic use |
| `REF-LF-EVE` | https://github.com/lf-edge/eve and https://eve-os.readthedocs.io/docs/SECURITY-HARDWARE/ | managed edge OS, TPM/attestation/vault/update/workload isolation patterns | later appliance/fleet bakeoff; does not replace Aksara institutional kernel |
| `REF-BALENA` | https://www.balena.io/os and https://blog.balena.io/queued-os-updates-managed-by-the-supervisor/ | mature edge fleet OS/update/device operations patterns | operations benchmark/alternative, not current P1 base |
| `REF-ANY` | https://docs.any.org/index.html and https://docs.any.org/understanding/architecture.html and https://github.com/anyproto/any-store | developer-preview local-first reactive database, FTS/vector indexes and embedded runtime direction | consolidation candidate below Aksara semantics; preview/auth/ops caveats block promotion |
| `REF-ANY-SYNC` | https://tech.anytype.io/any-sync/overview and https://github.com/anyproto/any-sync | encrypted CRDT local-first/LAN/P2P synchronization and self-hostable network | bakeoff input; Any space/account semantics never become Aksara authority implicitly |
| `REF-MCP-GATEWAY-REGISTRY` | https://github.com/agentic-community/mcp-gateway-registry and https://agentic-community.github.io/mcp-gateway-registry/ | governed registry/gateway for MCP, A2A, skills, inference and generic REST with credentials/scopes/audit | consolidation candidate; Aksara keeps institutional authority/budget/public-private semantics |
| `REF-AGNTCY` | https://docs.agntcy.org/ and https://dir.agntcy.org/latest/ | OASF metadata plus federated Agent Directory for framework-neutral agent/MCP/skill discovery | standards/reference before proprietary Aksara global capability directory |
| `REF-SMOLVM` | https://github.com/smol-machines/smolvm | portable hardware-isolated local microVMs, no daemon, network-off-default and egress allowlists | local heavy-worker isolation bakeoff; Aksara retains effects/credentials/artifacts |
| `REF-OPENCONNECTOR` | https://github.com/oomol-lab/open-connector | Apache-2.0 self-hostable connector catalogue with OAuth/API-key brokerage and MCP/HTTP/OpenAPI surfaces | generic connector substrate candidate; capability policy/receipts stay Aksara-owned |
| `REF-AGENT-DESKTOP` | https://github.com/lahfir/agent-desktop | Rust OS-accessibility-tree computer control with stable refs and CDP handoff | native-computer code donor; current macOS-first support blocks Linux-P1 dependency |
| `REF-MOSS-TRANSCRIBE` | https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize | 0.9B Apache-2.0 long-form ASR + timestamps + diarization + acoustic-event model | combined speech challenger; Indonesian/Papuan quality must be measured locally |
| `REF-VOXCPM2` | https://github.com/OpenBMB/VoxCPM | Apache-2.0 2B multilingual expressive TTS with Indonesian/Malay support and voice design/cloning | Node+ expressive candidate; does not replace CPU privacy floor; benchmark compute/RTF |
| `REF-K2-HORIZON` | https://ifm.ai/blog/k2/ and https://huggingface.co/collections/IFM/k2-horizon | Apache-2.0 0.9B/3.7B/7B+ model family with open training artifacts and tool/reasoning support | local cognition bakeoff; upstream benchmark claims require reproduction |
| `REF-TABDPT` | https://pypi.org/project/tabdpt/1.3.0/ and https://huggingface.co/Layer6/TabDPT | tabular in-context foundation model for classification/regression; v1.3 adds improved performance/probabilistic regression | evaluate against GBDT baselines on Aksara tables |
| `REF-TABICLV2` | https://github.com/soda-inria/tabicl and https://arxiv.org/abs/2602.11139 | open tabular FM checkpoints/inference for classification/regression, ICML 2026 | evaluate; verify exact commercial/license posture before deployment |
| `REF-FOUNDATIONFORECAST` | https://pypi.org/project/foundationforecast/ and https://timecopilot.dev/ | unified API over multiple time-series foundation models and reproducible evaluation tooling | capability substrate/code donor; not authority or scientific validation by itself |
| `REF-GRANITE-TS-R2` | https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r2 | ~385M probabilistic forecasting/imputation TSFM under permissive model licensing | time-series candidate; reproduce on local vertical data |
| `REF-CARBON-DNA` | https://huggingface.co/HuggingFaceBio/Carbon-3B and https://huggingface.co/HuggingFaceBio/Carbon-8B | 500M/3B/8B genomic foundation-model family for DNA/RNA research | Aksara Science watch; license/compute/domain validation required |
| `REF-FLUX3-ACTION` | https://bfl.ai/models/flux-3-action and https://github.com/black-forest-labs/flux-action | 7B open-weight world-action model with LeRobot adaptation path | research/robotics watch; FLUX Kommunity weight license and GPU cost block base use |
| `REF-FLINT` | https://github.com/microsoft/flint-chart | semantic chart intermediate language compiling to multiple web/office renderers with MCP support | deterministic visualization code donor for Aksara/Klerk |
| `REF-GEOLIBRE` | https://github.com/opengeos/geolibre | MIT local/private geospatial workspace using MapLibre + DuckDB-WASM across browser/desktop/mobile/Jupyter | field/science GIS adapter candidate; custody/state remain external/Aksara-governed |
| `REF-OPENMANET` | https://github.com/OpenMANET/docs and https://github.com/OpenMANET/firmware | Wi-Fi HaLow/OpenWrt IP MANET with mesh routing and optional GPS/PTT/camera services | future medium-bandwidth TransportPort candidate; regulatory/link-budget tests required |
| `REF-JETKVM-MINI` | https://jetkvm.com/products/jetkvm-mini | announced low-cost ESP32-P4X Ethernet KVM with 1080p capture and open-source firmware direction | watch until shipping; compare with mature PiKVM before promotion |
| `REF-LEMONADE` | https://github.com/lemonade-sdk/lemonade/releases | rapidly evolving local-AI server/runtime with strong AMD APU/NPU/GPU focus and multi-platform packages | Node+ bakeoff; pin known-good versions due high release velocity |
| `REF-ESP32-AI` | https://github.com/slvDev/esp32-ai | experimental flash-heavy tiny language-model inference pattern on ESP32-S3 | code-donor watch for compact classifiers/representations, not P1 chat model |
| `REF-DECIMEN` | https://github.com/bashalarmistalt/decimen-optical-transfer | fountain-coded animated-QR optical transfer experiment | low-priority air-gap/bootstrap reference only |

| `REF-COMPANY-BRAIN` | https://github.com/supermemoryai/company-brain | Apache-2.0 multi-user Slack/company-agent harness with durable execution, scoped/shared memory UX, approvals, schedules, MCP/apps and proactive team participation | high-priority code donor for Aksara multiplayer/channel shell; Aksara keeps canonical identity, memory authority, effects and offline/custody semantics |
| `REF-XIAOZHI` | https://github.com/78/xiaozhi-esp32 | MIT ESP32 agent-device firmware with wake/VAD/AEC, Opus/realtime voice transports, displays, cameras, battery/device support and MCP patterns | primary Card firmware/code donor; replace hosted semantics with Aksara session/privacy/device contracts |
| `REF-XIAO-SENSE` | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html | compact ESP32-S3 prototype board with PSRAM, camera/mic expansion, Wi-Fi/BLE, storage/battery-development path | immediate Card prototype core, not final production BOM |
| `REF-OMI-HW` | https://github.com/BasedHardware/omi/tree/main/omi/hardware/consumer | open wearable hardware/firmware/manufacturing references for RF, microphones, battery, charging, storage, haptics and mechanical production | industrialization/code donor; Aksara does not inherit Omi product/backend semantics |
| `REF-RESPEAKER-CLIP` | https://github.com/Seeed-Studio/reSpeaker_Clip and https://wiki.seeedstudio.com/respeaker_clip/ | open low-power wearable dual-mic/local-storage/Opus/Zephyr/DFU/power-management design | Card audio/storage/power donor and capture reference; not the complete Card architecture |
| `REF-FOLOTOY-PASSPORT` | https://ai-passport.folotoy.cn/en/ and https://github.com/FoloToy/ai-passport | low-cost badge-like ESP32/NFC/display/mic/speaker open-firmware interaction reference | UI/proportion/NFC prototype donor; no longer the primary Card substrate |
| `REF-CF-EMAIL` | https://developers.cloudflare.com/email-routing/ and https://developers.cloudflare.com/email-service/ | programmable inbound email routing/Workers and outbound email service patterns for managed domains | optional hosted email channel adapter; canonical `InstitutionActor`/identity/effects remain Aksara-owned |

# Appendix D — Reference pin line map

Generated automatically for v0.8.1. Stable `REF-*` identifiers are canonical; literal line numbers are secondary.

## Generated line map

| Reference pin | Lines in v0.8.1 |
|---|---:|
| `REF-A2A` | 5062, 5096, 5185, 5286, 6596 |
| `REF-A2UI` | 459, 3451, 6578 |
| `REF-ACTIVITYPUB` | 5062, 5163, 6597 |
| `REF-ACTIVITYSTREAMS` | 5062, 5163, 6598 |
| `REF-AETHEREDGE` | 3588, 6586 |
| `REF-AGENT-DESKTOP` | 1842, 6155, 6714 |
| `REF-AGENT-SUBSTRATE` | 221, 1719, 5907, 6606 |
| `REF-AGENTGATEWAY` | 2886, 6574 |
| `REF-AGENTOS` | 1759, 6571 |
| `REF-AGNTCY` | 2957, 4498, 5286, 6152, 6711 |
| `REF-AGUI` | 459, 3458, 6579 |
| `REF-AIM-MULTIUSER` | 298, 884, 1982, 2511, 6633 |
| `REF-ALEXANDRIA` | 2663, 2692, 5945, 6611 |
| `REF-ANY` | 2147, 4496, 6150, 6708 |
| `REF-ANY-SYNC` | 2147, 4496, 6150, 6709 |
| `REF-ANYDOC` | 3782, 5945, 6612 |
| `REF-ASSOMEM` | 2368, 6560 |
| `REF-ASTRA-ARES` | 2556, 6620 |
| `REF-AX` | 221, 1719, 5907, 6605 |
| `REF-B2-OBJECTLOCK` | 1232, 1346, 6651 |
| `REF-BALENA` | 4189, 4495, 6707 |
| `REF-BEND` | 236, 504, 6551 |
| `REF-BIFROST` | 2905, 6575 |
| `REF-BISCUIT` | 685, 6562 |
| `REF-BIZNET-OBJECTLOCK` | 1232, 1342, 6648 |
| `REF-BLUESKY` | 2864, 4494, 6702 |
| `REF-BROWSER-USE` | 1855, 4483, 6687 |
| `REF-BROWSERBASE` | 1859, 4484, 6690 |
| `REF-BUBBALOOP` | 3588, 6585 |
| `REF-CARBON-DNA` | 3841, 6166, 6722 |
| `REF-CAURA` | 1913, 2025, 2041, 2067, 2372, 6632 |
| `REF-CEDAR` | 678, 6561 |
| `REF-CEDAR-VALIDATION` | 7250, 7491 |
| `REF-CF-AIG-LOGGING` | 2949, 6653 |
| `REF-CF-AIG-SPEND` | 2949, 6652 |
| `REF-CF-DO` | 3922, 6592 |
| `REF-CF-EMAIL` | 3086, 4476, 6181, 6738 |
| `REF-CF-WORKFLOWS` | 1195, 3922, 6567 |
| `REF-CFOS` | 656, 6573 |
| `REF-CHATWOOT` | 1438, 2759, 6680 |
| `REF-CLI-ANYTHING` | 2634, 5945, 6623 |
| `REF-COLLAB-MEMORY` | 884, 1913, 2020, 6634 |
| `REF-COMAPEO` | 2775, 2849, 4487, 6694 |
| `REF-COMPANY-BRAIN` | 3022, 4473, 6175, 6732 |
| `REF-CONNECT` | 605, 6548 |
| `REF-DBOS` | 1195, 6565 |
| `REF-DECIDIM` | 2762, 6676 |
| `REF-DECIMEN` | 6174, 6730 |
| `REF-DEKA-LLM` | 2981, 6654 |
| `REF-DHIS2` | 2754, 2841, 6670 |
| `REF-DRAC` | 3787, 5945, 6622 |
| `REF-DUROXIDE` | 1193, 6563 |
| `REF-DUROXIDE-OPS` | 7022, 7117, 7181, 7246, 7490 |
| `REF-EARTHRANGER` | 2849, 2851, 4491, 6697 |
| `REF-EMBEDDED-GRAPHICS` | 3531, 6580 |
| `REF-EMBEDDED-HAL` | 3567, 6583 |
| `REF-ERPNEXT` | 2810, 4490, 6695 |
| `REF-ESP32-AI` | 6173, 6729 |
| `REF-ESPHOME` | 3672, 4492, 6700 |
| `REF-EVE` | 1760, 6572 |
| `REF-EVE-SECURITY` | 931, 1028, 1030, 6646 |
| `REF-FALKORDB-LITE` | 2200, 5574, 5576, 6600 |
| `REF-FLEDGE` | 3673, 4493, 6701 |
| `REF-FLINT` | 3477, 6168, 6724 |
| `REF-FLUE` | 4478, 6684 |
| `REF-FLUX3-ACTION` | 3844, 6167, 6723 |
| `REF-FOLOTOY-PASSPORT` | 267, 4109, 6180, 6737 |
| `REF-FOUNDATIONFORECAST` | 3720, 3722, 3842, 6164, 6720 |
| `REF-FRAPPE-HELPDESK` | 1438, 2758, 6679 |
| `REF-GEMINI-TERMS` | 3121, 6656 |
| `REF-GEMINI-ZDR` | 3097, 3121, 6655 |
| `REF-GEMINI38-TTS` | 3097, 3207, 3866, 6627 |
| `REF-GEOLIBRE` | 3495, 6169, 6725 |
| `REF-GLINER25-DECIDE` | 3749, 6659 |
| `REF-GLINER25-MULTI` | 3751, 6660 |
| `REF-GMEMORY` | 6636 |
| `REF-GRANITE-TS-R2` | 3720, 3724, 3842, 6165, 6721 |
| `REF-GRAPHITI` | 461, 1913, 2198, 2582, 5574, 6555 |
| `REF-GROKBOT` | 6641 |
| `REF-GUARDIAN-CONNECTOR` | 2775, 2777, 2849, 4486, 6693 |
| `REF-HERMES` | 219, 708, 820, 1460, 2990, 2992, 5853, 6628 |
| `REF-HOMEASSISTANT-WYOMING` | 3672, 4492, 6699 |
| `REF-HORMA` | 1913, 2217, 6558 |
| `REF-III-HARNESS-53` | 6963, 7489 |
| `REF-INTENT` | 221, 1671, 1698, 3365, 5907, 5963, 6607 |
| `REF-INTENT-DIAGRAMS` | 459, 3365, 3446, 5927, 6608 |
| `REF-JETKVM-MINI` | 4135, 6171, 6727 |
| `REF-JEV-MEM` | 2336, 6617 |
| `REF-K2-HORIZON` | 3759, 6161, 6717 |
| `REF-KEYLIME` | 931, 1026, 6645 |
| `REF-KOLIBRI` | 2793, 2795, 4489, 5337, 5361, 6601 |
| `REF-KOPIA` | 1232, 1322, 6647 |
| `REF-LABGRID` | 2864, 6704 |
| `REF-LANCEDB` | 2367, 6554 |
| `REF-LANGFUSE` | 3969, 6591 |
| `REF-LAPIS-PAMIR` | 1879, 4194, 6692 |
| `REF-LEMONADE` | 4136, 6172, 6728 |
| `REF-LETTA-SHARED` | 2372, 6640 |
| `REF-LF-EVE` | 4188, 4495, 6706 |
| `REF-LIBRECHAT-ACL` | 708, 6638 |
| `REF-LIVEKIT` | 3097, 6577 |
| `REF-LOCALCONTEXTS` | 1162, 1178, 2756, 2775, 4488, 5337, 5505, 6604 |
| `REF-LVGL` | 3544, 6581 |
| `REF-MAF` | 1481, 6569 |
| `REF-MCP-GATEWAY-REGISTRY` | 2957, 4498, 5286, 6151, 6710 |
| `REF-MCP-REGISTRY` | 2656, 5286, 6589 |
| `REF-MESHTASTIC` | 3598, 6681 |
| `REF-MIMO26-9B` | 3761, 6661 |
| `REF-MINERU` | 3784, 3831, 6662 |
| `REF-MIRIX` | 1936, 6635 |
| `REF-MONTY` | 307, 1585, 1587, 5909, 6156, 6615 |
| `REF-MOODLEBOX` | 2793, 4489, 6696 |
| `REF-MOSS-TRANSCRIBE` | 3164, 3860, 4500, 6158, 6715 |
| `REF-MUKURTU` | 1162, 1178, 2756, 2775, 4488, 6672 |
| `REF-NEMOTRON-DIAR` | 310, 3097, 3180, 3862, 6626 |
| `REF-ODK` | 2752, 2775, 2849, 6668 |
| `REF-OMI-HW` | 267, 4107, 4475, 6178, 6735 |
| `REF-OPEN-JEV-FINETUNE` | 308, 2532, 6619 |
| `REF-OPEN311` | 1438, 6678 |
| `REF-OPENBOT` | 306, 708, 784, 3458, 5927, 6610 |
| `REF-OPENCLAW` | 219, 708, 754, 820, 2990, 2994, 5861, 6629 |
| `REF-OPENCONNECTOR` | 2728, 4497, 6154, 6713 |
| `REF-OPENEMIS` | 5337, 5362, 6602 |
| `REF-OPENFGA` | 2760, 6674 |
| `REF-OPENFLEXURE` | 2864, 6705 |
| `REF-OPENFN` | 2753, 2841, 6669 |
| `REF-OPENHANDS` | 300, 1768, 4480, 4846, 6637 |
| `REF-OPENMANET` | 3613, 4502, 6170, 6726 |
| `REF-OPENMUSE` | 3458, 5927, 6609 |
| `REF-OPENSID` | 2755, 6671 |
| `REF-OPENWEBUI-CHANNELS` | 6639 |
| `REF-OPHYD` | 2864, 4494, 6703 |
| `REF-OPTMEM` | 461, 1913, 2217, 6556 |
| `REF-ORAS` | 2654, 6587 |
| `REF-ORCAROUTER` | 2906, 6576 |
| `REF-OTEL-GENAI` | 3962, 6590 |
| `REF-OTEL-SAMPLING` | 7292, 7492 |
| `REF-PAPERLESS` | 2757, 6673 |
| `REF-PARSEBENCH` | 3785, 3831, 6663 |
| `REF-PDF-INSPECTOR` | 3783, 5945, 6613 |
| `REF-PIEFED17` | 5062, 5315, 5324, 5328, 6599 |
| `REF-PIKVM` | 1867, 4485, 6691 |
| `REF-PLAYWRIGHT-MCP` | 1827, 4481, 6685 |
| `REF-PYDANTICAI` | 234, 499, 1488, 6570 |
| `REF-QWEN3-ASR` | 3097, 3160, 3860, 6657 |
| `REF-R2-BUCKETLOCK` | 1232, 1344, 6649 |
| `REF-R2-PRICING` | 1344, 6650 |
| `REF-RAPIDPRO` | 2763, 6677 |
| `REF-RESPEAKER-CLIP` | 267, 4108, 4475, 6179, 6736 |
| `REF-RESTATE` | 1194, 6564 |
| `REF-RIG` | 1544, 4479, 5880, 6666 |
| `REF-RUST` | 232, 472, 6546 |
| `REF-SATUSEHAT-FHIR` | 2841, 5337, 5404, 6603 |
| `REF-SCIENCEBUDDY` | 5052, 6625 |
| `REF-SENSORTHINGS` | 3633, 4493, 6698 |
| `REF-SHERPA-TTS-ID` | 3097, 3186, 3864, 6658 |
| `REF-SIGSTORE` | 2655, 6588 |
| `REF-SKYVERN` | 1855, 4483, 6688 |
| `REF-SMOLVM` | 1700, 4499, 6153, 6712 |
| `REF-SQLITE` | 2133, 2365, 6552 |
| `REF-SQLITE-VEC` | 2366, 6553 |
| `REF-STAGEHAND` | 1829, 4482, 6686 |
| `REF-STEEL` | 1859, 4484, 6689 |
| `REF-STRANDS` | 1495, 4477, 5867, 6614 |
| `REF-SYSTEM-ONE-OPEN` | 308, 2532, 6618 |
| `REF-SYSTEMD-CRYPT` | 931, 972, 6642 |
| `REF-SYSTEMD-SYSUPDATE` | 1069, 6644 |
| `REF-SYSTEMD-UKI` | 931, 972, 6643 |
| `REF-TABDPT` | 3720, 3726, 3843, 6162, 6718 |
| `REF-TABICLV2` | 3720, 3726, 3843, 6163, 6719 |
| `REF-TEMPORAL` | 1195, 6566 |
| `REF-TIMEM` | 461, 1913, 2217, 6557 |
| `REF-TIMESFM` | 3720, 6594 |
| `REF-TMEM` | 461, 1913, 2246, 6559 |
| `REF-TOKIO` | 232, 472, 6547 |
| `REF-TREG` | 5945, 6624 |
| `REF-TTM` | 3720, 6595 |
| `REF-UNIVER` | 309, 3786, 5945, 6621 |
| `REF-VELLUM` | 233, 1447, 4472, 5823, 6568 |
| `REF-VELLUM-IDENTITY` | 219, 302, 708, 754, 760, 888, 1451, 2990, 2996, 4818, 5823, 5849, 6630 |
| `REF-VELLUM-MEMORY-V3` | 1451, 1936, 5823, 6631 |
| `REF-VERCEL-AI-SDK-LOOP` | 1535, 5880, 6664 |
| `REF-VJEPA2` | 3720, 6593 |
| `REF-VOXCPM2` | 3201, 3864, 4501, 6159, 6716 |
| `REF-WASI-CM` | 235, 613, 1662, 6550 |
| `REF-WASMTIME` | 235, 613, 1662, 1666, 6157, 6549 |
| `REF-WINDMILL` | 1225, 6616 |
| `REF-WOT` | 3554, 3633, 6582 |
| `REF-XIAO-SENSE` | 267, 4106, 4474, 6177, 6734 |
| `REF-XIAOZHI` | 267, 4105, 4474, 6176, 6733 |
| `REF-YOAGENT` | 1543, 4479, 5880, 6665 |
| `REF-ZENOH` | 3574, 6584 |
| `REF-ZITADEL` | 2761, 6675 |

# Appendix E — Historical v0.2 → v0.3 change summary

v0.3 keeps the v0.2 trusted-kernel, polyglot, simulator-first and replaceable-capability architecture, while adding:

- a first-class **Associative Trigger Index** inspired by T-Mem;
- explicit **policy-first trigger retrieval** and access inheritance;
- `decision.score(memory.activation)` as a bounded-judgment primitive;
- a clear split between **Irama/world-side anticipation** and **memory-side prospective recall**;
- a documented composition of Graphiti + Continuity Tree + Trigger Index + Context Assembler;
- zero-overlap associative-recall acceptance tests;
- source/inspiration pins across the major technology stack;
- a generated source-pin line map for later architectural archaeology.

The new memory architecture is intentionally additive. T-Mem is not declared to be “Aksara memory”; it contributes one missing retrieval primitive to a governed institutional memory system.

---

# Appendix F — Production agent-harness failure addendum

**Patch:** v0.4.1  
**Status:** architecture hardening addendum; does not rewrite the v0.4 body  
**Primary empirical input:** `iii-harness-53-bugs.md`, mfpiccolo, 21 September 2026. [REF-III-HARNESS-53]

This appendix treats the 53 production failures as an empirical adversarial checklist. It is not an endorsement of the `iii` harness architecture, and implementation-specific bugs are not copied into Aksara as requirements. The useful lesson is broader:

> **An agent harness is a distributed system with unusually expensive, stateful and nondeterministic workers. Ordinary queue, stream, cancellation, authorization, storage, supervision and observability bugs become agent bugs unless those concerns have explicit contracts.**

The v0.4 architecture already anticipates many of these classes structurally: canonical state sits outside the resident agent runtime; consequential effects pass through `aksara-execd`; idempotency fencing and leases exist; Duroxide is isolated behind `DurableRuntime`; the SQLite outbox is durable truth; Protobuf/WIT provide typed boundaries; Cedar is default-deny; and Ledger is separated from high-volume tracing. The gist nevertheless exposes several operational contracts that were implicit or absent. Those contracts are made explicit here.

## F.1 What v0.4 already gets right

The following failure families are substantially addressed by existing architectural decisions, although acceptance tests are still required.

| Failure family from the production corpus | Existing Aksara guardrail | Remaining work |
|---|---|---|
| crash/restart in long-running work | `DurableRuntime` port, Duroxide prototype, SQLite/outbox, explicit fault tests | define turn/work-item state machine and poison handling |
| duplicate external effects | `aksara-execd` idempotency fencing, proposal/commit split, Capability Lease | bind approval + execution claim atomically; require idempotency keys on every `Act` capability |
| malformed or overpowered authorization | Cedar + Aksara-owned ActorContext/authority semantics | strict policy admission and schema/request validation before activation |
| runtime-specific memory corruption | canonical institutional state outside Vellum/Hermes/agentOS | keep runtime session state disposable; restore tests |
| tool/schema drift | Proto/Buf + WIT + compatibility tests | add runtime readiness/version barrier before accepting turns |
| private reasoning leaking as public truth | ETNOS publication gate + public trace contract | preserve this split in all observability/export paths |
| provider/runtime replacement | resident cognition and gateways behind ports | make fallback behavior explicit and fail closed when metadata is unknown |
| high-volume traces becoming institutional truth | Ledger != Trace | add telemetry budgets, sampling and disk/cardinality quotas |
| polling as orchestration | Duroxide timers/external events, A2A task updates | explicitly prohibit sleep/status-poll loops where signals exist |

The biggest conclusion is therefore **not** “change the stack.” It is “finish the operational semantics around the stack.”

## F.2 Turn lifecycle and durable queue contract

Several failures in the corpus came from turns stuck forever, startup replay repeatedly reviving doomed work, missing durable queues, and reconnects redelivering poison messages. Aksara needs a first-class turn/work-item lifecycle rather than relying on whatever state a resident runtime happens to expose.

Freeze the semantic state machine:

```text
Queued
  ↓
Starting
  ↓
Running ──────────────┐
  │                   │
  ├→ WaitingInput     │
  ├→ WaitingApproval  │
  ├→ WaitingExternal  │
  │                   │
  └───────────────────┘
  ↓
Completed | Failed | Cancelled | Quarantined
```

Required properties:

- every durable item has `run_id`, `turn_id`, `attempt`, `runtime_epoch`, `created_at`, `updated_at`, `deadline`, `last_progress_at`, and typed terminal status;
- a terminal state is immutable except through an explicit reconciliation event;
- startup reconciliation only resumes items whose policy says they are resumable;
- retries are bounded and classified (`transient`, `rate_limited`, `permanent`, `poison`, `cancelled`);
- repeated deterministic failures move the item to **Quarantined**, not back into the normal queue;
- manual retry creates a new attempt linked to the quarantined predecessor;
- queue acknowledgement and enqueue of resulting completion/state transition are atomic where possible;
- stale workers cannot commit after their lock/epoch has expired.

Duroxide remains a strong candidate because its current runtime is explicitly turn/history based, supports correlation IDs, durable timers, external events, cancellation, retries and provider-backed peek-lock queues. Its provider contract also requires atomic acknowledgement operations. Duroxide remains **PROTOTYPE**, because preview durability software must still pass Aksara's own fault suite. [REF-DUROXIDE-OPS]

### New acceptance tests

```text
crash after dequeue but before ack
crash after external effect but before local receipt commit
boot with a permanently failing item in queue
reconnect while a poison item is pending
lock expires while old worker is still alive
manual retry of quarantined item
late completion from previous runtime_epoch
```

## F.3 Tool-call stream integrity

The corpus contains multiple variants of one dangerous bug: a provider stream ends early, partial JSON is interpreted as empty arguments, and the harness records a successful call. Aksara must not equate **connection closed** with **tool call complete**.

Freeze a provider-independent tool-call envelope:

```text
ToolCallOpened
  id
  tool
  provider_turn_ref

ToolArgsDelta*

ToolArgsFinal
  canonical_args_hash

ToolCallAuthorized
  lease_ref

ToolCallCommitted
  execution_claim_ref

ToolCallResult | ToolCallFailed | ToolCallCancelled
```

Rules:

1. `aksara-execd` never executes from a delta stream.
2. Arguments must pass full schema validation after `ToolArgsFinal`.
3. Missing `ToolArgsFinal` is an incomplete call, never `{}` and never success.
4. Transport EOF, provider finish reason, model finish reason and tool-call completeness are distinct fields.
5. Re-emitted tool-call IDs are deduplicated by logical call ID + canonical argument hash.
6. Unknown/contradictory finish reasons fail closed into retry/review, not execution.
7. Large arguments are materialized as bounded artifacts and referenced by hash rather than copied indefinitely through context.

This should be tested against deliberately truncated SSE/WebSocket streams and provider adapters.

## F.4 Runtime readiness, registration and reconnect epochs

The corpus repeatedly loses functions, duplicates hooks, races worker boot, or reconnects without replaying registrations. Aksara should treat capability registration as durable **control-plane state**, not a side effect of process startup.

Add:

```text
RuntimeEpoch
  runtime_instance_id
  epoch
  build_digest
  capability_manifest_digest
  ready_at
  expires_at/closed_at
```

A resident runtime becomes `READY` only when:

- its adapter handshake succeeds;
- the required capability manifest version is registered;
- policy schema versions are compatible;
- required workers report readiness;
- no duplicate runtime owns the same exclusive service identity.

Turn dispatch is blocked before this barrier. Reconnect creates or resumes a runtime epoch and idempotently replays registrations. Registration keys are unique on `(runtime_instance, epoch, capability, version)` and cannot silently multiply because a lagging instance counter says otherwise.

A host/port ownership lock is also required so two runtimes cannot claim one control endpoint and flap function ownership.

## F.5 Cancellation, stale writes and stop semantics

A stop/cancel operation must be a state transition with fencing, not a best-effort UI signal.

Add a monotonically increasing `turn_generation` or equivalent execution fence. Every mutation from a worker carries the generation/epoch that authorized it. Once cancellation increments the generation or closes the execution claim, later writes from the old generation are rejected.

Rules:

- `CancelRequested` is durable;
- workers receive cooperative cancellation;
- after a grace period, the supervisor may terminate the bounded worker/workspace;
- cancellation of a parent propagates to owned children unless explicitly detached by policy;
- a cancelled turn may record cleanup outcome but cannot revert itself to Running/Completed;
- stale writes fail with an explicit fenced error.

Duroxide's cooperative cancellation is useful underneath this contract, but Aksara owns the institutional semantics. [REF-DUROXIDE-OPS]

## F.6 Structured child-agent lifecycle

“Child died silently,” “parent waited forever,” and “subagents hit the turn limit but reported completed” are all failures of structured concurrency and result typing.

Every spawned leaf process needs an owned `ChildRun` object:

```text
ChildRun
  child_run_id
  parent_run_id
  purpose
  runtime
  budget
  deadline
  status
  result_ref?
  failure?
```

Terminal statuses must distinguish:

```text
Completed
Failed
Cancelled
BudgetExhausted
TurnLimitReached
TimedOut
Lost
```

`TurnLimitReached` is not `Completed`. Parent waits must have deadlines and must resolve if a child becomes `Lost`. Child death must emit a durable event visible to the parent. Parent/child control should avoid opposite lock acquisition orders; orchestration state should prefer single-writer/actor-style mutation over shared mutable locking where practical.

Reasoning/model policy also needs explicit inheritance rules. A child receives a resolved `ModelExecutionPolicy` rather than accidentally falling back to provider defaults for reasoning effort, context window or cost class.

## F.7 Approval and exactly-once effect claim

The existing proposal/approval/lease model is strong, but the corpus shows that two approvals racing can still wake one turn twice and execute a shell command twice.

The guardrail is an **Execution Claim** acquired atomically after authorization and before the side effect:

```text
ExecutionClaim
  logical_action_id
  capability
  canonical_args_hash
  lease_ref
  approval_ref
  status = claimed | committed | failed | compensated
  claimant_epoch
```

For `Act` capabilities:

- `logical_action_id` is stable across retries;
- claim acquisition is compare-and-set / unique-insert semantics;
- only the claim owner may invoke the effect;
- retries reuse the same external idempotency key where the target supports it;
- receipt commit records the external idempotency/reference ID;
- duplicate approvals attach evidence to the same logical action rather than producing another action;
- non-idempotent external systems require reconciliation/compensation strategy before the capability may be promoted to production.

Duroxide's activity model still requires side-effect code to tolerate retry; the durable runtime cannot magically make a non-idempotent external API safe. [REF-DUROXIDE-OPS]

## F.8 Timeout, heartbeat and liveness policy

A provider ping is not meaningful progress. Every outbound client and worker wait must have a deadline taxonomy:

```text
connect_timeout
read_timeout
write_timeout
idle_progress_timeout
step_deadline
turn_deadline
```

Rules:

- transport keepalive updates connection health, not `last_progress_at`;
- application progress is updated only by meaningful deltas/events;
- reconnect uses exponential backoff with jitter and a ceiling;
- repeated reset loops open a circuit breaker rather than burning CPU/network forever;
- every upstream client has a read deadline;
- timeout errors preserve which deadline fired;
- runtime hard-kill is a last resort and still produces a typed failure/reconciliation event.

Durable timers/signals are preferred over `sleep 60` loops. For A2A/ETNOS, push/stream/task-state updates should replace status polling whenever available.

## F.9 Context, compaction and token accounting invariants

The catalogue already has a Context Assembler, Continuity Tree and bounded context budget. The production corpus shows why those need hard postconditions rather than “best effort summaries.”

Add a single `ContextBudget` and `UsageLedger` per turn. Provider adapters may report billing categories, but Aksara owns normalization.

Required invariants:

- the same file/tool payload is counted once per materialization, not once per internal view;
- cached-input, uncached-input and output usage are separate fields;
- provider billing metadata never silently changes logical context accounting;
- unknown model/context-window metadata is an error, not fallback to an arbitrary smaller window;
- compaction cannot return an empty active context unless the input context is intentionally empty;
- compaction preserves active objectives, policy constraints, unresolved tool calls, approvals and source references;
- hook/tool output has a strict inline byte/token cap;
- large directory listings, dataframes, logs and documents become **Artifacts** with bounded previews/summaries;
- no tool result is “immortal” merely because it is under an arbitrary character threshold;
- context retention is relevance/policy based, not raw-size folklore;
- repeated compaction has a bounded cycle count before escalation/restart from canonical state.

A particularly important rule for the CLI/workspace: `ls -R` or equivalent unbounded filesystem enumeration is not a safe default capability. Directory listing capabilities must support depth, entry and byte limits.

## F.10 Typed result semantics and identifier safety

`null`, “no result,” `undefined`, empty output and failure must never collapse into the same representation.

Use typed envelopes across Proto/WIT boundaries:

```text
ResultEnvelope<T>
  Ok(T)
  Empty(reason)
  Failed(error)
  Cancelled(reason)
```

IDs must be full-width opaque typed IDs (for example UUIDv7/UUIDv4-class 128-bit IDs or equivalently strong identifiers), stored without truncation and backed by database uniqueness constraints. UI shortening is presentation only. Correlation must never depend on visually similar prefixes.

Provider/runtime-generated IDs that participate in deterministic replay should use the durable runtime's replay-safe ID primitives rather than ambient randomness inside orchestration code. [REF-DUROXIDE-OPS]

## F.11 Policy admission must be stricter than policy evaluation

The corpus includes a malformed deny rule that failed open. Cedar itself is default-deny and `forbid` overrides `permit`, but Cedar also documents **skip-on-error** evaluation semantics: a policy that errors is ignored. That means Aksara must not rely on runtime evaluation alone for policy correctness. [REF-CEDAR-VALIDATION]

Freeze these admission rules:

1. every Cedar policy set is validated against a versioned Cedar schema before activation;
2. schema change revalidates all active policies;
3. invalid policies are rejected from the active store rather than loaded with warnings;
4. authorization requests are constructed/validated to the schema contract;
5. production startup fails closed for a required policy bundle that cannot validate;
6. policy deployment is versioned, signed/audited, and rollbackable;
7. tests include malformed `permit` and malformed `forbid` cases;
8. permission evaluation errors produce explicit denial/incident telemetry, not silent permit through another rule.

This is especially important for collective Mandate/Cedar translation: a malformed `forbid` must never be able to disappear while a broad `permit` remains active.

## F.12 Observability must have its own resource budget

The corpus shows an agent harness self-denying service through one span per token, state writes per event, quadratic trace eviction and hundreds of megabytes of traces in quiet sessions. Aksara already separates Trace from Ledger; now trace collection gets explicit quotas.

Define `TelemetryBudget` per Node and per run:

```text
max_spans_per_turn
max_events_per_second
max_attribute_bytes
max_cardinality_per_key
max_trace_disk_bytes
retention_window
sampling_policy
```

Rules:

- never persist a span per token;
- token streaming may be aggregated into periodic counters/events;
- high-cardinality raw prompts/tool payloads are artifact references, not span attributes;
- trace exporters are non-blocking and cannot hold the institutional state lock;
- cache eviction must not run quadratic work under globally shared locks;
- disk quotas and retention are enforced locally;
- trace loss/degradation must not corrupt Ledger or block `aksara-execd`;
- security/audit events have a separate low-volume path from developer traces.

OpenTelemetry explicitly treats sampling as a cost-control mechanism; Aksara should use coherent head/tail/probability sampling as appropriate rather than simply recording everything. [REF-OTEL-SAMPLING]

## F.13 Capability surface and schema-token budget

One production observation was that most tool-schema tokens were prose. Aksara's typed Capability Registry gives us a better path, but we should make the constraint explicit.

The model should not receive the full global capability catalogue on every turn.

Use:

```text
Objective / ActorContext
  → capability discovery/filter
  → compact capability descriptors
  → selected full schemas only
```

Each capability has both:

- **machine contract:** concise WIT/Proto/JSON schema;
- **human documentation:** rich prose kept outside the default prompt.

Add budgets for number of surfaced tools and total schema tokens. Capability discovery is staged. Large domain packs do not become one gigantic tool prompt.

Dependency/registration graphs also require explicit validation and useful errors; arbitrary internal limits must not make a pack uninstallable without surfacing which constraint was crossed.

## F.14 Model/provider fallback is a policy decision

Unknown model identifiers, implicit smaller context windows, differing cache semantics and provider-specific connection-close behavior must never be hidden by the gateway.

`ModelRouteDecision` must resolve:

```text
provider
model_id
model_revision/family metadata where known
context_window
reasoning policy
stream semantics adapter
cost/budget class
fallback set
```

If required metadata is missing, consequential workloads fail closed or require an explicit fallback route. A fallback is never “whatever provider SDK chooses.” Child/leaf runs inherit or intentionally override a resolved model policy; they do not accidentally fall back to cheaper/weaker defaults.

Prompt/cache stability also matters: system/tool schemas should have canonical serialization and stable ordering where provider prompt caching benefits from byte/token-prefix stability.

## F.15 Supervisor privilege separation

A resident agent must not be able to restart the process that hosts its own turn merely because shell access exists in a workspace.

Node lifecycle operations belong behind a separate privileged supervisor boundary:

```text
node.service.restart
node.runtime.upgrade
node.runtime.rollback
node.reboot
```

These are `Act` capabilities with stronger policy/approval classes than ordinary workspace shell execution. `agentOS`/WorkAgentRuntime receives no ambient access to systemd/service-manager sockets. On development PRoot, the same API may be backed by a no-op/dev supervisor; on production Debian it can be backed by systemd under narrowly scoped service credentials.

“Confirm before restarting” in a prompt is not a guarantee. The guarantee is that the runtime lacks the authority until the supervisor capability is leased.

## F.16 Event-driven completion, not polling folklore

The corpus's heavy status-poll percentage is a symptom of missing completion signals. Aksara should prefer state changes as events:

- `DurableRuntime.signal()` / external event;
- A2A task state/stream update;
- ETNOS federation event;
- Zenoh observation;
- filesystem/process completion callback inside a bounded WorkAgentRuntime.

Polling remains a compatibility fallback and must have backoff + deadline + budget. Generated workflows should not use arbitrary sleeps as their primary synchronization primitive.

## F.17 Resource and payload ceilings

Every boundary needs explicit size/rate ceilings with artifact indirection:

```text
max_inline_tool_args
max_inline_tool_result
max_directory_entries
max_directory_bytes
max_message_bytes
max_wake_payload
max_session_replay_bytes
max_artifact_preview_bytes
max_trace_attribute_bytes
```

Truncation is never silent. A truncated value carries `truncated=true`, original size where known, artifact/reference to the complete data if retained, and valid serialization. Never cut JSON in the middle of an array/string.

Session/history replay must be streamed/paged or snapshot+delta based rather than synchronously replaying arbitrarily large logs under a mutex.

## F.18 New contract objects to scaffold now

These objects can be added to `schemas/` / Proto roots before their full production implementations exist:

```text
RunId / TurnId / StepId / ToolCallId / ExecutionId
TurnState
RetryPolicy
DeadlinePolicy
RuntimeEpoch
ToolCallEnvelope
ExecutionClaim
ChildRun
ContextBudget
UsageLedger
TelemetryBudget
QuarantineRecord
SupervisorAction
ModelExecutionPolicy
```

The rule remains the v0.4 rule: **freeze semantics, not dependencies.** Hermes can exercise these contracts first. Vellum can later use the same contracts without gaining authority over them.

## F.19 P1 Harness Failure Suite

The external production corpus motivating this addendum described 53 failure lessons. Aksara's current executable checklist below contains **35 initial cases**; the document no longer pretends those counts are identical.

Add the scenario family under:

```text
scenarios/harness-failures/
```

Initial cases:

```text
01_crash_mid_tool_call
02_resume_before_runtime_ready
03_turn_queue_crash_recovery
04_partial_tool_args_stream
05_transport_close_not_done
06_poison_message_quarantine
07_reconnect_registration_replay
08_duplicate_registration_dedup
09_cancel_fences_stale_write
10_child_process_lost
11_parent_cancel_propagates
12_child_turn_limit_not_completed
13_two_approvals_one_effect
14_external_effect_then_local_crash
15_upstream_stream_stall
16_keepalive_not_progress
17_missing_read_timeout
18_large_directory_listing_artifactized
19_large_hook_result_artifactized
20_context_compaction_nonempty
21_context_budget_accounting
22_unknown_model_fails_closed
23_policy_invalid_forbid_rejected
24_policy_schema_migration_revalidation
25_null_empty_failure_distinct
26_id_collision_unique_constraint
27_trace_storm_budget
28_trace_disk_quota
29_runtime_port_single_owner
30_agent_cannot_restart_host_directly
31_event_completion_without_sleep_polling
32_repeated_retry_moves_to_quarantine
33_late_worker_epoch_commit_rejected
34_backup_restore_then_resume
35_derived_memory_deleted_and_rebuilt
```

Promotion criterion:

> A resident cognition runtime is not “production compatible with Aksara” merely because it can call tools. It must pass the runtime-adapter subset of this suite, while the kernel/execution plane must pass the harness-independent subset.

This gives Hermes and Vellum a common compatibility target instead of comparing them by demo smoothness.

## F.20 Tradeoffs accepted deliberately

This hardening adds complexity. The tradeoffs are explicit:

- **more typed state vs faster prototyping:** accepted because institutional effects need recoverability;
- **quarantine vs infinite retry:** accepted because liveness without bounded failure becomes self-DoS;
- **artifact indirection vs giant inline context:** accepted because reproducibility and bounded context matter more than conversational convenience;
- **strict readiness/fail-closed routing vs “usually works” fallback:** accepted for consequential workflows; conversational low-risk paths may use softer degradation;
- **telemetry sampling vs perfect debug history:** accepted because observability must not become the outage;
- **child lifecycle accounting vs free-form swarm agents:** accepted because Aksara treats subagents as temporary processes, not autonomous institutional principals;
- **supervisor separation vs convenient shell power:** accepted because the agent runtime is intentionally replaceable and non-sovereign;
- **Cedar policy admission checks vs runtime-only evaluation:** accepted because a malformed policy must not silently change authority;
- **Duroxide behind a port vs baking it into the kernel:** retained because Duroxide is still preview software and durability semantics must remain swappable.

The production corpus therefore strengthens the existing architecture rather than overturning it. The clearest architectural consequence is:

> **The trust kernel must govern not only what an agent is allowed to do, but also the lifecycle by which work becomes complete: readiness, framing, retries, cancellation, child ownership, approval, execution claim, result typing and recovery are part of institutional correctness.**

## F.21 Addendum source pins

| Ref | Source | What this addendum takes from it | Aksara-specific interpretation |
|---|---|---|---|
| `REF-III-HARNESS-53` | https://gist.github.com/mfpiccolo/de46eaae0f62bc1513dbb8fe5b944516 | empirical failure corpus from ~4 months of production agent-harness operation | adversarial checklist, not an upstream architecture dependency |
| `REF-DUROXIDE-OPS` | https://github.com/microsoft/duroxide and current durable/provider docs | deterministic replay, correlation IDs, retries/timeouts, cancellation, peek-lock queues, provider atomicity, idempotent side-effect requirement | implementation behind `DurableRuntime`; Aksara still owns institutional state/effect semantics |
| `REF-CEDAR-VALIDATION` | https://docs.cedarpolicy.com/policies/validation.html and https://docs.cedarpolicy.com/other/security.html | default-deny model, schema validation, skip-on-error behavior | reject invalid policy bundles before activation; do not let malformed forbids disappear at evaluation time |
| `REF-OTEL-SAMPLING` | https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/ | sampling as a telemetry cost/volume control | explicit Node/run telemetry budgets; Ledger remains separate and unsampled according to its own governance |

## F.22 Addendum freeze decisions

1. `TurnState`, `RuntimeEpoch`, `ToolCallEnvelope`, `ExecutionClaim`, `ChildRun`, `ContextBudget`, `TelemetryBudget` and `SupervisorAction` become scaffold-level contracts.
2. Transport EOF is never equivalent to provider/model completion.
3. Partial tool arguments can never execute.
4. Reconnect/startup registration is idempotent and gated by an explicit READY barrier.
5. Cancellation uses stale-write fencing; old generations cannot commit.
6. Child/leaf processes have typed terminal states and structured ownership.
7. `Act` capabilities acquire one atomic logical execution claim after approval and before side effects.
8. Every upstream client has connect/read/idle/step/turn deadline semantics appropriate to its protocol.
9. Repeated deterministic failures are quarantined rather than retried forever.
10. Context compaction has hard postconditions; large outputs become artifacts.
11. Unknown model metadata/fallback routes fail closed for consequential workloads.
12. Cedar policy bundles must validate against versioned schemas before activation and after schema migration.
13. Telemetry has span/rate/disk/cardinality budgets and may be sampled; the institutional Ledger remains a separate governed record.
14. Runtime/workspace processes have no ambient service-manager privilege; lifecycle changes use governed supervisor capabilities.
15. Event-driven signals are preferred over generated polling/sleep loops.
16. The `scenarios/harness-failures/` suite becomes a compatibility gate for Hermes, Vellum and future resident runtimes.
17. None of these decisions makes Vellum/Hermes/agentOS authoritative; they strengthen the boundary that keeps the institutional state and effect plane independent of the resident harness.



---

# Addendum G — Realtime conversational presence research (26 September 2026)

**Scope and status:** evidence review covering 1 June–26 September 2026, prioritizing August–September. This addendum is a **proposed voice architecture and bakeoff**, not a replacement for §18, a decision to use a cloud voice provider, or a change to the Aksara institutional kernel. Existing voice acceptance, room privacy, EgressPolicy, Memory Firewall, identity and receipt contracts remain binding. The source links below are primary technical accounts where available; community remarks are treated as anecdotes.

## G.1 What production systems actually separate

OpenAI's 3 August 2026 [engineering account](https://openai.com/index/continuous-voice-interaction-with-gpt-live/) explicitly says this design powers parts of ChatGPT Voice: GPT-Live listens and speaks simultaneously; a dedicated low-latency media path continues while reasoning, search, tool use and persistence happen asynchronously. The team removed a separate turn detector from the live audio path, used WebRTC, moved the media frontend and inference logic to Go, prewarmed backend inference context, and treated delegation latency as part of the conversation's responsiveness budget. Its continuous audio is projected into speculative UI turns and a separate finalized record. Shadow traffic found failures in CPU stream handlers, geography, reconnection, long sessions and capacity outside the GPU. These are documented choices for OpenAI's system, not proof that Aksara must copy its language, infrastructure scale or model.

OpenAI's [voice architecture guide](https://developers.openai.com/api/docs/guides/voice-agents) distinguishes full-duplex voice with a separate backend (GPT-Live), one Realtime model doing voice/reasoning/tools, and a chained STT→LLM→TTS pipeline. Its [delegation guide](https://developers.openai.com/api/docs/guides/live-delegation) makes *client delegation* the route when the application controls backend model, context, redaction, permissions and result review. The live model can receive silent facts or spoken progress/results. A voice front can cover a short wait, but no front can make arbitrarily slow backend work feel immediate. A spoken completion still requires a confirmed effect or receipt.

Google's [15 September developer announcement](https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/) describes Gemini 3.8 Live with asynchronous function calls and continuous dialogue, plus Extended Thinking that speaks intermediate updates while reasoning and tools proceed. Its [Thinking guide](https://ai.google.dev/gemini-api/docs/live-api/thinking) distinguishes an utterance ending from the whole interaction becoming idle: `turnComplete` can occur while `interaction_status` remains `IN_PROGRESS`, and Extended Thinking requires nonblocking functions. This is an alternative integrated live reasoning model, not necessarily the same separate-backend architecture as OpenAI. Its claimed language coverage is not evidence of Papuan Malay performance, and cloud audio still crosses Aksara's egress boundary.

LiveKit's [Agents framework](https://docs.livekit.io/agents/) provides WebRTC rooms, agent jobs, media and turn handling. Its [pipeline comparison](https://docs.livekit.io/agents/models/pipelines/) lays out a modular cascade, a realtime speech model and a hybrid. The current [GPT-Live plugin](https://docs.livekit.io/agents/models/realtime/plugins/gpt-live/) supports application-owned client delegation, but warns that stopping played audio does not necessarily stop the full-duplex model's own speech generation. The August [short-utterance diagnosis](https://livekit.com/blog/short-utterances) shows why a cascaded agent can go silent after a one-word reply when STT never emits a final transcript; the August [join-latency diagnosis](https://livekit.com/blog/agent-join-latency) shows cold agent processes and blocking startup are part of perceived latency. Both matter for a Node with limited compute.

Pipecat is a separate voice orchestration loop, not simply an alternative WebRTC host. Its [transport docs](https://docs.pipecat.ai/client/concepts/choosing-a-transport) support direct SmallWebRTC for local prototypes and LiveKit rooms as a transport. Its current [turn strategies](https://docs.pipecat.ai/pipecat/learn/speech-input) combine VAD, transcripts and semantic end-of-turn detection; the [1.0 migration notes](https://docs.pipecat.ai/pipecat/migration/migration-1.0) caution that removed turn parameters may be silently ignored. The [OpenAI Live service code](https://reference-server.pipecat.ai/en/latest/_modules/pipecat/services/openai/live/llm.html) is a useful donor: a live voice front can delegate to an application worker and receive a sequence of speech-preferred or silent backend updates. Pipecat with LiveKit transport is coherent; running Pipecat's entire conversation loop inside a second LiveKit Agents loop is unnecessary P1 complexity.

Other evidence: Daily's [PhoneLLM Alpha 1](https://www.daily.co/blog/announcing-pipecat-phonellm-alpha-1/) argues for a fast task-specific text model in a *cascaded* phone agent, rather than always sending voice turns through a frontier reasoner. NVIDIA's [NemotronLabs VoiceChat 11B](https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B) is an open full-duplex/tool-calling research candidate, but its own card labels it research-only and lists datacenter-class NVIDIA GPUs; it is not a P1 Node/offline floor. A September [Hacker News API discussion](https://news.ycombinator.com/item?id=49653985) reports strong conversational feel alongside transcription/pronunciation complaints; these are user anecdotes, useful for choosing tests rather than model quality claims. No surfaced Reddit discussion met the same recency and firsthand-detail bar, so this review does not infer Reddit consensus.

## G.2 Aksara's proposed two-lane contract

```text
explicit mic activation / local wake gate / private or approved room surface
  → VoiceSession: listening, turn/overlap, brief speech, correction, progress
  → DelegationEnvelope: task ID, request revision, principal, audience, lane,
                        data class, permitted context, cancellation policy
  → Node/Gateway: approved retrieval, reasoning harness, WorkObject,
                  authorization, tool execution, durable state and receipt
  → validated update: working / needs input / awaiting approval / completed
  → speech.render: audience and egress decision before local/cloud synthesis
```

The voice participant is a **replaceable interface runtime** and has no institutional authority, canonical memory or ambient tool credentials. `Presence` means a responsive session after an explicit wake, tap or call; it does not mean continuously streaming the room to a provider. A MatrixUI presence indicator can be ambient while microphone/cloud audio remain off. Speaker diarization is session-local evidence, never identity proof; a communal speaker cannot disclose a private result. A phone or headset may take over a protected conversation after an authenticated handoff.

Use a `DelegationEnvelope` with `task_id`, `revision`, `session_id`, `principal_binding`, `audience`, `data_class`, `context_ref`, `deadline`, `cancel_policy` and `idempotency_key`. The backend can return `heard`, `working`, `needs_input`, `awaiting_approval`, `completed` or `failed`, plus a separately marked speech-safe summary. An interruption may change the requested answer while read-only research proceeds; it cannot silently change an approved action. A stale backend result cannot speak on the current revision or a broader audience. Disconnecting the voice session does not delete an ongoing WorkObject; only the kernel decides task cancellation and recorded completion. Treat a voice model's “done” as untrusted until the receipt confirms it.

### G.2.1 Room voice, private handoff and cloud boundary

Use one governed Aksara backend with **two audience-scoped voice surfaces**, rather than one voice conversation that simply gains more privileges. The communal Node's room voice is a low-privilege interface for greetings, public questions, turn-taking, delegation and brief progress. It receives only public or explicitly room-safe context. The Node assembles an authorized view for each request, runs the underlying agents and tools, and returns a separate `speech_safe_summary` cleared for the current speaker audience; it never hands a protected retrieval result to the room model and asks that model to redact it. The room voice may say “I can continue on your phone,” but must not reveal the topic, person or case in that prompt if doing so would itself disclose protected information.

When a turn requires private detail, create a **private handoff** tied to the same `task_id` and current revision. A card tap or QR scan can locate or claim the handoff, but is not authentication or authorization on its own. On the phone or headset, authenticate the principal, establish the new audience and purpose, recheck permissions and egress, and assemble a fresh private `MemoryView`/context. Do not promote the room transcript, voice-model state or speaker diarization into an authenticated private session by default. The public session receives at most a generic status; the private session may receive protected content and request approval under its own policy. Approval and consequential actions remain Node-owned, with receipts. If the phone is unavailable, keep the task pending or use another approved private surface rather than speak protected detail into the room.

**Cloud input and output are independent policy decisions.** A context-free cloud Live model can still hear names or sensitive case details spoken by a person in the room before Aksara classifies the request. Therefore `EgressPolicy` must decide *before streaming room audio* whether that room and deployment permit a cloud Live/ASR processor; an after-the-fact PII filter cannot make raw audio private. If permitted, a Gateway-scoped Live session can handle room conversation with no protected tools or memory and a bounded active mic window. Otherwise keep room capture/turn detection and the speech path local, and route protected turns to a private surface. Cloud TTS may synthesize only audience-cleared text after `speech.render` policy; it need not receive source records or private transcripts. A private session can independently use cloud Live or TTS only when its data class, custody and user/deployment policy permit. Offline, keep the same delegation and audience contracts while local ASR, a small response controller and local TTS offer reduced conversational fluency; the institutional Node continues the task or marks it pending according to available capabilities.

## G.3 Candidate comparison for P1

| Candidate | Where it helps | Aksara constraint / test |
|---|---|---|
| **A. Full-duplex front + Aksara client-delegated backend** (LiveKit Agents GPT-Live plugin initially) | Natural overlap and progress while Vellum/Hermes/other resident cognition does long work behind one stable Node contract. | Cloud media/retention, access and active-session cost; Indonesian/Papuan Malay, names, room overlap and model-controlled barge-in must pass tests. Never route protected audio before EgressPolicy. |
| **B. Gemini 3.8 Live / Extended Thinking + Aksara tools** | Integrated audio and asynchronous tools may simplify a cloud-enabled surface; native visual context is an optional future lane. | Confirm exact status/event semantics, context ownership, task revisions, result validation and audio/data policy; test the locale rather than trusting language counts. |
| **C. LiveKit Agents cascade with a small presence controller** | Local/governed ASR, backend LLM and TTS stay separable; explicit transcript and speech-safe checkpoint. A lightweight response controller can speak verified progress without waiting for the heavy LLM. | More handoffs and potential silence. Must measure short replies, partial/final STT, false end-of-turn, warm joins and cancellation races. |
| **D. Pipecat pipeline over SmallWebRTC or LiveKit media** | Fine control of frame processing, local transport and alternative turn strategies; Pipecat's OpenAI Live worker is a concrete donor for two-lane delegation. | Choose one voice agent loop per session and pin API version; benchmark against C before adding operational surface area. |

**Recommendation for a reversible prototype:** hold the backend `DelegationEnvelope`, audience rules and sample tasks fixed. Compare A and C in the same LiveKit client/room when provider access and policy permit; add B as a cloud architecture challenger and D if Pipecat's frame controls, local deployment or language behavior outperform the LiveKit Agents path. The selection remains **EVALUATE**, not an automatic promotion of GPT-Live or a belief that STT→LLM→TTS is obsolete. P1's CPU local Indonesian TTS and bounded offline input remain the privacy/availability floor; a full-duplex local model is a Node+ research lane pending hardware, license and language evidence.

**Acceptance scenarios and metrics:** run the §18.6 Indonesian, Papuan Malay and code-switch corpus, including one-word “iya/tidak”, names/numbers, deliberate pauses, overlapping speakers and loud communal rooms. Add a 30–90 second document lookup interrupted twice, a corrected institution name, a protected case near a public speaker, explicit approval, WAN loss and reconnect, and a stale backend result after revision. Record p50/p95 *first useful speech* and final verified result, false and missed interruptions, yield time, overlap, STT finalization failure, task revision correctness, unauthorized audio/text exposure, receipt mismatch, join time, concurrent-session CPU/memory and cost per active minute. Keep acknowledgments separate from useful progress. Never record or train on room audio merely because the harness supports it.

**Promotion rule:** choose a full-duplex front if it materially improves turns and task completion on the actual Aksara corpus while respecting privacy, egress, cost and offline behavior. Otherwise choose the modular chain with an independent progress path. In either case, preserve the small media loop, governed backend boundary and replaceable voice provider.


</details>
