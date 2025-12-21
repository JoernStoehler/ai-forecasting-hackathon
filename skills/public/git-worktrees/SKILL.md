---
name: git-worktrees
description: Create, list, and remove git worktrees for parallel agent work. Use when you need isolated workdirs, new worktree branches, or safe cleanup workflows.
---

# Git Worktrees

## Use the project scripts

- Create: `scripts/worktree-new.sh <path> <branch> [--force]`
- Remove: `scripts/worktree-remove.sh <path> [--force]`
- List: `git worktree list`

## Notes

- The scripts validate the repo state and install npm deps after creation.
- Use `--force` only when you understand the safety checks you are bypassing.
