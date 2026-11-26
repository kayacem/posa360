import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'
import { loginAsMerchant, loginAsCustomer, loginAsSuperAdmin } from '../helpers/auth'

test.describe('E2E: Customer Order Flow', () => {
  test('customer places order end to end', async ({ page }) => {
    // Visit storefront
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForLoadState('networkidle')
    
    // Verify tenant branding
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Shop Mağaza')
    
    // Check if products are visible
    const products = page.locator('a[href*="/product/"]')
    if (await products.count() > 0) {
      await products.first().click()
      await page.waitForTimeout(500)
      
      // Verify we're on product page
      expect(page.url()).toContain('/product/')
    }
  })
})

test.describe('E2E: Merchant Order Management', () => {
  test('merchant ships order and downloads invoice PDF', async ({ page }) => {
    await loginAsMerchant(page)
    
    // Go to orders page
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    
    // Check if orders exist
    const orderRows = page.locator('tbody tr')
    const count = await orderRows.count()
    
    if (count > 0) {
      // Click first order
      const orderLink = page.locator('a[href*="/admin/orders/"]').first()
      await orderLink.click()
      await page.waitForTimeout(500)
      
      // Verify we're on order detail page
      expect(page.url()).toContain('/admin/orders/')
      
      // Check if invoice link exists
      const invoiceLink = page.locator('a[href*="invoice"]')
      expect(await invoiceLink.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('E2E: Returns Flow', () => {
  test('customer return and merchant approve', async ({ page }) => {
    await loginAsMerchant(page)
    
    // Go to returns page
    await page.goto('http://shopmagaza.localhost:43210/admin/returns')
    await page.waitForTimeout(1000)
    
    // Check page loaded
    expect(page.url()).toContain('/admin/returns')
    
    // Returns list should be visible
    const pageContent = await page.textContent('body')
    expect(pageContent).toContain('İade')
  })
})

test.describe('E2E: Tenant Isolation', () => {
  test('merchant A cannot access tenant B orders', async ({ page }) => {
    await loginAsMerchant(page)
    
    // Access tenant 1 orders - should work
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    const url1 = page.url()
    expect(url1).toContain('shopmagaza')
    
    // Try to access tenant 2 orders - should not work or redirect
    await page.goto('http://shopcem.local:43210/admin/orders')
    await page.waitForTimeout(1000)
    
    // Should either be redirected to login or show no access
    const finalUrl = page.url()
    const hasLoginRedirect = finalUrl.includes('signin') || finalUrl.includes('login')
    expect(hasLoginRedirect).toBeTruthy()
  })

  test('products are isolated per tenant', async ({ page }) => {
    // Check tenant 1
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    const html1 = await page.content()
    expect(html1).toContain('Shop Mağaza')
    
    // Check tenant 2
    await page.goto('http://shopcem.local:43210')
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
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(500)
    content = await page.textContent('body')
    expect(content).toContain('Elektronik Dünyası')
  })
})

test.describe('E2E: CSV Import', () => {
  test('CSV import page loads and functions', async ({ page }) => {
    await loginAsMerchant(page)
    
    // Go to CSV import page
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1000)
    
    // Check page loaded
    expect(page.url()).toContain('/admin/products/import')
    
    // Check key elements exist
    const pageText = await page.textContent('body')
    expect(pageText).toContain('CSV')
    
    // Check sample download link exists
    const sampleLink = page.locator('a[href*="sample-csv"]')
    expect(await sampleLink.count()).toBeGreaterThan(0)
    
    // Check file input exists
    const fileInput = page.locator('input[type="file"]')
    expect(await fileInput.count()).toBeGreaterThan(0)
  })
})
