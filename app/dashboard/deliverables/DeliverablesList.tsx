'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Status = 'upcoming' | 'in_progress' | 'done'

interface Deliverable {
  id: string
  title: string
  category: string
  status: Status
  position: number
}

const STATUS_PILL: Record<Status, string> = {
  done: 'bg-emerald-500/10 text-emerald-300',
  in_progress: 'bg-amber-500/10 text-amber-300',
  upcoming: 'bg-white/10 text-[#A0A0A0]',
}
const STATUS_LABEL: Record<Status, string> = {
  done: 'Done',
  in_progress: 'In progress',
  upcoming: 'Upcoming',
}

function ContextMenu({ onSelect, onClose }: { onSelect: (s: Status) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-0 top-6 bg-[#141414] border border-[#252525] rounded-lg shadow-lg z-20 py-1 w-40">
      {(['upcoming', 'in_progress', 'done'] as Status[]).map(s => (
        <button key={s} onClick={() => { onSelect(s); onClose() }}
          className="w-full text-left px-3 py-1.5 text-xs font-medium text-[#C8C8C8] hover:bg-[#0F0F0F] cursor-pointer transition-colors">
          Set as {STATUS_LABEL[s].toLowerCase()}
        </button>
      ))}
    </div>
  )
}

function DeliverableRow({ d, isAdmin, clientId }: { d: Deliverable; isAdmin: boolean; clientId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(d.status)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function updateStatus(next: Status) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('deliverables').update({ status: next }).eq('id', d.id)

    if (next === 'done' && status !== 'done') {
      await supabase.from('notifications').insert({
        client_id: clientId,
        type: 'deliverable_done',
        title: `${d.title} is complete`,
        message: `Your operator has marked "${d.title}" as done. Keep the momentum going!`,
      })
    }

    setStatus(next)
    setSaving(false)
    router.refresh()
  }

  function handleCheck(checked: boolean) {
    updateStatus(checked ? 'done' : 'upcoming')
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-1 group border-b border-[#252525] last:border-0">
      {isAdmin ? (
        <button
          onClick={() => handleCheck(status !== 'done')}
          disabled={saving}
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-[#D1D5DB] hover:border-emerald-500'}`}
        >
          {status === 'done' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      ) : (
        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-[#D1D5DB]'}`}>
          {status === 'done' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      )}
      <span className={`flex-1 text-sm ${status === 'done' ? 'line-through text-[#555555]' : 'text-[#C8C8C8]'}`}>{d.title}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_PILL[status]}`}>{STATUS_LABEL[status]}</span>
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-5 h-5 rounded flex items-center justify-center text-[#555555] hover:text-[#C8C8C8] hover:bg-[#0F0F0F] cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="2" r="1" fill="currentColor"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="10" r="1" fill="currentColor"/></svg>
            </button>
            {menuOpen && <ContextMenu onSelect={updateStatus} onClose={() => setMenuOpen(false)} />}
          </div>
        )}
      </div>
    </div>
  )
}

const inputClass = 'w-full h-9 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

export function DeliverablesList({
  deliverables,
  isAdmin,
  clientId,
}: {
  deliverables: Deliverable[]
  isAdmin: boolean
  clientId: string
}) {
  const router = useRouter()
  const frontend = deliverables.filter(d => d.category === 'frontend')
  const backend = deliverables.filter(d => d.category === 'backend')
  const total = deliverables.length
  const done = deliverables.filter(d => d.status === 'done').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const allDone = total > 0 && done === total

  const [addCategory, setAddCategory] = useState<'frontend' | 'backend'>('frontend')
  const [addTitle, setAddTitle] = useState('')
  const [addPosition, setAddPosition] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addTitle.trim()) return
    setAddSaving(true)
    const supabase = createClient()
    await supabase.from('deliverables').insert({
      client_id: clientId,
      title: addTitle.trim(),
      category: addCategory,
      status: 'upcoming',
      position: addPosition ? parseInt(addPosition) : 99,
    })
    setAddTitle(''); setAddPosition('')
    setAddSaving(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
        {allDone && (
          <div className="flex items-center gap-2 mb-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
            <span className="text-lg">🎉</span>
            <p className="text-sm font-semibold text-emerald-400">All deliverables complete!</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#C8C8C8]">{done} of {total} deliverables complete</span>
          <span className="text-sm font-bold text-[#F0F0F0]">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-[#0F0F0F] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Front-end', sub: 'Content & Instagram', items: frontend },
          { label: 'Back-end', sub: 'Systems & Funnels', items: backend },
        ].map(col => (
          <div key={col.label} className="bg-[#141414] border border-[#252525] rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#F0F0F0]">{col.label}</h3>
              <p className="text-xs text-[#555555]">{col.sub}</p>
            </div>
            {col.items.length === 0 ? (
              <p className="text-xs text-[#C4C9D8] py-2">No deliverables in this category.</p>
            ) : (
              col.items.map(d => (
                <DeliverableRow key={d.id} d={d} isAdmin={isAdmin} clientId={clientId} />
              ))
            )}
          </div>
        ))}
      </div>

      {/* Admin add form */}
      {isAdmin && (
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Add custom deliverable</h3>
          <form onSubmit={submitAdd} className="flex gap-3 items-end flex-wrap">
            <div className="flex flex-col gap-1.5 flex-1 min-w-40">
              <label className="text-xs font-medium text-[#888888]">Title</label>
              <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Deliverable title" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Category</label>
              <select value={addCategory} onChange={e => setAddCategory(e.target.value as 'frontend' | 'backend')} className={inputClass + ' w-36'}>
                <option value="frontend">Front-end</option>
                <option value="backend">Back-end</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Position</label>
              <input type="number" min="1" value={addPosition} onChange={e => setAddPosition(e.target.value)} placeholder="99" className={inputClass + ' w-20'} />
            </div>
            <button type="submit" disabled={addSaving || !addTitle.trim()}
              className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              {addSaving ? 'Adding…' : 'Add'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
