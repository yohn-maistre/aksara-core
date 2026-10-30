# Atmospheric workspace design QA

Date: 30 October 2026 (Asia/Bangkok).

Source visual truth: the user selected all three generated screens as one
interaction system, then requested a smoked background and regular, more opaque
full-height spine. The consolidated thread target is
`/workspace/generated_images/exec-7aa8cf3e-7bf6-4d5e-837a-a6a71ccf4106.png`.
The approved Home/Library targets are `exec-25506d4c-5054-4f1c-a243-adcbd1d87f2d.png`
and `exec-d191ed68-aee9-4323-8e39-52b2c7b24e8e.png` in the same directory.

Implementation: browser-rendered local production preview, captured through
Playwright Chromium at 1487 × 1058 CSS pixels, deviceScaleFactor 1. Source desktop
images and final implementation captures are each 1487 × 1058 pixels. No device
chrome or density compensation is involved. Combined comparison artifacts below
normalize both sides equally to 1000-pixel width for review. Focused prose crops
retain native pixel size. Phone inspection uses 390 × 844; automated checks also
use 360 × 800 and 200% root text.

Evidence:

- [Home combined comparison](docs/platform/ui-audit/atmospheric-compare-home.jpg).
- [Thread combined comparison](docs/platform/ui-audit/atmospheric-compare-thread.jpg).
- [Library combined comparison](docs/platform/ui-audit/atmospheric-compare-library.jpg).
- [Native-scale prose comparison](docs/platform/ui-audit/atmospheric-compare-detail.jpg).
- [Rendered phone thread](docs/platform/ui-audit/atmospheric-thread-phone.jpg).
- Raw captures: `/workspace/aksara-ui-research/atmosphere-final/`.

## Comparison history

1. Initial browser pass: P2 inherited outer boxes around user messages, small
   conversation type and incorrect alignment; P2 Home Library panel below the
   first desktop fold; P2 Library's composer moved below its growing content.
   Evidence was saved in `atmosphere-home-first.png` and
   `atmosphere-library-first.png` under the research directory, with the first
   thread capture before fixes.
2. Corrected bubble prose/width/alignment and removed inherited article fills;
   increased body size, made reply actions contextual, put useful Home panels
   into the desktop opening, and separated scrollable workspace content from its
   composer. A later capture exposed companion height extending below the
   viewport and transient horizontal overflow during resize. Those were P2.
3. Bounded companion height to the available dynamic viewport; kept the position
   transition inside the workspace canvas; re-captured at the same viewport.
   Inspected the final combined comparisons and native-scale prose crops.
   Preview checks now also cover resize and 200% text without sideways overflow.
   No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces

- **Typography:** actual local Inter Variable loaded; the source's human sans
  hierarchy is retained. Home is large; ordinary bubbles use comfortable prose
  rather than Cult's display h1 wrapper. Secondary labels remain readable, date
  numbers are tabular, and unbroken content wraps. Phone inputs use 16px default
  type. A generated reference's exact word wrapping is not imposed on different
  real content.
- **Spacing/layout:** regular tall rail, bounded work surface, floating continuing
  Home, conversation/activity split and one composer are present. Home contracts
  within the same context; restricted state remounts across scope changes. Phones
  present one active surface. The narrow activity toggle replaces squeezed
  desktop columns. Scrollable Home/content areas remain reachable.
- **Colors/tokens:** graphite/lilac/warm roles apply in dark and light modes.
  Materials use enough opacity for text and exact review. A localized rail wash
  stays subordinate. Scope and preview disclosure remain visible.
- **Images:** the generated smoked raster is installed and optimized, without a
  scene/horizon or borrowed wallpaper. Lucide outline icons and the original
  product sprig remain actual vector icons. No fabricated computer screenshot is
  substituted for the unimplemented interactive computer backend.
- **Copy/content:** real eligible sources, reviewed excerpts, work states and
  registered surfaces replace generated fixture examples. No fake meetings,
  weather measurement, productivity percentage or tool trace is added. Preview
  disclosures are intentional; original model/effect authority remains intact.

## Interaction and console checks

Primary flows exercised: Home/panel selection, draft-preserving navigation,
Library import/search/collections, exact document review/approval/receipt,
knowledge review/withdrawal, actual model fixture reply/OpenUI rendering, pinning
and dependency invalidation, shared/personal context changes, local read-aloud,
onboarding choices and theme/motion controls. Desktop/mobile dark/light captures
reported zero browser page errors. Product/preview checks also assert current
privacy and consent behavior. See the linked audit for counts and Taste waivers.

Intentional differences: no connected weather/calendar service or microphone
capture; no invented active computer; no complete company-wiki synthesis. Pins
and layout are tab-local. These are explicit capability boundaries, not missing
raster assets. Real Surface Pro/A12 keyboard, battery and frame-time measurements
remain qualification work.

## Follow-up polish

P3: tune transition timings on actual phone hardware and refine Home copy with
more useful real work context as the catalogue grows. These do not block the
selected foundation.

final result: passed
