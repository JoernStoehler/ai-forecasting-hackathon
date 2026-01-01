import { parseActionChunk } from '../forecaster/streamingPipeline.js';
import { buildGenerateContentRequest } from '../forecaster/geminiStreaming.js';
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
    async forecast(context: ForecasterContext, options?: ForecasterOptions): Promise<ScenarioEvent[]> {
      const tape = await loadReplayTape(tapePath);

      if (strict) {
        const incomingHistory = context.history.filter(isScenarioEvent);
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
