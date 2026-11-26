import { test, expect } from '@playwright/test'
import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'

/**
 * Custom domain + admin.<customdomain> host resolution.
 * Seed: Elektronik Dünyası → customDomain shopcem.local (verified).
 */
test.describe('Custom domain host resolution', () => {
  test('storefront on custom domain shows tenant without redirect', async ({ page }) => {
    setupErrorListeners(page)
    const res = await page.goto('http://shopcem.local:43210/', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBeLessThan(400)
    // No host redirect off the custom domain
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

    // Stay on admin.shopcem.local — rewrite to /admin then maybe /login, no host redirect
    expect(page.url()).toMatch(/^http:\/\/admin\.shopcem\.local:43210\//)
    expect(page.url()).toMatch(/\/(admin|login)/)

    await checkForErrors(page, 'admin custom domain')
  })

  test('admin.customdomain/admin stays on tenant host', async ({ page }) => {
    await page.goto('http://admin.shopcem.local:43210/admin', { waitUntil: 'networkidle' })
    expect(page.url()).toContain('admin.shopcem.local')
    // Unauthenticated → /login on same host
    expect(page.url()).toMatch(/admin\.shopcem\.local/)
  })

  test('domain-check returns 200 for verified domain and admin variant', async ({ request }) => {
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

    const appSub = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=app.posa360.com'
    )
    expect(appSub.status()).toBe(200)

    // Apex / www are marketing — TLS allowed
    const apex = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=posa360.com'
    )
    expect(apex.status()).toBe(200)

    const www = await request.get(
      'http://localhost:43210/api/internal/domain-check?domain=www.posa360.com'
    )
    expect(www.status()).toBe(200)

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

  test('app hub kayit page loads on localhost (app.posa360.com/kayit)', async ({ page }) => {
    await page.goto('http://localhost:43210/kayit', { waitUntil: 'domcontentloaded' })
    await checkForErrors(page, 'kayit page')
    const body = await page.textContent('body')
    expect(body).toMatch(/Mağaza Kaydı|Kayıt Ol/)
    expect(page.url()).toContain('/kayit')
  })
})
