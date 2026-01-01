import { writeFile } from 'node:fs/promises';
import { aggregate } from '@ai-forecasting/engine';
import type { EngineEvent } from '@ai-forecasting/engine';
import { readEngineEvents, writeEventsJsonl } from './eventIo.js';

// One-shot aggregator: derives state from history (+optional new events).
export async function runAggregate(opts: {
  inputState?: string;
  inputHistory?: string;
  newEvents?: string;
  outputState: string;
  outputHistory?: string;
}) {
  const history: EngineEvent[] = [];

  if (opts.inputHistory) {
    history.push(...(await readEngineEvents(opts.inputHistory, 'input-history')));
  }

  if (opts.newEvents) {
    history.push(...(await readEngineEvents(opts.newEvents, 'new-events')));
  }

  const state = aggregate(history);
  await writeFile(opts.outputState, JSON.stringify(state, null, 2));

  if (opts.outputHistory) {
    await writeEventsJsonl(opts.outputHistory, history);
  }
}
