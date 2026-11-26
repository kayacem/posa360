import { getTenantContext } from '@/lib/tenant'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function SettingsPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mağaza Ayarları</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mağaza Adı</label>
                <p className="text-gray-900">{tenantContext.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <p className="text-gray-900">{tenantContext.slug}</p>
              </div>
              {tenantContext.customDomain && (
                <div>
                  <label className="block text-sm font-medium mb-1">Özel Domain</label>
                  <p className="text-gray-900">{tenantContext.customDomain}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tema Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ana Renk</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: tenantContext.settings.primaryColor }}
                  />
                  <span className="text-gray-900">{tenantContext.settings.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Para Birimi</label>
                <p className="text-gray-900">{tenantContext.settings.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödeme & Kargo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Ödeme yöntemleri ve kargo ayarlarını buradan yönetebilirsiniz.
              (Yakında eklenecek)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
