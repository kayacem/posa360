'use client'

/** Lightweight bar chart — avoids broken recharts peer deps in this env */
export function SimpleBarChart({
  data,
  xKey,
  bars,
  height = 260,
}: {
  data: Record<string, string | number>[]
  xKey: string
  bars: Array<{ key: string; color: string; name?: string }>
  height?: number
}) {
  if (!data.length) {
    return <p className="text-sm text-gray-500 py-8 text-center">Grafik için veri yok</p>
  }

  const numericKeys = bars.map((b) => b.key)
  const max = Math.max(
    1,
    ...data.flatMap((row) => numericKeys.map((k) => Number(row[k]) || 0))
  )

  const plotHeight = Math.max(120, height - 56)

  return (
    <div className="w-full" style={{ minHeight: height }}>
      <div className="flex gap-4 mb-3 text-xs">
        {bars.map((b) => (
          <span key={b.key} className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded" style={{ background: b.color }} />
            {b.name || b.key}
          </span>
        ))}
      </div>
      <div className="flex items-end gap-1 overflow-x-auto pb-6" style={{ height: plotHeight }}>
        {data.map((row, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 min-w-[22px] flex-1">
            <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: plotHeight - 24 }}>
              {bars.map((b) => {
                const value = Number(row[b.key]) || 0
                const px = value > 0 ? Math.max(8, Math.round((value / max) * (plotHeight - 24))) : 2
                return (
                  <div
                    key={b.key}
                    title={`${b.name || b.key}: ${value}`}
                    className="w-3 rounded-t"
                    style={{ height: `${px}px`, background: b.color }}
                  />
                )
              })}
            </div>
            <span className="text-[10px] text-gray-500 truncate max-w-[40px]">
              {String(row[xKey])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
