/**
 * Tests for state consistency and event sourcing invariants
 */
import { describe, it, expect } from 'vitest';
import { aggregate } from '../src/index.js';
import { sortAndDedupEvents } from '../src/utils/events.js';
import type { NewsPublishedEvent, EngineEvent } from '../src/types.js';

describe('State Reduction', () => {
  it('reduces events to consistent state', () => {
    const events: NewsPublishedEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'Event 1',
        description: 'First event',
      },
      {
        type: 'news-published',
        date: '2025-01-02',
        icon: 'Landmark',
        title: 'Event 2',
        description: 'Second event',
      },
      {
        type: 'news-published',
        date: '2025-01-03',
        icon: 'BrainCircuit',
        title: 'Event 3',
        description: 'Third event',
      },
    ];

    const state = aggregate(events);

    expect(state.eventCount).toBe(3);
    expect(state.latestDate).toBe('2025-01-03');
    expect(state.events).toHaveLength(3);
    expect(state.events[0].date).toBe('2025-01-01');
    expect(state.events[2].date).toBe('2025-01-03');
  });

  it('state reduction is idempotent (same input → same output)', () => {
    const events: NewsPublishedEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-05',
        icon: 'Globe',
        title: 'Test',
        description: 'Test',
      },
      {
        type: 'news-published',
        date: '2025-01-02',
        icon: 'Landmark',
        title: 'Earlier',
        description: 'Out of order',
      },
    ];

    const state1 = aggregate(events);
    const state2 = aggregate(events);
    const state3 = aggregate([...events]); // New array, same data

    // All states should be identical
    expect(state1.eventCount).toBe(state2.eventCount);
    expect(state1.latestDate).toBe(state2.latestDate);
    expect(state1.events).toEqual(state2.events);
    expect(state1.events).toEqual(state3.events);
  });

  it('state reduction is order-independent (sorted input)', () => {
    const events: NewsPublishedEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-03',
        icon: 'Globe',
        title: 'Third',
        description: 'Out of order',
      },
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Landmark',
        title: 'First',
        description: 'Also out of order',
      },
      {
        type: 'news-published',
        date: '2025-01-02',
        icon: 'BrainCircuit',
        title: 'Second',
        description: 'Middle',
      },
    ];

    const state = aggregate(events);

    // Events should be sorted in output
    expect(state.events[0].date).toBe('2025-01-01');
    expect(state.events[1].date).toBe('2025-01-02');
    expect(state.events[2].date).toBe('2025-01-03');
  });
});

describe('Event Ordering', () => {
  it('handles same-day events deterministically', () => {
    const events: NewsPublishedEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'Event A',
        description: 'First on same day',
      },
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Landmark',
        title: 'Event B',
        description: 'Second on same day',
      },
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'BrainCircuit',
        title: 'Event C',
        description: 'Third on same day',
      },
    ];

    const sorted1 = sortAndDedupEvents(events);
    const sorted2 = sortAndDedupEvents([...events]);
    const sorted3 = sortAndDedupEvents([events[2], events[0], events[1]]);

    // Order should be stable (alphabetical by title as tiebreaker)
    expect(sorted1[0].title).toBe('Event A');
    expect(sorted1[1].title).toBe('Event B');
    expect(sorted1[2].title).toBe('Event C');

    // Should be consistent across runs
    expect(sorted1.map(e => e.title)).toEqual(sorted2.map(e => e.title));
    expect(sorted1.map(e => e.title)).toEqual(sorted3.map(e => e.title));
  });

  it('maintains chronological order across mixed dates', () => {
    const events: EngineEvent[] = [
      { type: 'news-published', date: '2025-06-15', icon: 'Globe', title: 'June', description: 'Mid' },
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'January', description: 'Start' },
      { type: 'news-published', date: '2025-12-31', icon: 'BrainCircuit', title: 'December', description: 'End' },
      { type: 'news-published', date: '2025-03-15', icon: 'Radio', title: 'March', description: 'Early' },
    ];

    const sorted = sortAndDedupEvents(events);

    expect(sorted[0].date).toBe('2025-01-01');
    expect(sorted[1].date).toBe('2025-03-15');
    expect(sorted[2].date).toBe('2025-06-15');
    expect(sorted[3].date).toBe('2025-12-31');
  });
});

describe('State Invariants', () => {
  it('eventCount matches events array length', () => {
    const events: NewsPublishedEvent[] = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'One', description: 'First' },
      { type: 'news-published', date: '2025-01-02', icon: 'Landmark', title: 'Two', description: 'Second' },
      { type: 'news-published', date: '2025-01-03', icon: 'BrainCircuit', title: 'Three', description: 'Third' },
    ];

    const state = aggregate(events);

    expect(state.eventCount).toBe(state.events.length);
  });

  it('latestDate matches last event date', () => {
    const events: NewsPublishedEvent[] = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Early', description: 'First' },
      { type: 'news-published', date: '2025-06-15', icon: 'Landmark', title: 'Latest', description: 'Last' },
      { type: 'news-published', date: '2025-03-10', icon: 'BrainCircuit', title: 'Middle', description: 'Mid' },
    ];

    const state = aggregate(events);

    // State is sorted, so last event should be latest
    const lastEventDate = state.events[state.events.length - 1].date;
    expect(state.latestDate).toBe(lastEventDate);
    expect(state.latestDate).toBe('2025-06-15');
  });

  it('empty event list produces empty state', () => {
    const state = aggregate([]);

    expect(state.eventCount).toBe(0);
    expect(state.events).toEqual([]);
    expect(state.latestDate).toBeNull();
  });

  it('events remain immutable (no mutations)', () => {
    const events: NewsPublishedEvent[] = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Original', description: 'Test' },
    ];

    const original = JSON.parse(JSON.stringify(events));

    aggregate(events);

    // Input should not be mutated
    expect(events).toEqual(original);
  });
});

describe('Deduplication Consistency', () => {
  it('deduplication preserves state invariants', () => {
    const events: NewsPublishedEvent[] = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Duplicate', description: 'First' },
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'Duplicate', description: 'Second' },
      { type: 'news-published', date: '2025-01-02', icon: 'BrainCircuit', title: 'Unique', description: 'Only' },
    ];

    const state = aggregate(events);

    // Should dedupe first two events (same date+title)
    expect(state.eventCount).toBe(2);
    expect(state.events).toHaveLength(2);
    expect(state.latestDate).toBe('2025-01-02');
  });

  it('deduplication with explicit IDs is consistent', () => {
    const events: NewsPublishedEvent[] = [
      { type: 'news-published', id: 'id-1', date: '2025-01-01', icon: 'Globe', title: 'Event', description: 'First' },
      { type: 'news-published', id: 'id-1', date: '2025-01-02', icon: 'Landmark', title: 'Event', description: 'Second' },
      { type: 'news-published', id: 'id-2', date: '2025-01-03', icon: 'BrainCircuit', title: 'Other', description: 'Third' },
    ];

    const state = aggregate(events);

    // Should dedupe first two (same ID)
    expect(state.eventCount).toBe(2);
    expect(state.events).toHaveLength(2);
  });
});
