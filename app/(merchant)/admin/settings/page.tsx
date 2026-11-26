import { getTenantContext } from '@/lib/tenant'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { BrandingEditor } from '@/components/merchant/BrandingEditor'

export default async function SettingsPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mağaza Ayarları</h1>

      <div className="space-y-6">
        <BrandingEditor
          initial={{
            name: tenantContext.name,
            primaryColor: tenantContext.settings.primaryColor || '#000000',
            secondaryColor: tenantContext.settings.secondaryColor || '#ffffff',
            logoUrl: tenantContext.settings.logoUrl || '',
            bannerUrl: tenantContext.settings.bannerUrl || '',
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            <CardTitle>Ödeme & Kargo</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link className="text-sm underline" href="/admin/settings/payment">
              Ödeme ayarları
            </Link>
            <Link className="text-sm underline" href="/admin/settings/shipping">
              Kargo ayarları
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
