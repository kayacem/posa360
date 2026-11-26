import type { Metadata } from 'next'
import { getTenantContext } from '@/lib/tenant'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Giriş Yap | POSA360',
}

const SIGNUP_URL = 'https://eticaret.posa360.com/kayit'

const FEATURES = [
  'Sipariş, iade ve kargo tek panelde',
  'Kendi alan adınla, SSL dahil mağaza',
  'iyzico, PayTR, havale ve kapıda ödeme',
]

export default async function LoginPage() {
  let store: { name: string; logoUrl: string | null } | null = null
  try {
    const ctx = await getTenantContext()
    if (ctx && ctx.type !== 'super-admin') {
      store = { name: ctx.name, logoUrl: ctx.settings.logoUrl }
    }
  } catch {
    store = null
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-teal-950/40 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold ring-1 ring-white/30">
            P
          </span>
          <span className="text-xl font-semibold tracking-tight">POSA360</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {store ? `${store.name} yönetim paneli` : 'E-ticaretin tamamı, tek panelde.'}
          </h1>
          <p className="mt-4 text-lg text-teal-50/90">
            Mağazanı aç, siparişlerini yönet, büyümeye odaklan.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-teal-50">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-teal-100/80">© {new Date().getFullYear()} POSA360</p>
      </section>

      {/* Form */}
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white">
              P
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">POSA360</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            {store && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-3">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logoUrl} alt={`${store.name} logosu`} className="h-10 w-10 rounded-lg object-contain bg-white" />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-base font-bold text-white">
                    {store.name.charAt(0).toLocaleUpperCase('tr-TR')}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{store.name}</p>
                  <p className="text-xs text-teal-800">Mağaza yönetimi</p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tekrar hoş geldin</h2>
            <p className="mt-1 text-sm text-slate-500">Hesabına giriş yap ve kaldığın yerden devam et.</p>

            <div className="mt-6">
              <LoginForm />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Henüz mağazan yok mu?{' '}
            <a href={SIGNUP_URL} className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
              Ücretsiz mağaza aç
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
