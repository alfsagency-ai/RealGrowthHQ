'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getMondayOfCurrentWeek } from '@/lib/utils'

const CHECKLIST = [
  'Lead magnet created',
  'Email welcome sequence live',
  'Call booking page set up',
  'Sales / offer page built',
  'Follow-up email sequence',
  'Onboarding flow ready',
]

export function FunnelForm({ clientId, weekStart }: { clientId: string; weekStart: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState<boolean[]>(Array(CHECKLIST.length).fill(false))

  useEffect(() => {
    const saved = localStorage.getItem('mrscale_funnel_checklist')
    if (saved) { try { setChecked(JSON.parse(saved)) } catch { /* ignore */ } }
  }, [])

  function toggleCheck(i: number) {
    const next = checked.map((v, idx) => idx === i ? !v : v)
    setChecked(next)
    localStorage.setItem('mrscale_funnel_checklist', JSON.stringify(next))
  }

  const [reach, setReach] = useState('')
  const [profileVisits, setProfileVisits] = useState('')
  const [bioClicks, setBioClicks] = useState('')
  const [optins, setOptins] = useState('')
  const [callsBooked, setCallsBooked] = useState('')
  const [clientsClosed, setClientsClosed] = useState('')
  const [formWeek, setFormWeek] = useState(weekStart || getMondayOfCurrentWeek())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('funnel_metrics').insert({
      client_id: clientId,
      week_start: formWeek,
      reach: reach ? parseInt(reach) : null,
      profile_visits: profileVisits ? parseInt(profileVisits) : null,
      bio_clicks: bioClicks ? parseInt(bioClicks) : null,
      optins: optins ? parseInt(optins) : null,
      calls_booked: callsBooked ? parseInt(callsBooked) : null,
      clients_closed: clientsClosed ? parseInt(clientsClosed) : null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setToast('Funnel updated!')
    setTimeout(() => setToast(null), 3000)
    setSaving(false)
    router.refresh()
  }

  const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

  return (
    <div className="flex flex-col gap-4">
      {/* Checklist */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Funnel asset checklist</h3>
        <div className="flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => toggleCheck(i)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-[#D1D5DB] group-hover:border-emerald-500'}`}>
                {checked[i] && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className={`text-sm transition-colors ${checked[i] ? 'line-through text-[#555555]' : 'text-[#C8C8C8]'}`}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Update form */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 relative">
        {toast && <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-md z-10">{toast}</div>}
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Update funnel numbers</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Week starting</label>
            <input type="date" value={formWeek} onChange={e => setFormWeek(e.target.value)} className={inputClass} />
          </div>
          {[
            { label: 'Instagram reach', val: reach, set: setReach },
            { label: 'Profile visits', val: profileVisits, set: setProfileVisits },
            { label: 'Bio link clicks', val: bioClicks, set: setBioClicks },
            { label: 'Email opt-ins', val: optins, set: setOptins },
            { label: 'Calls booked', val: callsBooked, set: setCallsBooked },
            { label: 'Clients closed', val: clientsClosed, set: setClientsClosed },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">{label}</label>
              <input type="number" min="0" value={val} onChange={e => set(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={saving} className="mt-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            {saving ? 'Saving…' : 'Save funnel data'}
          </button>
        </form>
      </div>
    </div>
  )
}
