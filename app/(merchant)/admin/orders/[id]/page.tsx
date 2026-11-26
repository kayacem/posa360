import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { OrderStatusManager } from '@/components/merchant/OrderStatusManager'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      tenantId: tenantContext.id,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
        },
      },
      payments: true,
      shipments: true,
    },
  })

  if (!order) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Sipariş #{order.orderNumber}</h1>
          <p className="text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/orders/${order.id}/invoice-pdf`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            target="_blank"
          >
            📄 Fatura İndir
          </a>
          {order.shipments.length > 0 && (
            <a
              href={`/api/orders/${order.id}/label-pdf`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              target="_blank"
            >
              🏷️ Etiket İndir
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sipariş Durumu</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <OrderStatusManager orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      {item.variantName && (
                        <div className="text-sm text-gray-500">
                          Varyant: {item.variantName}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {item.quantity} adet × {formatCurrency(parseFloat(item.price.toString()))}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(parseFloat(item.total.toString()))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam:</span>
                  <span>{formatCurrency(parseFloat(order.subtotal.toString()))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kargo:</span>
                  <span>{formatCurrency(parseFloat(order.shippingCost.toString()))}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim:</span>
                    <span>-{formatCurrency(parseFloat(order.discountAmount.toString()))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>KDV (%20):</span>
                  <span>{formatCurrency(parseFloat(order.taxAmount.toString()))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Toplam:</span>
                  <span>{formatCurrency(parseFloat(order.total.toString()))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.shipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kargo Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Kargo Firması:</span>
                      <span className="font-medium">{shipment.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Takip Numarası:</span>
                      <span className="font-medium">{shipment.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Kargoya Verilme:</span>
                      <span>{formatDate(shipment.shippedAt!)}</span>
                    </div>
                    {shipment.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Teslim Tarihi:</span>
                        <span>{formatDate(shipment.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Ad Soyad</div>
                <div className="font-medium">
                  {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.customerName || 'Misafir'}
                </div>
              </div>
              {order.customer?.email && (
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <div className="font-medium">{order.customer.email}</div>
                </div>
              )}
              {order.customer?.phone && (
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <div className="font-medium">{order.customer.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teslimat Adresi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>{shippingAddress?.line1}</div>
                {shippingAddress?.line2 && <div>{shippingAddress.line2}</div>}
                <div>
                  {shippingAddress?.district}, {shippingAddress?.city}
                </div>
                <div>{shippingAddress?.postalCode}</div>
                <div>{shippingAddress?.country}</div>
              </div>
            </CardContent>
          </Card>

          {billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Fatura Adresi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>{billingAddress.line1}</div>
                  {billingAddress.line2 && <div>{billingAddress.line2}</div>}
                  <div>
                    {billingAddress.district}, {billingAddress.city}
                  </div>
                  <div>{billingAddress.postalCode}</div>
                  <div>{billingAddress.country}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ödeme Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.payments.length > 0 && order.payments[0].method && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ödeme Yöntemi:</span>
                  <span className="font-medium">{order.payments[0].method}</span>
                </div>
              )}
              {order.payments.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ödeme Durumu:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.payments[0].status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.payments[0].status}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
