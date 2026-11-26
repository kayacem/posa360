import Link from 'next/link'
import prisma from '@/lib/db'
import { PlansEditor } from '@/components/super-admin/PlansEditor'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/super-admin" className="text-sm text-gray-500 hover:underline">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Paket / Plan Yönetimi</h1>
            <p className="text-sm text-amber-800">
              Fiyatlar yer tutucu — canlı fiyatları burada güncelleyin.
            </p>
          </div>
          <Link href="/super-admin/leads" className="text-sm text-teal-700 underline">
            Lead’ler
          </Link>
        </div>
        <PlansEditor initial={plans} />
      </div>
    </div>
  )
}
