import { auth } from '@/lib/next-auth'
import { authConfig } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AddressesPage() {
  const session = await await auth()
  if (!session || session.user.role !== 'CUSTOMER') redirect('/login')

  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const customer = await prisma.customer.findFirst({
    where: { tenantId: tenantContext.id, email: session.user.email! },
    include: { addresses: true },
  })

  if (!customer) return <div>Müşteri bulunamadı</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Adreslerim</h1>
        <Link href="/account/addresses/new">
          <Button>+ Yeni Adres</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customer.addresses.map((addr) => (
          <Card key={addr.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{addr.title}</div>
              {addr.isDefault && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Varsayılan</span>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{addr.firstName} {addr.lastName}</div>
              <div>{addr.phone}</div>
              <div>{addr.addressLine1}</div>
              {addr.addressLine2 && <div>{addr.addressLine2}</div>}
              <div>{addr.ilce}, {addr.il}</div>
              <div>{addr.postalCode}</div>
            </div>
          </Card>
        ))}
      </div>

      {customer.addresses.length === 0 && (
        <div className="text-center py-12 text-gray-500">Kayıtlı adres bulunmuyor</div>
      )}
    </div>
  )
}
