/**
 * Large timeline rendering and performance tests
 *
 * Purpose: Verify webapp handles large event logs without performance degradation
 * Why: Games accumulate 100+ events; UI must remain responsive
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Large Timeline Rendering', () => {
  test('renders timeline with 100 events without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Generate 100 events
    const events = [];
    for (let i = 0; i < 100; i++) {
      events.push({
        type: 'news-published',
        date: `2025-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: ['Globe', 'Landmark', 'BrainCircuit', 'Radio', 'Coins'][i % 5],
        title: `Event ${i}`,
        description: `Description for event ${i} with some content to make it realistic`,
      });
    }

    const testFilePath = path.join('/tmp', 'large-timeline-100.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    // Import large timeline
    page.once('dialog', dialog => dialog.accept());

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(1000); // Give time to render

    // Verify timeline rendered (includes initial scenario events + imported)
    const eventElements = await page.locator('[aria-expanded]').count();
    expect(eventElements).toBeGreaterThan(50); // Should have many events visible

    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('search works correctly with 100+ events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Generate 150 events with some containing "important"
    const events = [];
    for (let i = 0; i < 150; i++) {
      events.push({
        type: 'news-published',
        date: `2025-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: i % 10 === 0 ? `Important Event ${i}` : `Regular Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const testFilePath = path.join('/tmp', 'large-search.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Search for "important"
    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill('important');

    await page.waitForTimeout(300);

    // Should find 15 events (every 10th event)
    const visibleEvents = await page.locator('[aria-expanded]').count();
    expect(visibleEvents).toBeGreaterThanOrEqual(15);
    expect(visibleEvents).toBeLessThanOrEqual(20); // Some buffer for initial events

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('scrolling works smoothly with large timeline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Generate 200 events
    const events = [];
    for (let i = 0; i < 200; i++) {
      events.push({
        type: 'news-published',
        date: `2025-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const testFilePath = path.join('/tmp', 'large-scroll.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(1000);

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(500);

    // Verify we can still interact with events
    const lastEvent = page.locator('[aria-expanded]').last();
    await expect(lastEvent).toBeVisible();

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(300);

    // Verify first events still visible
    const firstEvent = page.locator('[aria-expanded]').first();
    await expect(firstEvent).toBeVisible();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('export works with large timeline (100+ events)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Generate 120 events
    const events = [];
    for (let i = 0; i < 120; i++) {
      events.push({
        type: 'news-published',
        date: `2025-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const testFilePath = path.join('/tmp', 'large-export-import.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    // Import
    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Export
    const downloadPromise = page.waitForEvent('download');
    const exportButton = page.locator('button[title="Export JSON"]');
    await exportButton.click();

    const download = await downloadPromise;
    const downloadPath = await download.path();

    expect(downloadPath).toBeTruthy();

    if (downloadPath) {
      const exportedContent = fs.readFileSync(downloadPath, 'utf-8');
      const exportedEvents = JSON.parse(exportedContent);

      // Should have all 120 events plus initial scenario events
      expect(exportedEvents.length).toBeGreaterThanOrEqual(120);
    }

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});

test.describe('Large Timeline Edge Cases', () => {
  test('handles very long event titles (500+ chars)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longTitle = 'A'.repeat(500);
    const events = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: longTitle,
        description: 'Description',
      },
      {
        type: 'news-published',
        date: '2025-01-11',
        icon: 'Landmark',
        title: 'Normal Event',
        description: 'Normal description',
      },
    ];

    const testFilePath = path.join('/tmp', 'long-title.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Verify both events visible (long title doesn't break layout)
    const eventCount = await page.locator('[aria-expanded]').count();
    expect(eventCount).toBeGreaterThanOrEqual(2);

    // Verify search still works
    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill('Normal Event');
    await page.waitForTimeout(200);

    const visibleAfterSearch = await page.locator('[aria-expanded]').count();
    expect(visibleAfterSearch).toBeGreaterThanOrEqual(1);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('handles very long descriptions (2000+ chars)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longDescription = 'Lorem ipsum dolor sit amet. '.repeat(100); // ~2700 chars

    const events = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: 'Event with long description',
        description: longDescription,
      },
    ];

    const testFilePath = path.join('/tmp', 'long-description.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Event should be visible
    const eventTitle = page.locator('text=Event with long description');
    await expect(eventTitle).toBeVisible();

    // Expand event to show description
    const expandButton = page.locator('[aria-expanded="false"]').first();
    await expandButton.click();

    await page.waitForTimeout(200);

    // Description should be rendered (even if long)
    const pageContent = await page.locator('main').textContent();
    expect(pageContent).toContain('Lorem ipsum');

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('handles mixed very long and normal events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const events = [];

    // Add 50 normal events
    for (let i = 0; i < 50; i++) {
      events.push({
        type: 'news-published',
        date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
        icon: 'Globe',
        title: `Normal Event ${i}`,
        description: `Normal description ${i}`,
      });
    }

    // Add 5 events with very long titles
    for (let i = 0; i < 5; i++) {
      events.push({
        type: 'news-published',
        date: `2025-02-${String(i + 1).padStart(2, '0')}`,
        icon: 'Landmark',
        title: `Long Title ${'X'.repeat(300)}`,
        description: `Description ${i}`,
      });
    }

    const testFilePath = path.join('/tmp', 'mixed-lengths.json');
    fs.writeFileSync(testFilePath, JSON.stringify(events, null, 2));

    page.once('dialog', dialog => dialog.accept());
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(1000);

    // All events should render
    const eventCount = await page.locator('[aria-expanded]').count();
    expect(eventCount).toBeGreaterThanOrEqual(50);

    // Search should work
    await page.getByPlaceholder('Search timeline...').fill('Normal Event 25');
    await page.waitForTimeout(200);

    const searchResults = await page.locator('text=Normal Event 25').isVisible();
    expect(searchResults).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});
