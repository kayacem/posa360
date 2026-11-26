import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { permissionDeniedResponse, requireTenantPermission } from '@/lib/permissions'

export async function GET() {
  try {
    const ctx = await requireTenantPermission('staff')
    const staff = await prisma.tenantUser.findMany({
      where: { tenantId: ctx.tenantId },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ staff })
  } catch (e) {
    return permissionDeniedResponse(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenantPermission('staff')
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const name = String(body.name || '').trim()
    const password = String(body.password || 'staff123')
    const permissions: string[] = Array.isArray(body.permissions)
      ? body.permissions.filter((p: string) => ['orders', 'products', 'settings', 'staff'].includes(p))
      : ['orders']

    if (!email || !name) {
      return NextResponse.json({ error: 'email and name required' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: ctx.tenantId } })
    const staffCount = await prisma.tenantUser.count({
      where: { tenantId: ctx.tenantId, role: 'TENANT_STAFF' },
    })
    if (tenant && staffCount >= tenant.maxStaff) {
      return NextResponse.json({ error: 'Staff limit reached' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: await hashPassword(password),
          role: 'TENANT_STAFF',
        },
      })
    }

    const membership = await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: ctx.tenantId, userId: user.id } },
      create: {
        tenantId: ctx.tenantId,
        userId: user.id,
        role: 'TENANT_STAFF',
        permissions,
      },
      update: {
        role: 'TENANT_STAFF',
        permissions,
      },
    })

    return NextResponse.json({ success: true, membership, user: { id: user.id, email, name } })
  } catch (e) {
    return permissionDeniedResponse(e)
  }
}
