import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/db'

const RESERVED_SLUGS = new Set([
  'www',
  'app',
  'admin',
  'mail',
  'panel',
  'api',
  'static',
  'login',
  'kayit',
  'super-admin',
  'platform',
])

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

    const existingSlug = await prisma.tenant.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Bu subdomain kullanımda' }, { status: 409 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          status: 'ACTIVE',
          plan: 'basic',
          companyName: name,
          contactPerson,
          contactEmail: email,
          monthlyFee: 0,
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

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      tenantId: result.tenant.id,
      slug: result.tenant.slug,
      loginHint: '/login',
    })
  } catch (error: any) {
    console.error('kayit error', error)
    return NextResponse.json({ error: error.message || 'Kayıt başarısız' }, { status: 500 })
  }
}
