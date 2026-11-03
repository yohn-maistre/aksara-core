#!/usr/bin/env python3
"""Assemble a native Windows development bundle on a Windows CI runner."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--binary', type=Path, required=True)
    parser.add_argument('--node', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--keep-directory', action='store_true', help='Keep the compact runtime directory for the desktop installer')
    args = parser.parse_args()
    for file in [args.binary, args.node, args.node.parent / 'LICENSE', ROOT / 'apps/platform/dist/index.html']:
        if not file.is_file():
            parser.error(f'missing required package input: {file}')
    if subprocess.check_output([str(args.node), '--version'], text=True).strip() != 'v24.19.0':
        parser.error('the bundled Node runtime must be 24.19.0')
    args.output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='aksara-windows-') as temporary:
        bundle = Path(temporary) / 'aksara-windows-x64'
        # Bundle only reachable backend code. The PWA is already compiled;
        # copying frontend node_modules made the old archive needlessly large.
        subprocess.run([str(args.node), str(ROOT / 'scripts/build_host.mjs'), str(bundle)],
                       cwd=ROOT, check=True)
        for name in ['packs', 'python', 'third_party']:
            shutil.copytree(ROOT / name, bundle / name, dirs_exist_ok=True,
                            ignore=shutil.ignore_patterns('node_modules', '*.test.mjs', '__pycache__'))
        metadata = json.loads(subprocess.check_output(['cargo', 'metadata', '--locked', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc'], cwd=ROOT))
        licenses = bundle / 'third_party/rust'
        licenses.mkdir()
        records = []
        used = {node['id'] for node in metadata['resolve']['nodes']}
        for package in metadata['packages']:
            if package['id'] not in used or not package['source']:
                continue
            source = Path(package['manifest_path']).parent
            destination = licenses / (package['name'] + '-' + package['version'])
            files = {f for pattern in ['LICENSE*', 'COPYING*', 'COPYRIGHT*', 'NOTICE*', 'license*'] for f in source.glob(pattern) if f.is_file()}
            if package.get('license_file'):
                files.add(source / package['license_file'])
            for file in files:
                if file.is_file():
                    destination.mkdir(exist_ok=True)
                    shutil.copy2(file, destination / file.name)
            records.append({'name': package['name'], 'version': package['version'], 'license': package['license'], 'repository': package.get('repository')})
        (licenses / 'inventory.json').write_text(json.dumps(records, indent=2))
        shutil.copytree(ROOT / 'apps/platform/dist', bundle / 'apps/platform/dist')
        shutil.copy2(ROOT / 'scripts/device_simulator.py', bundle / 'scripts/device_simulator.py')
        for name in ['LICENSE', 'NOTICE', 'package.json']:
            shutil.copy2(ROOT / name, bundle / name)
        (bundle / 'bin').mkdir()
        shutil.copy2(args.binary, bundle / 'bin/aksarad.exe')
        shutil.copy2(args.node, bundle / 'bin/node.exe')
        shutil.copy2(args.node.parent / 'LICENSE', bundle / 'bin/NODE-LICENSE')
        # A pinned native driver needs no Docker/WSL. Installing it grants no
        # desktop access: connection/expiry/action permissions stay explicit.
        driver_archive = Path(temporary) / 'agent-desktop.tar.gz'
        urllib.request.urlretrieve('https://github.com/vercel-labs/agent-desktop/releases/download/v1.0.2/agent-desktop-v1.0.2-x86_64-pc-windows-msvc.tar.gz', driver_archive)
        if hashlib.sha256(driver_archive.read_bytes()).hexdigest() != '2186c76e7df197c0e67365e45d36d869f74714c56bb8a73817e2a66f3e18e222':
            parser.error('native desktop archive checksum mismatch')
        with tarfile.open(driver_archive) as archive:
            entries = [entry for entry in archive.getmembers() if entry.name == 'agent-desktop.exe' and entry.isfile()]
            if len(entries) != 1:
                parser.error('native desktop archive layout changed')
            (bundle / 'bin/agent-desktop.exe').write_bytes(archive.extractfile(entries[0]).read())
        driver = json.loads(subprocess.check_output([str(bundle / 'bin/agent-desktop.exe'), 'version'], text=True))
        if driver.get('version') != '2.5' or driver.get('data', {}).get('version') != '1.0.2':
            parser.error('native desktop binary version mismatch')
        (bundle / 'aksara.cmd').write_text('@echo off\r\n"%~dp0bin\\node.exe" --use-env-proxy "%~dp0scripts\\aksara.mjs" %*\r\n', newline='')
        (bundle / 'README-WINDOWS.txt').write_text(
            'Aksara compact Windows development bundle\n\n'
            'Extract the entire ZIP. In PowerShell: .\\aksara.cmd setup\n'
            'Keep that terminal open. The browser uses http://127.0.0.1:7341.\n'
            'Diagnostics: .\\aksara.cmd doctor --json\n'
            'Stop: .\\aksara.cmd stop\n'
            'Chat: .\\aksara.cmd chat "Hello"\n'
            'Hosted chat: select --provider and explicitly add --cloud-consent.\n'
            'Connect ChatGPT or provider keys in the local PWA setup first.\n\n'
            'No Docker, WSL, Rust toolchain, npm install or Python is required.\n'
            'Only the optional --simulator worker requires Python on PATH.\n'
            'Data: %LOCALAPPDATA%\\Aksara. Personal and community stores are separate.\n'
            'This has a development identity chooser, not production enrollment.\n'
            'The bundle is unsigned. Windows 10/11 and the Surface hardware still\n'
            'need device-specific qualification; hosted providers need network access.\n'
            'Model weights, Office converters and voice runtimes are not bundled.\n'
            'Database backups do not by themselves export provider credentials.\n', encoding='utf8')
        target = args.output / 'aksara-windows-x64.zip'
        # Some npm artifacts use the Unix epoch for reproducible timestamps;
        # ZIP starts at 1980. Clamp metadata instead of failing the distribution.
        with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, strict_timestamps=False) as archive:
            for file in sorted(bundle.rglob('*')):
                if file.is_file():
                    archive.write(file, file.relative_to(bundle.parent))
        files = [p for p in bundle.rglob('*') if p.is_file()]
        metrics = {'files': len(files), 'uncompressed_bytes': sum(p.stat().st_size for p in files),
                   'archive_bytes': target.stat().st_size}
        (args.output / 'windows-package-metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
        if args.keep_directory:
            destination = args.output / bundle.name
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(bundle, destination)
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        (args.output / 'SHA256SUMS-windows.txt').write_text(f'{digest}  {target.name}\n')
        print(json.dumps({'archive': str(target), 'sha256': digest, **metrics}))


if __name__ == '__main__':
    main()
