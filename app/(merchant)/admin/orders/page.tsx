import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function OrdersPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const orders = await prisma.order.findMany({
    where: { tenantId: tenantContext.tenant.id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Siparişler</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} data-testid="order-row" className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.customer?.name || 'Misafir'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(parseFloat(order.totalAmount.toString()))}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Henüz sipariş bulunmuyor.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
