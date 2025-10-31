---
title: Troubleshooting Codex CLI Shell Timeouts
---

This note captures a freeze-up scenario when running long-lived or child-spawning commands via the Codex CLI shell tool.

Problem
- The Codex CLI shell tool (the one our agent uses to run commands) accepts a `timeout_ms` parameter.
- When the timeout elapses, it kills the parent process and then waits for all stdio streams to close.
- If the killed parent left behind child processes that continue to hold or write to stdout/stderr, those streams never close and the tool call never terminates. The agent then hangs until someone manually intervenes.

Minimal Reproduction (examples)
- Bad (hangs the call; do not run in production):
  - Example code (not shipped as a script to avoid confusion):
    ```bash
    echo "bad:start"
    ( while true; do echo "bad:ping"; sleep 0.1; done ) &
    echo "bad:done"
    # The background child keeps writing to inherited stdout; caller never finishes.
    ```
- Good (returns instantly):
  - Detach child and redirect stdio:
    ```bash
    if command -v setsid >/dev/null 2>&1; then
      setsid bash -lc 'while true; do echo good:ping; sleep 0.1; done' \
        >> logs/minimal-good.log 2>&1 < /dev/null &
    else
      nohup bash -lc 'while true; do echo good:ping; sleep 0.1; done' \
        >> logs/minimal-good.log 2>&1 < /dev/null &
    fi
    ```

Guidelines
- Never let long-lived background services inherit the agent’s stdout/stderr. Always redirect to log files and background them, then exit the script quickly.
- Prefer short, non-interactive commands for the shell tool. Avoid pipelines that spawn daemons implicitly.
- For operations that may hang or spawn their own children, wrap them with our guard script.

Guard Script
- `scripts/guard.sh` runs a command with a hard timeout and kills its entire process group on timeout.
- Usage (preferred): `TIMEOUT=15s guard -- <command> [args...]` (installed to `~/.local/bin/guard` by `scripts/install.sh`).
- Fallback: `TIMEOUT=15s bash scripts/guard.sh -- <command> [args...]`.
- Also supports legacy flag: `--timeout 15s`.
- Implementation creates a new process group (`setsid` if available), waits up to the timeout, and sends `TERM` then `KILL` to the whole group.

Our Scripts (Safe-by-default)
- `scripts/run.sh` starts services in the background with stdout/stderr redirected to `logs/*.log` and saves PIDs in `.pids/`. It prints status/ports and returns immediately.
- `scripts/tunnel.sh` backgrounds `cloudflared` with logs and uses the guard script for the DNS route operation to guarantee it won’t hang.
- `scripts/ports.sh` ensures each worktree uses non-colliding ports and that every `run.sh` invocation prints the selected ports.

If a freeze happens
- Inspect logs: `logs/*.log`.
- Check status: `bash scripts/run.sh` and `bash scripts/tunnel.sh --actions status`.
- Kill by port if needed: `lsof -iTCP:<port> -sTCP:LISTEN` then `kill <pid>` (our scripts also try to clean up on stop).
