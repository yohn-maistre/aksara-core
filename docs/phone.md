# Samsung A12: Termux / proot Debian

This is a phone **development** profile: Rust host, SQLite, browser test client and Python controller simulator. Pi Durable is optional. No KVM, Docker, systemd, Graphiti, voice model or GPU is required. PRoot does not provide production computer isolation.

The A12 has several variants. Its CPU may be ARM64 while Android userspace or your Debian install is 32-bit. Check the installed environment before choosing an artifact:

```sh
uname -m
getconf LONG_BIT
dpkg --print-architecture
free -m
df -h .
```

Use the ARM64 bundle for an `arm64` Debian installation. A 32-bit `armhf` install needs a matching source build and does not currently have a tested Pi worker profile. Measure actual usable RAM rather than assuming the advertised phone variant.

## Install the phone environment

In Termux, with a supported Termux build and package sources:

```sh
pkg update
pkg install proot-distro git openssh
proot-distro install debian
proot-distro login debian
```

Inside Debian:

```sh
apt update
apt install -y ca-certificates curl git python3 build-essential pkg-config
```

Use Debian's home directory for SQLite databases and source builds. Android shared storage often has unsuitable permissions, locking and executable semantics. Keep your long-running Termux session awake using Android's battery settings; `termux-wake-lock` can be run from Termux when available. Battery/thermal behavior remains a device measurement.

## Prefer a prebuilt bundle

The local bundle is `aksara-aarch64-unknown-linux-musl.tar.gz`. After the repository is uploaded and CI succeeds, GitHub Actions will also package it in the ARM64 build artifact. The repository is private: download while logged into your GitHub account. There is no need to make it public. Static musl avoids depending on a newer Ubuntu glibc than Debian provides. The local cross-build is not a substitute for native ARM64/phone execution; check the verification report and CI result for that distinction.

```sh
tar -xzf aksara-aarch64-unknown-linux-musl.tar.gz
cd aksara-aarch64-unknown-linux-musl
bin/aksarad --version
python3 scripts/dev.py
```

Open Android's browser at `http://127.0.0.1:7341`. In a second Debian session, inspect `.aksara/dev-identities.json` and paste one person's token into the browser. Tokens are development credentials, not a shared institution password.

The bundle includes dependency licenses, the Python simulator, runtime package/lockfile and tests. The compiled binary includes the small web client. Skip Node entirely for manual Library, Threads, approval, memory, device and receipt testing.

## Build from source if needed

Clone through an authenticated GitHub session (`gh repo clone yohn-maistre/aksara-core` or an authenticated Git URL). Do not paste an access token into a clone URL or shell history.

Install Rust through the official [rustup](https://rustup.rs/) instructions, inspecting/downloading the installer before running it. This project pins 1.99.0. Build one job at a time to limit RAM:

```sh
cd aksara-core
. "$HOME/.cargo/env"
export CARGO_BUILD_JOBS=1
cargo build --locked --workspace
python3 scripts/dev.py
```

The development profile already disables debug symbols. For a smaller optimized binary without expensive link-time optimization:

```sh
CARGO_PROFILE_RELEASE_LTO=false cargo build --locked --release --workspace -j 1
python3 scripts/dev.py --binary target/release/aksarad
```

Compiling on the A12 may be much slower and use more RAM than running the host. Prefer the artifact when its architecture matches.

## Optional Pi Durable worker

The Pi adapter uses Node's built-in SQLite and current JS features. Use Node **24.19 or newer** inside ARM64 Debian. Debian's default Node may be too old. Use the official [Node distribution](https://nodejs.org/en/download) for Linux ARM64 and verify its release checksums. Confirm:

```sh
node --version
node --input-type=module -e 'import { DatabaseSync } from "node:sqlite"; console.log(typeof DatabaseSync)'
npm ci --ignore-scripts --omit=dev
```

Then follow the token/lane setup in [runbook.md](runbook.md). Start one worker at a time:

```sh
NODE_OPTIONS=--max-old-space-size=256 npm run worker -- work_ID
```

This is an actual Pi Durable task without an LLM provider. It preserves task checkpoints and prepares a reviewed artifact; it does not synthesize answers with a model. Do not install a model or cloud credentials just to run the initial stress harness.

## Run the conformance and stress suite

For a source checkout, run Rust tests when build resources permit. Device tests need only Python. The full process stress harness requires Node and installed Pi packages; it launches temporary hosts on separate ports and leaves your normal `.aksara` untouched.

```sh
python3 -m unittest discover -s tests -v
npm test
python3 scripts/stress.py --binary bin/aksarad --documents 50 --output phone-stress-results.json
```

Use `target/debug/aksarad` or `target/release/aksarad` for a source checkout. Start at 50 documents, then 200 and 1000 while monitoring RAM, free disk and temperature. The JSON report contains latency, RSS, platform and passed conformance names; it contains no tokens or source text. It is synthetic evidence, not a representative workload guarantee.

Phone CPU model, Debian architecture, Node/Rust versions, warm/cold status, power mode and temperature should accompany shared measurements. In `scripts/stress.py`, `phone_measurement` is always false because the harness cannot establish physical hardware identity; annotate a phone run separately rather than editing the measurement into a claim it cannot verify.

Capture/pairing/OTA fixtures are simulated. Neither this profile nor Muse's SDL simulator proves microphone privacy wiring, MCU isolation, power draw, e-paper refresh, ESP32 radio behavior or real signed updates. Those features need physical boards and separate conformance gates.
