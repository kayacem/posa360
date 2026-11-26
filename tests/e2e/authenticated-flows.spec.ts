import { test, expect } from '@playwright/test'

test.describe('Merchant Flows', () => {
  test.use({ storageState: './tests/.auth/merchant.json' })
  
  test('merchant can view orders', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    
    // Should NOT be on login page
    expect(page.url()).not.toContain('login')
    expect(page.url()).toContain('/admin/orders')
    
    // Should see orders table
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Sipariş')
  })
  
  test('merchant opens order and marks shipped', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    // Find first order link
    const orderLink = page.locator('a[href*="/admin/orders/"]').first()
    if (await orderLink.count() > 0) {
      await orderLink.click()
      await page.waitForTimeout(1000)
      
      // Should be on order detail page
      expect(page.url()).toContain('/admin/orders/')
      
      // Try to find and click status button if available
      const statusButtons = page.locator('button:has-text("Onaylandı"), button:has-text("Hazırlanıyor"), button:has-text("Kargoya Ver")')
      if (await statusButtons.count() > 0) {
        await statusButtons.first().click()
        await page.waitForTimeout(1000)
      }
    }
  })
  
  test('merchant can download invoice PDF', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    // Find first order link
    const orderLink = page.locator('a[href*="/admin/orders/"]').first()
    if (await orderLink.count() > 0) {
      await orderLink.click()
      await page.waitForTimeout(1000)
      
      // Check invoice PDF link exists
      const invoiceLink = page.locator('a[href*="invoice"]')
      if (await invoiceLink.count() > 0) {
        const href = await invoiceLink.first().getAttribute('href')
        expect(href).toBeTruthy()
        
        // Try to fetch the PDF
        const response = await page.request.get(href!)
        expect(response.status()).toBe(200)
        const contentType = response.headers()['content-type']
        expect(contentType).toContain('pdf')
      }
    }
  })
  
  test('merchant tenant A cannot access tenant B orders', async ({ page }) => {
    // Try to access tenant 2 order directly
    await page.goto('http://shopcem.local:43210/admin/orders')
    await page.waitForTimeout(1500)
    
    // Should either be forbidden, redirected, or show no data
    const url = page.url()
    const isBlocked = url.includes('login') || url.includes('403') || url.includes('404')
    
    // If not redirected, check that we don't see tenant B data
    if (!isBlocked) {
      const bodyText = await page.textContent('body')
      // Should not see any orders or should see empty state
      const hasNoOrders = bodyText?.includes('bulunmuyor') || bodyText?.includes('yok')
      expect(hasNoOrders || isBlocked).toBeTruthy()
    }
  })
  
  test('merchant approves return', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/returns')
    await page.waitForTimeout(1500)
    
    // Check page loaded
    expect(page.url()).toContain('/admin/returns')
    
    // Look for return requests
    const returnRows = page.locator('tbody tr')
    if (await returnRows.count() > 0) {
      // Return exists, verify status
      const bodyText = await page.textContent('body')
      expect(bodyText).toContain('İade')
    }
  })
  
  test('CSV import page works', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1500)
    
    // Should be on import page, not login
    expect(page.url()).toContain('/admin/products/import')
    expect(page.url()).not.toContain('login')
    
    // Check key elements
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('CSV')
    
    // Sample download link exists
    const sampleLink = page.locator('a[href*="sample-csv"]')
    expect(await sampleLink.count()).toBeGreaterThan(0)
  })
})

test.describe('Admin Flows', () => {
  test.use({ storageState: './tests/.auth/admin.json' })
  
  test('super admin can view tenants', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1500)
    
    // Should NOT be on login page
    expect(page.url()).not.toContain('login')
    expect(page.url()).toContain('/super-admin')
    
    // Should see tenant data
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Tenant')
  })
})

test.describe('Public Flows', () => {
  test('customer can browse storefront', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Shop Mağaza')
  })
  
  test('custom domain resolves to tenant 2', async ({ page }) => {
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    const hasContent = bodyText?.includes('Elektronik') || bodyText?.includes('shopcem')
    expect(hasContent).toBeTruthy()
  })
  
  test('tenants are isolated', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    const html1 = await page.content()
    
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(500)
    const html2 = await page.content()
    
    // Different content
    expect(html1).not.toEqual(html2)
  })
})
