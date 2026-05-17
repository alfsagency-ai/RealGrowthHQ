import { StatCard } from '@/components/StatCard'
import { FunnelViz } from '@/app/dashboard/funnel/FunnelViz'
import { RevenueChart } from '@/app/dashboard/revenue/RevenueChart'
import { BrandName } from '@/components/BrandName'
import { ShimmerText } from '@/components/ShimmerText'

const REVENUE_CHART = [
  { label: '7 Apr', total: 1200 },
  { label: '14 Apr', total: 800 },
  { label: '21 Apr', total: 2400 },
  { label: '28 Apr', total: 1800 },
  { label: '5 May', total: 3200 },
  { label: '12 May', total: 2800 },
  { label: '19 May', total: 4600 },
  { label: '26 May', total: 4800 },
]

const FUNNEL_METRICS = {
  reach: 318000,
  profile_visits: 14200,
  bio_clicks: 4100,
  optins: 892,
  calls_booked: 38,
  clients_closed: 9,
}

const PIPELINE = [
  { stage: 'Prospecting', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc', leads: ['Alex P. — Fitness Coach', 'Jamie K. — Nutritionist', 'Sam W. — Life Coach'] },
  { stage: 'Contacted', color: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#fde047', leads: ['Rachel M. — Business Coach', 'Tom B. — PT', 'Lisa C. — Therapist', 'David H. — Consultant'] },
  { stage: 'Qualified', color: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c', leads: ['Emma R. — Mindset Coach', 'Chris L. — Sales Coach', 'Priya S. — Career Coach'] },
  { stage: 'Proposal', color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', leads: ['Oliver J. — £3,500 proposal', 'Maya T. — £5,000 proposal'] },
  { stage: 'Closed ✓', color: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.4)', text: '#34d399', leads: ['Dan W. — £3,500', 'Soph M. — £5,000', 'Kai B. — £2,800', 'Nia L. — £4,200', 'Jess R. — £3,000'] },
]

const WINS = [
  { text: 'Closed a £5,000 coaching package!', date: '14 May', emoji: '💰' },
  { text: 'Hit 50,000 followers milestone', date: '11 May', emoji: '🎯' },
  { text: '8 discovery calls booked in one week', date: '7 May', emoji: '📞' },
  { text: 'First £10K month achieved!', date: '30 Apr', emoji: '🏆' },
  { text: 'Sold out online workshop — 32 seats', date: '22 Apr', emoji: '🎓' },
  { text: 'Featured in industry newsletter (12K readers)', date: '18 Apr', emoji: '📣' },
]

const CONTENT = [
  { day: 'Mon', type: 'Reel', title: '3 mistakes coaches make', status: 'published' },
  { day: 'Tue', type: 'Carousel', title: 'My morning routine breakdown', status: 'published' },
  { day: 'Wed', type: 'Story', title: 'Behind the scenes — client session', status: 'published' },
  { day: 'Thu', type: 'Reel', title: 'Client transformation story', status: 'scheduled' },
  { day: 'Fri', type: 'Post', title: 'Weekly wins + gratitude', status: 'scheduled' },
  { day: 'Sat', type: 'Carousel', title: '5 mindset shifts that changed everything', status: 'draft' },
  { day: 'Sun', type: 'Story', title: 'Q&A — ask me anything', status: 'draft' },
]

const SETUP_ITEMS = [
  { label: 'Content strategy', pct: 100 },
  { label: 'Profile optimised', pct: 100 },
  { label: 'Funnel build', pct: 100 },
  { label: 'Email sequences', pct: 100 },
  { label: 'DM scripts', pct: 100 },
  { label: 'Webinar framework', pct: 85 },
]

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Published' },
  scheduled: { bg: 'rgba(234,179,8,0.12)', text: '#fde047', label: 'Scheduled' },
  draft: { bg: 'rgba(136,136,136,0.12)', text: '#888888', label: 'Draft' },
}

const NAV = [
  { label: 'Dashboard', active: false },
  { label: 'Growth stats', active: false },
  { label: 'Revenue', active: false },
  { label: 'Funnel', active: false },
  { label: 'Pipeline', active: false },
  { label: 'Content plan', active: false },
  { label: 'Win wall', active: false },
  { label: 'DM Scripts', active: false },
  { label: 'Resources', active: false },
  { label: 'Deliverables', active: false },
]

export default function DemoPage() {
  const fmt = (n: number) => `£${n.toLocaleString('en-GB')}`

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0A0A0A]">

      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-[#0D0D0D] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white"/>
            <path d="M19 5L10 17H16L13 27L22 15H16L19 5Z" fill="#0A0A0A"/>
          </svg>
          <BrandName />
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}
          >
            Demo View
          </span>
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-white/10 bg-white/5 text-[#999]"
          >
            Premium Client
          </span>
          <span className="text-sm text-[#666]">Marcus T.</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside
          className="w-52 shrink-0 flex flex-col overflow-y-auto py-4 px-2.5"
          style={{
            backgroundColor: '#0D0D0D',
            boxShadow: '6px 0 60px rgba(16,185,129,0.18), 2px 0 0 rgba(16,185,129,0.25)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#555]"
                style={{ border: '1px solid transparent' }}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
          <div className="flex flex-col gap-8 max-w-5xl">

            {/* Welcome banner */}
            <div
              className="relative rounded-2xl px-10 py-8"
              style={{
                background: 'linear-gradient(135deg, #0D1F14 0%, #0A1A10 40%, #0D2218 100%)',
                border: '2px solid rgba(16,185,129,0.55)',
                boxShadow: '0 0 100px rgba(16,185,129,0.22), 0 0 40px rgba(16,185,129,0.14), inset 0 1px 0 rgba(16,185,129,0.25)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.9) 25%, #00ff88 50%, rgba(16,185,129,0.9) 75%, transparent)' }} />
              <div className="flex items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/70">RealGrowthHQ</p>
                  <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
                    Welcome back, <ShimmerText text="Marcus" />
                  </h1>
                  <p className="text-sm text-emerald-400/60 font-medium mt-0.5">Week 12 · Premium Client</p>
                </div>
                <div className="shrink-0">
                  <span
                    className="text-[11px] font-bold px-5 py-2 rounded-full uppercase tracking-widest text-emerald-300"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', boxShadow: '0 0 18px rgba(16,185,129,0.20)' }}
                  >
                    Premium Client
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard label="Followers" value={52400} prevValue={44100} />
              <StatCard label="Weekly reach" value={318000} prevValue={247000} />
              <StatCard label="DM enquiries" value={74} prevValue={51} />
              <StatCard label="Email leads" value={428} prevValue={312} />
              <StatCard label="Revenue this week" value={4800} prevValue={3200} prefix="£" />
            </div>

            {/* Revenue + Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Revenue metrics */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total collected', value: fmt(24600) },
                    { label: 'This month', value: fmt(8400) },
                    { label: 'MRR', value: fmt(3600) },
                    { label: 'Goal progress', value: '84%', bar: 84 },
                  ].map(card => (
                    <div key={card.label} className="bg-[#141414] border border-[#252525] rounded-xl p-4 flex flex-col gap-1.5">
                      <p className="text-[11px] font-medium text-[#888888] uppercase tracking-wide">{card.label}</p>
                      <p className="text-xl font-semibold text-[#F0F0F0]">{card.value}</p>
                      {card.bar && (
                        <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${card.bar}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Revenue chart */}
                <div className="bg-[#141414] border border-[#252525] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#F0F0F0] mb-3">Revenue — last 8 weeks</p>
                  <RevenueChart data={REVENUE_CHART} />
                </div>
              </div>

              {/* Funnel */}
              <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#F0F0F0] mb-4">Sales funnel</p>
                <FunnelViz metrics={FUNNEL_METRICS} />
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#F0F0F0]">Pipeline</p>
                <span className="text-[11px] text-emerald-400 font-medium">£18,500 closed this month</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {PIPELINE.map(col => (
                  <div key={col.stage} className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: col.text }}>{col.stage}</p>
                    <div className="flex flex-col gap-1.5">
                      {col.leads.map(lead => (
                        <div
                          key={lead}
                          className="rounded-lg px-2.5 py-2 text-[11px] leading-tight"
                          style={{ background: col.color, border: `1px solid ${col.border}`, color: '#C8C8C8' }}
                        >
                          {lead}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content plan + Win wall */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Content plan */}
              <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#F0F0F0] mb-4">This week&apos;s content</p>
                <div className="flex flex-col divide-y divide-[#1E1E1E]">
                  {CONTENT.map(item => {
                    const s = STATUS_STYLE[item.status]
                    return (
                      <div key={item.day} className="py-2.5 flex items-center gap-3">
                        <span className="text-[11px] font-bold text-[#555] w-8 shrink-0">{item.day}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>{item.type}</span>
                        <span className="text-xs text-[#C8C8C8] flex-1 truncate">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Win wall */}
              <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#F0F0F0] mb-4">Win wall 🏆</p>
                <div className="flex flex-col gap-2">
                  {WINS.map(win => (
                    <div
                      key={win.text}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
                    >
                      <span className="text-base leading-none mt-0.5">{win.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#E0E0E0] font-medium">{win.text}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{win.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Setup progress */}
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
              <p className="text-sm font-semibold text-[#F0F0F0] mb-4">Setup progress</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                {SETUP_ITEMS.map(item => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#C8C8C8]">{item.label}</span>
                      <span className="text-xs font-medium text-emerald-400">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue history */}
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
              <p className="text-sm font-semibold text-[#F0F0F0] mb-4">Revenue history</p>
              <div className="flex flex-col divide-y divide-[#252525]">
                {[
                  { desc: '1-to-1 Coaching — May', amount: 5000, source: 'bank transfer', recurring: true, date: '26 May 2026' },
                  { desc: 'Group Programme — May cohort', amount: 1800, source: 'stripe', recurring: false, date: '20 May 2026' },
                  { desc: 'Online Workshop', amount: 960, source: 'stripe', recurring: false, date: '18 May 2026' },
                  { desc: '1-to-1 Coaching — May', amount: 3500, source: 'bank transfer', recurring: true, date: '14 May 2026' },
                  { desc: 'Digital Course Sales', amount: 1240, source: 'stripe', recurring: false, date: '10 May 2026' },
                  { desc: 'Strategy Day', amount: 2800, source: 'bank transfer', recurring: false, date: '5 May 2026' },
                  { desc: '1-to-1 Coaching — Apr', amount: 5000, source: 'bank transfer', recurring: true, date: '28 Apr 2026' },
                  { desc: 'Mastermind Q2', amount: 4300, source: 'stripe', recurring: false, date: '21 Apr 2026' },
                ].map(e => (
                  <div key={e.date + e.desc} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#F0F0F0] truncate">{e.desc}</span>
                        {e.recurring && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 shrink-0">recurring</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#555555]">{e.date}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${e.source === 'stripe' ? 'bg-[#1E1E1E] text-[#E0E0E0]' : 'bg-white/10 text-[#A0A0A0]'}`}>{e.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-[#F0F0F0]">£{e.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
