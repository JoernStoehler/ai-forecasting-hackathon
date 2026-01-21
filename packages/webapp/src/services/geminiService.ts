
import { createBrowserForecaster, createMockForecaster, createEngine, MATERIALS, SYSTEM_PROMPT, stripCommentsFromMaterials } from '@/engine';
import type { ForecasterOptions } from '@/engine';
import type { EngineEvent } from '../types';

// Use mock forecaster when VITE_USE_MOCK_FORECASTER is set (for testing/development)
// Otherwise use real Gemini API
const useMock = import.meta.env.VITE_USE_MOCK_FORECASTER === 'true';

// Try process.env.API_KEY first (AI Studio Build), then fallback to Vite env var
// @ts-expect-error - process.env.API_KEY may not exist in non-AI Studio environments
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || import.meta.env.GEMINI_API_KEY;

// Check if API key is missing (and we're not intentionally using mock)
const missingApiKey = !useMock && !apiKey;

const forecaster = useMock
  ? createMockForecaster({ label: 'DEV' })
  : createBrowserForecaster({ apiKey: apiKey });

const cleanedMaterials = stripCommentsFromMaterials(MATERIALS);
const systemPrompt = [SYSTEM_PROMPT, ...cleanedMaterials.map(m => `\n[MATERIAL:${m.id}]\n${m.body}`)].join('\n');
const engine = createEngine({ forecaster, systemPrompt });

// Log which forecaster is active (helpful for debugging)
if (useMock) {
  console.info('🤖 Using MOCK forecaster (VITE_USE_MOCK_FORECASTER=true)');
} else if (missingApiKey) {
  console.error('❌ NO GEMINI API KEY FOUND - Forecaster will fail!');
  console.error('   Expected: process.env.GEMINI_API_KEY or import.meta.env.GEMINI_API_KEY');
  console.error('   In AI Studio Build, this should be automatically injected.');

  // Show user-visible error after a delay to ensure UI is loaded
  setTimeout(() => {
    if (typeof document !== 'undefined') {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #dc2626;
        color: white;
        padding: 16px;
        text-align: center;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      banner.innerHTML = `
        ⚠️ NO GEMINI API KEY FOUND - Game master will not work!<br>
        <small>Expected AI Studio Build to inject GEMINI_API_KEY automatically.</small>
      `;
      document.body.prepend(banner);
    }
  }, 1000);
} else {
  console.info('✨ Using Gemini API forecaster');
  console.info('   API key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
}

// PLACEHOLDER LOGIC: thin wrapper that delegates to the engine; no retries/chunking yet.
export async function getAiForecast(
  history: EngineEvent[],
  options?: ForecasterOptions
): Promise<EngineEvent[]> {
  return engine.forecast(history, options);
}
