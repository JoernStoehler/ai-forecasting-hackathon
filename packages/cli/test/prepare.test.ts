/**
 * Tests for the 'prepare' command
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runPrepare } from '../src/commands/prepare.js';

describe('prepare command', () => {
  it('generates a prompt from history', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-prepare-'));
    const inputHistory = join(dir, 'history.jsonl');
    const outputPrompt = join(dir, 'prompt.json');

    const events = [
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'Test Event', description: 'Test description' },
    ];
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    await runPrepare({
      inputState: '',
      inputHistory,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: 'You are a test forecaster.',
      outputPrompt,
    });

    const promptContent = await readFile(outputPrompt, 'utf-8');
    const prompt = JSON.parse(promptContent);

    expect(prompt.model).toBe('gemini-2.5-flash');
    expect(prompt.request).toBeDefined();
    expect(prompt.request.model).toBe('gemini-2.5-flash');
    expect(prompt.request.contents).toBeDefined();
    expect(prompt.request.config).toBeDefined();
    expect(prompt.request.config.systemInstruction).toContain('You are a test forecaster.');
  });

  it('includes materials in system instruction', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-prepare-materials-'));
    const inputHistory = join(dir, 'history.jsonl');
    const outputPrompt = join(dir, 'prompt.json');

    await writeFile(inputHistory, '', 'utf-8');

    await runPrepare({
      inputState: '',
      inputHistory,
      materials: 'all', // Uses default materials
      model: 'gemini-2.5-flash',
      systemPrompt: 'System prompt.',
      outputPrompt,
    });

    const prompt = JSON.parse(await readFile(outputPrompt, 'utf-8'));

    // Should include materials in system instruction
    expect(prompt.request.config.systemInstruction).toBeDefined();
    expect(prompt.request.config.systemInstruction.length).toBeGreaterThan(20);
  });

  it('sets response MIME type to JSON', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-prepare-json-'));
    const inputHistory = join(dir, 'history.jsonl');
    const outputPrompt = join(dir, 'prompt.json');

    await writeFile(inputHistory, '', 'utf-8');

    await runPrepare({
      inputState: '',
      inputHistory,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
      outputPrompt,
    });

    const prompt = JSON.parse(await readFile(outputPrompt, 'utf-8'));
    expect(prompt.request.config.responseMimeType).toBe('application/json');
  });

  it('projects events into prompt contents', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-prepare-projection-'));
    const inputHistory = join(dir, 'history.jsonl');
    const outputPrompt = join(dir, 'prompt.json');

    const events = [
      { type: 'news-published', date: '2025-01-01', icon: 'Landmark', title: 'Event 1', description: 'Desc 1' },
      { type: 'news-published', date: '2025-01-02', icon: 'Globe', title: 'Event 2', description: 'Desc 2' },
    ];
    await writeFile(inputHistory, events.map(e => JSON.stringify(e)).join('\n'), 'utf-8');

    await runPrepare({
      inputState: '',
      inputHistory,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
      outputPrompt,
    });

    const prompt = JSON.parse(await readFile(outputPrompt, 'utf-8'));

    // Check that events are in the prompt contents
    expect(prompt.request.contents).toHaveLength(1);
    expect(prompt.request.contents[0].role).toBe('user');
    expect(prompt.request.contents[0].parts).toBeDefined();
    expect(prompt.request.contents[0].parts[0].text).toContain('Event 1');
  });
});
