---
Status: accepted
Title: What Tech Stack Do We Use?
Date: 2025-10-31
---

<!-- EDIT ONLY WITH PROJECT OWNER APPROVAL -->

## Context

This document records the decision on what tech stack to use for this project.  
Criteria:
- Typescript backend to use Codex SDK
- Modern look
- Easy to develop with vibecoding
  - Stable library apis so agents don't mix up versions
  - Popular libraries that agents were trained on
  - Simple abstractions that agents can reason about easily
  - Encourages best practices
- Easy to deploy (dev, production)

We can already select React & Typescript based on the above criteria.
We use a frontend server and a separate backend server, so that the backend can run standalone without GUI, e.g. for running expert examples end-to-end.

## Decision

* **Frontend**: after discussion with ChatGPT 5 Pro & Thinking we decided on

  * **Core:** Vite + React + TypeScript + TailwindCSS + React Router v6 + TanStack Query
  * **HTTP:** `fetch` + tiny wrapper + Zod parse at boundaries
  * **UI Primitives:** Headless UI
  * **Forms:** React Hook Form + Zod (install when first complex form lands)
  * **Streaming:** SSE (EventSource)
  * **State:** React Context only
  * **Markdown:** remark/rehype + `rehype-sanitize` + `remark-math` + `rehype-katex`)
  * **Tables:** TanStack Table
  * **Charts:** Plotly via `react-plotly.js` (dynamic import)
  * **Virtualization:** none initially
  * **Icons:** lucide-react
  * **Dates/Time:** date-fns
  * **i18n:** react-i18next
  * **Error tracking:** none

  Versions (pinned where useful for stability):
  - react 18.3.1, react-dom 18.3.1
  - vite ^7.1.7, @vitejs/plugin-react ^5.0.4, typescript ~5.9.3
  - tailwindcss 3.4.13, postcss 8.4.49, autoprefixer 10.4.20
  - react-router-dom 6.30.1, @tanstack/react-query 5.90.5
  - @headlessui/react 1.7.19, clsx 2.1.1, tailwind-merge 2.6.0
  - vitest 2.1.9, @testing-library/react 16.3.0, @testing-library/user-event 14.6.1, @testing-library/jest-dom 6.9.1
  - @playwright/test 1.56.1 (browsers installed on demand)

* **Backend:**

  * **Framework:** Node 20+ with Express
  * **API:** REST + JSON validated by Zod
  * **Streaming:** SSE endpoint per session
  * **Persistence:** SQLite via `better-sqlite3` + hand-written `.sql` migrations
  * **Background work:** Node worker_threads
  * **Security:** CORS tight, Markdown sanitized server-side too

  Versions:
  - node >= 20
  - express 4.21.2, cors 2.8.5, zod 3.25.76
  - typescript 5.9.3, tsx 4.20.6, vitest 2.1.9

* **Tooling:**

  * **Packages:** npm workspaces
  * **Lint/format:** typescript-eslint + Prettier
  * **Tests:** Vitest + @testing-library/react + Playwright
  * **CSS helpers:** clsx + tailwind-merge
  * **Format/Lint:** prettier 3.x, typescript-eslint 8.x (flat config, shared at repo root)

* **Agents**
  
  * **Vibecoding:** We vibecode with codex cli (gpt-5-high, gpt-5-codex-medium) and manage parallel git worktrees with `npx vibe-kanban`.
  * **Custom Agents**: We use Codex SDK in our backend, same subscription as codex cli.
  * **Sandboxing**: The dev agents run in a github codespace. The custom agents run in the codespace, but are sandboxed via Codex SDK's `sandbox` config.

* **Defer-until-needed rule:**

  * Add libraries/frameworks when first use case arises, as we may otherwise configure them wrongly for the real use case, or may include them unnecessarily.

## Consequences

- We have a clear tech stack to start development with.
- We should update this ADR when we add more libraries or change the stack.
- We should revisit this ADR if we find major issues with the chosen stack, e.g. with how productive the dev agents are.
