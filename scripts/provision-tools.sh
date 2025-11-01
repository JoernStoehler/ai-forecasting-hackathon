#!/usr/bin/env bash

set -euo pipefail

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ensure_tools() {
  if have_cmd rg; then
    echo "ripgrep already installed"
  else
    if ! have_cmd apt-get; then
      cat >&2 <<'EOF'
This codespace is missing apt-get. Please install ripgrep manually and rerun.
EOF
      exit 1
    fi
    echo "Installing ripgrep via apt-get (requires sudo)..."
    sudo apt-get update -y
    sudo apt-get install -y ripgrep
  fi

  if have_cmd codex; then
    echo "codex CLI already installed"
  else
    if ! have_cmd npm; then
      cat >&2 <<'EOF'
npm is not available; cannot install @openai/codex CLI.
EOF
      exit 1
    fi
    echo "Installing @openai/codex CLI globally..."
    npm install -g @openai/codex
  fi
}

write_from_secret() {
  local target_path="$1"
  local secret_var="$2"
  local placeholder="$3"
  local preserve_existing="$4"

  local secret_value="${!secret_var:-}"
  local target_dir
  target_dir="$(dirname "$target_path")"
  mkdir -p "$target_dir"

  if [ -n "$secret_value" ]; then
    local tmp_file
    tmp_file="$(mktemp)"
    if echo "$secret_value" | base64 --decode >"$tmp_file" 2>/dev/null; then
      :
    else
      printf "%s" "$secret_value" >"$tmp_file"
    fi

    if [ "$preserve_existing" = "true" ] && [ -f "$target_path" ]; then
      echo "Skipping $target_path – file exists and preserve flag is set."
      rm -f "$tmp_file"
      return 0
    fi

    mv "$tmp_file" "$target_path"
    chmod 600 "$target_path"
    echo "Wrote $target_path from secret $secret_var."
  else
    if [ -f "$target_path" ]; then
      echo "Secret $secret_var not set – leaving existing $target_path as-is."
    else
      if [ -n "$placeholder" ]; then
        printf "%s\n" "$placeholder" >"$target_path"
        chmod 600 "$target_path"
        echo "Secret $secret_var not set – created placeholder at $target_path."
      else
        echo "Secret $secret_var not set – no action for $target_path."
      fi
    fi
  fi
}

sync_codex_files() {
  local codex_dir="$HOME/.codex"
  mkdir -p "$codex_dir"

  cat >"$codex_dir/config.toml" <<'EOF'
model = "gpt-5"
model_reasoning_effort = "high"

[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]

[mcp_servers.vibe_kanban]
command = "npx"
args = ["-y", "vibe-kanban@latest", "--mcp"]

[projects."/workspaces/ai-forecasting-hackathon"]
trust_level = "trusted"
EOF
  chmod 600 "$codex_dir/config.toml"
  write_from_secret "$codex_dir/auth.json" "CODEX_AUTH_JSON_B64" "" "true"
}

sync_env_local() {
  local env_path="$PROJECT_ROOT/.env.local"
  write_from_secret "$env_path" "ENV_LOCAL_B64" "API_KEY=PLACEHOLDER" "true"
}

main() {
  ensure_tools
  echo "Tool provisioning completed."

  sync_codex_files
  sync_env_local
  echo "Secret material sync completed."
}

main "$@"
