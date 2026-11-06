# Donors and third-party components

Aksara's integration code is Apache-2.0. Dependencies and copied source retain their own licenses. A library's runtime state never becomes an authority store: Rust owns current source eligibility, work, approval and effect receipts.

## Installed building blocks

| Component | License / version | Use |
| --- | --- | --- |
| Mastra Core and MCP | Apache-2.0; exact versions in the lockfile | Interactive/background agent, durable checkpoints, tools and read-only MCP. No EE source copied. |
| Pi AI / Durable | MIT, 1.0.2 | Preserved earlier adapter and regression coverage. Not a second loop inside Mastra. |
| Twenty UI | MIT, 2.56.0 | Actual Button, Input, Select and ThemeProvider. Installed public input/theme APIs and portal/keyboard behavior inspected. The CRM app is not embedded. |
| Base UI | MIT, 1.9.0 | Dialog, popover, menu, focus and selection behavior. |
| BlockNote core/react/shadcn | MPL-2.0, 0.57.0 | Rich documents, Markdown conversion and read-only review. Unmodified dependency source: TypeCellOS/BlockNote at `262fb815a25e892b7a6e4d06b63df19a9ae5d6a8`. No XL exporters or hosted file proxy. |
| Excalidraw | MIT, 0.18.1 | Saved vector drawings, scene conversion and SVG export. Public element/update/export APIs inspected. Fonts ship locally with their OFL/MIT notices and Liberation GPL font exception; no embedded browser, remote images or collaboration service. |
| React Flow | MIT, 12.10.1 | Movable Library-source table with lane-bound saved revisions. |
| Univer OSS | Apache-2.0, 1.3.1 | Lazy CSV spreadsheet worktrees. No commercial Office converters. |
| OpenUI React Lang | MIT, 1.0.2 | Bounded registered text/resource components. No arbitrary query/mutation renderer. |
| Motion | MIT, 13.0.0 | Interruptible transitions and reduced-motion support. |
| SunCalc | BSD-2-Clause, 2.1.1 | Solar-time calculations for optional automatic component themes. |
| Inter Variable / Lucide | OFL-1.1 / ISC | Locally bundled typography and interface icons. |

Web builds generate the actual bundled dependency inventory and notices under `licenses/`, including the MPL source location. Desktop packages carry those assets. `scripts/build_host.mjs` emits backend npm notices. The lockfile, rather than this summary, owns the complete transitive dependency versions.

## Embedded LongMemory

Apache-2.0 upstream: [CaviraOSS/LongMemory](https://github.com/CaviraOSS/LongMemory), pinned at `8badf44d48d0d72a07e1ea3daf1ecbd76ae1a357`.

The inspected Hydrograph implementation includes `src/core/create_memory.ts`, perception/ingest engines, recall/context/evidence and graph provenance types. `scripts/vendor_longmemory.mjs` reproducibly bundles that core into `packages/memory/vendor/longmemory.mjs`. The embedded profile uses the memory store; its SQLite adapter is explicitly unsupported. Canonical Aksara records remain in Rust SQLite, with a fresh eligibility check before indexing and before returning a result.

No donor entity/emotion heuristics are promoted into reviewed facts. No external inference, connectors, credentials or graph daemon are activated. This pin is distinct from the connector-heavy npm `longmemory` release. The upstream Apache license, bundled `stemmer` MIT license and provenance ship in `packages/memory/vendor/` and the compact host's `third_party/longmemory/`.

## Adapted source

| Donor | Pin / retained license | Reuse |
| --- | --- | --- |
| OpenDuet | `60fd4c71d9d82e13739dce00827278154d13c947`; `third_party/openduet/LICENSE` | Earlier card, icon and motion primitives. Current shell/layout is Aksara's workbench. No donor backend authority. |
| Cult UI | `d71b1428b811c2779d46ea41b7ef8c9f9c9991c2`; `third_party/cult-ui/LICENSE` | Onboarding and earlier expandable/island primitives. Base UI owns dialog behavior. No automatic approval or simulated progress. |
| shadcn | CLI 4.23.0, base-nova/sidebar-08; `third_party/shadcn/LICENSE` | Sidebar state, sheet/menu/tooltip primitives; navigation and identity data replaced. |
| Octopus | `third_party/octopus/LICENSE` | Earlier bounded contextual pane primitive, adapted without native runtime state. |
| Mastra Code | `c6a8570543f716d8a0edd70001abd0b89d365a74`; `third_party/mastra-code/LICENSE` | Focused device OAuth, refresh and Codex Responses/SSE port. Source hashes and adaptations: `packages/runtime-mastra/vendor/mastra-codex/UPSTREAM.md`. No global credential fallback. |

Vercel `agent-desktop` 1.0.2 is an optional Apache-2.0 native driver. Its JSON snapshot/reference and interaction-lease APIs were inspected at `893a4140d35261c5f8e3a6aa646d1558bb4f386f`. An explicit private-window permit, durable intent and reconciliation boundary remains Aksara-owned. It is not a sandbox.

## Research references

Hermes Agent's MIT channel/session/skills implementation informed transport-neutral channel bindings and provisional procedure learning. Its coupled gateway/runtime was not transplanted, and no live messaging adapter is claimed. Cognee and Hindsight remain memory alternatives; Liveblocks, Yjs/Hocuspocus and tldraw remain collaboration/drawing alternatives rather than installed services.

OpenBot/Nightly's PolyForm Noncommercial code was studied for architecture only and is not copied into this Apache-2.0 distribution. Twenty CRM application code and Liveblocks server licensing are separate from their permissively licensed client/UI packages. A model or UI dependency cannot confer institution, device or publication authority.
