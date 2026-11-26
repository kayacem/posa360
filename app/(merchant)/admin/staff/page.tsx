import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'
import { auth } from '@/lib/next-auth'
import { redirect } from 'next/navigation'
import { StaffManager } from '@/components/merchant/StaffManager'

export default async function StaffPage() {
  const session = await auth()
  const tenantContext = await getTenantContext()
  if (!tenantContext) return <div>Tenant bulunamadı</div>

  const role = session?.user?.role
  const membership = session?.user?.tenants?.[0]
  const canManage =
    role === 'TENANT_OWNER' ||
    role === 'TENANT_ADMIN' ||
    (membership?.permissions || []).includes('staff')

  if (!canManage) {
    redirect('/admin')
  }

  const staff = await prisma.tenantUser.findMany({
    where: { tenantId: tenantContext.id },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Personel Yönetimi</h1>
      <StaffManager
        initialStaff={staff.map((s) => ({
          id: s.id,
          role: s.role,
          permissions: s.permissions,
          user: s.user,
        }))}
      />
    </div>
  )
}
