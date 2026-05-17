'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogRevenueForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [isRecurring, setIsRecurring] = useState(false)
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.from('revenue_entries').insert({
      client_id: clientId,
      description,
      amount: parseFloat(amount),
      date,
      source: 'manual',
      is_recurring: isRecurring,
      notes: notes || null,
    })

    if (err) { setError(err.message); setSaving(false); return }

    setDescription('')
    setAmount('')
    setDate(today)
    setIsRecurring(false)
    setNotes('')
    setToast('Payment logged!')
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
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Log revenue manually</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 1:1 coaching — March" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">£</span>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1500.00" required className={`${inputClass} pl-7`} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional details…" className="w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none" />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setIsRecurring(v => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${isRecurring ? 'bg-emerald-500' : 'bg-[#1E1E1E]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs font-medium text-[#C8C8C8]">Recurring payment</span>
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={saving} className="mt-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          {saving ? 'Saving…' : 'Log payment'}
        </button>
      </form>
    </div>
  )
}
