'use client'

import { useMemo, useState } from 'react'

export type PlanCard = {
  slug: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  highlighted: boolean
  maxProducts: number
  maxStaff: number
}

function formatTry(n: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n)
}

export function PricingCards({
  plans,
  kayitBase,
}: {
  plans: PlanCard[]
  kayitBase: string
}) {
  const [yearly, setYearly] = useState(false)

  const sorted = useMemo(
    () => [...plans].sort((a, b) => a.monthlyPrice - b.monthlyPrice),
    [plans]
  )

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !yearly ? 'bg-teal-700 text-white' : 'text-slate-600'
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              yearly ? 'bg-teal-700 text-white' : 'text-slate-600'
            }`}
          >
            Yıllık <span className="ml-1 text-xs opacity-90">~%20 indirim</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {sorted.map((plan) => {
          const price = yearly ? plan.yearlyPrice / 12 : plan.monthlyPrice
          const href = `${kayitBase}?plan=${encodeURIComponent(plan.slug)}${
            yearly ? '&billing=yearly' : ''
          }`
          return (
            <div
              key={plan.slug}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm ${
                plan.highlighted
                  ? 'border-teal-600 ring-2 ring-teal-600/30 scale-[1.02]'
                  : 'border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold text-white">
                  En popüler
                </span>
              )}
              <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {formatTry(price)}
                </span>
                <span className="text-sm text-slate-500">/ay</span>
                {yearly && (
                  <p className="mt-1 text-xs text-teal-700">
                    Yıllık {formatTry(plan.yearlyPrice)} faturalandırılır
                  </p>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
                <li className="flex gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>
                    {plan.maxProducts} ürün · {plan.maxStaff} personel
                  </span>
                </li>
              </ul>
              <a
                href={href}
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-teal-700 text-white hover:bg-teal-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                14 gün ücretsiz dene
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
