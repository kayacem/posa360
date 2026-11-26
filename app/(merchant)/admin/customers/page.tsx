import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function CustomersPage() {
  const tenantContext = await getTenantContext()

  if (!tenantContext) {
    return <div>Tenant bulunamadı</div>
  }

  const customers = await prisma.customer.findMany({
    where: { tenantId: tenantContext.id },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Müşteriler</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sipariş Sayısı
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {customer._count.orders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Henüz müşteri bulunmuyor.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
