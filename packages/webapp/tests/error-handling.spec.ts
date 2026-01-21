/**
 * Error handling and edge case tests
 *
 * Purpose: Verify webapp handles errors gracefully and remains functional
 * Why: Production apps must recover from errors without leaving broken state
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Error Display', () => {
  test.skip('REQUIRES_MOCK_FAILURE: shows toast error when GM turn fails', async ({ page }) => {
    // This test requires mocking a failing Gemini API response
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger an action that will fail (needs API mock to force failure)
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    // Should show error toast
    const toast = page.locator('[role="alert"], .toast, .error').filter({ hasText: /error/i });
    await expect(toast).toBeVisible({ timeout: 35000 });
  });

  test.skip('REQUIRES_MOCK_FAILURE: reverts timeline on GM turn error', async ({ page }) => {
    // When GM turn fails, should revert to pre-submission state
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('[aria-expanded]').count();

    // Trigger failing action
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    // Wait for error
    await page.waitForTimeout(35000);

    // Event count should be back to original (error reverts state)
    const finalCount = await page.locator('[aria-expanded]').count();
    expect(finalCount).toBe(initialCount);
  });

  test.skip('REQUIRES_IMPLEMENTATION: error toast can be dismissed', async ({ page }) => {
    // Once error toast is implemented, test dismissal
    await page.goto('/');

    // Trigger error somehow
    // ...

    // Click close button on toast
    const closeButton = page.locator('button').filter({ hasText: /close|dismiss|×/i });
    await closeButton.click();

    // Toast should disappear
    const toast = page.locator('[role="alert"]');
    await expect(toast).not.toBeVisible();
  });

  test.skip('REQUIRES_IMPLEMENTATION: multiple errors show sequentially', async ({ page }) => {
    // If multiple errors occur, they should queue/show one at a time
    // Not critical for MVP
  });
});

test.describe('Network and API Edge Cases', () => {
  test.skip('REQUIRES_MOCK: handles slow API responses gracefully', async ({ page }) => {
    // Mock a very slow API response (5+ seconds)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await submitButton.click();

    // Should show loading state continuously
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();

    // After 3 seconds, still loading
    await page.waitForTimeout(3000);
    await expect(spinner).toBeVisible();

    // Eventually completes
    await page.waitForTimeout(30000);
  });

  test.skip('REQUIRES_MOCK: handles network disconnection during turn', async ({ page }) => {
    // Simulate network going offline mid-request
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');
    await page.locator('button[aria-label="Submit new event"]').click();

    // Should eventually show error
    await expect(page.locator('text=/network|offline|error/i')).toBeVisible({ timeout: 15000 });
  });

  test.skip('REQUIRES_IMPLEMENTATION: retry logic for failed API calls', async ({ page }) => {
    // Test that failed API calls are retried (once implemented)
    // PROJECT.md mentions retry logic as a gap to fill
  });

  test.skip('REQUIRES_IMPLEMENTATION: handles API rate limiting', async ({ page }) => {
    // Test behavior when API rate limit is hit
    // Should show appropriate error message
  });
});

test.describe('Input Validation', () => {
  test('prevents submission with empty title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill only description
    await page.getByPlaceholder('Description...').fill('Description only');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeDisabled();
  });

  test('prevents submission with empty description', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill only title
    await page.getByPlaceholder('Event Title').fill('Title only');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeDisabled();
  });

  test('prevents submission with whitespace-only inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill with whitespace
    await page.getByPlaceholder('Event Title').fill('   ');
    await page.getByPlaceholder('Description...').fill('   ');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeDisabled();
  });

  test('handles very long event titles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longTitle = 'A'.repeat(500);
    await page.getByPlaceholder('Event Title').fill(longTitle);
    await page.getByPlaceholder('Description...').fill('Description');

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeEnabled();

    // Should accept long titles (no max length enforced currently)
  });

  test('handles very long descriptions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longDesc = 'B'.repeat(5000);
    await page.getByPlaceholder('Event Title').fill('Title');
    await page.getByPlaceholder('Description...').fill(longDesc);

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeEnabled();
  });

  test('handles special characters in inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const specialTitle = '<script>alert("test")</script> & "quotes" \'apostrophes\'';
    const specialDesc = 'Line 1\nLine 2\tTabbed\r\nWindows newline';

    await page.getByPlaceholder('Event Title').fill(specialTitle);
    await page.getByPlaceholder('Description...').fill(specialDesc);

    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeEnabled();

    // Should handle special characters safely (no XSS)
  });
});

test.describe('Browser Compatibility', () => {
  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should load without errors (this is the existing smoke test)
    expect(errors.filter(e => !e.includes('Failed to load'))).toEqual([]);
  });

  test('handles browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialText = await page.locator('main').innerText();

    // Navigate away and back
    await page.goto('about:blank');
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should restore state
    const restoredText = await page.locator('main').innerText();
    expect(restoredText).toBe(initialText);
  });

  test('handles page refresh during loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start an action
    await page.getByPlaceholder('Event Title').fill('Test');
    await page.getByPlaceholder('Description...').fill('Test');

    // Refresh immediately
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should load cleanly (no partial state corruption)
    const events = page.locator('[aria-expanded]');
    const count = await events.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Import Error Handling', () => {
  test('shows error for malformed JSON file', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create malformed JSON file
    const testFilePath = path.join('/tmp', 'malformed.json');
    fs.writeFileSync(testFilePath, '{ "invalid": json }}}', 'utf-8');

    let errorDialogShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().toLowerCase().includes('error') ||
          dialog.message().toLowerCase().includes('invalid') ||
          dialog.message().toLowerCase().includes('parse')) {
        errorDialogShown = true;
      }
      dialog.accept();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    expect(errorDialogShown).toBe(true);

    // Verify app is still functional
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByPlaceholder('Event Title')).toBeVisible();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('shows error for file with invalid event structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Valid JSON but invalid event structure
    const testFilePath = path.join('/tmp', 'invalid-structure.json');
    const invalidEvents = [
      {
        // Missing required fields
        type: 'news-published',
        date: '2025-01-01',
        // Missing icon, title, description
      },
    ];
    fs.writeFileSync(testFilePath, JSON.stringify(invalidEvents, null, 2));

    let errorDialogShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().toLowerCase().includes('error') ||
          dialog.message().toLowerCase().includes('invalid')) {
        errorDialogShown = true;
      }
      dialog.accept();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    expect(errorDialogShown).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('handles empty JSON array gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const testFilePath = path.join('/tmp', 'empty-array.json');
    fs.writeFileSync(testFilePath, '[]', 'utf-8');

    page.once('dialog', dialog => dialog.accept());

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(300);

    // Should not error, just import empty list
    await expect(page.locator('main')).toBeVisible();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('shows error for non-JSON file content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const testFilePath = path.join('/tmp', 'not-json.txt');
    fs.writeFileSync(testFilePath, 'This is plain text, not JSON', 'utf-8');

    let errorDialogShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().toLowerCase().includes('error') ||
          dialog.message().toLowerCase().includes('parse')) {
        errorDialogShown = true;
      }
      dialog.accept();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    expect(errorDialogShown).toBe(true);

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});

test.describe('Search Edge Cases', () => {
  test('handles empty search query', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill('');

    await page.waitForTimeout(200);

    // Should show all events (no filtering)
    const eventCount = await page.locator('[aria-expanded]').count();
    expect(eventCount).toBeGreaterThan(0);
  });

  test('handles very long search query (500+ chars)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longQuery = 'search '.repeat(100); // 700 chars

    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill(longQuery);

    await page.waitForTimeout(300);

    // Should not crash, may show no results
    await expect(searchInput).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('handles search with regex special characters', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const regexChars = '.*+?^${}()|[]\\';

    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill(regexChars);

    await page.waitForTimeout(200);

    // Should not throw regex error (search should escape or handle)
    await expect(searchInput).toBeVisible();
  });

  test('handles rapid search input changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Search timeline...');

    // Rapid typing simulation
    for (let i = 0; i < 20; i++) {
      await searchInput.fill(`query${i}`);
    }

    await page.waitForTimeout(300);

    // Should handle debouncing/rapid updates gracefully
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Persistence Error Scenarios', () => {
  test('handles missing localStorage support gracefully', async ({ page }) => {
    // Note: Can't fully disable localStorage in Playwright, but can test error handling

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Inject script to simulate localStorage failure
    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function() {
        throw new Error('QuotaExceededError: localStorage is full');
      };
    });

    // Try to add event (which will fail to persist)
    await page.getByPlaceholder('Event Title').fill('Test Event');
    await page.getByPlaceholder('Description...').fill('Test description');

    await page.waitForTimeout(500);

    // App should remain functional despite persistence failure
    await expect(page.locator('main')).toBeVisible();
  });

  test('handles corrupted localStorage data', async ({ page }) => {
    // Set corrupted data before page load
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem('forecasting-game-state', '{ corrupted json }}}');
    });

    // Reload to trigger load from corrupted storage
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should either clear corrupted data or show error, but remain functional
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByPlaceholder('Event Title')).toBeVisible();
  });
});

test.describe('Recovery After Errors', () => {
  test('app remains functional after import error', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger import error
    const testFilePath = path.join('/tmp', 'trigger-error.json');
    fs.writeFileSync(testFilePath, 'invalid json', 'utf-8');

    page.on('dialog', dialog => dialog.accept());

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Now verify we can still use the form
    await page.getByPlaceholder('Event Title').fill('Recovery Test');
    await page.getByPlaceholder('Description...').fill('Test after error');

    await expect(page.getByPlaceholder('Event Title')).toHaveValue('Recovery Test');

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('export works after import error', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger import error
    const testFilePath = path.join('/tmp', 'import-fail.json');
    fs.writeFileSync(testFilePath, '{ "bad": json }', 'utf-8');

    page.on('dialog', dialog => dialog.accept());

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[title="Import JSON"]').click();
    await fileChooserPromise.then(fc => fc.setFiles(testFilePath));

    await page.waitForTimeout(500);

    // Now try export (should still work with current state)
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[title="Export JSON"]').click();
    const download = await downloadPromise;

    expect(download).toBeTruthy();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('search works after form validation error', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to submit invalid form (empty fields trigger validation)
    const title = page.getByPlaceholder('Event Title');
    await title.fill('');

    await page.waitForTimeout(200);

    // Now verify search still works
    const searchInput = page.getByPlaceholder('Search timeline...');
    await searchInput.fill('test search');

    await page.waitForTimeout(200);

    await expect(searchInput).toHaveValue('test search');
  });
});
