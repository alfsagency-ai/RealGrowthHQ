import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CallsCalendar } from './CallsCalendar'
import { LogCallForm } from './LogCallForm'
import { CalendlyConnect } from './CalendlyConnect'

const TYPE_COLORS: Record<string, string> = {
  discovery: 'bg-[#1E1E1E] text-[#E0E0E0]',
  sales: 'bg-emerald-500/10 text-emerald-300',
  followup: 'bg-amber-500/10 text-amber-300',
  other: 'bg-white/10 text-[#A0A0A0]',
}

const OUTCOME_COLORS: Record<string, string> = {
  showed: 'bg-emerald-500/10 text-emerald-300',
  closed: 'bg-emerald-100 text-emerald-800',
  proposal_sent: 'bg-blue-500/10 text-blue-300',
  noshow: 'bg-red-500/10 text-red-300',
  pending: 'bg-white/10 text-[#A0A0A0]',
}

function Pill({ text, color }: { text: string; color: string }) {
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{text.replace('_', ' ')}</span>
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
      <p className="text-[11px] font-medium text-[#888888] uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-2xl font-semibold text-[#F0F0F0]">{value}</p>
    </div>
  )
}

export default async function CallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: allCalls }] = await Promise.all([
    supabase.from('users').select('calendly_token').eq('id', user.id).single(),
    supabase.from('calls').select('*').eq('client_id', user.id).order('date', { ascending: true }),
  ])

  const calls = allCalls ?? []
  const now = new Date()
  const thisMonthCalls = calls.filter(c => {
    const d = new Date(c.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const nonPendingNonNoshow = calls.filter(c => c.outcome !== 'pending' && c.outcome !== 'noshow')
  const closed = calls.filter(c => c.outcome === 'closed')
  const closeRate = nonPendingNonNoshow.length > 0 ? Math.round((closed.length / nonPendingNonNoshow.length) * 100) : 0
  const noShows = calls.filter(c => c.outcome === 'noshow').length

  const upcomingCalls = calls
    .filter(c => new Date(c.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Calls</h1>
        <p className="text-sm text-[#888888] mt-1">Track your sales calls, outcomes, and pipeline.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total calls" value={calls.length.toString()} />
        <MetricCard label="This month" value={thisMonthCalls.length.toString()} />
        <MetricCard label="Close rate" value={`${closeRate}%`} />
        <MetricCard label="No-shows" value={noShows.toString()} />
      </div>

      {/* Calendar */}
      <CallsCalendar calls={calls} />

      {/* Two column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* Upcoming calls */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Upcoming calls</h3>
          {upcomingCalls.length === 0 ? (
            <p className="text-sm text-[#555555]">No upcoming calls.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#252525]">
              {upcomingCalls.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[#F0F0F0]">{c.lead_name}</span>
                    <span className="text-xs text-[#555555]">
                      {new Date(c.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Pill text={c.type} color={TYPE_COLORS[c.type]} />
                    <Pill text={c.outcome} color={OUTCOME_COLORS[c.outcome]} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-4">
          <LogCallForm clientId={user.id} />
          <CalendlyConnect hasToken={!!profile?.calendly_token} clientId={user.id} />
        </div>

      </div>
    </div>
  )
}
