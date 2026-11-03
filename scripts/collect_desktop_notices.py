#!/usr/bin/env python3
"""Collect the desktop's resolved Rust license texts into two compact files."""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
manifest = ROOT / 'apps/desktop/src-tauri/Cargo.toml'
destination = ROOT / 'dist/aksara-windows-x64/third_party/desktop'
if not destination.parent.is_dir():
    raise SystemExit('Build the compact Windows runtime before collecting desktop notices')
metadata = json.loads(subprocess.check_output([
    'cargo', 'metadata', '--locked', '--format-version', '1', '--filter-platform',
    'x86_64-pc-windows-msvc', '--manifest-path', str(manifest)], cwd=ROOT))
used = {node['id'] for node in metadata['resolve']['nodes']}
records, texts = [], []
for package in sorted(metadata['packages'], key=lambda p: (p['name'], p['version'])):
    if package['id'] not in used or not package['source']:
        continue
    source = Path(package['manifest_path']).parent
    files = {f for pattern in ['LICENSE*', 'COPYING*', 'COPYRIGHT*', 'NOTICE*', 'license*']
             for f in source.glob(pattern) if f.is_file()}
    if package.get('license_file'):
        files.add(source / package['license_file'])
    included = []
    for file in sorted(files):
        if file.is_file():
            included.append(file.name)
            texts.append(f"\n===== {package['name']}@{package['version']} / {file.name} =====\n" +
                         file.read_text(encoding='utf8', errors='replace'))
    records.append({'name': package['name'], 'version': package['version'],
                    'license': package.get('license'), 'repository': package.get('repository'),
                    'files': included})
    if not package.get('license') and not included:
        raise SystemExit('Missing desktop dependency license: ' + package['name'])
destination.mkdir(parents=True, exist_ok=True)
(destination / 'NOTICE.txt').write_text('\n'.join(texts), encoding='utf8')
(destination / 'inventory.json').write_text(json.dumps(records, indent=2)+'\n', encoding='utf8')
print(f'Collected {len(records)} desktop Rust package declarations and their available license texts')
