import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

async function globalSetup(config: FullConfig) {
  const storageDir = path.join(__dirname, '.auth')
  
  // Setup for merchant (must login at subdomain to get correct cookies)
  const merchantBrowser = await chromium.launch()
  const merchantContext = await merchantBrowser.newContext()
  const merchantPage = await merchantContext.newPage()
  
  async function login(page: import('@playwright/test').Page, url: string, email: string, password: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 30000 })
    // Wait for client hydration so onSubmit is attached
    await page.waitForTimeout(800)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
  }

  console.log('🔐 Setting up merchant auth...')
  await login(merchantPage, 'http://shopmagaza.localhost:43210/login', 'ahmet@shopmagaza.com', 'merchant123')
  await merchantPage.waitForURL(/\/admin/, { timeout: 20000 })
  
  // Save merchant state
  await merchantContext.storageState({ path: path.join(storageDir, 'merchant.json') })
  await merchantBrowser.close()
  console.log('✅ Merchant auth saved')
  
  // Setup for super admin
  const adminBrowser = await chromium.launch()
  const adminContext = await adminBrowser.newContext()
  const adminPage = await adminContext.newPage()
  
  console.log('🔐 Setting up admin auth...')
  await login(adminPage, 'http://localhost:43210/login', 'admin@posa360.com', 'admin123')
  await adminPage.waitForURL(/\/super-admin/, { timeout: 20000 })
  
  // Save admin state
  await adminContext.storageState({ path: path.join(storageDir, 'admin.json') })
  await adminBrowser.close()
  console.log('✅ Admin auth saved')
  
  // Setup for customer
  const customerBrowser = await chromium.launch()
  const customerContext = await customerBrowser.newContext()
  const customerPage = await customerContext.newPage()
  
  console.log('🔐 Setting up customer auth...')
  await login(customerPage, 'http://localhost:43210/login', 'musteri@example.com', 'customer123')
  await customerPage.waitForTimeout(3000)
  
  // Save customer state
  await customerContext.storageState({ path: path.join(storageDir, 'customer.json') })
  await customerBrowser.close()
  console.log('✅ Customer auth saved')
  
  console.log('✅ Global auth setup complete')
}

export default globalSetup
