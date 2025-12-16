import { parseActionChunk } from '../forecaster/streamingPipeline.js';
import type { Forecaster, ForecasterContext, ForecasterOptions, ScenarioEvent } from '../types.js';
import { isScenarioEvent, coerceScenarioEvents, sortAndDedupEvents } from '../utils/events.js';
import { loadReplayTape } from '../forecaster/replayClient.js';

interface ReplayForecasterConfig {
  tapePath: string;
  /** When true, enforces request match (recommended). */
  strict?: boolean;
}

/**
 * Forecaster that replays a recorded Gemini stream from a JSON tape.
 * Honours chunk delays to exercise streaming/latency-sensitive code.
 */
export function createReplayForecaster(config: ReplayForecasterConfig): Forecaster {
  const { tapePath, strict = true } = config;

  return {
    name: 'replay',
    async forecast(context: ForecasterContext, _options?: ForecasterOptions): Promise<ScenarioEvent[]> {
      const tape = await loadReplayTape(tapePath);

      if (strict) {
        // Validate request equivalence.
        const incomingHistory = normalizeHistory(context.history);
        const tapeHistory = normalizeHistory(tape.request.history);
        if (tape.request.model !== 'gemini-2.5-flash') {
          // Non-blocking note: we do not force model match beyond recorded value here.
        }
        if (tape.request.systemPrompt !== context.systemPrompt) {
          throw new Error('Replay systemPrompt mismatch.');
        }
        if (JSON.stringify(incomingHistory) !== JSON.stringify(tapeHistory)) {
          throw new Error('Replay history mismatch.');
        }
      }

      let history = normalizeHistory(context.history.filter(isScenarioEvent));
      const events: ScenarioEvent[] = [];

      for (const chunk of tape.stream) {
        if (chunk.delayNs && chunk.delayNs > 0) {
          await delayNs(chunk.delayNs);
        }
        const { events: batch, nextHistory } = parseActionChunk({ actionsJsonl: chunk.text }, history);
        const newsOnly = batch.filter(isScenarioEvent) as ScenarioEvent[];
        events.push(...newsOnly);
        history = sortAndDedupEvents(nextHistory).filter(isScenarioEvent);
      }

      return events;
    },
  };
}

function normalizeHistory(events: unknown[]): ScenarioEvent[] {
  const newsOnly = Array.isArray(events) ? events.filter(isScenarioEvent) : [];
  const coerced = coerceScenarioEvents(newsOnly, 'replay-forecaster');
  return sortAndDedupEvents(coerced);
}

function delayNs(ns: number): Promise<void> {
  const ms = Math.max(0, Math.floor(ns / 1_000_000));
  return new Promise(resolve => setTimeout(resolve, ms));
}
