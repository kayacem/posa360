import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { permissionDeniedResponse, requireTenantPermission } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenantPermission('products')

    const tenantContext = await getTenantContext()
    if (!tenantContext || tenantContext.id !== ctx.tenantId) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const data = await req.json()

    const product = await prisma.product.create({
      data: {
        tenantId: tenantContext.id,
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description || '',
        price: data.price,
        stock: data.stock,
        brandId: data.brandId || null,
        isActive: data.isActive ?? true,
        isFeatured: false,
      },
    })

    if (data.categoryId) {
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: data.categoryId,
        },
      })
    }

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return permissionDeniedResponse(error)
    }
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
