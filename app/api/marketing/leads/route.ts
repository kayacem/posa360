import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim() || null
    const company = String(body.company || '').trim() || null
    const message = String(body.message || '').trim()
    const source = String(body.source || 'iletisim').trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Ad, e-posta ve mesaj zorunlu' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, company, message, source, status: 'NEW' },
    })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Kayıt başarısız' }, { status: 500 })
  }
}
