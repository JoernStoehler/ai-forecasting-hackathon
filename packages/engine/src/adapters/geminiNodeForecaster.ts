import { GoogleGenAI, Type } from '@google/genai';
import type { Forecaster, ForecasterContext, ForecasterOptions } from '../types.js';
import { coerceScenarioEvents, assertChronology } from '../utils/events.js';

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

      // PLACEHOLDER LOGIC: straight request/response; no chunking, no retries.
      const response = await ai.models.generateContent({
        model,
        contents: JSON.stringify(context.history, null, 2),
        config: {
          systemInstruction: context.systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                icon: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                postMortem: { type: Type.BOOLEAN },
              },
              required: ['date', 'icon', 'title', 'description'],
            },
          },
          ...normalizeOptions(options),
        },
      });

      const text = typeof response.text === 'string' ? response.text.trim() : '';
      if (!text) {
        throw new Error('Gemini response did not include text content.');
      }

      const newEvents = coerceScenarioEvents(JSON.parse(text), 'Gemini response');
      assertChronology(context.history, newEvents);
      return newEvents;
    },
  };
}

function normalizeOptions(options?: ForecasterOptions) {
  if (!options) return undefined;
  const { temperature, seed, maxEvents } = options;
  return {
    ...(temperature !== undefined ? { temperature } : {}),
    ...(seed !== undefined ? { seed } : {}),
    ...(maxEvents !== undefined ? { maxOutputTokens: Math.max(256, maxEvents * 128) } : {}),
  };
}
