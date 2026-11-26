import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function FavoritesPage() {
  const session = await await auth()
  if (!session || session.user.role !== 'CUSTOMER') redirect('/login')

  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const customer = await prisma.customer.findFirst({
    where: { tenantId: tenantContext.tenant.id, email: session.user.email! },
    include: { favorites: { include: { product: { include: { images: { take: 1 } } } } } },
  })

  if (!customer) return <div>Müşteri bulunamadı</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Favorilerim</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {customer.favorites.map((fav) => (
          <Link key={fav.id} href={`/product/${fav.product.slug}`}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              {fav.product.images[0] && (
                <img src={fav.product.images[0].url} alt={fav.product.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="font-medium mb-2">{fav.product.name}</div>
                <div className="text-lg font-bold">{formatCurrency(parseFloat(fav.product.price.toString()))}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {customer.favorites.length === 0 && (
        <div className="text-center py-12 text-gray-500">Favori ürününüz bulunmuyor</div>
      )}
    </div>
  )
}
