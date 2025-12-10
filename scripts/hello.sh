#!/usr/bin/env bash
set -euo pipefail

echo "[hello] pwd"
pwd

echo "[hello] git status -sb"
git status -sb || true

echo "[hello] compact tree"
python3 - <<'PY'
from pathlib import Path

root = Path('.')
max_depth = 3
skip = {'.git', 'node_modules', 'dist'}

def render(path: Path, depth: int = 0):
    if depth > max_depth:
        return
    name = path.name or '.'
    prefix = '  ' * depth
    print(f"{prefix}{name}/" if path.is_dir() else f"{prefix}{name}")
    if not path.is_dir() or path.name in skip:
        return
    for child in sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        if child.name in skip:
            continue
        render(child, depth + 1)

render(root.resolve())
PY
