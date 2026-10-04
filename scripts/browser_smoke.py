#!/usr/bin/env python3
"""Browser conformance with disposable private fixtures. Requires Playwright Chromium."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parent))
from stress import Harness, ROOT


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser()
    parser.add_argument('--binary', type=Path, default=ROOT / 'target/debug/aksarad')
    args = parser.parse_args()
    directory = tempfile.mkdtemp(prefix='aksara-browser-')
    harness = Harness(directory, args.binary.resolve())
    success = False
    try:
        harness.sim = harness.spawn(['python3', str(ROOT / 'scripts/device_simulator.py'), '--db', str(harness.simdb), '--port', str(harness.simport)])
        harness.ready(harness.sim, f'http://127.0.0.1:{harness.simport}/state', harness.env['AKSARA_SIM_TOKEN'])
        harness.start()
        fixture = Path(directory) / 'fixture.json'
        fixture.write_text(json.dumps({'url': harness.url, 'dev': harness.dev, 'root': str(ROOT), 'directory': directory}))
        subprocess.run(['node', str(ROOT / 'tests/browser.mjs'), str(fixture)], cwd=ROOT, check=True, env=harness.env)
        success = True
    finally:
        harness.close()
        if success:
            shutil.rmtree(directory)
        else:
            print(f'Private browser fixture logs: {directory}')


if __name__ == '__main__':
    main()
