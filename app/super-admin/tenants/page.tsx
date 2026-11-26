import Link from 'next/link'
import { db } from '@/prisma/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Plus, Store, Globe, Calendar, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TenantsPage() {
  // @ts-expect-error Prisma 8 API
  const tenants = await db.orm.public.Tenant.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/super-admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Yönetimi</h1>
            </div>
            <Link href="/super-admin/tenants/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Tenant
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {tenants.map((tenant: any) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{tenant.name}</CardTitle>
                      <Badge 
                        variant={tenant.status === 'ACTIVE' ? 'success' : 'destructive'}
                      >
                        {tenant.status}
                      </Badge>
                      <Badge variant="outline">{tenant.plan}</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        <span>{tenant.slug}</span>
                      </div>
                      {tenant.customDomain && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <span>{tenant.customDomain}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Müşteri: {formatDate(tenant.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/super-admin/tenants/${tenant.id}`}>
                      <Button variant="outline" size="sm">
                        Detaylar
                      </Button>
                    </Link>
                    <Link href={`http://${tenant.slug}.localhost:43210`} target="_blank">
                      <Button variant="secondary" size="sm">
                        Mağazayı Görüntüle
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">İletişim Bilgileri</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Firma:</strong> {tenant.companyName || '-'}</p>
                      <p><strong>Yetkili:</strong> {tenant.contactPerson || '-'}</p>
                      <p><strong>E-posta:</strong> {tenant.contactEmail || '-'}</p>
                      <p><strong>Telefon:</strong> {tenant.contactPhone || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Vergi Bilgisi</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>VKN:</strong> {tenant.taxNumber || '-'}</p>
                      <p><strong>Adres:</strong> {tenant.address ? JSON.parse(tenant.address).il : '-'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Subscription</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Aylık Ücret:</strong> {formatCurrency(tenant.monthlyFee)}</p>
                      <p>
                        <strong>Durum:</strong>{' '}
                        <Badge 
                          variant={tenant.lastPaymentStatus === 'PAID' ? 'success' : 'warning'}
                          className="ml-1"
                        >
                          {tenant.lastPaymentStatus}
                        </Badge>
                      </p>
                      {tenant.lastPaymentDate && (
                        <p><strong>Son Ödeme:</strong> {formatDate(tenant.lastPaymentDate)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Limitler</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Max Ürün:</strong> {tenant.maxProducts}</p>
                      <p><strong>Max Sipariş:</strong> {tenant.maxOrders}</p>
                      <p><strong>Max Personel:</strong> {tenant.maxStaff}</p>
                    </div>
                  </div>
                </div>

                {tenant.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm"><strong>Notlar:</strong> {tenant.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tenants.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz tenant eklenmemiş</p>
              <Link href="/super-admin/tenants/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Tenant'ı Ekle
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
