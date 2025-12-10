# AGENTS.md (engine)
- Purpose: Isomorphic simulation engine library shared by webapp and CLI.
- Tech stack: TypeScript library, ESM output.
- Depends on: none inside repo; the adapters use `@google/genai`.
- Depended on by: `packages/webapp/`, `packages/cli/` are our two adapters.

## Code Conventions
- Follow best practices for modern TypeScript libraries.
- Pure functions with immutable types preferred where sensible.
- Architecture: Event Sourcing on the scenario event layer, with pure reducers for aggregates. I/O is done in the adapters (cli, webapp).
- Label placeholder/heuristic logic explicitly so future changes are reviewed consciously.
- Commands:
  - for development: `npm run lint -w packages/engine`, `npm run typecheck -w packages/engine`, `npm run build -w packages/engine`, `npm test -w packages/engine`.
  - nothing to execute; engine is consumed by CLI/webapp.
- JSDoc/comments on file and function levels for the why behind complex logic or decisions.
- YAGNI, KISS: most semantic game logic is better left to the game master LLM instead of being hardcoded into syntax.

## Testing
- Vitest for unit/integration
- Cover happy paths, edge cases, error paths. Validate not-yet-validated inputs from adapters.

## Latency and Performance
- No premature optimization; only optimize after profiling.
- Minimize the time-to-first-event (latency) and time-to-last-event (performance) of the engine forecaster calls.
- Architecture: we use streaming Gemini API calls to reduce time to first token; we parse the stream and emit events eagerly.

## Engine API Contract
- See `packages/engine/src/index.ts`. Developers of other packages also read this file to understand the engine API.
