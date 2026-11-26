import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PlatformHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">POSA360</h1>
          <p className="text-xl text-gray-600">
            Çok Kiracılı E-Ticaret Platformu
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Super Admin Paneli</CardTitle>
              <CardDescription>
                Tenant yönetimi, CRM, raporlama
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/super-admin">
                <Button className="w-full">Super Admin Girişi</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mağaza Yönetimi</CardTitle>
              <CardDescription>
                Ürün, sipariş ve müşteri yönetimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="http://shopmagaza.localhost:43210/admin" className="block">
                  <Button variant="outline" className="w-full">
                    Shop Mağaza Admin
                  </Button>
                </Link>
                <Link href="http://admin.shopcem.local:43210" className="block">
                  <Button variant="outline" className="w-full">
                    Elektronik Dünyası Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Mağazalar (Storefront)</CardTitle>
            <CardDescription>
              Müşteri görünümü - Alışveriş deneyimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Subdomain Routing:</p>
                <Link href="http://shopmagaza.localhost:43210" className="block">
                  <Button variant="secondary" className="w-full">
                    Shop Mağaza
                  </Button>
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Custom Domain:</p>
                <Link href="http://shopcem.local:43210" className="block">
                  <Button variant="secondary" className="w-full">
                    Elektronik Dünyası
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Demo Kullanıcılar</h3>
          <div className="text-sm space-y-1 text-gray-700">
            <p><strong>Super Admin:</strong> admin@posa360.com / admin123</p>
            <p><strong>Merchant 1:</strong> ahmet@shopmagaza.com / merchant123</p>
            <p><strong>Merchant 2:</strong> mehmet@elektronikdunya.com / merchant123</p>
            <p><strong>Müşteri:</strong> musteri@example.com / customer123</p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Custom domain test için <code className="bg-gray-200 px-2 py-1 rounded">/etc/hosts</code> dosyanıza ekleyin:
          </p>
          <code className="block mt-2 bg-gray-800 text-white p-2 rounded">
            127.0.0.1 shopcem.local<br />
            127.0.0.1 admin.shopcem.local
          </code>
        </div>
      </div>
    </div>
  )
}
