import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { ProductForm } from '@/components/merchant/ProductForm'

export default async function NewProductPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const categories = await prisma.category.findMany({
    where: { tenantId: tenantContext.id, isActive: true },
    orderBy: { name: 'asc' },
  })

  const brands = await prisma.brand.findMany({
    where: { tenantId: tenantContext.id, isActive: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Yeni Ürün Ekle</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
