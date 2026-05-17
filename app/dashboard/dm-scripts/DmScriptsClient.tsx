'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ThreadItem =
  | { type: 'you'; text: string }
  | { type: 'prospect'; text: string }
  | { type: 'tip'; text: string }

type Step = { num: number; title: string; time: string; desc: string }

type ScriptDef = {
  id: string
  label: string
  title: string
  about: string
  thread?: ThreadItem[]
  steps?: Step[]
  bottomTip: string
}

const STATIC_SALES_CALL: ScriptDef = {
  id: 'sales-call',
  label: 'Sales call framework',
  title: 'Sales call framework',
  about: 'A six-step framework for running a discovery and close call in under 20 minutes.',
  steps: [
    { num: 1, title: 'Open', time: '5 min', desc: '"Tell me where you\'re at right now — what\'s working, what isn\'t?" Listen more than you talk.' },
    { num: 2, title: 'Diagnose', time: '5 min', desc: '"So it sounds like the main issue is [X] — is that fair?" Reflect their problem back in their words.' },
    { num: 3, title: 'Paint the outcome', time: '3 min', desc: '"If we fixed that, what would change for you?" Get them to say it out loud.' },
    { num: 4, title: 'Present the offer', time: '3 min', desc: 'Give a brief breakdown of what you\'d do and the investment. Be direct and confident.' },
    { num: 5, title: 'Close', time: '1 min', desc: '"Does that feel like the right move for where you\'re at?" Then go silent. Whoever speaks first loses.' },
    { num: 6, title: 'Handle objections', time: '—', desc: '"That\'s fair — what\'s making you hesitate?" For price: offer a payment plan, never discount.' },
  ],
  bottomTip: 'After asking "does that feel right?", stay silent. Whoever speaks first loses. That pause is the most valuable second in the entire call.',
}

const DEFAULT_SCRIPTS: ScriptDef[] = [
  {
    id: 'cold-opener',
    label: 'Cold opener',
    title: 'Cold opener',
    about: 'Use this to start a genuine conversation from a prospect\'s content before pitching anything.',
    thread: [
      { type: 'prospect', text: '*posts a reel about their coaching offer*' },
      { type: 'you', text: 'Loved this — the bit about [specific thing they said] is exactly what I see clients miss. Do you get many DMs from this kind of content?' },
      { type: 'tip', text: 'Open with genuine engagement on their specific content, not a copy-paste pitch. Ask one question that invites a reply.' },
      { type: 'prospect', text: 'Yeah a few, not as many as I\'d like honestly' },
      { type: 'you', text: 'Makes sense — most people with your level of knowledge aren\'t getting the reach their content deserves. I help people in your space set up the systems that turn content into consistent leads. Would it be useful if I put together a quick breakdown of what I\'d do differently for your account?' },
      { type: 'tip', text: 'You\'re offering value (the breakdown) not selling a service. Low commitment ask.' },
    ],
    bottomTip: 'The goal of the first message is a reply, not a sale. Ask one question, personalise it to their content, and let curiosity do the heavy lifting.',
  },
  {
    id: 'audit-offer',
    label: 'Free audit offer',
    title: 'Free audit offer',
    about: 'Offer a personalised Loom audit to open the door and demonstrate expertise before asking for anything.',
    thread: [
      { type: 'you', text: 'I had a look at your profile and I can see a few specific things that are costing you leads. I\'ll record a quick 5-min Loom showing exactly what I\'d change — no cost, no pitch. Want me to send it over?' },
      { type: 'tip', text: 'The audit is your foot in the door. Shows competence before they\'ve spent a penny.' },
      { type: 'prospect', text: 'Yeah go for it' },
      { type: 'you', text: 'Just sent it over. The main things I flagged were [1-2 specific issues]. I\'ve helped a few people in your space fix exactly this — one client went from 3 enquiries a month to 18 after we rebuilt their content flow. Would it be worth jumping on a quick call to talk through how that could work for you?' },
      { type: 'tip', text: 'Mention one concrete result. Ask for a call, not a sale.' },
    ],
    bottomTip: 'The free audit makes you memorable and trustworthy. Most people they talk to pitch immediately — you showed up with value first.',
  },
  {
    id: 'followup-1',
    label: 'Follow-up #1',
    title: 'Follow-up #1',
    about: 'A soft nudge when they\'ve gone quiet after the Loom or initial conversation.',
    thread: [
      { type: 'you', text: 'Hey, just bumping this up — did you get a chance to watch the Loom?' },
      { type: 'tip', text: 'Short and casual. Don\'t re-explain everything. Just nudge.' },
    ],
    bottomTip: 'Short and casual. Don\'t re-explain everything. A simple bump keeps the conversation alive without coming across as pushy.',
  },
  {
    id: 'followup-2',
    label: 'Follow-up #2',
    title: 'Follow-up #2',
    about: 'Your final follow-up — leave things on a generous note so the door stays open.',
    thread: [
      { type: 'you', text: 'No worries if the timing\'s off — I\'ll leave this here in case it\'s useful later. The main thing I noticed was [one specific gap]. Happy to talk through it whenever.' },
      { type: 'tip', text: 'This is your last message. Leave on a helpful note, not a desperate one. People often reply to this one weeks later.' },
    ],
    bottomTip: 'This is your last message. Leave on a helpful note, not a desperate one. People often reply to this one weeks later when the timing finally works.',
  },
  {
    id: 'booking-call',
    label: 'Booking the call',
    title: 'Booking the call',
    about: 'Convert warm interest into a booked discovery call with a low-friction ask.',
    thread: [
      { type: 'you', text: 'Are you free for a quick 20-min call this week? I just want to understand your situation better and see if what I do would actually be a good fit. No pressure either way.' },
      { type: 'tip', text: '"20 minutes" feels low commitment. "No pressure" removes fear of a hard sell.' },
      { type: 'prospect', text: 'Sure, what works for you?' },
      { type: 'you', text: 'Great — here\'s my Calendly, grab whatever works: [link]. I\'ll send you a couple of questions beforehand so we make the most of the time.' },
      { type: 'tip', text: 'Sending a pre-call form filters tyre-kickers and makes you look professional.' },
    ],
    bottomTip: 'Sending a short pre-call form does two things: it filters people who aren\'t serious, and it makes you look like someone who runs a tight operation.',
  },
  STATIC_SALES_CALL,
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1 text-[11px] font-medium text-[#888888] hover:text-[#E0E0E0] transition-colors cursor-pointer mt-1.5 self-end">
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 7.5V1.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Copy</>
      )}
    </button>
  )
}

