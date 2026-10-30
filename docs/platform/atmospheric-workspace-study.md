# Atmospheric workspace — visual exploration

30 October 2026 (Asia/Bangkok). Discussion/research only; production UI unchanged.
The user's new brief explicitly permits restrained glass, blur, glow and weather
motion. Those preferences supersede the earlier flat-only aesthetic guidance for
this exploration. The source, authority and readable-control boundaries remain.

## Interaction direction

Home is the persistent composition. It initially occupies the open background.
Opening Library or capabilities creates the bounded primary work surface; Home
contracts into the open margin beside it. Within a single authorized context this
should preserve the identity of pinned panels, drafts and work. This revises the
previous proposal's recommendation to hide Home behind an optional companion.

There are four functional regions, not four mandatory desktop columns:

1. Connected navigation spine: expandable labels; profile/settings at its foot.
2. Primary work: Library, capabilities/screens, a thread or a focused artifact.
3. Work activity/artifact area within that surface, shown only when useful.
4. Home on the background: briefing, custom panels, calendar and continuing work.

At narrow widths, merge these into one foreground view with explicit back paths.
Home's panels can remain scrollable on wide screens, but avoid three independent
scroll areas until there is enough space and content. Keyboard navigation and
scroll positions must remain predictable.

One composer moves between the Home/thread presentations. A compact Aksara
presence in the margin can reopen it; it is not another input. The destination
must be clear in shared work. Home continuity applies within current custody and
audience: entering another lane re-resolves Home's content. Private panels must
not remain mounted during an animated transition into a shared channel.

Channel expansion belongs under the Channels navigation entry, with an indented
branch and current/unread state. Expansion cannot rely on hover. Collapsed mode
opens an accessible popover/tree; expanded mode shows labels and branches.

## Atmosphere and presence

Treat two signals separately:

- Weather/daylight supplies the large, slow atmospheric field. Haze can soften
  contrast in the background, cloud cover can broaden the light, and evening can
  warm one edge. Text/control contrast must stay stable across every preset.
- Aksara's actual activity supplies one localized light near the spine/composer.
  Listening can follow authorized microphone input; speaking can follow playback.
  Working uses an indeterminate host state, never a fake voice or percentage.

Start with low-resolution pre-softened layers, a restrained texture and slow
transform/opacity changes. Do not animate full-screen blur or assume that a slow
animation is cheap. Scope actual Gooey filters to small connected silhouettes;
use the same radii, spring/settle timing and morph vocabulary elsewhere. Content
stays outside the filtered shape layer. Avoid stretching or blurring text as a
panel grows from its navigation trigger. A short connector near the trigger
can imply the split/merge while the large surface uses its own layout transition;
the entire spine-to-window span need not become one giant filtered raster.

Weather is optional display context, not a condition for using Aksara. Offer a
chosen city/manual atmosphere and a neutral fallback; a weather service failure
must not interrupt work. Location choice and appearance stay personal unless
explicitly shared. Keep the provider behind a small weather port, cache the last
reading with freshness, and preserve source/provider terms when selected. No
weather provider or background location collection is enabled in this study.

Use explicit off/static/full atmosphere settings, reduced-motion behavior,
hidden-tab suspension and a phone-friendly default. Real A12 measurements remain
required; upstream optimization comments are not Aksara performance results.

## Component study

Cult source inspected at `d71b1428b811c2779d46ea41b7ef8c9f9c9991c2` (MIT), actual
`apps/www/registry/default/ui/*.tsx`. Official component markdown retrieved on
30 October. Libraries.dev source inspected at
`bad63221ebafa08d830586aa1721ecbd4ea02fcb` (MIT). Its live `/voice` and `/gooey`
pages returned HTTP 403 here; the official repository documentation/source and
the user's provided screenshot supply the reference instead. No Studio/Pro
recipes or assets copied. No new runtime dependency installed.

