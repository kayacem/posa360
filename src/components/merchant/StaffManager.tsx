'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PERMS = [
  { id: 'orders', label: 'Siparişler' },
  { id: 'products', label: 'Ürünler' },
  { id: 'settings', label: 'Ayarlar' },
  { id: 'staff', label: 'Personel' },
]

type StaffRow = {
  id: string
  role: string
  permissions: string[]
  user: { id: string; email: string; name: string }
}

export function StaffManager({ initialStaff }: { initialStaff: StaffRow[] }) {
  const router = useRouter()
  const [staff] = useState(initialStaff)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('staff123')
  const [permissions, setPermissions] = useState<string[]>(['orders', 'products'])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function togglePerm(id: string) {
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/merchant/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, permissions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMessage('Personel eklendi')
      setName('')
      setEmail('')
      router.refresh()
    } catch (err: any) {
      setMessage(err.message || 'Hata')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Personel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {staff.map((s) => (
            <div key={s.id} className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">{s.user.name}</div>
                <div className="text-sm text-gray-500">{s.user.email}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{s.role}</div>
                <div className="text-gray-500">{s.permissions.join(', ') || '—'}</div>
              </div>
            </div>
          ))}
          {staff.length === 0 && <p className="text-sm text-gray-500">Henüz personel yok</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personel Davet Et / Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Ad Soyad</label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">E-posta</label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Geçici Şifre</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-2">Yetkiler</label>
              <div className="flex flex-wrap gap-3">
                {PERMS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={permissions.includes(p.id)}
                      onChange={() => togglePerm(p.id)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Ekleniyor…' : 'Personel Ekle'}
            </Button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
