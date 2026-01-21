import { slugify } from './strings.js';
import { generateDiceRoll } from './prng.js';
import type {
  PublishNewsCommand,
  PublishHiddenNewsCommand,
  PatchNewsCommand,
  RollDiceCommand,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
  DiceRolledEvent,
  EngineEvent,
} from '../types.js';

/**
 * Normalizes a PublishNewsCommand into a NewsPublishedEvent with ids/types filled.
 */
export function normalizePublishNews(cmd: PublishNewsCommand): NewsPublishedEvent {
  return {
    type: 'news-published',
    id: cmd.id ?? `news-${cmd.date}-${slugify(cmd.title)}`,
    date: cmd.date,
    icon: cmd.icon,
    title: cmd.title,
    description: cmd.description,
  };
}

/**
 * Normalizes a PublishHiddenNewsCommand into a HiddenNewsPublishedEvent with ids/types filled.
 */
export function normalizePublishHiddenNews(cmd: PublishHiddenNewsCommand): HiddenNewsPublishedEvent {
  return {
    type: 'hidden-news-published',
    id: cmd.id ?? `hidden-news-${cmd.date}-${slugify(cmd.title)}`,
    date: cmd.date,
    icon: cmd.icon,
    title: cmd.title,
    description: cmd.description,
  };
}

/**
 * Normalizes a PatchNewsCommand into a NewsPatchedEvent.
 */
export function normalizePatchNews(cmd: PatchNewsCommand): NewsPatchedEvent {
  return {
    type: 'news-patched',
    targetId: cmd.targetId,
    date: cmd.date,
    patch: cmd.patch,
  };
}

/**
 * Convert roll-dice command to dice-rolled event
 * Generates a deterministic roll based on event log context
 */
export function normalizeRollDice(cmd: RollDiceCommand, history: EngineEvent[]): DiceRolledEvent {
  const timestamp = new Date().toISOString();
  const roll = generateDiceRoll(history.length, timestamp, cmd.label);
  return {
    type: 'dice-rolled',
    roll,
    at: timestamp,
    label: cmd.label,
  };
}
