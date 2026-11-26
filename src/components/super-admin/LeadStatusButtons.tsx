'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LeadStatusButtons({ id }: { id: string }) {
  const router = useRouter()
  async function setStatus(status: string) {
    await fetch('/api/super-admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    router.refresh()
  }
  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" variant="outline" onClick={() => setStatus('CONTACTED')}>
        İletişime geçildi
      </Button>
      <Button size="sm" variant="outline" onClick={() => setStatus('CLOSED')}>
        Kapat
      </Button>
    </div>
  )
}
