# Design & UX Spec

## Purpose
Document the visual language, layout primitives, and interaction expectations for the AI Forecasting Hackathon SPA so future contributors can extend the UI without guessing. Each section separates the **current commit (290f56f)** from the **forward-looking spec** that should stay true even as we add features.

## Current Build Snapshot (commit 290f56f)
- **Layout shell** — `src/App.tsx` keeps a single column (`max-w-3xl`) timeline sandwiched between a fixed header and a fixed compose footer. Header and footer both use translucent beige backgrounds with borders so the beige main canvas stays exposed during scroll.
- **Color system** — Tailwind extends the `beige` palette (`tailwind.config.js`) and mixes in `stone` and `amber` defaults. Background stays `beige-50` (#FDFBF7); accents use `amber-600/700` for CTAs and errors use Tailwind’s `red` scale inside `Toast`.
- **Typography & iconography** — Global font stack is Inter (`src/index.css`). Iconography is drawn from `lucide-react` through the shared `Icon` component, and event icons are limited to `ICON_SET` in `src/constants.ts`.
- **Header** — Fixed at the top with a search input and compact import/export buttons. The search field floats an icon and highlights matches inside event titles/descriptions with an amber mark.
- **Timeline body** — Events render in chronological order with sticky year and month markers, a left gutter that houses icons, and expandable descriptions. `postMortem` events are filtered out for now so the public timeline stays forward-facing.
- **Compose panel** — Fixed footer card with icon picker, title input, description textarea, and submit button. The next-date field autoincrements from the latest event date, and submission disables the button plus swaps in a spinner while awaiting Gemini output.
- **Feedback** — Errors from Gemini are surfaced through `Toast`, positioned near the header, with auto-dismiss after 5s and manual close support.
- **Scrolling & responsiveness** — Sticky markers rely on the header occupying 64px; the compose footer adds 56px bottom padding to the main column. The layout assumes ≥360px width; squeezing below that causes the header search + file controls to wrap but remain usable.

## Forward Spec (should remain true)
### Layout Guardrails
1. Keep the single-column timeline experience centered with `max-w-3xl` even after more routes exist; secondary sidebars should slide in as drawers instead of changing the base width.
2. Maintain fixed header + footer so search/input affordances stay accessible; main content must add matching padding/margins to avert overlap.
3. Preserve translucent beige overlays (`bg-beige-50/80 + backdrop-blur`) for any fixed chrome to avoid harsh stacking when new panels appear.

### Visual Language
1. Stick to the `beige` palette for surfaces, `stone` for neutral text, `amber` for primary actions/highlights, and `red` for destructive states. Introduce new roles only through Tailwind theme tokens.
2. Icons must remain Lucide-based and routed through `Icon` so dark/light modes and accessibility tweaks stay centralized.
3. Typographic scale should stay within Tailwind defaults (xs–2xl) to keep hierarchy calm; headings should never exceed `text-2xl` inside the timeline column.

### Interaction Patterns
1. Search, compose, and import/export controls need clear hover/focus states using Tailwind focus rings; new controls should mimic `focus:ring-amber-500` + `border-amber-500` states.
2. Event cards expand/collapse on click; future controls (e.g., context menus) must not break the entire-row hit target.
3. Long-running actions (Gemini call, file import) must surface progress via button disablement and spinner patterns already used in `ComposePanel`.

### Accessibility & Motion
1. Ensure color pairs meet WCAG AA contrast; amber on beige is already compliant—match those ratios for new tokens.
2. Sticky markers and composed scroll regions must keep `aria` attributes accurate (e.g., continue toggling `aria-expanded` on event cards).
3. Keep motion subtle (Tailwind `transition` utilities <300ms); reserve custom animations for systemic feedback like Toast slide/fade.

### Implementation References
- `src/App.tsx` — layout skeleton and data flow feeding Header/Timeline/Compose.
- `src/components/*` — canonical component patterns for header, timeline rows, compose, toast, icons.
- `src/index.css` & `tailwind.config.js` — font stack, color tokens, scrollbar treatment.
