import type { MetadataRoute } from 'next'
import { publicMarketingOrigin } from '@/lib/platform'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicMarketingOrigin()
  const paths = ['', '/paketler', '/iletisim', '/kvkk', '/gizlilik', '/mesafeli-satis']
  const now = new Date()
  return paths.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/paketler' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/paketler' ? 0.9 : 0.5,
  }))
}
