# Onboarding and workspace review

2 November update: the user selected the first dialog direction and requested a
more compact open Home plus a mobile alternative to the full bottom dock. The
[resident colleague review](resident-superagent-review-2026-11-02.md#ui-direction-accepted-for-the-next-pass)
specifies headless Cult onboarding inside Base UI, a sentence-like Home input,
and labeled circular mobile navigation sharing the composer row. This selection
does not claim those layout changes have shipped.

Evidence: the user's four current desktop screenshots and the current React/BFF
implementation. The local user server was closed; no connected live browser
inspection or Surface Pro performance measurement was available. Generated design
concepts are proposals, not screenshots of shipped changes.

## What needs to change

The first-run setup is a long page inside an already scrolling workspace. Provider
choice, authorization, consent, model selection, test status and navigation compete
for space. Footer controls can leave the viewport. A successful authorization is
easy to mistake for successful inference, while failure text points broadly at
quota. Setup checks also become ordinary WorkObjects on Home, making failed
diagnostics look like unfinished personal tasks.

The Channels screen stretches one channel and its creation form into two large
blocks. Compact Home repeats the large greeting beside another focused screen.
The reduced-effects styling conflates cheap rendering with opaque gray surfaces.
Hiding the scrollbars alone would leave these layout problems intact.

## Proposed interaction

Prefer a short, dismissible first-run dialog, with a stable header/footer and one
question per step. Keep advanced provider/model controls behind disclosure. On
mobile, use a near-full-height sheet with reachable actions.

1. Choose ChatGPT, another connection, or an installed local model. No automatic
   model download on an 8 GB machine.
2. Complete authorization or key setup. Say **sign-in saved**, not verified.
3. Fetch model metadata and explain any fallback. Offer one explicit, consented
   test. Distinguish request rejection, account rejection, usage limit, timeout,
   and a completed response without returning provider bodies.
4. Hand into the actual conversation. Allow **Explore first** and resume later;
   skipped, configured and inference-verified are separate states.

The alternatives explored visually were a dialog, setup directly in Home, and a
contextual setup sheet. They retain one brand; structure is the variable. The
full redesign awaits the user's choice. The provider compatibility fixes are
independent of that choice.

## Shared design grammar

- Content sits on the live sky canvas. Compact translucent objects organize
  meaningful groups; menus/dialogs have a stronger tint. Document editors may
  use solid reading surfaces. Avoid transparent text over uncontrolled haze.
- One scrolling body per focused surface. Dialog header/footer and the composer
  remain outside its alpha mask. Use a small dynamic opacity fade only at an
  actually clipped edge; do not blur readable text or paint a fake sky overlay.
- Hide ordinary scrollbar tracks as requested, while preserving native scrolling,
  keyboard access and visible focus. Provide a show-scrollbars preference and
  honor forced-color accessibility needs.
- Full Home can carry a greeting. Compact Home should show Today/date, a few next
  actions and working results, without repeating the hero or full calendar.
  Keep diagnostics inspectable separately from the default everyday work view.
- Channels become concise rows. Put channel creation in a focused dialog with
  explicit audience. Do not widen current audience or grants to fix visibility.
- Chat uses readable 15–16 px text, bounded line lengths, quieter repeated labels
  and a single composer. Progress lives inline; artifacts/computer views can
  occupy the contextual region instead of adding another competing rail.
- Reuse installed Base UI, Cult components and Motion. No additional animation
  framework or fullscreen shader. Separate low-power tint/no-blur mode from the
  accessibility preference for fully opaque surfaces. Measure on the Surface
  before claiming lower memory use or smooth animation.

## References and specific lessons

- [Chatbox first chat](https://chatboxai.app/en/guide/getting-started/first-chat):
  guided first conversation with an explicit skip path; don't expose the entire
  settings form at first launch.
- [Raycast subscription connections](https://manual.raycast.com/ai/bring-your-own-subscription):
  account-derived model choices and recovery affordances. Raycast uses its own
  supported CLI integrations; Aksara does not inherit that implementation.
- [Fluent materials](https://fluent2.microsoft.design/material): give transient
  surfaces a distinct material role. Mica is an opaque tint, not true glass;
  selective hierarchy is more useful here than making everything transparent.
- [Base UI Dialog](https://base-ui.com/react/components/dialog): accessible focus
  and dismiss behavior, with distinct header/footer around a scrolling body.
- [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area): retain
  native viewport behavior and expose actual overflow, rather than inventing
  another scrolling system.
- [MDN scrollbar-width](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width):
  hidden bars carry accessibility costs; preserve alternative navigation and an
  opt-in visible setting.

Taste v2 informs density, readable hierarchy and meaningful content. The user's
explicit sky, lilac and translucency direction takes precedence over its flat-fill
palette preferences. No Mobbin or Apple material screenshot audit is claimed.
