import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StorefrontHome() {
  const tenant = await getTenantContext()
  
  if (!tenant) {
    return <div>Mağaza bulunamadı</div>
  }

  // Featured products
  const featuredProducts = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      isFeatured: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
    take: 8,
  })

  // Categories
  const categories = await prisma.category.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  })

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="py-20 text-white"
        style={{ backgroundColor: tenant.settings.primaryColor }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hoş Geldiniz
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Kaliteli ürünler, uygun fiyatlar, hızlı kargo
          </p>
          <Link href="/products">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
            >
              Alışverişe Başla
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Kategoriler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/category/${category.slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-4xl text-gray-400">📦</span>
                        </div>
                      )}
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Öne Çıkan Ürünler</h2>
            <Link href="/products">
              <Button variant="outline">Tümünü Gör</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const mainImage = product.images[0]
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
              
              return (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <Card className="group hover:shadow-xl transition-shadow h-full flex flex-col">
                    <CardContent className="p-0">
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={mainImage.altText || product.name}
                          className="w-full h-64 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <span className="text-6xl text-gray-400">📦</span>
                        </div>
                      )}

                      <div className="p-4">
                        <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {product.shortDesc && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.shortDesc}
                          </p>
                        )}

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {formatCurrency(product.price, tenant.settings.currency)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.compareAtPrice!, tenant.settings.currency)}
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <Badge variant="destructive" className="mt-2">
                            %{Math.round((1 - product.price / product.compareAtPrice!) * 100)} İndirim
                          </Badge>
                        )}

                        {!product.trackInventory || product.stock > 0 ? (
                          <Badge variant="success" className="mt-2 ml-2">
                            Stokta
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2 ml-2">
                            Tükendi
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="mt-auto">
                      <Button 
                        className="w-full"
                        style={{ 
                          backgroundColor: tenant.settings.primaryColor,
                          color: tenant.settings.secondaryColor
                        }}
                      >
                        Sepete Ekle
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>

          {featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Henüz öne çıkan ürün eklenmemiş</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Hızlı Kargo</h3>
              <p className="text-gray-600">Siparişleriniz en kısa sürede kapınızda</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">256-bit SSL ile korunan ödeme sistemi</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">↩️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Kolay İade</h3>
              <p className="text-gray-600">14 gün içinde ücretsiz iade</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
