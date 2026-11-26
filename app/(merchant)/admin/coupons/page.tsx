import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function CouponsPage() {
  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const coupons = await prisma.coupon.findMany({
    where: { tenantId: tenantContext.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İndirim Kuponları</h1>
        <Link href="/admin/coupons/new">
          <Button>+ Yeni Kupon</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İndirim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Geçerlilik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.type === 'percentage'
                      ? `%${coupon.value}`
                      : `₺${coupon.value}`}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.usageCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {coupon.startsAt ? formatDate(coupon.startsAt) : '-'} - {coupon.endsAt ? formatDate(coupon.endsAt) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="text-center py-12 text-gray-500">Henüz kupon oluşturulmamış</div>
          )}
        </div>
      </Card>
    </div>
  )
}
