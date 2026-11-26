import { NextRequest } from 'next/server'
import { handlers } from '@/lib/next-auth'

export const runtime = 'nodejs'

/**
 * Behind nginx, Next's standalone server builds `req.url` from its bind address
 * (e.g. https://0.0.0.0:3030/...). Auth.js derives callback/redirect URLs and the
 * cookie origin from `req.url`, so rebuild it from the public Host header
 * (works for eticaret.*, {slug}.posa360.com and custom domains alike).
 */
function withPublicUrl(req: NextRequest): NextRequest {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!host) return req
  const proto = (req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', ''))
    .split(',')[0]
    .trim()
  const current = new URL(req.url)
  const publicUrl = new URL(`${current.pathname}${current.search}`, `${proto}://${host}`)
  if (publicUrl.origin === current.origin) return req
  return new NextRequest(publicUrl, req)
}

export const GET = (req: NextRequest) => handlers.GET(withPublicUrl(req))
export const POST = (req: NextRequest) => handlers.POST(withPublicUrl(req))
