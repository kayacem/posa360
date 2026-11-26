'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PLATFORM =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PLATFORM_DOMAIN?.split(':')[0]) ||
  'posa360.com'

export default function KayitPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onNameChange(value: string) {
    setName(value)
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      )
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/app/kayit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, contactPerson, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Kayıt başarısız')
      }

      const login = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (login?.error) {
        router.push('/login')
        return
      }

      // Merchant panel on their store subdomain when not on localhost
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1') {
        window.location.href = `http://${data.slug}.localhost:${window.location.port || '43210'}/admin`
      } else {
        window.location.href = `https://${data.slug}.${PLATFORM}/admin`
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Mağaza Kaydı</CardTitle>
          <p className="text-center text-sm text-gray-500 mt-1">
            Marketing sitesinden gelen kayıt: app.{PLATFORM}/kayit
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mağaza Adı</label>
              <Input
                required
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Örn: Shop Mağaza"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subdomain</label>
              <div className="flex items-center gap-2">
                <Input
                  required
                  pattern="[a-z0-9-]+"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="shopmagaza"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">.{PLATFORM}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">İletişim Kişisi</label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Şifre (min 8)</label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="underline">
                Giriş yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
