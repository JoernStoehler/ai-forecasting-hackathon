#!/usr/bin/env bash
set -euo pipefail

# Idempotent setup script for new worktrees (VibeKanban calls this).
# - Installs npm workspaces
# - Optionally installs Playwright browsers (RUN_PLAYWRIGHT=1)
# - Installs MkDocs deps for docs if Python/pip available
# - Installs global DevOps tools: @openai/codex CLI and cloudflared

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

echo "[install] Node: $(node -v 2>/dev/null || echo 'not found'), npm: $(npm -v 2>/dev/null || echo 'not found')"

if ! command -v node >/dev/null 2>&1; then
  echo "[install] ERROR: Node.js is required (>=20)." >&2
  exit 1
fi

# Install npm workspaces
echo "[install] Installing npm workspaces (root, frontend, backend)..."
npm install --silent

# Optional: Playwright browsers (heavy). Opt-in via RUN_PLAYWRIGHT=1
if [[ "${RUN_PLAYWRIGHT:-}" == "1" ]]; then
  if npx --yes @playwright/test --version >/dev/null 2>&1; then
    echo "[install] Installing Playwright browsers..."
    npx --yes playwright install --with-deps || npx --yes playwright install || true
  else
    echo "[install] Skipping Playwright browsers (package not installed)."
  fi
fi

# Docs dependencies (MkDocs Material)
if command -v python3 >/dev/null 2>&1; then
  if python3 -m pip --version >/dev/null 2>&1; then
    echo "[install] Installing docs requirements (mkdocs-material) via pip --user..."
    python3 -m pip install --user -r docs/requirements.txt || true
  else
    echo "[install] pip not available; skip docs deps. You can install with: python3 -m ensurepip --upgrade && python3 -m pip install --user -r docs/requirements.txt"
  fi
else
  echo "[install] Python3 not found; skipping docs deps."
fi

# Global: @openai/codex CLI
if command -v codex >/dev/null 2>&1; then
  echo "[install] codex CLI already installed: $(codex --version 2>/dev/null || true)"
else
  echo "[install] Installing @openai/codex CLI globally..."
  npm install -g @openai/codex@latest || true
  if ! command -v codex >/dev/null 2>&1; then
    GLOBAL_BIN="$(npm prefix -g)/bin"
    echo "[install] codex not on PATH. You may need to add ${GLOBAL_BIN} to PATH, e.g.:" 
    echo "           echo 'export PATH=\"${GLOBAL_BIN}:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
  fi
fi

# First-time codex setup instructions (non-interactive in Codespaces)
echo "[install] To authenticate codex CLI:"
echo "           1) Run: codex"
echo "           2) Follow the link opened/printed."
echo "           3) If the browser redirects to a localhost URL, copy that URL"
echo "              and run: curl '<redirected-localhost-url>' inside this Codespace to finish auth."

# Global: cloudflared (download binary if missing)
if command -v cloudflared >/dev/null 2>&1; then
  echo "[install] cloudflared already installed: $(cloudflared --version 2>/dev/null | head -n1 || true)"
else
  echo "[install] Installing cloudflared (user-local) ..."
  OS="$(uname -s)"; ARCH="$(uname -m)"
  TARGET_OS="linux"; TARGET_ARCH="amd64"
  [[ "$OS" == "Linux" ]] || TARGET_OS="linux"
  case "$ARCH" in
    x86_64|amd64) TARGET_ARCH="amd64";;
    aarch64|arm64) TARGET_ARCH="arm64";;
  esac
  URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${TARGET_OS}-${TARGET_ARCH}"
  DEST_DIR="${HOME}/.local/bin"
  mkdir -p "$DEST_DIR"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" -o "$DEST_DIR/cloudflared" || true
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$DEST_DIR/cloudflared" "$URL" || true
  fi
  chmod +x "$DEST_DIR/cloudflared" 2>/dev/null || true
  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "[install] cloudflared installed to $DEST_DIR but not on PATH. Add to PATH, e.g.:"
    echo "           echo 'export PATH=\"${HOME}/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
  fi
fi

# Install guard wrapper to ~/.local/bin for convenience
GUARD_DEST="${HOME}/.local/bin"
mkdir -p "$GUARD_DEST"
install -m 0755 "$ROOT_DIR/scripts/guard.sh" "$GUARD_DEST/guard" || cp "$ROOT_DIR/scripts/guard.sh" "$GUARD_DEST/guard" && chmod +x "$GUARD_DEST/guard"
if ! command -v guard >/dev/null 2>&1; then
  echo "[install] guard installed to $GUARD_DEST but not on PATH. Add to PATH, e.g.:"
  echo "           echo 'export PATH=\"${HOME}/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
fi

echo "[install] Done. Next: bash scripts/run.sh --actions start --services frontend backend"
