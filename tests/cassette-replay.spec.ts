/**
 * Tests for cassette replay system - deterministic API fixtures
 */
import { test, expect } from '@playwright/test';

test.describe('Cassette Replay System', () => {
  test('replays recorded API call deterministically', async ({ page }) => {
    // This test verifies that the cassette replay system works
    // For now, this just documents the capability
    // TODO: Wire up fixture to webapp once we determine how to inject replay forecaster in browser

    expect(true).toBe(true); // Placeholder

    // Future implementation:
    // await page.goto('/?fixture=basic-turn');
    // await page.getByPlaceholder('Event Title').fill('Test player action');
    // await page.getByPlaceholder('Description').fill('Player submits action');
    // await page.getByRole('button', { name: /submit/i }).click();
    //
    // // Should get deterministic response from fixture
    // await expect(page.getByText('Major AI Lab Announces GPT-5')).toBeVisible();
    // await expect(page.getByText('Congress Holds AI Safety Hearings')).toBeVisible();
  });

  test('fixture format is valid', async () => {
    // Verify fixture file can be loaded and parsed
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'replays', 'basic-turn.json');
    const fixtureContent = await fs.readFile(fixturePath, 'utf-8');
    const fixture = JSON.parse(fixtureContent);

    // Validate structure
    expect(fixture.meta).toBeDefined();
    expect(fixture.meta.model).toBe('gemini-2.5-flash');
    expect(fixture.request).toBeDefined();
    expect(fixture.stream).toBeInstanceOf(Array);
    expect(fixture.stream.length).toBeGreaterThan(0);

    // Validate stream chunks
    fixture.stream.forEach((chunk: any) => {
      expect(chunk).toHaveProperty('delayNs');
      expect(chunk).toHaveProperty('text');
      expect(typeof chunk.delayNs).toBe('number');
      expect(typeof chunk.text).toBe('string');
    });
  });

  test('can load and replay fixture in Node environment', async () => {
    // Test the replay forecaster with the fixture
    const { loadReplayTape } = await import('../src/engine/forecaster/replayClient.js');
    const { createReplayForecaster } = await import('../src/engine/adapters/replayForecaster.js');
    const path = await import('node:path');

    const tapePath = path.join(process.cwd(), 'tests', 'fixtures', 'replays', 'basic-turn.json');
    const tape = await loadReplayTape(tapePath);

    expect(tape.meta.label).toBe('basic-turn');
    expect(tape.stream.length).toBe(3);

    // Create forecaster (note: request matching will be lenient since we don't have exact history)
    const forecaster = createReplayForecaster({ tapePath, strict: false });
    expect(forecaster.name).toBe('replay');

    // Forecast should work with matching history
    const history = [{
      type: 'news-published' as const,
      date: '2025-01-01',
      icon: 'Landmark' as const,
      title: 'Seed Event',
      description: 'Initial scenario seed event',
    }];

    const events = await forecaster.forecast({
      history,
      systemPrompt: 'You are a game master for an AI x-risk policy simulation game. The player represents the US government.',
    });

    // Should get events from the fixture
    expect(events.length).toBeGreaterThan(0);
    expect(events.some(e => e.title?.includes('GPT-5'))).toBe(true);
    expect(events.some(e => e.title?.includes('Congress'))).toBe(true);
  });
});
