<!-- EDIT THIS FILE ONLY WITH OWNER APPROVAL -->
<!-- THE WORDING HAS BEEN CAREFULLY TWEAKED AND SHOULD NOT BE CASUALLY CHANGED -->

# AGENTS.md

This document serves as Developer Documentation. 
It is read by all development codex agents.
It is not read by the forecasting agents.
Human developers can read it, or use an AI agent to onboard them faster.
The project owner has scarce time, so only ping the project owner for decisions where you don't confidently know what they'll want, or for decisions that are marked as requiring their approval. Write clearly, don't assume the project owner recalls your earlier messages or work, and provide your pro/con/alternatives for decisions so the project owner can decide faster.
The project vision is documented in README.md.

The WebApp is deployed via AI Studio / Gemini App.

## Tech Stack

Gemini App related choices:
- Vite + React 19 + TypeScript
- `index.html`, `src/App.tsx` entry points
- `src/components` for reusable components
- `src/types.ts` for data model types
- GenAI: we use `@google/genai` & `src/services/geminiService.ts` with Gemini 2.5 Flash; We picked flash for speed & larger budget.
- A free-tier `GEMINI_API_KEY` is provided by Google for all end-users, and set by us manually for our development servers in `.env.local`
- Gemini App uses `metadata.json`

## Repo at a Glance

- `src/` holds the React 19 application; inline comments/JSDoc are the canonical documentation.
- Runtime config lives in `.env.local`, which lifecycle scripts load into every shell and MCP.
- `scripts/post-create.sh` bootstraps tools and re-links `.persist/`; `scripts/post-start.sh` refreshes env exports on each container boot.
- `.persist/` stores Codex CLI history, Vibe-Kanban data, and other stateful assets so rebuilds stay idempotent.
- `.devcontainer/devcontainer.json` wires the lifecycle hooks on top of the `universal:2` base image.
- Prompting/context material lives in `materials/`; add stand-alone docs only when the project owner asks for them.

