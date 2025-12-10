export { SYSTEM_PROMPT, ICON_SET, type IconName } from './constants.js';
export { INITIAL_EVENTS } from './data/index.js';
export { MATERIALS, type MaterialDoc } from './data/materials.js';
export {
  coerceScenarioEvents,
  sortAndDedupEvents,
  nextDateAfter,
  assertChronology,
} from './utils/events.js';
export type {
  ScenarioEvent,
  Forecaster,
  ForecasterContext,
  ForecasterOptions,
  EngineApi,
  EngineConfig,
  AggregatedState,
  PreparedPrompt,
} from './types.js';
export {
  ScenarioEventSchema,
  ScenarioEventArraySchema,
  PreparedPromptSchema,
} from './schemas.js';
export { createBrowserForecaster } from './adapters/geminiBrowserForecaster.js';
export { createNodeForecaster } from './adapters/geminiNodeForecaster.js';
export { createMockForecaster } from './adapters/mockForecaster.js';
import type { EngineConfig as Config, EngineApi, ScenarioEvent } from './types.js';
import { coerceScenarioEvents, sortAndDedupEvents, nextDateAfter, assertChronology } from './utils/events.js';
import type { AggregatedState, PreparedPrompt } from './types.js';
import type { GenerateContentConfig, Content } from '@google/genai';

/**
 * Minimal orchestrator: given a forecaster, provide helper methods to run forecasts
 * and merge results. This intentionally stays thin for the “hello world” milestone.
 */
export function createEngine(config: Config): EngineApi {
  const systemPrompt = config.systemPrompt;
  const forecaster = config.forecaster;

  return {
    async forecast(history, options) {
      const forecastEvents = await forecaster.forecast({ history, systemPrompt: systemPrompt ?? '' }, options);
      const validated = coerceScenarioEvents(forecastEvents, forecaster.name);
      assertChronology(history, validated);
      return validated;
    },
    merge(history, additions) {
      return sortAndDedupEvents([...history, ...additions]);
    },
    nextDate(history) {
      return nextDateAfter(history);
    },
    coerce: coerceScenarioEvents,
  } satisfies EngineApi;
}

/**
 * Aggregates history into a derived state cache.
 * State is intentionally re-derivable; we will add richer derived fields later
 * (indexes, hashes) once the prompt/state contract is confirmed.
 */
export function aggregate(history: ScenarioEvent[]): AggregatedState {
  const events = sortAndDedupEvents(history);
  const latestDate = events.length ? events[events.length - 1].date : null;
  return { events, latestDate, eventCount: events.length };
}

/**
 * Builds a self-contained prompt object ready for generateContent.
 * Materials are inlined into systemInstruction. contents is a structured Content[]
 * (history as user text) so the saved prompt is generateContent/Stream-ready.
 */
export function preparePrompt(options: {
  model: string;
  systemPrompt: string;
  history: ScenarioEvent[];
  materials: { id: string; title: string; body: string }[];
}): PreparedPrompt {
  const { model, systemPrompt, history, materials } = options;
  const config: GenerateContentConfig = {
    systemInstruction: [systemPrompt, ...materials.map(m => `\n[MATERIAL:${m.id}]\n${m.body}`)].join('\n'),
    responseMimeType: 'application/json',
  };
  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: JSON.stringify(history, null, 2) }],
    },
  ];
  const request = {
    model,
    contents,
    config,
  };
  return {
    model,
    request,
    materialsUsed: materials.map(m => m.id),
  };
}
