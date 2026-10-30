# Expressive workspace direction

Research and proposed next implementation pass, 30 October 2026 (Asia/Bangkok).
The deployed implementation remains [the atmospheric checkpoint](atmospheric-workspace-implementation.md).
This document changes neither runtime authority nor the deployment. It records
the user's latest refinement before the next visual pass.

## Recommendation

Continue the continuing-Home/workspace model. Adopt Material 3 Expressive's
semantic color, emphasis, component states and responsive motion principles,
while retaining our React/Base UI/shadcn/Cult implementation. Hark is a visual
reference for atmosphere, density and continuity; its private implementation,
performance and agent architecture have not been inspected or established.

The design can have a recognizable default without prescribing one palette,
animation level or material to every self-hosted deployment. Keep navigation,
scope and approvals consistent across appearances. Offer a small set of coherent
presets rather than a component-by-component theme editor.

Do not migrate to a new Material component framework. Google's Material Web
repository currently carries a maintenance-mode notice, and the reviewed
Expressive implementation guidance primarily targets native Android Compose.
There is no basis here to claim a complete official React M3 Expressive kit.

## Evidence from this pass

The user supplied day/night Hark screenshots and the current Aksara thread.
Fresh local captures of the existing production preview build were taken at
1440×900, including Home and the private thread. They were opened and inspected.
These are visual/code findings, not a complete usability or accessibility study:

1. Home has the intended hierarchy and continuity, but the writing pill and
   floating panels compete with the large introduction. The next pass should
   make the initial writing surface a line beneath that introduction.
2. The thread's outer surface is `rgba(37,35,45,.91)` with no backdrop filter;
   its prose computes to 18px, weight 400, line-height 27.9px. It therefore reads
   as a large opaque panel, despite the atmospheric background. The Activity
   column is useful and should remain.
3. The current surface entrance starts immediately and lasts 220ms, while Home's
   position transition lasts 320ms. The motions are not sequenced. The code
   supports the user's overlap report; this pass did not record a frame-by-frame
   animation trace or hardware timings.
4. Sidebar source combines collapsed `size-8` rules with 48px minimum height,
   custom padding and enlarged icons. Replace that competing geometry with one
   explicit icon cell before changing its active marker to a circle.
5. The background is still an original static WebP moving through a slow CSS
   transform. It does not respond to time or weather.

Taste v2 app-screen guidance is applied to density, readable hierarchy, truthful
data and useful controls. Its default prohibitions on glass, atmospheric color
and large Home type yield to the user's explicit selected direction. Its earlier
automated audit does not qualify a new material/theme implementation.

## One visual system, three materials

| Material | Where | Treatment |
| --- | --- | --- |
| Atmosphere | Background | Broad, desaturated smoke/light fields; very slow movement; no recognizable wallpaper scene |
| Smoked surface | Main workspace and Home panels | Shared tonal tint, restrained backdrop blur, minimal border, readable foreground |
| Solid surface | Review dialogs, menus, dense editors and reduced-transparency mode | Strong tonal separation and stable contrast; never depend on blur to be readable |

Use one token-based smoked material at multiple sizes. Avoid stacking blur on
every message, icon and nested card. Message bubbles can be tonal/translucent
without owning a separate backdrop filter. No glossy reflection, rainbow rim or
distortion is required. The content should carry the design.

Base UI is unstyled and explicitly supports CSS styling and animation state
attributes. It supplies interaction semantics rather than a glass skin. Current
public docs show Base UI 1.9.0; Aksara remains pinned at 1.6.0. Do not silently
upgrade while applying a material.

Cult's actual `EdgeBlur` registry source was inspected: it uses five masked
backdrop layers (1/2/3/6/12px) in a viewport-fixed wrapper. This is a useful donor
for the effect, but not suitable for direct use on every scroll pane. Adapt to
container-local, pointer-transparent edges, initially with a simple tonal fade
and at most a small number of blur layers. The published 75px default is not a
requirement. Keep the composer outside the scrolling transcript and do not blur
the focused control. Study/copy attribution precedes any source port.

## Adaptive appearance without forced brightness

Separate four inputs instead of giving one theme flag several meanings:

- **Palette:** seed and restrained neutral tint. Start with lilac/graphite,
  warm clay and neutral presets; allow a custom seed behind an advanced option.
- **Appearance:** System, Light or Dark. Keep the manual override permanently,
  including after time adaptation ships.
- **Atmosphere:** Local time, Fixed or Off. An optional day/night appearance
  schedule can follow local time, but is distinct from ambient hue changes.
- **Effects:** motion and transparency preferences. Include a simple reduced
  effects preset; honor OS motion/transparency/forced-color preferences where
  available, with explicit in-app fallbacks.

