#!/usr/bin/env bash
set -euo pipefail

echo "Linting frontend and backend (if configured)..."

run_pkg() {
  local ws="$1"
  if npm run -w "$ws" >/dev/null 2>&1; then
    npm run -w "$ws" lint || true
    if npm run -w "$ws" format:check >/dev/null 2>&1; then
      npm run -w "$ws" format:check || true
    fi
  fi
}

run_pkg frontend
run_pkg backend

echo "Lint done."

