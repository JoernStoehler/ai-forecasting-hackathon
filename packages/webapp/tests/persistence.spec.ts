/**
 * localStorage persistence tests
 */
import { test, expect } from '@playwright/test';

test.describe('LocalStorage Persistence', () => {
  test('saves events to localStorage on changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check localStorage has been populated
    const stored = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    }
  });

  test('loads events from localStorage on page load', async ({ page, context }) => {
    // Set up localStorage with custom event before page loads
    await context.addInitScript(() => {
      const testEvents = [
        {
          type: 'news-published',
          date: '2025-01-20',
          icon: 'Landmark',
          title: 'Persistence Test Event',
          description: 'This event was pre-loaded from localStorage'
        }
      ];
      localStorage.setItem('takeoff-timeline-events-v2', JSON.stringify(testEvents));
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should display the event from localStorage
    await expect(page.locator('text=Persistence Test Event')).toBeVisible();
  });

  test('persists across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get current timeline content
    const initialText = await page.locator('main').innerText();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show same content
    const reloadedText = await page.locator('main').innerText();
    expect(reloadedText).toBe(initialText);
  });

  test('falls back to seed events when localStorage is empty', async ({ page, context }) => {
    // Clear localStorage before page load
    await context.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should display seed events from engine
    const events = page.locator('[aria-expanded]');
    const count = await events.count();
    expect(count).toBeGreaterThan(0);

    // Should show 2025 (seed data starts in 2025)
    await expect(page.locator('text=2025')).toBeVisible();
  });

  test('handles corrupted localStorage gracefully', async ({ page, context }) => {
    // Set invalid JSON in localStorage
    await context.addInitScript(() => {
      localStorage.setItem('takeoff-timeline-events-v2', 'corrupted{invalid}json');
    });

    // Should not crash, should fall back to seed events
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should still display timeline (fallen back to seed events)
    const events = page.locator('[aria-expanded]');
    const count = await events.count();
    expect(count).toBeGreaterThan(0);

    // Should have logged error but continued
    expect(errors.some(e => e.includes('Failed to load'))).toBe(true);
  });

  test('persists telemetry events (event open/close)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Expand an event
    const firstEvent = page.locator('[aria-expanded]').first();
    await firstEvent.click();
    await page.waitForTimeout(200);

    // Check localStorage includes telemetry
    const stored = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    expect(stored).toBeTruthy();

    if (stored) {
      const events = JSON.parse(stored);
      const telemetryEvents = events.filter((e: any) => e.type === 'news-opened' || e.type === 'news-closed');

      // Should have at least one telemetry event
      expect(telemetryEvents.length).toBeGreaterThan(0);

      // Telemetry events should have required fields
      if (telemetryEvents.length > 0) {
        expect(telemetryEvents[0]).toHaveProperty('type');
        expect(telemetryEvents[0]).toHaveProperty('targetId');
        expect(telemetryEvents[0]).toHaveProperty('at');
      }
    }
  });

  test('storage updates are reflected in new tabs', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get current localStorage value
    const initialStored = await page.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    // Open new tab with same context
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.waitForLoadState('networkidle');

    // Should have same timeline
    const page2Stored = await page2.evaluate(() => {
      return localStorage.getItem('takeoff-timeline-events-v2');
    });

    expect(page2Stored).toBe(initialStored);

    await page2.close();
  });
});
