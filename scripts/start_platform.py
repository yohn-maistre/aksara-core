#!/usr/bin/env python3
"""Run the development PWA, authority hosts, and independent device simulator.

Every personal profile gets its own database and one-person TrustDomain.
The identity chooser is development-only, not production authentication.
"""
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, default=ROOT / '.aksara/platform')
    parser.add_argument('--binary', type=Path, default=ROOT / ('bin/aksarad' if (ROOT / 'bin/aksarad').exists() else 'target/debug/aksarad'))
    parser.add_argument('--port', type=int, default=7341)
    parser.add_argument('--service-base', type=int, default=7350)
    args = parser.parse_args()
    base = args.service_base
    if not 1024 <= base <= 65528:
        parser.error('service-base must be in 1024..65528')
    if not args.binary.is_file() or not (ROOT / 'apps/platform/dist/index.html').is_file():
        parser.error('build first: cargo build --locked --workspace && npm ci && npm run build')
    # Fixed local ports keep service destinations out of untrusted browser input.
    if args.port in (base, base+1, base+3, base+5, base+7) or not 1024 <= args.port <= 65535:
        parser.error('choose a port in 1024..65535 outside 7350/7351/7353/7355/7357')
    args.state.mkdir(parents=True, exist_ok=True, mode=0o700)
    binary = str(args.binary.resolve())
    children = []
    profiles = []
    def init(folder, command):
        folder.mkdir(parents=True, exist_ok=True, mode=0o700)
        credentials = folder / 'identity.json'
        db = folder / 'state.sqlite'
        if not db.exists():
            credentials.write_bytes(subprocess.check_output([binary, '--db', str(db), *command]))
            credentials.chmod(0o600)
        if not credentials.exists():
            parser.error(f'missing original credentials: {credentials}')
        return db, json.loads(credentials.read_text())
    community_db, community = init(args.state / 'community', ['init-dev'])
    for i, row in enumerate(community['people']):
        person = row['principal']
        actor = person['name']
        private_lane = next(l['lane']['id'] for l in community['lanes'] if l['lane']['audience'] == [person['id']])
        profiles.append(dict(id=f'community-{i}', name=actor, actor=actor, mode='community', kernel=f'http://127.0.0.1:{base+1}', token=row['token'], lane=private_lane))
        personal_db, personal = init(args.state / f'personal-{i}', ['init-personal', '--name', actor])
        profiles.append(dict(id=f'personal-{i}', name=actor, actor=actor, mode='personal', kernel=f'http://127.0.0.1:{base+3+i*2}', token=personal['people'][0]['token'], lane=personal['lanes'][0]['lane']['id']))
        children.append(([binary, '--db', str(personal_db), 'serve', '--listen', f'127.0.0.1:{base+3+i*2}'], {}))
    config = args.state / 'profiles.json'
    config.write_text(json.dumps(profiles, indent=2))
    config.chmod(0o600)
    sim_token = args.state / 'simulator-token'
    if not sim_token.exists():
        sim_token.write_text(secrets.token_urlsafe(32))
        sim_token.chmod(0o600)
    env = dict(os.environ, AKSARA_SIM_TOKEN=sim_token.read_text().strip())
    env.pop('AKSARA_FAULT', None)
    env.pop('AKSARA_PI_FAULT', None)
    children.extend([
        (['python3', str(ROOT / 'scripts/device_simulator.py'), '--db', str(args.state / 'devices.sqlite'), '--port', str(base)], {}),
        ([binary, '--db', str(community_db), 'serve', '--listen', f'127.0.0.1:{base+1}', '--simulator', f'127.0.0.1:{base}'], {}),
        (['node', '--use-env-proxy', str(ROOT / 'packages/workbench/server.mjs')], dict(AKSARA_PROFILES=str(config.resolve()), AKSARA_PORT=str(args.port), AKSARA_PROVIDER_STATE_DIR=str((args.state / "providers").resolve()))),
    ])
    processes = []
    def stop(*_):
        for process in processes:
            if process.poll() is None:
                process.send_signal(signal.SIGINT)
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    try:
        for command, extra in children:
            processes.append(subprocess.Popen(command, cwd=ROOT, env=dict(env, **extra)))
        print(f'Open http://127.0.0.1:{args.port} — development identity chooser. Ctrl-C stops all hosts.', flush=True)
        while all(p.poll() is None for p in processes):
            time.sleep(0.3)
    finally:
        stop()
        for process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


if __name__ == '__main__':
    main()
