#!/usr/bin/env tsx
/**
 * Script to record a real Gemini API response as a cassette replay fixture.
 * Usage: tsx scripts/record-fixture.ts [fixture-name]
 */

import { createNodeForecaster } from '../src/engine/adapters/geminiNodeForecaster.js';
import { createRecordingGenAIClient } from '../src/engine/forecaster/replayClient.js';
import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GenAIClient } from '../src/engine/forecaster/geminiStreaming.js';
import { ICON_SET } from '../src/engine/constants.js';

const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures', 'replays');

async function main() {
  const fixtureName = process.argv[2] || 'basic-turn';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY not set');
    process.exit(1);
  }

  const model = 'gemini-2.5-flash';
  console.log(`Recording fixture: ${fixtureName}`);
  console.log(`Model: ${model}`);

  // Create base client
  const baseClient = new GoogleGenAI({ apiKey }) as unknown as GenAIClient;

  // Wrap with recording client
  const tapePath = join(FIXTURES_DIR, `${fixtureName}.json`);
  const recordingClient = createRecordingGenAIClient({
    baseClient,
    tapePath,
    meta: {
      label: fixtureName,
      comment: `Recorded on ${new Date().toISOString()}`,
    },
  });

  // Create forecaster with recording client
  const forecaster = createNodeForecaster({
    apiKey,
    model,
    client: recordingClient,
  });

  // Simple test history
  const history = [
    {
      type: 'news-published' as const,
      date: '2025-01-01',
      icon: ICON_SET[0],
      title: 'Seed Event',
      description: 'Initial scenario seed event for testing',
    },
  ];

  console.log('Calling Gemini API...');

  try {
    const events = await forecaster.forecast({
      history,
      systemPrompt: 'You are a game master for a policy simulation. Generate 1-2 plausible events.',
    });

    console.log(`✓ Recorded ${events.length} events`);
    console.log(`✓ Fixture saved to: ${tapePath}`);
    console.log('\nGenerated events:');
    events.forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.type}] ${e.title || '(no title)'}`);
    });

    // Show fixture contents for debugging
    console.log('\nFixture preview:');
    const fixture = JSON.parse(await import('node:fs/promises').then(fs => fs.readFile(tapePath, 'utf-8')));
    console.log(`  Stream chunks: ${fixture.stream.length}`);
    console.log(`  First chunk text: ${fixture.stream[0]?.text?.substring(0, 100)}...`);
  } catch (error) {
    console.error('Error:', error);
    console.error('\nAttempting to show recorded fixture if it exists...');
    try {
      const fixture = JSON.parse(await import('node:fs/promises').then(fs => fs.readFile(tapePath, 'utf-8')));
      console.log('Fixture was saved despite error. Stream chunks:', fixture.stream.length);
      fixture.stream.forEach((chunk: any, i: number) => {
        console.log(`  Chunk ${i}: "${chunk.text}"`);
      });
    } catch {}
    process.exit(1);
  }
}

main();
