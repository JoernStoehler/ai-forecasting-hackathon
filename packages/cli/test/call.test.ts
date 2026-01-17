/**
 * Tests for the 'call' command
 *
 * NOTE: These tests require mocking the Gemini API or skipping when no API key is present.
 * For now, most tests are skipped with REQUIRES_API_KEY marker.
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runCall } from '../src/commands/call.js';

describe('call command', () => {
  it.skip('REQUIRES_API_KEY: calls Gemini API and saves response', async () => {
    // This test requires a real API key and makes a real API call
    // Skip in CI/automated tests

    if (!process.env.GEMINI_API_KEY) {
      console.log('Skipping: GEMINI_API_KEY not set');
      return;
    }

    const dir = await mkdtemp(join(tmpdir(), 'cli-call-'));
    const inputPrompt = join(dir, 'prompt.json');
    const outputResponse = join(dir, 'response.json');

    // Create a minimal prompt
    const prompt = {
      model: 'gemini-2.5-flash',
      request: {
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Respond with a single JSON array: [{"type":"publish-news","date":"2025-01-01","icon":"Landmark","title":"Test","description":"Test"}]' }],
          },
        ],
        config: {
          systemInstruction: 'You are a test forecaster. Return only valid JSON.',
          responseMimeType: 'application/json',
        },
      },
    };

    await writeFile(inputPrompt, JSON.stringify(prompt), 'utf-8');

    await runCall({
      inputPrompt,
      outputResponse,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const responseContent = await readFile(outputResponse, 'utf-8');
    const response = JSON.parse(responseContent);

    expect(response).toBeDefined();
    expect(response.response).toBeDefined();
    expect(response.response.text).toBeDefined();
  });

  it('throws error when API key is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-call-nokey-'));
    const inputPrompt = join(dir, 'prompt.json');
    const outputResponse = join(dir, 'response.json');

    const prompt = {
      model: 'gemini-2.5-flash',
      request: { model: 'gemini-2.5-flash', contents: [], config: {} },
    };

    await writeFile(inputPrompt, JSON.stringify(prompt), 'utf-8');

    // Should throw when no API key provided
    await expect(
      runCall({
        inputPrompt,
        outputResponse,
        apiKey: undefined,
      })
    ).rejects.toThrow();
  });

  it.skip('REQUIRES_API_KEY: handles API errors gracefully', async () => {
    // Test that API errors are properly caught and reported
    // Requires real API to test error scenarios
  });

  it.skip('REQUIRES_API_KEY: streams response chunks', async () => {
    // Test that streaming works correctly
    // Requires real API with streaming support
  });
});
