#!/usr/bin/env bash
set -euo pipefail

# guard.sh — run a command with a hard timeout and kill its entire process group on timeout.
# Usage:
#   TIMEOUT=15s guard -- <command> [args...]
#   TIMEOUT=15s bash scripts/guard.sh -- <command> [args...]
# Also supports legacy flag: --timeout <seconds|Ns|Nms>
# Default timeout: 30s if TIMEOUT not provided

to_str="${TIMEOUT:-30s}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --timeout)
      shift; to_str="${1:-$to_str}"; shift || true;;
    --) shift; break;;
    *) break;;
  esac
done

if [[ $# -eq 0 ]]; then
  echo "guard.sh: no command provided" >&2
  exit 2
fi

# Parse timeout into seconds (integer) for sleep
parse_timeout() {
  local s="$1"
  if [[ "$s" =~ ^[0-9]+$ ]]; then echo "$s"; return; fi
  if [[ "$s" =~ ^([0-9]+)s$ ]]; then echo "${BASH_REMATCH[1]}"; return; fi
  if [[ "$s" =~ ^([0-9]+)ms$ ]]; then local ms=${BASH_REMATCH[1]}; echo $(( (ms+999)/1000 )); return; fi
  echo 30
}

to_secs=$(parse_timeout "$to_str")

# Start command in its own process group so we can kill the whole tree
if command -v setsid >/dev/null 2>&1; then
  setsid "$@" &
else
  "$@" &
fi
cmd_pid=$!

# Get process group id; if not available, fallback to pid
pgid=$(ps -o pgid= "$cmd_pid" 2>/dev/null | tr -d ' ' || true)
pgid=${pgid:-$cmd_pid}

# Sentinel to detect timeout path
sentinel="$(mktemp -t guard_timeout.XXXXXX)"
rm -f "$sentinel"

# Killer that enforces timeout on the whole process group
(
  sleep "$to_secs"
  if kill -0 "$cmd_pid" 2>/dev/null; then
    echo "[guard] timeout ${to_str} exceeded; terminating PGID $pgid (PID $cmd_pid)" >&2
    : > "$sentinel"
    kill -TERM -"$pgid" 2>/dev/null || kill -TERM "$cmd_pid" 2>/dev/null || true
    sleep 2
    kill -KILL -"$pgid" 2>/dev/null || kill -KILL "$cmd_pid" 2>/dev/null || true
  fi
) & killer_pid=$!

# Wait for command and then stop killer
wait "$cmd_pid" 2>/dev/null || true
status=$?
kill "$killer_pid" 2>/dev/null || true
wait "$killer_pid" 2>/dev/null || true

# If timeout sentinel exists, return 124
if [[ -f "$sentinel" ]]; then
  rm -f "$sentinel"
  exit 124
fi

exit "$status"
