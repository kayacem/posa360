import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  PLATFORM_HOST,
  HUB_SUBDOMAIN,
  RESERVED_SUBDOMAINS,
  dnsPlatformHost,
  platformSubdomain,
} from '@/lib/platform'

function hostWithoutPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isLocalDevHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

/** Marketing + signup + login + super-admin hub (eticaret.* or localhost). */
function isHubHost(host: string): boolean {
  if (isLocalDevHost(host)) return true
  const dnsHost = dnsPlatformHost()
  return host === `${HUB_SUBDOMAIN}.${dnsHost}` || host === `${HUB_SUBDOMAIN}.${PLATFORM_HOST}`
}

/** Optional super-admin alias: panel.posa360.com */
function isPanelHost(host: string): boolean {
  const dnsHost = dnsPlatformHost()
  return host === `panel.${dnsHost}` || host === `panel.${PLATFORM_HOST}`
}

function stripWww(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : host
}

const MARKETING_PATHS = new Set([
  '/',
  '/paketler',
  '/iletisim',
  '/kvkk',
  '/gizlilik',
  '/mesafeli-satis',
])

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const host = hostWithoutPort(hostname)
  const dnsHost = dnsPlatformHost()

  const headers = new Headers(request.headers)
  headers.delete('x-tenant-id')
  headers.delete('x-tenant-slug')
  headers.delete('x-tenant-type')
  headers.delete('x-tenant-identifier')
  headers.delete('x-tenant-custom-domain')
  headers.delete('x-tenant-path-based')

  if (
    url.pathname.startsWith('/api/internal/') ||
    url.pathname === '/api/health'
  ) {
    return NextResponse.next({ request: { headers } })
  }

  // Apex / www belong to the existing POSA hub — never claim them.
  if (host === dnsHost || host === `www.${dnsHost}`) {
    return new NextResponse('Not found', { status: 404 })
  }

  // panel.posa360.com → super admin
  if (isPanelHost(host)) {
    headers.set('x-tenant-type', 'super-admin')
    if (url.pathname === '/' || url.pathname === '' || url.pathname === '/admin') {
      url.pathname = '/super-admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    if (url.pathname.startsWith('/admin')) {
      url.pathname = url.pathname.replace(/^\/admin/, '/super-admin')
      return NextResponse.rewrite(url, { request: { headers } })
    }
    return NextResponse.rewrite(url, { request: { headers } })
  }

  // 1. Hub: eticaret.posa360.com (+ localhost in dev)
  if (isHubHost(host)) {
    const path = url.pathname

    if (path === '/admin' || path.startsWith('/admin/')) {
      headers.set('x-tenant-type', 'super-admin')
      url.pathname = path === '/admin' ? '/super-admin' : path.replace(/^\/admin/, '/super-admin')
      return NextResponse.rewrite(url, { request: { headers } })
    }

    if (path.startsWith('/super-admin')) {
      headers.set('x-tenant-type', 'super-admin')
      return NextResponse.rewrite(url, { request: { headers } })
    }

    const isAppRoute =
      path.startsWith('/login') ||
      path.startsWith('/kayit') ||
      path.startsWith('/platform') ||
      path.startsWith('/api') ||
      path.startsWith('/marketing')

    if (!isAppRoute && (MARKETING_PATHS.has(path) || path === '/')) {
      headers.set('x-tenant-type', 'marketing')
      url.pathname = path === '/' ? '/marketing' : `/marketing${path}`
      return NextResponse.rewrite(url, { request: { headers } })
    }

    if (path.startsWith('/marketing')) {
      headers.set('x-tenant-type', 'marketing')
      return NextResponse.rewrite(url, { request: { headers } })
    }

    headers.set('x-tenant-type', 'platform-app')
    return NextResponse.rewrite(url, { request: { headers } })
  }

  if (url.pathname.startsWith('/super-admin')) {
    headers.set('x-tenant-type', 'super-admin')
    return NextResponse.rewrite(url, { request: { headers } })
  }

  const reservedSub = platformSubdomain(host)
  if (reservedSub && RESERVED_SUBDOMAINS.has(reservedSub)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const isAdminSubdomain = host.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')

  // 2. Merchant Admin — {slug}.*/admin or admin.<customdomain>
  if (isAdminSubdomain || isAdminPath) {
    let tenantIdentifier: string | null = null
    let isCustomDomain = false

    if (isAdminSubdomain) {
      const withoutAdmin = host.slice('admin.'.length)
      if (
        withoutAdmin === dnsHost ||
        withoutAdmin === PLATFORM_HOST ||
        withoutAdmin.endsWith(`.${dnsHost}`) ||
        withoutAdmin.endsWith(`.${PLATFORM_HOST}`) ||
        withoutAdmin === 'localhost' ||
        withoutAdmin.endsWith('.localhost')
      ) {
        tenantIdentifier = platformSubdomain(withoutAdmin) || (withoutAdmin === 'localhost' ? null : withoutAdmin.split('.')[0])
        if (withoutAdmin === 'localhost') tenantIdentifier = null
        if (withoutAdmin.endsWith('.localhost') || withoutAdmin.endsWith(`.${PLATFORM_HOST}`) || withoutAdmin.endsWith(`.${dnsHost}`)) {
          tenantIdentifier = platformSubdomain(withoutAdmin)
        }
      } else {
        tenantIdentifier = stripWww(withoutAdmin)
        isCustomDomain = true
      }
    } else if (isAdminPath) {
      const sub = platformSubdomain(host)
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
        tenantIdentifier = sub
      } else if (!host.includes(dnsHost) && !host.includes(PLATFORM_HOST) && !isLocalDevHost(host) && !host.endsWith('.localhost') && host !== dnsHost) {
        tenantIdentifier = stripWww(host)
        isCustomDomain = true
      }
    }

    if (tenantIdentifier && !RESERVED_SUBDOMAINS.has(tenantIdentifier)) {
      headers.set('x-tenant-identifier', tenantIdentifier)
      headers.set('x-tenant-type', 'merchant-admin')
      if (isCustomDomain) {
        headers.set('x-tenant-custom-domain', tenantIdentifier)
      }
    }

    if (isAdminSubdomain && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = '/admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }

    return NextResponse.rewrite(url, { request: { headers } })
  }

  // 3. Storefront
  let tenantIdentifier: string | null = null
  let isCustomDomain = false

  if (
    !host.includes(dnsHost) &&
    !host.includes(PLATFORM_HOST) &&
    !isLocalDevHost(host) &&
    !host.endsWith('.localhost') &&
    host !== dnsHost
  ) {
    tenantIdentifier = stripWww(host)
    isCustomDomain = true
  } else {
    const sub = platformSubdomain(host)
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
      tenantIdentifier = sub
    }
  }

  if (tenantIdentifier) {
    headers.set('x-tenant-identifier', tenantIdentifier)
    headers.set('x-tenant-type', 'storefront')
    if (isCustomDomain) {
      headers.set('x-tenant-custom-domain', tenantIdentifier)
    }
  }

  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