| Component | Proposed role | Required adaptation |
| --- | --- | --- |
| [Expandable Screen](https://www.cult-ui.com/docs/components/expandable-screen) | Open the private/personal thread from Home or an inline action | Reuse our Base UI adaptation for focus, Escape, controlled state and scroll cleanup; separate transition shape from readable content; thread identity/draft survives presentation changes |
| [Expandable](https://www.cult-ui.com/docs/components/expandable) | Compact Home panels that reveal more detail | Use measured bounds, reduced motion and source eligibility; do not retain revoked children during exit |
| [Text Animate](https://www.cult-ui.com/docs/components/text-animate) | A short greeting or meaningful one-time transition | Preserve one accessible text string; some upstream modes hide every visible character from assistive technology. Adapt heading semantics, spacing and reduced motion. No per-letter animation of every answer |
| [AI Blob Warp](https://www.cult-ui.com/docs/components/ai-blob-warp) | Optional expanded voice presence | Adds Paper Design shader; source pauses speed when out of view/reduced motion. Still needs host visibility/budget control, optional loading and a static fallback |
| [Sortable List](https://www.cult-ui.com/docs/components/sortable-list) | Editable plans/tasks embedded inside a thread | Preserve chronological messages; add keyboard move controls, stable IDs, authorized persistence, conflict/failure handling and undo |
| [Choice Poll](https://www.cult-ui.com/docs/components/choice-poll) | Compact structured choices in a shared conversation | Host-owned eligibility and saved votes; distinguish a preference poll from an institutional decision or effect approval |
| [Poll Widget](https://www.cult-ui.com/docs/components/poll-widget) | One shared poll renderer with inline/popover/dialog presentations | Upstream calls a void callback and advances a success phase. Await a real host result and show failure before claiming a recorded vote |
| [Feature Poll](https://www.cult-ui.com/docs/components/feature-poll) | Prioritization variant of the same poll contract | Reuse one data/permission model; do not install three independent voting backends |
| [Speech Bubble](https://www.cult-ui.com/docs/components/speech-bubble) | Texting-style conversation | Upstream wrapper uses h1, tight display typography and a decorative cursor. Adapt to normal prose, comfortable line height and wrapping; suppress cursor for ordinary messages |
| [Cutout Card](https://www.cult-ui.com/docs/components/cutout-card) | Selective artifact/media thumbnail, not every category/row | Source imports next/image; adapt to this Vite app. Hover actions need touch/keyboard equivalents. Preserve authorized media loading and original asset licenses |
| [Voice](https://libraries.dev/voice), `voice-glow` 0.3.0 | Small, subdued lilac/warm glow at composer or spine foot | Actual VoiceBeam source supports manual level, color/brightness/bloom controls, idle, pause and reduced motion. Default animated breathing is optional. Do not attach a microphone for a purely decorative effect |
| [Gooey](https://libraries.dev/gooey), `liquid-gooey` 0.2.2 | Connected spine silhouette and bounded merge/dock transitions | Source separates SVG silhouettes from crisp HTML and includes raster-cost optimizations. Keep filter extents small, pause when idle/hidden and qualify interruption/reduced-motion/phone behavior |

Panel types should be discovered through one registered component vocabulary.
Keep category chrome understated; show a preview, useful title and source/context
only when needed. Model-generated UI can describe a panel or suggest a layout,
while the trusted host owns resolution, navigation and effects.

## Work, traces and the computer

Thread content can combine readable bubbles, inline actions and useful artifact
blocks. A compact work area can show real milestones, tool activity, errors and
receipts, with a small rounded computer preview when a computer exists. It should
not expose internal model reasoning or invent activity to look alive. Expand the
preview into the same artifact viewer; observing, pausing and taking control need
the real computer backend contracts, not merely a presentational button.

A GitHub-like calendar can show recorded work by day, with a clear definition
and accessible date/count labels. It should not equate message volume with useful
work or fabricate activity on days without records. Selecting a day opens actual
authorized work from that date, not an invented screenshot of a past office.

## What makes the direction distinctive

The continuous Home-to-margin transition, connected spine and a single responsive
pool of Aksara light should form a recognizable interaction language. Empty space
is useful when the few visible elements are the current work, a relevant prompt
and something the person can act on. Remove repetitive invitations/explainers;
let the large headline describe useful current work when available (for example,
“Your field notes are [ready to review ↗]”), then keep the essential destination,
truthful activity, source access and effect review
understandable through contextual disclosure.

The visual study compares expanded Home, Library-with-Home and thread-with-work
using the same palette family. Generated images are concepts, not running UI or
motion/performance proof. Select/refine a visual target before production changes.
Then apply the installed Taste v2 app-screen workflow to the interactive study:
check screenshots, actual fonts, contrast, overflow, 200% text, focus, reduced
motion and first-action clarity. Record intentional material/palette exceptions;
do not treat a taste waiver as an accessibility or performance result.
