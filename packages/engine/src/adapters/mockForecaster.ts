import type { Forecaster, ForecasterContext, EngineEvent } from '../types.js';
import { nextDateAfter } from '../utils/events.js';

export interface MockForecasterOptions {
  /** Title prefix to make it obvious this is synthetic. */
  label?: string;
}

export function createMockForecaster(opts: MockForecasterOptions = {}): Forecaster {
  const label = opts.label ?? 'MOCK';

  return {
    name: 'mock',
    async forecast(context: ForecasterContext): Promise<EngineEvent[]> {
      const nextDate = nextDateAfter(context.history);
      // PLACEHOLDER LOGIC: deterministic single event to keep flows testable without real AI.
      return [
        {
          type: 'news-published',
          id: `mock-${nextDate}`,
          date: nextDate,
          icon: 'BrainCircuit',
          title: `${label} forecast event`,
          description: 'Placeholder forecast — replace with real model output when running with Gemini.',
        },
      ];
    },
  };
}
