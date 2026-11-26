# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merchant-authenticated.spec.ts >> Merchant Authenticated Flows >> merchant can view orders
- Location: tests/e2e/merchant-authenticated.spec.ts:9:3

# Error details

```
Error: Next.js error overlay detected in merchant orders: /*!
 * Bootstrap Reboot v4.4.1 (https://getbootstrap.com/)
 * Copyright 2011-2019 The Bootstrap Authors
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * Forked from Normalize.css, licensed MIT (https://github.com/necolas/normalize.
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
        - heading "Siparişler" [level=1] [ref=e21]
        - table [ref=e24]:
          - rowgroup [ref=e25]:
            - row [ref=e26]:
              - columnheader "Sipariş No" [ref=e27]
              - columnheader "Müşteri" [ref=e28]
              - columnheader "Tarih" [ref=e29]
              - columnheader "Durum" [ref=e30]
              - columnheader "Tutar" [ref=e31]
              - columnheader "İşlemler" [ref=e32]
          - rowgroup [ref=e33]:
            - row [ref=e34]:
              - cell "#ORD-T1-006" [ref=e35]
              - cell "Ayşe Yıldız musteri@example.com" [ref=e36]:
                - generic [ref=e37]:
                  - generic [ref=e38]: Ayşe Yıldız
                  - generic [ref=e39]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e40]
              - cell "CONFIRMED" [ref=e41]
              - cell "₺259,99" [ref=e42]
              - cell [ref=e43]:
                - link "Detay" [ref=e44] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9r001gjsql1f8bxewk
            - row [ref=e45]:
              - cell "#ORD-T1-005" [ref=e46]
              - cell "Ali Kaya ali@example.com" [ref=e47]:
                - generic [ref=e48]:
                  - generic [ref=e49]: Ali Kaya
                  - generic [ref=e50]: ali@example.com
              - cell "26 Kasım 2026" [ref=e51]
              - cell "CONFIRMED" [ref=e52]
              - cell "₺249,99" [ref=e53]
              - cell [ref=e54]:
                - link "Detay" [ref=e55] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9p001cjsqlf9z1mllt
            - row [ref=e56]:
              - cell "#ORD-T1-004" [ref=e57]
              - cell "Ayşe Yıldız musteri@example.com" [ref=e58]:
                - generic [ref=e59]:
                  - generic [ref=e60]: Ayşe Yıldız
                  - generic [ref=e61]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e62]
              - cell "CONFIRMED" [ref=e63]
              - cell "₺239,99" [ref=e64]
              - cell [ref=e65]:
                - link "Detay" [ref=e66] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9o0018jsqls6hpmg58
            - row [ref=e67]:
              - cell "#ORD-T1-003" [ref=e68]
              - cell "Ali Kaya ali@example.com" [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: Ali Kaya
                  - generic [ref=e72]: ali@example.com
              - cell "26 Kasım 2026" [ref=e73]
              - cell "PREPARING" [ref=e74]
              - cell "₺229,99" [ref=e75]
              - cell [ref=e76]:
                - link "Detay" [ref=e77] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9m0014jsqlrnw3ykyx
            - row [ref=e78]:
              - cell "#ORD-T1-002" [ref=e79]
              - cell "Ayşe Yıldız musteri@example.com" [ref=e80]:
                - generic [ref=e81]:
                  - generic [ref=e82]: Ayşe Yıldız
                  - generic [ref=e83]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e84]
              - cell "SHIPPED" [ref=e85]
              - cell "₺219,99" [ref=e86]
              - cell [ref=e87]:
                - link "Detay" [ref=e88] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9k0010jsqlxiqqnxg2
            - row [ref=e89]:
              - cell "#ORD-T1-001" [ref=e90]
              - cell "Ali Kaya ali@example.com" [ref=e91]:
                - generic [ref=e92]:
                  - generic [ref=e93]: Ali Kaya
                  - generic [ref=e94]: ali@example.com
              - cell "26 Kasım 2026" [ref=e95]
              - cell "DELIVERED" [ref=e96]
              - cell "₺209,99" [ref=e97]
              - cell [ref=e98]:
                - link "Detay" [ref=e99] [cursor=pointer]:
                  - /url: /admin/orders/cmwxcoe9h000wjsqllnioc016
  - button "Open Next.js Dev Tools" [ref=e105] [cursor=pointer]
  - alert [ref=e109]
```

# Test source

```ts
  1  | import { Page } from '@playwright/test'
  2  | 
  3  | export async function checkForErrors(page: Page, testName: string) {
  4  |   // Check for Next.js error overlay (nextjs-portal shadow DOM)
  5  |   const errorPortal = await page.locator('nextjs-portal').count()
  6  |   if (errorPortal > 0) {
  7  |     // Try to get meaningful error content from the shadow DOM
  8  |     const portalText = await page.locator('nextjs-portal').evaluateHandle((el: any) => {
  9  |       if (el.shadowRoot) {
  10 |         const text = el.shadowRoot.textContent || ''
  11 |         // Filter out CSS and return only meaningful error text
  12 |         return text.replace(/:host\s*{[^}]*}/g, '').trim()
  13 |       }
  14 |       return el.textContent || ''
  15 |     }).then(handle => handle.jsonValue())
  16 |     
  17 |     // Only fail if there's actual error content (not just empty overlay or CSS)
  18 |     if (portalText && portalText.length > 50) {
> 19 |       throw new Error(`Next.js error overlay detected in ${testName}: ${portalText.substring(0, 300)}`)
     |             ^ Error: Next.js error overlay detected in merchant orders: /*!
  20 |     }
  21 |   }
  22 | 
  23 |   // Check for Runtime Error text in body
  24 |   const bodyText = await page.textContent('body')
  25 |   if (bodyText?.includes('Runtime Error') || bodyText?.includes('Runtime TypeError')) {
  26 |     const errorText = bodyText.substring(bodyText.indexOf('Runtime'), bodyText.indexOf('Runtime') + 200)
  27 |     throw new Error(`Runtime error detected in ${testName}: ${errorText}`)
  28 |   }
  29 | 
  30 |   // Check for console errors (collected via page event listener)
  31 |   // This should be set up in beforeEach
  32 | }
  33 | 
  34 | export function setupErrorListeners(page: Page, testName: string) {
  35 |   const errors: string[] = []
  36 |   
  37 |   page.on('pageerror', (error) => {
  38 |     errors.push(`Page error: ${error.message}`)
  39 |   })
  40 |   
  41 |   page.on('console', (msg) => {
  42 |     if (msg.type() === 'error') {
  43 |       errors.push(`Console error: ${msg.text()}`)
  44 |     }
  45 |   })
  46 |   
  47 |   return {
  48 |     getErrors: () => errors,
  49 |     hasErrors: () => errors.length > 0,
  50 |   }
  51 | }
  52 | 
```