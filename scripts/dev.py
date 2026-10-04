#!/usr/bin/env python3
"""Start the local kernel and independent simulator. Individual credentials stay local."""
import argparse
import json
import os
from pathlib import Path
import secrets
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser()
    parser.add_argument('--binary', type=Path, default=ROOT / ('bin/aksarad' if (ROOT / 'bin/aksarad').exists() else 'target/debug/aksarad'))
    parser.add_argument('--state', type=Path, default=ROOT / '.aksara')
    parser.add_argument('--port', type=int, default=7341)
    parser.add_argument('--sim-port', type=int, default=7342)
    args = parser.parse_args()
    if not args.binary.is_file():
        parser.error('build first: cargo build --locked --workspace')
    if not (1024 <= args.port <= 65535 and 1024 <= args.sim_port <= 65535) or args.port == args.sim_port:
        parser.error('choose two distinct ports in 1024..65535')
    args.state.mkdir(parents=True, exist_ok=True, mode=0o700)
    db = args.state / 'state.sqlite'
    credentials = args.state / 'dev-identities.json'
    sim_credentials = args.state / 'simulator-token'
    if not db.exists():
        result = subprocess.check_output([str(args.binary.resolve()), '--db', str(db), 'init-dev'])
        credentials.write_bytes(result)
        credentials.chmod(0o600)
    if not credentials.exists():
        parser.error('existing database has no dev-identities.json; use your original individual tokens')
    if not sim_credentials.exists():
        sim_credentials.write_text(secrets.token_urlsafe(32))
        sim_credentials.chmod(0o600)
    env = {**os.environ, 'AKSARA_SIM_TOKEN': sim_credentials.read_text().strip()}
    env.pop('AKSARA_FAULT', None)
    env.pop('AKSARA_PI_FAULT', None)
    children = []
    def stop(*_):
        for child in children:
            if child.poll() is None:
                child.send_signal(signal.SIGINT)
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    try:
        children.append(subprocess.Popen(['python3', str(ROOT / 'scripts/device_simulator.py'), '--db', str(args.state / 'devices.sqlite'), '--port', str(args.sim_port)], env=env))
        children.append(subprocess.Popen([str(args.binary.resolve()), '--db', str(db), 'serve', '--listen', f'127.0.0.1:{args.port}', '--simulator', f'127.0.0.1:{args.sim_port}'], env=env))
        print(f'Open http://127.0.0.1:{args.port}\nIndividual tokens: {credentials}\nCtrl-C stops both hosts.', flush=True)
        while all(p.poll() is None for p in children):
            time.sleep(0.3)
    finally:
        stop()
        for child in children:
            try:
                child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()


if __name__ == '__main__':
    main()
