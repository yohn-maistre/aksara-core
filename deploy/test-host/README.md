# Protected development test host

This profile runs the **real** Rust kernels, Node workbench and independent Python device simulator in a Linux container. It is an operational test profile, not production enrollment or isolation for untrusted agent code. Use synthetic data only. The current Cloudflare connection rejected Containers with “Workers Paid plan required”; no account upgrade or hosted backend is created by these files.

The gateway is the only published port. It requires a password file, checks the exact configured browser origin, rejects cross-origin writes, and forwards only to the fixed loopback workbench. Internal kernel tokens remain in `/data`. Personal profiles have separate databases. A named volume preserves canonical state across restart; session cookies deliberately become invalid after restart. Remote use requires an HTTPS reverse proxy and the matching `AKSARA_PUBLIC_ORIGIN`. Development persona selection is intentionally behind the single test-host password and must not be confused with multi-user IAM.

## Build and run on a suitable Linux host

Build a static Linux Rust executable for the target architecture and place it at `dist/test-host/aksarad`. For example, with a musl C toolchain installed on x86-64:

```sh
rustup target add x86_64-unknown-linux-musl
cargo build --locked --release --target x86_64-unknown-linux-musl
mkdir -p dist/test-host
cp target/x86_64-unknown-linux-musl/release/aksarad dist/test-host/aksarad
```

Create a private password file containing at least 24 random characters, readable by the container's non-root UID 1000. Do not commit it or place its value in command arguments. Set `AKSARA_TEST_PASSWORD_FILE` to its absolute path, then:

```sh
docker compose -f deploy/test-host/compose.yaml up --build -d
```

Open `http://127.0.0.1:8080`, username `aksara`, with the password from that file. The compose default publishes only to loopback, caps the container at 768 MiB and one CPU, and mounts `aksara-state:/data`. It uses the normal frontend build, not the sample preview. Model and voice workers are optional and not included. Do not use `docker compose down -v` if you want to preserve the test data.

For a managed build environment with an HTTPS inspection proxy, supply its public CA through the optional BuildKit secrets `proxy_ca` (Node) and `proxy_bundle` (combined system bundle for apt). Keep TLS validation enabled. Certificates and credentials are not baked into image layers.

`tests/test-host-ops.mjs` checks the password gate, origin checks, actual backend session, session invalidation, persistent original source bytes and personal custody after a real Docker restart. It expects an already-running disposable container; see the environment selectors at its top. These checks do not establish persistence for Cloudflare container-local disk: a real hosted deployment still needs suitable durable storage, backup/restore and host fencing.
