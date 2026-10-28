#!/usr/bin/env python3
"""Collect installed npm package declarations and license files for an artifact.

This is an inventory, not a legal compatibility determination. No runtime stores,
credentials or model weights are included. Run npm ci before collecting.
"""
import argparse
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]


def collect(destination):
    destination.mkdir(parents=True, exist_ok=True)
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    records = []
    for location, entry in lock['packages'].items():
        if not location or entry.get('link') or 'node_modules/' not in location:
            continue
        package = ROOT / location
        if not (package / 'package.json').is_file():
            continue
        metadata = json.loads((package / 'package.json').read_text())
        name = metadata.get('name', location.rsplit('node_modules/', 1)[-1])
        version = metadata.get('version', entry.get('version'))
        folder = destination / (name.replace('/', '__').replace('@', '') + '-' + str(version))
        included = []
        for file in sorted(package.iterdir()):
            if file.is_file() and file.name.lower().startswith(('license', 'copying', 'notice', 'copyright')):
                folder.mkdir(exist_ok=True)
                shutil.copy2(file, folder / file.name)
                included.append(file.name)
        records.append(dict(name=name, version=version, license=metadata.get('license', entry.get('license')), files=included))
    (destination / 'inventory.json').write_text(json.dumps(records, indent=2) + '\n')
    return records


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    print(f'Collected {len(collect(args.output))} installed npm package declarations')
