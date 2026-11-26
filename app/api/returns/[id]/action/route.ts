import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await await auth()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const tenantContext = await getTenantContext()
    if (!tenantContext) return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })

    const { action } = await req.json()
    const ret = await prisma.return.findFirst({
      where: { id: params.id, tenantId: tenantContext.id },
      include: { returnItems: { include: { orderItem: true } } },
    })

    if (!ret) return NextResponse.json({ error: 'İade bulunamadı' }, { status: 404 })

    if (action === 'approve') {
      await prisma.return.update({
        where: { id: params.id },
        data: { status: 'APPROVED', reviewedAt: new Date() },
      })
    } else if (action === 'reject') {
      await prisma.return.update({
        where: { id: params.id },
        data: { status: 'REJECTED', reviewedAt: new Date() },
      })
    } else if (action === 'received') {
      await prisma.return.update({
        where: { id: params.id },
        data: { status: 'RECEIVED', receivedAt: new Date() },
      })
      for (const item of ret.returnItems) {
        await prisma.product.update({
          where: { id: item.orderItem.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    } else if (action === 'refund') {
      await prisma.return.update({
        where: { id: params.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      })
      await prisma.order.update({
        where: { id: ret.orderId },
        data: { status: 'REFUNDED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
