import { slugify } from './strings.js';
import type {
  PublishNewsCommand,
  PublishHiddenNewsCommand,
  PatchNewsCommand,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
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
