import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RevenueChart } from './RevenueChart'
import { LogRevenueForm } from './LogRevenueForm'
import { StripeConnect } from './StripeConnect'
import { formatDate } from '@/lib/utils'

interface RevenueEntry {
  id: string
  description: string
  amount: number
  date: string
  source: string
  is_recurring: boolean
  notes: string | null
  created_at: string
}

function getWeekBuckets(entries: RevenueEntry[]) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(monday)
    start.setDate(monday.getDate() - (7 - i) * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const total = entries
      .filter(e => { const d = new Date(e.date); return d >= start && d <= end })
      .reduce((sum, e) => sum + Number(e.amount), 0)

    return { label: formatDate(start.toISOString()), total }
  })
}

function MetricCard({ label, value, sub, bar }: { label: string; value: string; sub?: string; bar?: { pct: number; green: boolean } }) {
  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-1.5">
      <p className="text-[11px] font-medium text-[#888888] uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-[#F0F0F0]">{value}</p>
      {sub && <p className="text-xs text-[#888888]">{sub}</p>}
      {bar && (
        <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden mt-1">
          <div
            className={`h-full rounded-full transition-all ${bar.green ? 'bg-emerald-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(bar.pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default async function RevenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: entries }] = await Promise.all([
    supabase.from('users').select('stripe_key, revenue_goal').eq('id', user.id).single(),
    supabase.from('revenue_entries').select('*').eq('client_id', user.id).order('date', { ascending: false }),
  ])

  const all: RevenueEntry[] = entries ?? []
  const now = new Date()
  const thisMonthEntries = all.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  const totalCollected = all.reduce((s, e) => s + Number(e.amount), 0)
  const thisMonth = thisMonthEntries.reduce((s, e) => s + Number(e.amount), 0)
  const mrr = all.filter(e => e.is_recurring).reduce((s, e) => s + Number(e.amount), 0)
  const goalNum = parseFloat(profile?.revenue_goal ?? '0') || 0
  const goalPct = goalNum > 0 ? Math.round((thisMonth / goalNum) * 100) : 0

  const weekBuckets = getWeekBuckets(all)

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Revenue</h1>
        <p className="text-sm text-[#888888] mt-1">Track your income and hit your monthly goal.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total collected" value={fmt(totalCollected)} />
        <MetricCard label="This month" value={fmt(thisMonth)} />
        <MetricCard label="MRR" value={fmt(mrr)} sub="Recurring entries" />
        <MetricCard
          label="Goal progress"
          value={`${goalPct}%`}
          sub={goalNum > 0 ? `of ${fmt(goalNum)} goal` : 'Set a goal in onboarding'}
          bar={goalNum > 0 ? { pct: goalPct, green: goalPct >= 100 } : undefined}
        />
      </div>

      {/* Chart */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Revenue — last 8 weeks</h3>
        <RevenueChart data={weekBuckets} />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* Revenue history */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Revenue history</h3>
          {all.length === 0 ? (
            <p className="text-sm text-[#555555]">No revenue logged yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#252525]">
              {all.map(e => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#F0F0F0] truncate">{e.description}</span>
                      {e.is_recurring && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 shrink-0">recurring</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#555555]">{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${e.source === 'stripe' ? 'bg-[#1E1E1E] text-[#E0E0E0]' : 'bg-white/10 text-[#A0A0A0]'}`}>{e.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-[#F0F0F0]">£{Number(e.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-4">
          <LogRevenueForm clientId={user.id} />
          <StripeConnect hasKey={!!profile?.stripe_key} clientId={user.id} />
        </div>

      </div>
    </div>
  )
}
