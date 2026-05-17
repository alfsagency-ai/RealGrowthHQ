'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STAGES = ['Lead', 'Contacted', 'Call booked', 'Proposal sent', 'Closed'] as const
const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

export function AddLeadForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('Lead')
  const [followUp, setFollowUp] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('pipeline_leads').insert({
      client_id: userId,
      name: name.trim(),
      source: source || null,
      value: value ? parseInt(value) : null,
      stage,
      follow_up_date: followUp || null,
      notes: notes || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setName(''); setSource(''); setValue(''); setStage('Lead'); setFollowUp(''); setNotes('')
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
        + Add lead
      </button>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F0F0F0]">Add new lead</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-[#888888] hover:text-[#C8C8C8] cursor-pointer">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Lead name" className={inputClass} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Source</label>
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Instagram DM" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Value (£)</label>
            <input type="number" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="0" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-medium text-[#888888]">Follow-up date</label>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any notes about this lead…"
            className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={saving || !name.trim()}
          className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          {saving ? 'Saving…' : 'Add lead'}
        </button>
      </form>
    </div>
  )
}
