import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const RESERVED_SUBDOMAINS = new Set(['www', 'mail'])

/**
 * Caddy On-Demand TLS "ask" endpoint.
 * GET /api/internal/domain-check?domain=example.com
 *
 * - Allows platform subdomains (app/admin/{store}.posa360.com) — NOT apex/www
 * - Allows verified merchant custom domains (+ admin.* variant)
 */
export async function GET(req: NextRequest) {
  const domainRaw = req.nextUrl.searchParams.get('domain') || ''
  const domain = domainRaw.trim().toLowerCase().replace(/\.$/, '')

  if (!domain || domain.length > 253 || /[^a-z0-9.-]/.test(domain)) {
    return new NextResponse('invalid', { status: 400 })
  }

  const platformHost = (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'posa360.com')
    .split(':')[0]
    .toLowerCase()

  // Marketing site — never issue certs / never claim apex or www
  if (domain === platformHost || domain === `www.${platformHost}`) {
    return new NextResponse('marketing', { status: 404 })
  }

  // Platform subdomains we serve: app, admin, panel, and store slugs
  if (domain.endsWith(`.${platformHost}`)) {
    const sub = domain.slice(0, -(`.${platformHost}`.length))
    if (!sub || sub.includes('.')) {
      return new NextResponse('unknown', { status: 404 })
    }
    if (RESERVED_SUBDOMAINS.has(sub)) {
      return new NextResponse('reserved', { status: 404 })
    }
    return new NextResponse('ok', { status: 200 })
  }

  const apex = domain.startsWith('admin.') ? domain.slice('admin.'.length) : domain
  const candidates = Array.from(
    new Set([apex, domain, apex.startsWith('www.') ? apex.slice(4) : `www.${apex}`])
  )

  const verified = await prisma.domainVerification.findFirst({
    where: {
      isVerified: true,
      domain: { in: candidates },
    },
    select: { id: true },
  })

  if (verified) {
    return new NextResponse('ok', { status: 200 })
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      customDomain: { in: candidates },
      status: 'ACTIVE',
    },
    select: { id: true },
  })

  if (tenant) {
    return new NextResponse('ok', { status: 200 })
  }

  return new NextResponse('unknown', { status: 404 })
}
