import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from './KanbanBoard'
import { AddLeadForm } from './AddLeadForm'

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-[#888888] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#F0F0F0]">{value}</p>
      {sub && <p className="text-xs text-[#555555] mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('pipeline_leads')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const all = leads ?? []
  const today = new Date().toISOString().split('T')[0]

  const totalLeads = all.length
  const closed = all.filter(l => l.stage === 'Closed').length
  const pipelineValue = all
    .filter(l => l.stage !== 'Closed')
    .reduce((sum, l) => sum + (l.value ?? 0), 0)
  const overdue = all.filter(l => l.follow_up_date && l.follow_up_date < today && l.stage !== 'Closed')
  const closeRate = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Pipeline</h1>
          <p className="text-sm text-[#888888] mt-1">Track leads from first contact to close.</p>
        </div>
        <AddLeadForm userId={user.id} />
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/><path d="M8 5v3.5M8 11h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <p className="text-sm text-red-400 font-medium">
            {overdue.length} lead{overdue.length > 1 ? 's' : ''} overdue for follow-up: {overdue.map(l => l.name).join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total leads" value={String(totalLeads)} />
        <MetricCard label="Closed" value={String(closed)} sub={`${closeRate}% close rate`} />
        <MetricCard label="Pipeline value" value={`£${pipelineValue.toLocaleString()}`} sub="Active deals" />
        <MetricCard label="Overdue follow-ups" value={String(overdue.length)} sub={overdue.length > 0 ? 'Need attention' : 'All up to date'} />
      </div>

      <KanbanBoard leads={all} userId={user.id} />
    </div>
  )
}
