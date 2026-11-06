---
name: Aksara Workbench
description: An industrial editorial workspace for conversation and shared artifacts.
colors:
  clay: '#8a5638'
  clay-soft: '#f0e4d9'
  clay-user: '#f4e9df'
  lilac: '#75529a'
  lilac-soft: '#ede5f5'
  lilac-user: '#f0e9f5'
  copper: '#d9a47e'
  copper-soft: '#3b2e26'
  copper-user: '#382c24'
  paper: '#faf8f5'
  white-panel: '#ffffff'
  paper-soft: '#efede9'
  paper-ink: '#242329'
  paper-muted: '#69636d'
  paper-line: '#e1ddd7'
  graphite: '#191a1b'
  graphite-panel: '#222425'
  graphite-soft: '#2b2d2f'
  graphite-ink: '#ece8e1'
  graphite-muted: '#b1aca7'
  graphite-line: '#3d3e40'
  copper-on-primary: '#241a12'
  needs-light: '#98603e'
  done-light: '#497259'
  problem-light: '#a34040'
  needs-dark: '#e9b694'
  done-dark: '#a3c7ac'
  problem-dark: '#f0aaaa'
typography:
  display:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 2.25rem
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: -0.035em
  headline:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 1.875rem
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: -0.035em
  document-title:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 1.875rem
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: -0.035em
  title:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.015em
  body:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  conversation:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  document-body:
    fontFamily: Georgia, "Times New Roman", serif
    fontSize: 1.0625rem
    lineHeight: 1.75
  control:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 0.8125rem
    fontWeight: 550
  metadata:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: 0.6875rem
rounded:
  chip: 4px
  tab: 5px
  control: 6px
  switch: 7px
  panel: 8px
  composer: 9px
  menu: 10px
  dialog: 12px
spacing:
  tight: 8px
  control: 12px
  item: 16px
  panel: 20px
  section: 24px
  wide: 28px
  page: 32px
  workbench: 36px
components:
  button-primary:
    backgroundColor: '{colors.clay}'
    textColor: '{colors.white-panel}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: 8px 14px
    height: 38px
  button-secondary:
    backgroundColor: '{colors.white-panel}'
    textColor: '{colors.paper-ink}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: 8px 14px
    height: 38px
  button-text:
    textColor: '{colors.clay}'
    typography: '{typography.control}'
    padding: 4px 0
    height: 34px
  input:
    backgroundColor: '{colors.white-panel}'
    textColor: '{colors.paper-ink}'
    rounded: '{rounded.control}'
    padding: 9px 12px
    height: 38px
  nav-active:
    backgroundColor: '{colors.clay-soft}'
    textColor: '{colors.clay}'
    rounded: '{rounded.control}'
    padding: 8px 12px
    height: 38px
  privacy-chip:
    backgroundColor: '{colors.paper-soft}'
    textColor: '{colors.paper-muted}'
    typography: '{typography.metadata}'
    rounded: '{rounded.chip}'
    padding: 4px 8px
  artifact-preview:
    backgroundColor: '{colors.white-panel}'
    textColor: '{colors.paper-ink}'
    rounded: '{rounded.panel}'
    padding: 20px
  composer:
    backgroundColor: '{colors.white-panel}'
    textColor: '{colors.paper-ink}'
    rounded: '{rounded.composer}'
    padding: 9px
  private-pane:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.paper-ink}'
    width: 390px
    height: 100dvh
---

# Design System: Aksara Workbench

## Overview

**Creative North Star: "The Shared Workbench"**

Aksara is an industrial editorial workbench: warm neutral planes, exact alignment, readable semibold titles and restrained copper emphasis. The retained open-triangle mark and Inter interface give conversation, documents and tools one recognizable family. Density supports real work while leaving the active artifact room to read and edit.

Flat surfaces and hairline boundaries provide structure. Light appearance uses warm paper and a deep copper accent; dark appearance uses graphite and muted copper. Twenty UI supplies shared control behavior; the workspace supplies its semantic colors and spatial grammar. Georgia remains a reading voice for rich-document paragraphs.

**Key Characteristics:**
- Broad working planes with compact supporting context.
- Inter interface, semibold titles and serif rich-document paragraphs.
- Copper selection and actions on paper or graphite.
- Quiet borders, modest corners and explicit audience and save state.

