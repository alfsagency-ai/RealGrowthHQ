'use client'

import { useState } from 'react'

interface Metrics {
  reach: number | null
  profile_visits: number | null
  bio_clicks: number | null
  optins: number | null
  calls_booked: number | null
  clients_closed: number | null
}

const BARS = [
  { key: 'reach',          label: 'Instagram reach', width: '100%', bg: 'bg-emerald-500',    text: 'text-white' },
  { key: 'profile_visits', label: 'Profile visits',  width: '85%',  bg: 'bg-emerald-500/80', text: 'text-white' },
  { key: 'bio_clicks',     label: 'Bio link clicks', width: '68%',  bg: 'bg-emerald-500/65', text: 'text-white' },
  { key: 'optins',         label: 'Email opt-ins',   width: '50%',  bg: 'bg-emerald-500/50', text: 'text-white' },
  { key: 'calls_booked',   label: 'Calls booked',    width: '35%',  bg: 'bg-emerald-500/35', text: 'text-emerald-200' },
  { key: 'clients_closed', label: 'Clients closed',  width: '22%',  bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
]

function fmt(n: number | null) {
  if (n == null) return '—'
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()
}

function convRate(a: number | null, b: number | null): string {
  if (!a || !b) return '—'
  return `${Math.round((b / a) * 100)}%`
}

export function FunnelViz({ metrics }: { metrics: Metrics | null }) {
  const [tooltip, setTooltip] = useState<number | null>(null)
  const m = metrics ?? { reach: null, profile_visits: null, bio_clicks: null, optins: null, calls_booked: null, clients_closed: null }
  const vals = [m.reach, m.profile_visits, m.bio_clicks, m.optins, m.calls_booked, m.clients_closed]

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {BARS.map((bar, i) => (
        <div key={bar.key} className="w-full flex flex-col items-center gap-1">
          {i > 0 && (
            <div className="flex items-center gap-1 py-0.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M2 6l3 3 3-3" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[11px] text-[#555555] font-medium">{convRate(vals[i - 1], vals[i])} →</span>
            </div>
          )}
          <div className="w-full flex justify-center relative" onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
            <div
              className={`${bar.bg} rounded-xl px-4 py-3 flex items-center justify-between transition-all cursor-default`}
              style={{ width: bar.width }}
            >
              <span className={`text-xs font-semibold ${bar.text}`}>{bar.label}</span>
              <span className={`text-sm font-bold ${bar.text}`}>{fmt(vals[i])}</span>
            </div>
            {tooltip === i && vals[i] != null && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F1629] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                {bar.label}: {vals[i]?.toLocaleString()}
                {i > 0 && vals[i - 1] ? ` (${convRate(vals[i - 1], vals[i])} conversion)` : ''}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
