import { getTenantContext } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await getTenantContext()

  if (!tenant || tenant.type !== 'storefront') {
    return <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Mağaza Bulunamadı</h1>
      <p className="text-gray-600">Bu domain'e ait bir mağaza bulunamadı.</p>
      <Link href="/" className="inline-block mt-4">
        <Button>Ana Sayfaya Dön</Button>
      </Link>
    </div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header 
        className="border-b bg-white"
        style={{ borderBottomColor: tenant.settings.primaryColor + '20' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              {tenant.settings.logoUrl ? (
                <img 
                  src={tenant.settings.logoUrl} 
                  alt={tenant.name}
                  className="h-10 w-auto"
                />
              ) : (
                <span 
                  className="text-2xl font-bold"
                  style={{ color: tenant.settings.primaryColor }}
                >
                  {tenant.name}
                </span>
              )}
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-gray-600">
                Ana Sayfa
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-gray-600">
                Ürünler
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-gray-600">
                Kategoriler
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-gray-600">
                Hakkımızda
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button 
                  variant="default" 
                  size="icon"
                  style={{ 
                    backgroundColor: tenant.settings.primaryColor,
                    color: tenant.settings.secondaryColor
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-gray-50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">{tenant.name}</h3>
              <p className="text-sm text-gray-600">
                Güvenli alışverişin adresi
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kurumsal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">Hakkımızda</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yardım</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shipping" className="text-gray-600 hover:text-gray-900">Kargo & Teslimat</Link></li>
                <li><Link href="/returns" className="text-gray-600 hover:text-gray-900">İptal & İade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hesabım</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/account" className="text-gray-600 hover:text-gray-900">Hesabım</Link></li>
                <li><Link href="/account/orders" className="text-gray-600 hover:text-gray-900">Siparişlerim</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} {tenant.name}. Tüm hakları saklıdır.</p>
            <p className="mt-2 text-xs">Powered by POSA360</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
