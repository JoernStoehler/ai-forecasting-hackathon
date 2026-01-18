/**
 * Tests for event deduplication logic
 */
import { describe, it, expect } from 'vitest';
import { sortAndDedupEvents } from '@/engine/utils/events.js';
import type { NewsPublishedEvent } from '@/engine/types.js';

describe('Event deduplication', () => {
  it('deduplicates events with same ID (last one wins)', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      id: 'unique-id-123',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'First Version',
      description: 'Original description',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      id: 'unique-id-123',
      date: '2025-01-02',
      icon: 'Landmark',
      title: 'Updated Version',
      description: 'Updated description',
    };

    const result = sortAndDedupEvents([event1, event2]);

    // Should only have one event (last one wins)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('unique-id-123');
    expect(result[0].title).toBe('Updated Version');
    expect(result[0].description).toBe('Updated description');
  });

  it('deduplicates events with same date+title when no ID', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Duplicate Title',
      description: 'First description',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Landmark',
      title: 'Duplicate Title',
      description: 'Second description',
    };

    const result = sortAndDedupEvents([event1, event2]);

    // Should only have one event (last one wins)
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Duplicate Title');
    expect(result[0].description).toBe('Second description');
  });

  it('keeps events with different IDs even if same date+title', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      id: 'id-1',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Same Title',
      description: 'First',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      id: 'id-2',
      date: '2025-01-01',
      icon: 'Landmark',
      title: 'Same Title',
      description: 'Second',
    };

    const result = sortAndDedupEvents([event1, event2]);

    // Should keep both because IDs are different
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id-1');
    expect(result[1].id).toBe('id-2');
  });

  it('deduplication is case-insensitive for date+title', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Test Event',
      description: 'First',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Landmark',
      title: 'TEST EVENT',
      description: 'Second',
    };

    const result = sortAndDedupEvents([event1, event2]);

    // Should deduplicate because keys are case-insensitive
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Second'); // Last one wins
  });

  it('deduplication is case-insensitive for IDs', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      id: 'Test-ID-123',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Event 1',
      description: 'First',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      id: 'test-id-123',
      date: '2025-01-02',
      icon: 'Landmark',
      title: 'Event 2',
      description: 'Second',
    };

    const result = sortAndDedupEvents([event1, event2]);

    // Should deduplicate because IDs are case-insensitive
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Second'); // Last one wins
  });

  it('handles mixed events with and without IDs', () => {
    const event1: NewsPublishedEvent = {
      type: 'news-published',
      id: 'explicit-id',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'With ID',
      description: 'Has explicit ID',
    };

    const event2: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-02',
      icon: 'Landmark',
      title: 'No ID',
      description: 'Uses date+title',
    };

    const event3: NewsPublishedEvent = {
      type: 'news-published',
      date: '2025-01-02',
      icon: 'BrainCircuit',
      title: 'No ID',
      description: 'Duplicate of event2',
    };

    const result = sortAndDedupEvents([event1, event2, event3]);

    // event2 and event3 should be deduped (same date+title)
    expect(result).toHaveLength(2);
    expect(result.find(e => e.id === 'explicit-id')).toBeDefined();
    expect(result.find(e => e.title === 'No ID' && e.description === 'Duplicate of event2')).toBeDefined();
  });

  it('deduplication works across large sets of events', () => {
    const events: NewsPublishedEvent[] = [];

    // Create 100 events with 10 unique IDs (each repeated 10 times)
    for (let i = 0; i < 100; i++) {
      events.push({
        type: 'news-published',
        id: `id-${i % 10}`,
        date: `2025-01-${String(i % 28 + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const result = sortAndDedupEvents(events);

    // Should only have 10 unique events (one per unique ID)
    expect(result).toHaveLength(10);

    // Verify all IDs are present
    const ids = result.map(e => e.id).sort();
    expect(ids).toEqual(['id-0', 'id-1', 'id-2', 'id-3', 'id-4', 'id-5', 'id-6', 'id-7', 'id-8', 'id-9']);
  });
});
