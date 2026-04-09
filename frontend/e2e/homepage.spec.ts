import { expect, test } from '@playwright/test'

test('homepage renders dashboard shell and map container', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'EnviroMonitor' })).toBeVisible()
  await expect(page.getByTestId('map-container')).toBeVisible()
})
