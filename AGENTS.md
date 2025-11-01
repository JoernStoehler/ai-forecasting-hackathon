# AGENTS.md

<!-- EDIT ONLY WITH PROJECT OWNER APPROVAL -->

This document serves as Developer Documentation. 
It is read by all development codex agents.
It is not read by the forecasting agents.
The project owner is Jörn. His time is scarce, so please only ping him for decisions where you don't confidently know what he'll want, or for decisions that are marked as requiring his approval.
The project vision is documented in README.md.

## Tech Stack

<!-- EDIT WHENEVER THE TECH STACK CHANGES -->

<edit>
- Frontend: Vite + React 19 + TypeScript rendered from `App.tsx`, with UI pieces in `components/` and shared types in `types.ts`.
- AI Runtime: Gemini 2.5 Flash via `@google/genai`; client wrapper lives in `services/geminiService.ts` with JSON schema enforcement.
- Data: Timeline seeds stored in `metadata.json`, constants in `constants.ts`.
- Tooling: Codex CLI + ripgrep provisioned through `npm run provision`; Vibe Kanban launcher exposed as `npm run vk`.
- Documentation: README.md and this AGENTS.md (MkDocs, backend, and materials directories are no longer part of the MVP).
</edit>

## Quick Commands

<!-- EDIT WHENEVER SCRIPTS CHANGE -->
<edit>
You start in a GitHub Codespace worktree. The `.devcontainer/devcontainer.json` image auto-runs `npm run provision` on creation; rerun manually if needed. Use this npm workflow instead of legacy bash scripts:

1. Install dependencies: `npm install`
2. Provision tools (installs ripgrep via `apt-get` and the Codex CLI globally): `npm run provision`
   - Provisioning also syncs secrets when the following Codespaces secrets are defined (values should be base64-encoded):
     - `CODEX_CONFIG_B64` ➝ `~/.codex/config`
     - `CODEX_AUTH_JSON_B64` ➝ `~/.codex/auth.json` (skipped if file already exists)
     - `ENV_LOCAL_B64` ➝ project `.env.local` (skipped if file already exists, otherwise placeholder `API_KEY=PLACEHOLDER`)
3. Authenticate the Codex CLI: run `codex`, complete the browser login, then `curl` the localhost callback URL
4. Provide local credentials: `echo "API_KEY=<your key>" >> .env.local`
5. Launch the dev server: `npm run dev` (Vite serves on port 5173 by default)
6. Spin up Vibe Kanban for ticket management if needed: `npm run vk` (binds to port 3000)

Provisioning requires sudo in the Codespace; rerun it anytime you suspect the CLI tools are missing.
</edit>

## API Reference

<!-- EDIT WHENEVER THE BACKEND API CHANGES -->
<edit>
There is no standalone backend service in this MVP. The React app calls Gemini 2.5 Flash directly through `services/geminiService.ts`, which:

- Submits timeline history as JSON via `ai.models.generateContent`.
- Enforces response shape with `responseSchema` so the UI receives a list of `{ date, icon, title, description }`.
- Performs light validation (e.g., ensuring generated dates do not regress).

If we add persistence or server-side orchestration later, document API endpoints here.
</edit>

## Conventions

<!-- EDIT ONLY WITH PROJECT OWNER APPROVAL -->
- We prefer functional programming, with a thin imperative shell. Use `React.FC` etc.
- <edit>TypeScript `strict` mode is enabled; keep types precise, and document any intentional `any` escapes when a safer alternative would slow delivery.</edit>
- <edit>No formal lint/test scripts exist yet; run `npx tsc --noEmit` and `npm run build` before handoff and call out any skipped checks.</edit>
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
