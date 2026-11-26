import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/MarketingShell'

export const metadata: Metadata = { title: 'Mesafeli Satış Sözleşmesi' }

export default function MesafeliSatisPage() {
  return (
    <MarketingShell>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1>Mesafeli Satış Sözleşmesi</h1>
        <p>
          Bu sayfa, POSA360 SaaS abonelikleri için mesafeli satış sözleşmesi yer tutucusudur. Cayma
          hakkı, ücretlendirme, hizmet kapsamı ve uyuşmazlık çözüm yolları hukuki metin onayından sonra
          burada yayımlanacaktır.
        </p>
        <p>
          Adres: Ataevler Mahallesi, Cihan 230. Sokak, Çelebi Ala Sitesi E Blok Daire 15, 16150 Nilüfer /
          Bursa · 0553 546 9948 · info@posa360.com
        </p>
      </article>
    </MarketingShell>
  )
}
