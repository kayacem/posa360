import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/MarketingShell'

export const metadata: Metadata = { title: 'Gizlilik Politikası' }

export default function GizlilikPage() {
  return (
    <MarketingShell>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1>Gizlilik Politikası</h1>
        <p>
          POSA360 olarak gizliliğinize önem veriyoruz. Bu sayfa yer tutucu bir gizlilik politikasıdır;
          çerez kullanımı, veri saklama süreleri ve üçüncü taraf hizmetler (ödeme, kargo) hakkında
          nihai metin yayından önce tamamlanacaktır.
        </p>
        <p>
          Sorularınız için <a href="mailto:info@posa360.com">info@posa360.com</a> adresine yazabilirsiniz.
        </p>
      </article>
    </MarketingShell>
  )
}
