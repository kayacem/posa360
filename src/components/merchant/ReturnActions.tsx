'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ReturnActions({ returnId, currentStatus }: { returnId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(action: string) {
    setLoading(true)
    try {
      await fetch(`/api/returns/${returnId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'REQUESTED') {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleAction('approve')} disabled={loading}>
          Onayla
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleAction('reject')} disabled={loading}>
          Reddet
        </Button>
      </div>
    )
  }

  if (currentStatus === 'APPROVED') {
    return (
      <Button size="sm" onClick={() => handleAction('received')} disabled={loading}>
        Ürün Alındı
      </Button>
    )
  }

  if (currentStatus === 'RECEIVED') {
    return (
      <Button size="sm" onClick={() => handleAction('refund')} disabled={loading}>
        Para İadesi Yap
      </Button>
    )
  }

  return <span className="text-sm text-gray-500">-</span>
}
