# Scenario Logic Spec

## Purpose
Describe how scenarios are composed today and what rules must remain true as we evolve the timeline engine. This file distinguishes the **current implementation (commit 290f56f)** from the **target spec** so contributors know when they can refactor versus when they must update the spec first.

## Domain Model
### ScenarioEvent shape
- **Current** — Defined in `src/types.ts` with `{ date: string; icon: IconName; title: string; description: string; postMortem?: boolean }`. Dates use `YYYY-MM-DD`, icons must match `ICON_SET`, and `postMortem` defaults to `false`.
- **Spec** — Keep the single event type until we introduce clearly distinct entities (e.g., decisions vs. outcomes). Any extension must stay JSON-serializable, schema-validated, and backwards-compatible with persisted timelines.

### Timeline state
- **Current** — `src/App.tsx` keeps `events` in React state, seeded from `src/data/initialScenarioEvents.json` but overridden by `localStorage` (`takeoff-timeline-events`). The list is deduped + sorted via `sortAndDedupEvents` before every render.
- **Spec** — Timeline state must remain the single source of truth for every page. Derived views (filters, summaries) should memoize from this array rather than storing parallel copies.

## Turn Sequence
1. **User turn**
   - Current: Compose Panel validates non-empty title/description, auto-sets `date = latest + 1 day`, and emits an event with `postMortem: false`.
   - Spec: Future versions may allow editing the date or toggling `postMortem`, but user-authored events must always be validated client-side before we mutate state or talk to Gemini.
2. **Local reconciliation**
   - Current: We optimistically insert the user event, sort/dedup, and show it immediately.
   - Spec: Optimistic inserts stay, but once we support branching, we must scope reconciliation to the active branch.
3. **AI turn**
   - Current: `getAiForecast` receives the full history + system prompt and returns 1–n new events. We append them and sort/dedup. Errors roll back to the pre-submit snapshot and surface via `Toast`.
   - Spec: AI turns must always follow a user turn to preserve alternation. If Gemini fails, the user turn remains but we note the failure state so the user can retry without duplicating their event.

## Validation & Safety Nets
- **Current** — `coerceScenarioEvents` ensures every array we ingest (seeds, imports, Gemini output) matches the schema and uses allowed icons. `sortAndDedupEvents` prevents chronological regressions and repeated entries by key (`date-title`).
- **Spec** — Keep schema validation for every entry point and expand it once we add new fields (e.g., `confidence`). Invalid payloads must fail loudly rather than silently truncating.

## Persistence & Portability
- **Current** — Local persistence uses `localStorage` writes on every `events` change. Export/import flows are JSON-only, with a confirm dialog before destructive imports.
- **Spec** — Continue writing after every update until we introduce explicit save points. Any future sync (cloud storage, multiplayer) must still round-trip through the ScenarioEvent JSON to keep export/import stable.

## Search & Visibility
- **Current** — Searches filter in-memory events and highlight matches. Events flagged `postMortem` are hidden from the timeline entirely.
- **Spec** — Post-mortem entries remain hidden until we build a dedicated reveal mode. When we add other visibility filters (branches, tags), they must layer on top of the existing search/highlight behavior rather than overwrite it.

## Error Handling & Recovery
- **Current** — Gemini errors trigger a toast, revert state to the last stable snapshot, and stop the spinner.
- **Spec** — Add structured error codes (network, schema, rate-limit) so future UI can offer retry guidance. Never leave the compose button disabled after an error.

## Open Questions / Owner Input Needed
1. **Branching** — If/when parallel scenario branches are needed, confirm whether they live inside one ScenarioEvent list with metadata or separate timelines.
2. **Post-mortem reveal UX** — We currently drop those events entirely; confirm whether the first milestone should simply toggle them via a control or if they stay hidden until a “review” phase exists.
3. **External persistence** — If we expect team sharing, we should add a spec covering how timelines sync beyond local JSON exports.
