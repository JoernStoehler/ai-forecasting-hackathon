import { readFile, writeFile } from 'node:fs/promises';
import { aggregate, coerceScenarioEvents } from '@ai-forecasting/engine';
import type { ScenarioEvent } from '@ai-forecasting/engine';

// One-shot aggregator: derives state from history (+optional new events).
export async function runAggregate(opts: {
  inputState?: string;
  inputHistory?: string;
  newEvents?: string;
  outputState: string;
  outputHistory?: string;
}) {
  const history: ScenarioEvent[] = [];

  if (opts.inputHistory) {
    history.push(...(await readEvents(opts.inputHistory, 'input-history')));
  }

  if (opts.newEvents) {
    history.push(...(await readEvents(opts.newEvents, 'new-events')));
  }

  const state = aggregate(history);
  await writeFile(opts.outputState, JSON.stringify(state, null, 2));

  if (opts.outputHistory) {
    await writeEvents(opts.outputHistory, history);
  }
}

async function readEvents(path: string, label: string): Promise<ScenarioEvent[]> {
  const text = await readFile(path, 'utf-8');
  const lines = text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  return coerceScenarioEvents(lines, label);
}

async function writeEvents(path: string, events: ScenarioEvent[]) {
  const lines = events.map(evt => JSON.stringify(evt)).join('\n');
  await writeFile(path, lines);
}
