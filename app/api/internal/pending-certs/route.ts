import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { dnsPlatformHost } from '@/lib/platform'

function authorize(req: NextRequest): boolean {
  const secret = process.env.CERT_AGENT_SECRET || ''
  if (!secret) return false
  const header =
    req.headers.get('x-cert-agent-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  return header === secret
}

/**
 * Root cron polls for hostnames that need certbot --nginx HTTP-01:
 * - platform: {slug}.posa360.com (Tenant.platformSslStatus pending|failed)
 * - custom: verified domain + admin.<domain> (DomainVerification.sslStatus pending|failed)
 */
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const platformHost = dnsPlatformHost()

  const tenants = await prisma.tenant.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIAL'] },
      platformSslStatus: { in: ['pending', 'failed'] },
    },
    select: { id: true, slug: true, platformSslStatus: true },
    orderBy: { createdAt: 'asc' },
    take: 40,
  })

  const custom = await prisma.domainVerification.findMany({
    where: {
      isVerified: true,
      sslStatus: { in: ['pending', 'failed'] },
    },
    select: {
      id: true,
      domain: true,
      tenantId: true,
      sslStatus: true,
    },
    orderBy: { verifiedAt: 'asc' },
    take: 40,
  })

  const hosts: Array<{
    kind: 'platform' | 'custom'
    host: string
    hosts: string[]
    tenantId: string
    id: string
    sslStatus: string
  }> = []

  for (const t of tenants) {
    const host = `${t.slug}.${platformHost}`
    hosts.push({
      kind: 'platform',
      host,
      hosts: [host],
      tenantId: t.id,
      id: t.id,
      sslStatus: t.platformSslStatus,
    })
  }

  for (const r of custom) {
    hosts.push({
      kind: 'custom',
      host: r.domain,
      hosts: [r.domain, `admin.${r.domain}`],
      tenantId: r.tenantId,
      id: r.id,
      sslStatus: r.sslStatus,
    })
  }

  // Back-compat alias
  return NextResponse.json({ hosts, domains: hosts })
}

/** Mark SSL issued / failed after certbot. */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const kind = String(body.kind || 'custom').toLowerCase()
  const host = String(body.host || body.domain || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  const status = String(body.status || '').toLowerCase()
  const message = body.message ? String(body.message).slice(0, 500) : ''
  const tenantId = body.tenantId ? String(body.tenantId) : ''

  if (!host || !['issued', 'active', 'failed', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'host + status required' }, { status: 400 })
  }

  const sslStatus = status === 'active' ? 'issued' : status

  if (kind === 'platform') {
    const platformHost = dnsPlatformHost()
    const slug = host.endsWith(`.${platformHost}`)
      ? host.slice(0, -(`.${platformHost}`.length))
      : host.split('.')[0]

    const where = tenantId
      ? { id: tenantId }
      : { slug }

    const updated = await prisma.tenant.updateMany({
      where,
      data: { platformSslStatus: sslStatus },
    })
    if (updated.count === 0) {
      return NextResponse.json({ error: 'tenant not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, kind: 'platform', host, sslStatus })
  }

  // custom domain (DomainVerification.domain — not admin.)
  const domain = host.startsWith('admin.') ? host.slice('admin.'.length) : host
  const data: { sslStatus: string; sslProvider?: string } = { sslStatus }
  if (sslStatus === 'issued') {
    data.sslProvider = 'letsencrypt'
  } else if (sslStatus === 'failed' && message) {
    data.sslProvider = `error:${message}`
  }

  const updated = await prisma.domainVerification.updateMany({
    where: { domain },
    data,
  })

  if (updated.count === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, kind: 'custom', host: domain, sslStatus })
}
