
import { createBrowserForecaster, createEngine, MATERIALS, SYSTEM_PROMPT, stripCommentsFromMaterials } from '@ai-forecasting/engine';
import type { ForecasterOptions } from '@ai-forecasting/engine';
import type { EngineEvent } from '../types';

const forecaster = createBrowserForecaster({ apiKey: import.meta.env.GEMINI_API_KEY });
const cleanedMaterials = stripCommentsFromMaterials(MATERIALS);
const systemPrompt = [SYSTEM_PROMPT, ...cleanedMaterials.map(m => `\n[MATERIAL:${m.id}]\n${m.body}`)].join('\n');
const engine = createEngine({ forecaster, systemPrompt });

// PLACEHOLDER LOGIC: thin wrapper that delegates to the engine; no retries/chunking yet.
export async function getAiForecast(
  history: EngineEvent[],
  options?: ForecasterOptions
): Promise<EngineEvent[]> {
  return engine.forecast(history, options);
}
