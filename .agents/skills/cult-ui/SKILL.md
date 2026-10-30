---
name: aksara-cult-ui
description: Use when researching, installing or adapting Cult UI or shadcn components for Aksara. Covers the official registry and MCP setup, source reuse, the flat fluid workspace direction, accessibility and authority boundaries.
---

# Cult UI for Aksara

Project-authored integration skill, based on Cult UI's official agent guidance.
This is not a claim that Cult publishes a separate skill package or MCP server.

## Official sources

- Index: https://www.cult-ui.com/llms.txt
- Component documentation: `https://www.cult-ui.com/docs/components/<name>.md`
- Registry: `https://www.cult-ui.com/r/<name>.json`
- Agent guidance: https://www.cult-ui.com/docs/llms.md
- MCP setup: https://www.cult-ui.com/docs/mcp-server.md

Read the component's actual documentation and registry source before using it.
Install source through the registry instead of inventing a lookalike API. In
`apps/platform`, use the pinned CLI version recorded in the project MCP config:

```sh
npx shadcn@4.23.0 add @cult-ui/<name>
```

The equivalent upstream command uses `shadcn@latest`. Version 4.23.0 was current
when this setup was recorded on 29 October 2026. Review updates deliberately.
The app's `components.json` selects Base UI (`base-nova`), the existing aliases
and Cult registry. Installed source belongs under `src/components/ui`.
The current CSS entry is `src/duet.css`; update that path when the theme is ported.

## Current project direction

30 October update: the user explicitly requested exploration of atmospheric
weather backgrounds, restrained glass/blur, localized glow and connected Gooey
shapes. For that exploration, these choices supersede the earlier flat-only
aesthetic guidance below. See `docs/platform/atmospheric-workspace-study.md`.
The user selected the generated Home/Library/thread system and then refined
it to a regular opaque spine and smoked background. The current implementation
is recorded in `docs/platform/atmospheric-workspace-implementation.md`. Readability, privacy clearing, honest state and host authority still
apply to every material treatment.

Read `docs/platform/fluid-workspace-plan.md`. The user asked to flesh out the
direction before rebuilding the interface. Setting up this skill/registry is
authorized; it does not mean every candidate component should be installed.

Use Octopus's React surface/pane patterns, shadcn sidebar-08 with `variant="inset"`,
`collapsible="icon"` and `SidebarProvider defaultOpen={false}`, flat tonal
materials and an embedded page-level composer. Keep text, controls and review
content crisp. Shape transitions may use Motion; whole-page filters, glass,
deep shadows, decorative glow and permanent shader activity do not match the
selected direction. Style copied components through shared theme tokens.

## Adaptation checks

- Inspect each component's accessibility instead of relying on its description.
  Use existing Base UI Dialog/Popover behavior for focus, Escape, dismissal and
  restoration. Respect reduced motion and preserve draft state on resize.
- Give each shared-layout transition a unique, scope-bound ID. On a principal,
  database, lane or audience change, clear restricted content immediately;
  do not keep the old content mounted for an exit animation.
- `expandable-screen` needs proper dialog behavior and scroll-lock cleanup.
- `floating-panel` needs accurate expanded state, focus handling, viewport
  collision handling and awaited persistence. Closing a panel proves no effect.
- `morph-surface` can show success without an `onSubmit` handler. Require a real
  handler, visible failure handling and persisted host results. Do not use its
  default success animation as approval/execution evidence.
- `speech-bubble` uses an h1 in its convenience wrapper. Use appropriate prose
  semantics and disable the decorative cursor for ordinary messages.
- `collab-toolbar` has a public avatar fallback and presentational buttons.
  Use local initials or authorized same-origin images and explicit host actions.
  The component supplies no collaborative editing or presence authority.
- `halo-progress` gets percentages only from measured work. Unknown model
  duration is indeterminate. Its demo timer is not product progress.
- `ai-blob-warp` adds Paper Design shaders. Keep it optional/lazy, with a static
  fallback and real microphone/runtime states. It supplies no voice backend.

## Data and execution

Follow root AGENTS.md. Pack manifests, surface layouts and model-written UI
never grant access. OpenUI can instantiate only registered bounded components
and resource references; the host resolves currently eligible data. Exact
approval, execution and verified receipt stay in trusted host components.
No model-provided JavaScript, arbitrary URLs or automatic mutations.

Record source revision, component files and license obligations in the donor
ledger before reuse. Cult UI source studied at
`d71b1428b811c2779d46ea41b7ef8c9f9c9991c2`, MIT. The original license is beside
this file. This skill is development guidance and is never exposed as an
installed runtime capability Pack.
