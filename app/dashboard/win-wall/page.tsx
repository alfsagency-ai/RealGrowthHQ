import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const TYPE_BORDER: Record<string, string> = {
  first_lead: 'border-l-[#E8E8E8]',
  first_call: 'border-l-purple-500',
  revenue_milestone: 'border-l-emerald-500',
  content_win: 'border-l-amber-500',
  custom: 'border-l-gray-400',
}

const TYPE_BADGE: Record<string, string> = {
  first_lead: 'bg-[#1E1E1E] text-[#E0E0E0]',
  first_call: 'bg-purple-500/10 text-purple-300',
  revenue_milestone: 'bg-emerald-500/10 text-emerald-300',
  content_win: 'bg-amber-500/10 text-amber-300',
  custom: 'bg-white/10 text-[#A0A0A0]',
}

const TYPE_LABEL: Record<string, string> = {
  first_lead: 'First lead',
  first_call: 'First call',
  revenue_milestone: 'Revenue milestone',
  content_win: 'Content win',
  custom: 'Custom',
}

const TYPE_ICON: Record<string, string> = {
  first_lead: '🎯',
  first_call: '📞',
  revenue_milestone: '💰',
  content_win: '🎬',
  custom: '⭐',
}

interface Win {
  id: string
  title: string
  description: string | null
  type: string
  created_at: string
}

export default async function WinWallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wins } = await supabase
    .from('wins')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const all: Win[] = wins ?? []

  return (
    <div className="flex flex-col gap-0 max-w-3xl">
      {/* Banner */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your wins</h1>
          <p className="text-sm text-white/50 mt-1">Every milestone you&apos;ve hit — this is your highlight reel.</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-extrabold text-[#E0E0E0]">{all.length}</span>
          <p className="text-sm text-white/40 mt-0.5">wins</p>
        </div>
      </div>

      {/* Feed */}
      {all.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 8l5.09 15.66H54l-13.55 9.84L45.63 49 32 39.16 18.37 49l4.18-15.5L9 23.66h16.91L32 8Z" stroke="#C4C9D8" strokeWidth="2.5" strokeLinejoin="round"/>
          </svg>
          <div className="text-center">
            <p className="text-lg font-semibold text-[#C8C8C8]">No wins logged yet</p>
            <p className="text-sm text-[#555555] mt-1">Your operator will add your first win soon.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {all.map(win => (
            <div key={win.id} className={`bg-[#141414] border border-[#252525] border-l-4 ${TYPE_BORDER[win.type] ?? TYPE_BORDER.custom} rounded-xl p-5 flex items-start gap-4`}>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-[18px] font-bold text-[#F0F0F0] leading-tight">{win.title}</h3>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${TYPE_BADGE[win.type] ?? TYPE_BADGE.custom}`}>
                    {TYPE_LABEL[win.type] ?? 'Custom'}
                  </span>
                </div>
                {win.description && (
                  <p className="text-sm text-[#888888] leading-relaxed mt-1">{win.description}</p>
                )}
                <p className="text-xs text-[#555555] mt-3">
                  {new Date(win.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="text-[32px] shrink-0 select-none">{TYPE_ICON[win.type] ?? '⭐'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
