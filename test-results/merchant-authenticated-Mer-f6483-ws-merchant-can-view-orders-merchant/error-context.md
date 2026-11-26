# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merchant-authenticated.spec.ts >> Merchant Authenticated Flows >> merchant can view orders
- Location: tests/e2e/merchant-authenticated.spec.ts:9:3

# Error details

```
Error: Next.js error overlay detected in merchant orders: 
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
              - cell "#ORD-006" [ref=e35]
              - cell "Ayşe Kara musteri@example.com" [ref=e36]:
                - generic [ref=e37]:
                  - generic [ref=e38]: Ayşe Kara
                  - generic [ref=e39]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e40]
              - cell "CANCELLED" [ref=e41]
              - cell "₺215,76" [ref=e42]
              - cell [ref=e43]:
                - link "Detay" [ref=e44] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1jh002ejslz2cqiwwuw
            - row [ref=e45]:
              - cell "#ORD-005" [ref=e46]
              - cell "Ayşe Kara musteri@example.com" [ref=e47]:
                - generic [ref=e48]:
                  - generic [ref=e49]: Ayşe Kara
                  - generic [ref=e50]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e51]
              - cell "PREPARING" [ref=e52]
              - cell "₺455,76" [ref=e53]
              - cell [ref=e54]:
                - link "Detay" [ref=e55] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1jf002ajslzdlivpakv
            - row [ref=e56]:
              - cell "#ORD-004" [ref=e57]
              - cell "Ayşe Kara musteri@example.com" [ref=e58]:
                - generic [ref=e59]:
                  - generic [ref=e60]: Ayşe Kara
                  - generic [ref=e61]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e62]
              - cell "CONFIRMED" [ref=e63]
              - cell "₺395,64" [ref=e64]
              - cell [ref=e65]:
                - link "Detay" [ref=e66] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1je0026jslzjx0k2k4d
            - row [ref=e67]:
              - cell "#ORD-003" [ref=e68]
              - cell "Ayşe Kara musteri@example.com" [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: Ayşe Kara
                  - generic [ref=e72]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e73]
              - cell "DELIVERED" [ref=e74]
              - cell "₺215,76" [ref=e75]
              - cell [ref=e76]:
                - link "Detay" [ref=e77] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1ja0020jslzozmyzlq5
            - row [ref=e78]:
              - cell "#ORD-002" [ref=e79]
              - cell "Ayşe Kara musteri@example.com" [ref=e80]:
                - generic [ref=e81]:
                  - generic [ref=e82]: Ayşe Kara
                  - generic [ref=e83]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e84]
              - cell "SHIPPED" [ref=e85]
              - cell "₺839,76" [ref=e86]
              - cell [ref=e87]:
                - link "Detay" [ref=e88] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1j7001ujslzelto8qmh
            - row [ref=e89]:
              - cell "#ORD-001" [ref=e90]
              - cell "Ayşe Kara musteri@example.com" [ref=e91]:
                - generic [ref=e92]:
                  - generic [ref=e93]: Ayşe Kara
                  - generic [ref=e94]: musteri@example.com
              - cell "26 Kasım 2026" [ref=e95]
              - cell "PENDING" [ref=e96]
              - cell "₺394,68" [ref=e97]
              - cell [ref=e98]:
                - link "Detay" [ref=e99] [cursor=pointer]:
                  - /url: /admin/orders/cmwxav1j5001qjslzu5uppsew
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
  7  |     const portalText = await page.locator('nextjs-portal').textContent()
> 8  |     throw new Error(`Next.js error overlay detected in ${testName}: ${portalText?.substring(0, 200)}`)
     |           ^ Error: Next.js error overlay detected in merchant orders: 
  9  |   }
  10 | 
  11 |   // Check for Runtime Error text in body
  12 |   const bodyText = await page.textContent('body')
  13 |   if (bodyText?.includes('Runtime Error') || bodyText?.includes('Runtime TypeError')) {
  14 |     const errorText = bodyText.substring(bodyText.indexOf('Runtime'), bodyText.indexOf('Runtime') + 200)
  15 |     throw new Error(`Runtime error detected in ${testName}: ${errorText}`)
  16 |   }
  17 | 
  18 |   // Check for console errors (collected via page event listener)
  19 |   // This should be set up in beforeEach
  20 | }
  21 | 
  22 | export function setupErrorListeners(page: Page, testName: string) {
  23 |   const errors: string[] = []
  24 |   
  25 |   page.on('pageerror', (error) => {
  26 |     errors.push(`Page error: ${error.message}`)
  27 |   })
  28 |   
  29 |   page.on('console', (msg) => {
  30 |     if (msg.type() === 'error') {
  31 |       errors.push(`Console error: ${msg.text()}`)
  32 |     }
  33 |   })
  34 |   
  35 |   return {
  36 |     getErrors: () => errors,
  37 |     hasErrors: () => errors.length > 0,
  38 |   }
  39 | }
  40 | 
```