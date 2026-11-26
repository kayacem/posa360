import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function ProductsPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const products = await prisma.product.findMany({
    where: { tenantId: tenantContext.tenant.id },
    include: {
      images: { take: 1 },
      categories: { include: { category: true } },
      brand: true,
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link href="/admin/products/new">
          <Button>+ Yeni Ürün</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} data-testid="product-row" className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {product.images[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.categories.map((pc) => pc.category.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.stock > 0 ? (
                      <span className="text-green-600">{product.stock} adet</span>
                    ) : (
                      <span className="text-red-600">Tükendi</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">Düzenle</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Henüz ürün eklenmemiş.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
