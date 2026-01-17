/**
 * XSS (Cross-Site Scripting) Prevention Tests
 *
 * Ensures user input and imported data with HTML/script tags cannot execute code.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('XSS Prevention', () => {
  test('HTML tags in imported events are escaped (not executed)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create events with various HTML/script injection attempts
    const maliciousEvents = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: '<script>alert("XSS")</script>Malicious Title',
        description: 'Normal description',
      },
      {
        type: 'news-published',
        date: '2025-01-11',
        icon: 'Landmark',
        title: 'Event with HTML',
        description: '<img src=x onerror="alert(\'XSS\')">Dangerous description',
      },
      {
        type: 'news-published',
        date: '2025-01-12',
        icon: 'BrainCircuit',
        title: '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        description: 'This should be escaped',
      },
    ];

    const testFilePath = path.join('/tmp', 'test-xss.json');
    fs.writeFileSync(testFilePath, JSON.stringify(maliciousEvents, null, 2));

    // Set up dialog handler (should only see import confirmation, not XSS alerts)
    let xssAlertShown = false;
    page.on('dialog', async dialog => {
      if (dialog.message().includes('XSS')) {
        xssAlertShown = true;
        await dialog.dismiss();
      } else {
        await dialog.accept();
      }
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Verify XSS did not execute
    expect(xssAlertShown).toBe(false);

    // Verify content is visible but escaped (script tags should be visible as text)
    const pageContent = await page.locator('main').textContent();
    expect(pageContent).toContain('<script>'); // Should be visible as text, not executed

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('HTML tags in form input are escaped (not executed)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up dialog handler to catch any XSS alerts
    let xssAlertShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().includes('XSS') || dialog.message().includes('alert')) {
        xssAlertShown = true;
        dialog.dismiss();
      }
    });

    // Try various XSS injection attempts
    const xssAttempts = [
      '<script>alert("XSS")</script>Attack',
      '<img src=x onerror="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      '<svg/onload=alert("XSS")>',
    ];

    for (const xssPayload of xssAttempts) {
      // Fill title with XSS attempt
      await page.getByPlaceholder('Event Title').fill(xssPayload);
      await page.getByPlaceholder('Description...').fill('Test description');

      // Wait a moment to see if any script executes
      await page.waitForTimeout(200);

      // Verify no XSS alert was shown
      expect(xssAlertShown).toBe(false);

      // Clear for next attempt
      await page.getByPlaceholder('Event Title').clear();
      await page.getByPlaceholder('Description...').clear();
    }
  });

  test('HTML entities in event text are properly escaped', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const eventsWithEntities = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: 'Test &lt;script&gt; Entity',
        description: '&amp; &quot; &apos; &lt; &gt;',
      },
      {
        type: 'news-published',
        date: '2025-01-11',
        icon: 'Landmark',
        title: 'Normal < Less Than > Greater',
        description: 'This & that',
      },
    ];

    const testFilePath = path.join('/tmp', 'test-entities.json');
    fs.writeFileSync(testFilePath, JSON.stringify(eventsWithEntities, null, 2));

    page.once('dialog', dialog => dialog.accept());

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Verify entities are displayed correctly (not double-escaped)
    const pageContent = await page.locator('main').textContent();

    // HTML entities should be rendered, not shown as &lt; etc
    // But HTML tags should not execute
    expect(pageContent).toContain('<');
    expect(pageContent).toContain('>');
    expect(pageContent).toContain('&');

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('JavaScript URLs are prevented', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const eventsWithJSUrls = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: 'Event with JS URL',
        description: 'Link: javascript:alert("XSS")',
      },
      {
        type: 'news-published',
        date: '2025-01-11',
        icon: 'Landmark',
        title: 'Data URL attack',
        description: 'Image: data:text/html,<script>alert("XSS")</script>',
      },
    ];

    const testFilePath = path.join('/tmp', 'test-js-urls.json');
    fs.writeFileSync(testFilePath, JSON.stringify(eventsWithJSUrls, null, 2));

    let xssAlertShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().includes('XSS')) {
        xssAlertShown = true;
        dialog.dismiss();
      } else {
        dialog.accept();
      }
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(500);

    // Verify no XSS executed
    expect(xssAlertShown).toBe(false);

    // Verify events are imported (titles should be visible)
    const pageContent = await page.locator('main').textContent();
    expect(pageContent).toContain('Event with JS URL');
    expect(pageContent).toContain('Data URL attack');

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('Event handlers in attributes are stripped', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const eventsWithEventHandlers = [
      {
        type: 'news-published',
        date: '2025-01-10',
        icon: 'Globe',
        title: '<div onclick="alert(\'XSS\')">Click me</div>',
        description: '<button onmouseover="alert(\'XSS\')">Hover</button>',
      },
      {
        type: 'news-published',
        date: '2025-01-11',
        icon: 'Landmark',
        title: '<img src=x onerror=alert("XSS")>',
        description: '<input onfocus="alert(\'XSS\')" autofocus>',
      },
    ];

    const testFilePath = path.join('/tmp', 'test-handlers.json');
    fs.writeFileSync(testFilePath, JSON.stringify(eventsWithEventHandlers, null, 2));

    let xssAlertShown = false;
    page.on('dialog', dialog => {
      if (dialog.message().includes('XSS')) {
        xssAlertShown = true;
        dialog.dismiss();
      } else {
        dialog.accept();
      }
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const importButton = page.locator('button[title="Import JSON"]');
    await importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    await page.waitForTimeout(1000);

    // Verify no XSS executed (even after potential mouse movements)
    expect(xssAlertShown).toBe(false);

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});
