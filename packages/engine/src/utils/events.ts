import { ICON_SET } from '../constants';
import { slugify } from './strings.js';
import { EngineEventSchema, ScenarioEventSchema } from '../schemas.js';
import type {
  EngineEvent,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
  ScenarioEvent,
  TurnStartedEvent,
  TurnFinishedEvent,
  ScenarioHeadCompletedEvent,
  GameOverEvent,
} from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICONS = new Set<string>(ICON_SET);

export function isNewsPublishedEvent(value: unknown): value is NewsPublishedEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<NewsPublishedEvent>;

  return (
    candidate.type === 'news-published' &&
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

export function isScenarioEvent(value: unknown): value is ScenarioEvent {
  return isNewsPublishedEvent(value) || isHiddenNewsPublishedEvent(value);
}

export function coerceEngineEvents(payload: unknown, context: string): EngineEvent[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Invalid EngineEvent payload from ${context}.`);
  }
  const parsed = EngineEventSchema.array().safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid EngineEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(parsed.data);
}

export function coerceScenarioEvents(payload: unknown, context: string): ScenarioEvent[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  const parsed = ScenarioEventSchema.array().safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(parsed.data) as ScenarioEvent[];
}

export function sortAndDedupEvents<T extends EngineEvent>(events: T[]): T[] {
  const deduped = new Map<string, EngineEvent>();
  events.forEach(event => {
    const key = dedupKey(event);
    deduped.set(key, normalizeEvent(event));
  });
  return [...deduped.values()].sort(compareEvents) as T[];
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
  const lastDate = history[history.length - 1] ? eventDate(history[history.length - 1]) : null;
  if (!lastDate) return;
  const invalid = additions.find(evt => eventDate(evt) < lastDate);
  if (invalid) {
    throw new Error(`Model returned an event with a past date: ${eventDate(invalid)}`);
  }
}

export function applyNewsPatches(history: EngineEvent[]): ScenarioEvent[] {
  const normalized = sortAndDedupEvents(history);
  const newsMap = new Map<string, ScenarioEvent>();

  for (const event of normalized) {
    if (isScenarioEvent(event)) {
      const normalizedNews = normalizeEvent(event) as ScenarioEvent;
      if (normalizedNews.id) {
        newsMap.set(normalizedNews.id, normalizedNews);
      }
      continue;
    }

    if (event.type === 'news-patched') {
      const target = newsMap.get(event.targetId);
      if (!target) continue;
      const patch = event.patch;
      newsMap.set(event.targetId, {
        ...target,
        date: patch.date ?? target.date,
        icon: patch.icon ?? target.icon,
        title: patch.title ?? target.title,
        description: patch.description ?? target.description,
      });
    }
  }

  return sortAndDedupEvents([...newsMap.values()]) as ScenarioEvent[];
}

function normalizeEvent(event: EngineEvent): EngineEvent {
  switch (event.type) {
    case 'news-published': {
      const news = event as NewsPublishedEvent;
      return {
        ...news,
        type: 'news-published',
        id: news.id ?? `news-${news.date}-${slugify(news.title)}`,
      };
    }
    case 'hidden-news-published': {
      const news = event as HiddenNewsPublishedEvent;
      return {
        ...news,
        type: 'hidden-news-published',
        id: news.id ?? `hidden-news-${news.date}-${slugify(news.title)}`,
      };
    }
    case 'news-patched':
    case 'scenario-head-completed':
    case 'game-over':
    case 'turn-started':
    case 'turn-finished':
      return event;
    default:
      return event;
  }
}

function compareEvents(a: EngineEvent, b: EngineEvent): number {
  const dateCompare = eventDate(a).localeCompare(eventDate(b));
  if (dateCompare !== 0) return dateCompare;
  const priorityCompare = eventSortPriority(a) - eventSortPriority(b);
  if (priorityCompare !== 0) return priorityCompare;
  return eventSortTitle(a).localeCompare(eventSortTitle(b));
}

function eventSortPriority(event: EngineEvent): number {
  switch (event.type) {
    case 'turn-started':
      return 0;
    case 'news-published':
      return 1;
    case 'hidden-news-published':
      return 2;
    case 'news-patched':
      return 3;
    case 'scenario-head-completed':
      return 4;
    case 'turn-finished':
      return 5;
    case 'game-over':
      return 6;
    default:
      return 9;
  }
}

function eventSortTitle(event: EngineEvent): string {
  if (event.type === 'news-published') {
    return (event as NewsPublishedEvent).title;
  }
  if (event.type === 'hidden-news-published') {
    return (event as HiddenNewsPublishedEvent).title;
  }
  if (event.type === 'news-patched') {
    return `news-patched-${(event as NewsPatchedEvent).targetId}`;
  }
  if (event.type === 'scenario-head-completed') return 'scenario-head-completed';
  if (event.type === 'game-over') return 'game-over';
  if (event.type === 'turn-started') {
    const evt = event as TurnStartedEvent;
    return `turn-started-${evt.from}-${evt.until}`;
  }
  if (event.type === 'turn-finished') {
    const evt = event as TurnFinishedEvent;
    return `turn-finished-${evt.from}-${evt.until}`;
  }
  return 'event';
}

function dedupKey(event: EngineEvent): string {
  switch (event.type) {
    case 'news-published': {
      const news = event as NewsPublishedEvent;
      return `news-${news.id ?? `${news.date}-${news.title}`}`.toLowerCase();
    }
    case 'hidden-news-published': {
      const news = event as HiddenNewsPublishedEvent;
      return `hidden-news-${news.id ?? `${news.date}-${news.title}`}`.toLowerCase();
    }
    case 'news-patched': {
      const patch = event as NewsPatchedEvent;
      return `news-patched-${patch.targetId}-${patch.date}`;
    }
    case 'scenario-head-completed': {
      const marker = event as ScenarioHeadCompletedEvent;
      return `scenario-head-completed-${marker.date}`;
    }
    case 'game-over': {
      const evt = event as GameOverEvent;
      return `game-over-${evt.date}`;
    }
    case 'turn-started': {
      const evt = event as TurnStartedEvent;
      return `turn-started-${evt.from}-${evt.until}-${evt.actor}`;
    }
    case 'turn-finished': {
      const evt = event as TurnFinishedEvent;
      return `turn-finished-${evt.from}-${evt.until}-${evt.actor}`;
    }
    default:
      return 'event';
  }
}

function eventDate(event: EngineEvent): string {
  if (hasDate(event)) return event.date;
  if (event.type === 'turn-started') return event.from;
  if (event.type === 'turn-finished') return event.until;
  return '1970-01-01';
}

function hasDate(
  event: EngineEvent
): event is
  | NewsPublishedEvent
  | HiddenNewsPublishedEvent
  | NewsPatchedEvent
  | ScenarioHeadCompletedEvent
  | GameOverEvent {
  return 'date' in event && typeof (event as { date?: string }).date === 'string';
}
