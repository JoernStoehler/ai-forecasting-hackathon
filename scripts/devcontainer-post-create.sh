#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/workspaces/ai-forecasting-hackathon"

# Ensure various directories exist and are owned by the non-root user.

sudo mkdir -p \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"
sudo chown -R "$(id -u):$(id -g)" \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"
mkdir -p \
  "${HOME}/.cache/npm" \
  "${HOME}/.cache/vite" \
  "${HOME}/.cache/ms-playwright" \
  "${HOME}/.config/gh"

# Ensure the /workspaces/worktrees mount exists.
WORKTREES_DIR="/workspaces/worktrees"
if ! mountpoint -q "$WORKTREES_DIR" >/dev/null 2>&1; then
  echo "expected ${WORKTREES_DIR} to be a host  bind mount. Check devcontainer configuration." >&2
  exit 1
fi

# Claude Code CLI is assumed to be available in the environment.
# For local devcontainers, no additional setup is needed.
# For Claude Code web sessions, the CLI is provided by the platform.

# Preinstall Playwright browsers into mounted cache for e2e runs.
# OS-level Playwright deps are baked into the devcontainer image
# (see .devcontainer/Dockerfile). We only install Chromium here
# to keep post-create fast while still exercising the e2e path.
if command -v npx >/dev/null 2>&1; then
  npx playwright install chromium || true
fi

# Install dependencies via npm.
if [ -f "${REPO_ROOT}/package.json" ]; then
  cd "${REPO_ROOT}"
  npm install
fi

# Mandatory onboarding snapshot (repo map + sanity info).
bash -lc "${REPO_ROOT}/scripts/hello.sh"

echo "Devcontainer post-create setup complete."
