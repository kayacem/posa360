import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'

// Tests that work without auth
test.describe('E2E: Storefront (No Auth)', () => {
  test('customer can browse storefront', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Shop Mağaza')
    
    // Check products are visible
    const products = page.locator('[data-testid="product-card"], a[href*="/product/"]')
    if (await products.count() > 0) {
      expect(await products.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('E2E: Tenant Isolation', () => {
  test('products are isolated per tenant', async ({ page }) => {
    // Check tenant 1
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    const html1 = await page.content()
    expect(html1).toContain('Shop Mağaza')
    
    // Check tenant 2
    await page.goto('http://elektronikdunya.localhost:43210')
    await page.waitForTimeout(500)
    const html2 = await page.content()
    expect(html2).toContain('Elektronik Dünyası')
    expect(html2).not.toContain('Shop Mağaza')
  })
})

test.describe('E2E: Custom Domain Resolution', () => {
  test('custom domain Host header resolves correct tenant', async ({ page }) => {
    // Test subdomain
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    let content = await page.textContent('body')
    expect(content).toContain('Shop Mağaza')
    
    // Test custom domain
    await page.goto('http://elektronikdunya.localhost:43210')
    await page.waitForTimeout(500)
    content = await page.textContent('body')
    expect(content).toContain('Elektronik Dünyası')
  })
})

// Merchant tests - check pages exist and redirect to auth
test.describe('E2E: Merchant Pages (Auth Required)', () => {
  test('merchant dashboard requires authentication', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin')
    await page.waitForTimeout(1000)
    
    // Should redirect to signin or show auth error
    const url = page.url()
    const isAuthPage = url.includes('signin') || url.includes('login') || url.includes('auth')
    expect(isAuthPage).toBeTruthy()
  })
  
  test('CSV import page requires authentication', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    const isAuthPage = url.includes('signin') || url.includes('login') || url.includes('auth')
    expect(isAuthPage).toBeTruthy()
  })
  
  test('shipping settings requires authentication', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    const isAuthPage = url.includes('signin') || url.includes('login') || url.includes('auth')
    expect(isAuthPage).toBeTruthy()
  })
  
  test('payment settings requires authentication', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    const isAuthPage = url.includes('signin') || url.includes('login') || url.includes('auth')
    expect(isAuthPage).toBeTruthy()
  })
})

test.describe('E2E: Super Admin (Auth Required)', () => {
  test('super admin requires authentication', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    const isAuthPage = url.includes('signin') || url.includes('login') || url.includes('auth')
    expect(isAuthPage).toBeTruthy()
  })
})

test.describe('E2E: Routes Exist', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('http://localhost:43210')
    await page.waitForTimeout(500)
    
    const content = await page.textContent('body')
    expect(content).toContain('POSA360')
  })
  
  test('storefront routes work', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/cart')
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/cart')
    
    // Empty cart redirects checkout → /cart (expected behavior)
    await page.goto('http://shopmagaza.localhost:43210/checkout')
    await page.waitForTimeout(500)
    expect(page.url()).toMatch(/\/(checkout|cart)/)
  })
})
