import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      tenants: Array<{
        tenantId: string
        tenantSlug: string
        role: string
        permissions: string[]
      }>
    } & DefaultSession['user']
  }

  interface User {
    role: string
    tenants: Array<{
      tenantId: string
      tenantSlug: string
      role: string
      permissions: string[]
    }>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    tenants: Array<{
      tenantId: string
      tenantSlug: string
      role: string
      permissions: string[]
    }>
  }
}
