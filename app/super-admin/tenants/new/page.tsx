import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { TenantCreateForm } from '@/components/super-admin/TenantCreateForm'

export default function NewTenantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/super-admin/tenants">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 ml-4">Yeni Tenant Oluştur</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <TenantCreateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
