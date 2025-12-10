import { ICON_SET } from '../constants';
import type { EngineEvent, NewsEvent, ScenarioEvent } from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICONS = new Set<string>(ICON_SET);

export function isNewsEvent(value: unknown): value is NewsEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<NewsEvent>;

  return (
    typeof candidate.date === 'string' &&
    DATE_PATTERN.test(candidate.date) &&
    typeof candidate.icon === 'string' &&
    ICONS.has(candidate.icon) &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === 'string' &&
    candidate.description.trim().length > 0 &&
    (candidate.postMortem === undefined || typeof candidate.postMortem === 'boolean')
  );
}

export function coerceScenarioEvents(payload: unknown, context: string): ScenarioEvent[] {
  if (!Array.isArray(payload) || !payload.every(isNewsEvent)) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(payload);
}

export function sortAndDedupEvents<T extends EngineEvent>(events: T[]): T[] {
  const deduped = new Map<string, EngineEvent>();
  events.forEach(event => {
    const key = event.type === 'story-opened'
      ? `story-opened-${event.refId}-${event.date}`
      : `news-${event.date}-${event.title}`.toLowerCase();
    deduped.set(key, normalizeEvent(event));
  });
  return [...deduped.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || getTitle(a).localeCompare(getTitle(b))
  ) as T[];
}

export function nextDateAfter(history: EngineEvent[]): string {
  if (history.length === 0) {
    return new Date().toISOString().split('T')[0];
  }
  const last = history[history.length - 1];
  const date = new Date(`${last.date}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split('T')[0];
}

export function assertChronology(history: ScenarioEvent[], additions: ScenarioEvent[]): void {
  const lastDate = history[history.length - 1]?.date;
  if (!lastDate) return;
  const invalid = additions.find(evt => evt.date < lastDate);
  if (invalid) {
    throw new Error(`Model returned an event with a past date: ${invalid.date}`);
  }
}

function normalizeEvent(event: EngineEvent): EngineEvent {
  if (event.type === 'story-opened') {
    return {
      ...event,
      type: 'story-opened',
      id: event.id ?? `story-opened-${event.refId}-${event.date}`,
    };
  }
  const news = event as NewsEvent;
  return {
    ...news,
    type: news.type ?? 'news',
    id: news.id ?? `news-${news.date}-${slug(news.title)}`,
  };
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function getTitle(event: EngineEvent): string {
  return event.type === 'story-opened' ? `story-opened-${event.refId}` : event.title;
}

// Back-compat alias for existing callers.
export const isScenarioEvent = isNewsEvent;
