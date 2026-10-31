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

## Remaining seams

Front-agent/background-worker separation, Vercel desktop dispatch, live messaging
adapters, derived organizational wiki and receiving-side Strata publication are
the next increments. The desktop binary's version/status probe alone does not
qualify a GUI action or an OS sandbox. Production identity and real Surface
performance remain separate from this development distribution.
