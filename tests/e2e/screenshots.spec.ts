import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test } from '@playwright/test'

test.describe('Platform Screenshots', () => {
  test('capture storefront and merchant screens', async ({ page }) => {
    // 1. Storefront home
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/opt/cursor/artifacts/01-storefront-home.png', fullPage: true })

    // 2. Product page (navigate to first product if available)
    await page.goto('http://shopmagaza.localhost:43210')
    const productLinks = await page.locator('a[href*="/product/"]').count()
    if (productLinks > 0) {
      const href = await page.locator('a[href*="/product/"]').first().getAttribute('href')
      await page.goto(`http://shopmagaza.localhost:43210${href}`)
      await page.waitForTimeout(1000)
      await page.screenshot({ path: '/opt/cursor/artifacts/02-product-page.png', fullPage: true })
    }

    // 3. Checkout
    await page.goto('http://shopmagaza.localhost:43210/checkout')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '/opt/cursor/artifacts/03-checkout.png', fullPage: true })

    // Login as merchant
    await page.goto('http://localhost:43210/login')
    await page.fill('[type="email"]', 'ahmet@shopmagaza.com')
    await page.fill('[type="password"]', 'merchant123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // 4. Merchant dashboard
    await page.goto('http://shopmagaza.localhost:43210/admin')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '/opt/cursor/artifacts/04-merchant-dashboard.png', fullPage: true })

    // 5. Order detail
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    const orderLinks = await page.locator('a:has-text("Detay")').count()
    if (orderLinks > 0) {
      await page.locator('a:has-text("Detay")').first().click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: '/opt/cursor/artifacts/05-order-detail.png', fullPage: true })
    }

    // 6. Returns list
    await page.goto('http://shopmagaza.localhost:43210/admin/returns')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '/opt/cursor/artifacts/06-returns-list.png', fullPage: true })
  })

  test('capture super admin screens', async ({ page }) => {
    // Login as super admin
    await page.goto('http://localhost:43210/login')
    await page.fill('[type="email"]', 'admin@posa360.com')
    await page.fill('[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // 7. Super admin tenant list
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '/opt/cursor/artifacts/07-super-admin-tenants.png', fullPage: true })

    // 8 & 9. Tenant detail and domain binding
    const tenantLinks = await page.locator('a[href*="/super-admin/tenants/"]').count()
    if (tenantLinks > 0) {
      await page.locator('a[href*="/super-admin/tenants/"]').first().click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: '/opt/cursor/artifacts/08-tenant-detail.png', fullPage: true })
      
      // Scroll to domain section
      const domainSection = page.locator('text=Domain')
      if (await domainSection.count() > 0) {
        await domainSection.first().scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        await page.screenshot({ path: '/opt/cursor/artifacts/09-domain-binding.png' })
      }
    }
  })
})
