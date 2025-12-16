import { GoogleGenAI } from '@google/genai';
import type { Forecaster, ForecasterContext, ForecasterOptions, ScenarioEvent } from '../types.js';
import { streamGeminiRaw, type GenAIClient } from '../forecaster/geminiStreaming.js';
import { parseActionChunk } from '../forecaster/streamingPipeline.js';
import { isNewsPublishedEvent } from '../utils/events.js';

interface NodeForecasterConfig {
  apiKey?: string;
  model?: string;
  /** Optional custom client (e.g., replay/recording). */
  client?: GenAIClient;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function createNodeForecaster(config: NodeForecasterConfig = {}): Forecaster {
  const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;
  const model = config.model ?? DEFAULT_MODEL;

  const ai = config.client ?? (new GoogleGenAI({ apiKey: apiKey ?? '' }) as unknown as GenAIClient);

  return {
    name: 'gemini-node',
    async forecast(context: ForecasterContext, options?: ForecasterOptions) {
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Export it before running the CLI.');
      }

      // Only send news events to the model; UI events like story-opened are omitted.
      let history = context.history.filter(isNewsPublishedEvent) as ScenarioEvent[];
      const events: ScenarioEvent[] = [];
      for await (const raw of streamGeminiRaw({ client: ai as unknown as GenAIClient, model, history, systemPrompt: context.systemPrompt, options })) {
        const { events: batch, nextHistory } = parseActionChunk({ actionsJsonl: raw }, history);
        const newsOnly = batch.filter(isNewsPublishedEvent) as ScenarioEvent[];
        events.push(...newsOnly);
        history = nextHistory.filter(isNewsPublishedEvent) as ScenarioEvent[];
      }
      return events;
    },
  };
}
