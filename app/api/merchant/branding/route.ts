import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { permissionDeniedResponse, requireTenantPermission } from '@/lib/permissions'

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireTenantPermission('settings')
    const body = await req.json()

    const tenant = await prisma.tenant.update({
      where: { id: ctx.tenantId },
      data: {
        name: body.name ? String(body.name) : undefined,
        primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
        secondaryColor: body.secondaryColor ? String(body.secondaryColor) : undefined,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl || null) : undefined,
        bannerUrl: body.bannerUrl !== undefined ? (body.bannerUrl || null) : undefined,
      },
    })

    return NextResponse.json({ success: true, tenant })
  } catch (e) {
    return permissionDeniedResponse(e)
  }
}
