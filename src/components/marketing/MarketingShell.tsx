import Link from 'next/link'
import { MarketingFooter } from './MarketingFooter'

const APP_HOST =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://app.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN.split(':')[0]}`
    : 'http://localhost:43210')

export function MarketingShell({
  children,
  active,
}: {
  children: React.ReactNode
  active?: 'home' | 'paketler' | 'iletisim'
}) {
  const kayit = `${APP_HOST.replace(/\/$/, '')}/kayit`
  const giris = `${APP_HOST.replace(/\/$/, '')}/login`

  const linkClass = (key: string) =>
    `text-sm font-medium transition ${
      active === key ? 'text-teal-700' : 'text-slate-600 hover:text-slate-900'
    }`

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf9] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-teal-900/5 bg-[#f7faf9]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
              P
            </span>
            <span className="text-lg font-semibold tracking-tight">POSA360</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className={linkClass('home')}>
              Ana Sayfa
            </Link>
            <Link href="/paketler" className={linkClass('paketler')}>
              Paketler
            </Link>
            <Link href="/iletisim" className={linkClass('iletisim')}>
              İletişim
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={giris}
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
            >
              Giriş
            </a>
            <a
              href={kayit}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Ücretsiz Dene
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <MarketingFooter kayitUrl={kayit} />
    </div>
  )
}
