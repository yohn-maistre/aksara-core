---
name: "Aksara Reading Room"
description: "Warm paper and ink planes for conversation, writing and shared work."
colors:
  lilac: "#75529a"
  lilac-soft: "#ede5f5"
  lilac-user: "#f0e9f5"
  copper: "#d9a47e"
  copper-soft: "#3b2e26"
  copper-user: "#382c24"
  paper: "#faf8f5"
  white-panel: "#ffffff"
  paper-soft: "#efede9"
  paper-ink: "#242329"
  paper-muted: "#69636d"
  paper-line: "#e1ddd7"
  graphite: "#191a1b"
  graphite-panel: "#222425"
  graphite-soft: "#2b2d2f"
  graphite-ink: "#ece8e1"
  graphite-muted: "#b1aca7"
  graphite-line: "#3d3e40"
  copper-on-primary: "#241a12"
  needs-light: "#98603e"
  done-light: "#497259"
  problem-light: "#a34040"
  needs-dark: "#e9b694"
  done-dark: "#a3c7ac"
  problem-dark: "#f0aaaa"
typography:
  display:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.625rem"
    fontWeight: 550
    lineHeight: 1.12
    letterSpacing: "-0.045em"
  document-title:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  heading:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  conversation:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  document-body:
    fontFamily: "Georgia, \"Times New Roman\", serif"
    fontSize: "1.0625rem"
    lineHeight: 1.75
  control:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 550
  metadata:
    fontFamily: "\"Inter Variable\", Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
rounded:
  channel: "6px"
  control: "8px"
  input: "10px"
  composer: "11px"
  panel: "12px"
  dialog: "16px"
spacing:
  tight: "8px"
  control: "12px"
  section: "24px"
  reading: "36px"
  home-gutter: "52px"
components:
  button-primary:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.white-panel}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.white-panel}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "38px"
  button-text:
    textColor: "{colors.lilac}"
    typography: "{typography.control}"
    padding: "9px 0"
  input:
    backgroundColor: "{colors.white-panel}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.input}"
    padding: "11px 12px"
    height: "44px"
  nav-active:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.lilac}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    height: "42px"
  privacy-chip:
    textColor: "{colors.paper-muted}"
    size: "0.75rem"
  attention-document:
    backgroundColor: "{colors.white-panel}"
    textColor: "{colors.paper-ink}"
    padding: "23px 25px 18px"
    rounded: "4px 13px 13px 13px"
  composer:
    backgroundColor: "{colors.white-panel}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.composer}"
    padding: "6px 9px"
    height: "48px"
---

# Design System: Aksara Reading Room

## Overview

**Creative North Star: "The Working Reading Room"**

Aksara is a working reading room: warm paper, quiet ink, a clear conversation and a document that carries the emphasis. The retained open-triangle mark anchors a compact, labeled interface. The tone is concise and welcoming, with space given to reading and writing rather than atmospheric decoration.

Flat planes and hairline boundaries organize the work. Light mode pairs warm paper with lilac; dark mode changes character to graphite and muted copper. Inter keeps navigation and controls clear, while Georgia gives document paragraphs an editorial reading texture.

**Key Characteristics:**
- Paper and ink planes with restrained tonal separation.
- Compact Inter controls and Georgia document paragraphs.
- A conversation and its document share one room.
- Responsive writing space with explicit context and save state.

This system records the implemented Reading Room in `apps/platform/src/reading-room.css`, the resolved default palette in `workspace/appearance.ts`, and its React surfaces. Alternate palette preferences exist; the normative visual family here is the default lilac/light and copper/dark pairing. The direction-seed provenance gap is recorded in `.impeccable/surfaces/reading-room.md`; this document does not establish a strict workflow or reproduction qualification.

## Colors

The palette is warm and quiet, with a single primary accent that changes between light and dark appearance. Frontmatter values are normative; semantic CSS variables resolve the active appearance.

### Primary

