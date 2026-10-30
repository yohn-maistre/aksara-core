# Aksara living workspace — discussion proposal

30 October 2026 (Asia/Bangkok). Proposed interaction model, not a new catalogue
revision or an approved implementation directive. Based on the user's Hark
screenshots, existing product implementation and stated goals. Hark's internal
agent architecture, permissions and accessibility have not been verified. The
forthcoming v2.5.7 documents have not yet been supplied or assessed.

## Recommendation

Use **Home** as the navigation destination. **Today** is its current-time lens,
with recorded history available separately. Home can also hold persistent panels,
ongoing work and pinned resources that do not belong to one day.

The desktop workspace has a navigation spine, one primary working surface and an
optional contextual companion. The spine and companion sit on the page ground;
the primary surface has a rounded inset boundary. The companion exists only when
there is relevant content or the person deliberately opens it. Home is not a
second dashboard permanently squeezed beside every screen.

| State | Primary surface | Optional companion |
| --- | --- | --- |
| Home | Briefing, one composer, selected panels and continuing work | Selected panel details or an active work item |
| Library | Sources, search and organization | Selected source or work on that source |
| Private thread | Conversation and its work | Its document, computer or other artifact, when one exists |
| Shared channel | Shared conversation and work | That channel's shared artifact/computer, when one exists |
| Focused artifact | The same document/computer enlarged | Its originating conversation, if deliberately retained |

A channel's shared computer and a person's private computer remain different
resources, even when their viewers use the same components. A private thread is
not just a visual size of the right sidebar: it has a durable identity, audience
and URL. Expanding an existing thread changes its presentation, not its identity.

The alternative of a permanently visible Home companion is worth a visual trial,
but it adds competing activity and raises private/shared ambiguity. Start with
the contextual version; allow a person to pin a companion later if useful.

## One composer, several presentations

There is one active composer for the current conversation destination. It is
embedded under Home's title when idle and becomes docked to the active thread
when conversation is foregrounded. Opening/closing that conversation preserves
its draft, attachment references and scroll position in the same authorized
context. It must not mount two editable copies and synchronize them.

Opening Library does not secretly redirect a personal prompt into a shared
channel. The destination remains visible near the composer. Entering another
channel/custody context changes the destination explicitly and clears restricted
rendered state. Draft persistence across contexts, if added, needs its own
private storage and authorization; it is not implied by a shared React store.

A Home prompt can reveal a lightweight conversation layer. Escape returns to
Home while authorized background work continues. A quiet activity indicator can
show “Working”, “Needs you” or a new reply; opening it returns to that exact work.
No automatic bubble should obscure typing, open another context or leak a reply
from the previous audience. On an explicit channel screen, conversation remains
part of the working surface rather than another overlay.

Use a solid or lightly dimmed backdrop first. Blur is optional visual treatment,
not the structure of the interaction. No essential state depends on translucency.

## Custom panels

Panels are persistent, bounded views assembled from registered components and
current authorized data. They can be created through a prompt or a conventional
“Add panel” flow, then previewed, renamed, pinned, rearranged or removed.

For example: “Show my next meetings and the sources for the field visit” should
produce a panel draft with its source bindings and connection requirements. A
missing calendar connection produces a clear “Connect calendar” state. It must
not invent a schedule. The existing Library/work components can seed the first
real panels before external integrations exist.

Panel creation separates three concerns:

- A versioned layout specification: title, registered component types, resource
  references, sizes and allowed refresh behavior. No source text, secrets,
  arbitrary fetch URL, executable code or permissions embedded in that layout.
- Scoped instances: the actual content is resolved with fresh host authorization.
  Reusing a layout in a channel does not carry private data bindings or grants.
- Work needed to build/update a panel: a tracked WorkObject with honest progress,
  dependencies, cancellation and recoverable failure. “Building” appears only
  after the host has admitted actual work, not because an animation began.

Ordinary preference changes such as resizing or hiding a personal panel should
be immediate and undoable. Connecting an account, running a tool, modifying a
shared artifact or releasing information follows its own authority/review path.
A model's proposed UI never becomes an approval button that approves itself.

OpenUI should propose bounded view structures and resource references. The host
validates them and owns navigation, permissions and effects. Agent control of the
interface is useful when it can add a relevant result, update a status or suggest
a view; it becomes disruptive if it rearranges pinned content or steals focus.
Let the user freeze a panel and reject/dismiss a suggestion. Shared layout edits
need version conflict handling rather than last-model-wins writes.

