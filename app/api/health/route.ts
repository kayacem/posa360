import { NextResponse } from 'next/server'

/** Liveness for deploy / load balancers — no DB dependency. */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'posa360',
      ts: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
