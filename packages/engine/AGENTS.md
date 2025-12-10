<!-- Owner review required; drafted by agent on 2025-12-10, adapted from webapp/AGENTS.md -->
<!-- Diff vs webapp/AGENTS baseline (commit 310c600):
     - Purpose/depends/tech stack updated to engine library.
     - Commands changed to engine build/typecheck.
     - Testing note reflects current Vitest-only coverage.
     - Latency note points to adapters (Gemini).
     - API contract link points to engine exports.
     - Env note keeps single GEMINI_API_KEY. -->

# AGENTS.md (engine)
- Purpose: Isomorphic simulation engine library shared by webapp and CLI.
- Tech stack: TypeScript library, ESM output.
- Depends on: none inside repo; adapters use `@google/genai`.

## Code Conventions
- Keep core pure (no globals). Forecasters/adapters encapsulate I/O.
- Label placeholder/heuristic logic explicitly so future changes are reviewed consciously.
- Commands: `npm run build -w packages/engine`, `npm run typecheck -w packages/engine`.

## Testing
- Vitest coverage exists for event validation helpers; expand as engine grows. <!-- placeholder: add more tests later -->

## Latency and Performance
- Engine core is lightweight; latency is dominated by forecaster adapters (Gemini calls). Optimizations should live in adapters (chunking, retries, caching) and be documented at the call site.

## Engine API Contract
- See `packages/engine/src/types.ts` and `packages/engine/src/index.ts` exports (`createEngine`, `Forecaster`, `ScenarioEvent`, `MATERIALS`, etc.).

## Deployment / Env
- Single env name everywhere: `GEMINI_API_KEY` (no fallbacks). Browser exposure happens via Vite `envPrefix: ['GEMINI_']` in the webapp.
