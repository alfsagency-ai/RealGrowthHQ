'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Client { id: string; name: string | null; email: string }

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

export function NoteForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || !clientId) return
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { error: err } = await supabase.from('operator_notes').insert({
      client_id: clientId,
      note: note.trim(),
    })

    if (err) { setError(err.message); setSaving(false); return }

    await supabase.from('notifications').insert({
      client_id: clientId,
      type: 'operator_message',
      title: 'New note from your operator',
      message: note.trim().slice(0, 100) + (note.trim().length > 100 ? '…' : ''),
    })

    const clientName = clients.find(c => c.id === clientId)?.name ?? 'client'
    setNote('')
    setSaving(false)
    setToast(`Note sent to ${clientName}`)
    setTimeout(() => setToast(null), 3000)
    router.refresh()
  }

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-md z-10">{toast}</div>
      )}
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Post operator note</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputClass}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name ?? c.email}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="Write a note for your client…"
            className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" required />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={saving || !note.trim() || !clientId}
          className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          {saving ? 'Sending…' : 'Send note'}
        </button>
      </form>
    </div>
  )
}
