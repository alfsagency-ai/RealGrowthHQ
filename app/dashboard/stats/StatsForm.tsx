'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMondayOfCurrentWeek } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function StatsForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek())
  const [followers, setFollowers] = useState('')
  const [reach, setReach] = useState('')
  const [engagementRate, setEngagementRate] = useState('')
  const [avgReelViews, setAvgReelViews] = useState('')
  const [saves, setSaves] = useState('')
  const [dms, setDms] = useState('')
  const [bioClicks, setBioClicks] = useState('')
  const [emailLeads, setEmailLeads] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { error: err } = await supabase.from('stats_entries').insert({
      client_id: clientId,
      week_start: weekStart,
      followers: followers ? parseInt(followers) : null,
      reach: reach ? parseInt(reach) : null,
      engagement_rate: engagementRate ? parseFloat(engagementRate) : null,
      avg_reel_views: avgReelViews ? parseInt(avgReelViews) : null,
      saves: saves ? parseInt(saves) : null,
      dms: dms ? parseInt(dms) : null,
      bio_clicks: bioClicks ? parseInt(bioClicks) : null,
      email_leads: emailLeads ? parseInt(emailLeads) : null,
    })

    if (err) { setError(err.message); setSaving(false); return }

    setToast('Stats saved successfully!')
    setTimeout(() => setToast(null), 3000)
    setSaving(false)
    router.refresh()
  }

  const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-md">
          {toast}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Update this week&apos;s stats</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Week starting</label>
          <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className={inputClass} />
        </div>
        {[
          { label: 'Followers', value: followers, set: setFollowers, placeholder: '10400' },
          { label: 'Weekly reach', value: reach, set: setReach, placeholder: '32000' },
          { label: 'Engagement rate (%)', value: engagementRate, set: setEngagementRate, placeholder: '4.2' },
          { label: 'Avg reel views', value: avgReelViews, set: setAvgReelViews, placeholder: '8500' },
          { label: 'Saves', value: saves, set: setSaves, placeholder: '240' },
          { label: 'DM enquiries', value: dms, set: setDms, placeholder: '18' },
          { label: 'Bio link clicks', value: bioClicks, set: setBioClicks, placeholder: '95' },
          { label: 'Email leads', value: emailLeads, set: setEmailLeads, placeholder: '12' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">{label}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputClass} />
          </div>
        ))}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit" disabled={saving}
          className="mt-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save stats'}
        </button>
      </form>
    </div>
  )
}