- **Reading Lilac** (`lilac`): light-mode primary actions, selected navigation, links and working-state emphasis. **Lilac Wash** (`lilac-soft`) separates selected items and tints the document's conversation plane. **Lilac Reply** (`lilac-user`) identifies a person's message.
- **Muted Copper** (`copper`): dark-mode counterpart to Reading Lilac. **Copper Wash** (`copper-soft`) and **Copper Reply** (`copper-user`) carry the corresponding tinted areas. Primary text changes from white to `copper-on-primary` in dark mode.

### Neutral

- **Warm Paper** (`paper`), **White Panel** (`white-panel`) and **Paper Soft** (`paper-soft`) define canvas, contained fields and subtle tonal areas. **Paper Ink**, **Paper Muted** and **Paper Line** carry text, metadata and hairlines.
- **Graphite** (`graphite`), **Graphite Panel** and **Graphite Soft** resolve the same roles in dark mode. **Graphite Ink**, **Graphite Muted** and **Graphite Line** keep their warm character.
- **Needs**, **Done** and **Problem** tokens carry task state in both appearances. Pair status color with readable text or an icon; working state reuses the primary accent.

**The Reading Accent Rule.** Use lilac on warm paper and copper on graphite for primary actions, selected navigation and interaction emphasis. The legacy CSS name “green” denotes this accent role, not a green hue.

## Typography

**Interface Font:** Inter Variable, with Inter and sans-serif fallbacks.
**Document Paragraph Font:** Georgia, with Times New Roman and serif fallbacks.

The interface is compact and conversational. The serif is reserved for paragraph reading inside the working document; editable titles, document headings and list content retain the interface voice.

### Hierarchy

- **Display:** the Home living-brief heading uses `display`; it becomes (2rem) on phones. This is a surface-specific greeting, not a requirement for every screen.
- **Document title:** `document-title`; it becomes (1.625rem) on phones. The editable field remains visibly part of the document.
- **Headings:** editor headings use Inter with tight tracking. The implemented h1/h2/h3 sizes are (1.75rem), (1.375rem) and (1.125rem), with line heights (1.3), (1.35) and (1.4).
- **Body / conversation:** `body` governs the interface; `conversation` uses a little more leading for message reading. The narrow adjacent thread uses (0.8125rem) paragraphs.
- **Document paragraphs:** `document-body`; other editor content starts at (1rem). Do not infer a global character-width limit: the implemented document fills its available plane.
- **Controls / metadata:** `control` and `metadata`; context labels can reach (0.75rem), while phone save and byline metadata use (0.625rem). Use small type only for secondary context.

**The Two Voices Rule.** Keep interface text, document titles and headings in Inter. Use Georgia for document paragraphs; do not apply the serif indiscriminately to controls, lists or the whole editor.

## Layout

The shell fills the dynamic viewport (100dvh). Its outer frame stays fixed while document, thread and content regions scroll independently. The desktop navigation is a left rail (76px collapsed; 232px expanded). The document view gives its adjacent conversation (310px) and the rest of the width to the document, separated by a hairline. Document padding is (36px 36px 65px); the top and bottom action bars remain outside its scrolling article.

At widths up to (1100px), the adjacent document thread is hidden and a named conversation return appears in the document top bar. At widths up to (767px), the rail is hidden, the document takes the full screen, and navigation uses the compact bottom launcher. Phone document padding is (26px 21px 44px). Bottom controls account for `env(safe-area-inset-bottom)`; phone composer text is (1rem).

Home has a centered container with a maximum width of (1040px), desktop side padding (52px), and a living brief above a two-column desk. That desk uses (1.1fr / 1fr) and a (48px) gap, then stacks on phones. Home remains a dedicated view rather than a permanent third column. These are implemented surface patterns, not a template imposed on all future screens.

Use the observed spacing steps for control gaps and section rhythm. Keep primary work broad and secondary context compact. Phone controls and long titles must fit without creating horizontal overflow.

## Elevation & Depth

Working planes have no shadows. Canvas, soft tints, panel fills and single-pixel boundaries provide structure. Popovers, dialogs, transient errors and the phone launcher dock use soft ambient shadows to show that they sit above the workspace.

### Shadow Vocabulary

