# Aksara implementation rules

Read `docs/design-review.md` and `docs/donors.md` before expanding a component. The current v1 catalogue supersedes historical archives in the same source file. Study the pinned donor's actual implementation before adding its adapter; record the files, license and intended reuse. Keep donor runtime state subordinate to Rust authority.

Current principal, institution, lane audience, purpose, policy epoch and WorkObject revision/generation must be checked at the point of use. Eligibility precedes retrieval ranking and memory injection. No owner fallback, public sharing without a SharingGrant, ambient tool authority, automatic approval or arbitrary device text.

Local effects and receipts commit in one transaction. Remote invocation requires a committed intent; uncertain outcomes require reconciliation. Cancellation fences new execution but must not erase real effects already performed. Never present an unverified result as complete.

Preserve original source bytes. Derived blocks, indexes, wiki, graph and cognition stores are rebuildable projections. Record donor license obligations when copying code; ordinary dependency installation does not turn its authority model into ours.

For kernel changes run `cargo fmt --all -- --check`, `cargo test --locked --workspace` and `cargo clippy --locked --workspace --all-targets -- -D warnings`. Runtime changes run `npm test`; device behavior changes run `python3 -m unittest discover -s tests -v`. Changes to authority, effect durability or runtime replay also run `python3 scripts/stress.py --documents 200`. Privacy/scope or approval UI changes also run `python3 scripts/browser_smoke.py` with Playwright Chromium installed. Keep credentials, databases, runtime stores and fixture logs out of git. Report measured hardware and unimplemented seams honestly.
