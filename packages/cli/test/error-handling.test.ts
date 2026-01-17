/**
 * Error handling and edge case tests for CLI commands
 */
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runAggregate } from '../src/commands/aggregate.js';
import { runParse } from '../src/commands/parse.js';
import { runPrepare } from '../src/commands/prepare.js';

describe('CLI error handling', () => {
  describe('Invalid JSON input', () => {
    it('aggregate: rejects malformed JSONL', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-jsonl-'));
      const inputHistory = join(dir, 'bad.jsonl');
      const outputState = join(dir, 'state.json');

      await writeFile(inputHistory, 'not valid json{]', 'utf-8');

      await expect(
        runAggregate({ inputHistory, outputState })
      ).rejects.toThrow();
    });

    it('parse: rejects malformed response JSON', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-parse-'));
      const inputJson = join(dir, 'response.json');
      const outputEvents = join(dir, 'events.jsonl');

      await writeFile(inputJson, '{"response": {"text": "not json"}', 'utf-8');

      await expect(
        runParse({ inputJson, outputEvents })
      ).rejects.toThrow();
    });
  });

  describe('Missing required files', () => {
    it('aggregate: handles missing input gracefully', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-missing-'));
      const inputHistory = join(dir, 'nonexistent.jsonl');
      const outputState = join(dir, 'state.json');

      // Should either throw or handle missing file gracefully
      // Current behavior depends on implementation
      await expect(
        runAggregate({ inputHistory, outputState })
      ).rejects.toThrow();
    });

    it('prepare: handles missing history file', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-prepare-'));
      const inputHistory = join(dir, 'nonexistent.jsonl');
      const outputPrompt = join(dir, 'prompt.json');

      await expect(
        runPrepare({
          inputState: '',
          inputHistory,
          materials: 'none',
          model: 'gemini-2.5-flash',
          systemPrompt: '',
          outputPrompt,
        })
      ).rejects.toThrow();
    });
  });

  describe('Invalid event structures', () => {
    it('aggregate: rejects events with missing required fields', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-invalid-'));
      const inputHistory = join(dir, 'invalid.jsonl');
      const outputState = join(dir, 'state.json');

      // Event missing required fields
      const badEvent = { type: 'news-published', date: '2025-01-01' }; // Missing icon, title, description

      await writeFile(inputHistory, JSON.stringify(badEvent), 'utf-8');

      await expect(
        runAggregate({ inputHistory, outputState })
      ).rejects.toThrow();
    });

    it('parse: rejects commands with invalid types', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-badtype-'));
      const inputJson = join(dir, 'response.json');
      const outputEvents = join(dir, 'events.jsonl');

      const badCommands = [
        { type: 'invalid-command-type', date: '2025-01-01' },
      ];

      await writeFile(
        inputJson,
        JSON.stringify({ response: { text: JSON.stringify(badCommands) } }),
        'utf-8'
      );

      await expect(
        runParse({ inputJson, outputEvents })
      ).rejects.toThrow();
    });
  });

  describe('File permission errors', () => {
    it.skip('handles read-only output directory', async () => {
      // Test behavior when output directory is not writable
      // Platform-dependent, skip for now
    });
  });

  describe('Large file handling', () => {
    it('handles large event logs efficiently', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-large-'));
      const inputHistory = join(dir, 'large.jsonl');
      const outputState = join(dir, 'state.json');

      // Generate 1000 events
      const events = Array.from({ length: 1000 }, (_, i) => ({
        type: 'news-published',
        date: `2025-01-01`,
        icon: 'Landmark',
        title: `Event ${i}`,
        description: `Description ${i}`,
      }));

      await writeFile(
        inputHistory,
        events.map(e => JSON.stringify(e)).join('\n'),
        'utf-8'
      );

      // Should complete without error
      await runAggregate({ inputHistory, outputState });

      // Verify state is correct
      const { readFile } = await import('node:fs/promises');
      const state = JSON.parse(await readFile(outputState, 'utf-8'));
      expect(state.eventCount).toBe(1000);
    });
  });

  describe('Edge cases', () => {
    it('handles empty event log', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-empty-'));
      const inputHistory = join(dir, 'empty.jsonl');
      const outputState = join(dir, 'state.json');

      await writeFile(inputHistory, '', 'utf-8');

      await runAggregate({ inputHistory, outputState });

      const { readFile } = await import('node:fs/promises');
      const state = JSON.parse(await readFile(outputState, 'utf-8'));
      expect(state.eventCount).toBe(0);
    });

    it('handles events with same timestamp', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'cli-error-sametime-'));
      const inputHistory = join(dir, 'sametime.jsonl');
      const outputState = join(dir, 'state.json');

      const events = [
        { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'Event A', description: 'Desc A' },
        { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Event B', description: 'Desc B' },
        { type: 'news-published', date: '2025-01-01', icon: 'BrainCircuit', title: 'Event C', description: 'Desc C' },
      ];

      await writeFile(
        inputHistory,
        events.map(e => JSON.stringify(e)).join('\n'),
        'utf-8'
      );

      await runAggregate({ inputHistory, outputState });

      const { readFile } = await import('node:fs/promises');
      const state = JSON.parse(await readFile(outputState, 'utf-8'));
      expect(state.eventCount).toBe(3);
    });
  });
});
