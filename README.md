# Aksara platform foundation handoff

Verified development snapshot from source commit `1442f06e74f84b195f2f8bf85e2c8548c8a7f266`.

[Source / draft PR](https://github.com/yohn-maistre/aksara-core/pull/1) · [Platform guide](https://github.com/yohn-maistre/aksara-core/blob/feat/platform-foundation/docs/platform/README.md) · [Verification](https://github.com/yohn-maistre/aksara-core/blob/feat/platform-foundation/docs/platform/verification.md)

- **aksara-core-handoff.zip**: full committed source and Git history, feature branch, ARM64 phone archive and per-file checksums.
- **aksara-aarch64-unknown-linux-musl.tar.gz**: static ARM64 host, prebuilt PWA, runtime sources and dependency notices.
- **SHA256SUMS**: checksums of both archives.
- **today-desktop.png / today-mobile.png**: actual UI screenshots with synthetic development data.

This branch distributes build artifacts; it is independent of the source branch and is not a production release. No credentials, databases, runtime stores or model weights are included.

100 distinct local checks passed; the same 22 process checks also passed against the new ARM64 binary under QEMU. Native ARM64 CI is tracked on the source PR. No physical Samsung A12 measurement is asserted.

## On the phone

First verify your Debian environment is ARM64/64-bit (`dpkg --print-architecture`, `getconf LONG_BIT`). Extract the phone archive, install Node 24.19+ and Python 3.10+, then run:

```sh
npm ci --omit=dev
python3 scripts/start_platform.py --binary bin/aksarad
```

Open http://127.0.0.1:7341 on that device. The identity chooser is development-only. Personal profiles use separate databases. Models and voice are optional; start without them, then measure each addition. OpenCode's keyless completion probe returned 429 free-quota denial. Pocket TTS read-aloud works as an optional local worker; microphone/STT is not included. Production enrollment, isolated computers, Ruara publication and physical hardware need further qualification.

The zip can be given to Hermes. It contains HERMES_HANDOFF.md, complete Git refs/history and the phone archive. Source uses Apache-2.0 with donor notices; OpenDuet presentation code retains its MIT notice. See each archive's dependency notices.
