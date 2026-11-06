# Verification

Tests use disposable synthetic institutions and local provider fixtures. They exercise actual Rust, Mastra, MCP and browser code. They do not demonstrate live ChatGPT entitlement, production identity, real messaging accounts, physical hardware or Surface Pro performance.

```sh
cargo fmt --all -- --check
cargo test --locked --workspace
cargo clippy --locked --workspace --all-targets -- -D warnings
npm ci
npm test
npm run test:platform
npm run build
npm run build:preview
npx playwright install chromium
python3 scripts/stress.py --documents 200
python3 scripts/browser_smoke.py
node tests/platform-browser.mjs
node tests/workspace-browser.mjs
node tests/preview-browser.mjs
```

Memory checks include real embedded LongMemory recall, source-linked review status, withdrawal during a query, changed policy epochs, separate principals and real MCP stdio clients. Working-surface checks cover stale edits, exact source snapshots and immutable vector scene snapshots. The private-pane host tests check an unchanged parent session, separate personal custody, invented context rejection and logout invalidation.

Browser tests cover first-run setup, original-byte retention, scoped document review, shared rich-document revisions, private drafts beside shared work, phone layout and no third-party drawing-font requests. Preview tests are disconnected UI tests; their sample responses are not inference evidence.

Compact distribution qualification:

```sh
npm run build:host
node scripts/aksara.mjs doctor
```

Native Windows and ARM64 builds run separately in CI. A successful Linux check is not proof of a Windows WebView lifecycle or low-memory hardware performance. Account sign-in and a real model reply still need to be tested on the user's installed host.
