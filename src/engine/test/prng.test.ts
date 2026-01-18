/**
 * Tests for PRNG (Pseudo-Random Number Generator) functionality
 */
import { describe, it, expect } from 'vitest';
import { generateSeed, rollPercentile, generateDiceRoll } from '@/engine/utils/prng.js';
import { normalizeRollDice } from '@/engine/utils/normalize.js';
import { parseActionChunk } from '@/engine/forecaster/streamingPipeline.js';
import { projectPrompt } from '@/engine/utils/promptProjector.js';
import type { EngineEvent, NewsPublishedEvent, DiceRolledEvent } from '@/engine/types.js';

describe('PRNG Generation', () => {
  it('generates deterministic seeds from same inputs', () => {
    const seed1 = generateSeed(10, '2025-01-15T10:00:00Z', 'test');
    const seed2 = generateSeed(10, '2025-01-15T10:00:00Z', 'test');
    expect(seed1).toBe(seed2);
  });

  it('generates different seeds for different event counts', () => {
    const seed1 = generateSeed(10, '2025-01-15T10:00:00Z');
    const seed2 = generateSeed(11, '2025-01-15T10:00:00Z');
    expect(seed1).not.toBe(seed2);
  });

  it('generates different seeds for different timestamps', () => {
    const seed1 = generateSeed(10, '2025-01-15T10:00:00Z');
    const seed2 = generateSeed(10, '2025-01-15T10:00:01Z');
    expect(seed1).not.toBe(seed2);
  });

  it('generates different seeds for different labels', () => {
    const seed1 = generateSeed(10, '2025-01-15T10:00:00Z', 'label1');
    const seed2 = generateSeed(10, '2025-01-15T10:00:00Z', 'label2');
    expect(seed1).not.toBe(seed2);
  });

  it('rolls percentile dice (1-100 inclusive)', () => {
    const seed = 12345;
    const roll = rollPercentile(seed);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(100);
    expect(Number.isInteger(roll)).toBe(true);
  });

  it('produces consistent rolls from same seed', () => {
    const seed = 12345;
    const roll1 = rollPercentile(seed);
    const roll2 = rollPercentile(seed);
    expect(roll1).toBe(roll2);
  });

  it('generates dice rolls from context', () => {
    const roll1 = generateDiceRoll(10, '2025-01-15T10:00:00Z', 'test');
    const roll2 = generateDiceRoll(10, '2025-01-15T10:00:00Z', 'test');
    expect(roll1).toBe(roll2); // Deterministic
    expect(roll1).toBeGreaterThanOrEqual(1);
    expect(roll1).toBeLessThanOrEqual(100);
  });
});

describe('Dice Roll Normalization', () => {
  it('converts roll-dice command to dice-rolled event', () => {
    const history: EngineEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-15',
        icon: 'Globe',
        title: 'Test Event',
        description: 'Test',
        id: 'news-1',
      } as NewsPublishedEvent,
    ];

    const command = {
      type: 'roll-dice' as const,
      label: 'AI capability growth',
    };

    const event = normalizeRollDice(command, history);

    expect(event.type).toBe('dice-rolled');
    expect(event.roll).toBeGreaterThanOrEqual(1);
    expect(event.roll).toBeLessThanOrEqual(100);
    expect(event.label).toBe('AI capability growth');
    expect(event.at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp
  });

  it('handles roll-dice command without label', () => {
    const command = {
      type: 'roll-dice' as const,
    };

    const event = normalizeRollDice(command, []);

    expect(event.type).toBe('dice-rolled');
    expect(event.label).toBeUndefined();
    expect(event.roll).toBeGreaterThanOrEqual(1);
    expect(event.roll).toBeLessThanOrEqual(100);
  });

  it('generates different rolls for different history lengths', () => {
    const command = { type: 'roll-dice' as const, label: 'test' };
    const event1 = normalizeRollDice(command, []);

    // Simulate adding an event to history
    const history2: EngineEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-15',
        icon: 'Globe',
        title: 'Test',
        description: 'Test',
        id: 'news-1',
      } as NewsPublishedEvent,
    ];

    // Wait a bit to ensure different timestamp
    const event2 = normalizeRollDice(command, history2);

    // Rolls should be different due to different context
    expect(event1.roll).not.toBe(event2.roll);
  });
});

