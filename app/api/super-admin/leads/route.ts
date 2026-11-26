import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json({ leads })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }
  const { id, status } = await req.json()
  const lead = await prisma.lead.update({
    where: { id },
    data: { status: String(status || 'CONTACTED') },
  })
  return NextResponse.json({ lead })
}
