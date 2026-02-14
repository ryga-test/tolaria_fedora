import { test, expect } from '@playwright/test'

test('app loads with four-panel layout', async ({ page }) => {
  await page.goto('/')

  // Verify the four panels are present
  await expect(page.locator('.sidebar')).toBeVisible()
  await expect(page.locator('.note-list')).toBeVisible()
  await expect(page.locator('.editor')).toBeVisible()
  await expect(page.locator('.inspector')).toBeVisible()
})

test('sidebar shows section groups', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(500) // Wait for mock data

  await expect(page.getByRole('heading', { name: 'Laputa' })).toBeVisible()
  await expect(page.getByText('PROJECTS')).toBeVisible()
  await expect(page.getByText('EXPERIMENTS')).toBeVisible()
  await expect(page.getByText('RESPONSIBILITIES')).toBeVisible()
  await expect(page.getByText('PROCEDURES')).toBeVisible()
})
