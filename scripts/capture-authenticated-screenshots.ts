import { chromium } from 'playwright'
import path from 'path'

const ARTIFACTS_DIR = '/opt/cursor/artifacts'

async function captureScreenshot(page: any, url: string, name: string, filename: string) {
  console.log(`${name}...`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1500)
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
  })
  const merchantPage = await merchantContext.newPage()

  await merchantPage.goto('http://shopmagaza.localhost:43210/login')
  await merchantPage.waitForLoadState('networkidle')
  await merchantPage.fill('input[type="email"]', 'ahmet@shopmagaza.com')
  await merchantPage.fill('input[type="password"]', 'merchant123')
  await merchantPage.click('button[type="submit"]')
  await merchantPage.waitForURL(/\/admin/, { timeout: 15000 })
  await merchantPage.waitForLoadState('networkidle')

  console.log('Merchant authenticated, capturing screenshots...\n')

  await captureScreenshot(
    merchantPage,
    'http://shopmagaza.localhost:43210/admin',
    '05 - Merchant Dashboard',
    '05-merchant-dashboard.png'
  )

  await merchantPage.goto('http://shopmagaza.localhost:43210/admin/orders', {
    waitUntil: 'networkidle',
  })
  await merchantPage.waitForTimeout(1000)
  const orderLinks = await merchantPage.locator('a[href*="/admin/orders/"]').all()
  if (orderLinks.length > 0) {
    const href = await orderLinks[0].getAttribute('href')
    if (href) {
      await captureScreenshot(
        merchantPage,
        `http://shopmagaza.localhost:43210${href}`,
        '06 - Order Detail',
        '06-order-detail.png'
      )
    }
  }

  await captureScreenshot(
    merchantPage,
    'http://shopmagaza.localhost:43210/admin/returns',
    '07 - Returns Management',
    '07-returns-management.png'
  )

  await captureScreenshot(
    merchantPage,
    'http://shopmagaza.localhost:43210/admin/products/import',
    '08 - CSV Import',
    '08-csv-import.png'
  )

  await captureScreenshot(
    merchantPage,
    'http://shopmagaza.localhost:43210/admin/settings/shipping',
    '09 - Shipping Rules',
    '09-shipping-rules.png'
  )

  await captureScreenshot(
    merchantPage,
    'http://shopmagaza.localhost:43210/admin/settings/payment',
    '10 - Payment Settings',
    '10-payment-settings.png'
  )

  await merchantContext.close()

  // ===== SUPER ADMIN SCREENSHOTS =====
  console.log('\nLogging in as super admin...')
  const adminContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const adminPage = await adminContext.newPage()

  await adminPage.goto('http://localhost:43210/login')
  await adminPage.waitForLoadState('networkidle')
  await adminPage.fill('input[type="email"]', 'admin@posa360.com')
  await adminPage.fill('input[type="password"]', 'admin123')
  await adminPage.click('button[type="submit"]')
  await adminPage.waitForURL(/\/super-admin/, { timeout: 15000 })
  await adminPage.waitForLoadState('networkidle')

  console.log('Super admin authenticated, capturing screenshots...\n')

  await captureScreenshot(
    adminPage,
    'http://localhost:43210/super-admin/tenants',
    '11 - Super Admin Tenants',
    '11-super-admin-tenants.png'
  )

  await adminPage.goto('http://localhost:43210/super-admin/tenants', {
    waitUntil: 'networkidle',
  })
  await adminPage.waitForTimeout(1000)
  // Prefer a real tenant detail link (…/tenants/<id>), not /tenants/new
  const detailLink = adminPage
    .locator('a[href*="/super-admin/tenants/"]:not([href*="/new"])')
    .first()
  if ((await detailLink.count()) > 0) {
    const href = await detailLink.getAttribute('href')
    if (href) {
      await captureScreenshot(
        adminPage,
        `http://localhost:43210${href}`,
        '12 - Tenant Detail',
        '12-tenant-detail.png'
      )

      await adminPage.goto(`http://localhost:43210${href}`, { waitUntil: 'networkidle' })
      await adminPage.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('h2, h3, h4, label, strong, legend'))
          .find((h) => /Domain|Alan Adı|domain|Özel Domain/i.test(h.textContent || ''))
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
      await adminPage.waitForTimeout(1000)
      await adminPage.screenshot({
        path: path.join(ARTIFACTS_DIR, '13-domain-binding.png'),
        fullPage: false,
      })
      console.log('13 - Domain Binding')
      console.log('   ✓ Saved')
    }
  } else {
    console.warn('⚠ No tenant detail links found for screenshots 12/13')
  }

  await adminContext.close()
  await browser.close()

  console.log('\n✅ All authenticated screenshots captured!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
