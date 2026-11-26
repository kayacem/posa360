import Link from 'next/link'

export function MarketingFooter({ kayitUrl }: { kayitUrl: string }) {
  return (
    <footer className="border-t border-teal-900/10 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2 text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold">
              P
            </span>
            <span className="text-lg font-semibold">POSA360</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Kendi alan adınla, tek panelden sipariş–iade–kargo yöneten modern e-ticaret altyapısı.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">İletişim</h3>
          <address className="not-italic text-sm leading-relaxed text-slate-400">
            Ataevler Mahallesi, Cihan 230. Sokak,
            <br />
            Çelebi Ala Sitesi E Blok Daire 15,
            <br />
            16150 Nilüfer / Bursa
          </address>
          <p className="mt-3 text-sm">
            <a href="tel:+905535469948" className="hover:text-white">
              0553 546 9948
            </a>
          </p>
          <p className="text-sm">
            <a
              href="https://wa.me/905535469948"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              WhatsApp
            </a>
            {' · '}
            <a href="mailto:info@posa360.com" className="hover:text-white">
              info@posa360.com
            </a>
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Bağlantılar</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/paketler" className="hover:text-white">
                Paketler
              </Link>
            </li>
            <li>
              <a href={kayitUrl} className="hover:text-white">
                Kayıt ol
              </a>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-white">
                İletişim
              </Link>
            </li>
            <li>
              <Link href="/kvkk" className="hover:text-white">
                KVKK
              </Link>
            </li>
            <li>
              <Link href="/gizlilik" className="hover:text-white">
                Gizlilik
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis" className="hover:text-white">
                Mesafeli Satış
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} POSA360. Tüm hakları saklıdır.
      </div>
    </footer>
  )
}
