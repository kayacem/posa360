/**
 * Production seed (idempotent): 3 plans if missing + optional SUPER_ADMIN.
 * Env: SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD, SEED_SUPER_ADMIN_NAME
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// --- Plans: create the 3 packages only if missing (never overwrite owner-edited prices) ---
// Prices are placeholders; the owner edits them in super admin.
const PLANS = [
  {
    slug: 'baslangic', name: 'Başlangıç', description: 'Yeni mağazalar için sade başlangıç.',
    monthlyPrice: 990, yearlyPrice: 9504,
    features: ['Kendi subdomain', 'Sipariş & iade yönetimi', 'iyzico / havale', 'CSV ürün yükleme', 'Temel tema'],
    maxProducts: 100, maxOrders: 1000, maxStaff: 2, highlighted: false, sortOrder: 1,
  },
  {
    slug: 'profesyonel', name: 'Profesyonel', description: 'Büyüyen markalar için tam operasyon.',
    monthlyPrice: 1990, yearlyPrice: 19104,
    features: ['Özel domain', 'Sipariş–iade–kargo tek panel', 'iyzico / PayTR / kapıda', 'Yurtiçi / Aras / MNG / Sürat / PTT', 'Personel yetkileri', 'Tema düzenleyici', 'CSV toplu yükleme'],
    maxProducts: 2000, maxOrders: 20000, maxStaff: 10, highlighted: true, sortOrder: 2,
  },
  {
    slug: 'kurumsal', name: 'Kurumsal', description: 'Yüksek hacim ve ekip için.',
    monthlyPrice: 3990, yearlyPrice: 38304,
    features: ['Profesyonel’deki her şey', 'Öncelikli destek', 'Yüksek limitler', 'Çoklu personel', 'Gelişmiş raporlar'],
    maxProducts: 20000, maxOrders: 200000, maxStaff: 50, highlighted: false, sortOrder: 3,
  },
]
for (const p of PLANS) {
  const exists = await prisma.plan.findUnique({ where: { slug: p.slug } })
  if (exists) continue
  await prisma.plan.create({ data: { ...p, features: JSON.stringify(p.features) } })
  console.log(`✅ Plan created: ${p.name}`)
}

const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim()
const password = process.env.SEED_SUPER_ADMIN_PASSWORD
const name = process.env.SEED_SUPER_ADMIN_NAME?.trim() || 'Super Admin'

if (!email || !password) {
  console.log('⏭  SEED_SUPER_ADMIN_EMAIL/PASSWORD not set — skipping')
  process.exit(0)
}

const existing = await prisma.user.findUnique({ where: { email } })
if (existing) {
  console.log(`⏭  Super admin already exists: ${email}`)
  await prisma.$disconnect()
  process.exit(0)
}

await prisma.user.create({
  data: {
    email,
    name,
    password: await bcrypt.hash(password, 12),
    role: 'SUPER_ADMIN',
  },
})
console.log(`✅ Super admin created: ${email}`)
await prisma.$disconnect()
