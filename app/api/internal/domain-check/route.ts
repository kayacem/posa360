import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { HUB_SUBDOMAIN, RESERVED_SUBDOMAINS, dnsPlatformHost } from '@/lib/platform'

/**
 * Allow-list helper for diagnostics / TLS tooling.
 * Allows: eticaret hub, panel alias, non-reserved store subdomains, verified custom domains.
 * Does NOT allow apex/www (owned by the existing POSA hub) or reserved product subs.
 */
export async function GET(req: NextRequest) {
  const domainRaw = req.nextUrl.searchParams.get('domain') || ''
  const domain = domainRaw.trim().toLowerCase().replace(/\.$/, '')

  if (!domain || domain.length > 253 || /[^a-z0-9.-]/.test(domain)) {
    return new NextResponse('invalid', { status: 400 })
  }

  const platformHost = dnsPlatformHost()

  if (domain === platformHost || domain === `www.${platformHost}`) {
    return new NextResponse('other-service', { status: 404 })
  }

  if (domain === `${HUB_SUBDOMAIN}.${platformHost}` || domain === `panel.${platformHost}`) {
    return new NextResponse('ok', { status: 200 })
  }

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
    where: { isVerified: true, domain: { in: candidates } },
    select: { id: true },
  })
  if (verified) return new NextResponse('ok', { status: 200 })

  const tenant = await prisma.tenant.findFirst({
    where: { customDomain: { in: candidates }, status: { in: ['ACTIVE', 'TRIAL'] } },
    select: { id: true },
  })
  if (tenant) return new NextResponse('ok', { status: 200 })

  return new NextResponse('unknown', { status: 404 })
}
