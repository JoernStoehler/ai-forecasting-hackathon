#!/usr/bin/env bash

set -euo pipefail

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
      echo "[provision] keep existing $target_path (preserve=true)"
      rm -f "$tmp_file"
      return 0
    fi

    mv "$tmp_file" "$target_path"
    chmod 600 "$target_path" || true
    echo "[provision] wrote $target_path from $secret_var"
  else
    if [ -f "$target_path" ]; then
      echo "[provision] $secret_var not set; kept existing $target_path"
    else
      if [ -n "$placeholder" ]; then
        printf "%s\n" "$placeholder" >"$target_path"
        chmod 600 "$target_path" || true
        echo "[provision] $secret_var not set; created placeholder $target_path"
      else
        echo "[provision] $secret_var not set; no action for $target_path"
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

[projects."/workspaces/ai-forecasting-hackathon"]
trust_level = "trusted"
EOF
  chmod 600 "$codex_dir/config.toml" || true
  write_from_secret "$codex_dir/auth.json" "CODEX_AUTH_JSON_B64" "" "true"
}

sync_env_local() {
  local env_path="$PROJECT_ROOT/.env.local"
  write_from_secret "$env_path" "ENV_LOCAL_B64" "API_KEY=PLACEHOLDER" "true"
}

main() {
  ensure_tools
  sync_codex_files
  sync_env_local
  echo "[provision] done"
}

main "$@"
