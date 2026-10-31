#!/usr/bin/env bash
# Disposable Linux GUI qualification; never attaches to a person's desktop.
set -euo pipefail
desktop_fixture=$(mktemp -d)
trap 'rm -rf "$desktop_fixture"' EXIT
export AKSARA_DESKTOP_BINARY="$desktop_fixture/agent-desktop"
python3 - "$desktop_fixture" <<'PY'
import sys, urllib.request, tarfile, hashlib
from pathlib import Path
root=Path(sys.argv[1]); archive=root/'driver.tar.gz'
urllib.request.urlretrieve('https://github.com/vercel-labs/agent-desktop/releases/download/v1.0.2/agent-desktop-v1.0.2-x86_64-unknown-linux-gnu.tar.gz',archive)
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='ad661b7a3fd8f990a769243f4889a240ca0e2c8dab3ef5bddd6019086c71e0b4'
with tarfile.open(archive) as source:
    for name in ['agent-desktop','agent-desktop-linux-clipboard-owner']:
        entry=source.getmember(name)
        assert entry.isfile()
        (root/name).write_bytes(source.extractfile(entry).read())
        (root/name).chmod(0o700)
PY
export ACCESSIBILITY_ENABLED=1
dbus-run-session -- xvfb-run -a bash -c '
  openbox >/dev/null 2>&1 &
  fixture_wm=$!
  trap "kill $fixture_wm 2>/dev/null || true" EXIT
  node tests/desktop-native.mjs
'
