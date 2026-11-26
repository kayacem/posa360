import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, paymentId } = await context.params
  const payment = await prisma.tenantPayment.update({
    where: { id: paymentId },
    data: { status: 'PAID', paidAt: new Date() },
  })

  await prisma.tenant.update({
    where: { id },
    data: {
      lastPaymentDate: new Date(),
      lastPaymentStatus: 'PAID',
    },
  })

  return NextResponse.json({ success: true, payment })
}
