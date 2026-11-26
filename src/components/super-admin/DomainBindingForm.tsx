'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function DomainBindingForm({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/domain/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      if (!res.ok) throw new Error('Domain doğrulama token oluşturulamadı')

      const data = await res.json()
      setVerificationToken(data.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/domain/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, token: verificationToken }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Doğrulama başarısız')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Özel Domain</label>
        <div className="flex gap-2">
          <Input
            placeholder="ornek.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={!!verificationToken}
          />
          {!verificationToken && (
            <Button onClick={handleGenerate} disabled={!domain || loading}>
              Oluştur
            </Button>
          )}
        </div>
      </div>

      {verificationToken && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <p className="text-sm font-medium">DNS kayıtlarını ekleyin:</p>
          
          <div className="bg-white p-3 rounded border space-y-2 text-sm font-mono">
            <div>
              <strong>A Record:</strong>
              <div className="text-gray-600">Type: A</div>
              <div className="text-gray-600">Host: @</div>
              <div className="text-gray-600">Value: 1.2.3.4 (sunucu IP'niz)</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded border space-y-2 text-sm font-mono">
            <div>
              <strong>TXT Record (Doğrulama):</strong>
              <div className="text-gray-600">Type: TXT</div>
              <div className="text-gray-600">Host: _posa360-verification</div>
              <div className="text-gray-600 break-all">Value: {verificationToken}</div>
            </div>
          </div>

          <Button onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? 'Doğrulanıyor...' : 'Doğrula'}
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded text-sm">{error}</div>
      )}
    </div>
  )
}
