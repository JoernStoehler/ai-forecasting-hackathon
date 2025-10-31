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

* **Backend:**

  * **Framework:** Node 20+ with Express
  * **API:** REST + JSON validated by Zod
  * **Streaming:** SSE endpoint per session
  * **Persistence:** SQLite via `better-sqlite3` + hand-written `.sql` migrations
  * **Background work:** Node worker_threads
  * **Security:** CORS tight, Markdown sanitized server-side too

* **Tooling:**

  * **Packages:** npm workspaces
  * **Lint/format:** typescript-eslint + Prettier
  * **Tests:** Vitest + @testing-library/react + Playwright
  * **CSS helpers:** clsx + tailwind-merge

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