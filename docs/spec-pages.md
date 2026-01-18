# Page Spec

## Purpose
Define how the single-page app should organize its routes and surface UI states. Keep this file aligned with the running code so owners can see which pages ship today versus what remains on the roadmap.

## Router Status
- **Current** — The webapp runs without React Router. `src/App.tsx` renders the full experience on `/`.
- **Future** — Only add routing when a second page truly exists. Keep the fixed header + compose footer as shared layout primitives.

## Route Definitions
### `/` — Timeline Workspace
- **Current behavior**
  - Loads seed events from `@ai-forecasting/engine` (`INITIAL_EVENTS`), then overlays persisted localStorage events.
  - Header: sticky search with import/export controls.
  - Main content: scrollable timeline with year/month markers and expandable event cards.
  - Footer: compose panel for new user turns plus AI spinner state while Gemini runs.
  - Error handling: toast near header.
- **Forward spec**
  1. This remains the default route and must load even if routing fails; treat it as the fallback (`*`) route when React Router is introduced.
  2. Additional timeline modes (filters, branches) should extend this route via in-page controls, not new URLs, unless the state needs deep-linking.
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
Document each route once it lands in code; until then, do not speculate here.

## Navigation Guidelines
1. When React Router arrives, centralize navigation in the header so keyboard users can tab through pages without hitting the compose panel first.
2. Use `<NavLink>` with minimal styling—just underline + color shift—to maintain the calm UI. Never add a secondary sidebar solely for navigation.
3. Preserve browser history semantics (back/forward). All modal-like flows (imports, confirmations) should stay in-page rather than hijacking navigation.

## Implementation References
- `src/App.tsx` — authoritative source for the current layout and data plumbing.
- `src/components/Header.tsx` — home for navigation if/when routes exist.
