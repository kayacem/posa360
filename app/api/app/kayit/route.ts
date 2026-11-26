import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/db'
import { RESERVED_SIGNUP_SLUGS } from '@/lib/platform'

const RESERVED_SLUGS = RESERVED_SIGNUP_SLUGS

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const contactPerson = String(body.contactPerson || '').trim() || name
    const planSlug = String(body.plan || body.planSlug || 'baslangic').trim().toLowerCase()
    const billingInterval = body.billing === 'yearly' ? 'yearly' : 'monthly'
    let slug = String(body.slug || '').trim().toLowerCase() || slugify(name)

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { error: 'Mağaza adı, e-posta ve en az 8 karakter şifre gerekli' },
        { status: 400 }
      )
    }

    if (!/^[a-z0-9-]+$/.test(slug) || RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({ error: 'Geçersiz veya rezerve subdomain' }, { status: 400 })
    }

    const plan =
      (await prisma.plan.findUnique({ where: { slug: planSlug } })) ||
      (await prisma.plan.findFirst({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }))

    if (!plan) {
      return NextResponse.json({ error: 'Plan bulunamadı' }, { status: 400 })
    }

    const existingSlug = await prisma.tenant.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Bu subdomain kullanımda' }, { status: 409 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          status: 'TRIAL',
          plan: plan.slug,
          companyName: name,
          contactPerson,
          contactEmail: email,
          monthlyFee: billingInterval === 'yearly' ? plan.yearlyPrice / 12 : plan.monthlyPrice,
          maxProducts: plan.maxProducts,
          maxOrders: plan.maxOrders,
          maxStaff: plan.maxStaff,
          trialEndsAt,
          billingInterval,
        },
      })

      const user = await tx.user.create({
        data: {
          email,
          name: contactPerson,
          password: hashed,
          role: 'TENANT_OWNER',
          tenantUsers: {
            create: {
              tenantId: tenant.id,
              role: 'TENANT_OWNER',
              permissions: ['orders', 'products', 'settings', 'staff'],
            },
          },
        },
      })

      return { tenant, user, plan }
    })

    return NextResponse.json({
      success: true,
      tenantId: result.tenant.id,
      slug: result.tenant.slug,
      plan: result.plan.slug,
      trialEndsAt: result.tenant.trialEndsAt,
      loginHint: '/login',
    })
  } catch (error: any) {
    console.error('kayit error', error)
    return NextResponse.json({ error: error.message || 'Kayıt başarısız' }, { status: 500 })
  }
}
