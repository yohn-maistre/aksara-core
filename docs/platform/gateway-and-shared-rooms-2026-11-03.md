# Gateways, existing computers and shared rooms

3 November 2026, Asia/Bangkok. The durable Mastra/UI checkpoint is implemented
separately; this assessment adds an optional qualified gateway slice and records
what to learn from S.Space without starting another harness migration.

## Gateway choice

GitHub API observations on 3 November, not popularity-based assurance:

| Candidate | Stars | Fit and tradeoff |
| --- | ---: | --- |
| [agentgateway](https://github.com/agentgateway/agentgateway) | 5,881 | Rust standalone binary; HTTP/gRPC, MCP/A2A, LLM routes, OAuth/JWT, external authorization, CEL and telemetry. Best match for protocol transport and optional institutional networking. Apache-2.0. |
| [Bifrost](https://github.com/maximhq/bifrost) | 9,300 | Strong LLM gateway, provider routing, virtual keys and budgets. Apache-2.0 repository; check feature-specific enterprise deployment boundaries. Useful alternative if LLM operations become the dominant need. |
| [LiteLLM](https://github.com/BerriAI/litellm) | 62,572 | Broad provider integrations and operational ecosystem. MIT outside enterprise directories; additional runtime and enterprise feature boundaries need qualification. Popularity alone does not make it the simplest Surface dependency. |

All three were active on 2 November. Agentgateway 1.7.0 released 27 October, within
the preceding week (27 October–3 November). Release tag pinned to
`26f5aebe99a36a037fe54f8080a608aca5547e15`. Studied actual standalone configuration
normalization, named loopback binding, route matching, MCP auth, HTTP and LLM
examples, schema, CLI validation and license before adding the profile.

[The optional implementation](../../deploy/agentgateway/README.md) relays local
model discovery/chat through the actual gateway and the existing durable Mastra
path. It needs no Docker, Kubernetes or managed fleet and is not a default daemon.
Real-binary Linux qualification covers streaming, path/method denial, private
header stripping and no automatic retry on upstream failure. It does **not** yet
exercise federated MCP/A2A, remote enrollment or cloud credential brokering.

Do not put another agent loop behind it. Mastra executes; agentgateway transports;
Rust authorizes the actual Aksara object/action. Gateway token validation cannot
replace current membership, source eligibility, custody or execution fencing.
MCP authentication can happen at connection time; our resource authorization must
still happen at each read. Cache isolation, retry/effect semantics and body logging
are security decisions, not gateway defaults to inherit casually.

Keep `deploy/agentgateway` here while integration changes with host contracts.
Do not fork upstream or open a separate gateway repo just to hold configuration.
Extract a versioned deployment package later when another real consumer needs it.
Future remote promotion requires mapped individual subjects, strict authentication,
TLS, current per-call admission, egress consent, revocation, no cross-custody cache,
bounded delivery and production enrollment. This increment exposes no new remote
listener and never forwards ChatGPT OAuth as a general provider key.

## Existing computers are an ordinary deployment

Separate **Aksara service ownership** from **machine ownership**:

- Existing PC/laptop: install an ordinary user-owned app directory and private
  data directory. Start/stop only Aksara's authenticated owned processes. Do not
  enroll the whole machine, modify firewall/updates, require administrator access,
  install a fleet agent or import the user's browser credentials.
- Office host: run the same authority/runtime on a designated always-on computer.
  Phones/laptops can be thin clients once real remote enrollment is qualified.
  Back up its canonical data deliberately; local workflow projections are private
  and not automatically included in today's single-database CLI backup.
- Managed appliance/fleet: optional future deployment adapter for equipment the
  institution actually owns and elects to manage. Its updater, inventory, telemetry,
  remote administration and device policy must not become baseline dependencies.

The present launcher already uses explicit state ownership, separate personal/
community stores, loopback listeners and authenticated stop. No new fleet service
is needed for the existing-PC case. Host suspend/closure means local work pauses
or stops; an always-on communal presence requires an available office/server node.
A computer-use window permit is separate from app installation, membership and
OS administration. Sharing a Channel does not permit controlling a member's PC.
Production network sharing remains blocked on real identity/enrollment; the
local development chooser is not a remotely safe login system.

## S.Space visual study

Source: [Chi Wang's 2 November launch](https://x.com/Chi_Wang_/status/2117293406959378915).
Downloaded its public 49.898-second, 1920×1080 video via the post's public media
metadata. Extracted ten 5-second samples and full-resolution frames at 32 and
41 seconds. Files remain research evidence outside git/product assets. This is a
launch presentation, **not proof that every depicted feature ships or that its
backend implements a particular durability/security model**. The public site
returned a loading shell through text extraction; no account was created and no
private room was joined or messaged.

| Frame / visible pattern | Aksara implication |
| --- | --- |
| Around 25 s: a person asks the team; agent avatar carries a small owner badge | Keep conversation natural, distinguish Aksara from members, show delegating owner when shared attribution matters. Badge is presentation, not an authorization token. |
| 30–32 s: people and their agents, explicit listening/speaking/note-taking states | A compact room roster can make the communal agent legible. Derive activity from actual connections/tasks; do not imply microphone access or fake presence. |
| Around 35 s: agents working on named tasks | Prefer a few actual status rows to a giant trace panel. Never copy a decorative progress bar as an invented percentage. |
| 40–41 s: Commons document, task table, assignee, status, comments, compact agents/files rail | A shared artifact is the durable center of collaboration. Reuse Library/document viewers and task references rather than introducing a second file database. Keep context compact and optional on phones. |

The strongest idea is **conversation produces a shared record people and agents
can keep working on**. That fits Aksara's original communal direction better than
turning the product into a collection of disconnected personal bots.

For Aksara, retain one recognizable communal front agent in each admitted room,
with private conversations and task workers underneath. Other people's external
agents may eventually join through explicitly bound identities and limited room
mandates; agentgateway/A2A alone does not establish those rights. A private
agent's memories must not become room memory merely because its owner joins.
Keep disagreement/provenance visible and irreversible publication reviewed.

## Next coherent increment, after this stop

1. A Channel header with actual members, Aksara's task status and a compact activity
   control, using the existing responsive thread rather than another page shell.
2. A room file/knowledge view with genuine per-Channel collection rights. Today's
   institution-visible Library artifacts are not Channel-only: do not relabel them
   Commons and imply stronger privacy than the kernel implements.
3. Artifact comments/revisions and task references that preserve original bytes,
   contributors and source withdrawal. No second memory or file authority.
4. A bounded event inbox/outbox and completion wakeup, then schedules and external
   agent participants. Build on the durable Mastra owner rather than add Pi as a
   second loop around it.

No new branded room UI, voice-call system, agent marketplace or independent
fleet service is claimed as implemented by this research pass.
