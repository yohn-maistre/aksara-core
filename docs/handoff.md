# Hermes handoff: source, history and phone binary

Continue the existing Aksara work. Apache-2.0 is selected. Keep the destination repository private. Read `AGENTS.md`, `docs/design-review.md`, `docs/donors.md` and `docs/verification.md` before extending components.

The outer ZIP contains:

- `source/`: committed source, locks, docs, tests and CI configuration.
- `aksara-core.git.bundle`: complete local Git history and `main` branch.
- `aksara-aarch64-unknown-linux-musl.tar.gz`: tested static ARM64 Rust host, source/runtime/simulator and Cargo dependency notices.
- `HERMES_HANDOFF.md`: these instructions.
- `SHA256SUMS`: checksums of every other file in the ZIP.

No credentials, development databases, npm installations, Rust build tree or donor clones are included. The source catalogue is included unchanged; review its internal content before any future decision to make this repository public.

## Import the existing commits

Extract in Debian's home directory, rather than Android shared storage. Inside the extracted `aksara-core-handoff` directory:

```sh
sha256sum -c SHA256SUMS
git clone --branch main aksara-core.git.bundle aksara-core
cd aksara-core
git status --short
git log --oneline -3
```

The bundle works without GitHub/network access and preserves the existing commits. `--branch main` selects the intended branch even when the receiving machine defaults to `master`. `source/` is an inspectable copy; it does not need to be committed again when importing the bundle.

If the bundle cannot be used, copy `source/` to a fresh directory, initialize Git on `main`, inspect/stage the supplied files and commit. Do not include runtime state or the ZIP itself.

## Publish to the user's empty private repo

The expected URL is `https://github.com/yohn-maistre/aksara-core`, but **confirm the exact URL with the user** if it differs. Use the user's existing authorized local GitHub credentials or SSH identity. If authentication is needed, use GitHub CLI's browser/device login on the phone. Never ask for tokens in chat or embed them in Git URLs.

For HTTPS via GitHub CLI:

```sh
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh api repos/yohn-maistre/aksara-core --jq '{full_name,visibility,permissions,default_branch}'
git ls-remote https://github.com/yohn-maistre/aksara-core.git
```

Proceed with the following only if API access succeeds, visibility is private, push permission is true, and `git ls-remote` succeeds with no refs (an empty repository):

```sh
git remote set-url origin https://github.com/yohn-maistre/aksara-core.git
git push -u origin main
```

The bundle clone initially sets `origin` to the local bundle; `set-url` replaces that address. If you initialized from `source/` and have no origin, use `git remote add origin` instead. If refs already exist at the destination, fetch and inspect them first. Do not overwrite or force-push unrelated history. If a README/license initialization created a separate root commit, preserve it through a reviewed merge or import onto a new branch. A normal push may require workflow permission because `.github/workflows/ci.yml` is included; use a properly authorized local login rather than dropping the workflow silently.

Inspect the resulting Actions run, especially native ARM64. Local actionlint passed; remote CI has not been executed or certified here. Upload the phone tarball as a private release asset if the user requests that separately; it is intentionally absent from Git history.

## Run on the A12 before compiling

From the outer handoff directory, in an ARM64 Debian installation:

```sh
dpkg --print-architecture
getconf LONG_BIT
tar -xzf aksara-aarch64-unknown-linux-musl.tar.gz
cd aksara-aarch64-unknown-linux-musl
bin/aksarad --version
python3 scripts/dev.py
```

Open `http://127.0.0.1:7341` in Android's browser. The launcher creates private `.aksara/dev-identities.json` for the separate development identities. See `docs/phone.md` for optional Node/Pi installation and the full stress run. Manual kernel/UI/device testing does not require Node or a model.

Start the full process suite at 50 documents after installing Node 24.19+ and `npm ci --ignore-scripts --omit=dev`. Preserve its report together with actual phone variant, Debian architecture, RAM, temperature and power conditions. Emulated ARM64 success is useful evidence but does not replace this phone run.

## GitHub connection diagnosis from this workspace

The CLI and connector both authenticate as `yohn-maistre`, but both returned 404 for `yohn-maistre/aksara-core`. Both installation-list paths returned no available connector installations. Thus the current session cannot establish repository read/write access. A 404 for a private repo can also mean an incorrect URL; it is not evidence that the user's repo was deleted.

The supplied screenshot shows **ChatGPT Codex Connector** under **Authorized GitHub Apps**. Authorization and repository installation/access are distinct. OpenAI's [official GitHub guide](https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt) points missing private repositories to the [connector installation selector](https://github.com/apps/chatgpt-codex-connector/installations/select_target). Select the correct account and grant the new repo, then refresh/reconnect the relevant product connection if needed. Merely changing repo visibility cannot grant write permission.

The same guide describes ordinary ChatGPT GitHub access as read-only and directs code pushing to Codex. Repository installation repairs visibility; write support also depends on the product connection and its granted permissions. This workspace exposes write-shaped GitHub tools, but their presence alone does not prove permission. The local authenticated Hermes/Git route is the prepared fallback. No GitHub push has been claimed or performed here.
