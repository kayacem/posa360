import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:43210'
const PLATFORM_HOST = PLATFORM_DOMAIN.split(':')[0].toLowerCase()
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'admin', 'mail', 'panel'])

function hostWithoutPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isLocalDevHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

function isMarketingHost(host: string): boolean {
  return (
    host === PLATFORM_HOST ||
    host === `www.${PLATFORM_HOST}` ||
    isLocalDevHost(host)
  )
}

function isPlatformAppHost(host: string): boolean {
  return host === `app.${PLATFORM_HOST}`
}

function isPlatformAdminHost(host: string): boolean {
  return host === `admin.${PLATFORM_HOST}` || host === `panel.${PLATFORM_HOST}`
}

function stripWww(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : host
}

function platformSubdomain(host: string): string | null {
  if (!host.endsWith(`.${PLATFORM_HOST}`)) return null
  const sub = host.slice(0, -(`.${PLATFORM_HOST}`.length))
  if (!sub) return null
  return sub.split('.')[0] || null
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

  // www → apex (production). Localhost stays as-is.
  if (host === `www.${PLATFORM_HOST}` && !isLocalDevHost(host)) {
    const apex = new URL(request.url)
    apex.hostname = PLATFORM_HOST
    return NextResponse.redirect(apex, 308)
  }

  // 1. Marketing site: apex + localhost (dev)
  // Keep /login /kayit /super-admin /platform /api on same host without rewrite to /marketing
  if (isMarketingHost(host) && !isPlatformAppHost(host) && !isPlatformAdminHost(host)) {
    const path = url.pathname
    const isAppRoute =
      path.startsWith('/login') ||
      path.startsWith('/kayit') ||
      path.startsWith('/super-admin') ||
      path.startsWith('/platform') ||
      path.startsWith('/api') ||
      path.startsWith('/admin') ||
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

    // /login, /kayit etc. on apex/localhost
    if (path === '/' || path === '') {
      headers.set('x-tenant-type', 'marketing')
      url.pathname = '/marketing'
      return NextResponse.rewrite(url, { request: { headers } })
    }
  }

  // 2. Platform app hub: app.posa360.com
  if (isPlatformAppHost(host)) {
    headers.set('x-tenant-type', 'platform-app')
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/login'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    return NextResponse.rewrite(url, { request: { headers } })
  }

  // 3. Super Admin
  if (isPlatformAdminHost(host) || url.pathname.startsWith('/super-admin')) {
    headers.set('x-tenant-type', 'super-admin')
    if (isPlatformAdminHost(host) && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = '/super-admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    return NextResponse.rewrite(url, { request: { headers } })
  }

  const reservedSub = platformSubdomain(host)
  if (reservedSub && RESERVED_SUBDOMAINS.has(reservedSub)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const isAdminSubdomain = host.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')

  // 4. Merchant Admin
  if (isAdminSubdomain || isAdminPath) {
    let tenantIdentifier: string | null = null
    let isCustomDomain = false

    if (isAdminSubdomain) {
      const withoutAdmin = host.slice('admin.'.length)
      if (withoutAdmin === PLATFORM_HOST || withoutAdmin.endsWith(`.${PLATFORM_HOST}`)) {
        const sub = withoutAdmin.endsWith(`.${PLATFORM_HOST}`)
          ? withoutAdmin.slice(0, -(`.${PLATFORM_HOST}`.length))
          : null
        tenantIdentifier = sub || null
      } else {
        tenantIdentifier = stripWww(withoutAdmin)
        isCustomDomain = true
      }
    } else if (isAdminPath) {
      const sub = platformSubdomain(host)
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
        tenantIdentifier = sub
      } else if (!host.includes(PLATFORM_HOST) && !isLocalDevHost(host) && host !== PLATFORM_HOST) {
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

  // 5. Storefront
  let tenantIdentifier: string | null = null
  let isCustomDomain = false

  if (!host.includes(PLATFORM_HOST) && !isLocalDevHost(host) && host !== PLATFORM_HOST) {
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
