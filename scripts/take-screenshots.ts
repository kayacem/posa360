import { chromium } from 'playwright'
import path from 'path'

const screenshotsDir = '/opt/cursor/artifacts'

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  
  const page = await context.newPage()
  
  console.log('📸 Taking screenshots...')
  
  // 1. Storefront Home
  console.log('1/12 - Storefront Home')
  await page.goto('http://shopmagaza.localhost:43210')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '01-storefront-home.png'), fullPage: true })
  
  // 2. Product Page
  console.log('2/12 - Product Page')
  const productLink = page.locator('a[href*="/product/"]').first()
  if (await productLink.count() > 0) {
    await productLink.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(screenshotsDir, '02-product-detail.png'), fullPage: true })
  }
  
  // 3. Cart
  console.log('3/12 - Cart')
  await page.goto('http://shopmagaza.localhost:43210/cart')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '03-cart.png'), fullPage: true })
  
  // 4. Checkout
  console.log('4/12 - Checkout')
  await page.goto('http://shopmagaza.localhost:43210/checkout')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '04-checkout.png'), fullPage: true })
  
  // Login as merchant
  await page.goto('http://localhost:43210/api/auth/signin')
  await page.fill('[name="email"]', 'ahmet@shopmagaza.com')
  await page.fill('[name="password"]', 'merchant123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  
  // 5. Merchant Dashboard
  console.log('5/12 - Merchant Dashboard')
  await page.goto('http://shopmagaza.localhost:43210/admin')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '05-merchant-dashboard.png'), fullPage: true })
  
  // 6. Order Detail
  console.log('6/12 - Order Detail')
  await page.goto('http://shopmagaza.localhost:43210/admin/orders')
  await page.waitForTimeout(1000)
  const firstOrder = page.locator('a[href*="/admin/orders/"]').first()
  if (await firstOrder.count() > 0) {
    await firstOrder.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(screenshotsDir, '06-order-detail.png'), fullPage: true })
  }
  
  // 7. Returns
  console.log('7/12 - Returns')
  await page.goto('http://shopmagaza.localhost:43210/admin/returns')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '07-returns.png'), fullPage: true })
  
  // 8. CSV Import
  console.log('8/12 - CSV Import')
  await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '08-csv-import.png'), fullPage: true })
  
  // 9. Shipping Rules
  console.log('9/12 - Shipping Rules')
  await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '09-shipping-rules.png'), fullPage: true })
  
  // 10. Payment Settings
  console.log('10/12 - Payment Settings')
  await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '10-payment-settings.png'), fullPage: true })
  
  // Login as super admin
  await page.goto('http://localhost:43210/api/auth/signin')
  await page.fill('[name="email"]', 'admin@posa360.com')
  await page.fill('[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  
  // 11. Super Admin Tenants
  console.log('11/12 - Super Admin Tenants')
  await page.goto('http://localhost:43210/super-admin/tenants')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(screenshotsDir, '11-super-admin-tenants.png'), fullPage: true })
  
  // 12. Tenant Detail
  console.log('12/12 - Tenant Detail')
  const firstTenant = page.locator('a[href*="/super-admin/tenants/"]').first()
  if (await firstTenant.count() > 0) {
    await firstTenant.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(screenshotsDir, '12-tenant-detail.png'), fullPage: true })
  }
  
  await browser.close()
  
  console.log('✅ All screenshots captured!')
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`)
}

takeScreenshots().catch(console.error)
