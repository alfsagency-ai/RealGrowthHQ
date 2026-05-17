'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
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

const TONE_OPTIONS = [
  'Warm & relatable',
  'Direct & no-BS',
  'Professional & authoritative',
  'Energetic & motivational',
]

interface Field {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
}

function Field({ label, value, onChange, placeholder, type = 'text', options }: Field) {
  const base = 'w-full rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#C8C8C8]">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className={`${base} px-3 py-2.5 resize-none`}
        />
      ) : type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={`${base} h-10 px-3`}>
          <option value="">Select tone of voice…</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} h-10 px-3`}
        />
      )}
    </div>
  )
}

export function OnboardingForm({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
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
  const [successDef, setSuccessDef] = useState('')

  async function handleConfirm() {
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const combinedPainPoints = painPoints + (successDef ? `\n\nDefinition of success: ${successDef}` : '')

    const { error: updateErr } = await supabase.from('users').update({
      name, instagram_handle: handle, niche, main_offer: mainOffer,
      target_audience: audience, tone_of_voice: tone,
      revenue_goal: revenueGoal, pain_points: combinedPainPoints,
    }).eq('id', profile.id)

    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    const { error: onboardErr } = await supabase.from('onboarding_completed').upsert({
      client_id: profile.id, completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: 'client_id' })

    if (onboardErr) { setError(onboardErr.message); setSaving(false); return }

    router.push('/dashboard')
    router.refresh()
  }

  const steps = [
    { n: 1, label: 'About you' },
    { n: 2, label: 'Offer & audience' },
    { n: 3, label: 'Your goals' },
    { n: 4, label: 'Review' },
  ]

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step > s.n ? 'bg-emerald-500 text-white' :
                step === s.n ? 'bg-emerald-500 text-white ring-4 ring-white/20' :
                'bg-[#0F0F0F] text-[#555555] border border-[#252525]'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-[11px] font-medium ${step === s.n ? 'text-[#E0E0E0]' : 'text-[#555555]'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-1 mb-4 ${step > s.n ? 'bg-emerald-500' : 'bg-[#1E1E1E]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-[#252525] rounded-xl p-8">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F0]">Tell us about you</h2>
              <p className="text-sm text-[#888888] mt-1">Let&apos;s get the basics set up for your brand profile.</p>
            </div>
            <Field label="Your name" value={name} onChange={setName} placeholder="e.g. Alex Johnson" />
            <Field label="Instagram handle" value={handle} onChange={setHandle} placeholder="@yourhandle" />
            <Field label="Your niche" value={niche} onChange={setNiche} placeholder="e.g. Fitness coaching for busy mums" />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F0]">Your offer & audience</h2>
              <p className="text-sm text-[#888888] mt-1">Help us understand what you&apos;re selling and who you&apos;re selling to.</p>
            </div>
            <Field label="Main offer & price" value={mainOffer} onChange={setMainOffer} placeholder="e.g. 12-week 1:1 coaching — £1,500" />
            <Field label="Target audience" value={audience} onChange={setAudience} placeholder="e.g. Women 30-45 who want to lose weight without giving up their social life" type="textarea" />
            <Field label="Tone of voice" value={tone} onChange={setTone} type="select" options={TONE_OPTIONS} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F0]">Your goals</h2>
              <p className="text-sm text-[#888888] mt-1">What does success look like for you?</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#C8C8C8]">Monthly revenue goal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">£</span>
                <input
                  type="number" value={revenueGoal} onChange={e => setRevenueGoal(e.target.value)}
                  placeholder="5000"
                  className="w-full h-10 pl-7 pr-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all"
                />
              </div>
            </div>
            <Field label="Current pain points" value={painPoints} onChange={setPainPoints} placeholder="e.g. I'm posting consistently but getting no enquiries…" type="textarea" />
            <Field label="Definition of success" value={successDef} onChange={setSuccessDef} placeholder="e.g. £10k/month from content alone in 6 months" type="textarea" />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F0]">You&apos;re all set 🎉</h2>
              <p className="text-sm text-[#888888] mt-1">Review your details before we get started.</p>
            </div>
            {[
              { label: 'Name', value: name },
              { label: 'Instagram', value: handle },
              { label: 'Niche', value: niche },
              { label: 'Main offer', value: mainOffer },
              { label: 'Target audience', value: audience },
              { label: 'Tone of voice', value: tone },
              { label: 'Revenue goal', value: revenueGoal ? `£${revenueGoal}/month` : '—' },
              { label: 'Pain points', value: painPoints },
              { label: 'Definition of success', value: successDef },
            ].map(({ label, value }) => value && (
              <div key={label} className="border-l-4 border-emerald-500 pl-4 py-0.5">
                <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-wide">{label}</p>
                <p className="text-sm text-[#F0F0F0] mt-0.5 whitespace-pre-wrap">{value}</p>
              </div>
            ))}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#252525]">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-sm text-[#888888] hover:text-[#F0F0F0] transition-colors cursor-pointer">
              ← Back
            </button>
          ) : <div />}
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="h-9 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="h-9 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {saving ? 'Saving…' : 'Confirm & go to dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
