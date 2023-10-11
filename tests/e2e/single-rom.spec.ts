import { expect, test } from '@playwright/test'

test('play a single ROM file', async ({ page }) => {
  await page.goto('/')

  const emulator = page.getByTestId('emulator')
  await expect(emulator).not.toBeAttached()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('select-a-rom').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles('tests/fixtures/roms/nes/240p Test Suite.nes')

  await page.waitForLoadState('networkidle')
  await expect(emulator).toBeVisible()
})