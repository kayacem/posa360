'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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

const PAYMENT_METHODS = [
  {
    id: 'iyzico',
    name: 'iyzico',
    description: 'Kredi kartı ödemeleri için iyzico entegrasyonu',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'text' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
    ],
  },
  {
    id: 'paytr',
    name: 'PayTR',
    description: 'Kredi kartı ödemeleri için PayTR entegrasyonu',
    fields: [
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'merchantKey', label: 'Merchant Key', type: 'password' },
      { name: 'merchantSalt', label: 'Merchant Salt', type: 'password' },
    ],
  },
  {
    id: 'bank_transfer',
    name: 'Havale / EFT',
    description: 'Banka havalesi ile ödeme',
    fields: [],
  },
  {
    id: 'cash_on_delivery',
    name: 'Kapıda Ödeme',
    description: 'Teslimat sırasında nakit ödeme',
    fields: [],
  },
]

export function PaymentSettingsForm({ settings }: { settings: Record<string, any> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Record<string, PaymentProvider>>(
    PAYMENT_METHODS.reduce((acc, method) => {
      const existing = settings[method.id]
      acc[method.id] = {
        provider: method.id,
        isEnabled: existing?.isEnabled ?? (method.id === 'cash_on_delivery' || method.id === 'bank_transfer'),
        apiKey: existing?.apiKey || '',
        secretKey: existing?.secretKey || '',
        merchantId: existing?.merchantId || '',
        merchantKey: existing?.merchantKey || '',
        merchantSalt: existing?.merchantSalt || '',
        isTestMode: existing?.isTestMode ?? true,
      }
      return acc
    }, {} as Record<string, PaymentProvider>)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: Object.values(formData) }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Kaydetme başarısız')
      }

      router.refresh()
      alert('Ödeme ayarları başarıyla kaydedildi')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateProvider(providerId: string, updates: Partial<PaymentProvider>) {
    setFormData({
      ...formData,
      [providerId]: { ...formData[providerId], ...updates },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {PAYMENT_METHODS.map((method) => (
        <div key={method.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData[method.id].isEnabled}
                onChange={(e) =>
                  updateProvider(method.id, { isEnabled: e.target.checked })
                }
                className="w-4 h-4 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </div>
            {method.fields.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Test Modu</label>
                <input
                  type="checkbox"
                  checked={formData[method.id].isTestMode}
                  onChange={(e) =>
                    updateProvider(method.id, { isTestMode: e.target.checked })
                  }
                  disabled={!formData[method.id].isEnabled}
                  className="w-4 h-4"
                />
              </div>
            )}
          </div>

          {formData[method.id].isEnabled && method.fields.length > 0 && (
            <div className="space-y-3 pl-7 border-t pt-4">
              {method.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[method.id][field.name as keyof PaymentProvider] as string || ''}
                    onChange={(e) =>
                      updateProvider(method.id, { [field.name]: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder={`${field.label} giriniz`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

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
