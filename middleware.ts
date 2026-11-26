import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Platform ana domain (production'da posa360.com)
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:43210'
const PLATFORM_HOST = PLATFORM_DOMAIN.split(':')[0].toLowerCase()

function hostWithoutPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isPlatformApex(host: string): boolean {
  return (
    host === PLATFORM_HOST ||
    host === `www.${PLATFORM_HOST}` ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1'
  )
}

function isPlatformAdminHost(host: string): boolean {
  // admin.posa360.com or panel.posa360.com → super-admin
  return host === `admin.${PLATFORM_HOST}` || host === `panel.${PLATFORM_HOST}`
}

function stripWww(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : host
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

  // Internal TLS ask endpoint — no tenant rewrite needed
  if (url.pathname.startsWith('/api/internal/')) {
    return NextResponse.next({ request: { headers } })
  }

  // 1. Super Admin: admin.posa360.com | panel.posa360.com | /super-admin
  if (isPlatformAdminHost(host) || url.pathname.startsWith('/super-admin')) {
    headers.set('x-tenant-type', 'super-admin')
    if (isPlatformAdminHost(host) && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = '/super-admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }
    return NextResponse.rewrite(url, { request: { headers } })
  }

  // Platform hub on apex (posa360.com / localhost)
  if (isPlatformApex(host) && (url.pathname === '/' || url.pathname === '')) {
    url.pathname = '/platform'
    return NextResponse.rewrite(url, { request: { headers } })
  }

  const isAdminSubdomain = host.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')

  // 2. Merchant Admin: admin.customdomain.com | admin.slug.posa360.com | slug.posa360.com/admin
  if (isAdminSubdomain || isAdminPath) {
    let tenantIdentifier: string | null = null
    let isCustomDomain = false

    if (isAdminSubdomain) {
      // admin.shopcem.com → custom domain shopcem.com
      // admin.shopmagaza.posa360.com → slug shopmagaza
      const withoutAdmin = host.slice('admin.'.length)

      if (withoutAdmin === PLATFORM_HOST || withoutAdmin.endsWith(`.${PLATFORM_HOST}`)) {
        // admin.slug.posa360.com (platform subdomain merchant admin)
        const sub = withoutAdmin.slice(0, -(`.${PLATFORM_HOST}`.length))
        tenantIdentifier = sub || null
      } else if (withoutAdmin.includes(PLATFORM_HOST)) {
        // fallback: admin.shopmagaza.posa360.com style already handled above
        const parts = withoutAdmin.split('.')
        tenantIdentifier = parts[0] || null
      } else {
        tenantIdentifier = stripWww(withoutAdmin)
        isCustomDomain = true
      }
    } else if (isAdminPath) {
      if (host.endsWith(`.${PLATFORM_HOST}`) && !isPlatformApex(host)) {
        tenantIdentifier = host.slice(0, -(`.${PLATFORM_HOST}`.length)).split('.')[0]
      } else if (!host.includes(PLATFORM_HOST) && !isPlatformApex(host)) {
        // custom domain + /admin path
        tenantIdentifier = stripWww(host)
        isCustomDomain = true
      } else {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length >= 2 && pathParts[1] === 'admin') {
          tenantIdentifier = pathParts[0]
        }
      }
    }

    if (tenantIdentifier) {
      headers.set('x-tenant-identifier', tenantIdentifier)
      headers.set('x-tenant-type', 'merchant-admin')
      if (isCustomDomain) {
        headers.set('x-tenant-custom-domain', tenantIdentifier)
      }
    }

    // admin.customdomain.com/ → rewrite to /admin (no cross-host redirect)
    if (isAdminSubdomain && (url.pathname === '/' || url.pathname === '')) {
      url.pathname = '/admin'
      return NextResponse.rewrite(url, { request: { headers } })
    }

    return NextResponse.rewrite(url, { request: { headers } })
  }

  // 3. Storefront: subdomain, path, veya custom domain (no redirect off custom domain)
  let tenantIdentifier: string | null = null
  let isCustomDomain = false

  if (!host.includes(PLATFORM_HOST) && !isPlatformApex(host)) {
    tenantIdentifier = stripWww(host)
    isCustomDomain = true
  } else if (host.endsWith(`.${PLATFORM_HOST}`) && !isPlatformApex(host)) {
    const sub = host.slice(0, -(`.${PLATFORM_HOST}`.length))
    if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'panel') {
      tenantIdentifier = sub.split('.')[0]
    }
  } else if (url.pathname.startsWith('/') && url.pathname.split('/').length >= 2) {
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 1 && pathParts[0] !== 'api' && pathParts[0] !== '_next') {
      tenantIdentifier = pathParts[0]
      headers.set('x-tenant-path-based', 'true')
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
