import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

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
 * Root cron / issue-domain-cert.sh polls this for verified domains
 * that still need Let's Encrypt + nginx vhost.
 */
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const rows = await prisma.domainVerification.findMany({
    where: {
      isVerified: true,
      sslStatus: { in: ['pending', 'failed'] },
    },
    select: {
      id: true,
      domain: true,
      tenantId: true,
      sslStatus: true,
      verifiedAt: true,
    },
    orderBy: { verifiedAt: 'asc' },
    take: 50,
  })

  return NextResponse.json({
    domains: rows.map((r) => ({
      id: r.id,
      domain: r.domain,
      adminDomain: `admin.${r.domain}`,
      tenantId: r.tenantId,
      sslStatus: r.sslStatus,
    })),
  })
}

/** Mark SSL issued / failed after certbot. */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const domain = String(body.domain || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  const status = String(body.status || '').toLowerCase()
  const message = body.message ? String(body.message).slice(0, 500) : ''

  if (!domain || !['issued', 'active', 'failed', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'domain + status required' }, { status: 400 })
  }

  const sslStatus = status === 'active' ? 'issued' : status

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

  return NextResponse.json({ ok: true, domain, sslStatus })
}
