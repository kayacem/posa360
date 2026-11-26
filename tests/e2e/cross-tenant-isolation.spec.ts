import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'

test.describe('Cross-Tenant Isolation', () => {
  test('tenant 1 merchant cannot see tenant 2 data', async ({ page }) => {
    await page.goto('http://localhost:43210/login')
    await page.fill('[type="email"]', 'ahmet@shopmagaza.com')
    await page.fill('[type="password"]', 'merchant123')
    await page.click('button[type="submit"]')
    
    await page.goto('http://shopmagaza.localhost:43210/admin/products')
    const tenant1ProductCount = await page.locator('[data-testid="product-row"]').count()
    expect(tenant1ProductCount).toBeGreaterThan(0)
    
    await page.goto('http://shopcem.local:43210/admin/products')
    await expect(page).toHaveURL(/\/login/)
  })

  test('customers cannot access other tenant storefronts data', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    const html1 = await page.content()
    expect(html1).toContain('Shop Mağaza')
    expect(html1).not.toContain('Elektronik Dünyası')
    
    await page.goto('http://shopcem.local:43210')
    const html2 = await page.content()
    expect(html2).toContain('Elektronik Dünyası')
    expect(html2).not.toContain('Shop Mağaza')
  })

  test('tenant-specific products are isolated', async ({ page, context }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    const tenant1ProductName = await page.locator('[data-testid="product-card"]:first-child h3').textContent()
    
    const page2 = await context.newPage()
    await page2.goto('http://shopcem.local:43210')
    const tenant2Products = await page2.locator('[data-testid="product-card"] h3').allTextContents()
    
    expect(tenant2Products).not.toContain(tenant1ProductName)
  })
})