function ScriptThread({ thread }: { thread: ThreadItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {thread.map((item, i) => {
        if (item.type === 'tip') {
          return (
            <div key={i} className="flex items-start gap-2 bg-[#111111] border border-[#252525] rounded-lg px-3 py-2.5 ml-4">
              <span className="text-sm mt-0.5">💡</span>
              <p className="text-xs text-[#888888] leading-relaxed">{item.text}</p>
            </div>
          )
        }
        if (item.type === 'you') {
          return (
            <div key={i} className="flex flex-col items-end gap-0">
              <span className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide mr-1">You</span>
              <div className="bg-emerald-500 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-white leading-relaxed">{item.text}</p>
              </div>
              <CopyBtn text={item.text} />
            </div>
          )
        }
        return (
          <div key={i} className="flex flex-col items-start gap-0">
            <span className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide ml-1">Prospect</span>
            <div className="bg-[#141414] border border-[#252525] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
              <p className={`text-sm leading-relaxed ${item.text.startsWith('*') ? 'italic text-[#555555]' : 'text-[#C8C8C8]'}`}>{item.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScriptSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map(step => (
        <div key={step.num} className="flex items-start gap-4 bg-[#141414] border border-[#252525] rounded-xl p-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#1E1E1E] text-[#E0E0E0] text-sm font-bold flex items-center justify-center">{step.num}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[#F0F0F0]">{step.title}</span>
              {step.time !== '—' && <span className="text-[11px] text-[#555555] font-medium bg-[#0F0F0F] px-2 py-0.5 rounded-full">{step.time}</span>}
            </div>
            <p className="text-sm text-[#888888] leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Generate modal ────────────────────────────────────────────────────────────

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'

function GenerateModal({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string
  onClose: () => void
  onSaved: (scripts: ScriptDef[]) => void
}) {
  const router = useRouter()
  const [offer, setOffer] = useState('')
  const [audience, setAudience] = useState('')
  const [price, setPrice] = useState('')
  const [icp, setIcp] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!offer.trim() || !audience.trim() || !price.trim()) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate-dm-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: 'this client', offer, audience, price, icp, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')

      const scripts: ScriptDef[] = data.scripts

      // Save to resources table
      setSaving(true)
      const supabase = createClient()
      await supabase.from('resources').insert({
        client_id: clientId,
        title: `DM Scripts — ${platform}`,
        description: `AI-generated DM scripts for ${platform}`,
        url: null,
        content: JSON.stringify(scripts),
        category: 'dm_scripts',
      })
      setSaving(false)
      onSaved(scripts)
      onClose()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setGenerating(false)
      setSaving(false)
    }
  }

  const busy = generating || saving

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[#141414] rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F0F0F0]">Generate personalised DM scripts</h3>
            <p className="text-xs text-[#555555] mt-0.5">Claude writes scripts specific to this client's offer and audience.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Their offer / service *</label>
            <input value={offer} onChange={e => setOffer(e.target.value)}
              placeholder="e.g. 1:1 coaching to help coaches get to £10k/month"
              className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Target audience *</label>
            <input value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Online coaches stuck under £3k/month"
              className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Price point *</label>
            <input value={price} onChange={e => setPrice(e.target.value)}
              placeholder="e.g. £3,500 one-time"
              className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">ICP detail (optional)</label>
            <input value={icp} onChange={e => setIcp(e.target.value)}
              placeholder="e.g. Has an audience but can't convert to clients"
              className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888888]">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className={inputClass}>
              <option>Instagram</option>
              <option>LinkedIn</option>
              <option>Twitter / X</option>
              <option>Facebook</option>
              <option>TikTok</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button onClick={generate} disabled={busy || !offer.trim() || !audience.trim() || !price.trim()}
          className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
          {busy ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeOpacity="0.3" strokeWidth="2"/><path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              {saving ? 'Saving…' : 'Generating scripts…'}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5L7 1Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              Generate scripts
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DmScriptsClient({
  isAdmin,
  clientId,
  savedScripts,
  savedTitle,
}: {
  isAdmin: boolean
  clientId: string
  savedScripts: string | null
  savedTitle: string | null
}) {
  const [generatedScripts, setGeneratedScripts] = useState<ScriptDef[] | null>(() => {
    if (!savedScripts) return null
    try { return JSON.parse(savedScripts) } catch { return null }
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('cold-opener')

  const scripts: ScriptDef[] = generatedScripts
    ? [...generatedScripts, STATIC_SALES_CALL]
    : DEFAULT_SCRIPTS

  const active = scripts.find(s => s.id === activeId) ?? scripts[0]
  const isGenerated = !!generatedScripts

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      {/* Admin generate banner */}
      {isAdmin && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isGenerated ? 'bg-emerald-50 border-emerald-200' : 'bg-[#1E1E1E] border-[#333333]'}`}>
          <div className="flex items-center gap-2">
            {isGenerated ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="text-xs font-medium text-emerald-400">Scripts generated{savedTitle ? ` — ${savedTitle}` : ''}. Showing personalised versions below.</p>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5L7 1Z" stroke="#E8E8E8" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                <p className="text-xs font-medium text-[#E0E0E0]">These are default scripts. Generate personalised ones for this client.</p>
              </>
            )}
          </div>
          <button onClick={() => setModalOpen(true)}
            className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors cursor-pointer shrink-0">
            {isGenerated ? 'Regenerate' : 'Generate scripts'}
          </button>
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Left tab list */}
        <nav className="w-44 shrink-0 sticky top-0">
          <div className="bg-[#141414] border border-[#252525] rounded-xl p-2 flex flex-col gap-0.5">
            {scripts.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={`w-full text-left text-sm px-3 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeId === s.id ? 'bg-emerald-500 text-white' : 'text-[#C8C8C8] hover:bg-[#0F0F0F]'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Right content */}
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold text-[#F0F0F0]">{active.title}</h2>
            <div className="mt-2 flex items-start gap-2 bg-[#1E1E1E] border border-[#333333] rounded-lg px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><circle cx="7" cy="7" r="6" stroke="#888888" strokeWidth="1.3"/><path d="M7 6v4M7 4.5v.5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <p className="text-xs text-[#E0E0E0] leading-relaxed">{active.about}</p>
            </div>
          </div>

          <div className="bg-[#0F0F0F] rounded-xl p-5">
            {active.thread ? <ScriptThread thread={active.thread} /> : active.steps ? <ScriptSteps steps={active.steps} /> : null}
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-sm text-amber-900 leading-relaxed">{active.bottomTip}</p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <GenerateModal
          clientId={clientId}
          onClose={() => setModalOpen(false)}
          onSaved={scripts => { setGeneratedScripts(scripts); setActiveId('cold-opener') }}
        />
      )}
    </div>
  )
}
