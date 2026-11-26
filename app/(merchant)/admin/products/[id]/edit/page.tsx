import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductEditForm } from '@/components/merchant/ProductEditForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const product = await prisma.product.findFirst({
    where: { id, tenantId: tenantContext.id },
    include: {
      images: true,
      variants: true,
      categories: { include: { category: true } },
      brand: true,
    },
  })

  if (!product) {
    notFound()
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
      <h1 className="text-2xl font-bold mb-6">Ürün Düzenle</h1>
      <ProductEditForm product={product} categories={categories} brands={brands} />
    </div>
  )
}
