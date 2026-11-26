import type { MetadataRoute } from 'next'

const SITE =
  process.env.NEXT_PUBLIC_MARKETING_URL ||
  (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN.split(':')[0]}`
    : 'https://posa360.com')

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.replace(/\/$/, '')
  const paths = ['', '/paketler', '/iletisim', '/kvkk', '/gizlilik', '/mesafeli-satis']
  const now = new Date()
  return paths.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/paketler' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/paketler' ? 0.9 : 0.5,
  }))
}
