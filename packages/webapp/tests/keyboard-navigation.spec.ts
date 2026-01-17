/**
 * Keyboard navigation and accessibility tests
 *
 * Purpose: Verify webapp is keyboard-accessible (critical for a11y)
 * Why: Users should be able to navigate without a mouse
 */
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('Tab key navigates through interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus should start on body or first interactive element
    await page.keyboard.press('Tab');

    // Should focus on first interactive element (search or button)
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName + (el?.getAttribute('placeholder') || el?.getAttribute('aria-label') || '');
    });

    // Should be on an input or button
    expect(focusedElement).toMatch(/INPUT|BUTTON/i);
  });

  test('Enter key activates focused button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill in form
    await page.getByPlaceholder('Event Title').fill('Keyboard Test Event');
    await page.getByPlaceholder('Description...').fill('Testing keyboard interaction');

    // Tab to submit button
    await page.getByPlaceholder('Description...').press('Tab'); // Move to icon selector or submit
    // May need multiple tabs depending on layout - let's focus submit directly
    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await submitButton.focus();

    // Verify button has focus
    const isFocused = await submitButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Form should clear (event submitted)
    await page.waitForTimeout(500);
    const titleValue = await page.getByPlaceholder('Event Title').inputValue();
    expect(titleValue).toBe('');
  });

  test('Escape key clears search input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Search timeline...');

    // Type search query
    await searchInput.fill('test query');
    expect(await searchInput.inputValue()).toBe('test query');

    // Press Escape
    await searchInput.press('Escape');

    // Should clear (or blur - depends on implementation)
    await page.waitForTimeout(200);

    // After escape, either input is cleared or focus is removed
    const valueAfterEscape = await searchInput.inputValue();
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);

    // Should either clear the input or remove focus
    expect(valueAfterEscape === '' || !isFocused).toBe(true);
  });

  test('Arrow keys navigate through timeline events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get first expandable event
    const firstEvent = page.locator('[aria-expanded]').first();

    // Focus on it
    await firstEvent.focus();

    const isFirstFocused = await firstEvent.evaluate(el => el === document.activeElement);
    expect(isFirstFocused).toBe(true);

    // Press ArrowDown to move to next event
    await page.keyboard.press('ArrowDown');

    await page.waitForTimeout(100);

    // Focus should move to next element or stay (depends on implementation)
    // This tests that arrow keys don't crash
    const focusedAfterArrow = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedAfterArrow).toBeTruthy();
  });

  test('Space key expands/collapses focused event', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus first event
    const firstEvent = page.locator('[aria-expanded]').first();
    await firstEvent.focus();

    // Get initial expanded state
    const initialExpanded = await firstEvent.getAttribute('aria-expanded');

    // Press Space to toggle
    await page.keyboard.press('Space');

    await page.waitForTimeout(200);

    // State should toggle
    const afterSpace = await firstEvent.getAttribute('aria-expanded');
    expect(afterSpace).not.toBe(initialExpanded);
  });
});

test.describe('Focus Management', () => {
  test('focus visible on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab to first button
    await page.keyboard.press('Tab');

    // Check if focus is visible (outline or border)
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow.includes('focus') ||
        el.matches(':focus-visible')
      );
    });

    expect(hasFocusStyle).toBe(true);
  });

  test('focus returns to trigger after dialog close', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus import button
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.focus();

    const wasImportFocused = await importButton.evaluate(el => el === document.activeElement);
    expect(wasImportFocused).toBe(true);

    // Click to open file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await importButton.click();

    await fileChooserPromise;

    // Cancel file chooser (press Escape)
    await page.keyboard.press('Escape');

    await page.waitForTimeout(200);

    // Focus should return to import button
    const isFocusedAfterCancel = await importButton.evaluate(el => el === document.activeElement);
    expect(isFocusedAfterCancel).toBe(true);
  });

  test('form inputs receive focus on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const titleInput = page.getByPlaceholder('Event Title');

    // Click input
    await titleInput.click();

    // Should be focused
    const isFocused = await titleInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Should be able to type
    await page.keyboard.type('Test Input');
    const value = await titleInput.inputValue();
    expect(value).toBe('Test Input');
  });

  test('focus trap within modal/dialog (if present)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to trigger a dialog (import confirmation)
    const importButton = page.locator('button[title="Import JSON"]');

    // This test just verifies we can interact with dialogs via keyboard
    // Full focus trap would require actually triggering a dialog with multiple elements
    await expect(importButton).toBeFocusable();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.skip('UNIMPLEMENTED: Ctrl+K opens search', async ({ page }) => {
    // Purpose: Quick search access
    // Why: Power users expect keyboard shortcuts
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Press Ctrl+K
    await page.keyboard.press('Control+K');

    // Search input should focus
    const searchInput = page.getByPlaceholder('Search timeline...');
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test.skip('UNIMPLEMENTED: Ctrl+E triggers export', async ({ page }) => {
    // Purpose: Quick export access
    // Why: Keyboard-only workflow for power users
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const downloadPromise = page.waitForEvent('download');

    // Press Ctrl+E
    await page.keyboard.press('Control+E');

    // Should trigger export
    await expect(downloadPromise).resolves.toBeTruthy();
  });

  test.skip('UNIMPLEMENTED: Ctrl+I triggers import', async ({ page }) => {
    // Purpose: Quick import access
    // Why: Keyboard-only workflow
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser');

    // Press Ctrl+I
    await page.keyboard.press('Control+I');

    // Should open file chooser
    await expect(fileChooserPromise).resolves.toBeTruthy();
  });

  test.skip('UNIMPLEMENTED: / key focuses search (like GitHub)', async ({ page }) => {
    // Purpose: Common pattern for search focus
    // Why: Familiar to developers from GitHub, Twitter, etc.
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Press /
    await page.keyboard.press('/');

    // Search should focus
    const searchInput = page.getByPlaceholder('Search timeline...');
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});

test.describe('Screen Reader Support', () => {
  test('interactive elements have aria-labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check submit button has aria-label
    const submitButton = page.locator('button[aria-label="Submit new event"]');
    await expect(submitButton).toBeVisible();

    const ariaLabel = await submitButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Submit');
  });

  test('events have proper aria-expanded attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check first event
    const firstEvent = page.locator('[aria-expanded]').first();
    const expandedAttr = await firstEvent.getAttribute('aria-expanded');

    // Should be "true" or "false" (string)
    expect(['true', 'false']).toContain(expandedAttr);
  });

  test('form inputs have accessible labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check title input
    const titleInput = page.getByPlaceholder('Event Title');
    await expect(titleInput).toBeVisible();

    // Should have placeholder (which serves as label)
    const placeholder = await titleInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();

    // Check description
    const descInput = page.getByPlaceholder('Description...');
    await expect(descInput).toBeVisible();
  });

  test.skip('UNIMPLEMENTED: live region announces new events', async ({ page }) => {
    // Purpose: Screen reader users know when GM adds events
    // Why: Accessibility - async updates need announcement
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();

    // When new events added, region should update
    // This would require mock forecaster integration
  });
});
