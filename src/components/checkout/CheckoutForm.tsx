'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { TenantContext } from '@/lib/tenant'
import type { Cart } from '@/lib/cart'

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
]

interface CheckoutFormProps {
  tenant: TenantContext
  cart: Cart
}

export function CheckoutForm({ tenant, cart }: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    il: 'İstanbul',
    ilce: '',
    postalCode: '',
    paymentMethod: 'mock_card',
  })

  const shippingCost = cart.subtotal >= 500 ? 0 : 29.90
  const taxAmount = cart.subtotal * 0.20 // KDV %20
  const total = cart.subtotal + shippingCost + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create order via API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost,
          taxAmount,
          total,
        }),
      })

      if (response.ok) {
        const { orderId, orderNumber } = await response.json()
        
        // Simulate 3D Secure redirect
        if (formData.paymentMethod === 'mock_card') {
          router.push(`/checkout/payment?orderId=${orderId}&orderNumber=${orderNumber}`)
        } else {
          router.push(`/checkout/success?orderNumber=${orderNumber}`)
        }
      } else {
        alert('Sipariş oluşturulamadı')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Teslimat Adresi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ad *</label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Soyad *</label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">E-posta *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefon *</label>
                <Input
                  type="tel"
                  required
                  placeholder="5XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adres *</label>
              <Input
                required
                value={formData.addressLine1}
                onChange={(e) => updateField('addressLine1', e.target.value)}
                placeholder="Mahalle, Sokak, No"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adres Satır 2</label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => updateField('addressLine2', e.target.value)}
                placeholder="Daire, Kat (opsiyonel)"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">İl *</label>
                <select
                  required
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.il}
                  onChange={(e) => updateField('il', e.target.value)}
                >
                  {TURKISH_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">İlçe *</label>
                <Input
                  required
                  value={formData.ilce}
                  onChange={(e) => updateField('ilce', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Posta Kodu *</label>
                <Input
                  required
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Yöntemi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="mock_card"
                checked={formData.paymentMethod === 'mock_card'}
                onChange={(e) => updateField('paymentMethod', e.target.value)}
              />
              <div className="flex-1">
                <p className="font-semibold">Kredi Kartı / Banka Kartı</p>
                <p className="text-sm text-gray-600">Güvenli 3D Secure ile ödeme</p>
              </div>
              <Badge>Demo</Badge>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={(e) => updateField('paymentMethod', e.target.value)}
              />
              <div className="flex-1">
                <p className="font-semibold">Havale / EFT</p>
                <p className="text-sm text-gray-600">Banka hesabına transfer</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={formData.paymentMethod === 'cash_on_delivery'}
                onChange={(e) => updateField('paymentMethod', e.target.value)}
              />
              <div className="flex-1">
                <p className="font-semibold">Kapıda Ödeme</p>
                <p className="text-sm text-gray-600">Kargo ile ödeme</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Sipariş Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-2 pb-4 border-b">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity, tenant.settings.currency)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{formatCurrency(cart.subtotal, tenant.settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo</span>
                <span>
                  {shippingCost === 0 ? (
                    <Badge variant="success">Ücretsiz</Badge>
                  ) : (
                    formatCurrency(shippingCost, tenant.settings.currency)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>KDV (%20)</span>
                <span>{formatCurrency(taxAmount, tenant.settings.currency)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam</span>
                <span>{formatCurrency(total, tenant.settings.currency)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: tenant.settings.primaryColor,
                color: tenant.settings.secondaryColor
              }}
            >
              {isSubmitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
            </Button>

            <p className="text-xs text-gray-600 text-center">
              Siparişinizi tamamlayarak{' '}
              <a href="/terms" className="underline">kullanım koşullarını</a>{' '}
              kabul etmiş olursunuz.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
