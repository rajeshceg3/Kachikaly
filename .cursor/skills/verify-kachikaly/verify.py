#!/usr/bin/env python3
"""Verification runner for Kachikaly. See SKILL.md."""
import json, os, re, subprocess, sys, time
from pathlib import Path
REPO = Path(__file__).resolve().parents[3]
APP = REPO / 'app'
failures = []
def check(name, ok, detail=''):
    print(('PASS' if ok else 'FAIL'), name, (':: ' + str(detail))[:400] if detail else '')
    if not ok: failures.append(name)
def run(cmd, **kw):
    return subprocess.run(cmd, cwd=APP, capture_output=True, text=True, timeout=900, **kw)
def main():
    if not (APP / 'node_modules').is_dir():
        check('npm install', run(['npm', 'install', '--no-audit', '--no-fund']).returncode == 0)
    proc = run(['npx', 'vitest', 'run'])
    tail = re.sub(r'\x1b\[[0-9;]*m', '', proc.stdout + proc.stderr)
    m = re.search(r'Tests\s+(\d+) passed', tail)
    check('vitest suites (22 tests)', proc.returncode == 0 and m, tail[-300:])
    proc = run(['npx', 'playwright', 'test', '--project=chromium'])
    tail = re.sub(r'\x1b\[[0-9;]*m', '', proc.stdout + proc.stderr)
    check('playwright journey e2e (chromium: exploration reveal, idle cursor)', proc.returncode == 0 and ' failed' not in tail and 'passed' in tail, tail[-300:])
    print('FAILURES=%d' % len(failures))
    with open(REPO / '.cursor/skills/verify-kachikaly/evidence.json', 'w') as f:
        json.dump({'repo': 'Kachikaly', 'ts': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'failures': failures}, f, indent=2)
    return 1 if failures else 0
if __name__ == '__main__':
    sys.exit(main())