describe('Streaming Pipeline with Dice Rolls', () => {
  it('handles roll-dice commands in stream', () => {
    const history: EngineEvent[] = [];
    const jsonl = JSON.stringify([
      { type: 'roll-dice', label: 'test roll' },
    ]);

    const result = parseActionChunk({ actionsJsonl: jsonl }, history);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('dice-rolled');
    const diceEvent = result.events[0] as DiceRolledEvent;
    expect(diceEvent.roll).toBeGreaterThanOrEqual(1);
    expect(diceEvent.roll).toBeLessThanOrEqual(100);
    expect(diceEvent.label).toBe('test roll');
  });

  it('handles mixed commands including dice rolls', () => {
    const history: EngineEvent[] = [];
    const jsonl = JSON.stringify([
      { type: 'roll-dice', label: 'outcome' },
      {
        type: 'publish-news',
        date: '2025-01-15',
        icon: 'Globe',
        title: 'Event',
        description: 'Description',
      },
    ]);

    const result = parseActionChunk({ actionsJsonl: jsonl }, history);

    expect(result.events).toHaveLength(2);
    expect(result.events[0].type).toBe('dice-rolled');
    expect(result.events[1].type).toBe('news-published');
  });

  it('updates history as commands are processed', () => {
    const history: EngineEvent[] = [];
    const jsonl = JSON.stringify([
      { type: 'roll-dice', label: 'first' },
      { type: 'roll-dice', label: 'second' },
    ]);

    const result = parseActionChunk({ actionsJsonl: jsonl }, history);

    expect(result.events).toHaveLength(2);
    const roll1 = (result.events[0] as DiceRolledEvent).roll;
    const roll2 = (result.events[1] as DiceRolledEvent).roll;

    // Rolls should be different because history grows between them
    expect(roll1).not.toBe(roll2);
  });
});

describe('Prompt Projection with Dice Rolls', () => {
  it('includes dice rolls in timeline projection', () => {
    const events: EngineEvent[] = [
      {
        type: 'dice-rolled',
        roll: 76,
        at: '2025-01-15T10:00:00Z',
        label: 'AI capability growth',
      } as DiceRolledEvent,
    ];

    const projection = projectPrompt({ history: events });

    expect(projection).toContain('"roll":76');
    expect(projection).toContain('"label":"AI capability growth"');
    expect(projection).toContain('# TIMELINE (JSONL)');
  });

  it('includes dice rolls alongside news events', () => {
    const events: EngineEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-15',
        icon: 'Globe',
        title: 'Event',
        description: 'Test',
        id: 'news-1',
      } as NewsPublishedEvent,
      {
        type: 'dice-rolled',
        roll: 42,
        at: '2025-01-15T10:00:00Z',
        label: 'test',
      } as DiceRolledEvent,
    ];

    const projection = projectPrompt({ history: events });

    expect(projection).toContain('"roll":42');
    expect(projection).toContain('Event');
  });

  it('formats dice rolls without type field', () => {
    const events: EngineEvent[] = [
      {
        type: 'dice-rolled',
        roll: 99,
        at: '2025-01-15T10:00:00Z',
      } as DiceRolledEvent,
    ];

    const projection = projectPrompt({ history: events });

    // Should not include "type" in projected output (clean format for GM)
    const lines = projection.split('\n');
    const rollLine = lines.find(line => line.includes('"roll":99'));
    expect(rollLine).toBeDefined();
    expect(rollLine).not.toContain('"type":"dice-rolled"');
  });
});

describe('PRNG Integration', () => {
  it('end-to-end: command -> event -> projection', () => {
    // Start with some history
    const history: EngineEvent[] = [
      {
        type: 'news-published',
        date: '2025-01-15',
        icon: 'Globe',
        title: 'Initial Event',
        description: 'Setup',
        id: 'news-1',
      } as NewsPublishedEvent,
    ];

    // Process roll-dice command
    const jsonl = JSON.stringify([
      { type: 'roll-dice', label: 'geopolitical crisis' },
    ]);
    const result = parseActionChunk({ actionsJsonl: jsonl }, history);

    // Verify event was created
    expect(result.events).toHaveLength(1);
    const diceEvent = result.events[0] as DiceRolledEvent;
    expect(diceEvent.type).toBe('dice-rolled');
    expect(diceEvent.roll).toBeGreaterThanOrEqual(1);
    expect(diceEvent.roll).toBeLessThanOrEqual(100);

    // Project the updated history
    const projection = projectPrompt({ history: result.nextHistory });

    // Verify projection includes the roll
    expect(projection).toContain(`"roll":${diceEvent.roll}`);
    expect(projection).toContain('"label":"geopolitical crisis"');
  });
});
