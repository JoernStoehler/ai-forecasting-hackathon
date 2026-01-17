
import { createBrowserForecaster, createMockForecaster, createEngine, MATERIALS, SYSTEM_PROMPT, stripCommentsFromMaterials } from '@ai-forecasting/engine';
import type { ForecasterOptions } from '@ai-forecasting/engine';
import type { EngineEvent } from '../types';

// Use mock forecaster when VITE_USE_MOCK_FORECASTER is set (for testing/development)
// Otherwise use real Gemini API
const useMock = import.meta.env.VITE_USE_MOCK_FORECASTER === 'true';

const forecaster = useMock
  ? createMockForecaster({ label: 'DEV' })
  : createBrowserForecaster({ apiKey: import.meta.env.GEMINI_API_KEY });

const cleanedMaterials = stripCommentsFromMaterials(MATERIALS);
const systemPrompt = [SYSTEM_PROMPT, ...cleanedMaterials.map(m => `\n[MATERIAL:${m.id}]\n${m.body}`)].join('\n');
const engine = createEngine({ forecaster, systemPrompt });

// Log which forecaster is active (helpful for debugging)
if (useMock) {
  console.info('🤖 Using MOCK forecaster (VITE_USE_MOCK_FORECASTER=true)');
} else {
  console.info('✨ Using Gemini API forecaster');
}

// PLACEHOLDER LOGIC: thin wrapper that delegates to the engine; no retries/chunking yet.
export async function getAiForecast(
  history: EngineEvent[],
  options?: ForecasterOptions
): Promise<EngineEvent[]> {
  return engine.forecast(history, options);
}
