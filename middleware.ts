import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Platform ana domain (production'da posa360.com olacak)
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:43210'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // X-Tenant-* headerları temizle (güvenlik)
  const headers = new Headers(request.headers)
  headers.delete('x-tenant-id')
  headers.delete('x-tenant-slug')
  headers.delete('x-tenant-type')
  
  // 1. Super Admin Panel: panel.posa360.com veya localhost:43210/super-admin
  if (hostname.startsWith('panel.') || url.pathname.startsWith('/super-admin')) {
    headers.set('x-tenant-type', 'super-admin')
    return NextResponse.rewrite(url, { headers })
  }

  // Platform hub only on bare localhost (no tenant subdomain / custom domain)
  const hostNoPort = hostname.split(':')[0]
  const isBareLocalhost =
    hostNoPort === 'localhost' ||
    hostNoPort === '127.0.0.1' ||
    hostNoPort === '::1'
  if (isBareLocalhost && (url.pathname === '/' || url.pathname === '')) {
    url.pathname = '/platform'
    return NextResponse.rewrite(url, { headers })
  }
  
  // 2. Merchant Admin: admin.customdomain.com veya admin.shopslug.posa360.com
  //    veya shopslug.posa360.com/admin
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')
  
  if (isAdminSubdomain || isAdminPath) {
    let tenantIdentifier: string | null = null
    
    if (isAdminSubdomain) {
      // admin.shopcem.com -> tenant via custom domain (shopcem.com)
      // admin.shopmagaza.posa360.com -> tenant via slug (shopmagaza)
      const parts = hostname.split('.')
      if (parts.length >= 3) {
        const restDomain = parts.slice(1).join('.')
        
        if (restDomain.includes(PLATFORM_DOMAIN.split(':')[0])) {
          // admin.shopmagaza.posa360.com -> slug: shopmagaza
          tenantIdentifier = parts[0].replace('admin', '').replace('.', '') || parts[1]
        } else {
          // admin.shopcem.com -> custom domain: shopcem.com
          tenantIdentifier = restDomain
          headers.set('x-tenant-custom-domain', restDomain)
        }
      }
    } else if (isAdminPath) {
      // Path-based: shopmagaza.posa360.com/admin or posa360.com/shopmagaza/admin
      // Extract tenant from subdomain or first path segment
      const parts = hostname.split('.')
      
      if (parts[0] !== 'www' && parts[0] !== PLATFORM_DOMAIN.split(':')[0].split('.')[0]) {
        // subdomain-based
        tenantIdentifier = parts[0]
      } else {
        // path-based: /shopmagaza/admin -> shopmagaza
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length >= 2 && pathParts[1] === 'admin') {
          tenantIdentifier = pathParts[0]
        }
      }
    }
    
    if (tenantIdentifier) {
      headers.set('x-tenant-identifier', tenantIdentifier)
      headers.set('x-tenant-type', 'merchant-admin')
    }
    
    return NextResponse.rewrite(url, { headers })
  }
  
  // 3. Storefront: subdomain, path, veya custom domain
  let tenantIdentifier: string | null = null
  let isCustomDomain = false
  
  const parts = hostname.split('.')
  const platformBase = PLATFORM_DOMAIN.split(':')[0]
  
  // Custom domain check: eğer hostname platform domain'i içermiyorsa custom domain'dir
  if (!hostname.includes(platformBase)) {
    // shopcem.com gibi custom domain
    tenantIdentifier = hostname.split(':')[0] // port varsa kaldır
    isCustomDomain = true
    headers.set('x-tenant-custom-domain', tenantIdentifier)
  }
  // Subdomain check: shopmagaza.posa360.com
  else if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== platformBase.split('.')[0]) {
    tenantIdentifier = parts[0]
  }
  // Path-based routing: posa360.com/shopmagaza
  else if (url.pathname.startsWith('/') && url.pathname.split('/').length >= 2) {
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
  
  return NextResponse.rewrite(url, { headers })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
