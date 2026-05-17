'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface WeekBucket { label: string; total: number }

export function RevenueChart({ data }: { data: WeekBucket[] }) {
  if (data.every(d => d.total === 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[#555555]">
        No revenue logged yet — add entries below.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} width={50}
          tickFormatter={v => `£${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          formatter={(v) => [`£${Number(v ?? 0).toFixed(2)}`, 'Revenue']}
          labelFormatter={l => `Week of ${l}`}
          contentStyle={{ border: '1px solid #252525', borderRadius: 8, fontSize: 12, background: '#141414', color: '#F0F0F0' }}
        />
        <Bar dataKey="total" fill="#E8E8E8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
