# AGENTS.md

<!-- REVIEW: Updated for monorepo paths + new devcontainer; please edit/trim wording as you see fit. -->

This is your canonical onboarding for the AI Forecasting Hackathon app. Re-read it whenever the repo changes; assume the owner does not remember prior work. Lead with findings, surface risks, and package every decision with pros/cons/alternatives.

## Product Snapshot
- Vite + React 19 + TypeScript SPA deployed manually to Gemini App / AI Studio (static bundle).
- GenAI layer: `@google/genai` calling Gemini 2.5 Flash via `packages/webapp/src/services/geminiService.ts`.
- Data is client-side only; timelines persist in `localStorage` plus export/import JSON. There is no backend, queue, or data pipeline.
- Styling uses Tailwind + a small amount of custom CSS defined in `packages/webapp/src/index.css`.

## Repo Map
- `packages/webapp/` — React app (components, timeline logic, services, utils). File headers explain intent; add new headers when creating files.
- `packages/webapp/src/data/initialScenarioEvents.json` — seed events; keep narrative context in `packages/webapp/materials/`.
- `packages/webapp/src/services/geminiService.ts` — the only place that talks to Gemini. Never duplicate API glue elsewhere.
- `packages/webapp/src/utils/events.ts` — validation/helpers for scenario events. Reuse instead of hand-rolled schema checks.
- `packages/webapp/materials/` — prompt/context packs and writing guides referenced by the app.
- `docs/specs.md` — running design + logic specs (one section per feature). Treat it as the layer between tickets and code.
- `docs/architecture.md` — explains UI/data flow for humans.
- `docs/scenario-style.md` — narrative conventions for scenario authors.
- `docs/hackathon-submission-template.md` — owner’s submission boilerplate.
- `scripts/devcontainer-post-create.sh` — lifecycle hook that installs tools and wires mounts; `scripts/hello.sh` prints repo map and sanity info.
- `scripts/worktree-new.sh` / `scripts/worktree-remove.sh` — helpers for git worktrees.
- `.devcontainer/` — dev environment definition (bind mounts for caches/auth).

## Sources of Truth & Cross-Refs
1. **Tickets (Vibe-Kanban)** — Problems/user stories live here. Every change traces back to a ticket.
2. **Specs (docs/specs.md + focused docs)** — Capture design intent, UI flow, data contracts, and open questions before coding. Keep them short but specific.
3. **Code + Comments** — Implement the spec. Reference tickets/specs inline using `<!-- Ticket: <uuid> -->`, `<!-- Docs: docs/<file>#anchor -->`, or `// Code: path::symbol`.

Flow: tickets → specs → code/tests → UI behavior. When something feels off, escalate in that order. Never ship code that contradicts the spec without updating the spec first.

## Onboarding & Local Workflow
1. **Devcontainer** — open in the provided container (`Dev Containers: Reopen in Container` or `devcontainer up`) so lifecycle hooks run.
2. **Secrets** — add `.env.local` in repo root with `GEMINI_API_KEY` and optional `TAVILY_API_KEY`. Post-create seeds placeholders only.
3. **Install deps** — `npm install` (root; installs workspaces).
4. **Dev server** — run `npm run dev` in a dedicated terminal (never via Codex shell). Vite picks the next open port.
5. **Check before handing off** — run `npm run check` (lint + typecheck + build) to ensure everything still works.

Owner-only setup that already ran:
1. `git worktree add -b <agent-branch> <path> origin/main`
2. `cd <path>`
3. `npm install`
4. `codex --yolo exec "<ticket>"`

## Everyday Commands
- `npm run dev` — Vite dev server (manual terminal).
- `npm run build` — production bundle in `dist/`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `packages/webapp/src/`.
- `npm run check` — lint + typecheck + build.
- `npm run vk` (from `packages/webapp`) — launch Vibe-Kanban web companion (never from Codex shell).

## Conventions & Constraints
- **Secrets** — `.env.local` is the only source of truth.
- **Persistence** — devcontainer uses host bind mounts for caches/auth; keep mount paths in devcontainer.json in sync.
- **UI Requirements** — `<VibeKanbanWebCompanion />` must stay mounted alongside `<App />`.
- **Blocking commands** — never start long-running dev servers via Codex shell tools.
- **File headers** — every `.ts`/`.tsx` source file starts with a short purpose/comment block referencing the relevant ticket/spec so intent stays co-located.
- **Docs edits** — `AGENTS.md` is owner-controlled. Include inline `<!-- pro/con/alt -->` notes (as in this file) when modifying it.
- **Communication** — lead with findings, cite files/lines, list residual risks or open questions in every update.
- **Playwright MCP** — use it for UI inspection instead of manual screenshot requests (cache mounted at `/home/vscode/.cache/ms-playwright`).
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
- **Missing API keys** — verify `.env.local`; rebuild devcontainer if mounts/secrets drift.
- **MCP servers down** — rerun devcontainer post-create; extend the script only when adding new tools.
- **Persisted state lost** — confirm host mounts under `/srv/devhome` and `/srv/devworktrees` still point to the repo.
- **Broken timeline JSON** — run `npm run lint` to surface schema errors; validation lives in `packages/webapp/src/utils/events.ts`.

## Project Philosophy
- KISS + explicitness outweigh clever abstractions.
- The web app is content-first; UX should stay calm, modern, and professional.
- All artifacts are hand-authored; when something changes, update README + inline docs immediately so onboarding stays truthful.
- Warn the owner whenever a change could plausibly break deployment to Gemini App / AI Studio.
