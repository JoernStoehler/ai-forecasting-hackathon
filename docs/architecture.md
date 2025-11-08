# Architecture Overview

This app is a single-page React experience that lives entirely in the browser. There is no backend; the only remote call goes from the client to Gemini 2.5 Flash via `@google/genai`.

## High-Level Flow
1. Seed events load from `src/data/initialScenarioEvents.json`.
2. `src/App.tsx` owns the event list, persists it to `localStorage`, and orchestrates submissions/imports.
3. When the user submits a new event, `getAiForecast` (in `src/services/geminiService.ts`) sends the full timeline plus the system prompt to Gemini. New events returned from the model pass through the shared validation helpers before entering state.
4. The timeline UI (`src/components/Timeline.tsx` + `EventItem.tsx`) renders the sorted events with sticky year/month markers. Search uses simple client-side filtering.
5. Style primitives live in Tailwind (`src/index.css` and `tailwind.config.js`). Custom scrollbar + background tweaks also live in `src/index.css`.

## Key Files
- `src/App.tsx` — top-level state, search, persistence, and error toasts.
- `src/components/ComposePanel.tsx` — footer form for hand-authored events.
- `src/components/Header.tsx` + `FileControls.tsx` — search input plus import/export.
- `src/components/Timeline.tsx` — groups events by year/month.
- `src/services/geminiService.ts` — wraps `GoogleGenAI` client and enforces schema checks.
- `src/utils/events.ts` — type guards, deduplication, and sorting helpers.

## Data Considerations
- Scenario events are the only domain object. They include `date`, `icon`, `title`, `description`, and optional `postMortem`.
- Validation happens before events enter app state (imports, seeds, AI responses). Always reuse `coerceScenarioEvents` from `src/utils/events.ts`.
- The UI assumes events are sorted ascending by date and then title; `sortAndDedupEvents` encapsulates that ordering.

## Deployment Notes
- Vite builds a static bundle (`npm run build` → `dist/`). The owner uploads that bundle to Gemini App / AI Studio.
- Because secrets are client-side, the build only inlines `VITE_*` variables supplied at build time. Never hardcode keys.
- Warn the owner if a change could impact embedding in Gemini App (e.g., new external network calls, major package upgrades).
