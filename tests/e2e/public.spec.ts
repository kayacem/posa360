import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
import { test, expect } from '@playwright/test'

test.describe('Public Flows', () => {
  test('customer can browse storefront', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Shop Mağaza')
  })
  
  test('custom domain resolves correctly', async ({ page }) => {
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(1000)
    
    const bodyText = await page.textContent('body')
    const hasContent = bodyText?.includes('Elektronik') || bodyText?.includes('shopcem')
    expect(hasContent).toBeTruthy()
  })
  
  test('tenants show different content', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210')
    await page.waitForTimeout(500)
    const html1 = await page.content()
    
    await page.goto('http://shopcem.local:43210')
    await page.waitForTimeout(500)
    const html2 = await page.content()
    
    expect(html1).not.toEqual(html2)
  })
})
