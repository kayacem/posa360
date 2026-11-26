import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'

test.describe('Cross-Tenant Isolation', () => {
  test('tenant 1 merchant cannot see tenant 2 data', async ({ page }) => {
    // If already authenticated via storageState, skip login; otherwise login
    await page.goto('http://shopmagaza.localhost:43210/admin/products')
    if (page.url().includes('login')) {
      await page.fill('[type="email"]', 'ahmet@shopmagaza.com')
      await page.fill('[type="password"]', 'merchant123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/admin/, { timeout: 15000 })
      await page.goto('http://shopmagaza.localhost:43210/admin/products')
    }

    await page.waitForTimeout(1000)
    const body = await page.textContent('body')
    expect(body).toMatch(/Premium T-Shirt|Klasik Jean|Ürün/)
    expect(body).not.toContain('Wireless Mouse')

    await page.goto('http://elektronikdunya.localhost:43210/admin/products')
    await page.waitForTimeout(1500)
    const url = page.url()
    const body2 = await page.textContent('body')
    // Merchant of tenant 1 should not see tenant 2 admin data
    expect(
      url.includes('login') ||
        (body2?.includes('Wireless Mouse') === false && body2?.includes('Premium T-Shirt') !== true)
    ).toBeTruthy()
  })

  test('customers cannot access other tenant storefronts data', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    const html1 = await page.content()
    expect(html1).toContain('Shop Mağaza')
    expect(html1).not.toContain('Elektronik Dünyası')

    await page.goto('http://elektronikdunya.localhost:43210')
    const html2 = await page.content()
    expect(html2).toContain('Elektronik Dünyası')
    expect(html2).not.toContain('Shop Mağaza')
  })

  test('tenant-specific products are isolated', async ({ page, context }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    const html1 = await page.content()
    expect(html1).toContain('Premium T-Shirt')
    expect(html1).not.toContain('Wireless Mouse')

    const page2 = await context.newPage()
    await page2.goto('http://elektronikdunya.localhost:43210')
    await page2.waitForTimeout(1000)
    const html2 = await page2.content()
    expect(html2).toContain('Wireless Mouse')
    expect(html2).not.toContain('Premium T-Shirt')
  })
})
