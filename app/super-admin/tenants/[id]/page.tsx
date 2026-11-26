import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TenantActions } from '@/components/super-admin/TenantActions'
import { DomainBindingForm } from '@/components/super-admin/DomainBindingForm'
import { TenantCrmForm } from '@/components/super-admin/TenantCrmForm'
import { TenantPaymentsPanel } from '@/components/super-admin/TenantPaymentsPanel'
import { SimpleBarChart } from '@/components/charts/SimpleBarChart'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true, orders: true, customers: true },
      },
      tenantPayments: {
        orderBy: { period: 'desc' },
        take: 12,
      },
    },
  })

  if (!tenant) notFound()

  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const allOrders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    select: { total: true, createdAt: true },
  })

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0)
  const monthlyRevenue = allOrders
    .filter((o) => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, o) => sum + o.total, 0)

  const tenureDays = Math.floor((Date.now() - tenant.createdAt.getTime()) / (24 * 60 * 60 * 1000))
  const tenureMonths = Math.max(0, Math.floor(tenureDays / 30))

  const paymentChart = [...tenant.tenantPayments]
    .reverse()
    .map((p) => ({
      period: p.period,
      amount: p.status === 'PAID' ? p.amount : 0,
      due: p.amount,
    }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <p className="text-gray-500">
          Tenant CRM Detayı · {tenureMonths} ay / {tenureDays} gün müşteri
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>CRM Bilgileri</CardTitle>
                <TenantActions tenantId={tenant.id} currentStatus={tenant.status} />
              </div>
            </CardHeader>
            <CardContent>
              <TenantCrmForm
                tenantId={tenant.id}
                initial={{
                  companyName: tenant.companyName || '',
                  contactPerson: tenant.contactPerson || '',
                  contactEmail: tenant.contactEmail || '',
                  contactPhone: tenant.contactPhone || '',
                  taxNumber: tenant.taxNumber || '',
                  address: tenant.address || '',
                  monthlyFee: tenant.monthlyFee,
                  plan: tenant.plan,
                }}
              />
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
              <CardTitle>Aylık Ödeme Geçmişi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SimpleBarChart
                data={paymentChart}
                xKey="period"
                bars={[
                  { key: 'amount', color: '#16a34a', name: 'Tahsil' },
                  { key: 'due', color: '#94a3b8', name: 'Beklenen' },
                ]}
              />
              <TenantPaymentsPanel
                tenantId={tenant.id}
                payments={tenant.tenantPayments.map((p) => ({
                  id: p.id,
                  period: p.period,
                  amount: p.amount,
                  status: p.status,
                  paidAt: p.paidAt?.toISOString() || null,
                  dueDate: p.dueDate.toISOString(),
                }))}
              />
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
                      <div className="font-medium">{formatCurrency(order.total)}</div>
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
                      : tenant.lastPaymentStatus === 'OVERDUE'
                        ? 'bg-red-100 text-red-800'
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
                <div className="font-medium">
                  {tenureMonths} ay ({tenureDays} gün)
                </div>
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
