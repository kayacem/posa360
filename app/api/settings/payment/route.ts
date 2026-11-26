import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

interface PaymentProvider {
  provider: string
  isActive: boolean
  apiKey?: string
  secretKey?: string
  merchantId?: string
  merchantKey?: string
  merchantSalt?: string
  isSandbox: boolean
}

export async function POST(req: NextRequest) {
  try {
    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const { settings }: { settings: PaymentProvider[] } = await req.json()

    // Update or create each payment setting
    for (const setting of settings) {
      const credentials = JSON.stringify({
        apiKey: setting.apiKey,
        secretKey: setting.secretKey,
        merchantId: setting.merchantId,
        merchantKey: setting.merchantKey,
        merchantSalt: setting.merchantSalt,
      })
      
      await prisma.paymentSetting.upsert({
        where: {
          tenantId_provider: {
            tenantId: tenantContext.id,
            provider: setting.provider,
          },
        },
        update: {
          isActive: setting.isActive,
          isSandbox: setting.isSandbox,
          credentials,
        },
        create: {
          tenantId: tenantContext.id,
          provider: setting.provider,
          isActive: setting.isActive,
          isSandbox: setting.isSandbox,
          credentials,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Kaydetme başarısız' },
      { status: 500 }
    )
  }
}
