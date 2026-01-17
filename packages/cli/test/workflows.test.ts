/**
 * CLI workflow and integration tests - multi-command scenarios
 */
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { runAggregate } from '../src/commands/aggregate.js';
import { runPrepare } from '../src/commands/prepare.js';
import { runParse } from '../src/commands/parse.js';

describe('CLI Workflows - Integration', () => {
  it('full pipeline: aggregate → prepare → parse', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-pipeline-'));

    // Step 1: Aggregate some events
    const inputHistory = join(dir, 'history.jsonl');
    const state1 = join(dir, 'state1.json');

    const events = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Event 1', description: 'First' },
      { type: 'news-published', date: '2025-01-02', icon: 'Landmark', title: 'Event 2', description: 'Second' },
    ];
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    await runAggregate({ inputHistory, outputState: state1 });

    const state = JSON.parse(await readFile(state1, 'utf-8'));
    expect(state.eventCount).toBe(2);

    // Step 2: Prepare a prompt from this history
    const promptFile = join(dir, 'prompt.json');

    await runPrepare({
      inputState: state1,
      inputHistory,
      outputPrompt: promptFile,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: 'Test forecaster',
    });

    const prompt = JSON.parse(await readFile(promptFile, 'utf-8'));
    expect(prompt.model).toBe('gemini-2.5-flash');
    expect(prompt.request.config.systemInstruction).toBeDefined();

    // Step 3: Parse a mock response (simulating what 'call' would return)
    const mockResponse = {
      model: 'gemini-2.5-flash',
      response: {
        text: JSON.stringify([
          { type: 'publish-news', date: '2025-01-03', icon: 'BrainCircuit', title: 'GM Response', description: 'Generated' },
        ]),
      },
    };

    const responseFile = join(dir, 'response.json');
    const parsedEvents = join(dir, 'parsed.jsonl');

    await writeFile(responseFile, JSON.stringify(mockResponse, null, 2), 'utf-8');

    await runParse({
      inputJson: responseFile,
      outputEvents: parsedEvents,
    });

    const parsedContent = await readFile(parsedEvents, 'utf-8');
    const parsedLines = parsedContent.split(/\r?\n/).filter(Boolean);
    expect(parsedLines.length).toBeGreaterThan(0);

    // Verify pipeline produced valid data at each step
    expect(state.events).toHaveLength(2);
    expect(prompt.request).toBeDefined();
    expect(parsedLines).not.toEqual([]);
  });

  it('aggregate is idempotent (running twice produces same result)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-idempotent-'));
    const inputHistory = join(dir, 'history.jsonl');
    const state1 = join(dir, 'state1.json');
    const state2 = join(dir, 'state2.json');

    const events = [
      { type: 'news-published', date: '2025-01-03', icon: 'Globe', title: 'Event A', description: 'First' },
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'Event B', description: 'Out of order' },
    ];
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    // Run aggregate twice with same input
    await runAggregate({ inputHistory, outputState: state1 });
    await runAggregate({ inputHistory, outputState: state2 });

    const result1 = JSON.parse(await readFile(state1, 'utf-8'));
    const result2 = JSON.parse(await readFile(state2, 'utf-8'));

    // Results should be identical
    expect(result1.eventCount).toBe(result2.eventCount);
    expect(result1.latestDate).toBe(result2.latestDate);
    expect(result1.events).toEqual(result2.events);
  });

  it('event ordering is stable across runs', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-ordering-'));
    const inputHistory = join(dir, 'history.jsonl');

    // Create events with mixed dates
    const events = [
      { type: 'news-published', date: '2025-06-01', icon: 'Globe', title: 'June', description: 'Mid' },
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'January', description: 'Start' },
      { type: 'news-published', date: '2025-12-01', icon: 'BrainCircuit', title: 'December', description: 'End' },
    ];

    const state1 = join(dir, 'state1.json');
    const state2 = join(dir, 'state2.json');
    const state3 = join(dir, 'state3.json');

    // Write events, aggregate, repeat
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');
    await runAggregate({ inputHistory, outputState: state1 });

    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');
    await runAggregate({ inputHistory, outputState: state2 });

    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');
    await runAggregate({ inputHistory, outputState: state3 });

    const result1 = JSON.parse(await readFile(state1, 'utf-8'));
    const result2 = JSON.parse(await readFile(state2, 'utf-8'));
    const result3 = JSON.parse(await readFile(state3, 'utf-8'));

    // All runs should produce same ordering
    expect(result1.events[0].date).toBe('2025-01-01');
    expect(result1.events[1].date).toBe('2025-06-01');
    expect(result1.events[2].date).toBe('2025-12-01');

    expect(result1.events).toEqual(result2.events);
    expect(result2.events).toEqual(result3.events);
  });

  it('materials workflow: prepare with different material selections', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-materials-'));
    const inputHistory = join(dir, 'history.jsonl');
    const state = join(dir, 'state.json');
    const promptNone = join(dir, 'prompt-none.json');
    const promptAll = join(dir, 'prompt-all.json');

    const events = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Test', description: 'Test' },
    ];
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');
    await runAggregate({ inputHistory, outputState: state });

    // Prepare with materials: 'none'
    await runPrepare({
      inputState: state,
      inputHistory,
      outputPrompt: promptNone,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
    });

    // Prepare with materials: 'all'
    await runPrepare({
      inputState: state,
      inputHistory,
      outputPrompt: promptAll,
      materials: 'all',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
    });

    const promptNoneData = JSON.parse(await readFile(promptNone, 'utf-8'));
    const promptAllData = JSON.parse(await readFile(promptAll, 'utf-8'));

    // Both should have valid prompts
    expect(promptNoneData.model).toBe('gemini-2.5-flash');
    expect(promptAllData.model).toBe('gemini-2.5-flash');

    // Prompt with 'all' materials should be longer (more content)
    const noneSystemPrompt = JSON.stringify(promptNoneData.request.config.systemInstruction);
    const allSystemPrompt = JSON.stringify(promptAllData.request.config.systemInstruction);

    expect(allSystemPrompt.length).toBeGreaterThan(noneSystemPrompt.length);
  });

  it('aggregate merges new events into existing history', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-merge-'));
    const history1 = join(dir, 'history1.jsonl');
    const history2 = join(dir, 'new-events.jsonl');
    const outputHistory = join(dir, 'merged.jsonl');
    const outputState = join(dir, 'state.json');

    // Create initial history
    const initial = [
      { type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Old Event', description: 'First' },
    ];
    await writeFile(history1, initial.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    // Create new events to merge
    const newEvents = [
      { type: 'news-published', date: '2025-01-02', icon: 'Landmark', title: 'New Event', description: 'Second' },
    ];
    await writeFile(history2, newEvents.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    // Aggregate both
    await runAggregate({
      inputHistory: history1,
      newEvents: history2,
      outputState,
      outputHistory,
    });

    const state = JSON.parse(await readFile(outputState, 'utf-8'));
    const mergedContent = await readFile(outputHistory, 'utf-8');
    const mergedLines = mergedContent.split(/\r?\n/).filter(Boolean);

    // Should have both events
    expect(state.eventCount).toBe(2);
    expect(mergedLines).toHaveLength(2);

    // Events should be chronologically sorted in output
    const parsed = mergedLines.map(l => JSON.parse(l));
    expect(parsed[0].date).toBe('2025-01-01');
    expect(parsed[1].date).toBe('2025-01-02');
  });
});
