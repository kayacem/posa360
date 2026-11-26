import { getTenantContext } from '@/lib/tenant'
import { db } from '@/prisma/db'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductImages } from '@/components/product/ProductImages'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Star, Truck, RotateCcw, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantContext()
  
  if (!tenant) {
    notFound()
  }

  // For demo: mock product data
  const product = {
    id: 'demo-product-1',
    name: 'Premium Ürün - ' + params.slug,
    slug: params.slug,
    description: 'Bu ürün demo amaçlı gösterilmektedir. Gerçek veritabanı bağlantısı ile tüm ürün bilgileri gösterilecektir.',
    shortDesc: 'Yüksek kaliteli, modern tasarım',
    price: 299.90,
    compareAtPrice: 399.90,
    stock: 50,
    sku: 'PRD-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', altText: 'Ürün görseli 1' },
      { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', altText: 'Ürün görseli 2' },
    ],
    hasVariants: true,
    variants: [
      { id: 'var-1', name: 'Küçük', price: 299.90, stock: 20, options: JSON.stringify({ Beden: 'S' }) },
      { id: 'var-2', name: 'Orta', price: 299.90, stock: 15, options: JSON.stringify({ Beden: 'M' }) },
      { id: 'var-3', name: 'Büyük', price: 299.90, stock: 15, options: JSON.stringify({ Beden: 'L' }) },
    ]
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <ProductImages images={product.images} />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold">
              {formatCurrency(product.price, tenant.settings.currency)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.compareAtPrice!, tenant.settings.currency)}
                </span>
                <Badge variant="destructive">
                  %{discountPercentage} İndirim
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(127 değerlendirme)</span>
          </div>

          {product.stock > 0 ? (
            <Badge variant="success" className="mb-6">
              Stokta {product.stock} adet
            </Badge>
          ) : (
            <Badge variant="outline" className="mb-6">
              Stokta Yok
            </Badge>
          )}

          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {product.shortDesc}
            </p>
          </div>

          {/* Add to Cart */}
          <AddToCartButton 
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.images[0]?.url,
              sku: product.sku,
            }}
            variants={product.hasVariants ? product.variants : undefined}
            tenantColor={tenant.settings.primaryColor}
          />

          {/* Features */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold">Hızlı Kargo</p>
                <p className="text-sm text-gray-600">2-3 iş günü içinde teslimat</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold">Kolay İade</p>
                <p className="text-sm text-gray-600">14 gün içinde ücretsiz iade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold">Güvenli Alışveriş</p>
                <p className="text-sm text-gray-600">256-bit SSL şifreleme</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Ürün Açıklaması</h2>
        <div className="prose max-w-none">
          <p>{product.description}</p>
        </div>
      </Card>
    </div>
  )
}
