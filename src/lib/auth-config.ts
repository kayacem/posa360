import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from './auth'
import prisma from './db'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            tenantUsers: {
              include: {
                tenant: true,
              },
            },
          },
        })

        if (!user || !await verifyPassword(password, user.password)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenants: user.tenantUsers.map(tu => ({
            tenantId: tu.tenantId,
            tenantSlug: tu.tenant.slug,
            role: tu.role,
          })),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.role = user.role || ''
        token.tenants = user.tenants || []
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenants = token.tenants as any[]
      }
      return session
    },
  },
} satisfies NextAuthConfig
