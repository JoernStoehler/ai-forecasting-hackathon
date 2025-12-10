# AI Forecasting Hackathon

Vite + React 19 + TypeScript SPA for immersive scenario forecasting with Gemini 2.5 Flash. Client-only data (localStorage + JSON import/export); deploy as a static bundle (Gemini App later).

## Quick Start
1. Open in the devcontainer (post-create installs deps and runs `scripts/hello.sh`).
2. Add `.env.local` with `GEMINI_API_KEY` (+ optional `TAVILY_API_KEY` for CLI MCPs).
3. `npm install`
4. `npm run dev` (root) — start in a dedicated terminal.
5. `npm run check` before handoff.

## Structure
- `packages/webapp` — main SPA (Vite + Tailwind).
- `packages/tools` — future helper packages.
- `docs/` — specs/design notes.
- `scripts/` — devcontainer + worktree helpers.
- `agent_docs/` — task quickrefs.

Full onboarding: `AGENTS.md`.
