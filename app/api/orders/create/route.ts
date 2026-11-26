import { NextRequest, NextResponse } from 'next/server'
import { generateOrderNumber } from '@/lib/utils'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { buildOrderAddressSnapshot } from '@/lib/order-address'
import { computeOrderTotals } from '@/lib/order-totals'

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant || tenant.type === 'super-admin') {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const body = await request.json()
    const items: Array<{
      productId?: string
      name?: string
      productName?: string
      variantName?: string
      price: number
      quantity: number
    }> = body.items || []

    if (!items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totals = computeOrderTotals(
      items.map((i) => ({ price: Number(i.price), quantity: Number(i.quantity) })),
      {
        discountAmount: Number(body.discountAmount || 0),
        taxRate: tenant.settings?.taxRate ?? 0.2,
      }
    )

    const addressJson = buildOrderAddressSnapshot({
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      addressLine1: body.addressLine1 || body.line1,
      addressLine2: body.addressLine2 || body.line2,
      il: body.il || body.city,
      ilce: body.ilce || body.district,
      postalCode: body.postalCode,
      country: body.country || 'Türkiye',
    })

    let customer = await prisma.customer.findFirst({
      where: { tenantId: tenant.id, email: body.email },
    })
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId: tenant.id,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
        },
      })
    }

    const orderNumber = generateOrderNumber()

    // Resolve product ids (cart may only have slug/name)
    const orderItemsData = []
    for (const item of items) {
      let productId = item.productId
      if (!productId) {
        const product = await prisma.product.findFirst({
          where: {
            tenantId: tenant.id,
            OR: [
              { name: item.productName || item.name },
              { slug: (item as any).slug },
            ],
          },
        })
        if (!product) continue
        productId = product.id
      }
      orderItemsData.push({
        productId,
        productName: item.productName || item.name || 'Ürün',
        variantName: item.variantName || null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
      })
    }

    if (!orderItemsData.length) {
      return NextResponse.json({ error: 'No valid products' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        customerEmail: body.email,
        customerName: `${body.firstName} ${body.lastName}`,
        customerPhone: body.phone,
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
        shippingAddress: addressJson,
        billingAddress: addressJson,
        items: { create: orderItemsData },
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
