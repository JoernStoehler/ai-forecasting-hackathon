/**
 * Error handling and robustness tests
 *
 * Purpose: Verify engine fails gracefully with invalid input
 * Why: Production code must handle bad data without crashing
 */
import { describe, it, expect } from 'vitest';
import { coerceEngineEvents } from '@/engine/utils/events.js';
import { aggregate } from '@/engine/index.js';

describe('Invalid Data Handling', () => {
  it('throws on completely invalid data', () => {
    const invalidData = [{ foo: 'bar' }];

    expect(() => coerceEngineEvents(invalidData as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('throws on null input', () => {
    expect(() => coerceEngineEvents(null as any, 'test')).toThrow();
  });

  it('throws on undefined input', () => {
    expect(() => coerceEngineEvents(undefined as any, 'test')).toThrow();
  });

  it('throws on non-array input', () => {
    const notAnArray = { type: 'news-published', date: '2025-01-01' };

    expect(() => coerceEngineEvents(notAnArray as any, 'test')).toThrow();
  });

  it('handles empty array without error', () => {
    const result = coerceEngineEvents([], 'test');
    expect(result).toEqual([]);
  });

  it('throws on array with mixed valid/invalid events', () => {
    const mixed = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Valid', description: 'Valid' },
      { type: 'invalid-type', foo: 'bar' }, // Invalid
    ];

    // Should throw because validation is strict
    expect(() => coerceEngineEvents(mixed as any, 'test')).toThrow('Invalid EngineEvent payload');
  });
});

describe('Boundary Conditions', () => {
  it('handles events with minimum valid data', () => {
    const minimal = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'A', // Single character
        description: 'B', // Single character
      },
    ];

    const result = coerceEngineEvents(minimal, 'test');
    expect(result).toHaveLength(1);
  });

  it('handles events with very large valid data', () => {
    const largeTitle = 'A'.repeat(10000);
    const largeDescription = 'B'.repeat(50000);

    const large = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: largeTitle,
        description: largeDescription,
      },
    ];

    const result = coerceEngineEvents(large, 'test');
    expect(result).toHaveLength(1);
    expect(result[0].title.length).toBe(10000);
    expect(result[0].description.length).toBe(50000);
  });

  it('handles edge case dates (year boundaries)', () => {
    const edgeDates = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'New Year', description: 'First day' },
      { type: 'news-published', date: '2025-12-31', icon: 'Landmark', title: 'Last Day', description: 'Final day' },
      { type: 'news-published', date: '2024-02-29', icon: 'BrainCircuit', title: 'Leap Day', description: 'Feb 29' },
    ];

    const result = coerceEngineEvents(edgeDates, 'test');
    expect(result).toHaveLength(3);
  });
});

describe('Type Safety', () => {
  it('rejects events with wrong type for fields', () => {
    const wrongTypes = [
      {
        type: 'news-published',
        date: 20250101, // Should be string
        icon: 'Globe',
        title: 'Test',
        description: 'Test',
      },
    ];

    expect(() => coerceEngineEvents(wrongTypes as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects events with missing required fields', () => {
    const missing = [
      {
        type: 'news-published',
        date: '2025-01-01',
        // Missing icon, title, description
      },
    ];

    expect(() => coerceEngineEvents(missing as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('handles optional fields gracefully', () => {
    const withOptional = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'Test',
        description: 'Test',
        id: 'optional-id',
      },
    ];

    const result = coerceEngineEvents(withOptional, 'test');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('optional-id');
  });

  it('handles events without optional fields', () => {
    const withoutOptional = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'Test',
        description: 'Test',
        // No id field
      },
    ];

    const result = coerceEngineEvents(withoutOptional, 'test');
    expect(result).toHaveLength(1);
    // Events without IDs get auto-generated IDs based on type-date-title
    expect(result[0].id).toBe('news-2025-01-01-test');
  });
});

describe('Aggregate Error Handling', () => {
  it('handles empty input gracefully', () => {
    const state = aggregate([]);

    expect(state.eventCount).toBe(0);
    expect(state.events).toEqual([]);
    expect(state.latestDate).toBeNull();
  });

  it('handles single event', () => {
    const state = aggregate([
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: 'Single',
        description: 'Event',
      },
    ]);

    expect(state.eventCount).toBe(1);
    expect(state.events).toHaveLength(1);
  });

  it('does not crash with unusual but valid data', () => {
    const unusual = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Globe',
        title: '!@#$%^&*()',
        description: '   \t\n   ', // Whitespace (Zod allows)
      },
      {
        type: 'news-published',
        date: '2025-01-02',
        icon: 'Landmark',
        title: '🎉🎊✨', // Emoji
        description: 'Unicode: résumé café',
      },
    ];

    const state = aggregate(unusual);
    expect(state.eventCount).toBe(2);
  });
});

describe('Context Messages', () => {
  it('includes context in error messages', () => {
    try {
      coerceEngineEvents([{ invalid: true }] as any, 'test-context-name');
      expect(true).toBe(false); // Should not reach
    } catch (error: any) {
      expect(error.message).toContain('test-context-name');
      expect(error.message).toContain('Invalid EngineEvent payload');
    }
  });

  it('provides helpful context for debugging', () => {
    try {
      coerceEngineEvents(null as any, 'user-import');
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain('user-import');
    }
  });
});
