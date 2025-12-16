# AI Forecasting Hackathon

Vite + React 18 + TypeScript SPA for immersive scenario forecasting with Gemini 2.5 Flash. Client-only data (localStorage + JSON import/export); deploy as a static bundle (Gemini App later).

## Quick Start
1. Open in the devcontainer (post-create installs deps and runs `scripts/hello.sh`).
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (development). AI Studio Build injects `GEMINI_API_KEY` per user in production.
3. `npm install`
4. `npm run dev` (root) — starts the webapp.
5. CLI one-turn run: `node packages/cli/dist/index.js --input-player player.jsonl --output-game-master gm.jsonl --output-state state.jsonl [--input-state state.jsonl] [--mock]`.
6. `npm run check` before handoff (builds engine, cli, webapp).

## Structure
- `packages/engine` — isomorphic timeline engine (shared types, validation, forecaster adapters).
- `packages/webapp` — main SPA (Vite + Tailwind) using the shared engine.
- `packages/cli` — minimal CLI on top of the engine.
- `packages/tools` — future helper packages.
- `docs/` — specs/design notes.
- `scripts/` — devcontainer + worktree helpers.
- `agent_docs/` — task quickrefs.

Full onboarding: `AGENTS.md`.
