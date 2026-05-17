'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TYPES = [
  { value: 'first_lead', label: 'First lead' },
  { value: 'first_call', label: 'First call' },
  { value: 'revenue_milestone', label: 'Revenue milestone' },
  { value: 'content_win', label: 'Content win' },
  { value: 'custom', label: 'Custom' },
]

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

function today() {
  return new Date().toISOString().split('T')[0]
}

export function LogWinForm({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('custom')
  const [date, setDate] = useState(today())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('wins').insert({
      client_id: clientId,
      title: title.trim(),
      description: description.trim() || null,
      type,
      created_at: new Date(date).toISOString(),
    })
    if (err) { setError(err.message); setSaving(false); return }
    await supabase.from('notifications').insert({
      client_id: clientId,
      type: 'milestone',
      title: 'New win logged! 🎉',
      message: title.trim(),
    })
    setTitle(''); setDescription(''); setType('custom'); setDate(today())
    setSaving(false)
    setToast(`Win logged for ${clientName}!`)
    setTimeout(() => setToast(null), 3000)
    router.refresh()
  }

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-md z-10">{toast}</div>
      )}
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Log a win for {clientName}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. First client closed at £3k" className={inputClass} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="A bit more context about this win…"
            className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={saving || !title.trim()}
          className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          {saving ? 'Logging…' : 'Log win'}
        </button>
      </form>
    </div>
  )
}
