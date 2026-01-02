import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runTurn } from '../src/commands/turn.js';

describe('runTurn', () => {
  it('runs the full turn pipeline in mock mode and emits turn markers', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
    const inputHistory = join(dir, 'history.jsonl');
    const newEvents = join(dir, 'player.jsonl');
    const outputHistory = join(dir, 'output-history.jsonl');
    const outputState = join(dir, 'output-state.json');
    const outputPrompt = join(dir, 'prompt.json');
    const outputResponse = join(dir, 'response.json');
    const outputEvents = join(dir, 'gm-events.jsonl');

    const seedEvents = [
      {
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Landmark',
        title: 'Seed event',
        description: 'Seed description',
      },
    ];
    await writeFile(inputHistory, seedEvents.map(evt => JSON.stringify(evt)).join('\n'), 'utf-8');

    const playerEvents = [
      {
        type: 'news-published',
        date: '2025-01-02',
        icon: 'Globe',
        title: 'Player event',
        description: 'Player description',
      },
    ];
    await writeFile(newEvents, playerEvents.map(evt => JSON.stringify(evt)).join('\n'), 'utf-8');

    await runTurn({
      inputHistory,
      newEvents,
      outputHistory,
      outputState,
      outputPrompt,
      outputResponse,
      outputEvents,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
      mock: true,
    });

    const lines = (await readFile(outputHistory, 'utf-8')).split(/\r?\n/).filter(Boolean);
    const events = lines.map(line => JSON.parse(line));
    const started = events.filter((evt: { type?: string }) => evt.type === 'turn-started');
    const finished = events.filter((evt: { type?: string }) => evt.type === 'turn-finished');

    expect(started).toHaveLength(2);
    expect(finished).toHaveLength(2);
    expect(started.map((evt: { actor?: string }) => evt.actor).sort()).toEqual([
      'game_master',
      'player',
    ]);
    expect(finished.map((evt: { actor?: string }) => evt.actor).sort()).toEqual([
      'game_master',
      'player',
    ]);
  });
});
