'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    photoUrl: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/customer/returns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...formData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'İade talebi oluşturulamadı')
      }

      router.push('/account/orders')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İade Talebi Oluştur</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>İade Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">İade Sebebi *</label>
              <select
                required
                className="w-full border rounded-md p-2"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="">Seçiniz</option>
                <option value="defective">Ürün Kusurlu</option>
                <option value="wrong_item">Yanlış Ürün Geldi</option>
                <option value="not_as_described">Açıklamaya Uygun Değil</option>
                <option value="changed_mind">Vazgeçtim</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama *</label>
              <textarea
                required
                className="w-full border rounded-md p-2 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="İade sebebinizi detaylı açıklayın..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fotoğraf URL (Opsiyonel)</label>
              <Input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://ornek.com/foto.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ürün kusuru varsa fotoğraf eklemeniz işlemi hızlandırır
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'İade Talebi Gönder'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
