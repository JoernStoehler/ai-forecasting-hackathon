# AI Forecasting Hackathon

Use now: **Gemini App deploy coming soon** (deployment is manual; owners will drop the link once it is live).

A Vite + React 19 web app that samples immersive AI x-risk scenarios using Gemini 2.5 Flash. The repository is tuned for fast onboarding while keeping configuration explicit and minimal.

## Quick Start
1. **Clone the repo** – `git clone https://github.com/JoernStoehler/ai-forecasting-hackathon.git`
2. **Open in the devcontainer** – VS Code “Reopen in Container” (or `devcontainer up`) automatically runs `npm run post-create` and `scripts/post-start.sh` to install tools and load secrets.
3. **Set secrets** – create `.env.local` with `GEMINI_API_KEY` for the in-app AI calls, and `TAVILY_API_KEY` so Codex CLI’s Tavily MCP keeps working. Editing the file once is enough; new shells pick up the values automatically.
4. **Install deps** – `npm install`.
5. **Run locally** – start `npm run dev` in a dedicated terminal. Vite logs the local URL.
6. **Before handing off** – run `npm run check` (lint + typecheck + build) to catch regressions quickly.

## Need More?
All developer onboarding, repo structure, constraints, and troubleshooting live in `AGENTS.md`.
