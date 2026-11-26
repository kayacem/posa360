/**
 * Production seed: optional SUPER_ADMIN only.
 * Env: SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD, SEED_SUPER_ADMIN_NAME
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

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
