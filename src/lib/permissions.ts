import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'

export type StaffPermission = 'orders' | 'products' | 'settings' | 'staff'

export const ALL_STAFF_PERMISSIONS: StaffPermission[] = [
  'orders',
  'products',
  'settings',
  'staff',
]

export async function requireTenantPermission(
  permission: StaffPermission
): Promise<{
  userId: string
  tenantId: string
  role: string
  permissions: string[]
}> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED')
  }

  const role = session.user.role
  if (role === 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN')
  }

  const tenantMembership = session.user.tenants?.[0]
  if (!tenantMembership?.tenantId) {
    throw new Error('FORBIDDEN')
  }

  // Owners/admins get all permissions
  if (role === 'TENANT_OWNER' || role === 'TENANT_ADMIN') {
    return {
      userId: session.user.id,
      tenantId: tenantMembership.tenantId,
      role,
      permissions: [...ALL_STAFF_PERMISSIONS],
    }
  }

  if (role !== 'TENANT_STAFF') {
    throw new Error('FORBIDDEN')
  }

  const membership = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId: tenantMembership.tenantId,
        userId: session.user.id,
      },
    },
  })

  const permissions = membership?.permissions || []
  if (!permissions.includes(permission)) {
    throw new Error('FORBIDDEN')
  }

  return {
    userId: session.user.id,
    tenantId: tenantMembership.tenantId,
    role,
    permissions,
  }
}

export function permissionDeniedResponse(error: unknown) {
  const msg = error instanceof Error ? error.message : 'ERROR'
  if (msg === 'UNAUTHORIZED') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (msg === 'FORBIDDEN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return Response.json({ error: 'Server error' }, { status: 500 })
}
