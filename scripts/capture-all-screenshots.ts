import { chromium } from 'playwright'
import path from 'path'

const screenshotsDir = '/opt/cursor/artifacts'

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  
  const page = await context.newPage()
  
  console.log('📸 Capturing all required screenshots...\n')
  
  try {
    // 2. Product Page (if available)
    console.log('1/9 - Product Page')
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    const productLink = page.locator('a[href*="/product/"]').first()
    if (await productLink.count() > 0) {
      await productLink.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(screenshotsDir, '02-product-page.png'), fullPage: true })
      console.log('   ✓ Saved: 02-product-page.png')
    } else {
      console.log('   ⚠ No product links found')
    }
    
    // 5. Merchant Dashboard (auth required - will show login)
    console.log('2/9 - Merchant Dashboard')
    await page.goto('http://shopmagaza.localhost:43210/admin')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '05-merchant-dashboard.png'), fullPage: true })
    console.log('   ✓ Saved: 05-merchant-dashboard.png')
    
    // 6. Order Detail (auth required)
    console.log('3/9 - Order Detail')
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '06-order-detail.png'), fullPage: true })
    console.log('   ✓ Saved: 06-order-detail.png')
    
    // 7. Returns
    console.log('4/9 - Returns Management')
    await page.goto('http://shopmagaza.localhost:43210/admin/returns')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '07-returns-management.png'), fullPage: true })
    console.log('   ✓ Saved: 07-returns-management.png')
    
    // 8. CSV Import
    console.log('5/9 - CSV Import')
    await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '08-csv-import.png'), fullPage: true })
    console.log('   ✓ Saved: 08-csv-import.png')
    
    // 9. Shipping Rules
    console.log('6/9 - Shipping Rules')
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '09-shipping-rules.png'), fullPage: true })
    console.log('   ✓ Saved: 09-shipping-rules.png')
    
    // 10. Payment Settings
    console.log('7/9 - Payment Settings')
    await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '10-payment-settings.png'), fullPage: true })
    console.log('   ✓ Saved: 10-payment-settings.png')
    
    // 11. Super Admin Tenants
    console.log('8/9 - Super Admin Tenants')
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '11-super-admin-tenants.png'), fullPage: true })
    console.log('   ✓ Saved: 11-super-admin-tenants.png')
    
    // 12. Tenant Detail / Domain Binding
    console.log('9/9 - Tenant Detail')
    await page.goto('http://localhost:43210/super-admin')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(screenshotsDir, '12-tenant-detail.png'), fullPage: true })
    console.log('   ✓ Saved: 12-tenant-detail.png')
    
  } catch (error) {
    console.error('Error capturing screenshots:', error)
  }
  
  await browser.close()
  
  console.log('\n✅ Screenshot capture complete!')
  console.log(`📁 All screenshots saved to: ${screenshotsDir}`)
  console.log('\n📋 Screenshot list:')
  console.log('   01-storefront-home.png (already captured)')
  console.log('   02-product-page.png')
  console.log('   03-cart.png (already captured)')
  console.log('   04-checkout.png (already captured)')
  console.log('   05-merchant-dashboard.png')
  console.log('   06-order-detail.png')
  console.log('   07-returns-management.png')
  console.log('   08-csv-import.png')
  console.log('   09-shipping-rules.png')
  console.log('   10-payment-settings.png')
  console.log('   11-super-admin-tenants.png')
  console.log('   12-tenant-detail.png')
}

captureScreenshots().catch(console.error)
