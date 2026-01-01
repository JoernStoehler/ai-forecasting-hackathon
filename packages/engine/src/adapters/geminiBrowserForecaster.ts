import { GoogleGenAI } from '@google/genai';
import type { Forecaster, ForecasterContext, ForecasterOptions, EngineEvent } from '../types.js';
import { streamGeminiRaw, type GenAIClient } from '../forecaster/geminiStreaming.js';
import { parseActionChunk } from '../forecaster/streamingPipeline.js';

interface BrowserForecasterConfig {
  apiKey: string | undefined;
  model?: string;
  /** Optional custom client (e.g., replay/recording). */
  client?: GenAIClient;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function createBrowserForecaster(config: BrowserForecasterConfig): Forecaster {
  const apiKey = config.apiKey;
  const model = config.model ?? DEFAULT_MODEL;

  const ai = config.client ?? (new GoogleGenAI({ apiKey: apiKey ?? '' }) as unknown as GenAIClient);

  return {
    name: 'gemini-browser',
    async forecast(context: ForecasterContext, options?: ForecasterOptions) {
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Add it to your .env.local or hosting env.');
      }

      let history = context.history;
      const events: EngineEvent[] = [];
      for await (const raw of streamGeminiRaw({ client: ai as unknown as GenAIClient, model, history, systemPrompt: context.systemPrompt, options })) {
        const { events: batch, nextHistory } = parseActionChunk({ actionsJsonl: raw }, history);
        events.push(...batch);
        history = nextHistory;
      }
      return events;
    },
  };
}
