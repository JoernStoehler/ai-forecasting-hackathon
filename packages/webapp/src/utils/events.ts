// Re-export engine utils so webapp continues to import from this path.
import type { EngineEvent, NewsEvent, NewsPublishedEvent } from '@ai-forecasting/engine';
import { coerceEngineEvents, sortAndDedupEvents } from '@ai-forecasting/engine';

export { coerceEngineEvents, sortAndDedupEvents };

export function getScenarioHeadDate(events: EngineEvent[]): string | null {
  const sorted = sortAndDedupEvents(events);
  const boundary = [...sorted].reverse().find(event => event.type === 'scenario-head-completed');
  return boundary && 'date' in boundary ? boundary.date : null;
}

export function materializeNewsEvents(events: EngineEvent[]): NewsEvent[] {
  const sorted = sortAndDedupEvents(events);
  const byId = new Map<string, NewsEvent>();

  for (const event of sorted) {
    if (event.type === 'news-published' || event.type === 'hidden-news-published') {
      if (!event.id) continue;
      byId.set(event.id, event);
      continue;
    }

    if (event.type === 'news-patched') {
      const target = byId.get(event.id);
      if (!target) continue;
      const updated: NewsEvent = {
        ...target,
        ...event.patch,
        type: target.type,
        id: target.id,
      };
      byId.set(event.id, updated);
    }
  }

  return sortAndDedupEvents([...byId.values()]) as NewsEvent[];
}

export function getVisibleNews(events: EngineEvent[]): NewsPublishedEvent[] {
  const materialized = materializeNewsEvents(events);
  return materialized.filter(event => event.type === 'news-published') as NewsPublishedEvent[];
}