Local-time atmosphere requires no account, location request or weather service.
Use the browser's local clock/timezone by default, with a manual timezone option.
Interpolate a small set of dawn/day/dusk/night atmosphere stops. These are clock
periods, not measured sunrise/sunset. Recompute on resume, timezone change and a
coarse timer; avoid a continuous React render loop. Clock simulation belongs in
development controls so each phase can be inspected immediately.

Replace the wallpaper dependency with locally generated CSS fields plus a
small original texture if needed. Animate composited transform/opacity of a
bounded number of layers; avoid a mandatory WebGL shader or animated blur
radius. Preserve the current raster as a temporary migration fallback until the
procedural result has been compared and measured. No external asset calls.

Material Color Utilities is a candidate for generating paired light/dark
semantic roles from a seed. Its TypeScript implementation exposes contrast and
scheme variants; inspect/pin a released version before integration. Do not
recompute every render or assume arbitrary custom glass remains accessible
because the starting solid colors are. `onSurface`, `surface`, `primary`,
`onPrimary`, container and outline roles should feed our own stable tokens.

Keep running text and status semantics stable while ambient hues drift. Do not
animate a foreground/background pair through untested intermediate contrast.
Measure text against the composited material at bright/dark/time extremes;
target at least WCAG AA, including 4.5:1 for ordinary text. Provide a solid
fallback where transparency prevents that. Error/warning/approval meanings must
not change when a person picks a different accent.

Weather is a separate later input: explicit city or deliberate location grant,
provider terms and deployment configuration, coarse cached condition, bounded
refresh and an honest offline/stale state. No IP lookup or passive geolocation.
It may modulate haze/warmth, never move panels or change a thread's scope.

## Navigation and density

Remove the visible rail container. Keep a full-height navigation region with
top-aligned destinations and profile/settings at the bottom. Use the existing
icon family with a consistent heavier stroke, approximately 22–24px glyphs in
48px cells. A single circular tonal active indicator shares the exact center of
the glyph in both expanded and collapsed states. Hover/focus remains visible.

Expansion changes the label column's width/opacity without sliding the glyphs
off their centers. Labels enter after width begins opening; closing labels
become inert before their column collapses. Collapsed icons keep accessible
names and keyboard-focus tooltips. On phones retain a labeled navigation sheet.

Remove the standalone private-chat rail destination. Home provides the writing
line plus a clear `Open conversation` action and a keyboard-accessible return.
Back/forward and direct thread URLs must still work; this is navigation cleanup,
not deletion of the canonical private thread.

Channels remain one collapsed icon. Expanded navigation shows channel branches
under a separate disclosure control. Opening a channel and expanding its list
must not be the same ambiguous action. Use disclosure/list semantics unless a
full keyboard tree implementation is actually provided; no decorative ARIA tree.

Initial typography targets, subject to rendered checks:

| Element | Target |
| --- | --- |
| Home statement | 44–56px desktop; 32–40px phone; selective inline action |
| Workspace title | 24–28px, medium weight |
| Chat prose | 16px, approximately 500 weight, 1.45–1.5 line height |
| Panel body / labels | 14–15px / 13–14px; strong foreground contrast |
| Message padding | About 12–16px; gaps reflect message groups, not dashboard sections |

These are Aksara proposals, not claimed Material spec measurements. Preserve
text zoom and touch targets rather than shrinking everything to match a
screenshot. Long reading/editing documents may use a different comfortable
measure; dense controls should not set the reading scale.

Keep Activity beside desktop chat. On phones, render work summaries, artifact
previews, questions and computer status inline in the same transcript flow,
with explicit expansion to a focused view. Use registered renderers for real
events; do not ask a model to invent an executable activity UI. Exact approval
and receipt controls remain trusted host components. Show a computer preview
only when a current authorized observation actually exists.

## Home and thread interaction

Home is the stable name; Today describes its date/activity projection. The
initial composer looks like a writing line beneath the title, but remains a
real textarea with a clear focus state, submit control and accessible label.
Attachments and model/source controls can expand when requested. Required
hosted-model consent remains visible when applicable. No decorative microphone
until real microphone capture exists.

Sending need not immediately replace Home with a full thread. A small reply or
accepted-job status can appear beside the input with `Open conversation` inline.
It binds to the same canonical run/message as the full thread, not a copied
conversation. A short acknowledgment such as `Sa terima—sa cek dulu` must follow
host acceptance; it cannot claim execution, success or model reasoning. Queue,
failure and permission states need their own honest text. The current host
commits final output before display; fake streamed thoughts are not introduced.

Exactly one composer controller owns the draft. Switching to the full thread
transfers the visible input/focus without creating two active send surfaces or
discarding a follow-up typed while a reply is arriving.

Home/companion and thread remain bound to the currently authorized context.
Removing the private rail button must not turn a shared-channel composer into
a private assistant entry point. A private conversation action explicitly
switches and acknowledges the appropriate scope before showing private data.
Personal custody and a private institutional lane remain distinct. A future
simultaneous private companion beside shared work needs independent scoped
providers/read sets, not reuse of the shared provider or automatic context mix.

