import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogWinForm } from './LogWinForm'

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
  first_lead: 'First lead', first_call: 'First call',
  revenue_milestone: 'Revenue milestone', content_win: 'Content win', custom: 'Custom',
}
const TYPE_ICON: Record<string, string> = {
  first_lead: '🎯', first_call: '📞', revenue_milestone: '💰', content_win: '🎬', custom: '⭐',
}

interface Win { id: string; title: string; description: string | null; type: string; created_at: string }

export default async function AdminWinWallPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client: clientParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!clientParam) {
    const { data: clients } = await supabase.rpc('get_clients')

    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Win wall — log a win</h1>
          <p className="text-sm text-[#888888] mt-1">Select a client to view their wins or log a new one.</p>
        </div>
        <div className="flex flex-col gap-2">
          {(clients ?? []).map((c: { id: string; name: string | null; email: string }) => (
            <a key={c.id} href={`/admin/win-wall?client=${c.id}`}
              className="flex items-center justify-between bg-[#141414] border border-[#252525] rounded-xl px-5 py-4 hover:border-white/20 hover:shadow-sm transition-all group">
              <div>
                <p className="text-sm font-semibold text-[#F0F0F0]">{c.name ?? 'Unnamed'}</p>
                <p className="text-xs text-[#555555]">{c.email}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#555555] group-hover:text-[#E0E0E0] transition-colors"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const [{ data: clientRows }, { data: wins }] = await Promise.all([
    supabase.rpc('get_client_by_id', { client_id: clientParam }),
    supabase.from('wins').select('*').eq('client_id', clientParam).order('created_at', { ascending: false }),
  ])

  const all: Win[] = wins ?? []
  const clientProfile = clientRows?.[0] ?? null
  const clientName = clientProfile?.name ?? clientProfile?.email ?? 'Client'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <a href="/admin/win-wall" className="text-sm text-[#888888] hover:text-[#E0E0E0] cursor-pointer transition-colors">← All clients</a>
        <span className="text-[#666666]">/</span>
        <span className="text-sm font-medium text-[#F0F0F0]">{clientName}</span>
      </div>

      {/* Banner */}
      <div className="bg-[#0F1523] rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{clientName}&apos;s wins</h1>
          <p className="text-sm text-white/50 mt-1">Every milestone they&apos;ve hit.</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-extrabold text-[#E0E0E0]">{all.length}</span>
          <p className="text-sm text-white/40 mt-0.5">wins</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        {/* Wins feed */}
        <div>
          {all.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#141414] border border-dashed border-[#252525] rounded-xl">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none"><path d="M32 8l5.09 15.66H54l-13.55 9.84L45.63 49 32 39.16 18.37 49l4.18-15.5L9 23.66h16.91L32 8Z" stroke="#C4C9D8" strokeWidth="2.5" strokeLinejoin="round"/></svg>
              <p className="text-sm text-[#555555]">No wins logged yet — add the first one.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {all.map(win => (
                <div key={win.id} className={`bg-[#141414] border border-[#252525] border-l-4 ${TYPE_BORDER[win.type] ?? TYPE_BORDER.custom} rounded-xl p-5 flex items-start gap-4`}>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-[16px] font-bold text-[#F0F0F0] leading-tight">{win.title}</h3>
                      <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${TYPE_BADGE[win.type] ?? TYPE_BADGE.custom}`}>{TYPE_LABEL[win.type] ?? 'Custom'}</span>
                    </div>
                    {win.description && <p className="text-sm text-[#888888] mt-1 leading-relaxed">{win.description}</p>}
                    <p className="text-xs text-[#555555] mt-2">{new Date(win.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className="text-[28px] shrink-0 select-none">{TYPE_ICON[win.type] ?? '⭐'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log form */}
        <div className="sticky top-0">
          <LogWinForm clientId={clientParam} clientName={clientName} />
        </div>
      </div>
    </div>
  )
}
