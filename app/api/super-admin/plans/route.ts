import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import prisma from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('UNAUTHORIZED')
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ plans })
  } catch {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const features = Array.isArray(body.features)
      ? JSON.stringify(body.features)
      : typeof body.features === 'string'
        ? body.features
        : '[]'

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? '',
        monthlyPrice: Number(body.monthlyPrice),
        yearlyPrice: Number(body.yearlyPrice),
        features,
        maxProducts: Number(body.maxProducts),
        maxOrders: Number(body.maxOrders ?? 1000),
        maxStaff: Number(body.maxStaff),
        highlighted: Boolean(body.highlighted),
        sortOrder: Number(body.sortOrder ?? 0),
        isActive: body.isActive !== false,
      },
    })
    return NextResponse.json({ plan })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
