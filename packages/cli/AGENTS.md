# AGENTS.md (cli)
- Purpose: Minimal CLI frontend for the engine; interactive “hello world” loop for development.
- Tech stack: Node + TypeScript, ESM.
- Depends on: `@ai-forecasting/engine` (node or mock forecaster).

## Code Conventions
- Keep CLI thin; business logic lives in the engine. Prefer pure helpers; isolate I/O (stdin/stdout, fs).
- Label placeholder/heuristic logic explicitly so replacements are intentional.
- Commands: `npm run build -w packages/cli`, `npm run typecheck -w packages/cli`; run via `node dist/index.js` or `npx takeoff` after build.

## Testing
- TODO: add CLI integration/unit tests (e.g., snapshot of mock mode). <!-- placeholder: add tests later -->

## Latency and Performance
- Network latency comes from the engine’s forecaster (Gemini); CLI itself should stay fast and stream prints promptly.

## Engine API Contract
- See `packages/engine/src/index.ts` for exports consumed here (`createEngine`, `createNodeForecaster`, `createMockForecaster`, `ScenarioEvent`).

## Deployment / Env
- Single env name: `GEMINI_API_KEY` (required unless using `--mock`/`--no-ai`). No fallbacks.
