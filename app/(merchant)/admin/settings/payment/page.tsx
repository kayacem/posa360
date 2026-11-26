import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PaymentSettingsForm } from '@/components/merchant/PaymentSettingsForm'

export default async function PaymentSettingsPage() {
  const tenantContext = await getTenantContext()
  
  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const paymentSettings = await prisma.paymentSetting.findMany({
    where: { tenantId: tenantContext.id },
  })

  // Convert to map for easier access
  const settingsMap = paymentSettings.reduce((acc, setting) => {
    acc[setting.provider] = setting
    return acc
  }, {} as Record<string, any>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ödeme Ayarları</h1>
        <p className="text-gray-500 mt-2">
          Ödeme yöntemlerini aktif/pasif yapın ve API bilgilerini yapılandırın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ödeme Yöntemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentSettingsForm settings={settingsMap} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Güvenlik Notu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Önemli:</strong> API anahtarlarınızı güvenli bir şekilde saklayın.
              Bu bilgiler şifrelenerek veritabanında tutulur.
            </p>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• iyzico için: API Key ve Secret Key gereklidir</li>
              <li>• PayTR için: Merchant ID, Merchant Key ve Merchant Salt gereklidir</li>
              <li>• Test modunu aktif ederek sandbox ortamında test edebilirsiniz</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
