import { getCart } from '@/lib/cart'
import { getTenantContext } from '@/lib/tenant'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { CartItemRow } from '@/components/cart/CartItemRow'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const tenant = await getTenantContext()
  const cart = await getCart()

  if (!tenant) {
    return <div>Mağaza bulunamadı</div>
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Sepetiniz Boş</h1>
        <p className="text-gray-600 mb-8">
          Henüz sepetinize ürün eklemediniz.
        </p>
        <Link href="/products">
          <Button size="lg">Alışverişe Başla</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <CartItemRow key={`${item.productId}-${item.variantId || 'default'}`} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-semibold">
                    {formatCurrency(cart.subtotal, tenant.settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className="text-sm text-gray-500">Sonraki adımda hesaplanacak</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span>{formatCurrency(cart.total, tenant.settings.currency)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button 
                  className="w-full mb-3" 
                  size="lg"
                  style={{ 
                    backgroundColor: tenant.settings.primaryColor,
                    color: tenant.settings.secondaryColor
                  }}
                >
                  Alışverişi Tamamla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Alışverişe Devam Et
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <p className="flex items-center gap-2 mb-2">
                  <span>✓</span> Güvenli ödeme
                </p>
                <p className="flex items-center gap-2 mb-2">
                  <span>✓</span> Ücretsiz kargo (500 TL üzeri)
                </p>
                <p className="flex items-center gap-2">
                  <span>✓</span> 14 gün iade garantisi
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
