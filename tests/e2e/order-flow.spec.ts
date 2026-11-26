import { test, expect } from '@playwright/test'

test.describe('Full Order Lifecycle', () => {
  test('complete order flow: browse → cart → checkout → payment → order', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    
    await page.click('[data-testid="product-card"]:first-child')
    await expect(page).toHaveURL(/\/product\//)
    
    await page.click('button:has-text("Sepete Ekle")')
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
    
    await page.goto('http://shopmagaza.localhost:43210/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    
    await page.click('button:has-text("Ödemeye Geç")')
    await expect(page).toHaveURL(/\/checkout/)
    
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="fullName"]', 'Test User')
    await page.fill('[name="phone"]', '5551234567')
    await page.fill('[name="line1"]', 'Test Address 123')
    await page.selectOption('[name="city"]', 'Istanbul')
    await page.fill('[name="district"]', 'Kadıköy')
    await page.fill('[name="postalCode"]', '34710')
    
    await page.click('button:has-text("Ödeme Yap")')
    
    await page.waitForURL(/\/checkout\/payment/)
    await page.waitForTimeout(4000)
    
    await expect(page).toHaveURL(/\/checkout\/success/)
    await expect(page.locator('body')).toContainText('Siparişiniz Alındı')
  })

  test('merchant order management: view → update status → ship', async ({ page }) => {
    await page.goto('http://localhost:43210/login')
    await page.fill('[type="email"]', 'ahmet@shopmagaza.com')
    await page.fill('[type="password"]', 'merchant123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL(/\/admin/)
    
    await page.goto('http://shopmagaza.localhost:43210/admin/orders')
    await expect(page.locator('[data-testid="order-row"]').first()).toBeVisible()
    
    await page.click('[data-testid="order-row"]:first-child a:has-text("Detay")')
    await expect(page).toHaveURL(/\/admin\/orders\//)
    
    await page.click('button:has-text("Onaylandı")')
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('CONFIRMED')
    
    await page.click('button:has-text("Kargoya Ver")')
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('SHIPPED')
    await expect(page.locator('body')).toContainText('TRK')
  })

  test('return and refund flow', async ({ page }) => {
    await page.goto('http://localhost:43210/login')
    await page.fill('[type="email"]', 'ahmet@shopmagaza.com')
    await page.fill('[type="password"]', 'merchant123')
    await page.click('button[type="submit"]')
    
    await page.goto('http://shopmagaza.localhost:43210/admin/returns')
    
    if (await page.locator('[data-testid="return-row"]').count() > 0) {
      await page.click('button:has-text("Onayla"):first-child')
      await page.waitForTimeout(1000)
      
      await page.click('button:has-text("Ürün Alındı")')
      await page.waitForTimeout(1000)
      
      await page.click('button:has-text("Para İadesi Yap")')
      await page.waitForTimeout(1000)
      
      await expect(page.locator('body')).toContainText('REFUNDED')
    }
  })
})
