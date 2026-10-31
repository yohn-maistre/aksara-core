# Platform foundation verification

29 October 2026, Asia/Bangkok. Actual execution in this Linux x86-64 workspace; no physical Samsung A12, Lapis/Muse device, community LAN installation or native mobile app was available.

| Suite                           |  Passed | What it exercises                                                                                                                                                                                                                                                                           |
| ------------------------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rust integration tests          |      34 | 25 preserved authority regressions + nine platform tests: scoped canonical conversations, consent, frozen context/read dependencies, withdrawal, steering/cancellation, history, personal bootstrap and schema-2 upgrade                                                                    |
| Pi tests                        |       3 | Actual upstream durable storage/task boundary                                                                                                                                                                                                                                               |
| Python device tests             |       9 | Independent stop/privacy, generation/observation fencing, receipts, capture/queue/OTA behavior fixtures                                                                                                                                                                                     |
| New Node adapter/contract tests |      10 | Actual Mastra over synthetic compatible HTTP; no prompt/response error logging; real Rust hosts behind BFF; cookies/CSRF; context switch; durable provider claim; admission; no automatic effects; speech eligibility/late discard/WAV framing; strict Pack/proposal contracts              |
| New product Chromium checks     |      14 | Real PWA/hosts; source ingest; explicit document review/execution/receipt; memory review; actual Mastra with a local synthetic provider; OpenUI renderer; withdrawal; honest history; personal custody; shared context; device receipt; hosted consent; 360 px layout; no private API cache |
| Preserved lab Chromium checks   |       8 | Late response/draft clearing, initiator/Operator exact approval, memory, device, Pi proposal and narrow viewport                                                                                                                                                                            |
| Native process stress           |      22 | Real process crashes, concurrent duplicates, commit atomicity, remote uncertainty/reconciliation, controller interlocks, Pi kill/resume, FTS privacy and backup                                                                                                                             |
| **Distinct local checks**       | **100** | Individual checks/test cases, not a coverage percentage                                                                                                                                                                                                                                     |

