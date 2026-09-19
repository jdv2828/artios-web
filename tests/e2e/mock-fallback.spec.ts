import { test, expect, type Page } from '@playwright/test'

// The service selector on the public booking page. It only lists services
// fetched from the backend (or the in-memory fallback in development).
async function openServiceOptions(page: Page) {
  const trigger = page.locator('[role="combobox"]').filter({ hasText: 'Seleccioná un servicio' })
  await trigger.click()
  return page.getByRole('option')
}

// Simulate the backend being unreachable from the browser.
async function blockApi(page: Page) {
  await page.route(/\/api\//, (route) => route.abort())
}

test.describe('mock fallback behaviour', () => {
  test('production: does not show mock services when the API is down', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'development', 'production-only check')

    await blockApi(page)
    await page.goto('/')

    const options = await openServiceOptions(page)
    await expect(options).toHaveCount(0)
  })

  test('development: falls back to mock services when the API is down', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'production', 'development-only check')

    await blockApi(page)
    await page.goto('/')

    const options = await openServiceOptions(page)
    // The in-memory fallback lists the active mock services.
    await expect(options.filter({ hasText: 'Corte de cabello' })).toHaveCount(1)
    // Pedicura is inactive in the in-memory fallback.
    await expect(options.filter({ hasText: 'Pedicura' })).toHaveCount(0)
  })

  test('production: loads real services from the backend', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'development', 'requires a running backend')

    await page.goto('/')

    const options = await openServiceOptions(page)
    // Pedicura is active in the seeded database but not in the in-memory fallback.
    await expect(options.filter({ hasText: 'Pedicura' })).toHaveCount(1)
  })
})