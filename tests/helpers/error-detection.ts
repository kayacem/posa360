import { Page } from '@playwright/test'

export async function checkForErrors(page: Page, testName: string) {
  // Check for Next.js error overlay (nextjs-portal shadow DOM)
  const errorPortal = await page.locator('nextjs-portal').count()
  if (errorPortal > 0) {
    const portalText = await page.locator('nextjs-portal').textContent()
    throw new Error(`Next.js error overlay detected in ${testName}: ${portalText?.substring(0, 200)}`)
  }

  // Check for Runtime Error text in body
  const bodyText = await page.textContent('body')
  if (bodyText?.includes('Runtime Error') || bodyText?.includes('Runtime TypeError')) {
    const errorText = bodyText.substring(bodyText.indexOf('Runtime'), bodyText.indexOf('Runtime') + 200)
    throw new Error(`Runtime error detected in ${testName}: ${errorText}`)
  }

  // Check for console errors (collected via page event listener)
  // This should be set up in beforeEach
}

export function setupErrorListeners(page: Page, testName: string) {
  const errors: string[] = []
  
  page.on('pageerror', (error) => {
    errors.push(`Page error: ${error.message}`)
  })
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`)
    }
  })
  
  return {
    getErrors: () => errors,
    hasErrors: () => errors.length > 0,
  }
}
