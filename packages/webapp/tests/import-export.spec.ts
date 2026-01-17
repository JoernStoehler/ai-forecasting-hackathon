/**
 * Import and export functionality tests
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Export Functionality', () => {
  test('exports timeline as JSON file', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = page.locator('button[title="Export JSON"]');
    await exportButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename format
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^takeoff-timeline-\d{4}-\d{2}-\d{2}\.json$/);

    // Save and verify content
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    if (downloadPath) {
      const content = fs.readFileSync(downloadPath, 'utf-8');
      const parsed = JSON.parse(content);

      // Should be an array of events
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);

      // Events should have expected structure
      const firstEvent = parsed[0];
      expect(firstEvent).toHaveProperty('type');
      expect(firstEvent).toHaveProperty('date');
    }
  });

  test('exported file contains all timeline events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Count visible events
    const visibleEvents = page.locator('[aria-expanded]');
    const visibleCount = await visibleEvents.count();

    // Export
    const downloadPromise = page.waitForEvent('download');
    const exportButton = page.locator('button[title="Export JSON"]');
    await exportButton.click();
    const download = await downloadPromise;

    // Verify exported events
    const downloadPath = await download.path();
    if (downloadPath) {
      const content = fs.readFileSync(downloadPath, 'utf-8');
      const parsed = JSON.parse(content);

      // Count news-published events in export
      const newsEvents = parsed.filter((e: any) => e.type === 'news-published');

      // Should match or exceed visible count (export includes all event types)
      expect(newsEvents.length).toBeGreaterThanOrEqual(visibleCount);
    }
  });
});

test.describe('Import Functionality', () => {
  test('imports valid JSON timeline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create a test import file
    const testEvents = [
      {
        type: 'news-published',
        date: '2025-01-15',
        icon: 'Landmark',
        title: 'Test Import Event',
        description: 'This is a test event from import'
      }
    ];

    const testFilePath = path.join('/tmp', 'test-import.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testEvents, null, 2));

    // Set up file chooser listener
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Click import button
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    // Upload file
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    // Handle confirmation dialog
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Replace current timeline');
      dialog.accept();
    });

    await page.waitForTimeout(500);

    // Verify import success
    await expect(page.locator('text=Test Import Event')).toBeVisible();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('shows error for invalid JSON', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create invalid JSON file
    const testFilePath = path.join('/tmp', 'invalid-import.json');
    fs.writeFileSync(testFilePath, 'not valid json{]');

    // Set up dialog handler for error
    let errorShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().includes('Error importing')) {
        errorShown = true;
        dialog.accept();
      }
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);
    expect(errorShown).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('validates imported events structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create file with invalid event structure
    const invalidEvents = [
      {
        type: 'news-published',
        // Missing required fields like date, title, description
        title: 'Incomplete Event'
      }
    ];

    const testFilePath = path.join('/tmp', 'invalid-structure.json');
    fs.writeFileSync(testFilePath, JSON.stringify(invalidEvents, null, 2));

    let errorShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().includes('Error importing')) {
        errorShown = true;
      }
      dialog.accept();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Should show validation error
    expect(errorShown).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('allows canceling import', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Count initial events
    const initialCount = await page.locator('[aria-expanded]').count();

    // Create test file
    const testEvents = [{ type: 'news-published', date: '2025-01-15', icon: 'Landmark', title: 'Test', description: 'Test' }];
    const testFilePath = path.join('/tmp', 'test-cancel.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testEvents, null, 2));

    // Set up dialog to cancel
    page.once('dialog', dialog => {
      dialog.dismiss();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Should still have original events
    const currentCount = await page.locator('[aria-expanded]').count();
    expect(currentCount).toBe(initialCount);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('deduplicates events with duplicate IDs on import', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create events with duplicate IDs (deduplication should happen)
    const eventsWithDuplicates = [
      {
        type: 'news-published',
        id: 'duplicate-id-1',
        date: '2025-01-10',
        icon: 'Globe',
        title: 'First Version',
        description: 'This will be replaced',
      },
      {
        type: 'news-published',
        id: 'duplicate-id-1',
        date: '2025-01-11',
        icon: 'Landmark',
        title: 'Second Version',
        description: 'This should be kept (last one wins)',
      },
      {
        type: 'news-published',
        id: 'unique-id',
        date: '2025-01-12',
        icon: 'BrainCircuit',
        title: 'Unique Event',
        description: 'This should remain',
      },
    ];

    const testFilePath = path.join('/tmp', 'test-duplicates.json');
    fs.writeFileSync(testFilePath, JSON.stringify(eventsWithDuplicates, null, 2));

    // Set up dialog handler
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Replace current timeline');
      dialog.accept();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Should only show 2 events (duplicate-id-1 deduplicated, unique-id kept)
    // Plus initial scenario events
    const secondVersionVisible = await page.locator('text=Second Version').isVisible();
    const firstVersionVisible = await page.locator('text=First Version').isVisible();
    const uniqueVisible = await page.locator('text=Unique Event').isVisible();

    expect(secondVersionVisible).toBe(true); // Last one wins
    expect(firstVersionVisible).toBe(false); // Should be replaced
    expect(uniqueVisible).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});

test.describe('Import/Export Round Trip', () => {
  test('exported timeline can be re-imported without data loss', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial timeline text
    const initialTimeline = await page.locator('main').innerText();

    // Export
    const downloadPromise = page.waitForEvent('download');
    const exportButton = page.locator('button[title="Export JSON"]');
    await exportButton.click();
    const download = await downloadPromise;

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    if (downloadPath) {
      // Re-import the exported file
      page.once('dialog', dialog => dialog.accept());

      const fileChooserPromise = page.waitForEvent('filechooser');
      const importButton = page.locator('button[title="Import JSON"]');
      await importButton.click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(downloadPath);

      await page.waitForTimeout(500);

      // Timeline should be identical
      const reimportedTimeline = await page.locator('main').innerText();
      expect(reimportedTimeline).toBe(initialTimeline);
    }
  });
});
