import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await await auth()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const tenantContext = await getTenantContext()
    if (!tenantContext) return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })

    const products = await prisma.product.findMany({
      where: { tenantId: tenantContext.id },
      include: { brand: true, categories: { include: { category: true } } },
    })

    const csv = [
      'SKU,Name,Price,Stock,Brand,Category,Active',
      ...products.map((p) =>
        [
          p.sku,
          `"${p.name}"`,
          p.price,
          p.stock,
          p.brand?.name || '',
          p.categories.map((c) => c.category.name).join(';'),
          p.isActive ? 'Yes' : 'No',
        ].join(',')
      ),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=products.csv',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
