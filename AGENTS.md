<!-- EDIT THIS FILE ONLY WITH OWNER APPROVAL -->
<!-- THE WORDING HAS BEEN CAREFULLY TWEAKED AND SHOULD NOT BE CASUALLY CHANGED -->

# AGENTS.md

This handbook is the definitive onboarding for development agents. Forecasting agents ignore it; human contributors may skim it or have an AI walk them through it. Assume the owner remembers none of your past work, minimize pings, and always package decisions with pros/cons/alternatives. The vision statement itself lives in `README.md`.

The web app deploys through AI Studio / Gemini App.

## Tech Stack

Gemini App related choices:
- Vite + React 19 + TypeScript
- Entry points: `index.html`, `src/App.tsx`
- GenAI layer: `@google/genai` via `src/services/geminiService.ts`, using Gemini 2.5 Flash for speed and headroom
- A free-tier `GEMINI_API_KEY` is required for development; store it in `.env.local`
- Gemini Apps consume `metadata.json`

## Repo at a Glance

- `src/` hosts the React 19 app; inline comments and JSDoc are the source of truth
- `.env.local` carries all runtime secrets and is auto-loaded into shells and MCPs
- `scripts/post-create.sh` provisions tools (ripgrep, Codex CLI) and re-links `.persist/`
- `scripts/post-start.sh` refreshes env exports every container boot
- `.persist/` keeps Codex CLI history, Vibe-Kanban data, and other state that must survive rebuilds
- `.devcontainer/devcontainer.json` wires the lifecycle hooks onto the `universal:2` base image
- Prompt/context packs live under `materials/`; add stand-alone docs only with owner approval
- When new tooling is needed, extend `scripts/post-create.sh` so the lifecycle stays idempotent
- Codex CLI is the primary agent for vibecoding
- Vibe-Kanban (`@bloop/vibe-kanban`) manages tickets and worktrees
- Keep `vibe-kanban-web-companion` running and integrated so VK editing stays functional

Documentation:
- Inline code comments and JSDoc explain behavior where needed
- `README.md` is written for the hackathon judges who want to inspect code and run locally
- `AGENTS.md` (this file) is written for human and codex developers, and defines goals, decisions and recommended workflows
- `materials/` holds prompt/context packs referenced by the app and GenAI

Deployment:
- The owner manually syncs to Gemini Apps / AI Studio
- The deployment target is fragile - consider when code changes may plausibly break it and warn the owner

## Quick Commands

Vibe-Kanban (operated by the owner) creates a worktree per agent; only a few agents run directly on `main`.

Local onboarding workflow (owner only):
1. Open the repo in the devcontainer so lifecycle hooks run
2. Ensure `.env.local` has valid `GEMINI_API_KEY` and `TAVILY_API_KEY`; edits take effect next shell session
3. Run `npm install` if dependencies changed
4. Launch `npm run dev` in its own terminal (never through Codex shell tools) and open the logged URL

Container provision steps (already ran):
1. Build the devcontainer (VS Code **Dev Containers: Reopen in Container** or `devcontainer up`)
2. `postCreateCommand` executes `scripts/post-create.sh`, `postStartCommand` executes `scripts/post-start.sh`, so tooling and env vars are ready

Setup Steps (already ran):
1. `git worktree add -b <agent-branch> <agent-worktree-path> origin/main`
2. `cd <agent-worktree-path>`
3. `npm install`
4. `codex --yolo exec "<ticket-description>"`

You can directly get to work.

Common Commands:
- `npm run dev` — start Vite in a dedicated terminal; it picks the next open port automatically; never run this through Codex shell tools
- `npm run build` — produce the production bundle under `dist/`
- `npx tsc --noEmit` — type-check the project
- `npm run vk` — launch the Vibe-Kanban web server; never run this through Codex shell tools
- `codex …` — Codex CLI ships preconfigured with Playwright, Tavily, and Vibe-Kanban MCP servers via `.persist/codex/config.toml`

## Conventions

- We do not require coverage or automated tests at current scale
- AI-authored tickets or files must start with `<!-- CREATOR: codex -->`
- When editing markdown files that require owner review, use inline `<!-- ... -->` to explain pro/con/alternative of each change
- Use Playwright MCP for UI inspection instead of requesting manual screenshots
- Apply JSDoc/comments only where they clarify intent—the why, not the what
- Report ergonomics or tooling friction early so the workflow stays smooth
- Default to clear, explicit, non-magic code and messages
- Push back if owner instructions are ambiguous or contradictory; seek clarity
- Always present pros/cons/alternatives when you need an owner decision
- Escalate questions that impact project direction when intent is unclear
- Flag missing or unclear documentation immediately—we aim for self-explanatory code
- Never launch blocking commands (e.g. `npm run dev`) through Codex shell tools; use a dedicated terminal
- Keep `<VibeKanbanWebCompanion />` mounted alongside `<App />` in `src/index.tsx`
- Vibe-Kanban owns git operations; do not commit, rebase, merge, or push unless explicitly told
- We do not run GitHub CI
- Communication style: lead with findings/issues, cite files and lines, supply option tables with scores when seeking decisions, mirror the owner's direct tone, avoid filler, and document residual risks or open questions in every update