- **Menu:** `0 10px 35px #0002` for composer options and context menus.
- **Dialog:** `0 20px 65px #0003` for centered review and setup dialogs.
- **Toast:** `0 8px 35px #0002` for transient feedback.
- **Phone dock:** `0 5px 22px #0002` for the compact launcher.

**The Flat Room Rule.** Keep working planes flat at rest. Reserve soft shadows for temporary overlays and the phone launcher dock.

Page changes use a short (200ms) opacity and (5px) vertical settling motion; navigation expansion takes (240ms). Buttons transition background and color over (150ms) and compress slightly on press (0.985 scale). Reduced-motion preferences remove transitions and animation. Do not add mandatory shaders to the reading workspace.

## Shapes

Controls have gently rounded corners, chiefly (8px). General fields use (10px), the compact composer (11px), contained panels (12px), and dialogs (16px). Hairline borders are the normal boundary. The Home attention document has a slightly square leading corner (4px 13px 13px 13px); user messages use (0 10px 10px 10px). Keep these asymmetric shapes for their existing document and message roles. Identity initials and status dots are circular. The open-triangle mark is a simple vector outline, without a decorative badge or invented glyph.

## Components

### Buttons

Quiet, compact controls make the next action clear. Primary buttons use the active accent and contrasting primary foreground; secondary buttons use panel fill, ink and a hairline border. Both have (38px) minimum height, control corners and (0 16px) padding. Text buttons carry the accent without a filled container. Icon buttons provide a minimum (36px) square area. Hover changes are restrained; focus uses a visible (2px) accent outline with offset, and disabled controls reduce opacity to (0.45). Avoid adding raised hover movement.

### Chips

Audience and privacy indicators combine a small outline icon with muted, sentence-case context. Their purpose is understandable scope. They do not compete with the working title or become a colored taxonomy.

### Cards / Containers

Most content is a flat plane or a hairline-separated row. The Home attention document is a panel-backed, bordered interactive document preview with an accent icon and restrained asymmetric corners; its border changes to the accent on hover. Settings containers use a simple rounded panel with (24px) padding. Keep overlay shadows confined to the vocabulary above.

### Inputs / Fields

Standard fields use panel fill, ink text, a hairline border, input corners and (11px 12px) padding with a (44px) minimum height. The working title is an unboxed, full-width Inter title field. Give it visible accent focus. The compact conversation composer has one bordered container around an unboxed textarea and a square accent send action. Home uses the same composer in a bottom-rule presentation so the invitation reads as part of the brief. On phones, composer text increases to (1rem) for comfortable writing.

### Navigation

The retained triangle and labeled Inter destinations occupy the left edge. Current destinations and channels use the soft accent fill and accent text; hover uses the soft neutral fill. Expanded shared channels are indented behind a vertical hairline, with ellipsis for long names. The collapsed rail retains icons and accessible labels. On phones, a small launcher opens the available spaces; preserve direct access to the originating named conversation when the document thread is hidden.

### Conversation and Working Document

Assistant replies sit directly on the conversation plane; a person's message receives a soft tinted container. Each message has an explicit author label. The document uses a clear Inter title, scope/byline, serif paragraphs and understated save state. Its anchored bottom action bar keeps contextual help and preparing for review close to the content. Responsive reflow prioritizes the artifact's writing space while preserving context through the return control. A review annotation or live work progression is not a documented visual primitive until its rendered state is verified.

## Do's and Don'ts

### Do:
- **Do** keep audience, save state and source context readable beside the actual work.
- **Do** preserve a direct named conversation return when the adjacent thread is hidden.
- **Do** use the implemented accent outline for keyboard focus and respect reduced motion.
- **Do** give phone inputs a readable 1rem size and account for the bottom safe area.

### Don't:
- **Don't** introduce atmospheric wallpaper or decorative blobs into the Reading Room.
- **Don't** turn every work item into a floating dashboard card; use hairline-separated rows where the implementation does.
- **Don't** substitute blue-slate dark surfaces for the graphite and copper palette.
- **Don't** imply live collaboration, real contributors or real model activity through decorative presence or fabricated content.
