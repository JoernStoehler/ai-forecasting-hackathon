import { test, expect } from '@playwright/test'

test('homepage has title and welcome copy', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/frontend|AI Forecasting/i)
  await expect(page.getByText(/Starter scaffold is running/)).toBeVisible()
})

