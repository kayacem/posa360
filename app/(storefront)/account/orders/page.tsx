import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function CustomerOrdersPage() {
  const session = await await auth()
  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login')
  }

  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const customer = await prisma.customer.findFirst({
    where: {
      tenantId: tenantContext.id,
      email: session.user.email!,
    },
  })

  if (!customer) return <div>Müşteri bulunamadı</div>

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold">Sipariş #{order.orderNumber}</div>
                <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(parseFloat(order.total.toString()))}</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.product.images[0] && (
                    <img src={item.product.images[0].url} alt="" className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-500">{item.quantity} adet</div>
                  </div>
                  <div>{formatCurrency(parseFloat(item.total.toString()))}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Link href={`/account/orders/${order.id}`}>
                <button className="text-sm text-blue-600 hover:underline">Detay</button>
              </Link>
              {order.status === 'DELIVERED' && (
                <Link href={`/account/returns/new?orderId=${order.id}`}>
                  <button className="text-sm text-blue-600 hover:underline">İade Talebi</button>
                </Link>
              )}
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Henüz siparişiniz bulunmuyor.
          </div>
        )}
      </div>
    </div>
  )
}
