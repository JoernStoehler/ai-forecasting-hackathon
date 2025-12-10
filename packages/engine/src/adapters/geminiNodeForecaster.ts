import { GoogleGenAI } from '@google/genai';
import type { Forecaster, ForecasterContext, ForecasterOptions, ScenarioEvent } from '../types.js';
import { streamGeminiRaw, type GenAIClient } from '../forecaster/geminiStreaming.js';
import { parseActionChunk } from '../forecaster/streamingPipeline.js';
import { isNewsEvent } from '../utils/events.js';

interface NodeForecasterConfig {
  apiKey?: string;
  model?: string;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function createNodeForecaster(config: NodeForecasterConfig = {}): Forecaster {
  const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;
  const model = config.model ?? DEFAULT_MODEL;

  const ai = new GoogleGenAI({ apiKey: apiKey ?? '' });

  return {
    name: 'gemini-node',
    async forecast(context: ForecasterContext, options?: ForecasterOptions) {
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Export it before running the CLI.');
      }

      // Only send news events to the model; UI events like story-opened are omitted.
      let history = context.history.filter(isNewsEvent) as ScenarioEvent[];
      const events: ScenarioEvent[] = [];
      for await (const raw of streamGeminiRaw({ client: ai as unknown as GenAIClient, model, history, systemPrompt: context.systemPrompt, options })) {
        const { events: batch, nextHistory } = parseActionChunk({ actionsJsonl: raw }, history);
        events.push(...batch);
        history = nextHistory;
      }
      return events;
    },
  };
}
