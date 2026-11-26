/** Platform host / reserved slug helpers (shared by middleware, APIs, signup). */

export const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:43210'

export const PLATFORM_HOST = PLATFORM_DOMAIN.split(':')[0].toLowerCase()

/** Hub for marketing + kayit + login + super-admin (NOT apex/www). */
export const HUB_SUBDOMAIN =
  (process.env.NEXT_PUBLIC_HUB_SUBDOMAIN || 'eticaret').toLowerCase()

/**
 * Subdomains that must never become store tenants.
 * Matches nginx exact blocks for other Posa products + platform reserved names.
 */
export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'eticaret',
  'admin',
  'app',
  'api',
  'mail',
  'randevu',
  'yonet',
  'ajans',
  'otel',
  'menu',
  'panel',
])

/** Extra names blocked at signup (paths / product words). */
export const RESERVED_SIGNUP_SLUGS = new Set([
  ...RESERVED_SUBDOMAINS,
  'static',
  'login',
  'kayit',
  'super-admin',
  'platform',
  'marketing',
  'cdn',
  'status',
  'health',
])

/**
 * DNS / production platform apex (posa360.com).
 * When local env uses localhost, domain-check still evaluates *.posa360.com names.
 */
export function dnsPlatformHost(): string {
  if (
    !PLATFORM_HOST ||
    PLATFORM_HOST === 'localhost' ||
    PLATFORM_HOST.startsWith('127.')
  ) {
    return 'posa360.com'
  }
  return PLATFORM_HOST
}

export function hubHost(platformHost = dnsPlatformHost()): string {
  if (platformHost === 'localhost' || platformHost.startsWith('127.')) {
    return platformHost
  }
  return `${HUB_SUBDOMAIN}.${platformHost}`
}

export function publicAppOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.NEXT_PUBLIC_MARKETING_URL) {
    return process.env.NEXT_PUBLIC_MARKETING_URL.replace(/\/$/, '')
  }
  const host = PLATFORM_HOST
  if (host === 'localhost' || host.startsWith('127.')) {
    return `http://${PLATFORM_DOMAIN}`
  }
  return `https://${hubHost(host)}`
}

export function publicMarketingOrigin(): string {
  if (process.env.NEXT_PUBLIC_MARKETING_URL) {
    return process.env.NEXT_PUBLIC_MARKETING_URL.replace(/\/$/, '')
  }
  return publicAppOrigin()
}

/** Extract store slug from {slug}.posa360.com or {slug}.localhost */
export function platformSubdomain(
  host: string,
  platformHost = PLATFORM_HOST
): string | null {
  const h = host.split(':')[0].toLowerCase()

  if (h.endsWith(`.${platformHost}`)) {
    const sub = h.slice(0, -(`.${platformHost}`.length))
    if (sub && !sub.includes('.')) return sub
  }

  // Local multi-tenant hosts: shopmagaza.localhost
  if (h.endsWith('.localhost')) {
    const sub = h.slice(0, -'.localhost'.length)
    if (sub && !sub.includes('.')) return sub
  }

  return null
}
