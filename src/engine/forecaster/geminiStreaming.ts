import { Type } from '@google/genai';
import type { GenerateContentConfig } from '@google/genai';
import type { ForecasterOptions, EngineEvent } from '../types.js';
import { projectPrompt } from '../utils/promptProjector.js';

export type GenAIClient = {
  models: {
    generateContentStream: (args: {
      model: string;
      contents: string;
      config: GenerateContentConfig;
    }) => AsyncIterable<{ text?: string | (() => string) }>;
  };
};

interface StreamParams {
  client: GenAIClient;
  model: string;
  history: EngineEvent[];
  systemPrompt: string;
  options?: ForecasterOptions;
}

export function buildGenerateContentRequest(params: Omit<StreamParams, 'client'>) {
  const { model, history, systemPrompt, options } = params;
  const projection = projectPrompt({ history });
  return {
    model,
    contents: projection,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ['publish-news', 'publish-hidden-news', 'patch-news', 'game-over', 'roll-dice'],
            },
            id: { type: Type.STRING },
            targetId: { type: Type.STRING },
            date: { type: Type.STRING },
            icon: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            summary: { type: Type.STRING },
            label: { type: Type.STRING },
            patch: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                icon: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
          required: ['type'],
        },
      },
      ...normalizeOptions(options),
    },
  };
}

/**
 * Runs a streaming Gemini call and yields raw text chunks (JSON/JSONL) so that
 * higher layers can parse incrementally and feed state back into validation.
 */
export async function* streamGeminiRaw(params: StreamParams): AsyncGenerator<string> {
  const { client, ...rest } = params;
  const stream = await client.models.generateContentStream(buildGenerateContentRequest(rest));

  for await (const part of stream) {
    const chunk = (part as unknown as { text?: string | (() => string) }).text;
    const piece = typeof chunk === 'function' ? chunk() : chunk ?? '';
    if (piece && piece.trim().length > 0) {
      yield piece;
    }
  }
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
