import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

async function globalSetup(config: FullConfig) {
  const storageDir = path.join(__dirname, '.auth')
  
  // Setup for merchant (must login at subdomain to get correct cookies)
  const merchantBrowser = await chromium.launch()
  const merchantContext = await merchantBrowser.newContext()
  const merchantPage = await merchantContext.newPage()
  
  console.log('🔐 Setting up merchant auth...')
  await merchantPage.goto('http://shopmagaza.localhost:43210/login')
  await merchantPage.waitForLoadState('networkidle')
  await merchantPage.fill('input[type="email"]', 'ahmet@shopmagaza.com')
  await merchantPage.fill('input[type="password"]', 'merchant123')
  await merchantPage.click('button[type="submit"]')
  await merchantPage.waitForURL(/\/admin/, { timeout: 10000 })
  await merchantPage.waitForLoadState('networkidle')
  
  // Save merchant state
  await merchantContext.storageState({ path: path.join(storageDir, 'merchant.json') })
  await merchantBrowser.close()
  console.log('✅ Merchant auth saved')
  
  // Setup for super admin
  const adminBrowser = await chromium.launch()
  const adminContext = await adminBrowser.newContext()
  const adminPage = await adminContext.newPage()
  
  console.log('🔐 Setting up admin auth...')
  await adminPage.goto('http://localhost:43210/login')
  await adminPage.waitForLoadState('networkidle')
  await adminPage.fill('input[type="email"]', 'admin@posa360.com')
  await adminPage.fill('input[type="password"]', 'admin123')
  await adminPage.click('button[type="submit"]')
  await adminPage.waitForURL(/\/super-admin/, { timeout: 10000 })
  await adminPage.waitForLoadState('networkidle')
  
  // Save admin state
  await adminContext.storageState({ path: path.join(storageDir, 'admin.json') })
  await adminBrowser.close()
  console.log('✅ Admin auth saved')
  
  // Setup for customer
  const customerBrowser = await chromium.launch()
  const customerContext = await customerBrowser.newContext()
  const customerPage = await customerContext.newPage()
  
  console.log('🔐 Setting up customer auth...')
  await customerPage.goto('http://localhost:43210/login')
  await customerPage.waitForLoadState('networkidle')
  await customerPage.fill('input[type="email"]', 'musteri@example.com')
  await customerPage.fill('input[type="password"]', 'customer123')
  await customerPage.click('button[type="submit"]')
  await customerPage.waitForTimeout(3000)
  
  // Save customer state
  await customerContext.storageState({ path: path.join(storageDir, 'customer.json') })
  await customerBrowser.close()
  console.log('✅ Customer auth saved')
  
  console.log('✅ Global auth setup complete')
}

export default globalSetup
