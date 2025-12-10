# @ai-forecasting/engine (hello world)

Isomorphic timeline engine shared by the webapp and CLI.

- Core: types, validation, sorting/dedup, date helpers, prompt constant.
- Adapters: `geminiBrowserForecaster`, `geminiNodeForecaster`, `mockForecaster`.
- Exported helper: `createEngine({ forecaster, systemPrompt })` returning `forecast`, `merge`, `nextDate`, `coerce`.
- Seed data: `INITIAL_EVENTS`.

Environment:
- Single key name everywhere: `GEMINI_API_KEY`. Browser access is enabled via Vite `envPrefix: ['GEMINI_']` in the webapp.

Status:
- PLACEHOLDER LOGIC: adapters are single-shot calls without retries/chunking/caching. Replace/extend explicitly when moving beyond the "hello world" milestone.
