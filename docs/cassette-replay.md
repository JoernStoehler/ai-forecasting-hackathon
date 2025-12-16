# Replay & Recording (Draft)

Status: draft design matching explicit owner request (Dec 2025). Each API call lives in its own JSON “tape”; no magic routing or hashing. A tape replays the exact streamed chunks with recorded delays and verifies the request matches the recording.

## Tape Format (JSON)
```json
{
  "meta": {
    "label": "smoke-1",
    "model": "gemini-2.5-flash",
    "recordedAt": "2025-12-10T18:00:00Z",
    "sdk": "@google/genai",
    "comment": "optional notes"
  },
  "request": {
    "model": "gemini-2.5-flash",
    "systemPrompt": "SYSTEM ROLE: ...",
    "materialsUsed": ["expert-model-of-x-risk"],
    "history": [{ "...": "news events exactly as sent" }]
  },
  "stream": [
    { "delayNs": 0,        "text": "[{\"type\":\"news-published\",...}]" },
    { "delayNs": 12000000, "text": "" },               // empty chunk allowed
    { "delayNs": 8000000,  "text": "[{\"type\":\"news-published\",...}]" }
  ]
}
```
- `delayNs`: nanoseconds after the previous chunk before yielding this chunk (first chunk delay is since call start).
- `text`: raw string as yielded by the SDK (`part.text` after calling the function if it was lazy).
- `materialsUsed` is optional; history must be the news-only array actually sent.

## APIs (engine)
- `createReplayForecaster({ tapePath, strict? })` — Forecaster that replays `stream` with delays, parsing chunks through the same streaming pipeline; validates model/systemPrompt/history when `strict` (default).
- `createReplayGenAIClient(tape)` — Mock GenAI client implementing `generateContentStream`, for use with lower-level helpers.
- `createRecordingGenAIClient({ baseClient, tapePath, meta? })` — Wraps a real client, records chunk texts plus inter-chunk delays, writes one tape JSON to `tapePath`, passes through the original stream unchanged.
- `loadReplayTape(path)` — Reads + validates tape JSON.
- Types: `ReplayTape`, `ReplayChunk` (nanosecond delays, text chunks).

## Expected Usage
- Recording: wrap the real GoogleGenAI client with `createRecordingGenAIClient` and point `tapePath` at a fixture location; run a normal call, then commit the tape for tests.
- Replaying in CLI or tests: inject `createReplayForecaster({ tapePath })` (or `createReplayGenAIClient` with `streamGeminiRaw`) to avoid network calls and exercise streaming/latency behavior.
- Multiple turns: store one tape per turn (one file per API call) in a folder; the runner explicitly picks which tape to use—no hashes or auto-routing.

## Open Questions
- Should we support optional “loose” request matching (ignore IDs/dates) for brittle prompts? Default is strict equality on model/systemPrompt/history.
- Where to store fixtures per package (`packages/cli/test/fixtures/replays/` vs shared location)?
- Do we need a helper CLI to record + write tapes, or is the GenAI client wrapper enough?
