#!/usr/bin/env bash
set -euo pipefail

echo "Running unit tests (frontend/backend). Set RUN_E2E=1 for Playwright."

if npm run -w frontend test >/dev/null 2>&1; then
  npm run -w frontend test
fi

if npm run -w backend test >/dev/null 2>&1; then
  npm run -w backend test
fi

if [[ "${RUN_E2E:-}" == "1" ]]; then
  if npm run -w frontend -s test:e2e >/dev/null 2>&1; then
    npm run -w frontend test:e2e
  fi
fi

echo "Tests done."
