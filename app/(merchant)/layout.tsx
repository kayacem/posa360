import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import Link from 'next/link'

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session || !['TENANT_OWNER', 'TENANT_STAFF'].includes(session.user.role)) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/admin/products" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Ürünler
              </Link>
              <Link href="/admin/orders" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Siparişler
              </Link>
              <Link href="/admin/returns" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                İadeler
              </Link>
              <Link href="/admin/coupons" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Kuponlar
              </Link>
              <Link href="/admin/customers" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Müşteriler
              </Link>
              <Link href="/admin/settings" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                Ayarlar
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.name}</span>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                  Çıkış
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
