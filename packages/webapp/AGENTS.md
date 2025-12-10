# AGENTS.md (webapp)
- Purpose: Frontend, interactive web game
- Tech stack: Vite + React 18 + TypeScript SPA
- Depends on: `packages/engine/` for the simulation engine (shared with CLI)

## Code Conventions
- Follow best practices for modern frontend development with React and TypeScript.
- Pure functions with immutable types preferred where sensible.
- Commands: 
  - for development: `npm run lint -w packages/webapp`, `npm run typecheck -w packages/webapp`, `npm run build -w packages/webapp`.
  - for preview: `npm run dev -w packages/webapp` (Vite dev server) or `npm run preview -w packages/webapp` (serve built output).
- JSDoc comments on fileoverview and function levels for the why behind complex logic or decisions.

## Testing
- Use Vitest for unit and integration tests. Playwright for end-to-end tests.
- Cover happy paths, edge cases, error paths.

## Latency and Performance
- Follow best practices for web performance optimization.
- Focus only on hotspots identified via profiling.
- Optimize only after profiling; document expectations, results, flags in comments near benchmarked code.
- Document the why behind code changes, e.g. latency impact.
- The main source of latency is the engine event emitter (time to first event, time to last event), which is mostly due to Gemini API calls (time to first token, time to last token).

## Engine API Contract
- See `packages/engine/`, in particular `packages/engine/src/types/api.ts`

## Deployment
- The web app is deployed manually to Gemini App aka AI Studio Build as a static bundle. Gemini App automatically inserts a free api key per player as `GEMINI_API_KEY` in the environment, so we don't have to manage keys ourselves besides development.
- Data is stored client-side only.
