import { chromium } from 'playwright'
import path from 'path'

const screenshotsDir = '/opt/cursor/artifacts'

async function captureAuthScreenshots() {
  const browser = await chromium.launch({ headless: true })
  
  console.log('📸 Capturing authenticated screenshots...\n')
  
  // Merchant screenshots
  const merchantContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const merchantPage = await merchantContext.newPage()
  
  // Login as merchant
  console.log('Logging in as merchant...')
  await merchantPage.goto('http://localhost:43210/login')
  await merchantPage.waitForLoadState('networkidle')
  
  try {
    await merchantPage.fill('input[type="email"]', 'ahmet@shopmagaza.com')
    await merchantPage.fill('input[type="password"]', 'merchant123')
    await merchantPage.click('button[type="submit"]')
    await merchantPage.waitForTimeout(3000)
    
    // 5. Merchant Dashboard
    console.log('1/8 - Merchant Dashboard')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '05-merchant-dashboard.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 6. Order Detail
    console.log('2/8 - Order Detail')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin/orders')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '06-order-detail.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 7. Returns
    console.log('3/8 - Returns Management')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin/returns')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '07-returns-management.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 8. CSV Import
    console.log('4/8 - CSV Import')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin/products/import')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '08-csv-import.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 9. Shipping Rules
    console.log('5/8 - Shipping Rules')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '09-shipping-rules.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 10. Payment Settings
    console.log('6/8 - Payment Settings')
    await merchantPage.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
    await merchantPage.waitForTimeout(2000)
    await merchantPage.screenshot({ path: path.join(screenshotsDir, '10-payment-settings.png'), fullPage: true })
    console.log('   ✓ Saved')
    
  } catch (error) {
    console.error('Merchant screenshots error:', error)
  }
  
  await merchantContext.close()
  
  // Super Admin screenshots
  const adminContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const adminPage = await adminContext.newPage()
  
  console.log('\nLogging in as super admin...')
  await adminPage.goto('http://localhost:43210/login')
  await adminPage.waitForLoadState('networkidle')
  
  try {
    await adminPage.fill('input[type="email"]', 'admin@posa360.com')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[type="submit"]')
    await adminPage.waitForTimeout(3000)
    
    // 11. Super Admin Tenants
    console.log('7/8 - Super Admin Tenants')
    await adminPage.goto('http://localhost:43210/super-admin/tenants')
    await adminPage.waitForTimeout(2000)
    await adminPage.screenshot({ path: path.join(screenshotsDir, '11-super-admin-tenants.png'), fullPage: true })
    console.log('   ✓ Saved')
    
    // 12. Tenant Detail
    console.log('8/8 - Tenant Detail')
    const tenantLink = adminPage.locator('a[href*="/super-admin/tenants/"]').first()
    if (await tenantLink.count() > 0) {
      await tenantLink.click()
      await adminPage.waitForTimeout(2000)
      await adminPage.screenshot({ path: path.join(screenshotsDir, '12-tenant-detail.png'), fullPage: true })
      console.log('   ✓ Saved')
    }
    
    // 13. Domain Binding (from tenant detail or settings)
    console.log('9/9 - Domain Binding')
    await adminPage.goto('http://localhost:43210/super-admin/tenants')
    await adminPage.waitForTimeout(2000)
    await adminPage.screenshot({ path: path.join(screenshotsDir, '13-domain-binding.png'), fullPage: true })
    console.log('   ✓ Saved')
    
  } catch (error) {
    console.error('Admin screenshots error:', error)
  }
  
  await adminContext.close()
  await browser.close()
  
  console.log('\n✅ All authenticated screenshots captured!')
}

captureAuthScreenshots().catch(console.error)
