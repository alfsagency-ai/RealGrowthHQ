'use client'

import { useState } from 'react'
import {
  DndContext, DragOverlay, DragStartEvent, DragEndEvent,
  PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Stage = 'lead' | 'onboarding' | 'active' | 'at_risk' | 'churned'

interface Contact {
  id: string
  owner_id: string
  name: string
  email: string | null
  phone: string | null
  stage: Stage
  monthly_value: number
  notes: string | null
  position: number
}

const COLUMNS: { id: Stage; label: string; dot: string; badge: string }[] = [
  { id: 'lead',        label: 'Lead',        dot: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-300' },
  { id: 'onboarding',  label: 'Onboarding',  dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-300' },
  { id: 'active',      label: 'Active',      dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-300' },
  { id: 'at_risk',     label: 'At Risk',     dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-300' },
  { id: 'churned',     label: 'Churned',     dot: 'bg-purple-400',  badge: 'bg-purple-500/10 text-purple-300' },
]

const STAGE_BADGE: Record<Stage, string> = {
  lead:       'bg-blue-500/10 text-blue-300',
  onboarding: 'bg-amber-500/10 text-amber-300',
  active:     'bg-emerald-500/10 text-emerald-300',
  at_risk:    'bg-red-500/10 text-red-300',
  churned:    'bg-purple-500/10 text-purple-300',
}

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

// ── Draggable card ────────────────────────────────────────────────────────────

function ContactCard({ contact, onClick, overlay = false }: { contact: Contact; onClick?: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: contact.id })

  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined

  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const col = COLUMNS.find(c => c.id === contact.stage)

  if (overlay) {
    return (
      <div className="bg-[#141414] border border-white/15 rounded-xl p-3 shadow-xl rotate-1 w-[200px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-[#E0E0E0] text-xs font-bold flex items-center justify-center shrink-0">{initials}</div>
          <p className="text-sm font-semibold text-[#F0F0F0] truncate">{contact.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-[#141414] border border-[#252525] rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-all group ${isDragging ? 'opacity-40' : 'hover:border-white/20 hover:shadow-sm'}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-[#E0E0E0] text-xs font-bold flex items-center justify-center shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F0F0F0] truncate">{contact.name}</p>
          {contact.email && <p className="text-xs text-[#555555] truncate">{contact.email}</p>}
        </div>
      </div>
      {(contact.monthly_value > 0 || contact.phone) && (
        <div className="mt-2 flex items-center gap-2">
          {contact.monthly_value > 0 && (
            <span className="text-xs font-semibold text-emerald-400">£{contact.monthly_value.toLocaleString()}/mo</span>
          )}
          {contact.phone && (
            <span className="text-xs text-[#555555]">{contact.phone}</span>
          )}
        </div>
      )}
      {contact.notes && (
        <p className="mt-1.5 text-xs text-[#555555] line-clamp-1">{contact.notes}</p>
      )}
    </div>
  )
}

// ── Droppable column ──────────────────────────────────────────────────────────

function Column({ col, contacts, onCardClick }: {
  col: typeof COLUMNS[number]
  contacts: Contact[]
  onCardClick: (c: Contact) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div className="flex flex-col gap-2 min-w-[200px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
        <span className="text-sm font-semibold text-[#F0F0F0]">{col.label}</span>
        <span className="ml-auto text-[11px] font-semibold text-[#888888] bg-[#1A1A1A] w-5 h-5 rounded-full flex items-center justify-center">{contacts.length}</span>
      </div>

      {/* Cards + drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 min-h-[140px] rounded-xl p-2 border-2 border-dashed transition-colors ${isOver ? 'border-white/25 bg-[#1E1E1E]/60' : 'border-[#252525]'}`}
      >
        {contacts.map(c => (
          <ContactCard key={c.id} contact={c} onClick={() => onCardClick(c)} />
        ))}
        {contacts.length === 0 && (
          <p className="text-xs text-center text-[#D1D5DB] py-6 select-none">Drop here</p>
        )}
      </div>
    </div>
  )
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────

function ContactModal({
  contact,
  ownerId,
  onClose,
  onSaved,
  onDeleted,
}: {
  contact: Contact | null
  ownerId: string
  onClose: () => void
  onSaved: (c: Contact) => void
  onDeleted?: (id: string) => void
}) {
  const [name, setName] = useState(contact?.name ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [stage, setStage] = useState<Stage>(contact?.stage ?? 'lead')
  const [monthly, setMonthly] = useState(contact?.monthly_value ? String(contact.monthly_value) : '')
  const [notes, setNotes] = useState(contact?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      owner_id: ownerId,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      stage,
      monthly_value: parseFloat(monthly) || 0,
      notes: notes.trim() || null,
    }
    if (contact) {
      const { data } = await supabase.from('client_contacts').update(payload).eq('id', contact.id).select().single()
      if (data) onSaved(data as Contact)
    } else {
      const { data } = await supabase.from('client_contacts').insert({ ...payload, position: 0 }).select().single()
      if (data) onSaved(data as Contact)
    }
    setSaving(false)
    onClose()
  }

  async function del() {
    if (!contact) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('client_contacts').delete().eq('id', contact.id)
    onDeleted?.(contact.id)
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[#141414] rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F0F0F0]">{contact ? 'Edit client' : 'Add client'}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <form onSubmit={save} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Client name" className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} type="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900000" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value as Stage)} className={inputClass}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Monthly value (£)</label>
              <input value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="0" type="number" min="0" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any context about this client…"
              className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" />
          </div>
          <div className="flex gap-2 mt-1">
            {contact && (
              <button type="button" onClick={del} disabled={deleting}
                className="h-10 px-4 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button type="submit" disabled={saving || !name.trim()}
              className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              {saving ? 'Saving…' : contact ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export function ClientsBoard({ initialContacts, ownerId }: { initialContacts: Contact[]; ownerId: string }) {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const totalClients = contacts.filter(c => c.stage !== 'churned').length
  const mrr = contacts
    .filter(c => c.stage === 'active')
    .reduce((sum, c) => sum + (c.monthly_value ?? 0), 0)

  const byStage = (stage: Stage) => contacts.filter(c => c.stage === stage)

  const draggedContact = draggedId ? contacts.find(c => c.id === draggedId) ?? null : null

  function handleDragStart({ active }: DragStartEvent) {
    setDraggedId(String(active.id))
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggedId(null)
    if (!over) return
    const newStage = over.id as Stage
    const contact = contacts.find(c => c.id === active.id)
    if (!contact || contact.stage === newStage) return

    setContacts(prev => prev.map(c => c.id === active.id ? { ...c, stage: newStage } : c))
    const supabase = createClient()
    await supabase.from('client_contacts').update({ stage: newStage }).eq('id', active.id)
  }

  function handleSaved(saved: Contact) {
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      if (idx >= 0) return prev.map(c => c.id === saved.id ? saved : c)
      return [...prev, saved]
    })
  }

  function handleDeleted(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Clients</h1>
          <p className="text-sm text-[#888888] mt-0.5">
            {totalClients} {totalClients === 1 ? 'client' : 'clients'}
            {mrr > 0 && (
              <> · <span className="font-semibold text-emerald-400">£{mrr.toLocaleString()}/mo MRR</span></>
            )}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add client
        </button>
      </div>

      {/* Kanban */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1 items-start">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              col={col}
              contacts={byStage(col.id)}
              onCardClick={setEditing}
            />
          ))}
        </div>

        <DragOverlay>
          {draggedContact && <ContactCard contact={draggedContact} overlay />}
        </DragOverlay>
      </DndContext>

      {/* Stage legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#252525]">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className="text-xs text-[#888888]">{col.label}</span>
            <span className="text-xs font-semibold text-[#C8C8C8]">{byStage(col.id).length}</span>
          </div>
        ))}
      </div>

      {(addOpen || editing) && (
        <ContactModal
          contact={editing}
          ownerId={ownerId}
          onClose={() => { setAddOpen(false); setEditing(null) }}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
