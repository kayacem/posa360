import { test, expect } from '@playwright/test'
import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'

test.describe('Marketing site', () => {
  test('home page shows brand and CTA', async ({ page }) => {
    setupErrorListeners(page)
    await page.goto('http://localhost:43210/', { waitUntil: 'domcontentloaded' })
    await checkForErrors(page, 'marketing home')
    const body = await page.textContent('body')
    expect(body).toContain('POSA360')
    expect(body).toMatch(/Kendi alan adın|ücretsiz/i)
    expect(body).toContain('Paketleri incele')
  })

  test('paketler shows three plans and yearly toggle', async ({ page }) => {
    setupErrorListeners(page)
    await page.goto('http://localhost:43210/paketler', { waitUntil: 'domcontentloaded' })
    await checkForErrors(page, 'paketler')
    const body = await page.textContent('body')
    expect(body).toContain('Başlangıç')
    expect(body).toContain('Profesyonel')
    expect(body).toContain('Kurumsal')
    await page.getByRole('button', { name: /Yıllık/i }).click()
    expect(await page.textContent('body')).toMatch(/indirim|Yıllık/i)
  })

  test('iletisim form submits lead', async ({ page }) => {
    setupErrorListeners(page)
    await page.goto('http://localhost:43210/iletisim', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await page.getByLabel('Ad Soyad').fill('Test Lead')
    await page.getByLabel('E-posta').fill(`lead-${Date.now()}@example.com`)
    await page.getByLabel('Mesaj').fill('Merhaba, demo istiyorum.')
    await page.getByRole('button', { name: /Gönder/i }).click()
    await expect(page.getByText(/Mesajınız alındı/i)).toBeVisible({ timeout: 15000 })
  })

  test('legal pages load', async ({ page }) => {
    for (const path of ['/kvkk', '/gizlilik', '/mesafeli-satis']) {
      await page.goto(`http://localhost:43210${path}`, { waitUntil: 'domcontentloaded' })
      expect(await page.textContent('body')).toMatch(/POSA360|yer tutucu|KVKK|Gizlilik|Mesafeli/i)
    }
  })
})

test.describe('Signup with plan', () => {
  test('kayit accepts plan query and creates trial tenant', async ({ page }) => {
    setupErrorListeners(page)
    const slug = `demo${Date.now().toString(36).slice(-6)}`
    await page.goto(`http://localhost:43210/kayit?plan=profesyonel`, {
      waitUntil: 'domcontentloaded',
    })
    await page.waitForTimeout(500)
    expect(await page.textContent('body')).toMatch(/profesyonel/i)

    await page.locator('input').nth(0).fill(`Demo ${slug}`)
    await page.locator('input').nth(1).fill(slug)
    await page.locator('input[type="email"]').fill(`${slug}@example.com`)
    await page.locator('input[type="password"]').fill('demo12345')
    await page.getByRole('button', { name: /ücretsiz başla|Kayıt/i }).click()

    // Should land on tenant admin (or login)
    await page.waitForTimeout(4000)
    expect(page.url()).toMatch(new RegExp(`${slug}\\.localhost|\\/admin|\\/login`))
  })
})
