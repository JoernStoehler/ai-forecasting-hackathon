# Design & Logic Specs

This file is the middle layer between tickets and code. Keep each feature or refactor under its own heading so future agents can trace intent quickly. Specs should answer:

1. **Problem & Ticket Link** — summarize the user impact and link the Vibe-Kanban ticket (`Ticket: <uuid>`).
2. **User Flow / UX Notes** — describe the UI sequence, states, and accessibility considerations.
3. **Data & Logic** — outline state shape, validation rules, and any interactions with Gemini or browser APIs.
4. **Open Questions / Risks** — list unknowns or follow-ups so the next agent knows what to verify.

Example skeleton:

```markdown
## <Feature name>
<!-- Ticket: f4c1e6d8 -->
<!-- Docs: docs/specs.md#feature-name -->

- Problem:
- Proposed UX:
- Data model:
- Acceptance checks:
```

Update this file whenever you change behavior that isn’t obvious from inline comments. If a spec grows beyond a few paragraphs, break it into its own `docs/<topic>.md` file and link back here.
