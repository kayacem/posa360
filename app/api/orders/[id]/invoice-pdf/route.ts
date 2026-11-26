import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { generateInvoicePDF } from '@/lib/pdf-generator'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenantContext = await getTenantContext()
    if (!tenantContext) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const order = await prisma.order.findFirst({
      where: { id: (await context.params).id, tenantId: tenantContext.id },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const pdf = await generateInvoicePDF(order)
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=fatura-${order.orderNumber}.pdf`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
