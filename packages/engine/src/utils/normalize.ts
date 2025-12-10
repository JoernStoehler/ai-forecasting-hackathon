import { slugify } from './strings.js';
import type { PublishNewsCommand, NewsPublishedEvent } from '../types.js';

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
    postMortem: cmd.postMortem,
  };
}
