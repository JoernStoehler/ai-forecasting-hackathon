<!-- CHANGE: Re-centered this handbook on the lightweight React/Vite stack actually in the repo. Pro: keeps onboarding truthful; Con: replaces the prior generic template; Alternative: keep the longer multi-project copy and ask owners to mentally filter it. -->
# AGENTS.md

This is your canonical onboarding for the AI Forecasting Hackathon app. Re-read it whenever the repo changes; assume the owner does not remember prior work. Lead with findings, surface risks, and package every decision with pros/cons/alternatives.

## Product Snapshot
- Vite + React 19 + TypeScript SPA deployed manually to Gemini App / AI Studio.
- GenAI layer: `@google/genai` calling Gemini 2.5 Flash via `src/services/geminiService.ts`.
- Data is client-side only; timelines persist in `localStorage` plus export/import JSON. There is no backend, queue, or data pipeline.
- Styling uses Tailwind + a small amount of custom CSS defined in `src/index.css`.

<!-- CHANGE: Added an explicit repo map so contributors can see where docs live versus code. Pro: faster orientation; Con: slightly longer section; Alternative: rely on README links only. -->
## Repo Map
- `src/` — React app (components, timeline logic, services, utils). File headers explain intent; add new headers when creating files.
- `src/data/initialScenarioEvents.json` — seed events; keep narrative context in `materials/`.
- `src/services/geminiService.ts` — the only place that talks to Gemini. Never duplicate API glue elsewhere.
- `src/utils/events.ts` — validation/helpers for scenario events. Reuse instead of hand-rolled schema checks.
- `materials/` — prompt/context packs and writing guides referenced by the app.
- `docs/specs.md` — running design + logic specs (one section per feature). Treat it as the layer between tickets and code.
- `docs/architecture.md` — explains UI/data flow for humans.
- `docs/scenario-style.md` — narrative conventions for scenario authors.
- `docs/hackathon-submission-template.md` — owner’s submission boilerplate.
- `scripts/post-create.sh` / `scripts/post-start.sh` — lifecycle hooks that install tools and wire `.persist/`.
- `.persist/` — Codex CLI + Vibe-Kanban state; never delete or replace with real directories.

## Sources of Truth & Cross-Refs
1. **Tickets (Vibe-Kanban)** — Problems/user stories live here. Every change traces back to a ticket.
2. **Specs (docs/specs.md + focused docs)** — Capture design intent, UI flow, data contracts, and open questions before coding. Keep them short but specific.
3. **Code + Comments** — Implement the spec. Reference tickets/specs inline using `<!-- Ticket: <uuid> -->`, `<!-- Docs: docs/<file>#anchor -->`, or `// Code: path::symbol`.

Flow: tickets → specs → code/tests → UI behavior. When something feels off, escalate in that order. Never ship code that contradicts the spec without updating the spec first.

<!-- CHANGE: Collapsed onboarding steps into one ordered list matching actual workflow. Pro: reduces back and forth; Con: duplicates a subset of README; Alternative: keep only README in sync. -->
## Onboarding & Local Workflow
1. **Devcontainer** — open in the provided container (`Dev Containers: Reopen in Container` or `devcontainer up`) so lifecycle hooks run.
2. **Secrets** — add `GEMINI_API_KEY` and `TAVILY_API_KEY` to `.env.local`. Hooks sync them into shells and MCPs next boot.
3. **Install deps** — `npm install`.
4. **Dev server** — run `npm run dev` in a dedicated terminal (never via Codex shell). Vite picks the next open port.
5. **Check before handing off** — run `npm run check` (lint + typecheck + build) to ensure everything still works.

Owner-only setup that already ran:
1. `git worktree add -b <agent-branch> <path> origin/main`
2. `cd <path>`
3. `npm install`
4. `codex --yolo exec \"<ticket>\"`

## Everyday Commands
- `npm run dev` — Vite dev server (manual terminal).
- `npm run build` — production bundle in `dist/`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `src/`.
- `npm run check` — lint + typecheck + build.
- `npm run vk` — launch Vibe-Kanban web companion (never from Codex shell).

## Conventions & Constraints
- **Secrets** — `.env.local` is the only source of truth. Only lifecycle scripts may load them globally.
- **Persistence** — keep `.persist/` symlinks intact so Codex CLI + Vibe-Kanban remember history.
- **UI Requirements** — `<VibeKanbanWebCompanion />` must stay mounted alongside `<App />`.
- **Blocking commands** — never start long-running dev servers via Codex shell tools.
- **File headers** — every `.ts`/`.tsx` source file starts with a short purpose/comment block referencing the relevant ticket/spec so intent stays co-located.
- **Docs edits** — `AGENTS.md` is owner-controlled. Include inline `<!-- pro/con/alt -->` notes (as in this file) when modifying it.
- **Communication** — lead with findings, cite files/lines, list residual risks or open questions in every update.
- **Playwright MCP** — use it for UI inspection instead of manual screenshot requests.
- **JSDoc/comments** — add only where intent would otherwise be unclear. Prefer “why” over “what”.

## Documentation Layers
1. **README.md** — judge-friendly overview + quick start.
2. **AGENTS.md** (this file) — scopes decisions, workflows, constraints.
3. **docs/specs.md** — feature-level intent. Reference it (or spin off new docs) before coding.
4. **docs/architecture.md** — when you need to reason about data flow or components.
5. **docs/scenario-style.md** — when writing or reviewing scenario content.
6. **Inline comments/JSDoc** — definitive behavior-level docs.

## Decision Making & Escalation
- Tickets in Vibe-Kanban stay the source of truth. Clarify ambiguous intent immediately.
- Present options with pros/cons and a recommendation when something requires owner input.
- Flag risky changes early (Gemini App deploys are fragile).
- We do not require automated tests today; prefer fast manual validation and lint/typecheck coverage.

## Troubleshooting
- **Missing API keys** — verify `.env.local`, then `bash scripts/post-start.sh` (or restart container) to regenerate `.persist/secrets/env.sh`.
- **MCP servers down** — rerun `npm run post-create`; extend the script only when adding new tools.
- **Persisted state lost** — confirm symlinks under `.persist/` still point to the repo.
- **Broken timeline JSON** — run `npm run lint` to surface schema errors; validation lives in `src/utils/events.ts`.

## Project Philosophy
- KISS + explicitness outweigh clever abstractions.
- The web app is content-first; UX should stay calm, modern, and professional.
- All artifacts are hand-authored; when something changes, update README + inline docs immediately so onboarding stays truthful.
- Warn the owner whenever a change could plausibly break deployment to Gemini App / AI Studio.
