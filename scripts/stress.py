#!/usr/bin/env python3
"""Real-process crash/replay and bounded-load harness. No cloud credentials needed."""
from concurrent.futures import ThreadPoolExecutor
import argparse
import json
import os
from pathlib import Path
import platform
import resource
import secrets
import socket
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def no_core():
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))


class Harness:
    def __init__(self, directory, binary):
        self.dir = Path(directory)
        self.binary = str(binary)
        self.db = self.dir / 'state.sqlite'
        self.simdb = self.dir / 'devices.sqlite'
        self.port, self.simport = free_port(), free_port()
        self.url = f'http://127.0.0.1:{self.port}'
        self.env = {**os.environ, 'AKSARA_SIM_TOKEN': secrets.token_urlsafe(32)}
        for key in ['AKSARA_FAULT', 'AKSARA_PI_FAULT']:
            self.env.pop(key, None)
        self.dev = json.loads(subprocess.check_output([self.binary, '--db', str(self.db), 'init-dev'], env=self.env))
        self.kernel = None
        self.sim = None
        self.logs = []
        self.checks = []
        self.metrics = {}

    def check(self, name, condition=True):
        if not condition:
            raise AssertionError(name)
        self.checks.append(name)
        print(f'PASS {name}', flush=True)

    def spawn(self, args, env=None):
        log = (self.dir / f'process-{len(self.logs)}.log').open('wb')
        self.logs.append(log)
        return subprocess.Popen(args, cwd=ROOT, env=env or self.env, stdout=log, stderr=log, preexec_fn=no_core)

    def ready(self, process, url, token=None):
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError(f'process exited {process.returncode}; inspect {self.dir}')
            try:
                request = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'} if token else {})
                with urllib.request.urlopen(request, timeout=1) as response:
                    if response.status == 200:
                        return
            except (OSError, urllib.error.URLError):
                time.sleep(0.05)
        raise TimeoutError('host startup timeout')

    def start(self, fault=None):
        env = {**self.env}
        if fault:
            env['AKSARA_FAULT'] = fault
        self.kernel = self.spawn([self.binary, '--db', str(self.db), 'serve', '--listen', f'127.0.0.1:{self.port}', '--simulator', f'127.0.0.1:{self.simport}'], env)
        self.ready(self.kernel, self.url + '/health')

    def stop(self):
        if self.kernel and self.kernel.poll() is None:
            self.kernel.kill()
            self.kernel.wait(timeout=5)

    def call(self, operation, body=None, person=1, lane=0, expected=200, **query):
        headers = {'Authorization': 'Bearer ' + self.dev['people'][person]['token'], 'X-Aksara-Lane': self.dev['lanes'][lane]['lane']['id'], 'X-Aksara-Purpose': 'knowledge', 'Content-Type': 'application/json'}
        req = urllib.request.Request(self.url + '/api/' + operation + '?' + urllib.parse.urlencode(query), data=None if body is None else json.dumps(body).encode(), headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                status, value = response.status, json.load(response)
        except urllib.error.HTTPError as error:
            status, value = error.code, json.load(error)
        if status != expected:
            raise AssertionError(f'{operation}: expected {expected}, got {status}: {value}')
        return value

    def work(self, key, request='water continuity'):
        return self.call('delegate', {'request': request, 'idempotency_key': key})

    def proposal(self, key, capability='artifact.create'):
        work = self.work(key)
        if capability == 'artifact.create':
            args = {'title': key, 'content': 'Verified crash recovery result ' + key, 'visibility': 'institution', 'source_ids': []}
        else:
            args = {'device': 'presence', 'state': 'working', 'controller_generation': self.call('simulator-status')['generation']}
        proposal = self.call('prepare', {'work_id': work['id'], 'revision': work['revision'], 'generation': work['generation'], 'idempotency_key': key + ':effect', 'capability': capability, 'args': args})
        approved = self.call('approve', {'id': proposal['id'], 'args_hash': proposal['args_hash']}, person=0)
        return work, approved

    def count(self, table, column=None, value=None, db=None):
        with sqlite3.connect(db or self.db) as conn:
            sql = 'SELECT count(*) FROM ' + table
            if column:
                sql += ' WHERE ' + column + '=?'
            return conn.execute(sql, (value,) if column else ()).fetchone()[0]

    def crash_request(self, operation, body):
        try:
            self.call(operation, body)
        except (OSError, urllib.error.URLError):
            pass
        else:
            raise AssertionError('fault did not crash the host')
        self.kernel.wait(timeout=5)
        if self.kernel.returncode == 0:
            raise AssertionError('fault injection unexpectedly succeeded')

    def run(self, documents):
        self.sim = self.spawn(['python3', str(ROOT / 'scripts/device_simulator.py'), '--db', str(self.simdb), '--port', str(self.simport)])
        self.ready(self.sim, f'http://127.0.0.1:{self.simport}/state', self.env['AKSARA_SIM_TOKEN'])
        self.start()
        self.call('ingest', {'title': 'Private seed', 'content': 'PRIVATESEED alice record water', 'visibility': 'private', 'purpose': 'knowledge', 'provenance': 'stress fixture'}, lane=2)
        self.check('private source absent from shared retrieval', self.call('search', query='PRIVATESEED') == [])
        self.check('private source visible only in its authorized lane', len(self.call('search', lane=2, query='PRIVATESEED')) == 1)
        self.check('another actor cannot retrieve private evidence', self.call('search', person=2, lane=3, query='PRIVATESEED') == [])
        self.call('ingest', {'title': 'Invalid public', 'content': 'x', 'visibility': 'public', 'purpose': 'knowledge', 'provenance': 'fixture'}, expected=403)
        self.check('public ingestion requires future SharingGrant implementation')
        work = self.work('race-work')
        with ThreadPoolExecutor(max_workers=8) as pool:
            repeated = list(pool.map(lambda _: self.work('race-work'), range(32)))
        self.check('32 concurrent duplicate delegations have one WorkObject', all(w['id'] == work['id'] for w in repeated))
        work, effect = self.proposal('race-effect')
        with ThreadPoolExecutor(max_workers=8) as pool:
            receipts = list(pool.map(lambda _: self.call('execute', {'id': effect['id'], 'lease': effect['lease']}), range(32)))
        self.check('32 concurrent executions return one committed receipt', len({r['id'] for r in receipts}) == 1 and self.count('receipts', 'effect_id', effect['id']) == 1)
        for fault, expected_before in [('local_before_commit', 0), ('local_after_commit', 1)]:
            work, effect = self.proposal(fault)
            self.stop()
            self.start(fault)
            self.crash_request('execute', {'id': effect['id'], 'lease': effect['lease']})
            self.check(f'{fault}: atomic receipt boundary', self.count('receipts', 'effect_id', effect['id']) == expected_before)
            self.start()
            receipt = self.call('execute', {'id': effect['id'], 'lease': effect['lease']})
            duplicate = self.call('execute', {'id': effect['id'], 'lease': effect['lease']})
            self.check(f'{fault}: restart yields one artifact and one receipt', receipt['id'] == duplicate['id'] and self.count('receipts', 'effect_id', effect['id']) == 1)
        work, effect = self.proposal('external-unknown', 'device.indicate')
        self.stop()
        self.start('device_after_destination')
        self.crash_request('device-execute', {'id': effect['id'], 'lease': effect['lease']})
        self.check('external destination committed while local receipt is absent', self.count('receipts', 'id', effect['id'], self.simdb) == 1 and self.count('receipts', 'effect_id', effect['id']) == 0)
        self.start()
        self.call('device-execute', {'id': effect['id'], 'lease': effect['lease']}, expected=409)
        self.call('cancel', {'id': work['id']})
        reconciled = self.call('device-reconcile', {'id': effect['id'], 'work_id': work['id']})
        self.check('reconciliation records actual effect without resurrecting cancelled work', reconciled['outcome'] == 'VERIFIED' and self.call('thread', id=work['id'])['state'] == 'CANCELLED')
        self.check('reconciliation never reissues the destination command', self.count('receipts', 'id', effect['id'], self.simdb) == 1)
        work, stale = self.proposal('controller-stop', 'device.indicate')
        self.call('simulator-input', {'event': 'stop'}, person=0)
        self.call('simulator-input', {'event': 'release'}, person=0)
        self.call('device-execute', {'id': stale['id'], 'lease': stale['lease']}, expected=409)
        self.check('human stop fences an earlier approved device command after release', self.count('receipts', 'id', stale['id'], self.simdb) == 0)
        self.stop()
        request = urllib.request.Request(f'http://127.0.0.1:{self.simport}/input', data=json.dumps({'event': 'stop'}).encode(), headers={'Authorization': 'Bearer ' + self.env['AKSARA_SIM_TOKEN'], 'Content-Type': 'application/json'})
        with urllib.request.urlopen(request) as response:
            stopped = json.load(response)
        self.check('independent controller privacy and stop survive host death', stopped['stopped'] and stopped['privacy'])
        self.start()
        for phase in ['after_lookup', 'after_prepare']:
            work = self.work('pi-crash-' + phase)
            env = {**self.env, 'AKSARA_TOKEN': self.dev['people'][1]['token'], 'AKSARA_LANE': self.dev['lanes'][0]['lane']['id'], 'AKSARA_URL': self.url, 'AKSARA_RUNTIME_DB': str(self.dir / f'pi-{phase}.sqlite'), 'AKSARA_PI_FAULT': phase}
            worker = self.spawn(['node', 'packages/runtime-pi/worker.mjs', work['id']], env)
            worker.wait(timeout=30)
            self.check(f'Pi {phase}: worker killed at persisted checkpoint', worker.returncode == -9)
            env.pop('AKSARA_PI_FAULT')
            worker = self.spawn(['node', 'packages/runtime-pi/worker.mjs', work['id']], env)
            worker.wait(timeout=30)
            if worker.returncode:
                raise RuntimeError(f'Pi resume failed; inspect {self.dir}')
            effects = self.call('effects', work_id=work['id'])
            self.check(f'Pi {phase}: resume yields one proposal and preserves approval boundary', len(effects) == 1 and effects[0]['prepared']['status'] == 'PREPARED' and self.call('thread', id=work['id'])['state'] == 'AWAITING_APPROVAL')
        start = time.monotonic()
        for n in range(documents):
            self.call('ingest', {'title': f'Water source {n}', 'content': ('water continuity operational evidence ' + str(n) + '\n') * 20, 'visibility': 'institution', 'purpose': 'knowledge', 'provenance': 'synthetic bounded-load fixture'})
        self.metrics['ingestion_documents'] = documents
        self.metrics['ingestion_seconds'] = round(time.monotonic() - start, 3)
        def lookup(_):
            start = time.monotonic()
            hits = self.call('search', query='water', limit=10)
            assert all('PRIVATESEED' not in h['text'] for h in hits)
            return (time.monotonic() - start) * 1000
        with ThreadPoolExecutor(max_workers=8) as pool:
            timings = sorted(pool.map(lookup, range(100)))
        self.metrics['concurrent_searches'] = 100
        self.metrics['search_p50_ms'] = round(timings[49], 2)
        self.metrics['search_p95_ms'] = round(timings[94], 2)
        self.check('100 searches at concurrency 8 preserve retrieval eligibility')
        status = Path(f'/proc/{self.kernel.pid}/status').read_text()
        for line in status.splitlines():
            if line.startswith(('VmRSS:', 'VmHWM:')):
                key, value, *_ = line.split()
                self.metrics[key.rstrip(':') + '_KiB'] = int(value)
        self.metrics['state_bytes'] = self.db.stat().st_size
        self.stop()
        doctor = json.loads(subprocess.check_output([self.binary, '--db', str(self.db), 'doctor'], env=self.env))
        self.check('SQLite integrity and ledger chain validate after all crashes', doctor['sqlite'] == 'ok')
        backup = self.dir / 'snapshot.sqlite'
        subprocess.check_output([self.binary, '--db', str(self.db), 'backup', str(backup)], env=self.env)
        restored = json.loads(subprocess.check_output([self.binary, '--db', str(backup), 'doctor'], env=self.env))
        self.check('SQLite backup restores a valid ledger and database', restored['sqlite'] == 'ok')
        return {'profile': 'development', 'architecture': platform.machine(), 'platform': platform.platform(), 'checks_passed': len(self.checks), 'checks': self.checks, 'metrics': self.metrics, 'phone_measurement': False, 'model_execution': False}

    def close(self):
        self.stop()
        if self.sim and self.sim.poll() is None:
            self.sim.terminate()
            self.sim.wait(timeout=5)
        for log in self.logs:
            log.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--binary', type=Path, default=ROOT / 'target/debug/aksarad')
    parser.add_argument('--documents', type=int, default=200)
    parser.add_argument('--output', type=Path, default=ROOT / 'stress-results.json')
    parser.add_argument('--keep', action='store_true', help='retain temporary process logs/database for debugging; contains fixture credentials')
    args = parser.parse_args()
    if not 1 <= args.documents <= 5000:
        parser.error('documents must be in 1..5000')
    directory = tempfile.mkdtemp(prefix='aksara-stress-')
    harness = Harness(directory, args.binary.resolve())
    succeeded = False
    try:
        result = harness.run(args.documents)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result['metrics'], indent=2))
        print(f'{result["checks_passed"]} checks passed; report: {args.output}')
        succeeded = True
    finally:
        harness.close()
        if args.keep or not succeeded:
            print(f'Fixture logs: {directory} (private development data)')
        else:
            import shutil
            shutil.rmtree(directory)


if __name__ == '__main__':
    main()
