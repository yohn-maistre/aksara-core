#!/usr/bin/env python3
"""Package a built host with offline simulator/runtime sources and dependency notices."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--binary', type=Path, required=True)
    parser.add_argument('--target', required=True, choices=['x86_64-unknown-linux-musl', 'aarch64-unknown-linux-musl'])
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    if not args.binary.is_file():
        parser.error('binary does not exist')
    metadata = json.loads(subprocess.check_output(['cargo', 'metadata', '--locked', '--format-version', '1', '--filter-platform', args.target], cwd=ROOT))
    args.output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='aksara-package-') as temp:
        bundle = Path(temp) / ('aksara-' + args.target)
        (bundle / 'bin').mkdir(parents=True)
        shutil.copy2(args.binary, bundle / 'bin/aksarad')
        (bundle / 'bin/aksarad').chmod(0o755)
        for name in ['LICENSE', 'NOTICE', 'README.md', 'AGENTS.md', 'Cargo.toml', 'Cargo.lock', 'rust-toolchain.toml', 'package.json', 'package-lock.json']:
            shutil.copy2(ROOT / name, bundle / name)
        for name in ['scripts/dev.py', 'scripts/device_simulator.py', 'scripts/stress.py', 'scripts/browser_smoke.py']:
            destination = bundle / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, destination)
        for name in ['python', 'packages/runtime-pi', 'tests', 'docs', 'crates', 'services', 'apps']:
            shutil.copytree(ROOT / name, bundle / name, ignore=shutil.ignore_patterns('__pycache__'))
        notices = bundle / 'third-party'
        notices.mkdir()
        records = []
        used = {node['id'] for node in metadata['resolve']['nodes']}
        for package in metadata['packages']:
            if package['id'] not in used:
                continue
            if not package['source']:
                continue
            source = Path(package['manifest_path']).parent
            destination = notices / (package['name'] + '-' + package['version'])
            files = {f for pattern in ['LICENSE*', 'COPYING*', 'COPYRIGHT*', 'NOTICE*', 'license*'] for f in source.glob(pattern) if f.is_file()}
            if package.get('license_file'):
                files.add(source / package['license_file'])
            included = []
            for file in sorted(files):
                if file.exists() and file.is_file():
                    destination.mkdir(exist_ok=True)
                    shutil.copy2(file, destination / file.name)
                    included.append(file.name)
            records.append({'name': package['name'], 'version': package['version'], 'license': package['license'], 'repository': package.get('repository'), 'files': included})
        (notices / 'cargo-licenses.json').write_text(json.dumps(records, indent=2) + '\n')
        if any(not p['license'] and not p['files'] for p in records):
            raise RuntimeError('dependency without a declared license or license file')
        archive = args.output / (bundle.name + '.tar.gz')
        with tarfile.open(archive, 'w:gz') as output:
            output.add(bundle, arcname=bundle.name)
        print(archive)


if __name__ == '__main__':
    main()
