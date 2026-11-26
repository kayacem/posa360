import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl mb-2">
              Siparişiniz Alındı!
            </CardTitle>
            <p className="text-gray-600">
              Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Sipariş Numaranız</p>
            <p className="text-2xl font-bold">ORD-DEMO-12345</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold mb-1">Hazırlanıyor</p>
              <p className="text-sm text-gray-600">Siparişiniz hazırlanacak</p>
            </div>
            <div className="p-4">
              <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold mb-1">Kargoya Verilecek</p>
              <p className="text-sm text-gray-600">1-2 iş günü içinde</p>
            </div>
            <div className="p-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold mb-1">Teslim Edilecek</p>
              <p className="text-sm text-gray-600">2-3 iş günü içinde</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Sırada Ne Var?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Sipariş onay e-postası gönderildi</li>
              <li>• Siparişiniz hazırlanacak</li>
              <li>• Kargoya verildiğinde bilgilendirileceksiniz</li>
              <li>• Takip numarası ile kargonuzu takip edebilirsiniz</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href="/account/orders" className="flex-1">
              <Button variant="outline" className="w-full">
                Siparişlerimi Görüntüle
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full">
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
