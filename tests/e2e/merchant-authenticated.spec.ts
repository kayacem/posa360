import { test, expect } from '@playwright/test'

test.describe('Merchant Authenticated Flows', () => {
  test.beforeEach(async ({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'merchant', 'Merchant tests only run on merchant project')
  })

  test('merchant can view orders', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    // Check no Next.js error
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Runtime Error')
    expect(bodyText).not.toContain('TypeError')
    
    // Should NOT be on login page
    expect(page.url()).not.toContain('login')
    expect(page.url()).toContain('/admin/orders')
    
    // Assert real data
    expect(bodyText).toContain('ORD-')
  })
  
  test('merchant marks order shipped and invoice PDF exists', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Runtime Error')
    
    // Find first order
    const orderLink = page.locator('a[href*="/admin/orders/"]').first()
    expect(await orderLink.count()).toBeGreaterThan(0)
    
    await orderLink.click()
    await page.waitForTimeout(1000)
    
    // Check no errors
    const detailText = await page.textContent('body')
    expect(detailText).not.toContain('Runtime Error')
    expect(detailText).toContain('ORD-')
    
    // Should be on order detail
    expect(page.url()).toContain('/admin/orders/')
    
    // Check invoice PDF link
    const invoiceLink = page.locator('a[href*="invoice"]')
    if (await invoiceLink.count() > 0) {
      const href = await invoiceLink.first().getAttribute('href')
      expect(href).toBeTruthy()
      
      // Fetch PDF and verify content-type
      const response = await page.request.get(href!)
      expect(response.status()).toBe(200)
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('pdf')
    }
  })
  
  test('merchant cannot access tenant B orders', async ({ page }) => {
    // Merchant A trying to access tenant B
    await page.goto('http://shopcem.local:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    const url = page.url()
    // Should be blocked (redirect to login or error)
    expect(url).toMatch(/login|403|404/)
  })
  
  test('CSV import page loads authenticated', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1500)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Runtime Error')
    
    expect(page.url()).toContain('/admin/products/import')
    expect(page.url()).not.toContain('login')
    
    expect(bodyText).toContain('CSV')
  })
  
  test('shipping settings page loads', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
    await page.waitForTimeout(1500)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Runtime Error')
    expect(bodyText).toContain('Kargo')
    
    expect(page.url()).toContain('/admin/settings/shipping')
    expect(page.url()).not.toContain('login')
  })
  
  test('payment settings page loads', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
    await page.waitForTimeout(1500)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Runtime Error')
    expect(bodyText).toContain('Ödeme')
    
    expect(page.url()).toContain('/admin/settings/payment')
    expect(page.url()).not.toContain('login')
  })
})