## Constraints & Priorities

**Must have (hard blockers if broken)**
- Keep onboarding truthful and lightweight: update README + inline comments immediately when behavior changes
- `.env.local` remains the single source for secrets; only `scripts/post-create.sh` / `scripts/post-start.sh` may load them
- Preserve `.persist/` links so Codex CLI and Vibe-Kanban state survive rebuilds; lifecycle scripts must stay idempotent
- Never run blocking commands via Codex shell tools—always use a dedicated terminal
- Keep `<VibeKanbanWebCompanion />` mounted with `<App />`
- `AGENTS.md` is owner-controlled; edit only with explicit approval and supply a line-referenced diff
- Favor KISS/YAGNI: every change should leave the repo simpler and more explicit than before—no legacy naming or hidden steps
- Gemini App deployment must remain functional; warn the owner of risky changes

**Should have (call out when you cannot comply)**
- Respect owner time: all flows must run end-to-end without owner babysitting, and decisions must ship with pros/cons/options
- Prefer to do things after evaluating the alternatives, and roll back if the owner rejects, rather than ask for permission and wait
- Use Playwright MCP for UI work rather than manual screenshots
- Add concise comments/JSDoc around non-obvious logic for future agents
- Surface tooling or ergonomics issues quickly
- Present options with pros/cons/score when requesting owner decisions
- Seek clarification immediately when documentation or requirements are ambiguous

If you cannot avoid violating a must-have, or if you violated at it and cannot undo/fix it, stop and escalate to the project owner before proceeding.

## Troubleshooting

- **API keys missing in shells or Codex?** Verify `.env.local`, then run `bash scripts/post-start.sh` (or restart the devcontainer) to regenerate `.persist/secrets/env.sh`
- **MCP servers unavailable?** Re-run `npm run post-create`; extend the script if you install new tools
- **Persisted state lost?** Confirm `.persist/` exists and that lifecycle-created links (`~/.codex`, `/var/tmp/vibe-kanban/worktrees`, etc.) still point there

## Project Philosophy

- We are building a causal model for AI x-risk, communicated through the web app
- Gemini App leverages the end user's free-tier quota, avoiding custom backends or configuration steps
- UX is content-first: minimal distractions, intuitive interactions
- Visual design stays modern, minimalistic, and professional
- KISS and YAGNI apply—the app should remain simple

## Features

- Vibe-Kanban tracks planned and past work
- Long-term aim: sample immersive futures without mode collapse, including causal interventions by key actors, covering both direct and indirect x-risk drivers, and explaining any emerging jargon. Events are stored as ordered `ScenarioEvent` entries:

```typescript
interface ScenarioEvent {
  /** A rough date (we care about year-month granularity). */
  date: string; // e.g. "2027-11-15"
  /** Whether the event stays hidden until post-mortem. */
  postMortem: boolean; // e.g. false
  /** Icon name from lucide-react. */
  icon: string; // e.g. "robot"
  /** One-sentence title always shown in the UI. */
  title: string; // e.g. "US government gives go-ahead for joined $1B training run by Nvidia, Google."
  /** One-paragraph description revealed on expansion. */
  description: string; // e.g. "Nvidia's and Google's jointly offered to train a vastly larger AI model than current SOTA. Per the 2026 Compute Act, they had to privately seek government approval. The government now announced the project publicly, citing the economic benefits and assurances of safety measures. The $1B training run on modern hardware is 10x larger than GPT-6."
}
```

- We supply GenAI with model materials plus random variables to encourage broad sampling and detailed, immersive continuations

## Project Structure

- Environment: `devcontainer.json`, `scripts/post-create.sh`, `scripts/post-start.sh`, `.env.local`
- Documentation: inline comments/JSDoc, `AGENTS.md`, `README.md`
- Source Code: `src/`
  - `src/components/`
  - `src/types.ts`
  - `src/services/geminiService.ts`
  - `src/App.tsx`
- Gemini App assets: `index.html`, `metadata.json`
- Dev Tools: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`