This documents the implemented system in `apps/platform/src/industrial.css`, `workspace/appearance.ts` and the workspace components. Frontmatter describes the default light appearance; dark tokens and semantic CSS roles define its paired appearance. Surface composition decisions live in `.impeccable/surfaces/industrial-redesign.md`.

## Colors

Copper is the default accent family in both appearances. Frontmatter values are normative; semantic roles resolve the chosen theme and saved palette.

### Primary

- **Deep Copper** (`clay`) is the default light action and selection color. **Copper Wash** (`clay-soft`) and **Copper Reply** (`clay-user`) support selected controls and personal messages. The persisted palette key remains `clay`.
- **Muted Copper** (`copper`) is the default dark accent, with `copper-soft` and `copper-user` tints and `copper-on-primary` action text.
- **Lilac** and its soft/reply partners remain an explicit light palette override. Sage and neutral overrides are generated from their existing appearance seeds; keep their dynamic role mapping rather than treating them as new defaults.

### Neutral

- **Warm Paper**, **White Panel**, **Paper Soft**, **Paper Ink**, **Paper Muted** and **Paper Line** supply light canvas, fields, tonal areas, text and boundaries.
- **Graphite**, **Graphite Panel**, **Graphite Soft**, **Graphite Ink**, **Graphite Muted** and **Graphite Line** supply the paired dark roles.
- **Needs**, **Done** and **Problem** colors express task status in each appearance. Pair them with readable state text; working state shares the accent.

**The Shared Accent Rule.** Use the active semantic accent for actions, focus, selection and working state. Honor saved palette choices; do not hardcode copper into a reusable control.

The legacy CSS role `--green` now means the active accent. Twenty accent and border roles map to the workspace roles; their historical blue names do not prescribe a blue hue.

## Typography

**Interface Font:** Inter Variable, with Inter and sans-serif fallbacks.
**Rich-document Paragraph Font:** Georgia, with Times New Roman and serif fallbacks.

### Hierarchy

- **Display:** Home's living-brief heading uses `display`; phone size is (1.875rem).
- **Headline:** page headings use `headline`; phones reduce to (1.625rem). Room titles use (1.5rem), then (1.375rem) on phones.
- **Document title:** `document-title`, reduced to (1.625rem) on phones; preserve its unboxed editable treatment.
- **Title:** section headings and artifact preview titles use the compact `title` scale.
- **Body / conversation:** use `body` and `conversation`. Compact private-thread paragraphs use (0.8125rem); phone conversations use (0.9375rem).
- **Document paragraphs:** rich-editor paragraphs use `document-body`; source-document content uses interface type at (1rem) with a (72ch) maximum reading width.
- **Controls / metadata:** use `control` and `metadata`. Small timestamps and mode labels can use (0.625rem); reserve that size for secondary context.

**The Two Voices Rule.** Keep interface text and document titles in Inter. Reserve Georgia for rich-document paragraph reading.

## Layout

The shell fills (100dvh). Navigation, content and optional private context occupy bounded planes; the document, discussion and supporting regions scroll independently. Desktop navigation is (232px), collapsing to (72px). Standard page padding is (32px 38px 40px).

Home uses a centered (1480px) maximum canvas. Its broad workbench sits beside a (300px) activity column with a (36px) gap. Artifact previews use two columns, expanding to three at (1700px). At (1200px), page padding becomes (28px) and the activity column becomes (260px); at (1000px), it moves below the workbench. These are Home patterns, not universal page templates.

A channel offers Room and Workbench views. Workbench pairs a (340px) discussion with the selected artifact and its tabs. That discussion narrows to (300px) at (1200px), then (270px) at (1000px). The compact private thread is a separate (390px) pane; at (1200px) it overlays the right edge. Its expanded state fills the workspace beside navigation.

At (760px) and below, navigation gives way to the bottom launcher. Pages use (24px 18px 110px) padding; artifact previews stack. Workbench shows the artifact, with Room available through the view switch. The private pane fills the viewport and exposes a close control. Keep composer's phone text at (1rem), respect the bottom safe area, and allow long tab rows to scroll without widening the page.

## Elevation & Depth

Canvas, panel fill and hairline borders define the working hierarchy without shadows. Menus, the phone dock and temporary side overlays use restrained shadows. Review is a right-side sheet; setup remains a centered dialog.

