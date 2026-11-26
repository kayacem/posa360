import type { MetadataRoute } from 'next'
import { publicMarketingOrigin } from '@/lib/platform'

export default function robots(): MetadataRoute.Robots {
  const site = publicMarketingOrigin()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/super-admin', '/api'] },
    sitemap: `${site}/sitemap.xml`,
  }
}
