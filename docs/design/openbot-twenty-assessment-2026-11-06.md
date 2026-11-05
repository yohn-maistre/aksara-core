# OpenCode execution and Twenty UI assessment

6 November 2026. This extends the implemented Reading Room pass; it does not
replace Mastra, install a second UI stack or enable unqualified remote tools.

## Recommendation

Keep Mastra as Aksara’s durable supervisor. Add OpenCode later as an **optional
ACP work executor**, with its own pinned process/session, rather than nesting two
unbounded agent loops. A text-only inference route and an agent executor are
separate capabilities. A cheap foreground model can discuss and dispatch; an
executor can work on a scoped copy and return an artifact. Rust still admits
sources, work, exact effects and receipts.

OpenBot’s [provider architecture](https://github.com/nightly-labs/openbot/blob/821ede3aef07458c368244a0699abf869093a057/docs/architecture/providers.md)
and `src/backend/acp-configuration.ts` were read at commit
`821ede3aef07458c368244a0699abf869093a057`. They confirm an `opencode acp`
subprocess, live model discovery, cancellation, explicit optional key storage,
managed pins and model/entitlement distinctions. Its README says the CLI can
advertise keyless Free models. OpenCode’s [official ACP docs](https://opencode.ai/docs/acp/)
confirm stdio JSON-RPC and built-in tool/permission behavior.

**Do not equate a model listing with successful free inference.** Our previous
synthetic direct Zen request returned 429; that is not a successful account test.
The official [Zen docs](https://opencode.ai/docs/zen/) document API keys, several
API protocols and limited-time Free models. Current third-party reports conflict
on anonymous entitlement. The OpenBot path must be tested through the actual
pinned CLI, on this deployment, with a harmless prompt. Do not fabricate login,
repeat code authorization or silently fall back to a paid model. No fresh live
inference success is claimed in this assessment.

The pasted agent report is useful user-supplied evidence, not our independent
inspection of its `app.asar` or live database. Its queue fairness, restart
reconciliation, essential/searchable memory tiers and typed failure UX are good
patterns. Its line numbers, model names and timing measurements remain attributed
to that report. **OpenBot’s pinned root license is PolyForm Noncommercial 1.0.0**,
not a permissive open-source license. Study the architecture; do not copy its
implementation into Aksara.

## Minimum executor contract

- A durable job stores executor identity/version, exact scope, selected model,
  session ID, input snapshot digest, budget, deadline and attempt generation.
- Start/resume/status/cancel return typed events and artifact references. The UI
  shows queued, starting, running, blocked, failed and uncertain outcomes honestly.
- Reattach to a known session after a crash; never blindly replay a tool that may
  have acted. A second model loop does not establish exactly-once effects.
- Deny provider-native shell/write/network authority by default. Allow only the
  scoped worktree or isolated sandbox and admitted MCP tools. A provider’s
  permission prompt is not an OS sandbox. Do not share an agent session across
  private/public audiences.
- Warm one process only when enabled, bound idle lifetime/concurrency, prioritize
  human interaction and avoid installing another resident runtime by default on
  an 8 GB Surface. Measure real cold-start and RAM before bundling.
- Discover model IDs/limits/capabilities from the running CLI. Label catalogue
  availability separately from a successful connection test and current quota.

This contract is planned, not a shipped ACP implementation. Existing Mastra
provider paths and durable jobs remain the working backend.

## Twenty: useful library, different product core

Twenty describes itself as the CRM technical teams build and version: custom
objects, fields, views, workflows, agents and app extensions. It is more than a
component kit. Aksara can learn from that adaptable substrate without becoming a
CRM or exposing a schema designer as everyone’s first task.

[Twenty UI setup](https://docs.twenty.com/ui/getting-started) and actual
`packages/twenty-ui/{package.json,LICENSE}`, `SettingsRow.tsx` and `MainButton.tsx`
were read at commit `985f1b6dea78b65938a8216a343dc2196f8b53d1` (version 2.57.0).
The standalone **twenty-ui package is MIT**, React 19, Base UI primitives and
prebuilt CSS with theme variables. Most of the CRM is AGPL with enterprise files;
check package boundaries rather than copying the application. Search listings
that label the entire UI AGPL are less precise than its actual package license.

Useful candidates: accessible settings rows, compact list items, menu/tabs,
segmented controls, search fields and progress/feedback. Its control composition
and explicit label/description IDs are useful reference patterns. Public subpath
imports avoid pulling the complete catalogue/optional Monaco code editor. The
library is still alpha, its version follows the SDK cycle, and its reset/theme
root needs integration testing. Aksara already has React 19 and Base UI: do not
install a duplicate design system merely to replace working buttons.

No Twenty or OpenBot source has been copied or installed by this pass. Evaluate
one specific missing component when it earns its dependency, then pin and record
that actual integration. Do not add Twenty’s Nest/Postgres/Redis stack to the
Docker-free default package.

## Product language

**Situated intelligence** is the clearest research term. Public copy can be more
concrete: “A shared intelligence for your community, connected to its knowledge,
tools and places.” A place is context, not a GPS requirement: a community office,
clinic, workshop or field station has people, authority, shared records, devices
and local conditions. Aksara can present one friendly workspace while optional
packs connect those resources. Hardware and sensors remain admitted capabilities,
not implicit surveillance or deployment/fleet ownership.

Build the complete shared-work loop first; then make it adaptable through typed
packs, existing-system connectors and optional executors. Keep onboarding focused
on one useful first result, not selecting a platform architecture.
