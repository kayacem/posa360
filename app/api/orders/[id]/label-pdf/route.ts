import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { generateShippingLabelPDF } from '@/lib/pdf-generator'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenantContext = await getTenantContext()
    if (!tenantContext) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const order = await prisma.order.findFirst({
      where: { id: params.id, tenantId: tenantContext.id },
      include: {
        customer: true,
        shipments: true,
        shippingAddress: true,
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!order.shipments[0]) return NextResponse.json({ error: 'No shipment found' }, { status: 404 })

    const pdf = await generateShippingLabelPDF(order, order.shipments[0])
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=etiket-${order.orderNumber}.pdf`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
