# AGENTS.md (cli)
- Purpose: Minimal CLI frontend for the engine; one-turn JSONL pipeline for dev/tooling.
- Tech stack: Node + TypeScript, ESM.
- Depends on: `@ai-forecasting/engine`

## Code Conventions
- Follow best practices for modern TypeScript Node CLIs.
- Prefer pure functions with immutable types wrapped in an imperative I/O layer.
- Keep CLI thin; business logic stays in engine.
- JSDoc comments on fileoverview and function levels for the why behind complex logic or decisions.
- Commands:
  - for development: `npm run lint -w packages/cli`, `npm run typecheck -w packages/cli`, `npm run build -w packages/cli`, `npm test -w packages/cli`.
  - for execution: `node dist/index.js --help` etc.

## Testing
- Vitest for unit/integration tests.

## Latency and Performance
- No strong performance and latency needs; CLI is for dev/tooling.

## API Contract
- See `packages/engine/src/index.ts` for the engine API
- See `packages/cli/src/index.ts` for the CLI entrypoint and arg parsing.
