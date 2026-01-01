# GenAI Spec

## Purpose
Explain how Gemini 2.5 Flash is integrated today and what contract new code must honor. Separate facts about the **current commit (290f56f)** from the **forward-looking requirements** so we know when code drifts from the intended behavior.

## Current Implementation Snapshot
- **Entry point** — `src/services/geminiService.ts` exports `getAiForecast(history, systemPrompt)`; all callers must use this helper (no direct SDK calls elsewhere).
- **Client** — Instantiates `GoogleGenAI` with `import.meta.env.VITE_GEMINI_API_KEY`. Missing keys log a warning but still create a client (with a filler string) so local UI keeps working until the call fails.
- **Model & prompt** — Hard-coded to `gemini-2.5-flash` and paired with `SYSTEM_PROMPT` from `src/constants.ts`, which instructs the model to emit JSON arrays of Command objects.
- **Payload** — The entire timeline history is stringified (pretty JSON) and sent as the `contents`. There is no truncation or summarization yet.
- **Response contract** — Uses `responseMimeType: 'application/json'` plus a detailed `responseSchema` for Command[] (`publish-news`, `publish-hidden-news`, `patch-news`, `game-over`). The engine parses the stream into commands, validates with Zod, and rejects any event dated earlier than the latest history entry.
- **Error handling** — Any exception logs to the console and rethrows a wrapped `Error` so `App` can show a toast and revert optimistic state. There is no retry, timeout control, or caching.
- **Materials injection** — Not yet wired; prompts rely solely on the timeline history + system prompt.

## Forward Spec
### API Usage
1. Keep Gemini access centralized in `geminiService.ts`. Additional functions (streaming, eval calls) should live here to preserve consistent logging, metrics, and error mapping.
2. Support per-request overrides for model and prompt via a typed options object, but default to the current values to avoid regressions.

### Context Assembly
1. Before sending history, enforce a size guard (e.g., cap at N events or characters) and add summarization/chunking once needed.
2. Inject background materials: load curated documents from `materials/` (or a compiled bundle) and prepend them to the system instruction. Track which packs are injected so we can audit prompts.
3. Record a hash of the payload (history + system prompt + materials) for future caching/analytics.

### Output Handling
1. Continue enforcing the JSON schema and non-decreasing dates. When new ScenarioEvent fields appear, update the schema and validation in lockstep with `src/utils/events.ts`.
2. Normalize icons (`IconName`) server-side when we expand beyond `ICON_SET`; return a descriptive error if the model emits something unsupported.
3. Capture token usage from the SDK (when exposed) so we can monitor cost per turn.

### Latency & Cost Controls
1. Add an optional local cache keyed by the payload hash to short-circuit identical replays (useful when a user replays the same turn after a soft error). Cache entries should expire quickly and store only validated ScenarioEvents.
2. Provide hooks for streaming responses once the SDK exposes them; until then, keep the UI spinner as the single loading indicator.
3. Surface structured error types (network vs. validation vs. safety block) so the UI can differentiate “retry later” from “fix input”.

### Security & Secrets
1. Never expose API keys beyond build-time env variables (`.env.local` → `import.meta.env`). When adding server-side features, keep keys on the server and sign requests instead of shipping them to the client.
2. Log minimal data—only hashed identifiers—to avoid leaking sensitive scenario content when debugging.

### Implementation References
- `src/services/geminiService.ts` — core client + schema enforcement.
- `src/constants.ts` — system prompt and allowed icon set.
- `src/utils/events.ts` — validation helpers shared between user input, imports, and Gemini output.
