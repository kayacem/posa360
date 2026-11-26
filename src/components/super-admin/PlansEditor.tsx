'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PlanRow = {
  id: string
  slug: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string
  maxProducts: number
  maxOrders: number
  maxStaff: number
  highlighted: boolean
  sortOrder: number
  isActive: boolean
}

export function PlansEditor({ initial }: { initial: PlanRow[] }) {
  const router = useRouter()
  const [plans, setPlans] = useState(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  function update(id: string, patch: Partial<PlanRow>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  async function save(plan: PlanRow) {
    setSaving(plan.id)
    setMsg('')
    try {
      let features: string[] = []
      try {
        features = JSON.parse(plan.features)
      } catch {
        features = plan.features.split('\n').map((s) => s.trim()).filter(Boolean)
      }
      const res = await fetch('/api/super-admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, features }),
      })
      if (!res.ok) throw new Error('Kayıt başarısız')
      setMsg(`${plan.name} kaydedildi`)
      router.refresh()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm text-teal-800">{msg}</p>}
      {plans.map((plan) => (
        <div key={plan.id} className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">
              {plan.name} <span className="text-sm text-gray-500">({plan.slug})</span>
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={plan.highlighted}
                onChange={(e) => update(plan.id, { highlighted: e.target.checked })}
              />
              Öne çıkan
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={plan.name}
              onChange={(e) => update(plan.id, { name: e.target.value })}
              placeholder="Ad"
            />
            <Input
              value={plan.description}
              onChange={(e) => update(plan.id, { description: e.target.value })}
              placeholder="Açıklama"
            />
            <Input
              type="number"
              value={plan.monthlyPrice}
              onChange={(e) => update(plan.id, { monthlyPrice: Number(e.target.value) })}
              placeholder="Aylık ₺"
            />
            <Input
              type="number"
              value={plan.yearlyPrice}
              onChange={(e) => update(plan.id, { yearlyPrice: Number(e.target.value) })}
              placeholder="Yıllık ₺"
            />
            <Input
              type="number"
              value={plan.maxProducts}
              onChange={(e) => update(plan.id, { maxProducts: Number(e.target.value) })}
              placeholder="Max ürün"
            />
            <Input
              type="number"
              value={plan.maxStaff}
              onChange={(e) => update(plan.id, { maxStaff: Number(e.target.value) })}
              placeholder="Max personel"
            />
          </div>
          <textarea
            className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
            rows={4}
            value={(() => {
              try {
                return JSON.parse(plan.features).join('\n')
              } catch {
                return plan.features
              }
            })()}
            onChange={(e) =>
              update(plan.id, {
                features: JSON.stringify(
                  e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                ),
              })
            }
            placeholder="Özellikler (satır satır)"
          />
          <Button className="mt-3" onClick={() => save(plan)} disabled={saving === plan.id}>
            {saving === plan.id ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      ))}
    </div>
  )
}
