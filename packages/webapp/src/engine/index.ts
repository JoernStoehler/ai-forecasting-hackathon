export { SYSTEM_PROMPT, ICON_SET, type IconName } from './constants.js';
export { INITIAL_EVENTS } from './data/index.js';
export { MATERIALS, type MaterialDoc } from './data/materials.js';
export {
  coerceEngineEvents,
  coerceScenarioEvents,
  sortAndDedupEvents,
  nextDateAfter,
  assertChronology,
  applyNewsPatches,
} from './utils/events.js';
export { normalizePublishNews, normalizePublishHiddenNews, normalizePatchNews } from './utils/normalize.js';
export { stripHtmlComments, stripCommentsFromMaterials } from './utils/materials.js';
export type {
  ScenarioEvent,
  EngineEvent,
  Command,
  PublishNewsCommand,
  PublishHiddenNewsCommand,
  PatchNewsCommand,
  GameOverCommand,
  RollDiceCommand,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
  NewsOpenedEvent,
  NewsClosedEvent,
  ScenarioHeadCompletedEvent,
  GameOverEvent,
  TurnStartedEvent,
  TurnFinishedEvent,
  DiceRolledEvent,
  Forecaster,
  ForecasterContext,
  ForecasterOptions,
  EngineApi,
  EngineConfig,
  AggregatedState,
  PreparedPrompt,
} from './types.js';
export {
  PublishNewsCommandSchema,
  PublishHiddenNewsCommandSchema,
  PatchNewsCommandSchema,
  GameOverCommandSchema,
  RollDiceCommandSchema,
  CommandSchema,
  CommandArraySchema,
  NewsPublishedEventSchema,
  HiddenNewsPublishedEventSchema,
  NewsPatchedEventSchema,
  NewsOpenedEventSchema,
  NewsClosedEventSchema,
  ScenarioHeadCompletedEventSchema,
  GameOverEventSchema,
  TurnStartedEventSchema,
  TurnFinishedEventSchema,
  DiceRolledEventSchema,
  EngineEventSchema,
  ScenarioEventSchema,
  ScenarioEventArraySchema,
  PreparedPromptSchema,
} from './schemas.js';
export { createBrowserForecaster } from './adapters/geminiBrowserForecaster.js';
export { createNodeForecaster } from './adapters/geminiNodeForecaster.js';
export { createMockForecaster } from './adapters/mockForecaster.js';
export type { ReplayTape, ReplayChunk } from './forecaster/replayTypes.js';
import type { EngineConfig as Config, EngineApi, EngineEvent } from './types.js';
import { coerceEngineEvents, sortAndDedupEvents, nextDateAfter, assertChronology } from './utils/events.js';
import type { AggregatedState, PreparedPrompt } from './types.js';
import type { GenerateContentConfig, Content } from '@google/genai';
import { projectPrompt } from './utils/promptProjector.js';
import { stripCommentsFromMaterials } from './utils/materials.js';

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
      const validated = coerceEngineEvents(forecastEvents, forecaster.name);
      assertChronology(history, validated);
      return validated;
    },
    merge(history, additions) {
      return sortAndDedupEvents([...history, ...additions]);
    },
    nextDate(history) {
      return nextDateAfter(history);
    },
    coerce: coerceEngineEvents,
  } satisfies EngineApi;
}

/**
 * Aggregates history into a derived state cache.
 * State is intentionally re-derivable; we will add richer derived fields later
 * (indexes, hashes) once the prompt/state contract is confirmed.
 */
export function aggregate(history: EngineEvent[]): AggregatedState {
  const events = sortAndDedupEvents(history);
  const dateCandidates = events
    .map(evt =>
      'date' in evt
        ? (evt as { date: string }).date
        : evt.type === 'turn-started'
          ? evt.from
          : evt.type === 'turn-finished'
            ? evt.until
            : null
    )
    .filter((d): d is string => !!d)
    .sort();
  const latestDate = dateCandidates.length ? dateCandidates[dateCandidates.length - 1] : null;
  return { events, latestDate, eventCount: events.length };
}

/**
 * Builds a self-contained prompt object ready for generateContent.
 * Materials are inlined into systemInstruction. contents is a structured Content[]
 * with projected timeline/dynamic blocks so the saved prompt is generateContent/Stream-ready.
 * HTML comments are stripped from materials before including them in the prompt.
 */
export function preparePrompt(options: {
  model: string;
  systemPrompt: string;
  history: EngineEvent[];
  materials: { id: string; title: string; body: string }[];
}): PreparedPrompt {
  const { model, systemPrompt, history, materials } = options;
  const projection = projectPrompt({ history });
  
  // Strip HTML comments from materials before inlining
  const cleanedMaterials = stripCommentsFromMaterials(materials);
  
  const config: GenerateContentConfig = {
    systemInstruction: [systemPrompt, ...cleanedMaterials.map(m => `\n[MATERIAL:${m.id}]\n${m.body}`)].join('\n'),
    responseMimeType: 'application/json',
  };
  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: projection }],
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
