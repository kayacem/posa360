import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

interface PaymentProvider {
  provider: string
  isEnabled: boolean
  apiKey?: string
  secretKey?: string
  merchantId?: string
  merchantKey?: string
  merchantSalt?: string
  isTestMode: boolean
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
      await prisma.paymentSetting.upsert({
        where: {
          tenantId_provider: {
            tenantId: tenantContext.id,
            provider: setting.provider,
          },
        },
        update: {
          isEnabled: setting.isEnabled,
          apiKey: setting.apiKey || null,
          secretKey: setting.secretKey || null,
          merchantId: setting.merchantId || null,
          merchantKey: setting.merchantKey || null,
          merchantSalt: setting.merchantSalt || null,
          isTestMode: setting.isTestMode,
        },
        create: {
          tenantId: tenantContext.id,
          provider: setting.provider,
          isEnabled: setting.isEnabled,
          apiKey: setting.apiKey || null,
          secretKey: setting.secretKey || null,
          merchantId: setting.merchantId || null,
          merchantKey: setting.merchantKey || null,
          merchantSalt: setting.merchantSalt || null,
          isTestMode: setting.isTestMode,
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
