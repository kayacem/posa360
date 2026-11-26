import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import prisma from '@/lib/db'
import { promises as dns } from 'dns'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { domain, token } = await req.json()

    try {
      const records = await dns.resolveTxt(`_posa360-verification.${domain}`)
      const found = records.flat().some((r) => r === token)

      if (!found) {
        return NextResponse.json({ error: 'TXT kaydı bulunamadı veya eşleşmiyor' }, { status: 400 })
      }

      await prisma.tenant.update({
        where: { id: params.id },
        data: { customDomain: domain },
      })

      return NextResponse.json({ success: true })
    } catch (err) {
      return NextResponse.json({ error: 'DNS kayıtları okunamadı. Lütfen kayıtların yayılmasını bekleyin (15-30 dk)' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
