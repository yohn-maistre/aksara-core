# Verification evidence

Measured in this workspace on 2026-10-04. This is an executable development alpha, not the complete v1 catalogue. No physical Samsung A12 or MCU was available.

## Checks completed

| Suite | Passed | Evidence covered |
| --- | ---: | --- |
| Rust kernel integration tests | 25 | Current authority, audience/purpose boundaries, revocation, work fencing, exact approval, receipt deduplication, lineage withdrawal, schema migration, database ownership and private backup permissions |
| Pi adapter tests | 3 | Scoped durable storage, upstream SQLite durability and task/authority mapping |
| Python device SDK tests | 9 | Controller stop/privacy, command fencing/deduplication, capture fixtures, observations, bounded queue and OTA rollback fixtures |
| Chromium browser checks | 8 | Delayed private response discard, draft clearing, exact approval/execution, reviewed memory, device indication, Pi-created proposal execution, 360px layout and disconnect cleanup |
| Native process conformance | 22 | Concurrent duplicates, host crashes on both sides of local commits, destination ambiguity/reconciliation after cancellation, physical stop fencing, independent privacy and Pi SIGKILL/resume |
| **Total distinct local checks** | **67** | Counts are individual assertions/test cases, not a coverage percentage |

The same 22 process checks also passed with the final static ARM64 Rust host under QEMU. This is an additional architecture execution, not 22 new feature checks. Python and Node remained native x86-64 during that run; the whole phone stack was not emulated.

`cargo fmt --all -- --check`, `cargo clippy --locked --workspace --all-targets -- -D warnings`, Python compilation checks and `actionlint .github/workflows/ci.yml` passed. Muse's own pinned Linux simulator built and passed its upstream CTest; see the donor ledger for the build fix and exact revision.

The included GitHub Actions workflow targets native x86-64 and ARM64. It has been linted, but has **not run remotely**. Native ARM64 Node/Pi, Android/proot behavior, battery/thermal limits and physical hardware remain unverified.

## Environment and sampled measurements

Workspace: Linux x86-64, Rust 1.99.0, Node 24.19.0, Python 3.12.14. The process harness uses synthetic documents, no model/provider and disposable private state.

| Measurement | Native x86-64 debug host | ARM64 release host under QEMU |
| --- | ---: | ---: |
| Documents ingested | 200 | 50 |
| Ingestion seconds | 0.542 | 0.182 |
| Searches / concurrency | 100 / 8 | 100 / 8 |
| Search p50 milliseconds | 326.14 | 423.24 |
| Search p95 milliseconds | 443.21 | 492.29 |
| Observed host high-water RSS, KiB | 15,536 | 33,804 |
| Main SQLite file bytes | 712,704 | 139,264 |

These are single samples, not controlled benchmarks or phone forecasts. An ARM build was running concurrently with the native sample. QEMU RSS includes emulation overhead. RSS excludes the Python simulator, Node worker, browser, filesystem cache and build tools; SQLite file size excludes WAL and other stores. Workloads and build profiles differ, so these columns do not compare CPU speed.

Machine-readable reports are in `docs/evidence/`. The original harness reports the orchestration host architecture; added `kernel_target`, `kernel_execution` and `kernel_sha256` fields identify the executable actually tested. `phone_measurement` remains false.

## Artifact identity

The phone executable is a stripped, statically linked AArch64 Linux ELF, approximately 4.3 MiB. It was built for `aarch64-unknown-linux-musl` with Rust 1.99.0, bundled SQLite, Zig's cross C compiler and Rust's LLD linker. The latter retains Rust's Cortex-A53 erratum handling. QEMU 7.2.0 executed it successfully.

Final tested ARM64 binary SHA-256:

```text
2385365a97733cdd6b9151fc35756992f26aace7d9484b19c72a0e342f3c21e5
```

Native tested debug binary SHA-256:

```text
308cfca4fd6aa9eea02ddb90783850ae336d7393082ff1bbef7fc649c4d873cd
```

Original catalogue SHA-256 (preserved unchanged):

```text
35407ca12065f53753d08914e236afb99887ed61153de5a7c3dc6f6160b51d35
```

## What these results do not establish

There is no LLM/model streaming, arbitrary external tool execution, Cedar policy engine, Duroxide workflow engine, production plugin/computer isolation, ConnectRPC/AG-UI protocol, Hermes ingress, Dim0 Workbench, rich document ingestion or voice pipeline yet. Pi runs a real upstream durable retrieval/proposal task without a provider.

The device lab exercises behavioral contracts; its capture and signed-OTA inputs are fixtures. It does not emulate silicon or prove electrical privacy, audio/radio behavior, timing, power, e-paper or cryptography. The host and simulator share the OS/power failure domain. Fixed Rust policy, local HMAC leases and development tokens require replacement/hardening before production. The hash-linked ledger is not independently tamper-proof and data is not encrypted at rest.

The next useful evidence is the [A12 phone run](phone.md), followed by native ARM64 CI and donor-led implementation of the next authority seam.
