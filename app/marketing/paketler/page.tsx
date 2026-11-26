import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PricingCards, type PlanCard } from '@/components/marketing/PricingCards'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Paketler ve Fiyatlar',
  description: 'POSA360 e-ticaret paketleri — Başlangıç, Profesyonel ve Kurumsal. Aylık veya yıllık faturalama.',
}

const APP =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://app.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN.split(':')[0]}`
    : 'http://localhost:43210')

const FAQ = [
  {
    q: 'Yıllık ödemede ne kadar kazanırım?',
    a: 'Yıllık planda yaklaşık %20 indirim uygulanır; tutar peşin tahsil edilir.',
  },
  {
    q: 'Paket sonradan yükseltilebilir mi?',
    a: 'Evet. Super admin veya destek üzerinden plan değişikliği yapılabilir; limitler yeni plana göre güncellenir.',
  },
  {
    q: 'Fiyatlar kesin mi?',
    a: 'Şu anki tutarlar yer tutucudur; canlı fiyatlar duyurulunca panelden güncellenir.',
  },
]

export default async function PaketlerPage() {
  const rows = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  const plans: PlanCard[] = rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    features: safeFeatures(p.features),
    highlighted: p.highlighted,
    maxProducts: p.maxProducts,
    maxStaff: p.maxStaff,
  }))

  const allFeatures = Array.from(new Set(plans.flatMap((p) => p.features)))

  return (
    <MarketingShell active="paketler">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Paketler</h1>
          <p className="mt-3 text-slate-600">
            İhtiyacına göre ölçeklen. Tüm paketlerde 14 gün deneme.
          </p>
          <p className="mt-2 text-xs text-amber-800/80">
            Fiyatlar yer tutucudur — nihai tutarlar sahibi tarafından belirlenecektir.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards plans={plans} kayitBase={`${APP.replace(/\/$/, '')}/kayit`} />
        </div>

        {/* Comparison */}
        <div className="mt-20 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Özellik</th>
                {plans.map((p) => (
                  <th key={p.slug} className="px-4 py-3 font-semibold text-slate-900">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-600">Ürün limiti</td>
                {plans.map((p) => (
                  <td key={p.slug} className="px-4 py-3 font-medium">
                    {p.maxProducts}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-600">Personel</td>
                {plans.map((p) => (
                  <td key={p.slug} className="px-4 py-3 font-medium">
                    {p.maxStaff}
                  </td>
                ))}
              </tr>
              {allFeatures.map((feat) => (
                <tr key={feat} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{feat}</td>
                  {plans.map((p) => (
                    <td key={p.slug} className="px-4 py-3">
                      {p.features.includes(feat) ? (
                        <span className="text-teal-700">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold">SSS</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

function safeFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}
