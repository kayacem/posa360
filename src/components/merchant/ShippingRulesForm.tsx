'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ShippingRule {
  id: string
  name: string
  type: string
  cost: number
  minOrderAmount: number | null
  maxWeight: number | null
  isActive: boolean
  priority: number
}

const CARRIERS = [
  { value: 'yurtici', label: 'Yurtiçi Kargo' },
  { value: 'aras', label: 'Aras Kargo' },
  { value: 'mng', label: 'MNG Kargo' },
  { value: 'surat', label: 'Sürat Kargo' },
  { value: 'ptt', label: 'PTT Kargo' },
]

export function ShippingRulesForm({ rules }: { rules: ShippingRule[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    carrierRules: CARRIERS.map(carrier => ({
      name: carrier.label,
      carrier: carrier.value,
      cost: rules.find(r => r.name.toLowerCase().includes(carrier.value))?.cost || 29.90,
      isActive: rules.find(r => r.name.toLowerCase().includes(carrier.value))?.isActive ?? true,
    })),
    freeShipping: {
      enabled: rules.some(r => r.type === 'free_shipping' && r.isActive),
      threshold: rules.find(r => r.type === 'free_shipping')?.minOrderAmount || 500,
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/settings/shipping-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Kaydetme başarısız')
      }

      router.refresh()
      alert('Kargo ayarları başarıyla kaydedildi')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Kargo Firması Fiyatları</h3>
        <div className="space-y-3">
          {formData.carrierRules.map((carrier, index) => (
            <div key={carrier.carrier} className="flex items-center gap-4 p-3 border rounded">
              <input
                type="checkbox"
                checked={carrier.isActive}
                onChange={(e) => {
                  const newRules = [...formData.carrierRules]
                  newRules[index].isActive = e.target.checked
                  setFormData({ ...formData, carrierRules: newRules })
                }}
                className="w-4 h-4"
              />
              <label className="flex-1 font-medium">{carrier.name}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">₺</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={carrier.cost}
                  onChange={(e) => {
                    const newRules = [...formData.carrierRules]
                    newRules[index].cost = parseFloat(e.target.value) || 0
                    setFormData({ ...formData, carrierRules: newRules })
                  }}
                  disabled={!carrier.isActive}
                  className="w-24 px-3 py-2 border rounded disabled:bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Ücretsiz Kargo</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.freeShipping.enabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  freeShipping: { ...formData.freeShipping, enabled: e.target.checked },
                })
              }
              className="w-4 h-4"
            />
            <label className="font-medium">Ücretsiz kargo seçeneğini aktif et</label>
          </div>

          {formData.freeShipping.enabled && (
            <div className="flex items-center gap-3 pl-7">
              <label className="text-sm text-gray-600">Minimum sipariş tutarı:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">₺</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.freeShipping.threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      freeShipping: {
                        ...formData.freeShipping,
                        threshold: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-32 px-3 py-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
        </Button>
      </div>
    </form>
  )
}
