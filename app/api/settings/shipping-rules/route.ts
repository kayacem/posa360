import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import prisma from '@/lib/db'

interface CarrierRule {
  name: string
  carrier: string
  cost: number
  isActive: boolean
}

interface FreeShipping {
  enabled: boolean
  threshold: number
}

export async function POST(req: NextRequest) {
  try {
    const tenantContext = await getTenantContext()
    if (!tenantContext) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 })
    }

    const { carrierRules, freeShipping }: {
      carrierRules: CarrierRule[]
      freeShipping: FreeShipping
    } = await req.json()

    // Delete existing rules
    await prisma.shippingRule.deleteMany({
      where: { tenantId: tenantContext.id },
    })

    // Create new carrier rules
    for (let i = 0; i < carrierRules.length; i++) {
      const rule = carrierRules[i]
      if (rule.isActive) {
        await prisma.shippingRule.create({
          data: {
            tenantId: tenantContext.id,
            name: rule.name,
            type: 'flat',
            cost: rule.cost,
            isActive: true,
            priority: i + 1,
          },
        })
      }
    }

    // Create free shipping rule if enabled
    if (freeShipping.enabled) {
      await prisma.shippingRule.create({
        data: {
          tenantId: tenantContext.id,
          name: 'Ücretsiz Kargo',
          type: 'free_shipping',
          minOrderAmount: freeShipping.threshold,
          cost: 0,
          isActive: true,
          priority: 0, // Highest priority
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
