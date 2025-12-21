# AGENTS.md
- Project: Jörn Stöhler's AI Forecasting Web Game
- Topic: A serious policy simulation game that lets the player explore Jörn Stöhler's model of AI x-risk and AI governance through interactive scenario timelines.
- Monorepo with
  - `packages/engine/`: the simulation engine, uses Gemini API for a game master AI
  - `packages/webapp/`: a Vite + React 18 + TypeScript SPA frontend that uses the engine under the hood
  - `packages/cli/`: a CLI frontend for the engine for testing and engine development
  - `.devcontainer/{Dockerfile,devcontainer.json}`, `scripts/devcontainer-post-create.sh`: The single development environment used by all agents the project owner. The environment is provided ready-to-use.
- Developers: project owner Jörn, codex agents.
- Project management: GitHub Issues and PRs, git worktrees for isolated environments.

## Onboarding
- Mandatory first step: run `bash -lc scripts/hello.sh` when you enter a fresh devcontainer/worktree; it prints the repo map and basic sanity info.
- We use progressive disclosure, agents can triage their own onboarding by reading files they find relevant to their task.
- Most information as always can be learned from the repo files themselves. Extra explicit information about workflows, conventions, and context can be found in `AGENTS.md`, `packages/*/AGENTS.md`, and `skills/public/`.
- Skills in `skills/public/` are the preferred place for reusable agent workflows and guidance.
- Convience scripts are in `scripts/` and `packages/*/scripts/`. They support `--help` for extra info.
- We loosely follow literate programming practices, so documentation of the codebase is in the code files.

## Communication with Project Owner
- Jörn is available for questions, especially questions about ambiguous phrasings and missing context.
- Jörn appreciates pushback when he writes something unclear, makes mistakes or suggests something suboptimal.
- Be direct, literal, and optimize for Jörn's time when you write a turn's final message. Structure your message to allow skimming. Use numbered lists to make referencing easier.
- Make direct, explicit requests for permissions, clarifications, reviews, feedback and decisions when needed.
- Use Jörn's time wisely. Don't delegate work to him that you can do yourself.
- Leave long-term thesis project management to Jörn, you can help but he has more experience with long-running academic projects.
