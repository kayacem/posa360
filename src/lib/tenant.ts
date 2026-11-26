import { headers } from 'next/headers'
import prisma from './db'

export type TenantContext = {
  id: string
  slug: string
  name: string
  customDomain: string | null
  type: 'super-admin' | 'merchant-admin' | 'storefront'
  settings: {
    currency: string
    locale: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string | null
    bannerUrl: string | null
    taxRate: number
  }
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const headersList = await headers()
  const tenantType = headersList.get('x-tenant-type')
  
  if (tenantType === 'super-admin') {
    return {
      id: 'super-admin',
      slug: 'super-admin',
      name: 'POSA360 Super Admin',
      customDomain: null,
      type: 'super-admin',
    settings: {
      currency: 'TRY',
      locale: 'tr-TR',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      logoUrl: null,
      bannerUrl: null,
      taxRate: 0.2,
    },
  }
  }
  
  const tenantIdentifier = headersList.get('x-tenant-identifier')
  const isCustomDomain = headersList.get('x-tenant-custom-domain')
  
  if (!tenantIdentifier) {
    return null
  }
  
  // Tenant'ı bul - custom domain veya slug ile
  const tenant = await prisma.tenant.findFirst({
    where: isCustomDomain
      ? { customDomain: tenantIdentifier }
      : { slug: tenantIdentifier },
  })
  
  if (!tenant) {
    return null
  }
  
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    customDomain: tenant.customDomain,
    type: (tenantType as 'merchant-admin' | 'storefront') || 'storefront',
    settings: {
      currency: tenant.currency,
      locale: tenant.locale,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      logoUrl: tenant.logoUrl,
      bannerUrl: tenant.bannerUrl,
      taxRate: tenant.taxRate,
    },
  }
}

export async function getTenantIdentifier(): Promise<string | null> {
  const headersList = await headers()
  return headersList.get('x-tenant-identifier')
}

export async function getTenantType(): Promise<'super-admin' | 'merchant-admin' | 'storefront' | null> {
  const headersList = await headers()
  return headersList.get('x-tenant-type') as any
}
