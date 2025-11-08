# Page Spec

## Purpose
Define how the single-page app should organize its routes and surface UI states. Keep this file aligned with the running code so owners can see which pages ship today versus what remains on the roadmap.

## Router Status
- **Current commit (290f56f)** — `src/App.tsx` renders the entire experience without React Router yet. All content lives on the root route (`/`).
- **Forward spec** — Adopt React Router v6 once we add a second page. The router should mount inside `src/main.tsx`/`src/index.tsx`, keep `<VibeKanbanWebCompanion />` mounted globally, and wrap routes with a shared layout that preserves the fixed header + compose footer.

## Route Definitions
### `/` — Timeline Workspace
- **Current behavior**
  - Loads seed events from `src/data/initialScenarioEvents.json`, merges user-authored events, and displays them chronologically inside `Timeline`.
  - Header: sticky search with import/export controls.
  - Main content: scrollable timeline with year/month markers and expandable event cards.
  - Footer: compose panel for new user turns plus AI spinner state while Gemini runs.
  - Error handling: toast near header.
- **Forward spec**
  1. This remains the default route and must load even if routing fails; treat it as the fallback (`*`) route when React Router is introduced.
  2. Additional timeline modes (filters, post-mortem reveal, scenario branches) should extend this route via in-page controls, not new URLs, unless the state needs deep-linking.
  3. Keep data hydration synchronous: load from `localStorage`, then reconcile remote/imported data before rendering child components.

### Future Pages (owner to fill in)
Add a section per route you introduce, following this template:
```
### /example
- **Goal** — Short statement of what the page delivers and why it is separate from the timeline.
- **Current behavior** — Describe shipped UI, components, data dependencies, and entry points.
- **Forward spec** — Bullet requirements for expansions, including routing guards, shared layout expectations, and performance constraints.
- **Interactions with other routes** — Describe how navigation occurs (header tabs, drawer, CTA buttons) and what shared state travels across routes.
```
Potential upcoming routes discussed so far:
1. `/pages` such as a scenario brief or “materials library” that surfaces the content under `materials/` inline.
2. `/insights` or similar for analytics once multiple scenarios exist.
3. `/settings` for API keys or debugging toggles (only if owners deem necessary).
Document each once it lands in code; until then, leave them as TBD sections to make deltas obvious during reviews.

## Navigation Guidelines
1. When React Router arrives, centralize navigation in the header so keyboard users can tab through pages without hitting the compose panel first.
2. Use `<NavLink>` with minimal styling—just underline + color shift—to maintain the calm UI. Never add a secondary sidebar solely for navigation.
3. Preserve browser history semantics (back/forward). All modal-like flows (imports, confirmations) should stay in-page rather than hijacking navigation.

## Implementation References
- `src/App.tsx` — authoritative source for the current layout and data plumbing.
- `src/components/Header.tsx` — future home for route navigation when multiple pages exist.
- `src/utils/events.ts` & `src/services/geminiService.ts` — shared services that every page should import rather than forking logic.
