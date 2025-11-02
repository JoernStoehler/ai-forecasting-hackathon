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

Development Environment:
- `devcontainer.json` with `universal:2` image
- Various tools such as ripgrep, codex cli are installed automatically by `scripts/provision.sh` during post-create lifecycle event of the codespace
- We persist configuration and data for codex cli, vibe-kanban, and use GitHub Codespaces secrets for API keys
- If you want to use a tool but it's not installed, install it immediately and then extend `provision.sh`
- We use Codex CLI for vibecoding
- The project owner uses `@bloop/vibe-kanban` (VK) for ticket management and vibecoding agent creation
- We ship `vibe-kanban-web-companion` (<https://github.com/BloopAI/vibe-kanban-web-companion>) so VK can point-and-click components; keep its setup working in development

Documentation:
- `docs/hackathon-submission.md` records our approach and results
- `README.md` provides instructions for minimum steps for local setup (first preview, first vibecoding agent)
- `AGENTS.md` provides instructions for local development after setup from a vibecoding agent's PoV

Deployment:
- The project owner manually syncs the latest code to AI Studio / Gemini App for deployment
- The deployment environment is weird, and we MUST be conservative as not to break it

## Quick Commands

VK (operated by the project owner) creates and setups a git worktree for each vibecoding agent. 
Only few agents are started 1:1 by the project owner on main.

Container provision steps (already ran):
1. The usual: Create a GitHub Codespace, which reads `devcontainer.json` and builds the container
2. The postCreateCommand runs `scripts/provision.sh`, which installs ripgrep, codex cli, and setups persistence for various other dev tools

Setup Steps (already ran):
1. `git worktree add -b <agent-branch> <agent-worktree-path> origin/main`
2. `cd <agent-worktree-path>`
3. `npm install`
4. `codex --yolo exec "<ticket-description>"` started your session

You can directly get to work.

Common Commands:
- `npm run dev` - starts Vite dev server at the next available port, use a new terminal for this (do not launch it via shell/local_shell tools) because the command blocks indefinitely
- `npm run build` - builds the production bundle into `dist/`
- `npx tsc --noEmit` - runs TypeScript type checking only
- `npx vite lint` - runs Vite's linter (if configured)
- `npx vite test` - runs Vite's test runner (if configured)
- `npm run vk` - runs vibe-kanban web server at http://localhost:3000, it blocks indefinitely, do not run this command

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

- Environment: `devcontainer.json`, `scripts/provision.sh`, `.env.local`
- Documentation: `AGENTS.md`, `README.md`, `docs/hackathon-submission.md`
- Source Code: `src/`
  - `src/components/` reusable React components
  - `src/types.ts` data model types
  - `src/services/geminiService.ts` GenAI service wrapper
  - `src/App.tsx` main app component
- Gemini App: `index.html`, `metadata.json`
- Dev Tools: `package.json`, `package.lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`
