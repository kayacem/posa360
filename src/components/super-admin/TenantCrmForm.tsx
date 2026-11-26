'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  tenantId: string
  initial: {
    companyName: string
    contactPerson: string
    contactEmail: string
    contactPhone: string
    taxNumber: string
    address: string
    monthlyFee: number
    plan: string
  }
}

export function TenantCrmForm({ tenantId, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initial)
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/crm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('save failed')
      setMessage('Kaydedildi')
      router.refresh()
    } catch {
      setMessage('Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-500">Şirket Adı</label>
          <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">İletişim Kişisi</label>
          <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">E-posta</label>
          <Input value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">Telefon</label>
          <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">Vergi No</label>
          <Input value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-500">Aylık Ücret</label>
          <Input
            type="number"
            step="0.01"
            value={form.monthlyFee}
            onChange={(e) => set('monthlyFee', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Plan</label>
          <Input value={form.plan} onChange={(e) => set('plan', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-500">Adres</label>
          <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'CRM Kaydet'}
        </Button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </form>
  )
}
