import Link from 'next/link'
import { existsSync } from 'fs'
import path from 'path'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PanelMock } from '@/components/marketing/PanelMock'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

const hasPanelShot = existsSync(
  path.join(process.cwd(), 'public/marketing/panel-dashboard-real.png')
)

const APP =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://app.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN.split(':')[0]}`
    : 'http://localhost:43210')

const VALUE_PROPS = [
  {
    title: 'Mağazanı hemen aç',
    body: 'Subdomain’in hazır; markanı, ürünlerini ve ödemeyi aynı gün yayına al.',
  },
  {
    title: 'Kendi alan adın',
    body: 'shopcem.com gibi özel domain bağla; vitrin yönlendirmeden senin domain’inde kalsın.',
  },
  {
    title: 'Sipariş · iade · kargo tek panel',
    body: 'Hazırlama, kargo etiketi, iade onayı — tüm operasyon tek ekranda.',
  },
  {
    title: 'Ödeme çeşitliliği',
    body: 'iyzico, PayTR, havale/EFT ve kapıda ödeme seçeneklerini mağazana ekle.',
  },
  {
    title: 'Anlaşmalı kargo',
    body: 'Yurtiçi, Aras, MNG, Sürat ve PTT entegrasyonlarıyla çıkış süreçlerini hızlandır.',
  },
  {
    title: 'Toplu ürün yükleme',
    body: 'CSV ile yüzlerce ürünü tek seferde içeri al; stok ve varyantları yönet.',
  },
  {
    title: 'Personel yetkileri',
    body: 'Sipariş, ürün veya ayarlara özel erişim ver; ekibini güvenle büyüt.',
  },
  {
    title: 'Tema düzenleyici',
    body: 'Logo, ana renk, banner ve mağaza adını vitrine anında yansıt.',
  },
]

const STEPS = [
  { n: '1', t: 'Kayıt ol', d: 'Paketi seç, 14 gün ücretsiz denemeye başla.' },
  { n: '2', t: 'Mağazanı kur', d: 'Ürünleri yükle, ödemeyi ve kargoyu bağla.' },
  { n: '3', t: 'Satışa geç', d: 'Domain’ini doğrula, sipariş almaya başla.' },
]

const FAQ = [
  {
    q: 'Kendi domain’imi kullanabilir miyim?',
    a: 'Evet. DNS kayıtlarını ekleyip doğruladıktan sonra vitrin özel domain’inizde açılır; admin.alanadiniz.com ile panele girersiniz.',
  },
  {
    q: 'Deneme süresi ne kadar?',
    a: 'Tüm paketlerde 14 gün ücretsiz deneme. Kart zorunluluğu deneme sonunda paket seçiminize göre başlar.',
  },
  {
    q: 'Hangi ödemeleri destekliyorsunuz?',
    a: 'iyzico, PayTR, havale/EFT ve kapıda ödeme. Mağaza ayarlarından aktif edersiniz.',
  },
]

export default async function MarketingHomePage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  const kayit = `${APP.replace(/\/$/, '')}/kayit`
  const highlighted = plans.find((p) => p.highlighted) || plans[1] || plans[0]

  return (
    <MarketingShell active="home">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ccfbf1_0%,_transparent_55%),linear-gradient(180deg,#f7faf9_0%,#eef6f4_100%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              POSA360
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Kendi alan adınla e-ticaret. Operasyon tek panelde.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Mağaza aç, domain bağla, sipariş–iade–kargoyu aynı yerden yönet. 14 gün ücretsiz dene.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={highlighted ? `${kayit}?plan=${highlighted.slug}` : kayit}
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800"
              >
                14 gün ücretsiz başla
              </a>
              <Link
                href="/paketler"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              >
                Paketleri incele
              </Link>
            </div>
          </div>
            <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-200/40 to-transparent blur-2xl" />
            {hasPanelShot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/marketing/panel-dashboard-real.png"
                alt="POSA360 merchant dashboard"
                className="relative w-full rounded-2xl border border-slate-200 shadow-2xl shadow-teal-900/15"
              />
            ) : (
              <PanelMock title="Merchant Dashboard" variant="dashboard" />
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Neden POSA360?</h2>
          <p className="mt-3 text-slate-600">
            Satışa odaklanman için operasyonu sadeleştirdik — ekstra araç labirentleri yok.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product visuals */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Gerçek panel. Gerçek iş akışı.</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Dashboard cirosu, sipariş durumları ve tema ayarları — mercahnt panelinin göründüğü gibi.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <PanelMock title="Dashboard" variant="dashboard" />
            <PanelMock title="Siparişler" variant="orders" />
            <PanelMock title="Tema / Marka" variant="settings" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">3 adımda satış</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-teal-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Sık sorulanlar</h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 p-5 open:bg-teal-50/40">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-teal-800 to-teal-600 px-8 py-14 text-center text-white shadow-xl shadow-teal-900/25">
          <h2 className="text-3xl font-bold tracking-tight">Bugün mağazanı aç.</h2>
          <p className="mx-auto mt-3 max-w-xl text-teal-50">
            Kart gerekmeden 14 gün dene. Beğenirsen paketine devam et.
          </p>
          <a
            href={kayit}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
          >
            Ücretsiz kaydol
          </a>
        </div>
      </section>
    </MarketingShell>
  )
}
