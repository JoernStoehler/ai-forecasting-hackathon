# Scenario Logic Spec

## Purpose
Describe the timeline/event model and turn loop. This spec targets the current `main` branch only.

## Domain Model (current)
### Event log (source of truth)
- The persisted scenario state is an append-only `EngineEvent[]` log.
- Types live in `packages/engine/src/types.ts` and are validated via `packages/engine/src/schemas.ts`.
- The engine is event-sourced: UIs derive views from the event log (no parallel “authoritative” state).

### Boundary marker: scenario head → body
- `scenario-head-completed` is a persisted event that marks where the authored scenario seed ends and the interactive/future timeline begins.
- The webapp renders a visible marker based on the latest `scenario-head-completed.date`.

## Turn Sequence
1. **User turn**
   - Compose Panel emits a `news-published` event (visible news) with `date = latest + 1 day`.
2. **Local reconciliation**
   - The UI optimistically inserts the user event and persists the new event log.
3. **AI turn**
   - The engine forecaster produces `EngineEvent[]` based on the current event log and the system prompt.
   - Errors revert the optimistic state in the webapp and surface via `Toast`.

## Validation & Safety Nets
- Every entry point that ingests events must validate and normalize (`@ai-forecasting/engine` provides coercion + sort/dedup helpers).
- Invalid payloads must fail loudly rather than silently truncating.

## Persistence & Portability
- Webapp persists the event log to localStorage (`takeoff-timeline-events-v2`) and supports JSON import/export.
- Schema changes may bump storage keys and reject old save files (migrations are not supported pre-v1.0).

## Visibility (current)
- Visible timeline items are `news-published` events.
- Hidden news (`hidden-news-published`) is persisted but not currently rendered in the timeline UI.

## Error Handling & Recovery
- Errors must never leave the UI in a stuck loading state.
