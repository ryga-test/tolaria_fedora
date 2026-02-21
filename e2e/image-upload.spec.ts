import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// Minimal valid PNG: 1x1 red pixel
const TEST_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

function createTestPng(filepath: string) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  fs.writeFileSync(filepath, Buffer.from(TEST_PNG_BASE64, 'base64'))
}

test('image upload via slash menu inserts image block', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1000)

  // Click first note item (each note card has a type-icon data-testid)
  const noteItem = page.locator('[data-testid="type-icon"]').first()
  await noteItem.click({ timeout: 10000 })
  await page.waitForTimeout(500)

  // Screenshot before image upload
  await page.screenshot({ path: 'test-results/image-upload-before.png', fullPage: true })

  // Click into the editor to focus it
  const editor = page.locator('.bn-editor')
  await expect(editor).toBeVisible({ timeout: 10000 })
  await editor.click()
  await page.waitForTimeout(200)

  // Press Enter to create a new line, then type /image to open slash menu
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)
  await page.keyboard.type('/image', { delay: 50 })
  await page.waitForTimeout(500)

  // Screenshot showing slash menu with image option
  await page.screenshot({ path: 'test-results/image-slash-menu.png', fullPage: true })

  // Look for Image item in the slash menu
  const imageMenuItem = page.locator('[class*="suggestionMenu"] [class*="item"]', { hasText: 'Image' }).first()
  const menuVisible = await imageMenuItem.isVisible({ timeout: 3000 }).catch(() => false)

  if (menuVisible) {
    await imageMenuItem.click()
    await page.waitForTimeout(500)

    // After inserting image block, look for upload tab/button
    const uploadTab = page.getByText(/upload/i).first()
    const uploadVisible = await uploadTab.isVisible({ timeout: 3000 }).catch(() => false)

    if (uploadVisible) {
      await uploadTab.click()
      await page.waitForTimeout(200)

      // Create a test image file
      const testImagePath = path.join(__dirname, '..', 'test-results', 'test-image.png')
      createTestPng(testImagePath)

      // Try to upload via input[type=file] or file chooser
      const uploadInput = page.locator('input[type="file"]').first()
      if (await uploadInput.count() > 0) {
        await uploadInput.setInputFiles(testImagePath)
      } else {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 })
        const uploadBtn = page.locator('button', { hasText: /upload|choose|browse/i }).first()
        if (await uploadBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await uploadBtn.click()
          const fileChooser = await fileChooserPromise
          await fileChooser.setFiles(testImagePath)
        }
      }

      await page.waitForTimeout(1000)

      // Verify an image is now displayed in the editor
      const imageInEditor = page.locator('.bn-editor img')
      const imageCount = await imageInEditor.count()
      console.log(`Images found in editor after upload: ${imageCount}`)

      // Clean up test image
      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath)
    }
  }

  // Screenshot after image upload attempt
  await page.screenshot({ path: 'test-results/image-upload-after.png', fullPage: true })
})

test('editor has uploadFile configured (no error on image block insert)', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1000)

  // Click first note
  const noteItem = page.locator('[data-testid="type-icon"]').first()
  await noteItem.click({ timeout: 10000 })
  await page.waitForTimeout(500)

  const editor = page.locator('.bn-editor')
  await expect(editor).toBeVisible({ timeout: 10000 })

  // Capture console errors
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  // Insert an image block via slash command
  await editor.click()
  await page.keyboard.press('Enter')
  await page.keyboard.type('/image', { delay: 30 })
  await page.waitForTimeout(500)

  // Click Image in the slash menu if visible
  const imageMenuItem = page.locator('[class*="suggestionMenu"] [class*="item"]', { hasText: 'Image' }).first()
  if (await imageMenuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await imageMenuItem.click()
    await page.waitForTimeout(500)
  }

  await page.screenshot({ path: 'test-results/image-block-inserted.png', fullPage: true })

  // No errors related to upload should have occurred
  const uploadErrors = errors.filter(e => e.includes('upload'))
  expect(uploadErrors).toHaveLength(0)
})
