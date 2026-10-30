# Atmospheric UI qualification

30 October 2026 (Asia/Bangkok). Implements the selected generated images as one
Home/Library/thread system, including the user's later regular-spine and smoked
background refinements. The previous fluid/OpenDuet audits are historical.

[Home](ui-audit/atmospheric-home-desktop.jpg) ·
[Thread](ui-audit/atmospheric-thread-desktop.jpg) ·
[Library/light](ui-audit/atmospheric-library-light.jpg) ·
[Phone thread](ui-audit/atmospheric-thread-phone.jpg).
All captures show fictional, tab-local preview data.

Taste v2's app-screen browser inspector checked 1440, 768 and 390 px. The final
report has zero unwaived failures/warnings. Explicit aesthetic allowances:

- `purple`: the user selected lilac as a brand accent.
- `app-title-size`: the user explicitly selected a larger Home headline.
- `ragged-row`: independent floating Home panels may have different heights.
- `no-data-hue`: only real recorded work is colored; empty dates are not invented
  to increase the chart's measured color coverage.

There are no contrast, overflow, tiny-text, broken-image or font waivers.
The inspector prompted real fixes to calendar label size and tabular numbers.

Combined reference/implementation comparisons were inspected for
[Home](ui-audit/atmospheric-compare-home.jpg),
[thread](ui-audit/atmospheric-compare-thread.jpg),
[Library](ui-audit/atmospheric-compare-library.jpg) and
[focused thread typography](ui-audit/atmospheric-compare-detail.jpg).
The source and desktop captures are 1487 × 1058 pixels at CSS scale 1. The user
approved a direction across several screens, not a single frozen data fixture.
Actual knowledge/file/work contents differ intentionally from generated examples.

The visual loop fixed inherited user-message outer boxes, incorrect bubble
alignment, undersized prose, below-fold desktop Home panels, offscreen composers,
companion height and transient horizontal overflow during Home/viewport changes.
The last captures show the resulting layout. Root `design-qa.md` records the gate.

Behavioral evidence: 19 real-host product checks, 21 preview checks and 8 existing
privacy/approval smoke checks pass. Coverage includes actual Mastra fixture
responses, source withdrawal of knowledge and pinned cards, exact effect review,
receipts, personal/shared separation, keyboard consent, panel/draft continuity,
shared-channel branches, focus-contained mobile navigation, 360 px layout and
200% text. Dark/light and phone capture flows reported no console errors.

The animated background is optional and stops for hidden tabs or reduced motion.
No weather service, microphone capture, persistent agent computer or unbounded
UI code is enabled by visual polish. No physical phone frame-time, thermal,
battery, native-keyboard or complete accessibility certification is claimed.
