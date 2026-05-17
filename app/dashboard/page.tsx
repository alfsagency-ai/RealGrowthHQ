import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/StatCard'
import { WeeklyTasks } from '@/components/WeeklyTasks'
import { getWeekNumber, getPackageLabel, getPackageBadgeColor } from '@/lib/utils'
import { ShimmerText } from '@/components/ShimmerText'

const SETUP_ITEMS = [
  { label: 'Content strategy', pct: 0 },
  { label: 'Profile optimised', pct: 0 },
  { label: 'Funnel build', pct: 0 },
  { label: 'Email sequences', pct: 0 },
  { label: 'DM scripts', pct: 0 },
  { label: 'Webinar framework', pct: 0 },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: statsRows }, { data: noteRow }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('stats_entries').select('*').eq('client_id', user.id)
      .order('week_start', { ascending: false }).limit(2),
    supabase.from('operator_notes').select('note, created_at').eq('client_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const latest = statsRows?.[0] ?? null
  const prev = statsRows?.[1] ?? null
  const firstName = (profile?.name ?? user.email ?? '').split(' ')[0]
  const weekNum = getWeekNumber(profile?.created_at ?? null)
  const pkgLabel = getPackageLabel(profile?.package ?? null)
  const pkgColor = getPackageBadgeColor(profile?.package ?? null)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Welcome banner */}
      <div
        className="relative rounded-2xl px-10 py-8"
        style={{
          background: 'linear-gradient(135deg, #0D1F14 0%, #0A1A10 40%, #0D2218 100%)',
          border: '2px solid rgba(16,185,129,0.55)',
          boxShadow: '0 0 100px rgba(16,185,129,0.22), 0 0 40px rgba(16,185,129,0.14), inset 0 1px 0 rgba(16,185,129,0.25)',
        }}
      >
        {/* Top-edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.9) 25%, #00ff88 50%, rgba(16,185,129,0.9) 75%, transparent)' }} />

        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/70">RealGrowthHQ</p>
            <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
              Welcome back,{' '}
              <ShimmerText text={firstName} />
            </h1>
            <p className="text-sm text-emerald-400/60 font-medium mt-0.5">Week {weekNum} · Premium Client</p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <span
              className="text-[11px] font-bold px-5 py-2 rounded-full uppercase tracking-widest text-emerald-300"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 18px rgba(16,185,129,0.20)',
              }}
            >
              Premium Client
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Followers" value={latest?.followers} prevValue={prev?.followers} />
        <StatCard label="Weekly reach" value={latest?.reach} prevValue={prev?.reach} />
        <StatCard label="DM enquiries" value={latest?.dms} prevValue={prev?.dms} />
        <StatCard label="Email leads" value={latest?.email_leads} prevValue={prev?.email_leads} />
        <StatCard label="Revenue this week" value={null} prevValue={null} prefix="£" />
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Setup progress */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#F0F0F0]">Setup progress</h3>
          <div className="flex flex-col gap-3">
            {SETUP_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#C8C8C8]">{item.label}</span>
                  <span className="text-xs font-medium text-[#888888]">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly tasks */}
        <WeeklyTasks />
      </div>

      {/* Operator note */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-3">Operator note this week</h3>
        {noteRow ? (
          <div className="border-l-4 border-emerald-500 pl-4 py-1">
            <p className="text-sm text-[#C8C8C8] leading-relaxed whitespace-pre-wrap">{noteRow.note}</p>
            <p className="text-xs text-[#555555] mt-2">
              {new Date(noteRow.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        ) : (
          <div className="border-l-4 border-[#252525] pl-4 py-1">
            <p className="text-sm text-[#555555]">Your operator hasn&apos;t posted a note yet this week.</p>
          </div>
        )}
      </div>

    </div>
  )
}
