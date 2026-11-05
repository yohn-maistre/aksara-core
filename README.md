# Aksara

A local-first AI workspace for people and teams. Talk with Aksara, send work to a background agent, and keep the resulting documents and knowledge in one place.

**Development alpha.** [Try the interactive UI preview](https://aksara-core-preview.pages.dev) · [Run locally](docs/platform/windows-local.md) · [Implementation status](docs/platform/reading-room-implementation-2026-11-06.md)

The hosted preview uses disposable sample data. Models, files on your computer, and the Rust backend are disconnected there. Run the local app to test the working platform.

## Run on Windows

Download `aksara-desktop-windows-x64` from a **successful** [Windows build](https://github.com/yohn-maistre/aksara-core/actions/workflows/windows.yml). Extract its setup EXE and run it, then open **Aksara** from Start. The Tauri 2 app uses the system WebView2 runtime and keeps working from the tray.

[Desktop installation and data](docs/platform/desktop-installation.md). The smaller `aksara-windows-x64` portable bundle remains available for terminal/browser use:

```powershell
.\aksara.cmd setup
```

User data stays in `%LOCALAPPDATA%\Aksara`, separate from app files. This is a development distribution with a local identity chooser, not production enrollment. Connect a model in onboarding before chatting.

## What you can test

- **A continuing workspace:** Home, private conversation, shared channels, a searchable Library, and source-linked working knowledge. Personal and community profiles use separate databases.
- **Interactive and background work:** a durable Mastra agent can delegate to a configured task model, check progress, and save drafts while the main conversation remains available. Local workflow checkpoints support fenced crash recovery; uncertain tool delivery pauses for inspection.
- **A shared writing desk:** rich BlockNote documents open beside their room’s conversation. Autosave preserves revisions and detects conflicting edits. Ask Aksara about a saved snapshot, then read the exact proposed artifact before approving it.
- **Files and source tables:** retain uploaded originals, search eligible knowledge, edit CSV worktrees in Univer, and arrange Library sources on a saved, movable table. Markdown downloads work locally.
- **Memory with provenance:** reviewed facts and working wiki, people, and procedure drafts stay linked to their sources. Current access and withdrawal checks apply when retrieving them or using derived results.
- **Native computer use:** explicitly connect one private desktop window for a limited time through Vercel agent-desktop. Observation, clicks, field edits, and physical typing have separate bounds. Currently available to local models. This controls your signed-in desktop; it is **not an OS sandbox**.
- **Shared interfaces:** the CLI and scoped MCP gateway read the same canonical workspace. Optional local Pocket TTS supports read-aloud.

Model setup supports a local compatible server, ChatGPT/Codex device sign-in, Google AI Studio, Groq, and OpenRouter API keys. OpenCode free chat currently requires its runtime; direct keyless access is unavailable here. Account eligibility, provider terms, and quotas still apply. Aksara does not silently switch to a paid provider.

## Develop from source

Requires Rust **1.99.0** and Node **24.19+**.

```sh
cargo build --locked --workspace
npm ci
npm run build
npm run aksara -- start
```

The native launcher starts two Rust authority processes and a Node workbench serving the PWA. The older Python launcher remains a multi-person conformance fixture.

```sh
cargo test --locked --workspace
npm test
npm run test:platform
```

[Platform guide](docs/platform/README.md) · [Verification](docs/platform/verification.md) · [Native desktop qualification](docs/platform/resident-agent-implementation.md)

## How it fits together

React renders the workspace. The Node workbench connects providers and tools. Mastra runs and checkpoints the agent loop; Rust and SQLite hold identity, scope, source custody, work, approvals, and effect receipts. UI state and agent output cannot grant authority.

Original bytes are retained. Search, wiki, memory, and other indexes are projections over authorized sources. Local effects and receipts commit together; external actions record an intent before delivery, and uncertain outcomes remain uncertain until reconciled. Recovery revalidates current authority; uncertain tool and computer delivery is never blindly repeated.

Rich documents and source tables are shared through saved revisions, not live simultaneous cursors. BlockNote XL Office/PDF exporters are not included pending a distribution-license choice.

This is a working foundation, with substantial seams still open: production identity and enrollment, isolated shared-channel computers, live Telegram/WhatsApp and Strata federation, fuller memory indexing, and physical hardware. The device SDK currently includes behavior simulators. Local data is not encrypted at rest against the host OS account. See the [component coverage](docs/platform/component-coverage.csv) and [decisions](docs/platform/decisions.md) for the full boundary.

Optional [agentgateway deployment](deploy/agentgateway/README.md) provides a local-model
relay without making a gateway or fleet agent a default dependency.

Apache-2.0. Third-party components retain their own terms: [donor ledger](docs/donors.md), [NOTICE](NOTICE), and bundled licenses.
