/**
 * Production seed: optional SUPER_ADMIN only (no demo tenants/orders).
 * Env:
 *   SEED_SUPER_ADMIN_EMAIL
 *   SEED_SUPER_ADMIN_PASSWORD
 *   SEED_SUPER_ADMIN_NAME (optional)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim()
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  const name = process.env.SEED_SUPER_ADMIN_NAME?.trim() || 'Super Admin'

  if (!email || !password) {
    console.log('⏭  SEED_SUPER_ADMIN_EMAIL/PASSWORD not set — skipping production seed')
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`⏭  Super admin already exists: ${email}`)
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role: 'SUPER_ADMIN',
    },
  })
  console.log(`✅ Super admin created: ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
