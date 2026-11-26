import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

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

  const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Toplam Ürün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Toplam Sipariş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Bekleyen Siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingOrderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Toplam Müşteri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customerCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500">Henüz sipariş yok</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <div className="font-medium">#{order.orderNumber}</div>
                    <div className="text-sm text-gray-500">
                      {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.customerName || 'Misafir'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(parseFloat(order.total.toString()))}</div>
                    <div className="text-sm text-gray-500">{order.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
