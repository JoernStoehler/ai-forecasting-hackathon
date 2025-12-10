import { ICON_SET } from '../constants';
import { slugify } from './strings.js';
import type { EngineEvent, NewsPublishedEvent, ScenarioEvent, StoryClosedEvent, StoryOpenedEvent } from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICONS = new Set<string>(ICON_SET);

export function isNewsPublishedEvent(value: unknown): value is NewsPublishedEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<NewsPublishedEvent>;

  return (
    (candidate.type === undefined || candidate.type === 'news-published' || candidate.type === 'news') &&
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
  if (!Array.isArray(payload) || !payload.every(isNewsPublishedEvent)) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(payload) as ScenarioEvent[];
}

export function sortAndDedupEvents<T extends EngineEvent>(events: T[]): T[] {
  const deduped = new Map<string, EngineEvent>();
  events.forEach(event => {
    const key = dedupKey(event);
    deduped.set(key, normalizeEvent(event));
  });
  return [...deduped.values()].sort(
    (a, b) =>
      eventDate(a).localeCompare(eventDate(b)) || getTitle(a).localeCompare(getTitle(b))
  ) as T[];
}

export function nextDateAfter(history: EngineEvent[]): string {
  if (history.length === 0) {
    return new Date().toISOString().split('T')[0];
  }
  const last = history[history.length - 1];
  const dateStr = eventDate(last);
  const date = new Date(`${dateStr}T00:00:00Z`);
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
  switch (event.type) {
    case 'story-opened':
      return {
        ...event,
        id: event.id ?? `story-opened-${slugify(event.date)}`,
      };
    case 'story-closed':
      return {
        ...event,
        id: event.id ?? `story-closed-${slugify(event.date)}`,
      };
    case 'turn-started':
    case 'turn-finished':
      return event;
    case 'news-published':
    default: {
      const news = event as NewsPublishedEvent;
      return {
        ...news,
        type: 'news-published',
        id: news.id ?? `news-${news.date}-${slugify(news.title)}`,
      };
    }
  }
}

function getTitle(event: EngineEvent): string {
  if (event.type === 'news-published') {
    return (event as NewsPublishedEvent).title;
  }
  if (event.type === 'story-opened') return `story-opened-${event.id}`;
  if (event.type === 'story-closed') return `story-closed-${event.id}`;
  if (event.type === 'turn-started') return `turn-started-${event.from}-${event.until}`;
  if (event.type === 'turn-finished') return `turn-finished-${event.from}-${event.until}`;
  return 'event';
}

function dedupKey(event: EngineEvent): string {
  switch (event.type) {
    case 'story-opened':
      return `story-opened-${event.id ?? 'missing'}-${event.date}`;
    case 'story-closed':
      return `story-closed-${event.id ?? 'missing'}-${event.date}`;
    case 'turn-started':
      return `turn-started-${event.from}-${event.until}-${event.actor}`;
    case 'turn-finished':
      return `turn-finished-${event.from}-${event.until}-${event.actor}`;
    case 'news-published':
    default: {
      const news = event as NewsPublishedEvent;
      return `news-${news.date}-${news.title}`.toLowerCase();
    }
  }
}

function eventDate(event: EngineEvent): string {
  if (hasDate(event)) return event.date;
  if (event.type === 'turn-started' || event.type === 'turn-finished') return event.from;
  return '1970-01-01';
}

function hasDate(
  event: EngineEvent
): event is NewsPublishedEvent | StoryClosedEvent | StoryOpenedEvent {
  return 'date' in event && typeof (event as NewsPublishedEvent).date === 'string';
}

// Back-compat alias for existing callers.
export const isScenarioEvent = isNewsPublishedEvent;
