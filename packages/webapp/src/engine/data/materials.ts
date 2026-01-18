/**
 * Shared prompt/background materials for all frontends.
 * Keeping the content in TS avoids bundler quirks across environments.
 */
export interface MaterialDoc {
  id: string;
  title: string;
  body: string;
}

export const MATERIALS: MaterialDoc[] = [
  {
    id: 'expert-model-of-x-risk',
    title: 'Expert Model of X-Risk from Artificial Superintelligence',
    body: `# Expert Model of X-Risk from Artificial Superintelligence

This note captures the shared mental model we use when writing timelines or prompts. It is intentionally lightweight—treat it as a checklist rather than a thesis.

## Core Axes
1. **Capability Growth** — scaling laws, algorithmic breakthroughs, and hardware supply all trend upward. Track how each event either accelerates or brakes that growth.
2. **Control & Alignment** — eval coverage, interpretability research, and governance levers that try to keep models corrigible.
3. **Deployment Surface** — which sectors (defense, finance, infrastructure) adopt frontier systems first, and how concentrated that control is.
4. **Crisis Dynamics** — incidents (misuse, accidents, escalation) that change public sentiment or policy windows.

## Scenario Tips
- Anchor each chain of events to a concrete actor (lab, regulator, industry body).
- Quantify compute budgets, eval thresholds, or safety investments whenever possible; even rough orders of magnitude help readers gauge risk.
- When referencing jargon or new organizations, add a clause that defines them so non-experts can follow.

## Using This Doc
- Reference it while crafting new seed events in src/data/initialScenarioEvents.json.
- Link it from prompts or research summaries in materials/ when arguing about risk factors.
- Update it only when a new dimension repeatedly shows up in scenarios; otherwise keep it short.
`,
  },
];
