# Devcontainer Rebuild
<!-- REVIEW: confirm mount list matches host setup. -->
- Host mounts expected:
  - `/srv/devhome/.codex -> /home/vscode/.codex`
  - `/srv/devhome/.config/gh -> /home/vscode/.config/gh`
  - `/srv/devhome/.bash_history_dir -> /home/vscode/.bash_history_dir`
  - `/srv/devhome/.cache/npm -> /home/vscode/.cache/npm`
  - `/srv/devhome/.cache/vite -> /home/vscode/.cache/vite`
  - `/srv/devhome/.cache/ms-playwright -> /home/vscode/.cache/ms-playwright`
  - `/srv/devworktrees/ai-forecasting-hackathon/worktrees -> /workspaces/worktrees`
  - `/srv/devworktrees/ai-forecasting-hackathon/shared -> /workspaces/worktrees/shared`
- Rebuild: VS Code "Dev Containers: Rebuild and Reopen in Container" (or `devcontainer up`).
- Post-create hook: `scripts/devcontainer-post-create.sh` asserts mounts, seeds `.env.local` if missing, installs npm deps, and runs `scripts/hello.sh`.
