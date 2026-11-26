import { test, expect } from '@playwright/test'
import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'

/**
 * Custom domain + admin.<customdomain> host resolution.
 * Seed: Elektronik Dünyası → customDomain shopcem.local (verified).
 * Hub is eticaret.* (localhost in dev) — apex is NOT this app.
 */
test.describe('Custom domain host resolution', () => {
  test('storefront on custom domain shows tenant without redirect', async ({ page }) => {
    setupErrorListeners(page)
    const res = await page.goto('http://shopcem.local:43210/', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBeLessThan(400)
    expect(page.url()).toMatch(/^http:\/\/shopcem\.local:43210\/?/)

    await checkForErrors(page, 'custom domain storefront')

    const body = await page.textContent('body')
    expect(body).toContain('Elektronik Dünyası')
    expect(body).not.toContain('Shop Mağaza')
  })

  test('admin.customdomain routes to merchant admin (login or panel)', async ({ page }) => {
    setupErrorListeners(page)
    const res = await page.goto('http://admin.shopcem.local:43210/', {
      waitUntil: 'domcontentloaded',
    })
    expect(res?.status()).toBeLessThan(400)

    expect(page.url()).toMatch(/^http:\/\/admin\.shopcem\.local:43210\//)
    expect(page.url()).toMatch(/\/(admin|login)/)

    await checkForErrors(page, 'admin custom domain')
  })

  test('admin.customdomain/admin stays on tenant host', async ({ page }) => {
    await page.goto('http://admin.shopcem.local:43210/admin', { waitUntil: 'networkidle' })
    expect(page.url()).toContain('admin.shopcem.local')
    expect(page.url()).toMatch(/admin\.shopcem\.local/)
  })

  test('domain-check allows hub/store/custom; denies apex and reserved product subs', async ({
    request,
  }) => {
    const ok = await request.get('http://localhost:43210/api/internal/domain-check?domain=shopcem.local')
    expect(ok.status()).toBe(200)

    const admin = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=admin.shopcem.local'
    )
    expect(admin.status()).toBe(200)

    const storeSub = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=shopmagaza.posa360.com'
    )
    expect(storeSub.status()).toBe(200)

    const hub = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=eticaret.posa360.com'
    )
    expect(hub.status()).toBe(200)

    // Apex / www belong to the existing POSA hub — not this app
    const apex = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=posa360.com'
    )
    expect(apex.status()).toBe(404)

    const www = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=www.posa360.com'
    )
    expect(www.status()).toBe(404)

    // Other product subdomains are reserved
    const randevu = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=randevu.posa360.com'
    )
    expect(randevu.status()).toBe(404)

    const appSub = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=app.posa360.com'
    )
    expect(appSub.status()).toBe(404)

    const unknown = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=not-a-real-shop-xyz.com'
    )
    expect(unknown.status()).toBe(404)
  })

  test('platform subdomain storefront still works', async ({ page }) => {
    await page.goto('http://shopmagaza.localhost:43210/', { waitUntil: 'networkidle' })
    const body = await page.textContent('body')
    expect(body).toContain('Shop Mağaza')
  })

  test('hub kayit page loads on localhost (eticaret hub)', async ({ page }) => {
    await page.goto('http://localhost:43210/kayit', { waitUntil: 'domcontentloaded' })
    await checkForErrors(page, 'kayit page')
    const body = await page.textContent('body')
    expect(body).toMatch(/Mağaza Kaydı|Kayıt Ol/)
    expect(page.url()).toContain('/kayit')
  })

  test('hub /admin rewrites to super-admin area', async ({ page }) => {
    await page.goto('http://localhost:43210/admin', { waitUntil: 'domcontentloaded' })
    // Unauthenticated → login, or already session → super-admin
    expect(page.url()).toMatch(/\/(login|super-admin)/)
  })
})
