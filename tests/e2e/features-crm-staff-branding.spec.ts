import { test, expect } from '@playwright/test'
import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'

test.describe('Super Admin CRM & Payments', () => {
  test.use({ storageState: './tests/.auth/admin.json' })

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'admin', 'Admin project only')
  })

  test('tenant detail shows CRM fields, payments and chart', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1000)
    await page.locator('a[href*="/super-admin/tenants/"]:not([href*="/new"])').first().click()
    await page.waitForTimeout(1500)

    await checkForErrors(page, 'tenant CRM detail')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    expect(body).toMatch(/Shop Mağaza Ticaret|Elektronik Dünyası Ltd/)
    expect(body).toMatch(/CRM Bilgileri|Aylık Ödeme Geçmişi/)
    expect(body).toMatch(/\d+ ay/)
  })

  test('tenant list shows months with us and contact info', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://localhost:43210/super-admin/tenants')
    await page.waitForTimeout(1000)
    await checkForErrors(page, 'tenant list CRM')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    expect(body).toContain('Ahmet Yılmaz')
    expect(body).toMatch(/ay/)
    expect(body).toMatch(/₺/)
  })
})

test.describe('Merchant charts, staff, branding', () => {
  test.use({ storageState: './tests/.auth/merchant.json' })

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'merchant', 'Merchant project only')
  })

  test('dashboard shows revenue charts', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://shopmagaza.localhost:43210/admin')
    await page.waitForTimeout(1500)
    await checkForErrors(page, 'merchant dashboard charts')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    expect(body).toContain('Son 30 Gün Günlük Ciro')
    expect(body).toContain('Duruma Göre Ciro')
  })

  test('staff page can list and add staff form', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://shopmagaza.localhost:43210/admin/staff')
    await page.waitForTimeout(1500)
    await checkForErrors(page, 'staff management')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    expect(body).toContain('Personel')
    expect(body).toMatch(/Zeynep Staff|staff@shopmagaza.com|Personel Ekle/)
  })

  test('branding editor loads on settings', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://shopmagaza.localhost:43210/admin/settings')
    await page.waitForTimeout(1500)
    await checkForErrors(page, 'branding editor')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    expect(body).toContain('Tema / Marka Editörü')
    expect(body).toContain('Banner URL')
  })

  test('order detail shows correct totals and address', async ({ page }) => {
    const errors = setupErrorListeners(page)
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await page.waitForTimeout(1000)
    await page.locator('a:has-text("Detay")').first().click()
    await page.waitForTimeout(1500)
    await checkForErrors(page, 'order detail totals')
    expect(errors.hasErrors()).toBe(false)

    const body = await page.textContent('body')
    // Address should show street + district/city, not bare comma
    expect(body).toMatch(/Kadıköy|Moda Cad/)
    expect(body).toContain('KDV')
    // Totals section present
    expect(body).toMatch(/Ara Toplam|Toplam/)
  })
})
