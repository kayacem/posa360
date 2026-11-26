import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await await auth()
    if (!session || !['TENANT_OWNER', 'TENANT_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const data = await req.json()

    await prisma.product.update({
      where: { id: (await context.params).id },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        price: data.price,
        stock: data.stock,
        brandId: data.brandId || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    })

    await prisma.productCategory.deleteMany({ where: { productId: (await context.params).id } })
    if (data.categoryId) {
      await prisma.productCategory.create({
        data: { productId: (await context.params).id, categoryId: data.categoryId },
      })
    }

    await prisma.productImage.deleteMany({ where: { productId: (await context.params).id } })
    for (const img of data.images || []) {
      await prisma.productImage.create({
        data: { productId: (await context.params).id, url: img.url, sortOrder: img.sortOrder },
      })
    }

    await prisma.productVariant.deleteMany({ where: { productId: (await context.params).id } })
    for (const v of data.variants || []) {
      if (v.name) {
        await prisma.productVariant.create({
          data: {
            productId: (await context.params).id,
            name: v.name,
            sku: v.sku,
            price: parseFloat(v.price),
            stock: parseInt(v.stock || '0'),
            isActive: v.isActive ?? true,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
