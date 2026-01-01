import { writeFile } from 'node:fs/promises';
import { MATERIALS, preparePrompt, PreparedPromptSchema } from '@ai-forecasting/engine';
import { readEngineEvents } from './eventIo.js';

// Builds a self-contained prompt.json (with inlined materials) for later call/replay.
// OPEN QUESTION: owner to confirm contents shape (string vs Content[]); see PreparedPrompt comment in engine.
const DEFAULT_SYSTEM_PROMPT = `SYSTEM ROLE: Simulation engine for an AI takeoff timeline.

YOU RECEIVE:
- A timeline history rendered as JSONL (one event per line).
- A dynamic block with the latest known date and current turn window.
- The user controls ONE organization. Default: the United States government and military.

YOU OUTPUT:
- Strictly a JSON array of Command objects (no extra text, no markdown).
- Command schema:
  - publish-news: { type: "publish-news", id?: string, date: "YYYY-MM-DD", icon: IconName, title: string, description: string }
  - publish-hidden-news: { type: "publish-hidden-news", id?: string, date: "YYYY-MM-DD", icon: IconName, title: string, description: string }
  - patch-news: { type: "patch-news", id: "existing-news-id", date: "YYYY-MM-DD", patch: { date?: "YYYY-MM-DD", icon?: IconName, title?: string, description?: string } }
  - game-over: { type: "game-over", date: "YYYY-MM-DD", summary: string }
- All command dates must be on or after the latest date in history.
- For publish-news.icon, use a valid icon name from the Lucide icon library in PascalCase (e.g., "Landmark").
- Titles state the core fact in plain language. Descriptions add enough context for a reader whose knowledge cutoff is June 1, 2024.
- Use publish-hidden-news only for events that should be hidden from the player timeline.
- Never take actions reserved for the user-controlled organization. You may describe consequences and third-party reactions.
- Aim for 1–5 commands per turn to preserve alternation pacing.

SCOPE AND STYLE:
- Simulate a single concrete continuation that is detailed and specific.
- Focus on AI labs, model releases, evals/safety, compute supply chain, corporate moves, regulation, geopolitics affecting AI, macroeconomy, and social/cultural shifts tied to AI.
- Prefer quantitative magnitudes (orders of magnitude, percentages, dates) where suitable.
- Avoid buzzwords and vague verbs. Be concise and factual.

CHECKS BEFORE SENDING:
- Output is valid JSON representing Command[].
- Dates are non-decreasing.`;
export async function runPrepare(opts: {
  inputState: string;
  inputHistory: string;
  materials?: string; // comma-separated ids or 'all'
  model: string;
  systemPrompt: string;
  outputPrompt: string;
}) {
  const history = await readEvents(opts.inputHistory, 'input-history');
  const mats = selectMaterials(opts.materials);
  const prompt = preparePrompt({
    model: opts.model,
    systemPrompt: opts.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    history,
    materials: mats,
  });
  // Validate prompt structure aggressively; escalate if malformed.
  PreparedPromptSchema.parse(prompt);
  await writeFile(opts.outputPrompt, JSON.stringify(prompt, null, 2));
}

function selectMaterials(spec?: string) {
  if (!spec || spec === 'none') return [] as typeof MATERIALS;
  if (spec === 'all') return MATERIALS;
  const ids = spec.split(',').map(s => s.trim()).filter(Boolean);
  return MATERIALS.filter(m => ids.includes(m.id));
}

async function readEvents(path: string, label: string) {
  return readEngineEvents(path, label);
}
