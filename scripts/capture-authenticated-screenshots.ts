import { chromium } from 'playwright'
import path from 'path'

const ARTIFACTS_DIR = '/opt/cursor/artifacts'

async function captureScreenshot(page: any, url: string, name: string, filename: string) {
  console.log(`${name}...`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, filename), fullPage: true })
  console.log('   ✓ Saved')
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  
  console.log('📸 Capturing authenticated screenshots...\n')

  // ===== MERCHANT SCREENSHOTS =====
  console.log('Logging in as merchant...')
  const merchantContext = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 },
    baseURL: 'http://shopmagaza.localhost:43210'
  })
  const merchantPage = await merchantContext.newPage()
  
  // Login at subdomain
  await merchantPage.goto('http://shopmagaza.localhost:43210/login')
  await merchantPage.waitForLoadState('networkidle')
  await merchantPage.fill('input[type="email"]', 'ahmet@shopmagaza.com')
  await merchantPage.fill('input[type="password"]', 'merchant123')
  await merchantPage.click('button[type="submit"]')
  await merchantPage.waitForURL(/\/admin/, { timeout: 10000 })
  await merchantPage.waitForLoadState('networkidle')
  
  console.log('Merchant authenticated, capturing screenshots...\n')
  
  // 05 - Dashboard
  await captureScreenshot(merchantPage, 'http://shopmagaza.localhost:43210/admin', '05 - Merchant Dashboard', '05-merchant-dashboard.png')
  
  // 06 - Order Detail (find first order)
  await merchantPage.goto('http://shopmagaza.localhost:43210/admin/orders', { waitUntil: 'networkidle' })
  await merchantPage.waitForTimeout(1000)
  const orderLinks = await merchantPage.locator('a[href*="/admin/orders/"]').all()
  if (orderLinks.length > 0) {
    const href = await orderLinks[0].getAttribute('href')
    if (href) {
      await captureScreenshot(merchantPage, `http://shopmagaza.localhost:43210${href}`, '06 - Order Detail', '06-order-detail.png')
    }
  }
  
  // 07 - Returns
  await captureScreenshot(merchantPage, 'http://shopmagaza.localhost:43210/admin/returns', '07 - Returns Management', '07-returns-management.png')
  
  // 08 - CSV Import
  await captureScreenshot(merchantPage, 'http://shopmagaza.localhost:43210/admin/products/import', '08 - CSV Import', '08-csv-import.png')
  
  // 09 - Shipping Rules
  await captureScreenshot(merchantPage, 'http://shopmagaza.localhost:43210/admin/settings/shipping', '09 - Shipping Rules', '09-shipping-rules.png')
  
  // 10 - Payment Settings
  await captureScreenshot(merchantPage, 'http://shopmagaza.localhost:43210/admin/settings/payment', '10 - Payment Settings', '10-payment-settings.png')
  
  await merchantContext.close()

  // ===== SUPER ADMIN SCREENSHOTS =====
  console.log('\nLogging in as super admin...')
  const adminContext = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 }
  })
  const adminPage = await adminContext.newPage()
  
  // Login as super admin
  await adminPage.goto('http://localhost:43210/login')
  await adminPage.waitForLoadState('networkidle')
  await adminPage.fill('input[type="email"]', 'admin@posa360.com')
  await adminPage.fill('input[type="password"]', 'admin123')
  await adminPage.click('button[type="submit"]')
  await adminPage.waitForURL(/\/super-admin/, { timeout: 10000 })
  await adminPage.waitForLoadState('networkidle')
  
  console.log('Super admin authenticated, capturing screenshots...\n')
  
  // 11 - Super Admin Tenants
  await captureScreenshot(adminPage, 'http://localhost:43210/super-admin/tenants', '11 - Super Admin Tenants', '11-super-admin-tenants.png')
  
  // 12 - Tenant Detail (click first tenant)
  await adminPage.goto('http://localhost:43210/super-admin/tenants', { waitUntil: 'networkidle' })
  await adminPage.waitForTimeout(1000)
  const tenantLinks = await adminPage.locator('a[href*="/super-admin/tenants/cmwxav"]').all()
  if (tenantLinks.length > 0) {
    const href = await tenantLinks[0].getAttribute('href')
    if (href) {
      await captureScreenshot(adminPage, `http://localhost:43210${href}`, '12 - Tenant Detail', '12-tenant-detail.png')
      
      // 13 - Domain Binding (scroll to domain section)
      await adminPage.goto(`http://localhost:43210${href}`, { waitUntil: 'networkidle' })
      await adminPage.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('h2, h3'))
          .find(h => h.textContent?.includes('Domain') || h.textContent?.includes('Alan Adı'))
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
      await adminPage.waitForTimeout(1500)
      await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '13-domain-binding.png'), fullPage: false })
      console.log('13 - Domain Binding')
      console.log('   ✓ Saved')
    }
  }
  
  await adminContext.close()
  await browser.close()
  
  console.log('\n✅ All authenticated screenshots captured!')
}

main().catch(console.error)
