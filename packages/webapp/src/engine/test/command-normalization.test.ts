/**
 * Command normalization tests
 *
 * Purpose: Verify commands are correctly converted to events with proper IDs
 * Why: Commands from LLM must be normalized into consistent event format
 */
import { describe, it, expect } from 'vitest';
import {
  normalizePublishNews,
  normalizePublishHiddenNews,
  normalizePatchNews,
} from '@/engine/utils/normalize.js';
import type {
  PublishNewsCommand,
  PublishHiddenNewsCommand,
  PatchNewsCommand,
} from '@/engine/types.js';

describe('Normalize Publish News Command', () => {
  it('converts command to event with correct type', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test Event',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.type).toBe('news-published');
  });

  it('preserves all command fields', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Landmark',
      title: 'Important News',
      description: 'Detailed description',
    };

    const event = normalizePublishNews(command);

    expect(event.date).toBe('2025-01-15');
    expect(event.icon).toBe('Landmark');
    expect(event.title).toBe('Important News');
    expect(event.description).toBe('Detailed description');
  });

  it('uses provided ID if present', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      id: 'custom-id-123',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test Event',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.id).toBe('custom-id-123');
  });

  it('generates ID from date and title if not provided', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test Event',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.id).toBe('news-2025-01-15-test-event');
  });

  it('generates consistent IDs for same input', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test Event',
      description: 'Test description',
    };

    const event1 = normalizePublishNews(command);
    const event2 = normalizePublishNews(command);

    expect(event1.id).toBe(event2.id);
  });

  it('generates URL-safe IDs', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test Event @ 2025!',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('handles long titles in ID generation', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'This is a very long title that should be truncated in the ID generation process',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    // ID should be: news-2025-01-15-{slugified title truncated to 48 chars}
    expect(event.id).toContain('news-2025-01-15-');
    expect(event.id.length).toBeLessThanOrEqual(48 + 16); // date + slug
  });

  it('handles special characters in title for ID generation', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'OpenAI Releases GPT-5',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.id).toBe('news-2025-01-15-openai-releases-gpt-5');
  });
});

describe('Normalize Publish Hidden News Command', () => {
  it('converts command to hidden-news-published event', () => {
    const command: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Hidden Event',
      description: 'Secret description',
    };

    const event = normalizePublishHiddenNews(command);

    expect(event.type).toBe('hidden-news-published');
  });

  it('preserves all command fields', () => {
    const command: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      date: '2025-01-15',
      icon: 'Landmark',
      title: 'Hidden News',
      description: 'Secret details',
    };

    const event = normalizePublishHiddenNews(command);

    expect(event.date).toBe('2025-01-15');
    expect(event.icon).toBe('Landmark');
    expect(event.title).toBe('Hidden News');
    expect(event.description).toBe('Secret details');
  });

  it('uses provided ID if present', () => {
    const command: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      id: 'hidden-123',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Hidden Event',
      description: 'Secret description',
    };

    const event = normalizePublishHiddenNews(command);

    expect(event.id).toBe('hidden-123');
  });

  it('generates ID with hidden-news prefix', () => {
    const command: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Hidden Event',
      description: 'Secret description',
    };

    const event = normalizePublishHiddenNews(command);

    expect(event.id).toBe('hidden-news-2025-01-15-hidden-event');
  });

  it('generates consistent IDs for same input', () => {
    const command: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Hidden Event',
      description: 'Secret description',
    };

    const event1 = normalizePublishHiddenNews(command);
    const event2 = normalizePublishHiddenNews(command);

    expect(event1.id).toBe(event2.id);
  });
});

describe('Normalize Patch News Command', () => {
  it('converts command to news-patched event', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        title: 'Updated Title',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.type).toBe('news-patched');
  });

  it('preserves targetId', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-original-123',
      date: '2025-01-16',
      patch: {
        title: 'Updated Title',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.targetId).toBe('news-original-123');
  });

  it('preserves date', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        title: 'Updated Title',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.date).toBe('2025-01-16');
  });

  it('preserves patch with title', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        title: 'Updated Title',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.patch.title).toBe('Updated Title');
  });

  it('preserves patch with description', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        description: 'Updated description',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.patch.description).toBe('Updated description');
  });

  it('preserves patch with icon', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        icon: 'Landmark',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.patch.icon).toBe('Landmark');
  });

  it('preserves patch with date', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        date: '2025-01-17',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.patch.date).toBe('2025-01-17');
  });

  it('preserves patch with multiple fields', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {
        title: 'Updated Title',
        description: 'Updated description',
        icon: 'BrainCircuit',
        date: '2025-01-17',
      },
    };

    const event = normalizePatchNews(command);

    expect(event.patch.title).toBe('Updated Title');
    expect(event.patch.description).toBe('Updated description');
    expect(event.patch.icon).toBe('BrainCircuit');
    expect(event.patch.date).toBe('2025-01-17');
  });

  it('handles empty patch object', () => {
    const command: PatchNewsCommand = {
      type: 'patch-news',
      targetId: 'news-123',
      date: '2025-01-16',
      patch: {},
    };

    const event = normalizePatchNews(command);

    expect(event.patch).toEqual({});
  });
});

describe('Command Normalization Edge Cases', () => {
  it('handles Unicode in titles', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Event with émojis 🎉',
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.title).toBe('Event with émojis 🎉');
    // ID should be URL-safe (non-ASCII removed)
    expect(event.id).toMatch(/^news-2025-01-15-event-with/);
  });

  it('handles very long titles', () => {
    const longTitle = 'A'.repeat(200);
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: longTitle,
      description: 'Test description',
    };

    const event = normalizePublishNews(command);

    expect(event.title).toBe(longTitle); // Full title preserved
    expect(event.id.length).toBeLessThanOrEqual(100); // ID is truncated
  });

  it('handles empty optional ID in command', () => {
    const command: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Test',
      description: 'Test',
    };

    const event = normalizePublishNews(command);

    expect(event.id).toBeTruthy();
    expect(event.id).toMatch(/^news-2025-01-15-/);
  });
});

describe('ID Generation Consistency', () => {
  it('generates different IDs for different dates', () => {
    const command1: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Same Title',
      description: 'Test',
    };

    const command2: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-16',
      icon: 'Globe',
      title: 'Same Title',
      description: 'Test',
    };

    const event1 = normalizePublishNews(command1);
    const event2 = normalizePublishNews(command2);

    expect(event1.id).not.toBe(event2.id);
  });

  it('generates different IDs for different titles', () => {
    const command1: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'First Title',
      description: 'Test',
    };

    const command2: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Second Title',
      description: 'Test',
    };

    const event1 = normalizePublishNews(command1);
    const event2 = normalizePublishNews(command2);

    expect(event1.id).not.toBe(event2.id);
  });

  it('generates different prefixes for regular vs hidden news', () => {
    const regularCommand: PublishNewsCommand = {
      type: 'publish-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Same Title',
      description: 'Test',
    };

    const hiddenCommand: PublishHiddenNewsCommand = {
      type: 'publish-hidden-news',
      date: '2025-01-15',
      icon: 'Globe',
      title: 'Same Title',
      description: 'Test',
    };

    const regularEvent = normalizePublishNews(regularCommand);
    const hiddenEvent = normalizePublishHiddenNews(hiddenCommand);

    expect(regularEvent.id).toContain('news-');
    expect(hiddenEvent.id).toContain('hidden-news-');
    expect(regularEvent.id).not.toBe(hiddenEvent.id);
  });
});
