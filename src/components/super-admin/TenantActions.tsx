'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function TenantActions({ tenantId, currentStatus }: { tenantId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'suspend' | 'activate') {
    if (!confirm(`Bu tenant'ı ${action === 'suspend' ? 'askıya almak' : 'aktif etmek'} istediğinizden emin misiniz?`)) return

    setLoading(true)
    try {
      await fetch(`/api/super-admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' }),
      })
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'ACTIVE' && (
        <Button size="sm" variant="destructive" onClick={() => handleAction('suspend')} disabled={loading}>
          Askıya Al
        </Button>
      )}
      {currentStatus === 'SUSPENDED' && (
        <Button size="sm" onClick={() => handleAction('activate')} disabled={loading}>
          Aktif Et
        </Button>
      )}
    </div>
  )
}
