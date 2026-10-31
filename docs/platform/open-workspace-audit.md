# Open workspace audit

31 October 2026. This replaces the visual direction, not the historical evidence
in [the first OpenDuet audit](ui-audit.md).

The user chose a sky-lit, open workspace with translucent objects, lilac accents,
a compact messaging thread, a persistent Home and a floating phone dock. No
random Taste style was dealt. The product's face is its continuing Home and
source-linked work, with the selected open triangle mark. Fonts remain local.

## What changed

The large enclosing surface is transparent. Library and capability content sit
on the sky, while smaller cards, popovers and inputs keep their own material.
Private conversation uses the same peer layout; Home contracts beside it on a
wide screen. Closing returns to the originating surface and authorized context.
One reply bubble replaces the duplicate Home conversation entry.

Home moves over 540ms and the destination settles over 460ms after contraction.
A bounded completion fallback handles interrupted layouts. Normal menus and
controls remain quick. Navbar width transitions keep its left edge and icon
column fixed; channel branches have a hairline tree and collapsible children.
Aksara's persistent entry lives above the footer utilities. Mobile keeps the
floating dock and one composer.

Three coarse CSS gradients drift independently over 38–58 seconds. They stop
when the page is hidden, motion is paused, or reduced effects/motion is selected.
Solar height changes sky colors continuously through dawn and dusk; the binary
text/component theme does not drive the sky. Cloud contrast quiets near the ink
crossover. An approximate city/location enables local sunrise/sunset calculation;
without it, an explicitly labeled local-clock approximation is used. Weather is
separate, optional, and off by default. No wallpaper image is required.

## Inspection

Taste v2 2.1.5 app-screen probes were run at 1440, 768 and 390 pixels on Home,
Library and Capabilities. Captures wait for the authorized route's lazy heading
and its motion to settle. Actual screenshots were inspected, including the
expanded navbar and private thread. Browser regression checks additionally cover
360 pixels, 200% text, keyboard focus, interrupted motion and scope changes.

- **Home:** answers what needs attention and offers one input. Work and Library
  panels intentionally size to their contents; the calendar is an unboxed
  companion, not an equal-height metric tile. Synthetic work counts derive from
  the same disposable preview collection.
- **Library:** reviewed knowledge leads, followed by original files and created
  documents. File actions and search stay close to that content. Small sample
  collections leave open space; no invented records fill the canvas.
- **Capabilities:** actual registered tools/packs and their availability, with
  direct setup paths. No claim that preview-only tools are live.
- **Private thread:** chat, actual work and eligible artifacts remain together;
  Home is secondary and the composer stays in view. A shared channel uses the
  same message grammar with its own authorized audience.

The inspector still flags gradient/glass and the large Home title. These are
explicit user choices, not a clean automated pass. Its page-centering heuristics
also flag the intentional nav/main/Home split and independent panel heights.
The smaller Library/Capabilities titles are deliberate app titles (22–25px).
Some capability metadata stays at 12px; body text and actions remain larger.
No sideways overflow was found in the nine route/viewport captures.

Mobbin searches returned INVALID_ARGUMENT twice; no Mobbin references were
retrieved or claimed. This pass uses the user's references, current official
Motion/SunCalc documentation, and direct browser evidence.

## Limits

The Pages preview contains synthetic work, source excerpts and messages, reset
on reload. It never invokes models, native desktop or live weather. Local browser
checks use the real Rust/Mastra boundary with scripted model output, not a claim
about model reasoning. Reduced effects is available for older hardware; actual
Surface Pro 3 graphics, memory use and accessibility still need device testing.

The root README now leads with the product, local setup and current limits.
Internal catalogue/research notes remain linked for engineering review.

[Library desktop](ui-audit/open-library-desktop.jpg) ·
[Private thread desktop](ui-audit/open-private-desktop.jpg) ·
[Dark thread](ui-audit/open-private-dark.jpg) ·
[Phone thread](ui-audit/open-private-mobile.jpg)

Final local checks: 24 product browser scenarios, 27 disconnected-preview
scenarios, eight privacy/approval checks, and the runtime suite (37 passed,
one optional Docker fixture skipped). The sky tests scan a full solar day in
15-second intervals across both component-theme changes, including polar day
and invalid stored locations. The fixed weather port passed its bounded
synthetic contract and an actual public Jayapura search/forecast request.
The phone regression now asserts that the private Send control sits above the
floating dock; screenshot inspection found and corrected the earlier overlap.

Sources: [Motion layout](https://motion.dev/docs/react-layout-animations),
[Motion reduced motion](https://motion.dev/docs/react-use-reduced-motion),
[SunCalc](https://github.com/mourner/suncalc),
[Open-Meteo forecast API](https://open-meteo.com/en/docs),
[Open-Meteo terms](https://open-meteo.com/en/terms).
