import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id: tenantId } = await context.params
    const { domain: rawDomain } = await req.json()
    const domain = String(rawDomain || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')

    if (!domain || /[^a-z0-9.-]/.test(domain)) {
      return NextResponse.json({ error: 'Geçersiz domain' }, { status: 400 })
    }

    const token = `posa360-verify-${crypto.randomBytes(16).toString('hex')}`
    const requiredRecords = JSON.stringify([
      { type: 'TXT', host: `_posa360-verification.${domain}`, value: token },
      { type: 'A', host: '@', value: '<VPS_IP>' },
      { type: 'CNAME', host: 'www', value: domain },
      { type: 'CNAME', host: 'admin', value: domain },
    ])

    const record = await prisma.domainVerification.upsert({
      where: { domain },
      create: {
        tenantId,
        domain,
        verificationToken: token,
        isVerified: false,
        requiredRecords,
        sslStatus: 'pending',
      },
      update: {
        tenantId,
        verificationToken: token,
        isVerified: false,
        verifiedAt: null,
        requiredRecords,
        sslStatus: 'pending',
      },
    })

    return NextResponse.json({
      token: record.verificationToken,
      domain: record.domain,
      txtHost: `_posa360-verification.${domain}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
