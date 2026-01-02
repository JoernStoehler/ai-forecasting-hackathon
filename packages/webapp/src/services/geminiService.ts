
import { createBrowserForecaster, createEngine, MATERIALS, SYSTEM_PROMPT, stripCommentsFromMaterials } from '@ai-forecasting/engine';
import type { ForecasterOptions } from '@ai-forecasting/engine';
import type { EngineEvent } from '../types';

const forecaster = createBrowserForecaster({ apiKey: import.meta.env.GEMINI_API_KEY });
const cleanedMaterials = stripCommentsFromMaterials(MATERIALS);
const systemPromptWithMaterials = [
  SYSTEM_PROMPT,
  ...cleanedMaterials.map(material => `\n[MATERIAL:${material.id}]\n${material.body}`),
].join('\n');
const engine = createEngine({ forecaster, systemPrompt: systemPromptWithMaterials });

// PLACEHOLDER LOGIC: thin wrapper that delegates to the engine; no retries/chunking yet.
export async function getAiForecast(
  history: EngineEvent[],
  options?: ForecasterOptions
): Promise<EngineEvent[]> {
  return engine.forecast(history, options);
}
