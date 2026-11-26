import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'

test.describe('Multi-Tenant Resolution', () => {
  test('should resolve tenant from subdomain', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await expect(page.locator('body')).toContainText('Shop Mağaza')
  })

  test('should resolve tenant from path', async ({ page }) => {
    await page.goto('http://localhost:43210/shopmagaza')
    await expect(page.locator('body')).toContainText('Shop Mağaza')
  })

  test('should resolve tenant from custom domain', async ({ page }) => {
    await page.goto('http://shopcem.local:43210')
    await expect(page.locator('body')).toContainText('Elektronik Dünyası')
  })

  test('should isolate tenant data', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    const tenant1Products = await page.locator('[data-testid="product-card"]').count()
    
    await page.goto('http://shopcem.local:43210')
    const tenant2Products = await page.locator('[data-testid="product-card"]').count()
    
    expect(tenant1Products).toBeGreaterThan(0)
    expect(tenant2Products).toBeGreaterThan(0)
    expect(tenant1Products).not.toBe(tenant2Products)
  })
})
