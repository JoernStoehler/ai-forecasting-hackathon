# AGENTS.md

<!-- EDIT ONLY WITH PROJECT OWNER APPROVAL -->

This document serves as Developer Documentation. 
It is read by all development codex agents.
It is not read by the forecasting agents.
The project owner is Jörn. His time is scarce, so please only ping him for decisions where you don't confidently know what he'll want, or for decisions that are marked as requiring his approval.
The project vision is documented in README.md.

## Tech Stack

<!-- EDIT WHENEVER THE TECH STACK CHANGES -->

- Frontend: Vite, React, TypeScript, TanStack Query, React Router v6, TailwindCSS, HeadlessUI
  - `frontend/`: Source code  
- Testing: Vitest, React Testing Library, Playwright
- Backend: Node, TypeScript, Express, Codex SDK
  - `backend/`: Source code
- Dev Environment: GitHub Codespaces, bash scripts
  - `scripts/`: Setup and run scripts
- Documentation: MkDocs
  - `AGENTS.md`: Developer Documentation (this file)
  - `CHANGELOG.md`: High-level project changelog
  - `docs/usage`: Human End User Documentation
  - `docs/project/`: Project Documentation (ADRs, roadmaps, etc.)
- Materials: Expert-written markdown and code snippets used by forecasting agents
  - `materials/expert-model/`: A Forecasting Model for AI x-risk written by Jörn
  - `materials/expert-examples/`: Expert-made inferences/forecasts to calibrate our agents against
  - `materials/prompts/`: Prompts for GPT-5 agents written by Jörn
  - `materials/code-snippets/`: Code snippets for symbolic calculations that GPT-5 can run

See also:
- docs/project/01-adr-tech-stack.md for the full, detailed tech stack with rationale.

## Quick Commands

<!-- EDIT WHENEVER SCRIPTS CHANGE -->

You are started in a git worktree (or the main worktree) inside a GitHub Codespace.
You can run the docs, frontend, and backend servers from your worktree using the following commands:

```
bash scripts/run.sh [--services <service> ...] [--actions <action> ...]
# returns the status and ports of all services
```

The available services are:
- `docs`: MkDocs documentation server
- `frontend`: WebApp frontend server
- `backend`: Backend server with agent scaffolding

The available actions are: `start, stop`.
To restart a service, run stop and then start as two separate commands.
To simply see the current status of all services, you can run `bash scripts/run.sh` without further arguments.

To expose local services via Cloudflare Tunnel, use the separate helper:
```
bash scripts/tunnel.sh [--actions <start|stop|status>]
# Requires prior `cloudflared login` (follow the browser flow and select your zone)
```

For quick non-blocking verification that agents can run the stack, use the health check:
```
bash scripts/health.sh
# Prints ports, service/tunnel status, and probes local + domain endpoints with short timeouts
```

To quickly explore the project, you can run:
```
tree -I 'node_modules' frontend backend materials scripts docs
```

## API Reference

<!-- EDIT WHENEVER THE BACKEND API CHANGES -->

The backend exposes a REST API at `http://localhost:<PORT>/api`, obtain the port from the quick commands above.
The main API endpoints are:
- `GET  /api/health`
- `GET  /api/forecast/<id>`: Get forecast metadata
- `POST /api/forecast/<id>`: Create or update forecast metadata
- `GET  /api/forecast/<id>/history`: Get all forecast events for a given forecast ID; array of events
- `POST /api/forecast/<id>/history`: Overwrite all forecast events for a given forecast ID
- SSE: `/api/forecast/<id>/stream`: Stream forecast events as Server-Sent Events (SSE)
- `POST /api/forecast/<id>/event`: Post a new forecast event
- `POST /api/actions/extend/<id>`: Extend a forecast by querying the forecasting agent on said forecast
- `GET  /api/actions/extend/<id>`: Get the status of the forecast extension action

For the concrete types, see `backend/src/types/`.

## Conventions

<!-- EDIT ONLY WITH PROJECT OWNER APPROVAL -->

- We prefer functional programming, with a thin imperative shell. Use `React.FC` etc.
- We use TypeScript strict mode.
- Before you commit, run `bash scripts/lint.sh` to lint and format your code.
- Before you push, run `bash scripts/test.sh` to run all tests.
- Since our project is small, we don't need coverage or tests everywhere.
- Use playwright MCP to inspect the frontend directly, no need to ask Jörn to take screenshots or test buttons manually.
- Use jsdoc and comments for major functions and types. Explain the why, not the what.
- Ergonomics is important, report to Jörn if your tools or the repo architecture don't work intuitively or slow you down in any way.
- When in doubt, prefer simplicity and clarity over cleverness or optimization.
- Write explicit, clear, unambiguous, non-magic code. Same for messages.
- Push back when Jörn makes a sloppy mistake, ask if he's not being clear enough.
- When you need to make a decision that affects the project direction, and you're not sure what Jörn would want, ask him.
- Ask when documentation is missing or is written unclearly. We want the codebase and repo to be self-explanatory and trivial to onboard to.
- We use Vibe-Kanban for managing tickets and spawning vibecoding agents. The ticket is copied into the agent's first user message. They are started in a provisioned git worktree.
- Sometimes Jörn starts a 1:1 chat with a coding agent in the `main` worktree, in which case no assigned ticket exists.
- VibeKanban manages the worktrees. Unless Jörn explicitly tells you, you don't need to commit, rebase, merge or push. VibeKanban automatically commits your work whenever you end your turn.
- We don't have nor need a GitHub CI, except to deploy the docs to GitHub Pages on push to origin/main.
