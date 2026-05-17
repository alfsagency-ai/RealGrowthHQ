import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMondayOfCurrentWeek } from '@/lib/utils'
import { WeekSelector } from '../content-plan/WeekSelector'
import { FunnelViz } from './FunnelViz'
import { FunnelForm } from './FunnelForm'

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const weekStart = week ?? getMondayOfCurrentWeek()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: metrics } = await supabase
    .from('funnel_metrics')
    .select('*')
    .eq('client_id', user.id)
    .eq('week_start', weekStart)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Funnel</h1>
          <p className="text-sm text-[#888888] mt-1">Track your weekly conversion metrics.</p>
        </div>
        <WeekSelector weekStart={weekStart} />
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-[3] bg-[#141414] border border-[#252525] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#F0F0F0] mb-4">Conversion funnel</h2>
          <FunnelViz metrics={metrics ?? null} />
        </div>
        <div className="flex-[2]">
          <FunnelForm clientId={user.id} weekStart={weekStart} />
        </div>
      </div>
    </div>
  )
}
