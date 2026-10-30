# Expressive workspace checkpoint

30 October 2026 (Asia/Bangkok). Implements the user's dock/blob/composer
refinement on top of the [expressive direction](expressive-workspace-direction.md).
Rust authority, model adapters and reviewed-effect protocols remain intact.

## Implemented

- Desktop navigation uses Cult's proximity/spring dock mechanism with native
  destination buttons, a centered circular active marker, heavier icons and
  an invisible collapsed rail. Expansion reveals labels and shared-channel
  branches. Profile/settings remain at the bottom. Demo image cards, indefinite
  click bouncing and ambient global pointer listeners are excluded.
- Phones have a floating bottom dock for Home, Library, Channels, Packs and
  More. Primary navigation does not require the drawer. More opens the existing
  focus-trapped sheet for secondary destinations and channel branches.
- The separate private-chat navigation item is removed. Cult's AiBlobWarp
  launches the private conversation through a scope-bound shared-layout expansion
  into a large focused surface over blurred background. This remains app navigation
  state, not a second conversation or independent dialog authority. Close/Escape
  returns to Home and preserves the same-scope draft. Desktop navigation and
  the phone dock remain usable. Private entry from a shared context waits for
  host scope admission and blocks sending during the switch.
- The real Paper Warp shader is lazy-loaded. Hidden/offscreen, reduced-motion,
  reduced-effects, paused or unavailable-GPU conditions use a still fallback.
  A render boundary also contains shader initialization failures. This is visual
  presence, not evidence of a model thinking or microphone capture.
- The composer adopts the supplied Ask Bar's auto-growing multiline ergonomics
  within Aksara's existing controlled form. Provider/source choices, consent,
  draft continuity and canonical messages remain ours. The supplied fake
  streaming loop, filename-only attachments, canned model replies and browser
  SpeechRecognition path are not imported. No microphone button is displayed.
- Home has a writing line below its statement. Sending from Home stays there;
  a short preview of a currently eligible committed reply offers Open conversation.
  The same canonical messages render in the full thread. No unconditional
  acknowledgment or fake streamed reasoning is manufactured. Current pending
  work has an expandable Dynamic Island; its buttons open ordinary trusted review.
- The existing registered OpenUI `ProgressStatus` component uses controlled
  Dynamic Island presentation around freshly host-resolved resources. This adds
  no renderer language, arbitrary callback, tool grant or approval capability.
- Threads have denser 16px/500 prose, quieter bubbles and thinner scrollbars.
  Desktop Activity remains beside the transcript; phones scroll work/artifact
  cards in the same pane after messages. A small local edge treatment sits
  above the composer. A computer still truthfully says Not connected.
- Main surfaces and panels share smoked tonal materials, with solid/reduced
  transparency fallbacks. Home contraction precedes the next surface reveal.
  Layout completion is primary; a bounded cancellation fallback avoids a stuck
  invisible destination. Completion is fenced to its current route; an ARM CI
  failure exposed the stale-callback race, now covered under 4× CPU throttling.
  Scope changes invalidate the reveal and unmount old
  restricted content immediately.
- Material Color Utilities generates paired roles for Lilac, Clay, Sage and
  Neutral palettes. Light/dark remains manually controllable. Procedural smoke
  responds to local clock phases without the previous wallpaper dependency,
  network calls or geolocation. Settings offers clock simulation, plain background
  and reduced effects. Palette/effect choices persist locally; simulated hour
  and private content remain outside appearance storage. Public PWA cache
  version 3 drops the obsolete smoke asset from its precache.

## Source reuse

Cult registry source for Dock, Dynamic Island, AiBlobWarp and Floating Panel was
read and compared with the pinned `d71b1428…` checkout; all four matched. Dock
and Island are focused adaptations; AiBlobWarp retains the actual shader
component. Floating Panel's scoped expansion pattern informed the existing
Motion surface; its full demo/form is not installed.

The 21st Designali liquid-glass page was readable, but its source endpoint
returned 403 and page license metadata was empty. It is a visual reference only;
none of its implementation is copied. The supplied Ask Bar lacked its referenced
CSS; its ergonomics inform our existing composer rather than vendoring an
incomplete demonstration. See [donor ledger](../donors.md).

Paper Shaders 0.0.82 and Material Color Utilities 0.4.0 are exact Apache-2.0
dependencies. Static distributions include upstream license/notice files.
Existing Cult/shadcn/Octopus notices remain distributed.

## Verification

- Production host and preview builds pass.
- 25 preview browser checks pass, including direct phone navigation, multiline
  composer/draft continuity, clock simulation, disposable private data, model
  disconnection and the Pages API guard.
- 20 real-host browser checks pass, including the actual Mastra adapter,
  source-dependent reply/knowledge/pin withdrawal, exact approval/receipt flow,
  private/shared/personal separation and delayed private-entry admission.
- Eight existing privacy/approval browser smoke checks pass.
- Taste v2 checks desktop/tablet/phone. The gradient exception is explicitly
  allowed for the user-requested procedural atmosphere, alongside prior
  lilac/Home headline/panel-height/sparse-calendar exceptions. No contrast,
  overflow, unloaded-font or small-text failure is waived.
- Fresh captures show dark Home/thread/channel, light Sage Library, phone
  Home/thread/inline work/composer, and a compact-height viewport. No page errors
  occurred. Dock glyph/marker centers match (measured difference zero pixels).
  The compact composer send control remains in the viewport.
  See [visual QA](../../design-qa.md).

## Limits

Weather is not connected; local clock phases are not real sunrise/sunset.
System appearance, custom seed colors and timezone selection are not included
in these four-preset controls. Browser Back/deep-link routing is not added.
Pinned Home layouts remain tab-local. Generic model-defined islands/questions
and automatic layout mutation remain gated.

Microphone capture, interactive computers, persistent agent desktops, full wiki
synthesis and durable subagent/tool recovery remain catalogue gates. Screenshots
and a reduced-height viewport are not Surface/A12 GPU, keyboard, battery,
thermal or frame-time measurements. Pages remains a disconnected disposable
UI preview; real-host tests run the existing Rust-backed application separately.
