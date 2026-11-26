import { Page } from '@playwright/test'

export async function loginAsMerchant(page: Page) {
  await page.goto('http://localhost:43210/api/auth/signin')
  await page.waitForLoadState('networkidle')
  
  // Fill the form
  await page.fill('input[name="email"], input[type="email"]', 'ahmet@shopmagaza.com')
  await page.fill('input[name="password"], input[type="password"]', 'merchant123')
  
  // Submit
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}

export async function loginAsCustomer(page: Page) {
  await page.goto('http://localhost:43210/api/auth/signin')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[name="email"], input[type="email"]', 'musteri@example.com')
  await page.fill('input[name="password"], input[type="password"]', 'customer123')
  
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}

export async function loginAsSuperAdmin(page: Page) {
  await page.goto('http://localhost:43210/api/auth/signin')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[name="email"], input[type="email"]', 'admin@posa360.com')
  await page.fill('input[name="password"], input[type="password"]', 'admin123')
  
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}
