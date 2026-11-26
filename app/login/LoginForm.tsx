'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SessionTenant = { tenantSlug?: string }

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [storeHint, setStoreHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStoreHint(null)

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (!result || result.error) {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    const response = await fetch('/api/auth/session', { cache: 'no-store' })
    const session = await response.json()
    const role: string | undefined = session?.user?.role
    const tenants: SessionTenant[] = session?.user?.tenants || []
    const host = window.location.hostname
    const onHub = host.startsWith('eticaret.') || host.startsWith('panel.') || host === 'localhost'

    if (role === 'SUPER_ADMIN') {
      router.push('/super-admin')
    } else if (role === 'TENANT_OWNER' || role === 'TENANT_ADMIN' || role === 'TENANT_STAFF') {
      const slug = tenants[0]?.tenantSlug
      if (onHub && slug) {
        // Store panels live on the store's own address (session cookies are per host).
        setStoreHint(`${slug}.posa360.com`)
        setLoading(false)
        return
      }
      router.push('/admin')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  const inputClass =
    'block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@firma.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Şifre
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label="Şifreyi göster/gizle"
            aria-pressed={showPassword}
            title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.9 9.9 0 0 1 12 5c5 0 8.6 4.3 9.7 6.4a1.3 1.3 0 0 1 0 1.2 15 15 0 0 1-3.1 3.9M6.6 6.6A15 15 0 0 0 2.3 11.4a1.3 1.3 0 0 0 0 1.2C3.4 14.7 7 19 12 19a9.6 9.6 0 0 0 4.4-1.1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.3 12.6a1.3 1.3 0 0 1 0-1.2C3.4 9.3 7 5 12 5s8.6 4.3 9.7 6.4a1.3 1.3 0 0 1 0 1.2C20.6 14.7 17 19 12 19s-8.6-4.3-9.7-6.4Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {storeHint && (
        <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          Giriş bilgilerin doğru. Mağaza paneline kendi mağaza adresinden giriş yapmalısın:{' '}
          <a href={`https://${storeHint}/login`} className="font-semibold underline">
            {storeHint}/login
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
