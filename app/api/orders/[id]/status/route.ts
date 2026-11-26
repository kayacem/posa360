import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !['TENANT_OWNER', 'TENANT_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const { status } = await req.json()

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: tenantContext.tenant.id,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    if (status === 'SHIPPED') {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: 'Mock Kargo',
          trackingNumber: `TRK${Date.now()}`,
          status: 'IN_TRANSIT',
          shippedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: error.message || 'Durum güncellenemedi' },
      { status: 500 }
    )
  }
}
