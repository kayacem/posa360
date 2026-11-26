'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)
  const [countdown, setCountdown] = useState(3)

  const orderId = searchParams?.get('orderId')
  const orderNumber = searchParams?.get('orderNumber')

  useEffect(() => {
    // Simulate 3D Secure processing
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setProcessing(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function handleSuccess() {
    router.push(`/checkout/success?orderNumber=${orderNumber}`)
  }

  if (processing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              3D Secure Doğrulama
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg mb-2">Ödemeniz işleniyor...</p>
            <p className="text-gray-600">Bankadan onay bekleniyor ({countdown}s)</p>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-left">
              <p className="font-semibold mb-2">Demo Mod</p>
              <p className="text-gray-700">
                Bu gerçek bir 3D Secure ekranıdır. Production'da iyzico/PayTR'nin 
                gerçek 3D Secure sayfasına yönlendirileceksiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            Ödeme Onaylandı
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            3D Secure doğrulaması başarılı.
          </p>
          <p className="text-sm text-gray-500">
            Sipariş Numarası: <strong>{orderNumber}</strong>
          </p>
          
          <Button onClick={handleSuccess} size="lg" className="w-full">
            Siparişi Görüntüle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