## Computers and artifacts

Use one artifact viewer frame with consistent title, audience, freshness and
open/enlarge/back controls. Documents, tables, generated pages and computers
supply different registered viewers inside it. Preserve document state when
resizing, but invalidate private content immediately when access changes.

A computer can show an authorized preview while Aksara works, then offer clear
“Take control”, “Pause” and “Return control” affordances when those backend
capabilities are actually implemented. Observing and controlling are distinct
rights. Human takeover changes controller generation and fences old actions.
Screenshots and files carry provenance and audience; a shared computer must not
inherit a personal login, filesystem or browser session.

Univer and rich HTML remain future lazy-loaded viewers. Generated HTML belongs
on an isolated origin with bounded messaging, not inside trusted application DOM.
The current observation-only Docker port does not yet qualify these interactions.

## Mobile

Do not compress desktop columns onto a phone. Present one surface at a time:
Home, conversation, or artifact, with explicit back navigation and a compact
context label. The same artifact opens full-screen and returns to the same
thread/scroll position. Keep the composer above the keyboard and safe area;
voice, attachments and stop controls remain reachable. Long transcripts and
computer media should not remain mounted invisibly on a memory-constrained phone.

## Motion and visual language

Graphite grounds, restrained lilac identity and warm attention states remain the
shared palette. Generous text and inline actions carry hierarchy. Use fewer
nested containers; repeated rows can live in one calm panel. Status must also be
understandable without color or animation.

Motion should explain a specific relationship: a selected panel enlarges, its
companion makes room, an accepted action settles into the result. Use existing
Motion layout/transform/opacity primitives, interruption-safe transitions,
keyboard parity and reduced-motion equivalents. A nominal 180–280 ms transition
is a starting point to measure, not an A12 performance claim. Avoid permanent
shader/blur/filter loops and never animate restricted content after revocation.

Rotating prompts are idle-only, reserve their text space and stop on focus/input.
Unknown-duration work remains indeterminate. No simulated typing implies an
accepted model result or a completed effect.

Shared Abstraksi/Strata design packages can contain semantic tokens, typography,
accessible controls, motion patterns and the viewer frame. Their product-specific
identity, moderation and custody policy remain outside the visual primitives.

## Agent organization

A responsive foreground coordinator plus bounded workers is a sound direction;
the screenshots do not prove that Hark uses it. The coordinator should remain
available while a panel build or research task runs. Workers report through
canonical work/events, use explicit budgets and current delegated scope, and
never gain the coordinator's entire memory or ambient credentials by default.

Mastra can supply agent/workflow mechanics and provider integrations. Aksara's
Rust work, dependency and effect contracts still govern dispatch, cancellation,
recovery and receipts. The current conversational adapter is one bounded turn;
durable subagent/tool recovery has not been implemented by this UI checkpoint.
Adding several agents by itself would not establish reliability.

The coordinator can accept new files or clarification while a worker runs, but
those become explicit new input/revision, never a silent mutation of a claimed
run's frozen context. Redirecting or cancelling work fences future dispatch; real
effects already performed still need their receipts and reconciliation.

## Next visual proof

Before another production layout rewrite, build a disposable interaction study
of the same task across desktop and phone:

1. Home with two useful registered panels and one composer.
2. Ask Aksara to make a panel; show an actual draft/build/needs-input distinction.
3. Open Library, then a source in the companion, and enlarge it.
4. Return to the conversation without losing the draft or navigation history.
5. Open a shared channel and its artifact; private content disappears immediately.
6. Exercise keyboard, reduced motion, interruption, narrow width and 200% text.

Compare the contextual companion against the persistent-Home alternative using
this identical flow. Choose the behavior from that proof, then extend the
existing controller/ports. Do not replace the Rust backend or introduce a new UI
framework to evaluate panel geometry. Integrate the forthcoming catalogue delta
before treating this proposal as a final architecture contract.

## Current-screen observations

The current [desktop](ui-audit/fluid-desktop.jpg) and
[phone](ui-audit/fluid-mobile.jpg) captures show a cleaner flat base, but the
phone opening repeats an invitation, an Open conversation link and a second
composer invitation. Consolidating those into one clear action would recover
space before the first useful work item. Home should lead with relevant work
and selected panels; source/model detail can live in contextual disclosure,
while destination, required consent and truthful preview status remain clear.
These are specific observations of the current captures, not a complete audit
of Hark or a claim that fewer visible controls automatically improves usability.
