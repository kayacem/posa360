import Link from 'next/link'
import prisma from '@/lib/db'
import { LeadStatusButtons } from '@/components/super-admin/LeadStatusButtons'

export const dynamic = 'force-dynamic'

export default async function SuperAdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/super-admin" className="text-sm text-gray-500 hover:underline">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">İletişim Lead’leri</h1>
          </div>
          <Link href="/super-admin/plans" className="text-sm text-teal-700 underline">
            Planlar
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Mesaj</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Henüz lead yok
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {lead.createdAt.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.name}</div>
                    {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-3 text-gray-700">{lead.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      {lead.status}
                    </div>
                    <LeadStatusButtons id={lead.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
