# Aksara desktop

Windows-first Tauri 2 wrapper over the same local host. No model tool authority
or generic native IPC is exposed to the WebView. The wrapper authenticates the
existing loopback controller, starts the compact host when needed and provides
tray lifecycle actions. Canonical state remains outside the installation folder.

[Installation, build, limits and qualification](../../docs/platform/desktop-installation.md).

`src-tauri` is a separate Cargo workspace; `npm run desktop:build` builds it after
the compact runtime is staged under `dist/aksara-windows-x64`. Do not add WebView
system dependencies to the kernel's Linux/ARM toolchain.
