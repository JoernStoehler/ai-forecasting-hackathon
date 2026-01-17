/**
 * Large dataset and performance tests
 *
 * Purpose: Verify engine handles large event logs efficiently
 * Why: Real games will accumulate 100+ events over time
 */
import { describe, it, expect } from 'vitest';
import { aggregate, sortAndDedupEvents } from '../src/index.js';
import type { NewsPublishedEvent } from '../src/types.js';

describe('Large Dataset Handling', () => {
  it('handles 100 events efficiently', () => {
    const events: NewsPublishedEvent[] = [];

    // Generate 100 events
    for (let i = 0; i < 100; i++) {
      events.push({
        type: 'news-published',
        date: `2025-${String(Math.floor(i / 31) + 1).padStart(2, '0')}-${String((i % 31) + 1).padStart(2, '0')}`,
        icon: ['Globe', 'Landmark', 'BrainCircuit', 'Radio', 'Coins'][i % 5] as any,
        title: `Event ${i}`,
        description: `Description for event ${i}`,
      });
    }

    const startTime = Date.now();
    const state = aggregate(events);
    const duration = Date.now() - startTime;

    // Should complete in reasonable time (< 100ms for 100 events)
    expect(duration).toBeLessThan(100);
    expect(state.eventCount).toBe(100);
    expect(state.events).toHaveLength(100);
  });

  it('handles 1000 events efficiently', () => {
    const events: NewsPublishedEvent[] = [];

    // Generate 1000 events across full year
    for (let i = 0; i < 1000; i++) {
      const dayOfYear = i % 365;
      const month = Math.floor(dayOfYear / 31) + 1;
      const day = (dayOfYear % 31) + 1;

      events.push({
        type: 'news-published',
        date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        icon: ['Globe', 'Landmark', 'BrainCircuit', 'Radio', 'Coins'][i % 5] as any,
        title: `Event ${i}`,
        description: `Description for event ${i}`,
      });
    }

    const startTime = Date.now();
    const state = aggregate(events);
    const duration = Date.now() - startTime;

    // Should complete in reasonable time (< 500ms for 1000 events)
    expect(duration).toBeLessThan(500);
    expect(state.eventCount).toBe(1000);
    expect(state.events).toHaveLength(1000);
  });

  it('deduplication scales with large duplicate sets', () => {
    const events: NewsPublishedEvent[] = [];

    // Create 1000 events with only 10 unique IDs (lots of duplicates)
    for (let i = 0; i < 1000; i++) {
      events.push({
        type: 'news-published',
        id: `id-${i % 10}`, // Only 10 unique IDs
        date: '2025-01-01',
        icon: 'Globe',
        title: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const startTime = Date.now();
    const deduplicated = sortAndDedupEvents(events);
    const duration = Date.now() - startTime;

    // Should handle deduplication efficiently
    expect(duration).toBeLessThan(100);
    expect(deduplicated).toHaveLength(10); // Only 10 unique
  });

  it('sorting performance with unsorted large dataset', () => {
    const events: NewsPublishedEvent[] = [];

    // Generate 500 events in reverse chronological order (worst case for sorting)
    for (let i = 500; i > 0; i--) {
      events.push({
        type: 'news-published',
        date: `2025-01-01`,
        icon: 'Globe',
        title: `Event ${String(i).padStart(4, '0')}`, // Padding ensures lexicographic order
        description: `Reverse order event ${i}`,
      });
    }

    const startTime = Date.now();
    const sorted = sortAndDedupEvents(events);
    const duration = Date.now() - startTime;

    // Should sort efficiently even when input is reverse-ordered
    expect(duration).toBeLessThan(200);
    expect(sorted).toHaveLength(500);

    // Verify sorted order
    expect(sorted[0].title).toBe('Event 0001');
    expect(sorted[499].title).toBe('Event 0500');
  });

  it('maintains performance with many same-day events', () => {
    const events: NewsPublishedEvent[] = [];

    // Create 200 events all on same date (stress tests tie-breaking)
    for (let i = 0; i < 200; i++) {
      events.push({
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: `Event ${String(i).padStart(3, '0')}`,
        description: `Same-day event ${i}`,
      });
    }

    const startTime = Date.now();
    const sorted = sortAndDedupEvents(events);
    const duration = Date.now() - startTime;

    // Should handle many same-day events efficiently
    expect(duration).toBeLessThan(100);
    expect(sorted).toHaveLength(200);

    // Verify stable sort (alphabetical by title for same dates)
    for (let i = 0; i < 199; i++) {
      expect(sorted[i].title <= sorted[i + 1].title).toBe(true);
    }
  });
});

describe('Large Dataset Memory', () => {
  it('does not mutate input when processing large datasets', () => {
    const events: NewsPublishedEvent[] = [];

    for (let i = 0; i < 100; i++) {
      events.push({
        type: 'news-published',
        date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const originalJson = JSON.stringify(events);

    aggregate(events);
    sortAndDedupEvents(events);

    const afterJson = JSON.stringify(events);

    // Input should be unchanged
    expect(afterJson).toBe(originalJson);
  });

  it('state size is proportional to event count', () => {
    const small = aggregate(
      Array.from({ length: 10 }, (_, i) => ({
        type: 'news-published' as const,
        date: '2025-01-01',
        icon: 'Globe' as const,
        title: `Event ${i}`,
        description: `Desc ${i}`,
      }))
    );

    const large = aggregate(
      Array.from({ length: 100 }, (_, i) => ({
        type: 'news-published' as const,
        date: '2025-01-01',
        icon: 'Globe' as const,
        title: `Event ${i}`,
        description: `Desc ${i}`,
      }))
    );

    // Large state should have 10x events
    expect(large.eventCount).toBe(small.eventCount * 10);
    expect(large.events.length).toBe(small.events.length * 10);

    // But structure should be same
    expect(typeof large.eventCount).toBe(typeof small.eventCount);
    expect(Array.isArray(large.events)).toBe(true);
  });
});
