#!/usr/bin/env bash
# Optional Linux x64 qualification. Does not install a service or alter the host.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo 'This pinned binary fixture qualifies Linux x64 only.' >&2
  exit 1
fi
workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT
curl --fail --location --max-time 120 --output "$workdir/agentgateway" \
  https://github.com/agentgateway/agentgateway/releases/download/v1.7.0/agentgateway-linux-amd64
printf '%s  %s\n' 1b2fc01a2de29ca113bbb6258b5cae7b1eb3c724071c09d687a449132f2f42f8 "$workdir/agentgateway" | sha256sum --check
chmod 700 "$workdir/agentgateway"
"$workdir/agentgateway" -f deploy/agentgateway/local.json --validate-only
AKSARA_AGENTGATEWAY_BINARY="$workdir/agentgateway" node tests/agentgateway.mjs
