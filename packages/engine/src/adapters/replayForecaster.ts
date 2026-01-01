import { parseActionChunk } from '../forecaster/streamingPipeline.js';
import { buildGenerateContentRequest } from '../forecaster/geminiStreaming.js';
import type { Forecaster, ForecasterContext, ForecasterOptions, EngineEvent } from '../types.js';
import { coerceEngineEvents, sortAndDedupEvents } from '../utils/events.js';
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
    async forecast(context: ForecasterContext, options?: ForecasterOptions): Promise<EngineEvent[]> {
      const tape = await loadReplayTape(tapePath);

      if (strict) {
        const incomingHistory = sortAndDedupEvents(context.history);
        const request = buildGenerateContentRequest({
          model: tape.request.model,
          history: incomingHistory,
          systemPrompt: context.systemPrompt,
          options,
        });
        if (JSON.stringify(request) !== JSON.stringify(tape.request)) {
          throw new Error('Replay request mismatch.');
        }
      }

      let history = normalizeHistory(context.history);
      const events: EngineEvent[] = [];

      for (const chunk of tape.stream) {
        if (chunk.delayNs && chunk.delayNs > 0) {
          await delayNs(chunk.delayNs);
        }
        const { events: batch, nextHistory } = parseActionChunk({ actionsJsonl: chunk.text }, history);
        events.push(...batch);
        history = sortAndDedupEvents(nextHistory);
      }

      return events;
    },
  };
}

function normalizeHistory(events: unknown[]): EngineEvent[] {
  const payload = Array.isArray(events) ? events : [];
  const coerced = coerceEngineEvents(payload, 'replay-forecaster');
  return sortAndDedupEvents(coerced);
}

function delayNs(ns: number): Promise<void> {
  const ms = Math.max(0, Math.floor(ns / 1_000_000));
  return new Promise(resolve => setTimeout(resolve, ms));
}
