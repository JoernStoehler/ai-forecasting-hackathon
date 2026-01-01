# Design & UX Spec

## Purpose
Document the stable UX/layout rules for the webapp so contributors can extend UI without guessing.
This document targets the current `main` branch only.

## Current UX Skeleton (webapp)
- **App shell**: `packages/webapp/src/App.tsx` renders a single-page timeline workspace with:
  - Fixed header (`packages/webapp/src/components/Header.tsx`)
  - Scrollable timeline (`packages/webapp/src/components/Timeline.tsx`)
  - Fixed compose footer (`packages/webapp/src/components/ComposePanel.tsx`)
- **Timeline markers**:
  - Sticky year/month headers.
  - A visual boundary marker (“Scenario body begins”) when a `scenario-head-completed` event exists in the event log (boundary date shown).
- **Visibility**:
  - The timeline UI renders visible news only (`news-published`).
  - Hidden news is persisted (`hidden-news-published`) but is not surfaced in the current UI.
- **Feedback**:
  - Forecast errors are shown via `Toast` (`packages/webapp/src/components/Toast.tsx`).

## UI Guardrails (keep true)
1. Keep the single-column, calm reading experience (avoid sidebars that permanently reduce the timeline width).
2. Keep header + compose available without scrolling (fixed positioning); the main column must always pad for these fixed elements.
3. Keep interactions obvious and reversible on the player side (drafting a turn in ComposePanel should not mutate history until submit).
