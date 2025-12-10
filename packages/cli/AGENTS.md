<!-- Owner review required; drafted by agent on 2025-12-10, adapted from webapp/AGENTS.md -->
<!-- Diff vs webapp/AGENTS baseline (commit 310c600):
     - Purpose/depends/tech stack updated to CLI.
     - Commands changed to CLI build/typecheck/test and run example.
     - Testing note reflects current Vitest coverage for JSONL helpers.
     - Latency note points to engine forecaster.
     - API contract link points to engine exports.
     - Env note: single GEMINI_API_KEY, mock/no-ai options. -->

# AGENTS.md (cli)
- Purpose: Minimal CLI frontend for the engine; one-turn JSONL pipeline for development and tooling.
- Tech stack: Node + TypeScript, ESM.
- Depends on: `@ai-forecasting/engine` (node or mock forecaster).

## Code Conventions
- Keep CLI thin; business logic lives in the engine. Prefer pure helpers; isolate I/O (stdin/stdout, fs).
- Label placeholder/heuristic logic explicitly so replacements are intentional.
- Commands: `npm run build -w packages/cli`, `npm run typecheck -w packages/cli`, `npm test -w packages/cli`; run via `node dist/index.js --input-player <player.jsonl> [--input-state <state.jsonl>] --output-game-master <gm.jsonl> --output-state <new-state.jsonl> [--mock|--no-ai]`.

## Testing
- Vitest coverage exists for JSONL helpers; add more integration tests as the interface evolves. <!-- placeholder: expand tests later -->

## Latency and Performance
- Network latency comes from the engine’s forecaster (Gemini); CLI itself should stay fast and stream prints promptly.

## Engine API Contract
- See `packages/engine/src/index.ts` for exports consumed here (`createEngine`, `createNodeForecaster`, `createMockForecaster`, `ScenarioEvent`).

## Deployment / Env
- Single env name: `GEMINI_API_KEY` (required unless using `--mock`/`--no-ai`). No fallbacks.
