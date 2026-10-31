# Resident agent implementation

31 October 2026. This checkpoint follows the [reassessment](resident-agent-reassessment-2026-10-31.md).
Mastra remains the resident runtime. Rust owns custody and the checks at each
tool boundary; it does not prescribe the model's plan.

## Working tools and procedural learning

The native workbench now runs the actual Mastra multi-step tool loop, bounded
to eight model steps and twelve tool calls per turn. Local agents can search
eligible Library sources, read text, calculate, and save up to two private
procedure drafts. Hosted agents can calculate and read only the sources selected
with explicit consent for that turn. No ambient hosted Library search is granted.

Tool reads commit their actual source dependencies before returning content.
Withdrawal fences the next model step, final reply and later reads of dependent
artifacts. The stored input digest describes the initial frozen model context;
subsequent source reads are separately recorded on the canonical run. It is not
a digest of every subsequent provider request.

Procedure drafts are immutable, source-linked private artifacts, visibly marked
unreviewed. A later local task can find and reuse them. They do not automatically
become approved memory, executable skills or institutional policy. There is no
background curator, automatic consolidation or weight update. A useful-learning
evaluation and revision/deduplication UI remain to be added.

`node tests/resident-agent.mjs` starts the real Docker-free native stack with a
scripted local model. It exercises search → source read → calculation → saved
procedure → final reply, restart, duplicate delivery without another provider
call, later procedure retrieval, and withdrawal of both derived notes/replies.
This proves integration mechanics, not reasoning quality or live model entitlement.

Rust integration tests additionally cover hosted-source consent, ineligible
reads, shared/private separation, budgets and withdrawal during a run. Runtime
tests exercise actual Mastra tools and revocation between model requests.

## Interactive Aksara and background work

Schema 4 admits one interactive run and one background run per lane. The native
host reserves one slot of each kind across its configured stores. A local front
agent can start one non-recursive worker with the same provider, lane and full
actual source/memory dependencies. No runtime-owned identity becomes authority.
The worker lasts at most ten minutes, continues across ordinary navigation, and
stops on logout, cancellation, expiry or loss of access. A foreground turn lasts
at most three minutes. A local model server can still serialize its own inference;
these slots do not promise parallel CPU speed on the Surface.

Background results appear in the canonical thread. `task_status` lets the front
agent read their actual state/results with dependency capture. Internal worker
transcripts are not automatically injected into interactive history. Automatic
provider/tool replay after a crash is still disabled; interrupted work requires
explicit recovery. Finished outputs remain available after restart.

`save_document` writes unreviewed working artifacts immediately, without an
approval per scratch draft. Artifacts bind to the exact thread and recorded
maximum audience. Shared members see one saved result; another channel or private
thread cannot read it. Approval remains necessary for the existing reviewed
institutional effect path. No draft is silently published or declared policy.

## Computer use

The native adapter uses Vercel **agent-desktop 1.0.2**, JSON contract 2.5. The
Windows development ZIP includes its pinned, checksum-verified x64 binary and
Apache-2.0 license. Source development can set `AKSARA_DESKTOP_BINARY` to an
absolute driver path before starting. Tools → Computer discovers accessible
windows. The person explicitly connects one window for ten minutes, choosing
observation, optional interaction, and separate physical-typing permission.

The initial permit is private and local-model only. A shared channel cannot
borrow the signed-in desktop. This is a window-scoped development permit, **not
an OS sandbox or an institutional high-risk-action policy**. Signed-in apps can
have external effects. Use a disposable app/profile when testing. No host shell,
clipboard, app launch, raw coordinates or generic CLI is given to the model.

The adapter checks current Rust task/permit authority and the actual window,
PID and process instance before delivery. It admits only qualified refs from a
recent observation. Every attempted action invalidates those refs. Observations
are bounded private source artifacts; dependent outputs carry their lineage.

A durable intent commits before native invocation. Driver delivery and retry
status are preserved, including `delivered_unverified`; unknown delivery blocks
new actions under that permit until explicit inspection/reconnection. Stop fences
new actions and still permits recording a receipt for an action already delivered.
It cannot undo an action. No automatic repeat, headed fallback or post-crash replay
is implemented. Reconnection is explicit takeover and invalidates the old permit.

`tests/desktop-native.mjs` exercised the real native stack, actual Mastra tools
and Vercel driver against an isolated synthetic office form: observe → explicitly
permitted physical typing → observe → semantic click → observe → saved result.
Independent browser readback verified the displayed value. The click itself
correctly reported unverified delivery. This proves GUI mechanics, not arbitrary
app compatibility, real Windows control, disk persistence or reasoning quality.
`bash scripts/qualify_desktop.sh` reproduces the x64 Linux qualification with a
disposable Xvfb/D-Bus/Openbox session; CI runs it separately from contract tests.

## One source-backed memory boundary

`GET /api/knowledge` on the Rust host returns `aksara.memory/1`: current reviewed
excerpts and provisional wiki/people/procedure views, with source IDs and scope.
The web host forwards that same resource; MCP exposes
`aksara://workspace/knowledge`. A local agent's `memory_recall` records both source
and reviewed-memory IDs before data enters its next model step. Revoking memory
fences dependent runs, messages and derived artifacts even when the original
source remains available. Work/history projections also respect dependencies.

Library displays **Working knowledge** when wiki pages, explicit people notes or
procedure drafts exist. `Wiki: ` and `People: ` titles classify working pages;
this is an initial presentation convention, not an ontology or an inferred people
registry. Such pages are unreviewed and retain citations through their actual
read set. Public release is disabled. Existing private, thread-bound and internal
source rules remain distinct; named restricted collections are still pending.

LongMemory's TypeScript project/wiki/store APIs were studied. Its engine is not
yet installed. The current small source projection is functional without a second
SQLite/native dependency, daemon or independent account/scope store. A LongMemory
adapter must accept eligible source IDs and revalidate results through this port;
a direct unscoped LongMemory MCP connection would bypass these checks.

## Remaining seams

Live Telegram/WhatsApp adapters, isolated shared desktop provisioning, rich
LongMemory projections and receiving-side Strata release are not connected yet.
The messaging admission port and existing reviewed publication contract remain
available groundwork. Production enrollment, named custodian rights, live model
account success and actual Surface resource/OS compatibility are separate gates.
