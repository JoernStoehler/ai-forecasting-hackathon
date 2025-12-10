# Add a Git Worktree
# Add a Git Worktree
<!-- REVIEW: check paths/flags align with your preferred workflow. -->
- Create: `scripts/worktree-new.sh <path> <branch>` (add `--force` to skip clean/up-to-date checks).
- Remove: `scripts/worktree-remove.sh <path> [--force]`.
- Worktrees mount at `/workspaces/worktrees` in the container (`/srv/devworktrees/ai-forecasting-hackathon/worktrees` on host).
