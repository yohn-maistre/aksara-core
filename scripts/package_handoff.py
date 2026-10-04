#!/usr/bin/env python3
"""Export committed source/history and a phone release without private runtime state."""
import argparse
import hashlib
import io
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'aksara-core-handoff/'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--phone', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist/aksara-core-handoff.zip')
    args = parser.parse_args()
    if not args.phone.is_file():
        parser.error('phone release archive is missing')
    subprocess.run(['git', 'diff', '--exit-code', 'HEAD'], cwd=ROOT, check=True)
    source = subprocess.check_output(['git', 'archive', '--format=zip', 'HEAD'], cwd=ROOT)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sums = []
    with tempfile.TemporaryDirectory(prefix='aksara-handoff-') as temp:
        bundle = Path(temp) / 'aksara-core.git.bundle'
        subprocess.run(['git', 'bundle', 'create', str(bundle), 'main', 'HEAD'], cwd=ROOT, check=True)
        subprocess.run(['git', 'bundle', 'verify', str(bundle)], cwd=ROOT, check=True)
        with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as output:
            def add(name, data, mode=0o644):
                entry = zipfile.ZipInfo(PREFIX + name)
                entry.create_system = 3
                entry.external_attr = (0o100000 | mode) << 16
                entry.compress_type = zipfile.ZIP_DEFLATED
                output.writestr(entry, data)
                sums.append(hashlib.sha256(data).hexdigest() + '  ' + name)

            with zipfile.ZipFile(io.BytesIO(source)) as committed:
                for entry in committed.infolist():
                    if not entry.is_dir():
                        mode = (entry.external_attr >> 16) & 0o777 or 0o644
                        add('source/' + entry.filename, committed.read(entry), mode)
                add('HERMES_HANDOFF.md', committed.read('docs/handoff.md'))
            add(bundle.name, bundle.read_bytes())
            add(args.phone.name, args.phone.read_bytes())
            checksum = zipfile.ZipInfo(PREFIX + 'SHA256SUMS')
            checksum.create_system = 3
            checksum.external_attr = 0o100644 << 16
            output.writestr(checksum, '\n'.join(sums) + '\n')
    print(args.output)


if __name__ == '__main__':
    main()
