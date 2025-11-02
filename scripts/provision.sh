#!/usr/bin/env bash

set -euo pipefail

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PERSIST_ROOT="$PROJECT_ROOT/.persist"

ensure_tools() {
  if have_cmd rg; then
    echo "[provision] ripgrep present"
  else
    if have_cmd apt-get; then
      echo "[provision] installing ripgrep via apt-get (sudo)"
      sudo apt-get update -y
      sudo apt-get install -y ripgrep
    else
      echo "[provision] ripgrep missing and no apt-get; install manually" >&2
    fi
  fi

  if have_cmd codex; then
    echo "[provision] codex CLI present"
  else
    if have_cmd npm; then
      echo "[provision] installing @openai/codex CLI globally"
      npm install -g @openai/codex
    else
      echo "[provision] npm missing; cannot install codex CLI" >&2
    fi
  fi
}

# Ensure a path is a symlink to a persisted directory inside the workspace.
# Usage: ensure_persist_link <link_path> <persist_dir>
ensure_persist_link() {
  local link_path="$1"
  local persist_dir="$2"

  mkdir -p "$persist_dir"
  mkdir -p "$(dirname "$link_path")"

  if [ -L "$link_path" ]; then
    local current_target
    current_target="$(readlink -f "$link_path" 2>/dev/null || readlink "$link_path" 2>/dev/null || echo)"
    if [ "$current_target" = "$persist_dir" ]; then
      echo "[provision] already linked: $link_path -> $persist_dir"
      return 0
    else
      echo "[provision] relinking $link_path to $persist_dir"
      rm -f "$link_path"
    fi
  elif [ -e "$link_path" ]; then
    # Migrate existing content into persist_dir if empty
    if [ -d "$link_path" ] && [ -z "$(ls -A "$persist_dir" 2>/dev/null)" ]; then
      echo "[provision] migrating existing $(basename "$link_path") to persisted dir"
      shopt -s dotglob nullglob
      mv "$link_path"/* "$persist_dir"/ 2>/dev/null || true
      shopt -u dotglob nullglob
    fi
    rm -rf "$link_path"
  fi

  ln -sfn "$persist_dir" "$link_path"
  echo "[provision] linked $link_path -> $persist_dir"
}

setup_persistence() {
  mkdir -p "$PERSIST_ROOT"

  local codex_persist="$PERSIST_ROOT/codex"
  local vibe_data_persist="$PERSIST_ROOT/vibe-kanban-data"
  local vibe_worktrees_persist="$PERSIST_ROOT/vibe-kanban-worktrees"

  ensure_persist_link "$HOME/.codex" "$codex_persist"
  ensure_persist_link "$HOME/.local/share/vibe-kanban" "$vibe_data_persist"

  mkdir -p /var/tmp/vibe-kanban
  ensure_persist_link "/var/tmp/vibe-kanban/worktrees" "$vibe_worktrees_persist"
}

sync_env_local_from_env() {
  local env_path="$PROJECT_ROOT/.env.local"
  local key_val="${GEMINI_API_KEY:-}"

  if [ -n "$key_val" ]; then
    printf "GEMINI_API_KEY=%s\n" "$key_val" > "$env_path"
    chmod 600 "$env_path" || true
    echo "[provision] wrote .env.local from GEMINI_API_KEY env secret"
  else
    if [ -f "$env_path" ]; then
      echo "[provision] GEMINI_API_KEY not set; kept existing .env.local"
    else
      printf "GEMINI_API_KEY=PLACEHOLDER\n" > "$env_path"
      chmod 600 "$env_path" || true
      echo "[provision] GEMINI_API_KEY not set; created placeholder .env.local"
    fi
  fi
}

main() {
  ensure_tools
  setup_persistence
  # No codex config generation; persisted folder keeps state
  sync_env_local_from_env
  echo "[provision] done"
}

main "$@"
