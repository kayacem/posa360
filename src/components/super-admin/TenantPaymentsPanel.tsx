'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

type Payment = {
  id: string
  period: string
  amount: number
  status: string
  paidAt: string | null
  dueDate: string
}

export function TenantPaymentsPanel({
  tenantId,
  payments,
}: {
  tenantId: string
  payments: Payment[]
}) {
  const router = useRouter()

  async function markPaid(paymentId: string) {
    const res = await fetch(`/api/super-admin/tenants/${tenantId}/payments/${paymentId}/mark-paid`, {
      method: 'POST',
    })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-2">
      {payments.map((p) => {
        const overdue = p.status === 'OVERDUE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date())
        return (
          <div
            key={p.id}
            className={`flex items-center justify-between border rounded p-3 ${
              overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div>
              <div className="font-medium">{p.period}</div>
              <div className="text-sm text-gray-500">
                Vade: {formatDate(p.dueDate)}
                {p.paidAt ? ` · Ödendi: ${formatDate(p.paidAt)}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatCurrency(p.amount)}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : overdue
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {overdue && p.status !== 'PAID' ? 'OVERDUE' : p.status}
              </span>
              {p.status !== 'PAID' && (
                <Button size="sm" variant="outline" onClick={() => markPaid(p.id)}>
                  Ödendi İşaretle
                </Button>
              )}
            </div>
          </div>
        )
      })}
      {payments.length === 0 && <p className="text-sm text-gray-500">Ödeme kaydı yok</p>}
    </div>
  )
}
