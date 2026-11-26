import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !['TENANT_OWNER', 'TENANT_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const data = await req.json()

    const product = await prisma.product.create({
      data: {
        tenantId: tenantContext.tenant.id,
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
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
