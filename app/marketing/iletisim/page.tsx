import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { ContactForm } from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'POSA360 ile iletişime geçin — Bursa Nilüfer, WhatsApp ve e-posta.',
}

export default function IletisimPage() {
  return (
    <MarketingShell active="iletisim">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">İletişim</h1>
          <p className="mt-3 text-slate-600">
            Demo, fiyatlandırma veya geçiş planı için yazın — aynı gün dönüş hedefliyoruz.
          </p>
          <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            <p>
              <strong>Adres</strong>
              <br />
              Ataevler Mahallesi, Cihan 230. Sokak,
              <br />
              Çelebi Ala Sitesi E Blok Daire 15,
              <br />
              16150 Nilüfer / Bursa
            </p>
            <p>
              <strong>Telefon</strong>
              <br />
              <a href="tel:+905535469948" className="text-teal-700 hover:underline">
                0553 546 9948
              </a>
            </p>
            <p>
              <strong>WhatsApp</strong>
              <br />
              <a
                href="https://wa.me/905535469948"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:underline"
              >
                wa.me/905535469948
              </a>
            </p>
            <p>
              <strong>E-posta</strong>
              <br />
              <a href="mailto:info@posa360.com" className="text-teal-700 hover:underline">
                info@posa360.com
              </a>
            </p>
          </div>
        </div>
        <ContactForm />
      </section>
    </MarketingShell>
  )
}
