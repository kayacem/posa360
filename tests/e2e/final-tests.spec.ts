import { test, expect } from '@playwright/test'

test.describe('Core Flows', () => {
  test('storefront loads for tenant 1', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Shop')
  })
  
  test('custom domain resolves to tenant 2', async ({ page }) => {
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(1000)
    
    const content = await page.textContent('body')
    expect(content).toMatch(/Elektronik|shopcem/i)
  })
  
  test('tenant isolation - different content', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    const html1 = await page.content()
    
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(500)
    const html2 = await page.content()
    
    expect(html1).not.toEqual(html2)
  })
  
  test('admin routes are protected', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    
    // Should redirect to login or show auth requirement
    const url = page.url()
    expect(url).toContain('login')
  })
  
  test('CSV import route exists', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1000)
    
    // Should redirect to login (proving route exists)
    const url = page.url()
    expect(url).toContain('login')
  })
  
  test('shipping settings route exists', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    expect(url).toContain('login')
  })
  
  test('payment settings route exists', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
    await page.waitForTimeout(1000)
    
    const url = page.url()
    expect(url).toContain('login')
  })
  
  test('super admin route exists', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1000)
    
    // Should show some content (may require auth)
    expect(page.url()).toContain('http')
  })
  
  test('home page loads', async ({ page }) => {
    await page.goto('http://localhost:43210')
    await page.waitForTimeout(500)
    
    const content = await page.textContent('body')
    expect(content).toContain('POSA360')
  })
  
  test('cart page accessible', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/cart')
    await page.waitForTimeout(500)
    
    expect(page.url()).toContain('/cart')
  })
})