## Motion and scrolling

Implement a small interruptible transition coordinator rather than unrelated
fixed delays:

```text
Home → contracting Home → Home settled → revealing destination → workspace ready
workspace → dismissing destination → expanding Home → Home ready
```

Wait for the Home layout transition's completion before revealing destination
content. Reserve final geometry up front. Reveal the surface with restrained
opacity, a small horizontal offset and a left-to-right mask; any softening
belongs to the entering layer, not the entire app. Start with approximately
220–280ms layout movement and 140–180ms content entrance, then judge the combined
latency. These are tuning hypotheses. Use springs for small direct interactions
and shape/position response; keep text, scroll and reading panels settled.

Handle rapid repeated navigation, interrupted transitions, lazy-loading,
browser Back and resize. Reduced motion skips the choreography. On identity,
database, lane or eligibility changes remove restricted content immediately;
never retain it for an attractive exit animation. Scope changes invalidate all
pending reveal callbacks. Navigation transitions grant no data access.

Use narrow, trackless scroll thumbs where browser/platform support allows,
stronger on hover/focus. Retain OS/accessibility-visible scrollbars, normal
keyboard/wheel/touch scrolling, and a clear content continuation cue. Avoid
global `scrollbar-width:none` and avoid creating extra nested scroll areas.
Rounded clipping and local edge fades should feel consistent across panels.

## Implementation boundaries and qualification

Prefer a small reusable appearance module, semantic material tokens, a layout
transition coordinator and composer presentation variants. Keep authority and
model routing out of appearance code. Cosmetic local preferences can persist;
conversation text, scope tokens and credentials cannot live in theme storage.
Version an eventual deployment theme manifest; limit values to validated
appearance tokens, not arbitrary CSS, URLs or scripts from a Pack/model.

Suggested order:

1. Seed/role tokens, local-time atmosphere, manual overrides and simulation.
2. Invisible navigation geometry and scope-safe private-thread entry.
3. Shared smoked material, compact prose/bubbles and local scroll edges.
4. Sequenced Home/workspace transitions and single-controller Home reply view.
5. Inline phone work/artifacts, then captured desktop/phone comparison and Taste.

Required checks in addition to the repository's standard UI/privacy suites:

- Dawn/day/dusk/night × light/dark × preset/custom seeds; composite contrast,
  high contrast, reduced transparency, unsupported blur and effects-off states.
- Collapsed/expanded active-icon centers; keyboard labels/disclosures; 200% text;
  mobile soft keyboard; scroll edges must not obscure focus or the last message.
- Home draft/focus continuity, thread direct links, Back/forward and rapid
  navigation during layout, lazy load and resize.
- Accepted/failed/cancelled work acknowledgments; no fake completion or model
  thought; source withdrawal and context switching during every animation phase.
- No weather/location/external data request for local-time appearance; reliable
  resume/midnight/timezone recomputation and no retained hidden-tab animation.
- Real Surface/A12 frame-time, input latency and battery/memory observations
  before declaring blur or motion inexpensive. Desktop screenshots alone do not
  prove mobile compositing cost.

## Official references consulted

- [Google Design: research behind Expressive](https://design.google/library/expressive-material-design-google-research): color, shape, size, motion and containment; 46 studies / 18,000+ participants. These findings support the principles, not a measured usability gain for Aksara.
- [Google: Android and Wear OS refresh](https://blog.google/products/android/material-3-expressive-android-wearos-launch/): spring-like responsive motion, emphasized typography, dynamic color and subtle shade blur.
- [Android: Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3): Expressive relationship, tonal color roles, personalization and contrast pairings; Android system dynamic color is not a browser API.
- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities): TypeScript scheme/contrast source inspected; dependency not installed in this research pass.
- [Material Web](https://github.com/material-components/material-web): maintenance notice checked; no framework migration proposed.
- [Base UI styling](https://base-ui.com/react/handbook/styling) and [animation](https://base-ui.com/react/handbook/animation): unstyled primitives and state attributes; current docs are newer than our pinned version.
- [Cult Edge Blur](https://www.cult-ui.com/docs/components/edge-blur), [registry source](https://www.cult-ui.com/r/edge-blur.json), [Expandable Screen](https://www.cult-ui.com/docs/components/expandable-screen) and [Morph Surface](https://www.cult-ui.com/docs/components/morph-surface): actual source/docs reviewed; visual primitives do not supply job authority, persistence or success evidence.
- [MDN reduced transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency): preference support is not universal, so retain an explicit fallback setting.

The Material motion overview returned a JavaScript-only shell; it was not used
as detailed implementation evidence. Motion's public transition page returned
403 in this environment. Existing installed Motion 13 and donor source remain
the implementation baseline; no exact Google spring constants are asserted.
