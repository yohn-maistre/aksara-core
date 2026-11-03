# Aksara desktop for Windows

The desktop build uses **Tauri 2 and the system WebView2 runtime**, with the same
local Rust/SQLite authority and durable Mastra host as the browser app. It does
not bundle another Chromium browser or require Docker, WSL, Python, Node or a
compiler to be installed separately.

## Install

Open a **successful** [Windows build](https://github.com/yohn-maistre/aksara-core/actions/workflows/windows.yml)
and download `aksara-desktop-windows-x64`. GitHub wraps artifacts in a ZIP, but
this one contains a setup EXE, checksum and small size report. Extract those few
files, then run `Aksara_0.2.0_x64-setup.exe` (the exact name is shown in the artifact).
The installer writes the compact runtime itself and creates a Start Menu entry.
Its default app directory is `%LOCALAPPDATA%\Programs\Aksara`, separate from data.
You do not need to extract a tree of frontend source dependencies.

The installer is per-user. Its default WebView2 mode uses an existing system
runtime, downloading Microsoft's bootstrapper only if it is missing. Internet
access is needed for that fallback. This development build is unsigned; it is
not a signed production release. Windows 10/11 x64 is the target; installation
and memory/performance on a particular Surface still need testing.

Open Aksara from Start. It starts or reuses your authenticated local host and
opens its workspace in a native window. Connect/test your model in onboarding.
The initial loading screen does not imply a connected model or completed task.

- Closing the window hides it; the host and background work remain available.
- Use the tray menu → **Open Aksara** to return.
- **Stop Aksara and quit** stops through the existing authenticated host controller.
- **Quit desktop (keep host running)** closes the wrapper while the host continues.
- A sleeping or powered-off Surface cannot run background tasks.

The same host can still be opened in your browser at its local address. This is
one authority and task store, not a second desktop agent or memory system.

## Data, updates and removal

Personal and community data remain at `%LOCALAPPDATA%\Aksara`, outside the app's
installation directory. The desktop uses the same stores as the portable CLI.
No migration/import of credentials is necessary when that host directory already
exists. Stop the old host before switching installation versions. Installation
or opening a Channel does not grant access to a desktop window or hardware.

Updates/uninstall request a clean host stop before replacing app files. They do
not delete the canonical data directory or provider credentials. Existing backups
still export a selected canonical database, not the complete credential/workflow
state. Keep deliberate backups; this is not an automatic fleet restore system.
The app does not enroll the PC, change its firewall or manage Windows updates.

The native wrapper reads the owner-protected runtime control record, validates
its bounded token/ports, authenticates status and requires the returned web origin
to match `127.0.0.1` and the recorded port. The WebView has no filesystem/shell
IPC capability and cannot navigate to another web origin. Explicit HTTPS links,
including provider sign-in, open in the normal system browser. No remote-source
Tauri capabilities, broad CORS or hosted-page access to local credentials is added.

If startup fails, use the tray Open action after a short wait. For diagnostics,
open the installed app's `runtime` directory and run `aksara.cmd doctor --json`
or `aksara.cmd start` in PowerShell. The CLI retains its safe startup-stage errors.
Do not delete identity files beside existing databases to work around an error.

## Smaller portable alternative

`aksara-windows-x64` remains available for people who prefer the terminal/browser.
It now bundles only reachable backend JavaScript and the native SQLite dependency
closure, plus the compiled PWA, Node, Rust host, computer driver and notices.
It does not install/copy the monorepo's frontend `node_modules`. CLI control
commands also lazy-load the workbench only when starting it.

The build writes `windows-package-metrics.json` with real file count, installed
bytes and compressed archive bytes. The first Windows build measured **575 files / 135,360,932 installed bytes**
(about 129 MiB), with a **48,992,133-byte portable ZIP** (about 47 MiB). Its NSIS
installer was **33.38 MiB**; installation-path qualification was still being
completed at that checkpoint. These are build measurements, not a Surface timing
claim. A Linux compact-host probe measured 202
backend files / 29,915,903 bytes before PWA/Node/Windows binaries. That is not the
final Windows installer size or a Surface installation-time measurement. Use the
successful Windows artifact's metrics for the actual complete bundle.

## Android and future shells

Tauri 2 supports Android as well as desktop, so a thin Android client can reuse
the web UI and potentially the same shell tooling. The Windows Node host and tray
are not an Android port. First qualify connection/enrollment, keyboard, files,
OAuth return, lifecycle and memory on a phone. Capacitor remains a practical
web-first fallback with mobile plugins; adding it is not automatically necessary.
Expo supports DOM/WebView reuse too, but a further native runtime is justified
only by concrete capture, notification or native-screen needs. No Android APK or
Expo rewrite is claimed in this desktop increment.

## Hosted preview and connectors

The public Pages preview remains a disconnected sample. Installing its PWA would
install that sample UI; it would not start a local backend. A real live deployment
needs either a protected always-on Rust/Node host or a deliberately paired local
connector. That connector needs explicit enrollment, exact origins, current scoped
sessions, CSRF/egress controls and browser local-network compatibility. Opening
CORS on localhost is not an acceptable substitute. No private files, API keys or
ChatGPT subscription credentials were moved into the preview.

A Tauri window alone does not make the server smaller. The compact runtime fixes
the unnecessary dependency files; Tauri supplies the installation/window/tray
experience. Mastra and Rust retain their existing responsibilities.

## Build and qualification

After the normal `npm ci`, PWA build and Windows Rust release build:

```powershell
python scripts/package_windows.py --binary target/release/aksarad.exe --node (Get-Command node).Source --keep-directory
python scripts/collect_desktop_notices.py
npm run desktop:build
```

The desktop has a separate locked Cargo workspace so Linux/ARM kernel builds do
not acquire GTK/WebView requirements. Windows CI checks the extracted compact
bundle's actual model/tool/delegation path, builds the NSIS installer, installs it
in a path containing spaces/Unicode, exercises the native controller against the
installed host, uninstalls, and verifies user data remains. That lifecycle check
is not a manual WebView interaction or real Windows computer-use qualification.
The Linux isolated-package test also exercises hard-kill Mastra recovery. Live
ChatGPT entitlement and actual Surface memory, GPU and startup behavior remain
separate tests.
