import { test, expect } from '@playwright/test'

test.describe('Super Admin Authenticated Flows', () => {
  test('super admin can view tenants', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1500)
    
    expect(page.url()).not.toContain('login')
    expect(page.url()).toContain('/super-admin')
    
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Tenant')
  })
  
  test('super admin can view tenant details', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1500)
    
    // Look for tenant link
    const tenantLink = page.locator('a[href*="/super-admin/tenants/"]').first()
    if (await tenantLink.count() > 0) {
      await tenantLink.click()
      await page.waitForTimeout(1000)
      
      expect(page.url()).toContain('/super-admin/tenants/')
    }
  })
})
