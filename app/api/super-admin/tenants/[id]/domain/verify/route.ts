import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'
import { promises as dns } from 'dns'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id: tenantId } = await context.params
    const body = await req.json()
    const domain = String(body.domain || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
    const token = String(body.token || '')

    const verification = await prisma.domainVerification.findFirst({
      where: { domain, tenantId },
    })

    if (!verification) {
      return NextResponse.json({ error: 'Domain kaydı bulunamadı' }, { status: 404 })
    }

    const expectedToken = token || verification.verificationToken

    // Allow skip-dns in development when SKIP_DNS_VERIFY=1
    let found = process.env.SKIP_DNS_VERIFY === '1'
    if (!found) {
      try {
        const records = await dns.resolveTxt(`_posa360-verification.${domain}`)
        found = records.flat().some((r) => r === expectedToken)
      } catch {
        return NextResponse.json(
          { error: 'DNS kayıtları okunamadı. Lütfen kayıtların yayılmasını bekleyin (15-30 dk)' },
          { status: 400 }
        )
      }
    }

    if (!found) {
      return NextResponse.json({ error: 'TXT kaydı bulunamadı veya eşleşmiyor' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.domainVerification.update({
        where: { id: verification.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          sslStatus: 'pending',
        },
      }),
      prisma.tenant.update({
        where: { id: tenantId },
        data: { customDomain: domain },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
