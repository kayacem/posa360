import type { MetadataRoute } from 'next'

const SITE =
  process.env.NEXT_PUBLIC_MARKETING_URL ||
  (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN.split(':')[0]}`
    : 'https://posa360.com')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/super-admin', '/api'] },
    sitemap: `${SITE.replace(/\/$/, '')}/sitemap.xml`,
  }
}
