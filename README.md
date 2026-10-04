# Aksara Core

A local Rust authority kernel for one institution: individual identity, audience-aware retrieval, durable work, exact approvals and verified effects. Apache-2.0. **Development alpha**, with an offline Pi Durable runtime and a separate controller simulator.

The [v1 catalogue](docs/northstar-v1.md) is the northstar. The [design review](docs/design-review.md) records implementation choices and gaps. The [donor ledger](docs/donors.md) distinguishes actual reuse, studied patterns and pending adapters.

[Verification evidence](docs/verification.md) records 67 local checks and the ARM64 emulation limits. The [Hermes handoff](docs/handoff.md) explains importing the source/history bundle, pushing to the private repo and starting the phone binary.

## Run locally

Requires Rust 1.99.0, Python 3.9+ and, for the optional Pi worker, Node 24.19+ with built-in SQLite.

```sh
cargo build --locked --workspace
npm ci --ignore-scripts
python3 scripts/dev.py
```

Open **http://127.0.0.1:7341**. The launcher writes `.aksara/dev-identities.json` with three separate development identities: Operator, Maria and Yohan. Paste one individual's token into the web client. A shared lane contains all three; each person also has a private lane. Tokens stay in browser memory until disconnect.

Try adding an institution-visible source in Library, delegating a matching task in Threads, preparing a cited artifact, switching to Operator to approve its exact arguments, then returning as the initiator to execute it. Device proposals follow the same path. Memory candidates require exact source excerpts and separate Operator review. Restricted sources cannot be widened through either path.

To run the **real Pi Durable** retrieval task, copy the delegated WorkObject ID from the API/worker examples in the [runbook](docs/runbook.md), set the initiator's `AKSARA_TOKEN` and shared `AKSARA_LANE`, then:

```sh
npm run worker -- work_ID
```

The worker uses upstream Pi checkpoints and SQLite. It retrieves authorized evidence and prepares a proposal. It uses no LLM, cloud keys or builtin shell/file/network tools. Approval and effects remain in Rust.

## Verify and stress

```sh
cargo test --locked --workspace
cargo clippy --locked --workspace --all-targets -- -D warnings
npm test
python3 -m unittest discover -s tests -v
python3 scripts/stress.py --documents 200
```

Optional browser conformance: `npx playwright install chromium` followed by `python3 scripts/browser_smoke.py`. Browser binaries are unnecessary for the phone runtime.

The stress harness launches real processes, injects crashes around commits and destination delivery, kills/resumes Pi workers, tests concurrent duplicates, checks privacy, validates recovery and writes measurements to `stress-results.json`. Use `--keep` to retain private fixture logs after a run. It never contacts an AI provider.

[Samsung A12 / Termux + proot Debian instructions](docs/phone.md) include a lightweight profile, artifact installation, source builds and phone measurements. The included CI workflow is configured to test native x86-64 and ARM64 and package static musl binaries with dependency notices; a successful remote run is still required.

## What exists

- Rust/SQLite modular kernel, schema versioning, exclusive host ownership, immutable raw text evidence, stable block IDs, eligible-only FTS5 search, identity bindings and revocation.
- Durable WorkObjects, revision/generation fencing, local exact approvals, scoped HMAC development leases, transactional artifact/receipt/ledger/outbox commits, destination reconciliation and backups.
- Reviewed source-excerpt memory with purpose, visibility, retention and withdrawal checks.
- Loopback HTTP API, small phone-responsive web test client, offline Pi Durable adapter.
- Four-profile **behavior simulator** with durable command deduplication, privacy/stop interlocks, capture-lease fixtures, human takeover fences, offline queue bounds and OTA rollback fixtures.

## Still open

Cedar policy evaluation, Duroxide institutional workflows, Wasmtime/WIT packs, ConnectRPC/AG-UI, Hermes channel adapters, a Dim0/canvas-harness Workbench, Library hierarchy/wiki/long-document adapters, Graphiti, model streaming, production computers, voice and real MCU hardware are not implemented. The simulator does not emulate silicon, timing, radio, audio acquisition, e-paper or signed OTA cryptography. The current fixed policy and HMAC leases are development mechanisms.

Private data is access-controlled through the host, not encrypted at rest or protected from the host's OS account. PRoot is a development backend, not a production computer isolation boundary. Local transactional effects have one committed result per idempotency key; external effects may remain `OUTCOME_UNKNOWN` until the destination can prove their outcome.
