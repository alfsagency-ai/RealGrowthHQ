'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COLUMNS = ['Lead', 'Contacted', 'Call booked', 'Proposal sent', 'Closed'] as const
type Column = typeof COLUMNS[number]

const COL_COLORS: Record<Column, string> = {
  Lead: 'bg-white/10 text-[#A0A0A0]',
  Contacted: 'bg-blue-500/10 text-blue-300',
  'Call booked': 'bg-amber-500/10 text-amber-300',
  'Proposal sent': 'bg-purple-500/10 text-purple-300',
  Closed: 'bg-emerald-500/10 text-emerald-300',
}

const COL_HEADER: Record<Column, string> = {
  Lead: 'bg-white/5 border-white/10',
  Contacted: 'bg-blue-500/5 border-blue-500/20',
  'Call booked': 'bg-amber-500/5 border-amber-500/20',
  'Proposal sent': 'bg-purple-50/50 border-purple-100',
  Closed: 'bg-emerald-50/50 border-emerald-100',
}

interface Lead {
  id: string
  name: string
  source: string | null
  value: number | null
  stage: string
  notes: string | null
  follow_up_date: string | null
  created_at: string
}

function isOverdue(date: string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const overdue = isOverdue(lead.follow_up_date)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#141414] border border-[#252525] rounded-lg p-3 cursor-pointer hover:border-white/20 hover:shadow-sm transition-all select-none"
    >
      <p className="text-sm font-semibold text-[#F0F0F0] mb-1 leading-tight">{lead.name}</p>
      {lead.source && <p className="text-[11px] text-[#555555] mb-2">{lead.source}</p>}
      <div className="flex items-center justify-between">
        {lead.value != null
          ? <span className="text-xs font-semibold text-[#E0E0E0]">£{lead.value.toLocaleString()}</span>
          : <span />
        }
        {overdue && (
          <span className="text-[10px] font-semibold bg-red-500/10 text-red-300 px-1.5 py-0.5 rounded-full">Overdue</span>
        )}
      </div>
      {lead.follow_up_date && !overdue && (
        <p className="text-[11px] text-[#555555] mt-1">
          Follow up {new Date(lead.follow_up_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </div>
  )
}

function DragCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-[#141414] border border-white/15 rounded-lg p-3 shadow-lg rotate-1">
      <p className="text-sm font-semibold text-[#F0F0F0]">{lead.name}</p>
      {lead.value != null && <span className="text-xs font-semibold text-[#E0E0E0]">£{lead.value.toLocaleString()}</span>}
    </div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
  )
}

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'
const taClass = 'w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none'

export function KanbanBoard({ leads: initialLeads, userId }: { leads: Lead[]; userId: string }) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedLead = selectedId ? leads.find(l => l.id === selectedId) ?? null : null

  // Edit state
  const [eName, setEName] = useState('')
  const [eSource, setESource] = useState('')
  const [eValue, setEValue] = useState('')
  const [eStage, setEStage] = useState<Column>('Lead')
  const [eNotes, setENotes] = useState('')
  const [eFollowUp, setEFollowUp] = useState('')

  function openLead(lead: Lead) {
    setSelectedId(lead.id)
    setEName(lead.name)
    setESource(lead.source ?? '')
    setEValue(lead.value != null ? String(lead.value) : '')
    setEStage(lead.stage as Column)
    setENotes(lead.notes ?? '')
    setEFollowUp(lead.follow_up_date ?? '')
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const byColumn = useCallback((col: Column) => leads.filter(l => l.stage === col), [leads])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const overId = over.id as string
    const activeLeadStage = leads.find(l => l.id === active.id)?.stage
    const targetStage = COLUMNS.includes(overId as Column) ? overId : leads.find(l => l.id === overId)?.stage
    if (activeLeadStage !== targetStage && targetStage) {
      setLeads(prev => prev.map(l => l.id === active.id ? { ...l, stage: targetStage as Column } : l))
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const overId = over.id as string
    const lead = leads.find(l => l.id === active.id)
    if (!lead) return
    const targetStage = COLUMNS.includes(overId as Column) ? overId : leads.find(l => l.id === overId)?.stage
    if (!targetStage) return

    const supabase = createClient()
    await supabase.from('pipeline_leads').update({ stage: targetStage }).eq('id', lead.id)
    router.refresh()
  }

  async function saveLead() {
    if (!selectedLead || !eName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const update = {
      name: eName.trim(),
      source: eSource || null,
      value: eValue ? parseInt(eValue) : null,
      stage: eStage,
      notes: eNotes || null,
      follow_up_date: eFollowUp || null,
    }
    await supabase.from('pipeline_leads').update(update).eq('id', selectedLead.id)
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...update } : l))
    setSaving(false)
    setSelectedId(null)
    router.refresh()
  }

  async function deleteLead() {
    if (!selectedLead) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('pipeline_leads').delete().eq('id', selectedLead.id)
    setLeads(prev => prev.filter(l => l.id !== selectedLead.id))
    setDeleting(false)
    setSelectedId(null)
    router.refresh()
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) ?? null : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map(col => {
            const colLeads = byColumn(col)
            return (
              <div key={col} className={`flex-shrink-0 w-56 rounded-xl border p-3 flex flex-col gap-2 ${COL_HEADER[col]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${COL_COLORS[col]}`}>{col}</span>
                  <span className="text-[11px] text-[#555555] font-medium">{colLeads.length}</span>
                </div>
                <SortableContext items={colLeads.map(l => l.id)} strategy={verticalListSortingStrategy} id={col}>
                  <div className="flex flex-col gap-2 min-h-[60px]">
                    {colLeads.map(lead => (
                      <LeadCard key={lead.id} lead={lead} onClick={() => openLead(lead)} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>
        <DragOverlay>
          {activeLead ? <DragCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Lead detail panel */}
      <div className={`fixed inset-0 z-50 ${selectedLead ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedLead ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSelectedId(null)} />
        <div className={`absolute right-0 top-0 h-full w-[440px] bg-[#141414] border-l border-[#252525] shadow-xl flex flex-col transition-transform duration-300 ${selectedLead ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedLead && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
                <h3 className="text-sm font-semibold text-[#F0F0F0]">Edit lead</h3>
                <CloseBtn onClick={() => setSelectedId(null)} />
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Name</label>
                  <input value={eName} onChange={e => setEName(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Source</label>
                  <input value={eSource} onChange={e => setESource(e.target.value)} placeholder="e.g. Instagram DM" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Deal value (£)</label>
                  <input type="number" min="0" value={eValue} onChange={e => setEValue(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Stage</label>
                  <select value={eStage} onChange={e => setEStage(e.target.value as Column)} className={inputClass}>
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Follow-up date</label>
                  <input type="date" value={eFollowUp} onChange={e => setEFollowUp(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#888888]">Notes</label>
                  <textarea value={eNotes} onChange={e => setENotes(e.target.value)} rows={4} className={taClass} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#252525] flex gap-2">
                <button onClick={deleteLead} disabled={deleting}
                  className="h-9 px-4 rounded-lg border border-red-200 text-red-500 hover:bg-red-900/20 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
                <button onClick={saveLead} disabled={saving || !eName.trim()}
                  className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
