# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merchant-authenticated.spec.ts >> Merchant Authenticated Flows >> merchant marks order shipped and invoice PDF exists
- Location: tests/e2e/merchant-authenticated.spec.ts:28:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "Dashboard" [ref=e7] [cursor=pointer]:
            - /url: /admin
          - link "Ürünler" [ref=e8] [cursor=pointer]:
            - /url: /admin/products
          - link "Siparişler" [ref=e9] [cursor=pointer]:
            - /url: /admin/orders
          - link "İadeler" [ref=e10] [cursor=pointer]:
            - /url: /admin/returns
          - link "Kuponlar" [ref=e11] [cursor=pointer]:
            - /url: /admin/coupons
          - link "Müşteriler" [ref=e12] [cursor=pointer]:
            - /url: /admin/customers
          - link "Ayarlar" [ref=e13] [cursor=pointer]:
            - /url: /admin/settings
        - generic [ref=e14]:
          - generic [ref=e15]: Ahmet Yılmaz
          - button "Çıkış" [ref=e17]
    - main [ref=e18]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]:
            - 'heading "Sipariş #ORD-T1-004" [level=1] [ref=e23]'
            - paragraph [ref=e24]: 26 Kasım 2026
          - link "📄 Fatura İndir" [ref=e26] [cursor=pointer]:
            - /url: /api/orders/cmwxcoe9o0018jsqls6hpmg58/invoice-pdf
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]:
              - generic [ref=e31]:
                - generic [ref=e32]: Sipariş Durumu
                - generic [ref=e33]: CONFIRMED
              - generic [ref=e36]:
                - generic [ref=e37]: "Durumu Güncelle:"
                - generic [ref=e38]:
                  - button "Hazırlanıyor" [ref=e39]
                  - button "İptal Edildi" [ref=e40]
            - generic [ref=e41]:
              - generic [ref=e42]: Ürünler
              - generic [ref=e44]:
                - generic [ref=e46]:
                  - generic [ref=e47]:
                    - generic [ref=e48]: Premium T-Shirt
                    - generic [ref=e49]: "Varyant: Medium - Beyaz"
                    - generic [ref=e50]: 1 adet × ₺199,99
                  - generic [ref=e51]: ₺199,99
                - generic [ref=e52]:
                  - generic [ref=e53]:
                    - generic [ref=e54]: "Ara Toplam:"
                    - generic [ref=e55]: ₺239,99
                  - generic [ref=e56]:
                    - generic [ref=e57]: "Kargo:"
                    - generic [ref=e58]: ₺0,00
                  - generic [ref=e59]:
                    - generic [ref=e60]: "KDV (%20):"
                    - generic [ref=e61]: ₺0,00
                  - generic [ref=e62]:
                    - generic [ref=e63]: "Toplam:"
                    - generic [ref=e64]: ₺239,99
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: Müşteri Bilgileri
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: Ad Soyad
                  - generic [ref=e72]: Ayşe Yıldız
                - generic [ref=e73]:
                  - generic [ref=e74]: E-posta
                  - generic [ref=e75]: musteri@example.com
                - generic [ref=e76]:
                  - generic [ref=e77]: Telefon
                  - generic [ref=e78]: "5551234567"
            - generic [ref=e79]:
              - generic [ref=e80]: Teslimat Adresi
              - generic [ref=e83]:
                - generic [ref=e84]: ","
                - generic [ref=e85]: "34000"
                - generic [ref=e86]: Türkiye
            - generic [ref=e87]:
              - generic [ref=e88]: Fatura Adresi
              - generic [ref=e91]:
                - generic [ref=e92]: ","
                - generic [ref=e93]: "34000"
                - generic [ref=e94]: Türkiye
            - generic [ref=e95]: Ödeme Bilgileri
  - button "Open Next.js Dev Tools" [ref=e104] [cursor=pointer]
  - alert [ref=e108]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { checkForErrors, setupErrorListeners } from '../helpers/error-detection'
  3   | 
  4   | test.describe('Merchant Authenticated Flows', () => {
  5   |   test.beforeEach(async ({ }, testInfo) => {
  6   |     test.skip(testInfo.project.name !== 'merchant', 'Merchant tests only run on merchant project')
  7   |   })
  8   | 
  9   |   test('merchant can view orders', async ({ page }) => {
  10  |     const errorListener = setupErrorListeners(page, 'merchant orders')
  11  |     
  12  |     await page.goto('http://shopmagaza.localhost:43210/admin/orders')
  13  |     await page.waitForTimeout(1500)
  14  |     
  15  |     // Check for errors
  16  |     await checkForErrors(page, 'merchant orders')
  17  |     expect(errorListener.hasErrors()).toBe(false)
  18  |     
  19  |     // Should NOT be on login page
  20  |     expect(page.url()).not.toContain('login')
  21  |     expect(page.url()).toContain('/admin/orders')
  22  |     
  23  |     // Assert real data
  24  |     const bodyText = await page.textContent('body')
  25  |     expect(bodyText).toContain('ORD-')
  26  |   })
  27  |   
  28  |   test('merchant marks order shipped and invoice PDF exists', async ({ page }) => {
  29  |     await page.goto('http://shopmagaza.localhost:43210/admin/orders')
  30  |     await page.waitForTimeout(1500)
  31  |     
  32  |     const bodyText = await page.textContent('body')
  33  |     expect(bodyText).not.toContain('Runtime Error')
  34  |     
  35  |     // Find first order
  36  |     const orderLink = page.locator('a[href*="/admin/orders/"]').first()
  37  |     expect(await orderLink.count()).toBeGreaterThan(0)
  38  |     
  39  |     await orderLink.click()
  40  |     await page.waitForTimeout(1000)
  41  |     
  42  |     // Check no errors
  43  |     const detailText = await page.textContent('body')
  44  |     expect(detailText).not.toContain('Runtime Error')
  45  |     expect(detailText).toContain('ORD-')
  46  |     
  47  |     // Should be on order detail
  48  |     expect(page.url()).toContain('/admin/orders/')
  49  |     
  50  |     // Check invoice PDF link
  51  |     const invoiceLink = page.locator('a[href*="invoice"]')
  52  |     if (await invoiceLink.count() > 0) {
  53  |       const href = await invoiceLink.first().getAttribute('href')
  54  |       expect(href).toBeTruthy()
  55  |       
  56  |       // Fetch PDF and verify content-type
  57  |       const response = await page.request.get(href!)
> 58  |       expect(response.status()).toBe(200)
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  59  |       const contentType = response.headers()['content-type']
  60  |       expect(contentType).toContain('pdf')
  61  |     }
  62  |   })
  63  |   
  64  |   test('merchant cannot access tenant B orders', async ({ page }) => {
  65  |     // Merchant A trying to access tenant B
  66  |     await page.goto('http://shopcem.local:43210/admin/orders')
  67  |     await page.waitForTimeout(1500)
  68  |     
  69  |     const url = page.url()
  70  |     // Should be blocked (redirect to login or error)
  71  |     expect(url).toMatch(/login|403|404/)
  72  |   })
  73  |   
  74  |   test('CSV import page loads authenticated', async ({ page }) => {
  75  |     await page.goto('http://shopmagaza.localhost:43210/admin/products/import')
  76  |     await page.waitForTimeout(1500)
  77  |     
  78  |     const bodyText = await page.textContent('body')
  79  |     expect(bodyText).not.toContain('Runtime Error')
  80  |     
  81  |     expect(page.url()).toContain('/admin/products/import')
  82  |     expect(page.url()).not.toContain('login')
  83  |     
  84  |     expect(bodyText).toContain('CSV')
  85  |   })
  86  |   
  87  |   test('shipping settings page loads', async ({ page }) => {
  88  |     await page.goto('http://shopmagaza.localhost:43210/admin/settings/shipping')
  89  |     await page.waitForTimeout(1500)
  90  |     
  91  |     const bodyText = await page.textContent('body')
  92  |     expect(bodyText).not.toContain('Runtime Error')
  93  |     expect(bodyText).toContain('Kargo')
  94  |     
  95  |     expect(page.url()).toContain('/admin/settings/shipping')
  96  |     expect(page.url()).not.toContain('login')
  97  |   })
  98  |   
  99  |   test('payment settings page loads', async ({ page }) => {
  100 |     await page.goto('http://shopmagaza.localhost:43210/admin/settings/payment')
  101 |     await page.waitForTimeout(1500)
  102 |     
  103 |     const bodyText = await page.textContent('body')
  104 |     expect(bodyText).not.toContain('Runtime Error')
  105 |     expect(bodyText).toContain('Ödeme')
  106 |     
  107 |     expect(page.url()).toContain('/admin/settings/payment')
  108 |     expect(page.url()).not.toContain('login')
  109 |   })
  110 | })
  111 | 
```