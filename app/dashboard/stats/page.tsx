import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/StatCard'
import { StatsChartClient } from './StatsChartClient'
import { StatsForm } from './StatsForm'
import { ZapierSetup } from './ZapierSetup'

function ProgressBar({ label, value, max }: { label: string; value: number | null; max: number }) {
  const pct = value != null ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#C8C8C8]">{label}</span>
        <span className="text-xs font-medium text-[#888888]">{value?.toLocaleString() ?? '—'}</span>
      </div>
      <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase.from('stats_entries').select('*').eq('client_id', user.id).order('week_start', { ascending: false }).limit(20),
    supabase.from('users').select('webhook_token').eq('id', user.id).single(),
  ])

  const latest = rows?.[0] ?? null
  const prev = rows?.[1] ?? null
  const webhookToken = profile?.webhook_token ?? null

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Growth stats</h1>
        <p className="text-sm text-[#888888] mt-1">Track your Instagram growth week by week.</p>
      </div>

      {/* Large stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Followers" value={latest?.followers} prevValue={prev?.followers} large />
        <StatCard label="Engagement rate" value={latest?.engagement_rate} prevValue={prev?.engagement_rate} suffix="%" large />
        <StatCard label="Avg reel views" value={latest?.avg_reel_views} prevValue={prev?.avg_reel_views} large />
        <StatCard label="Saves" value={latest?.saves} prevValue={prev?.saves} large />
        <StatCard label="DM enquiries" value={latest?.dms} prevValue={prev?.dms} large />
        <StatCard label="Bio link clicks" value={latest?.bio_clicks} prevValue={prev?.bio_clicks} large />
      </div>

      {/* Followers chart */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Followers over time</h3>
        <StatsChartClient data={(rows ?? []).map(r => ({ week_start: r.week_start, followers: r.followers }))} />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Performance breakdown */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#F0F0F0]">Performance breakdown</h3>
          <ProgressBar label="Reels avg views" value={latest?.avg_reel_views ?? null} max={50000} />
          <ProgressBar label="Story views (reach)" value={latest?.reach ?? null} max={100000} />
          <ProgressBar label="Carousel saves" value={latest?.saves ?? null} max={5000} />
          <ProgressBar label="DM enquiries" value={latest?.dms ?? null} max={500} />
        </div>

        {/* Stats form */}
        <StatsForm clientId={user.id} />
      </div>

      {/* Zapier auto-import */}
      <ZapierSetup webhookToken={webhookToken} />
    </div>
  )
}
