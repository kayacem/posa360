'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  initial: {
    name: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    bannerUrl: string
  }
}

export function BrandingEditor({ initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/merchant/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'failed')
      }
      setMessage('Marka ayarları kaydedildi')
      router.refresh()
    } catch (err: any) {
      setMessage(err.message || 'Hata')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tema / Marka Editörü</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Mağaza Adı</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Ana Renk</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-14 p-1"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm">İkincil Renk</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-14 p-1"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                />
                <Input
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm">Logo URL</label>
            <Input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm">Banner URL</label>
            <Input
              value={form.bannerUrl}
              onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
