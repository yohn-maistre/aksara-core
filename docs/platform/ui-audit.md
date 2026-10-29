# OpenDuet fidelity and Taste v2 audit

29 October 2026. The requested starting point is OpenDuet's interface, before
developing a separate Aksara visual identity. This is a product UI change; the
Rust authority, backend and model/device adapters are unchanged.

## What is reused

OpenDuet MIT source at `60fd4c71d9d82e13739dce00827278154d13c947` supplies the
brief, card/row/icon/motion primitives, actual canvas orb and drawing functions,
neutral light/dark tokens, and typography. Its shell/header/tab/menu source
supplies the 430px primary column, 46px header discs and 344px floating tab bar
with a moving active capsule. The menu uses our existing Base UI Dialog for
focus containment and Escape dismissal. These are adapted source components,
not an iframe or a dependency on OpenDuet's hosted backend.

The sidebar, marketing hero, metric rail and footer are removed. Today leads
with eligible work. Ask keeps its composer above navigation while the transcript
scrolls separately. Model/source controls open from a disclosure; hosted egress
consent stays visible. Secondary Library, Tools, Channels and Settings views
retain Aksara's functionality and may expand to 900px for forms and review.
Tabs are named Today, Ask and Library rather than OpenDuet's Chat, Tasks and
Make. Scope and private/shared audience remain explicit. This is a close shell
starting point, not a claim of pixel parity across every screen.

Inter Variable is bundled locally with its OFL license. No font CDN, new UI
framework or Intelligence account is required. Additional shadcn blocks can
be added when a workflow needs them; the existing accessible primitives cover
this shell without adding a second competing component system.

## Audit route and evidence

The installed [Taste v2 skill](../../.agents/skills/design-taste-frontend/SKILL.md)
is release 2.1.5, pinned in its `UPSTREAM.md`. Its app-screen route applies.
OpenDuet is the selected visual direction, so no random style was dealt.

1. **Today — improved.** The first screen now answers “What needs me?” with
   the brief and its review action. A 24px greeting replaces the 34px title and
   large decorative hero. Desktop and tablet intentionally keep the donor's
   centered phone width. [Desktop](ui-audit/today-desktop.jpg),
   [mobile](ui-audit/today-mobile.jpg), [before](ui-audit/before-mobile.jpg).
2. **Menu — passes keyboard checks.** Channels and secondary destinations
   remain available through a focus-trapped sheet. Eighteen Tab moves remain
   inside it; Escape returns focus to the opener. [Capture](ui-audit/menu-mobile.png).
3. **Ask — improved.** The input and Send control stay above tabs. Provider
   and source settings are reachable without covering the composer. A phone
   at 200% root text size has no sideways overflow and the input stays above
   navigation. [Capture](ui-audit/ask-mobile.png).
4. **Library / review — passes regression checks.** Original source ingestion,
   exact document review, approval, execution and receipt still work against
   the real local backend. Withdrawal removes dependent replies.
5. **Settings / contexts / Tools — passes regression checks.** Separate personal
   storage, private/shared eligibility, local read-aloud controls, simulator
   review and per-turn hosted consent still work. [Dark Today](ui-audit/today-dark.png).

Taste inspector captured 1440, 768 and 390px renders of the built preview before
and after. Manual review also covered Menu, Ask, Library, Tools, Settings,
dark mode and enlarged text. The first pass found five failing rule categories,
including tiny text, icon tiles and heavy shadows. The final Today inspector
reports **0 unwaived failures and 0 warnings**, with these explicit allowances:

| Check            | Reason retained                                                          |
| ---------------- | ------------------------------------------------------------------------ |
| `palette-purple` | OpenDuet's actual accent, required by the selected visual reference.     |
| `heavy-shadow`   | The original brief/card edge and soft shadow, retained for fidelity.     |
| `hero-void`      | The centered 430px primary shell is deliberately narrow on wide screens. |

These are disclosed aesthetic exceptions, not repaired failures. The source
linter reports 0 failures and 27 warnings: chiefly donor blur/shadows/status
tokens, metadata styling, a date-padding operation and a genuine digest/code
font. The existing-brand rule permits keeping donor presentation. No inspector
code or finding was altered. [Recorded measurements](ui-audit/measurements.json).

App-screen critique: the brief carries the primary question; all content shares
its two edges; color is reserved for action/status; counts come from eligible
work; empty and historical states stay honest; no charts or fake metrics are
introduced; phone navigation folds into a menu and bottom tabs. The remaining
wide-screen empty space is intentional donor fidelity. Secondary screens still
use Aksara feature-specific forms rather than cloning OpenDuet's backend flows.

## Reproduce

Requires Node 24.19 and installed Chromium. `CHROME_PATH` can point at
Playwright's Chromium executable. Serve the **built** preview, then run:

```sh
npm run build:preview
python3 -m http.server 17900 --bind 127.0.0.1 --directory apps/platform/dist-preview
# In another terminal:
node .agents/skills/design-taste-frontend/scripts/lint.mjs --app apps/platform/src
node .agents/skills/design-taste-frontend/scripts/inspect.mjs --app http://127.0.0.1:17900 \
  --allow palette-purple,heavy-shadow,hero-void --out .taste-skill/after
node tests/preview-browser.mjs
npm run build
node tests/platform-browser.mjs
python3 scripts/browser_smoke.py
```

Validation: 13 preview browser checks, 14 real-platform browser checks, 8 legacy
privacy/approval checks; existing runtime/contract checks also pass. Screenshots
are synthetic preview data. Visual/keyboard checks are not a full WCAG audit or
a Samsung A12 hardware qualification. Hosted Pages remains a disposable browser
preview; operational backend tests here use the actual Rust stack with fixtures.