Development Environment:
- `devcontainer.json` with `universal:2` image
- `scripts/post-create.sh` installs ripgrep, Codex CLI, and re-links `.persist/` so tooling state survives rebuilds
- `scripts/post-start.sh` loads `.env.local` into every shell and Codex MCP; keep `.env.local` as the only place you hand-edit keys
- We persist configuration and data for codex cli and vibe-kanban inside `.persist/`; confirm the symlinks remain intact after changes
- If you want to use a tool but it's not installed, install it immediately and then extend `scripts/post-create.sh`
- We use Codex CLI for vibecoding
- The project owner uses `@bloop/vibe-kanban` (VK) for ticket management and vibecoding agent creation
- We ship `vibe-kanban-web-companion` (<https://github.com/BloopAI/vibe-kanban-web-companion>) so VK can point-and-click components; keep its setup working in development

Documentation:
- Prefer inline code comments and JSDoc for authoritative explanations (keeps context next to usage)
- `README.md` documents minimum local setup plus lifecycle script expectations
- `AGENTS.md` provides project policy, constraints, and expectations for vibecoding agents
- `materials/` stores prompting/context packs referenced by the app and GenAI calls

Deployment:
- The project owner manually syncs the latest code to AI Studio / Gemini App for deployment
- The deployment environment is weird, and we MUST be conservative as not to break it

## Quick Commands

VK (operated by the project owner) creates and setups a git worktree for each vibecoding agent. 
Only few agents are started 1:1 by the project owner on main.

Container provision steps (already ran):
1. Build the devcontainer (e.g. VS Code **Dev Containers: Reopen in Container** or `devcontainer up`), which reads `devcontainer.json` and starts the container
2. The postCreateCommand runs `npm run post-create` (which calls `scripts/post-create.sh`) to install ripgrep, codex cli, and refresh persisted tooling state

Setup Steps (already ran):
1. `git worktree add -b <agent-branch> <agent-worktree-path> origin/main`
2. `cd <agent-worktree-path>`
3. `npm install`
4. `codex --yolo exec "<ticket-description>"` started your session

Local onboarding workflow (repeat when starting fresh on a machine):
1. Reopen the repo in the devcontainer (VS Code **Dev Containers: Reopen in Container** or `devcontainer up`) so the lifecycle hooks run.
2. Ensure `.env.local` contains valid `GEMINI_API_KEY` and `TAVILY_API_KEY`. Editing the file is enough; the next shell session picks the changes up automatically.
3. Run `npm install` if dependencies changed.
4. Start the app with `npm run dev` in a dedicated terminal (never via Codex shell tools); Vite prints the URL to open locally.

You can directly get to work.

Common Commands:
- `npm run dev` - starts Vite dev server at the next available port, use a new terminal for this (do not launch it via shell/local_shell tools) because the command blocks indefinitely
- `npm run build` - builds the production bundle into `dist/`
- `npx tsc --noEmit` - runs TypeScript type checking only
- `npx vite lint` - runs Vite's linter (if configured)
- `npx vite test` - runs Vite's test runner (if configured)
- `npm run vk` - runs vibe-kanban web server at http://localhost:3000, it blocks indefinitely, do not run this command
- `codex ...` - Codex CLI is preconfigured via `.persist/codex/config.toml` with Playwright, Tavily, and Vibe-Kanban MCP servers

## Conventions

- Since our project is small, we don't need coverage or tests.
- AI-authored tickets or files must start with `<!-- CREATOR: codex -->` so it's clear the project owner hasn't reviewed them line-by-line yet.
- Use playwright MCP to inspect the frontend directly, no need to ask the project owner to take screenshots or test buttons manually.
- Use jsdoc and comments for major functions and types. Explain the why, not the what.
- Ergonomics is important, report to the project owner if your tools or the repo architecture don't work intuitively or slow you down in any way.
- When in doubt, prefer simplicity and clarity over cleverness or optimization.
- Write explicit, clear, unambiguous, non-magic code. Same for messages.
- Push back when the project owner makes a sloppy mistake, ask if they're not being clear enough.
- Present pro/con/alternatives when you need the project owner to make a decision or approve of your designated approach.
- When you need to make a decision that affects the project direction, and you're not sure what the project owner would want, ask them.
- Ask when documentation is missing or is written unclearly. We want the codebase and repo to be self-explanatory and trivial to onboard to.
- Never launch long-running or blocking commands (e.g. `npm run dev`) via the shell/local_shell tools; use a dedicated terminal instead.
- Keep `<VibeKanbanWebCompanion />` mounted alongside `<App />` in `src/index.tsx` so the project owner can use VK's point-and-click edits during development.
- We use bloop/vibe-kanban for managing tickets and spawning vibecoding agents. The ticket is copied into the agent's first user message. They are started in a provisioned git worktree.
- Sometimes the project owner starts a 1:1 chat with a coding agent in the `main` worktree, in which case no assigned ticket exists.
- VibeKanban manages the worktrees. Unless the project owner explicitly tells you, you don't need to commit, rebase, merge or push. VibeKanban automatically commits your work whenever you end your turn.
- We don't have nor need a GitHub CI.
- Communication style:
  - Must lead with findings/issues before summaries; messages must be self-contained and reference files/lines explicitly.
  - Must present options with pros/cons/scores when requesting owner decisions.
  - Should mirror the owner's direct tone, avoid filler, and list residual risks or open questions in every update.

## Constraints & Priorities

**Must have (hard blockers if broken)**
- Owner time is scarce: all flows you touch must keep running without owner intervention, and you must present pros/cons/options up front.
- Keep onboarding truthful and lightweight. README and inline comments must match reality; update them immediately when you change behavior.
- `.env.local` is the single secret source. `scripts/post-create.sh` / `scripts/post-start.sh` must remain the only loaders—do not add parallel secret plumbing.
- `.persist/` links must stay intact so Codex CLI and Vibe-Kanban state survive rebuilds. Lifecycle scripts must stay idempotent.
- Never launch blocking commands (`npm run dev`, `npm run vk`, etc.) via Codex shell tools; always use a dedicated terminal.
- Keep `<VibeKanbanWebCompanion />` mounted alongside `<App />` in `src/index.tsx`.
- `AGENTS.md` is owner-controlled. Only edit it with explicit owner approval and provide a clear, line-referenced diff.
- Favor KISS/YAGNI: after each change the repo should be *more* explicit and simpler—no legacy names or hidden steps left behind.

**Should have (call out when you cannot comply)**
- Use Playwright MCP for UI inspection instead of manual screenshot workflows.
- Add concise comments/JSDoc for non-obvious logic so future agents learn in-context.
- Surface tooling or ergonomics friction quickly; we keep the repo intuitive.
- Offer options with pros/cons/score before asking the owner to decide direction.
- Clarify ambiguous instructions or missing documentation immediately rather than guessing.

If you must violate a must-have, stop and escalate to the project owner before proceeding.

## Troubleshooting

- **API keys missing in shells or Codex?** Double-check `.env.local`, then run `bash scripts/post-start.sh` (or restart the devcontainer) to regenerate `.persist/secrets/env.sh`.
- **MCP servers unavailable?** Re-run `npm run post-create` to reinstall Codex CLI tooling; extend the script if you add new tools.
- **Persisted state lost?** Ensure `.persist/` exists and the lifecycle-created symlinks (`~/.codex`, `/var/tmp/vibe-kanban/worktrees`, etc.) still point there.

**Project Philosophy**
- We are writing a causal model for forecasting x-risk from AI, communicated via a webapp.
- We use Gemini App bc it uses the end user's free tier quota instead of requiring us to setup a paid backend.
- Our GUI focuses on the content, with minimal distractions and UX that is natural to use and understand.
- Our design is modern, minimalistic, and clean. We use professional icons, colors, typography, layouts, designs, etc etc.
- KISS and YAGNI apply: our webapp is quite simple and will stay so.

## Features

- Vibe-Kanban tracks tickets for planned and past features.
- The end goal is roughly:
  - Use GenAI to flesh out our causal model into concrete, immersive narratives, as was done for the AI 2027 scenario.
  - Cover the causal model's actual posterior distribution, i.e. do not mode collapse but sample from the full space. We err towards a large domain support over accurate probabilities.
  - Allow the user to run causal interventions by choosing the action/reaction of a key decision making organization, such as the US government.
  - We get out of the user's way on everything besides x-risk-related decisions, i.e. we take high-level agenda decisions and predict automatically the low-level consequences and implementations done by the organization.
  - We do not neglect events that are indirectly x-risk related, such as economy, geopolitics, domestic politics, social opinion propagation, media & cultural correlations and shifts.
  - We do not neglect events that are directly related to x-risk, such as AI capabilities progress, governance structures, evaluation and monitoring research, and even highly technical agent foundation research progress.
  - We communicate our forecasts, and the concrete fleshed out sampled scenario, in a user-friendly, immersive, content-focused language, and pick the right level of jargon.
  - We have to explain any terminology that is not common knowledge pre mid 2024. This also trains us to both invent as little as possible, and explain properly, the jargon of the 2035 era in the scenario.
- The major architecture is:
  - A frontend web app that presents an ongoing scenario, accepts a causal intervention (decision) from the user, and then continues the scenario using GenAI
  - The GenAI is a text-to-text model with reasoning, here Gemini 2.5 Flash for speed and budget reasons
  - The GenAI receives a large corpus of material, the scenario so far, then reasons, and finally outputs the next chunk of the scenario
  - We store the scenario as a time-ordered sequence of events, with a simple container type for events:
    ```typescript
    interface ScenarioEvent {
      /**
       * A rough date. We care mostly about year-month granularity, not days.
       */
      date: string; // e.g. "2027-03-15"
      /**
       * Whether the event is visible to the user during scenario construction,
       * or is secret extra information that only becomes visible after the scenario ends.
       */
      postMortem: boolean;
      /**
       * An icon, taken 1:1 from lucide-react.
       */
      icon: string; // e.g. "Landmark"
      /**
       * A one sentence title for the frontend to always display.
       */
      title: string; // e.g. "Google releases Gemini 3 with research-grade math capabilities"
      /**
       * A one paragraph description for the frontend to display when the user clicks on the event to expand it.
       */
      description: string; // e.g. "Google's new Gemini 3 model is announced and beats the previous frontier models in all benchmarks. University researchers with preview access confirm the model can autonomously carry out original research in mathematics and other theoretical fields. Gemini 3 is essentially a near-full replacement for scientific researchers, though it still requires a human advisor to pick the most productive directions."
    }
    ```
- We present our probabilistic model in the materials provided to the GenAI. There is no deep, formalized graph structure, instead we utilize the reasoning capabilities of GenAI to on-the-fly sample a scenario continuation that respects the model. To make the sampling process random, we provide the GenAI with a few random variables each turn, that indicate where on the 0-th to 100-th percentile the scenario continuation should fall along a few key axes of uncertainty. The GenAI then reasons about what the current conditional distribution looks like, and picks the rolled percentile, and fleshes it out into concrete events, down to an immersive level of detail.

## Project Structure

- Environment: `devcontainer.json`, `scripts/post-create.sh`, `scripts/post-start.sh`, `.env.local`
- Documentation: inline comments/JSDoc, `AGENTS.md`, `README.md`
- Source Code: `src/`
  - `src/components/` reusable React components
  - `src/types.ts` data model types
  - `src/services/geminiService.ts` GenAI service wrapper
  - `src/App.tsx` main app component
- Gemini App: `index.html`, `metadata.json`
- Dev Tools: `package.json`, `package.lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`
