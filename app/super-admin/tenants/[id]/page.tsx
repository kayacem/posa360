import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TenantActions } from '@/components/super-admin/TenantActions'
import { DomainBindingForm } from '@/components/super-admin/DomainBindingForm'

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { products: true, orders: true, customers: true },
      },
    },
  })

  if (!tenant) notFound()

  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0)
  const monthlyRevenue = orders
    .filter((o) => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0)

  const tenureDays = Math.floor((Date.now() - tenant.createdAt.getTime()) / (24 * 60 * 60 * 1000))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <p className="text-gray-500">Tenant CRM Detayı</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Genel Bilgiler</CardTitle>
                <TenantActions tenantId={tenant.id} currentStatus={tenant.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Şirket Adı</label>
                  <div className="font-medium">{tenant.companyName}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Slug</label>
                  <div className="font-medium">{tenant.slug}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">İletişim Kişisi</label>
                  <div className="font-medium">{tenant.contactPerson}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">E-posta</label>
                  <div className="font-medium">{tenant.contactEmail}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Telefon</label>
                  <div className="font-medium">{tenant.contactPhone}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vergi No</label>
                  <div className="font-medium">{tenant.taxNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm text-gray-500">Subdomain</label>
                <div className="font-medium">{tenant.slug}.posa360.com</div>
              </div>
              {tenant.customDomain ? (
                <div>
                  <label className="text-sm text-gray-500">Özel Domain</label>
                  <div className="font-medium">{tenant.customDomain}</div>
                  <div className="text-xs text-green-600 mt-1">✓ Doğrulanmış</div>
                </div>
              ) : (
                <DomainBindingForm tenantId={tenant.id} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Siparişler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(parseFloat(order.total.toString()))}</div>
                      <div className="text-sm text-gray-500">{order.status}</div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-sm">Henüz sipariş yok</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abonelik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Plan</label>
                <div className="font-medium capitalize">{tenant.plan}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Aylık Ücret</label>
                <div className="font-medium">{formatCurrency(tenant.monthlyFee)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Durum</label>
                <div
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    tenant.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tenant.status}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Son Ödeme</label>
                <div
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    tenant.lastPaymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {tenant.lastPaymentStatus}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Müşteri Süresi</label>
                <div className="font-medium">{tenureDays} gün</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Toplam Gelir</label>
                <div className="font-medium text-green-600">{formatCurrency(totalRevenue)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Son 30 Gün Gelir</label>
                <div className="font-medium">{formatCurrency(monthlyRevenue)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Ürün Sayısı</label>
                <div className="font-medium">{tenant._count.products}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Sipariş Sayısı</label>
                <div className="font-medium">{tenant._count.orders}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Müşteri Sayısı</label>
                <div className="font-medium">{tenant._count.customers}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Max Ürün:</span>
                <span className="font-medium">{tenant.maxProducts}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Sipariş:</span>
                <span className="font-medium">{tenant.maxOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Personel:</span>
                <span className="font-medium">{tenant.maxStaff}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
