/** Lightweight CSS mock of the merchant panel — used when screenshot assets are absent */
export function PanelMock({
  title = 'Dashboard',
  variant = 'dashboard',
}: {
  title?: string
  variant?: 'dashboard' | 'orders' | 'settings'
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-teal-900/10">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-slate-500">{title} · shopmagaza.posa360.com</span>
      </div>
      <div className="grid grid-cols-[140px_1fr] min-h-[280px]">
        <aside className="border-r border-slate-100 bg-slate-50/80 p-3 text-[11px] text-slate-600">
          {['Dashboard', 'Ürünler', 'Siparişler', 'İadeler', 'Personel', 'Ayarlar'].map((item, i) => (
            <div
              key={item}
              className={`mb-1 rounded-md px-2 py-1.5 ${
                (variant === 'dashboard' && i === 0) ||
                (variant === 'orders' && i === 2) ||
                (variant === 'settings' && i === 5)
                  ? 'bg-teal-700 text-white'
                  : 'hover:bg-slate-100'
              }`}
            >
              {item}
            </div>
          ))}
        </aside>
        <div className="p-4">
          {variant === 'dashboard' && (
            <>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {['₺12.4k', '48 sipariş', '6 personel'].map((s) => (
                  <div key={s} className="rounded-lg bg-teal-50 px-3 py-3 text-center text-xs font-semibold text-teal-900">
                    {s}
                  </div>
                ))}
              </div>
              <div className="flex h-28 items-end gap-1 rounded-lg bg-gradient-to-t from-teal-50 to-white p-3">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-teal-600/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </>
          )}
          {variant === 'orders' && (
            <div className="space-y-2">
              {['ORD-1001 · Hazırlanıyor · ₺449,89', 'ORD-1002 · Kargoda · ₺269,89', 'ORD-1003 · Teslim · ₺189,00'].map(
                (row) => (
                  <div key={row} className="rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-700">
                    {row}
                  </div>
                )
              )}
            </div>
          )}
          {variant === 'settings' && (
            <div className="space-y-3">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-teal-700" />
                <div className="h-8 flex-1 rounded bg-slate-100" />
              </div>
              <div className="h-16 rounded-lg bg-gradient-to-r from-teal-600 to-teal-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
