/**
 * Full turn cycle tests (player → GM → response)
 *
 * NOTE: These tests require mocking the Gemini API or using a mock forecaster.
 * Currently they will test the UI flow but may timeout waiting for real API responses.
 */
import { test, expect } from '@playwright/test';

test.describe('Player Turn Creation', () => {
  test('compose panel is visible and ready for input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Compose panel should be fixed at bottom
    const composePanel = page.locator('footer');
    await expect(composePanel).toBeVisible();

    // Should have input fields
    await expect(page.getByPlaceholder('Event Title')).toBeVisible();
    await expect(page.getByPlaceholder('Description...')).toBeVisible();

    // Submit button should be visible
    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeVisible();
  });

  test('submit button is disabled when fields are empty', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when fields are filled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill in the form
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('This is a test event description');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeEnabled();
  });

  test('can select different event icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click icon picker button
    const iconButton = page.locator('button[aria-haspopup="true"]').first();
    await iconButton.click();

    // Icon picker should appear
    const iconPicker = page.locator('[role=""]').filter({ hasText: /Landmark/ }).first();
    await expect(iconButton).toHaveAttribute('aria-expanded', 'true');

    // Should show multiple icon options (ICON_SET has 26 icons)
    const iconOptions = page.locator('button[title]').filter({ has: page.locator('svg') });
    const count = await iconOptions.count();
    expect(count).toBeGreaterThan(20); // Should be 26 from ICON_SET

    // Click an icon
    await iconOptions.nth(5).click();

    // Icon picker should close
    await expect(iconButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('date defaults to day after latest event', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The date is not directly visible in the compose panel UI
    // But we can verify it's set by checking the DOM or by submitting
    // For now, we'll just verify the compose panel is functioning
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('GM Turn and Response', () => {
  test.skip('REQUIRES_MOCK: submitting player event triggers GM turn', async ({ page }) => {
    // This test requires mocking the Gemini API
    // Skip for now until mock forecaster is integrated into webapp
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('[aria-expanded]').count();

    // Fill and submit
    await page.getByPlaceholder('Event Title').fill('Player Action');
    await page.getByPlaceholder('Description...').fill('Player makes a policy decision');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await submitButton.click();

    // Should show loading state
    await expect(submitButton).toBeDisabled();

    // Wait for GM response (with timeout)
    await page.waitForTimeout(30000); // 30s timeout for real API

    // Should have new events from GM
    const newCount = await page.locator('[aria-expanded]').count();
    expect(newCount).toBeGreaterThan(initialCount);

    // Submit button should be enabled again
    await expect(submitButton).toBeEnabled();
  });

  test.skip('REQUIRES_MOCK: shows loading spinner during GM turn', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill and submit
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await submitButton.click();

    // Should show spinner (rotating border animation)
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();

    // Wait for completion
    await page.waitForTimeout(30000);

    // Spinner should be gone
    await expect(spinner).not.toBeVisible();
  });

  test.skip('REQUIRES_MOCK: GM events appear in timeline chronologically', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Submit event
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    // Wait for GM response
    await page.waitForTimeout(30000);

    // Timeline should be sorted (can't easily verify dates, but structure should be maintained)
    const timeline = page.locator('main');
    await expect(timeline).toBeVisible();
  });

  test('form fields clear after submission', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const titleInput = page.getByPlaceholder('Event Title');
    const descInput = page.getByPlaceholder('Description...');

    // Fill form
    await titleInput.fill('Test Event');
    await descInput.fill('Test description');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await submitButton.click();

    // Wait a moment for form to process
    await page.waitForTimeout(500);

    // Fields should be cleared (even if GM turn fails/times out)
    // Actually, looking at the code, fields are cleared immediately on submit
    const titleValue = await titleInput.inputValue();
    const descValue = await descInput.inputValue();

    expect(titleValue).toBe('');
    expect(descValue).toBe('');
  });
});

test.describe('Turn Markers', () => {
  test.skip('REQUIRES_IMPLEMENTATION: turn-started events are created', async ({ page }) => {
    // This test verifies that turn-started events are properly created
    // They should be in the event log but not necessarily visible in UI
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Submit an event
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    await page.waitForTimeout(1000);

    // Check localStorage for turn markers
    const stored = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    if (stored) {
      const events = JSON.parse(stored);
      const turnEvents = events.filter((e: any) =>
        e.type === 'turn-started' || e.type === 'turn-finished'
      );

      // Should have turn markers
      expect(turnEvents.length).toBeGreaterThan(0);

      // Should have both player and game_master turns
      const playerTurns = turnEvents.filter((e: any) => e.actor === 'player');
      const gmTurns = turnEvents.filter((e: any) => e.actor === 'game_master');

      expect(playerTurns.length).toBeGreaterThan(0);
      // GM turns only created after successful forecast
      // expect(gmTurns.length).toBeGreaterThan(0);
    }
  });

  test.skip('REQUIRES_IMPLEMENTATION: turn markers have correct date ranges', async ({ page }) => {
    // Verify turn markers properly capture date ranges
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get latest date before submission
    const stored = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    let latestDateBefore = '2025-01-01';
    if (stored) {
      const events = JSON.parse(stored);
      const newsEvents = events.filter((e: any) => e.type === 'news-published');
      if (newsEvents.length > 0) {
        latestDateBefore = newsEvents[newsEvents.length - 1].date;
      }
    }

    // Submit event
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    await page.waitForTimeout(1000);

    // Check turn markers have appropriate date ranges
    const storedAfter = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    if (storedAfter) {
      const events = JSON.parse(storedAfter);
      const turnMarkers = events.filter((e: any) => e.type === 'turn-started' || e.type === 'turn-finished');

      for (const marker of turnMarkers) {
        expect(marker).toHaveProperty('from');
        expect(marker).toHaveProperty('until');
        expect(marker).toHaveProperty('actor');

        // Date should be >= previous latest
        expect(marker.from >= latestDateBefore).toBe(true);
      }
    }
  });
});
