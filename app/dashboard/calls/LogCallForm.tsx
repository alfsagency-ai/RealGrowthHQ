'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogCallForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [leadName, setLeadName] = useState('')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })
  const [type, setType] = useState('discovery')
  const [outcome, setOutcome] = useState('pending')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadName) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.from('calls').insert({
      client_id: clientId,
      lead_name: leadName,
      date: new Date(date).toISOString(),
      type,
      outcome,
      notes: notes || null,
      source: 'manual',
    })

    if (err) { setError(err.message); setSaving(false); return }

    setLeadName('')
    setNotes('')
    setToast('Call logged!')
    setTimeout(() => setToast(null), 3000)
    setSaving(false)
    router.refresh()
  }

  const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-md z-10">
          {toast}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Log a call manually</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Lead name</label>
          <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="e.g. Sarah Johnson" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Date & time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
              <option value="discovery">Discovery</option>
              <option value="followup">Follow-up</option>
              <option value="sales">Sales</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Outcome</label>
            <select value={outcome} onChange={e => setOutcome(e.target.value)} className={inputClass}>
              <option value="pending">Pending</option>
              <option value="showed">Showed</option>
              <option value="noshow">No-show</option>
              <option value="proposal_sent">Proposal sent</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Call notes…" className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={saving} className="mt-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          {saving ? 'Logging…' : 'Log call'}
        </button>
      </form>
    </div>
  )
}
