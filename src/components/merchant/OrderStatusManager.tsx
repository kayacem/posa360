'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
}

export function OrderStatusManager({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const availableStatuses = STATUS_FLOW[currentStatus as keyof typeof STATUS_FLOW] || []

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Durum güncellenemedi')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (availableStatuses.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Bu sipariş için başka durum geçişi yapılamaz.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Durumu Güncelle:</label>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={loading}
              variant={status === 'CANCELLED' ? 'destructive' : 'default'}
              size="sm"
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
      )}
    </div>
  )
}
