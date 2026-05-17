'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BriefProps {
  profile: {
    id: string
    name: string | null
    instagram_handle: string | null
    niche: string | null
    main_offer: string | null
    target_audience: string | null
    tone_of_voice: string | null
    revenue_goal: string | null
    pain_points: string | null
  }
}

const TONE_OPTIONS = [
  'Warm & relatable',
  'Direct & no-BS',
  'Professional & authoritative',
  'Energetic & motivational',
]

export function BrandBrief({ profile }: BriefProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(profile.name ?? '')
  const [handle, setHandle] = useState(profile.instagram_handle ?? '')
  const [niche, setNiche] = useState(profile.niche ?? '')
  const [mainOffer, setMainOffer] = useState(profile.main_offer ?? '')
  const [audience, setAudience] = useState(profile.target_audience ?? '')
  const [tone, setTone] = useState(profile.tone_of_voice ?? '')
  const [revenueGoal, setRevenueGoal] = useState(profile.revenue_goal ?? '')
  const [painPoints, setPainPoints] = useState(profile.pain_points ?? '')

  async function handleSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('users').update({
      name, instagram_handle: handle, niche, main_offer: mainOffer,
      target_audience: audience, tone_of_voice: tone,
      revenue_goal: revenueGoal, pain_points: painPoints,
    }).eq('id', profile.id)
    if (err) { setError(err.message); setSaving(false); return }
    setEditing(false)
    setSaving(false)
    router.refresh()
  }

  const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'
  const taClass = 'w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none'

  type FieldDef = {
    label: string; value: string; set: (v: string) => void; key: string;
    textarea?: boolean; select?: boolean; prefix?: string
  }
  const sections: { heading: string; fields: FieldDef[] }[] = [
    {
      heading: 'About you',
      fields: [
        { label: 'Name', value: name, set: setName, key: 'name' },
        { label: 'Instagram handle', value: handle, set: setHandle, key: 'handle' },
        { label: 'Niche', value: niche, set: setNiche, key: 'niche' },
      ],
    },
    {
      heading: 'Offer & audience',
      fields: [
        { label: 'Main offer', value: mainOffer, set: setMainOffer, key: 'offer', textarea: true },
        { label: 'Target audience', value: audience, set: setAudience, key: 'audience', textarea: true },
        { label: 'Tone of voice', value: tone, set: setTone, key: 'tone', select: true },
      ],
    },
    {
      heading: 'Goals',
      fields: [
        { label: 'Revenue goal', value: revenueGoal, set: setRevenueGoal, key: 'revenue', prefix: '£' },
        { label: 'Pain points', value: painPoints, set: setPainPoints, key: 'pain', textarea: true },
      ],
    },
  ]

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Your brand brief</h1>
          <p className="text-sm text-[#888888] mt-0.5">This is the foundation of your growth strategy.</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="h-9 px-4 border border-[#252525] rounded-lg text-sm font-medium text-[#C8C8C8] hover:bg-[#0F0F0F] transition-colors cursor-pointer"
          >
            Edit details
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)} className="text-sm text-[#888888] hover:text-[#F0F0F0] cursor-pointer">Cancel</button>
            <button
              onClick={handleSave} disabled={saving}
              className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {sections.map(section => (
        <div key={section.heading} className="bg-[#141414] border border-[#252525] rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-[#F0F0F0] uppercase tracking-wide">{section.heading}</h2>
          {section.fields.map(f => (
            <div key={f.key}>
              <p className="text-xs font-medium text-[#888888] mb-1.5">{f.label}</p>
              {editing ? (
                f.select ? (
                  <select value={f.value} onChange={e => f.set(e.target.value)} className={inputClass}>
                    {TONE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.textarea ? (
                  <textarea value={f.value} onChange={e => f.set(e.target.value)} rows={3} className={taClass} />
                ) : (
                  <div className="relative">
                    {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">{f.prefix}</span>}
                    <input
                      type="text" value={f.value} onChange={e => f.set(e.target.value)}
                      className={`${inputClass} ${f.prefix ? 'pl-7' : ''}`}
                    />
                  </div>
                )
              ) : (
                <div className="border-l-4 border-emerald-500 pl-4 py-0.5">
                  <p className="text-sm text-[#C8C8C8] whitespace-pre-wrap">
                    {f.prefix && f.value ? `${f.prefix}${f.value}` : f.value || <span className="text-[#555555]">Not set</span>}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
