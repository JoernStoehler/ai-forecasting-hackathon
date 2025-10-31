#!/usr/bin/env bash
# Helper to allocate non-colliding ports per worktree and persist them in a registry file.
# Usage: source this file, then call ensure_ports "$ROOT_DIR"

PORTS_REGISTRY="${PORTS_REGISTRY:-$HOME/.ai-forecasting-hackathon/ports.tsv}"

_abs_path() {
  # portable canonical path
  (cd "$1" 2>/dev/null && pwd -P) || echo "$1"
}

_port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltnH | awk -v p=":$port" '$4 ~ p {found=1} END{exit !found}'
  elif command -v lsof >/dev/null 2>&1; then
    lsof -i TCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    # Best effort: try connecting
    (echo > /dev/tcp/127.0.0.1/$port) >/dev/null 2>&1
  fi
}

_next_free_port() {
  local start="$1"; shift
  local -A reserved=()
  for p in "$@"; do reserved[$p]=1; done
  local port="$start"
  while true; do
    if [[ -n "${reserved[$port]:-}" ]]; then port=$((port+1)); continue; fi
    if ! _port_in_use "$port"; then echo "$port"; return 0; fi
    port=$((port+1))
  done
}

ensure_ports() {
  local root="$1"
  local abs=$(_abs_path "$root")
  mkdir -p "$(dirname "$PORTS_REGISTRY")"

  local reg_line
  if [[ -f "$PORTS_REGISTRY" ]]; then
    reg_line=$(awk -v p="$abs" -F '\t' '$1==p {print; exit}' "$PORTS_REGISTRY")
  fi

  local docs="${DOCS_PORT:-}"
  local fe="${FRONTEND_PORT:-}"
  local be="${BACKEND_PORT:-}"

  if [[ -n "${reg_line:-}" && -z "$docs$fe$be" ]]; then
    # Use registry values if env overrides are not set
    IFS=$'\t' read -r _path docs fe be <<< "$reg_line"
  fi

  # Collect reserved ports from registry to avoid collision between worktrees
  local reserved=()
  if [[ -f "$PORTS_REGISTRY" ]]; then
    reserved=($(awk -F '\t' 'NR>1 {print $2" "$3" "$4}' "$PORTS_REGISTRY" 2>/dev/null))
  fi

  # Allocate as needed
  if [[ -z "$docs" ]]; then docs=$(_next_free_port 8000 "${reserved[@]}"); fi
  if [[ -z "$fe" ]]; then fe=$(_next_free_port 5173 "${reserved[@]}"); fi
  if [[ -z "$be" ]]; then be=$(_next_free_port 8080 "${reserved[@]}"); fi

  export DOCS_PORT="$docs" FRONTEND_PORT="$fe" BACKEND_PORT="$be"

  # Persist mapping (update existing or append)
  if [[ -n "${reg_line:-}" ]]; then
    # update line
    awk -v p="$abs" -v d="$docs" -v f="$fe" -v b="$be" -F '\t' 'BEGIN{OFS="\t"} {if($1==p){$2=d;$3=f;$4=b} print}' \
      "$PORTS_REGISTRY" > "${PORTS_REGISTRY}.tmp" && mv "${PORTS_REGISTRY}.tmp" "$PORTS_REGISTRY"
  else
    # append new mapping
    if [[ ! -s "$PORTS_REGISTRY" ]]; then echo -e "# path\tdocs\tfrontend\tbackend" >> "$PORTS_REGISTRY"; fi
    echo -e "$abs\t$docs\t$fe\t$be" >> "$PORTS_REGISTRY"
  fi
}
