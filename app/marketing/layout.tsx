import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL?.replace('app.', '') || 'https://posa360.com'),
  title: {
    default: 'POSA360 — Kendi Alan Adınla E-Ticaret',
    template: '%s · POSA360',
  },
  description:
    'Mağazanı dakikalar içinde aç. Kendi alan adın, sipariş–iade–kargo tek panel, iyzico/PayTR, anlaşmalı kargo ve personel yetkileri.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'POSA360',
    title: 'POSA360 — Kendi Alan Adınla E-Ticaret',
    description:
      'Mağazanı dakikalar içinde aç. Sipariş, iade ve kargo tek panelde; kendi domain’inle satışa başla.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POSA360',
    description: 'Kendi alan adınla modern e-ticaret altyapısı.',
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children
}
