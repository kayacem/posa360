import { Page } from '@playwright/test'

/**
 * Detect real Next.js runtime errors via nextjs-portal shadow DOM.
 * `nextjs-portal` always exists in Next.js 15+/16+ in development —
 * only fail when it shows an error dialog or an issues badge with count > 0.
 */
export async function checkForErrors(page: Page, testName: string) {
  const portals = page.locator('nextjs-portal')
  const portalCount = await portals.count()

  for (let i = 0; i < portalCount; i++) {
    const portal = portals.nth(i)
    const diagnosis = await portal.evaluate((el: Element) => {
      const root = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot
      if (!root) {
        return { hasErrorDialog: false, issuesCount: 0, snippet: '' }
      }

      // Error overlay dialog (full-screen or toast-style)
      const dialog =
        root.querySelector('[data-nextjs-dialog]') ||
        root.querySelector('[data-nextjs-dialog-overlay]') ||
        root.querySelector('[data-nextjs-toast][data-severity]') ||
        root.querySelector('.nextjs-container-errors-wrapper')

      // Issues / errors badge in the Next.js Dev Tools button
      const badge =
        root.querySelector('[data-nextjs-dev-tools-button] [data-issues-count]') ||
        root.querySelector('[data-issues-count]') ||
        root.querySelector('[data-next-badge-count]')

      let issuesCount = 0
      if (badge) {
        const raw =
          badge.getAttribute('data-issues-count') ||
          badge.getAttribute('data-next-badge-count') ||
          badge.textContent ||
          '0'
        issuesCount = parseInt(String(raw).replace(/[^\d]/g, ''), 10) || 0
      }

      // Also treat visible "Runtime Error" / "Unhandled Runtime Error" text as a dialog
      const text = (root.textContent || '').trim()
      const hasRuntimeErrorText =
        /Unhandled Runtime Error|Runtime (Type)?Error|Application error/i.test(text) &&
        !text.startsWith(':host') &&
        !text.includes('Bootstrap Reboot')

      const hasErrorDialog = Boolean(dialog) || hasRuntimeErrorText

      let snippet = ''
      if (hasErrorDialog) {
        snippet = text.replace(/\s+/g, ' ').slice(0, 300)
      }

      return { hasErrorDialog, issuesCount, snippet }
    })

    if (diagnosis.hasErrorDialog || diagnosis.issuesCount > 0) {
      throw new Error(
        `Next.js error overlay detected in ${testName}` +
          (diagnosis.issuesCount > 0 ? ` (issues: ${diagnosis.issuesCount})` : '') +
          (diagnosis.snippet ? `: ${diagnosis.snippet}` : '')
      )
    }
  }

  // Fallback: visible Runtime Error text in the light DOM (not shadow)
  const bodyText = await page.textContent('body')
  if (bodyText?.includes('Runtime Error') || bodyText?.includes('Runtime TypeError')) {
    const idx = bodyText.indexOf('Runtime')
    const errorText = bodyText.substring(idx, idx + 200)
    throw new Error(`Runtime error detected in ${testName}: ${errorText}`)
  }
}

export function setupErrorListeners(page: Page, _testName?: string) {
  const errors: string[] = []

  page.on('pageerror', (error) => {
    errors.push(`Page error: ${error.message}`)
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // Ignore noisy Next.js/HMR and favicon noise
      const text = msg.text()
      if (
        text.includes('Download the React DevTools') ||
        text.includes('Fast Refresh') ||
        text.includes('favicon')
      ) {
        return
      }
      errors.push(`Console error: ${text}`)
    }
  })

  return {
    getErrors: () => errors,
    hasErrors: () => errors.length > 0,
  }
}
