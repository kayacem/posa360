import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { SimpleBarChart } from '@/components/charts/SimpleBarChart'

export default async function MerchantDashboard() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const [productCount, orderCount, customerCount, pendingOrderCount] = await Promise.all([
    prisma.product.count({ where: { tenantId: tenantContext.id } }),
    prisma.order.count({ where: { tenantId: tenantContext.id } }),
    prisma.customer.count({ where: { tenantId: tenantContext.id } }),
    prisma.order.count({
      where: {
        tenantId: tenantContext.id,
        status: { in: ['PENDING', 'PREPARING'] },
      },
    }),
  ])

  const recentOrders = await prisma.order.findMany({
    where: { tenantId: tenantContext.id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const since = new Date(Date.now() - 30 * 86400000)
  const last30 = await prisma.order.findMany({
    where: { tenantId: tenantContext.id, createdAt: { gte: since } },
    select: { total: true, status: true, createdAt: true },
  })

  const dailyMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    dailyMap.set(key, 0)
  }
  for (const o of last30) {
    const key = o.createdAt.toISOString().slice(0, 10)
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) || 0) + o.total)
  }
  const dailyData = Array.from(dailyMap.entries()).map(([day, revenue]) => ({
    day: day.slice(5),
    revenue: Math.round(revenue * 100) / 100,
  }))

  const statusMap = new Map<string, number>()
  for (const o of last30) {
    statusMap.set(o.status, (statusMap.get(o.status) || 0) + o.total)
  }
  const statusData = Array.from(statusMap.entries()).map(([status, revenue]) => ({
    status,
    revenue: Math.round(revenue * 100) / 100,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Toplam Ürün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Toplam Sipariş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Bekleyen Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingOrderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Toplam Müşteri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customerCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Son 30 Gün Günlük Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={dailyData}
              xKey="day"
              bars={[{ key: 'revenue', color: '#0f766e', name: 'Ciro' }]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son 30 Gün Duruma Göre Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={statusData}
              xKey="status"
              bars={[{ key: 'revenue', color: '#1d4ed8', name: 'Ciro' }]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">#{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">
                    {order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : order.customerName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(order.total)}</div>
                  <div className="text-sm text-gray-500">{order.status}</div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-gray-500">Henüz sipariş yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
