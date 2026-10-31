# Aksara

A local-first AI workspace for people and teams. Talk with Aksara, send work to a background agent, and keep the resulting documents and knowledge in one place.

**Development alpha.** [Try the interactive UI preview](https://aksara-core-preview.pages.dev) · [Run locally](docs/platform/windows-local.md) · [Implementation status](docs/platform/resident-agent-implementation.md)

The hosted preview uses disposable sample data. Models, files on your computer, and the Rust backend are disconnected there. Run the local app to test the working platform.

## Run on Windows

Download `aksara-windows-x64` from a **successful** [Windows build](https://github.com/yohn-maistre/aksara-core/actions/workflows/windows.yml), extract the complete ZIP, and run this in PowerShell from its folder:

```powershell
.\aksara.cmd setup
```

Keep the terminal open and visit **http://127.0.0.1:7341**. The bundle includes Node and the Rust host; the baseline needs no Docker, WSL, Python, or compiler. Models and optional voice services are separate downloads. The unsigned bundle is tested on Windows CI; performance on older Surface hardware still needs testing.

Choose a development identity, then follow model setup. The identity chooser is a local testing aid, not production authentication.

```powershell
.\aksara.cmd doctor --json
.\aksara.cmd chat "Hello"
.\aksara.cmd stop
```

[Setup, data locations, backups, and troubleshooting](docs/platform/windows-local.md)

## What you can test

- **A continuing workspace:** Home, private conversation, shared channels, a searchable Library, and source-linked working knowledge. Personal and community profiles use separate databases.
- **Interactive and background work:** a Mastra agent can use bounded tools, delegate a worker, check its progress, and save a draft document while the main conversation remains available.
- **Files and documents:** preserve uploaded originals, read supported formats, create document drafts, and edit a CSV worktree with the lazy-loaded Univer spreadsheet editor.
- **Memory with provenance:** reviewed facts and working wiki, people, and procedure drafts stay linked to their sources. Current access and withdrawal checks apply when retrieving them or using derived results.
- **Native computer use:** explicitly connect one private desktop window for a limited time through Vercel agent-desktop. Observation, clicks, field edits, and physical typing have separate bounds. Currently available to local models. This controls your signed-in desktop; it is **not an OS sandbox**.
- **Shared interfaces:** the CLI and scoped MCP gateway read the same canonical workspace. Optional local Pocket TTS supports read-aloud.

Model setup supports a local compatible server, ChatGPT/Codex device sign-in, Google AI Studio, Groq, and OpenRouter API keys. Keyless OpenCode is experimental and can be unavailable or rate-limited. Account eligibility, provider terms, and quotas still apply. Aksara does not silently switch to a paid provider.

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

React renders the workspace. The Node workbench connects providers and tools. Mastra runs the agent loop; Rust and SQLite hold identity, scope, source custody, work, approvals, and effect receipts. UI state and agent output cannot grant authority.

Original bytes are retained. Search, wiki, memory, and other indexes are projections over authorized sources. Local effects and receipts commit together; external actions record an intent before delivery, and uncertain outcomes remain uncertain until reconciled. Interrupted model and computer actions are not automatically replayed.

This is a working foundation, with substantial seams still open: production identity and enrollment, isolated shared-channel computers, live Telegram/WhatsApp and Strata federation, fuller memory indexing, and physical hardware. The device SDK currently includes behavior simulators. Local data is not encrypted at rest against the host OS account. See the [component coverage](docs/platform/component-coverage.csv) and [decisions](docs/platform/decisions.md) for the full boundary.

Apache-2.0. Third-party components retain their own terms: [donor ledger](docs/donors.md), [NOTICE](NOTICE), and bundled licenses.
