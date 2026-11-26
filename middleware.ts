import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Platform root domain (apex is marketing — this app does NOT serve it)
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:43210'
const PLATFORM_HOST = PLATFORM_DOMAIN.split(':')[0].toLowerCase()

/** Subdomains that are never store tenants */
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'admin', 'mail', 'panel'])

function hostWithoutPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isLocalDevHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

/** app.posa360.com (+ bare localhost for local login/kayit) */
function isPlatformAppHost(host: string): boolean {
  return host === `app.${PLATFORM_HOST}` || isLocalDevHost(host)
}

/** admin.posa360.com | panel.posa360.com */
function isPlatformAdminHost(host: string): boolean {
  return host === `admin.${PLATFORM_HOST}` || host === `panel.${PLATFORM_HOST}`
}

function stripWww(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : host
}

function platformSubdomain(host: string): string | null {
  if (!host.endsWith(`.${PLATFORM_HOST}`)) return null
  const sub = host.slice(0, -(`.${PLATFORM_HOST}`.length))
  if (!sub || sub.includes('.')) return sub.split('.')[0] || null
  return sub
}

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

  // Internal TLS ask endpoint — no tenant rewrite
  if (url.pathname.startsWith('/api/internal/')) {
    return NextResponse.next({ request: { headers } })
  }

  // Apex / www must not be served by this app (marketing site). Refuse if misrouted.
  if (
    !isLocalDevHost(host) &&
    (host === PLATFORM_HOST || host === `www.${PLATFORM_HOST}`)
  ) {
    return new NextResponse(
      'posa360.com apex is the marketing site — use app.posa360.com / admin.posa360.com / {store}.posa360.com',
      { status: 404 }
    )
  }

  // 1. Platform app hub: app.posa360.com (login + kayit) / localhost
  if (isPlatformAppHost(host)) {
    headers.set('x-tenant-type', 'platform-app')
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/login'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    // /kayit, /login, /platform, /api/* etc. pass through
    return NextResponse.rewrite(url, { request: { headers } })
  }

  // 2. Super Admin: admin.posa360.com | panel.posa360.com | /super-admin
  if (isPlatformAdminHost(host) || url.pathname.startsWith('/super-admin')) {
    headers.set('x-tenant-type', 'super-admin')
    if (isPlatformAdminHost(host) && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = '/super-admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    return NextResponse.rewrite(url, { request: { headers } })
  }

  // Reserved platform subdomains (mail, www already handled, etc.) — not stores
  const reservedSub = platformSubdomain(host)
  if (reservedSub && RESERVED_SUBDOMAINS.has(reservedSub)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const isAdminSubdomain = host.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')

  // 3. Merchant Admin: admin.customdomain | slug.posa360.com/admin
  if (isAdminSubdomain || isAdminPath) {
    let tenantIdentifier: string | null = null
    let isCustomDomain = false

    if (isAdminSubdomain) {
      const withoutAdmin = host.slice('admin.'.length)

      if (withoutAdmin === PLATFORM_HOST || withoutAdmin.endsWith(`.${PLATFORM_HOST}`)) {
        // admin.slug.posa360.com
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
      } else if (!host.includes(PLATFORM_HOST) && !isLocalDevHost(host)) {
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

  // 4. Storefront: tenant subdomain or custom domain (never apex)
  let tenantIdentifier: string | null = null
  let isCustomDomain = false

  if (!host.includes(PLATFORM_HOST) && !isLocalDevHost(host)) {
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
