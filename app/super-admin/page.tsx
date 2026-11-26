import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign,
  Settings,
  FileText 
} from 'lucide-react'

export default async function SuperAdminDashboard() {
  // Mock data - gerçek uygulamada database'den gelecek
  const stats = {
    totalTenants: 2,
    activeTenants: 2,
    totalRevenue: 898, // TRY
    monthlyRevenue: 898,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">POSA360</h1>
              <span className="ml-3 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                Super Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Cem Kaya</span>
              <Button variant="outline" size="sm">
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Platform genel görünümü</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Tenant
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTenants} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aylık Gelir
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Subscription ödemeleri
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gelir
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Müşteriler
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı firmalar
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/super-admin/tenants">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Store className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Tenant Yönetimi</CardTitle>
                <CardDescription>
                  Mağazaları yönet, yeni tenant ekle, domain ayarları
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/super-admin/crm">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>CRM & Müşteriler</CardTitle>
                <CardDescription>
                  Müşteri bilgileri, subscription takibi, ödeme durumu
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/super-admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Raporlar</CardTitle>
                <CardDescription>
                  Satış raporları, gelir analizi, tenant performansı
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/super-admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Settings className="h-8 w-8 text-gray-600 mb-2" />
                <CardTitle>Platform Ayarları</CardTitle>
                <CardDescription>
                  Genel ayarlar, planlar, limitler
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
