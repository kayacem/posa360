'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Geçersiz e-posta veya şifre')
      setLoading(false)
    } else {
      // Fetch session to determine redirect
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user?.role === 'SUPER_ADMIN') {
        router.push('/super-admin')
      } else if (
        session?.user?.role === 'TENANT_OWNER' ||
        session?.user?.role === 'TENANT_ADMIN' ||
        session?.user?.role === 'TENANT_STAFF'
      ) {
        router.push('/admin')
      } else {
        router.push('/')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">POSA360 Giriş</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@posa360.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <p className="font-semibold mb-2">Demo Hesaplar:</p>
              <p>Super Admin: admin@posa360.com / admin123</p>
              <p>Merchant: ahmet@shopmagaza.com / merchant123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
