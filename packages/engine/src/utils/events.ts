import { ICON_SET } from "../constants";
import { EngineEventSchema } from "../schemas.js";
import { slugify } from "./strings.js";
import type {
  EngineEvent,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  ScenarioEvent,
  NewsPatchedEvent,
  ScenarioHeadCompletedEvent,
  GameOverEvent,
} from "../types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICONS = new Set<string>(ICON_SET);

export function isNewsPublishedEvent(value: unknown): value is NewsPublishedEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<NewsPublishedEvent>;

  return (
    candidate.type === "news-published" &&
    typeof candidate.date === "string" &&
    DATE_PATTERN.test(candidate.date) &&
    typeof candidate.icon === "string" &&
    ICONS.has(candidate.icon) &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0
  );
}

export function isHiddenNewsPublishedEvent(
  value: unknown
): value is HiddenNewsPublishedEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<HiddenNewsPublishedEvent>;

  return (
    candidate.type === "hidden-news-published" &&
    typeof candidate.date === "string" &&
    DATE_PATTERN.test(candidate.date) &&
    typeof candidate.icon === "string" &&
    ICONS.has(candidate.icon) &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0
  );
}

export function isScenarioEvent(value: unknown): value is ScenarioEvent {
  return isNewsPublishedEvent(value) || isHiddenNewsPublishedEvent(value);
}

export function isNewsPatchedEvent(value: unknown): value is NewsPatchedEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as NewsPatchedEvent).type === "news-patched"
  );
}

export function coerceEngineEvents(payload: unknown, context: string): EngineEvent[] {
  const result = EngineEventSchema.array().safeParse(payload);
  if (!result.success) {
    throw new Error(`Invalid EngineEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(result.data);
}

export function sortAndDedupEvents<T extends EngineEvent>(events: T[]): T[] {
  const deduped = new Map<string, EngineEvent>();
  events.forEach(event => {
    const key = dedupKey(event);
    deduped.set(key, normalizeEvent(event));
  });
  return [...deduped.values()].sort(
    (a, b) =>
      (eventDate(a) ?? "").localeCompare(eventDate(b) ?? "") ||
      getTitle(a).localeCompare(getTitle(b))
  ) as T[];
}

export function nextDateAfter(history: EngineEvent[]): string {
  if (history.length === 0) {
    return new Date().toISOString().split("T")[0];
  }
  const dateStr = latestEventDate(history);
  if (!dateStr) {
    return new Date().toISOString().split("T")[0];
  }
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}

export function assertChronology(history: EngineEvent[], additions: EngineEvent[]): void {
  const lastDate = latestEventDate(history);
  if (!lastDate) return;
  const invalid = additions.find(evt => {
    const date = eventDate(evt);
    return date !== null && date < lastDate;
  });
  if (invalid) {
    throw new Error(
      `Model returned an event with a past date: ${eventDate(invalid) ?? "unknown"}`
    );
  }
}

export function applyNewsPatches(history: EngineEvent[]): ScenarioEvent[] {
  const ordered = sortAndDedupEvents(history);
  const byId = new Map<string, ScenarioEvent>();
  const publishOrder: string[] = [];

  for (const event of ordered) {
    if (isScenarioEvent(event)) {
      const normalized = normalizeEvent(event) as ScenarioEvent;
      const id = normalized.id ?? `${normalized.date}-${normalized.title}`;
      if (!byId.has(id)) {
        publishOrder.push(id);
      }
      byId.set(id, { ...normalized, id });
      continue;
    }

    if (event.type === "news-patched") {
      const target = byId.get(event.id);
      if (!target) continue;
      byId.set(event.id, {
        ...target,
        ...event.patch,
        id: event.id,
        type: target.type,
      });
    }
  }

  const patched = publishOrder
    .map(id => byId.get(id))
    .filter((evt): evt is ScenarioEvent => !!evt);
  return sortAndDedupEvents(patched) as ScenarioEvent[];
}

export function latestEventDate(history: EngineEvent[]): string | null {
  const dates = history
    .map(eventDate)
    .filter((date): date is string => typeof date === "string");
  if (!dates.length) return null;
  return dates.sort()[dates.length - 1] ?? null;
}

function normalizeEvent(event: EngineEvent): EngineEvent {
  switch (event.type) {
    case "hidden-news-published": {
      const news = event as HiddenNewsPublishedEvent;
      return {
        ...news,
        type: "hidden-news-published",
        id: news.id ?? `hidden-news-${news.date}-${slugify(news.title)}`,
      };
    }
    case "news-published": {
      const news = event as NewsPublishedEvent;
      return {
        ...news,
        type: "news-published",
        id: news.id ?? `news-${news.date}-${slugify(news.title)}`,
      };
    }
    default:
      return event;
  }
}

function getTitle(event: EngineEvent): string {
  if (event.type === "news-published" || event.type === "hidden-news-published") {
    return (event as NewsPublishedEvent).title;
  }
  if (event.type === "news-patched") return `news-patched-${event.id}`;
  if (event.type === "scenario-head-completed") return "scenario-head-completed";
  if (event.type === "game-over") return (event as GameOverEvent).summary;
  if (event.type === "turn-started") return `turn-started-${event.from}-${event.until}`;
  if (event.type === "turn-finished") return `turn-finished-${event.from}-${event.until}`;
  return "event";
}

function dedupKey(event: EngineEvent): string {
  switch (event.type) {
    case "news-patched": {
      const patch = JSON.stringify(event.patch ?? {});
      return `news-patched-${event.id}-${event.date}-${patch}`;
    }
    case "scenario-head-completed":
      return `scenario-head-completed-${event.date}`;
    case "game-over":
      return `game-over-${event.date}-${event.summary}`;
    case "turn-started":
      return `turn-started-${event.from}-${event.until}-${event.actor}`;
    case "turn-finished":
      return `turn-finished-${event.from}-${event.until}-${event.actor}`;
    case "hidden-news-published":
    case "news-published":
    default: {
      const news = event as NewsPublishedEvent;
      const prefix = event.type === "hidden-news-published" ? "hidden-news" : "news";
      const id = news.id ?? `${news.date}-${news.title}`;
      return `${prefix}-${id}`.toLowerCase();
    }
  }
}

function eventDate(event: EngineEvent): string | null {
  if (hasDate(event)) return event.date;
  if (event.type === "turn-started" || event.type === "turn-finished") return event.from;
  return null;
}

function hasDate(
  event: EngineEvent
): event is
  | NewsPublishedEvent
  | HiddenNewsPublishedEvent
  | NewsPatchedEvent
  | ScenarioHeadCompletedEvent
  | GameOverEvent {
  return "date" in event && typeof (event as { date?: string }).date === "string";
}
