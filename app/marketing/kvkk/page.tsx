import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/MarketingShell'

export const metadata: Metadata = { title: 'KVKK Aydınlatma Metni' }

export default function KvkkPage() {
  return (
    <MarketingShell>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1>KVKK Aydınlatma Metni</h1>
        <p>
          Bu metin yer tutucudur. POSA360, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
          veri sorumlusu olarak kişisel verilerinizi hizmetin sunulması, destek ve yasal yükümlülükler
          çerçevesinde işler.
        </p>
        <p>
          Detaylı aydınlatma metni ve başvuru süreçleri yayına alınmadan önce hukuki danışmanlık ile
          güncellenecektir. Talepleriniz için:{' '}
          <a href="mailto:info@posa360.com">info@posa360.com</a>
        </p>
      </article>
    </MarketingShell>
  )
}
