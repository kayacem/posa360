import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import prisma from '@/lib/db'

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { status } = await req.json()

    await prisma.tenant.update({
      where: { id: (await context.params).id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
