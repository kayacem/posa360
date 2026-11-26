import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * Caddy On-Demand TLS "ask" endpoint.
 * GET /api/internal/domain-check?domain=shopcem.com
 * Returns 200 only for verified custom domains (and their admin.* variant).
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

  // Platform hosts are covered by the main site block / wildcard — allow them
  if (
    domain === platformHost ||
    domain === `www.${platformHost}` ||
    domain === `admin.${platformHost}` ||
    domain === `panel.${platformHost}` ||
    domain.endsWith(`.${platformHost}`)
  ) {
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

  // Also allow tenants that already have customDomain set (legacy / seed)
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
