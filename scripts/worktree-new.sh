#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: worktree-new.sh [--force] <path> <branch>

Creates a new worktree at <path> on <branch>, runs safety checks, and installs npm deps.
USAGE
}

force=false
if [[ ${1:-} == "--force" ]]; then
  force=true
  shift
fi

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 64
fi

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
path="$1"
branch="$2"

cd "$repo_root"

git fetch --all --prune || true

if ! $force; then
  if git status --short | grep -q .; then
    echo "[error] main worktree dirty; rerun with --force to proceed" >&2
    exit 1
  fi
  if git rev-parse --verify main >/dev/null 2>&1 && git rev-parse --verify origin/main >/dev/null 2>&1; then
    behind=$(git rev-list --count main..origin/main || echo 0)
    if [[ "$behind" != "0" ]]; then
      echo "[error] main is behind origin/main by ${behind} commits; pull or use --force" >&2
      exit 1
    fi
  fi
fi

git worktree add "$path" "$branch"

cd "$path"

if command -v npm >/dev/null 2>&1; then
  npm install
fi

echo "Worktree ready at $path"
echo "Next: cd $path"
