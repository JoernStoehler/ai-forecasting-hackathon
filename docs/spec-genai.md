# GenAI Spec (Gemini)

## Purpose
Document how the project calls Gemini and what output contract the model must satisfy.
This document targets the current `main` branch only.

## Output Contract (must hold)
- The model outputs **strict JSON** representing `Command[]` (no extra text, no markdown).
- Command types are:
  - `publish-news`
  - `publish-hidden-news`
  - `patch-news`
  - `game-over`
- Commands are validated and converted into appended `EngineEvent[]` entries.

## Where Gemini Is Called
- **Engine (shared)**: `packages/engine/src/adapters/geminiBrowserForecaster.ts` and `packages/engine/src/adapters/geminiNodeForecaster.ts`.
- **Webapp**: `src/services/geminiService.ts` constructs an engine with `createBrowserForecaster` and delegates to `engine.forecast(...)`.
- **CLI**: uses the engine adapters for live calls and uses `preparePrompt(...)` + replay tooling for deterministic tests.

## Request / Prompt Shape
- Gemini calls are streamed via `generateContentStream` (see `packages/engine/src/forecaster/geminiStreaming.ts`).
- Request config sets:
  - `systemInstruction` to the `systemPrompt` provided by the caller (webapp uses `SYSTEM_PROMPT` from `packages/engine/src/constants.ts`).
  - `responseMimeType: "application/json"`.
  - `responseSchema` to a `Command[]` JSON schema (engine-owned).
- The timeline prompt content is projected from the append-only event log:
  - `packages/engine/src/utils/promptProjector.ts` renders a JSONL timeline plus a small dynamic block.

## API Keys (current)
- Browser/webapp: `GEMINI_API_KEY` is provided via Vite env (`vite.config.ts` sets `envPrefix: ["GEMINI_"]`).
- Node/CLI: `GEMINI_API_KEY` is read from `process.env.GEMINI_API_KEY` by default.

## Deterministic Replay (cassette)
- Replay exists to test everything except the Gemini backend.
- See `docs/cassette-replay.md` for the exact tape format and matching rules.
