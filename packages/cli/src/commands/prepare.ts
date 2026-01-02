import { writeFile } from 'node:fs/promises';
import { MATERIALS, preparePrompt, PreparedPromptSchema, SYSTEM_PROMPT } from '@ai-forecasting/engine';
import { readEngineEvents } from './eventIo.js';

// Builds a self-contained prompt.json (with inlined materials) for later call/replay.
// OPEN QUESTION: owner to confirm contents shape (string vs Content[]); see PreparedPrompt comment in engine.
const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPT;
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
