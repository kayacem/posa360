import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShippingRulesForm } from '@/components/merchant/ShippingRulesForm'

export default async function ShippingSettingsPage() {
  const tenantContext = await getTenantContext()
  
  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const shippingRules = await prisma.shippingRule.findMany({
    where: { tenantId: tenantContext.id },
    orderBy: { priority: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kargo Ayarları</h1>
        <p className="text-gray-500 mt-2">
          Kargo firmalarının fiyatlarını ve ücretsiz kargo eşiğini yapılandırın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kargo Kuralları</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingRulesForm rules={shippingRules} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mevcut Kargo Kuralları</CardTitle>
        </CardHeader>
        <CardContent>
          {shippingRules.length === 0 ? (
            <p className="text-gray-500">Henüz kargo kuralı tanımlanmamış.</p>
          ) : (
            <div className="space-y-3">
              {shippingRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 border rounded ${
                    rule.isActive ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-gray-600">
                        Tip: {rule.type === 'flat' ? 'Sabit Ücret' : 
                             rule.type === 'free_shipping' ? 'Ücretsiz Kargo' : 
                             rule.type}
                      </p>
                      {rule.type === 'flat' && (
                        <p className="text-sm">Ücret: ₺{rule.cost.toFixed(2)}</p>
                      )}
                      {rule.type === 'free_shipping' && rule.minOrderAmount && (
                        <p className="text-sm">
                          Minimum Sipariş: ₺{rule.minOrderAmount.toFixed(2)}
                        </p>
                      )}
                      {rule.maxWeight && (
                        <p className="text-sm">Maksimum Ağırlık: {rule.maxWeight} kg</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Öncelik: {rule.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
