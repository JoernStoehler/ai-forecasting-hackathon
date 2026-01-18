export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * Generate a unique ID for a news event based on its type, date, and title.
 * Used to ensure consistent IDs across event normalization and UI components.
 */
export function generateNewsId(
  type: 'news' | 'hidden-news',
  date: string,
  title: string
): string {
  return `${type === 'hidden-news' ? 'hidden-' : ''}news-${date}-${slugify(title)}`;
}

/**
 * Increment a date string (YYYY-MM-DD format) by one day.
 * Returns the next day in the same format.
 */
export function incrementDateByOne(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Extract date portion (YYYY-MM-DD) from an ISO 8601 timestamp string.
 */
export function dateFromISO(isoString: string): string {
  return isoString.split('T')[0];
}
