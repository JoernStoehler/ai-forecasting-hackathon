import { writeFile, readFile } from 'node:fs/promises';
import { ScenarioEventArraySchema, type ScenarioEvent } from '@ai-forecasting/engine';

// Parses a raw Gemini response file into validated ScenarioEvents JSONL.
export async function runParse(opts: {
  inputJson: string;
  outputEvents: string;
}) {
  const raw = await readFile(opts.inputJson, 'utf-8');
  const parsed = JSON.parse(raw);
  // Assume parsed.text contains JSON array; adjust if SDK shape differs.
  const text = typeof parsed.text === 'string' ? parsed.text : JSON.stringify(parsed, null, 2);
  const events = ScenarioEventArraySchema.parse(JSON.parse(text));
  await writeJsonl(opts.outputEvents, events);
}

async function writeJsonl(path: string, events: ScenarioEvent[]) {
  const lines = events.map(evt => JSON.stringify(evt)).join('\n');
  await writeFile(path, lines, 'utf-8');
}
