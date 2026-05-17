'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatDate } from '@/lib/utils'

interface ChartPoint {
  week_start: string
  followers: number | null
}

export function StatsChartClient({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[#555555]">
        No data yet — add your first week&apos;s stats below.
      </div>
    )
  }

  const chartData = [...data].reverse().map(d => ({
    week: formatDate(d.week_start),
    followers: d.followers ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} width={45} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip
          contentStyle={{ border: '1px solid #252525', borderRadius: 8, fontSize: 12, background: '#141414', color: '#F0F0F0' }}
          labelStyle={{ color: '#888888', marginBottom: 4 }}
        />
        <Line type="monotone" dataKey="followers" stroke="#E8E8E8" strokeWidth={2} dot={{ r: 3, fill: '#E8E8E8' }} activeDot={{ r: 5 }} name="Followers" />
      </LineChart>
    </ResponsiveContainer>
  )
}
