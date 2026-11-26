import { test, expect } from '@playwright/test'

test.describe('Basic Platform Functionality', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('http://localhost:43210/super-admin/tenants')
    await expect(page.locator('body')).toContainText('Tenant')
  })

  test('login page works', async ({ page }) => {
    await page.goto('http://localhost:43210/login')
    await expect(page.locator('body')).toContainText('Giriş')
  })

  test('storefront loads', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await expect(page.locator('body')).toBeVisible()
  })
})
