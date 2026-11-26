import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await req.json()

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      companyName: body.companyName || null,
      contactPerson: body.contactPerson || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      taxNumber: body.taxNumber || null,
      address: body.address || null,
      monthlyFee: Number(body.monthlyFee) || 0,
      plan: body.plan || 'basic',
    },
  })

  return NextResponse.json({ success: true, tenant })
}
