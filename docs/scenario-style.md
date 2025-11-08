# Scenario Writing Style Guide

The app alternates turns between the user (controlling one organization) and Gemini. To keep generated histories coherent, hand-authored events should follow the same shape as the AI output.

## Structure
1. **Date** — ISO string (`YYYY-MM-DD`). Think in month-level granularity; pick specific days only when they matter.
2. **Icon** — Lucide icon name (see `src/constants.ts`). Pick icons that communicate the dominant theme (policy, compute, finance, etc.).
3. **Title** — One sentence capturing the key fact. Avoid jargon.
4. **Description** — A short paragraph that adds context, magnitudes, or consequences. Explain any 2025+ acronyms on first use.
5. **postMortem** (optional) — Set to `true` only when the event should remain hidden until the scenario enters post-mortem review.

## Tone & Content
- Be concrete and factual. Reference actors, budgets, and metrics whenever available.
- Focus on AI labs, policy moves, compute supply chains, markets, and security incidents tied to AI.
- Avoid giving orders to the user-controlled organization; describe its actions or reactions instead.
- Keep descriptions to 1–3 sentences. Use plain language—no marketing copy.

## When in Doubt
- Start from real-world headlines and extend them plausibly.
- Mention the provenance of surprising claims (“according to GAO”, “per leaked EU draft”).
- If an event feels speculative, add one sentence that grounds it in observable signals.
- Re-run `npm run check` before exporting new scenarios to ensure TypeScript + linting stay green.
