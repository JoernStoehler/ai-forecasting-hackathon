import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runTurn } from '../src/commands/turn.js';

describe('runTurn', () => {
  it('runs the full turn pipeline with mock output and emits turn markers', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
    const inputHistory = join(dir, 'history.jsonl');
    const newEvents = join(dir, 'new-events.jsonl');
    const outputHistory = join(dir, 'output-history.jsonl');
    const outputState = join(dir, 'output-state.json');
    const outputPrompt = join(dir, 'prompt.json');
    const outputResponse = join(dir, 'response.json');
    const outputEvents = join(dir, 'events.jsonl');

    await writeFile(
      inputHistory,
      JSON.stringify({
        type: 'news-published',
        date: '2025-01-01',
        icon: 'Landmark',
        title: 'Seed headline',
        description: 'Seed description',
      }),
      'utf-8'
    );

    await writeFile(
      newEvents,
      JSON.stringify({
        type: 'news-published',
        date: '2025-01-02',
        icon: 'Landmark',
        title: 'Player headline',
        description: 'Player description',
      }),
      'utf-8'
    );

    await runTurn({
      inputHistory,
      newEvents,
      outputHistory,
      outputState,
      outputPrompt,
      outputResponse,
      outputEvents,
      model: 'gemini-2.5-flash',
      systemPrompt: '',
      mock: true,
    });

    const lines = (await readFile(outputHistory, 'utf-8')).split(/\r?\n/).filter(Boolean);
    const events = lines.map(line => JSON.parse(line));
    const markers = events.filter(event => event.type === 'turn-started' || event.type === 'turn-finished');

    expect(markers).toHaveLength(4);
    const markerKeys = markers.map((event: { type: string; actor: string }) => `${event.type}-${event.actor}`);
    expect(markerKeys).toContain('turn-started-player');
    expect(markerKeys).toContain('turn-finished-player');
    expect(markerKeys).toContain('turn-started-game_master');
    expect(markerKeys).toContain('turn-finished-game_master');
  });
});