The **same 22 process checks** also passed using the new static ARM64 binary under QEMU 7.2.22 with 200 documents. They are not 22 additional features. Node, Python and Playwright remained native x86-64 during the QEMU run; this is not a complete emulated phone stack. Native x86-64 and ARM64 CI both passed at source commit `159519b` in [run 40753340250](https://github.com/yohn-maistre/aksara-core/actions/runs/40753340250). The final extra local browser check covers explicit audio controls after a mobile autoplay rejection; follow the PR checks for the refreshed head.

`cargo fmt --all -- --check`, locked workspace tests, Clippy with `-D warnings`, `npm run build`, TypeScript checking, Python syntax checks and `git diff --check` passed. The new PWA is production-built with pinned npm dependencies and a committed lockfile. All 340 installed npm package declarations used for the notice inventory had declared licenses; the collector preserves available original license files. That inventory is not a legal compatibility audit.

## Real optional-worker probes

A real CPU llama.cpp server running SmolLM2 135M Q4_K_M produced a nonempty synthetic reply through the actual Mastra adapter in **1,174 ms**, using two CPU threads. This verifies an integration path, not model quality, a controlled benchmark or A12 speed. The model/server were resident before invocation. Model weights/runtime binaries are not part of the handoff.

The real keyless OpenCode `big-pickle` request reached the Zen completion endpoint but returned **429 FreeUsageLimitError**. Catalogue requests returned 403. There is no successful hosted completion attestation or automatic paid fallback. Provider terms, current model availability, quota and alternative free candidates remain unqualified.

A real Pocket TTS 4.0.1 CPU worker using `english_2m_2026-10` produced a **three-second, 24 kHz, 16-bit PCM WAV in 338 ms** for a synthetic sentence. The resident Python/Torch worker used about **586,540 KiB RSS**. Model loading/downloads are excluded from that sample. Pocket's streamed WAV uses placeholder lengths; the broker finalizes them after bounded completion before browser playback. Audio transport/privacy fixtures use synthetic local WAVs; the real synthesis probe separately verifies Pocket. Microphone/STT, Indonesian, phone audio quality and thermal behavior remain untested.

## Sampled kernel stress measurements

| Measurement               | Native x86-64 debug | ARM64 release under QEMU |
| ------------------------- | ------------------: | -----------------------: |
| Documents                 |                 200 |                      200 |
| Searches / concurrency    |             100 / 8 |                  100 / 8 |
| Search p50 ms             |              384.98 |                   833.31 |
| Search p95 ms             |              464.34 |                   988.38 |
| Kernel high-water RSS KiB |              15,828 |                   40,120 |

These are single concurrent-workspace samples. QEMU RSS includes emulation overhead. Measurements exclude browser, Node broker, simulator, model/voice workers, page cache and build tools; build profiles differ. They are not a CPU comparison or an aggregate phone memory budget. Machine-readable reports and binary identities are under `docs/evidence/platform-2026-10-29-*`.

## Reproduce

```sh
cargo fmt --all -- --check
cargo test --locked --workspace
cargo clippy --locked --workspace --all-targets -- -D warnings
cargo build --locked --workspace
npm ci
npm run build
npm test
npm run test:platform
python3 -m unittest discover -s tests -v
python3 scripts/stress.py --documents 200
npx playwright install chromium
python3 scripts/browser_smoke.py
node tests/platform-browser.mjs
```

Browser conformance creates disposable private fixtures. The product test uses ports 17841, 17850/51/53/55/57 and 17860; it never calls a hosted provider. The old lab and process harnesses use their own disposable ports/state. Keep raw fixture logs and credentials out of commits/artifacts.

## Remaining qualification

Production IAM/enrollment and named review rights; per-Channel Library custody; OS/credential/egress separation; Mastra durable tools/subagents/resume; trusted LAN HTTPS/pairing and offline client intent handling; signed installer/restore host epoch; actual isolated computers; real Ruara publication and receiving-side authority; real MCU/renderer/hardware parity; voice input; rich formats/memory engines; actual A12 aggregate resource/quality measurement. The full portfolio is tracked in `component-coverage.csv`.

## Hosted preview and backend operations increment

On 29 October 2026 the entire foundation was fast-forwarded onto `main` after successful native x86-64 and ARM64 CI. A separate Cloudflare Pages Direct Upload project now serves the browser-only sample preview at https://aksara-core-preview.pages.dev. All eleven preview browser checks passed against both a local static build and the deployed URL. They demonstrate a UI, not hosted Rust authority; no model/backend/user-data API is attached to that site.

The protected Linux test-host image runs the real stack as a non-root user with an exact-origin password gateway, loopback-only internal services and a mounted state volume. Initial image testing exposed unreadable root-owned source files; runtime copies now have the correct non-root ownership. Restart testing also exposed a stale browser session path; HTTP 401 now clears the authenticated view so the user can choose a development persona again without manually reloading. The operational fixture checks password protection, origin rejection, actual backend identity, open-browser recovery, session invalidation, source-byte persistence and separate personal custody after a real container restart. It is added to x86-64 CI.

Cloudflare Containers returned “Workers Paid plan required,” and its container-local disk is documented as temporary. Billing was not changed and a hosted live backend was not provisioned. The optional image and operational fixtures prepare that next step without treating the UI sample or temporary disk as a production authority host.

## 31 October: resident checkpoint and open workspace

Resident source `3ae231707b01ec423e2b3d34238a5563f22f391e` passed remote
[Windows packaging and extracted-bundle qualification](https://github.com/yohn-maistre/aksara-core/actions/runs/41197776392)
and [Linux x64/ARM conformance](https://github.com/yohn-maistre/aksara-core/actions/runs/41197776349).
The x64 job includes a real native GUI fixture through Vercel agent-desktop;
ARM keeps the authority/runtime/stress checks, not emulated desktop claims.

The subsequent [open workspace audit](open-workspace-audit.md) records local
UI, sky/weather, browser/privacy and runtime evidence. It changes the view and
optional weather port, not schema 4 or the native computer authority boundary.
The README now directs source installs to the native launcher; Python remains
a separate conformance/simulator dependency.
