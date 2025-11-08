import { ICON_SET } from '../constants';
import type { ScenarioEvent } from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICONS = new Set<string>(ICON_SET);

export function isScenarioEvent(value: unknown): value is ScenarioEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ScenarioEvent>;

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
  if (!Array.isArray(payload) || !payload.every(isScenarioEvent)) {
    throw new Error(`Invalid ScenarioEvent payload from ${context}.`);
  }
  return sortAndDedupEvents(payload);
}

export function sortAndDedupEvents(events: ScenarioEvent[]): ScenarioEvent[] {
  const deduped = new Map<string, ScenarioEvent>();
  events.forEach(event => {
    const key = `${event.date}-${event.title}`.toLowerCase();
    deduped.set(key, event);
  });
  return [...deduped.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
  );
}
