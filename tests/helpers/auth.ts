import { Page } from '@playwright/test'

export async function loginAsMerchant(page: Page) {
  await page.goto('http://shopmagaza.localhost:43210/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[type="email"]', 'ahmet@shopmagaza.com')
  await page.fill('input[type="password"]', 'merchant123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

export async function loginAsCustomer(page: Page) {
  await page.goto('http://shopmagaza.localhost:43210/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[type="email"]', 'musteri@example.com')
  await page.fill('input[type="password"]', 'customer123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}

export async function loginAsSuperAdmin(page: Page) {
  await page.goto('http://localhost:43210/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[type="email"]', 'admin@posa360.com')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/super-admin/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}