- **Menu / phone dock:** `0 6px 24px #0002`.
- **Composer options:** `0 8px 28px #0002`.
- **Review sheet:** `-8px 0 36px #0001`.
- **Compact private overlay:** `-8px 0 40px #0002`.
- **Setup dialog:** `0 20px 80px #0002`.

**The Flat Workbench Rule.** Keep working planes flat. Use shadows to distinguish temporary overlays from the workspace.

Navigation reflows over (240ms) with an easing curve of `cubic-bezier(0.16, 1, 0.3, 1)`. Artifact preview borders and backgrounds transition over (150ms); Twenty buttons transition backgrounds over (100ms). Reduced-motion preferences collapse transition and animation durations. Do not introduce compulsory atmospheric effects.

## Shapes

The system uses modest corners and exact alignment. Standard fields and custom buttons use control corners (6px); tabs use (5px), segmented switch containers (7px), artifact previews and message fills (8px), composers (9px), menus (10px), and setup dialogs (12px). Chips use compact (4px) corners. Full working planes and review sheets remain square. Use single-pixel borders for containment; retain the minimal open-triangle mark without an ornamental badge.

## Components

### Buttons

Twenty's solid, outline, soft and ghost variants supply the common control family through the workspace adapter. Semantic accent roles govern filled accent actions; neutral variants carry supporting actions. Existing custom filled and secondary actions use control corners, a (38px) minimum height and (8px 14px) padding. Text actions use accent text and underline on hover; custom icon buttons are (34px) square, growing to (38px) on phones. Preserve the donor variants rather than restyling every button identically.

Custom secondary hover uses the soft neutral plane; filled hover slightly lowers brightness. Keyboard focus uses a visible (2px) accent outline with (3px) offset. Custom disabled controls use (0.48) opacity. The unboxed composer textarea suppresses its default outline; preserve clear focus on its available actions.

### Chips

Privacy and status chips combine concise context with a small icon, soft neutral fill and muted metadata. Keep the indicator subordinate to the title. Task dots are (6px) circles with a textual state nearby.

### Cards / Containers

Artifact previews are bordered panels with panel corners, (20px) padding and a (190px) minimum height. A small type/scope row, semibold title, short excerpt and revision establish their reading order. Hover changes the border to the accent. Settings, capabilities, library and activity favor categorized, hairline-separated rows. They remain flat at rest.

### Inputs / Fields

Twenty input and select primitives supply behavior; selectors render in themed portals. Standard fields use panel fill, ink, a hairline border, control corners, (9px 12px) padding and a (38px) minimum height. The document title is full-width and unboxed. The composer groups an unboxed textarea and square accent send action inside one bordered plane. Home uses its bottom-rule presentation. Setup choices use whole labeled rows with a radio indicator and accent selected fill/border.

### Navigation

Labeled destinations use compact Inter and a soft accent active state. Channels nest behind a vertical hairline; the current channel uses soft neutral fill and ink. The collapsed rail retains icons and accessible names. Phone navigation uses the compact launcher and a spaces menu. Selected settings categories use the accent tint; avoid relying on color alone to communicate selection.

### Room and Private Thread

Room/Workbench is a visible two-action switch with pressed state. The selected artifact has a horizontal tab row; save and review actions stay outside the scrolling document. Assistant messages sit on the conversation plane; personal messages receive a soft tinted fill, with explicit author labels.

The private thread keeps its **Only you** context beside its title and provides expand/compact and close actions. Full and phone states act as modal context with managed focus. Loading and access failures use explicit text and a retry action. These patterns document current interface behavior; they do not establish live collaboration or external messaging support.

## Do's and Don'ts

### Do:
- **Do** keep audience, revision, source context and save state readable beside the work.
- **Do** use semantic colors across controls, editors and portaled menus.
- **Do** preserve visible keyboard focus, reduced motion and mobile safe-area spacing.
- **Do** use artifact previews for work and compact rows for settings, capabilities and activity.

### Don't:
- **Don't** reintroduce atmospheric wallpaper or decorative blobs into the workspace.
- **Don't** turn every row into a floating card or spread settings across a wall of columns.
- **Don't** substitute blue-slate surfaces for the graphite palette.
- **Don't** imply live collaboration, real contributors or model activity through fabricated presence or content.
