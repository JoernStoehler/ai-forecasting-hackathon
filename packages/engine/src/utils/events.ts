import { ICON_SET } from '../constants';
import { slugify } from './strings.js';
import type {
  EngineEvent,
  GameOverEvent,
  HiddenNewsPublishedEvent,
  NewsEvent,
  NewsPatchedEvent,
  NewsPublishedEvent,
  ScenarioEvent,
  ScenarioHeadCompletedEvent,
  TurnFinishedEvent,
  TurnStartedEvent,
} from '../types';

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
    candidate.description.trim().length > 0
  );
}

export function isHiddenNewsPublishedEvent(value: unknown): value is HiddenNewsPublishedEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<HiddenNewsPublishedEvent>;
  return (
    candidate.type === 'hidden-news-published' &&
    typeof candidate.date === 'string' &&
    DATE_PATTERN.test(candidate.date) &&
    typeof candidate.icon === 'string' &&
    ICONS.has(candidate.icon) &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === 'string' &&
    candidate.description.trim().length > 0
  );
}

export function isNewsPatchedEvent(value: unknown): value is NewsPatchedEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<NewsPatchedEvent>;
  if (candidate.type !== 'news-patched') return false;
  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) return false;
  if (typeof candidate.date !== 'string' || !DATE_PATTERN.test(candidate.date)) return false;
  if (!candidate.patch || typeof candidate.patch !== 'object') return false;
  const patch = candidate.patch as NewsPatchedEvent['patch'];
  const hasField = !!patch.date || !!patch.icon || !!patch.title || !!patch.description;
  if (!hasField) return false;
  if (patch.date && !DATE_PATTERN.test(patch.date)) return false;
  if (patch.icon && !ICONS.has(patch.icon)) return false;
  if (patch.title !== undefined && patch.title.trim().length === 0) return false;
  if (patch.description !== undefined && patch.description.trim().length === 0) return false;
  return true;
}

export function isGameOverEvent(value: unknown): value is GameOverEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<GameOverEvent>;
  return (
    candidate.type === 'game-over' &&
    typeof candidate.date === 'string' &&
    DATE_PATTERN.test(candidate.date) &&
    typeof candidate.summary === 'string' &&
    candidate.summary.trim().length > 0
  );
}

export function isScenarioHeadCompletedEvent(
  value: unknown
): value is ScenarioHeadCompletedEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ScenarioHeadCompletedEvent>;
  return (
    candidate.type === 'scenario-head-completed' &&
    typeof candidate.date === 'string' &&
    DATE_PATTERN.test(candidate.date)
  );
}

export function isNewsEvent(value: unknown): value is NewsEvent {
  return isNewsPublishedEvent(value) || isHiddenNewsPublishedEvent(value);
}

export function isEngineEvent(value: unknown): value is EngineEvent {
  return (
    isNewsPublishedEvent(value) ||
    isHiddenNewsPublishedEvent(value) ||
    isNewsPatchedEvent(value) ||
    isGameOverEvent(value) ||
    isScenarioHeadCompletedEvent(value) ||
    isTurnStartedEvent(value) ||
    isTurnFinishedEvent(value)
  );
}

export function coerceScenarioEvents(payload: unknown, context: string): ScenarioEvent[] {
  if (!Array.isArray(payload) || !payload.every(isNewsPublishedEvent)) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(payload) as ScenarioEvent[];
}

export function coerceEngineEvents(payload: unknown, context: string): EngineEvent[] {
  if (!Array.isArray(payload) || !payload.every(isEngineEvent)) {
    throw new Error(`Invalid EngineEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(payload) as EngineEvent[];
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

export function assertChronology(history: EngineEvent[], additions: EngineEvent[]): void {
  const lastDate = history.length ? eventDate(history[history.length - 1]) : null;
  if (!lastDate) return;
  const invalid = additions.find(evt => eventDate(evt) < lastDate);
  if (invalid) {
    throw new Error(`Model returned an event with a past date: ${eventDate(invalid)}`);
  }
}

function normalizeEvent(event: EngineEvent): EngineEvent {
  switch (event.type) {
    case 'turn-started':
    case 'turn-finished':
      return event;
    case 'hidden-news-published': {
      const news = event as HiddenNewsPublishedEvent;
      return {
        ...news,
        id: news.id ?? `hidden-news-${news.date}-${slugify(news.title)}`,
      };
    }
    case 'news-patched':
    case 'game-over':
    case 'scenario-head-completed':
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
  if (event.type === 'news-published') return (event as NewsPublishedEvent).title;
  if (event.type === 'hidden-news-published') return (event as HiddenNewsPublishedEvent).title;
  if (event.type === 'news-patched') return `news-patched-${event.id}`;
  if (event.type === 'game-over') return `game-over-${event.summary}`;
  if (event.type === 'scenario-head-completed') return 'scenario-head-completed';
  if (event.type === 'turn-started') return `turn-started-${event.from}-${event.until}`;
  if (event.type === 'turn-finished') return `turn-finished-${event.from}-${event.until}`;
  return 'event';
}

function dedupKey(event: EngineEvent): string {
  switch (event.type) {
    case 'turn-started':
      return `turn-started-${event.from}-${event.until}-${event.actor}`;
    case 'turn-finished':
      return `turn-finished-${event.from}-${event.until}-${event.actor}`;
    case 'hidden-news-published': {
      const news = event as HiddenNewsPublishedEvent;
      return `hidden-news-${news.date}-${news.title}`.toLowerCase();
    }
    case 'news-patched': {
      const patch = event as NewsPatchedEvent;
      return `news-patched-${patch.id}-${patch.date}-${JSON.stringify(patch.patch)}`;
    }
    case 'game-over': {
      const gameOver = event as GameOverEvent;
      return `game-over-${gameOver.date}-${gameOver.summary}`.toLowerCase();
    }
    case 'scenario-head-completed': {
      const boundary = event as ScenarioHeadCompletedEvent;
      return `scenario-head-completed-${boundary.date}`;
    }
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

function hasDate(event: EngineEvent): event is NewsPublishedEvent | HiddenNewsPublishedEvent | NewsPatchedEvent | GameOverEvent | ScenarioHeadCompletedEvent {
  return 'date' in event && typeof (event as NewsPublishedEvent).date === 'string';
}

function isTurnStartedEvent(value: unknown): value is TurnStartedEvent {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<TurnStartedEvent>;
  return (
    candidate.type === 'turn-started' &&
    typeof candidate.actor === 'string' &&
    (candidate.actor === 'player' || candidate.actor === 'game_master') &&
    typeof candidate.from === 'string' &&
    DATE_PATTERN.test(candidate.from) &&
    typeof candidate.until === 'string' &&
    DATE_PATTERN.test(candidate.until)
  );
}

function isTurnFinishedEvent(value: unknown): value is TurnFinishedEvent {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<TurnFinishedEvent>;
  return (
    candidate.type === 'turn-finished' &&
    typeof candidate.actor === 'string' &&
    (candidate.actor === 'player' || candidate.actor === 'game_master') &&
    typeof candidate.from === 'string' &&
    DATE_PATTERN.test(candidate.from) &&
    typeof candidate.until === 'string' &&
    DATE_PATTERN.test(candidate.until)
  );
}

// Back-compat alias for existing callers.
export const isScenarioEvent = isNewsPublishedEvent;
