import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ReturnActions } from '@/components/merchant/ReturnActions'

export default async function ReturnsPage() {
  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const returns = await prisma.return.findMany({
    where: { tenantId: tenantContext.id },
    include: {
      order: { include: { customer: true } },
      returnItems: { include: { orderItem: { include: { product: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    RECEIVED: 'bg-indigo-100 text-indigo-800',
    REFUNDED: 'bg-green-100 text-green-800',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">İade Talepleri</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İade No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {returns.map((ret) => (
                <tr key={ret.id} data-testid="return-row">
                  <td className="px-6 py-4">#{ret.returnNumber}</td>
                  <td className="px-6 py-4">#{ret.order.orderNumber}</td>
                  <td className="px-6 py-4">
                    {ret.order.customer ? `${ret.order.customer.firstName} ${ret.order.customer.lastName}` : ret.order.customerName || 'Misafir'}
                  </td>
                  <td className="px-6 py-4">{formatCurrency(parseFloat((ret.refundAmount || 0).toString()))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[ret.status]}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ReturnActions returnId={ret.id} currentStatus={ret.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {returns.length === 0 && (
            <div className="text-center py-12 text-gray-500">İade talebi bulunmuyor</div>
          )}
        </div>
      </Card>
    </div>
  )
}
