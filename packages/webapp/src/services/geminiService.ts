
import { createBrowserForecaster, createEngine, SYSTEM_PROMPT } from '@ai-forecasting/engine';
import type { ForecasterOptions } from '@ai-forecasting/engine';
import type { EngineEvent } from '../types';

const forecaster = createBrowserForecaster({ apiKey: import.meta.env.GEMINI_API_KEY });
const engine = createEngine({ forecaster, systemPrompt: SYSTEM_PROMPT });

// PLACEHOLDER LOGIC: thin wrapper that delegates to the engine; no retries/chunking yet.
export async function getAiForecast(
  history: EngineEvent[],
  options?: ForecasterOptions
): Promise<EngineEvent[]> {
  return engine.forecast(history, options);
}
