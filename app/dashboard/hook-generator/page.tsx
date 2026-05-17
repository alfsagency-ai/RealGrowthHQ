'use client'

import { useState, useEffect } from 'react'

const FORMATS = ['Reel', 'Carousel', 'Story', 'Post'] as const
const TONES = ['Educational', 'Entertaining', 'Controversial', 'Personal'] as const

function CopyHookBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-[#555555] hover:text-[#E0E0E0] transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[#1E1E1E]">
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 7.5V1.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Copy</>
      )}
    </button>
  )
}

const LS_KEY = 'mrscale_hooks_last'

export default function HookGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState<string>('Reel')
  const [tone, setTone] = useState<string>('Educational')
  const [hooks, setHooks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setHooks(parsed.hooks ?? [])
        setTopic(parsed.topic ?? '')
        setFormat(parsed.format ?? 'Reel')
        setTone(parsed.tone ?? 'Educational')
        setVisible(parsed.hooks?.length ?? 0)
      }
    } catch { /* ignore */ }
  }, [])

  async function generate() {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setHooks([])
    setVisible(0)

    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), format, tone }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }

      const results: string[] = data.hooks
      setHooks(results)
      localStorage.setItem(LS_KEY, JSON.stringify({ hooks: results, topic: topic.trim(), format, tone }))

      // Stagger animation
      results.forEach((_, i) => {
        setTimeout(() => setVisible(i + 1), i * 50)
      })
    } catch {
      setError('Something went wrong. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  function clear() {
    setHooks([])
    setTopic('')
    setVisible(0)
    localStorage.removeItem(LS_KEY)
  }

  const toggleClass = (active: boolean) =>
    `h-9 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#141414] text-[#C8C8C8] border-[#252525] hover:border-white/25'}`

  return (
    <div className="max-w-[640px] flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Hook generator</h1>
        <p className="text-sm text-[#888888] mt-1">Enter a topic and get 10 scroll-stopping hooks instantly.</p>
      </div>

      {/* Form card */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">What&apos;s the post about?</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) generate() }}
            placeholder="e.g. Why most coaches never hit 10k followers"
            className="w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Format</label>
          <div className="flex gap-2 flex-wrap">
            {FORMATS.map(f => (
              <button key={f} onClick={() => setFormat(f)} className={toggleClass(format === f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#888888]">Tone</label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} className={toggleClass(tone === t)}>{t}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-10 bg-[#1E1E1E] rounded-lg flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <span className="text-sm text-[#E0E0E0] font-medium">Writing your hooks...</span>
          </div>
        ) : (
          <button onClick={generate} disabled={!topic.trim()}
            className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            Generate hooks
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 flex items-start gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><circle cx="8" cy="8" r="6.5" stroke="#EF4444" strokeWidth="1.3"/><path d="M8 5v3.5M8 10.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <div className="flex-1">
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <button onClick={generate} className="text-xs text-red-500 hover:text-red-400 font-medium cursor-pointer underline">Retry</button>
        </div>
      )}

      {/* Results */}
      {hooks.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F0F0F0]">10 hooks for "{topic}"</h2>
            <div className="flex gap-2">
              <button onClick={generate}
                className="h-8 px-3 rounded-lg border border-[#252525] text-xs font-medium text-[#888888] hover:border-white/25 hover:text-[#E0E0E0] cursor-pointer transition-colors">
                Generate again
              </button>
              <button onClick={clear}
                className="h-8 px-3 rounded-lg border border-[#252525] text-xs font-medium text-[#888888] hover:border-red-200 hover:text-red-500 cursor-pointer transition-colors">
                Clear
              </button>
            </div>
          </div>

          {hooks.map((hook, i) => (
            <div key={i}
              className="flex items-center gap-3 bg-[#141414] border border-[#252525] rounded-xl px-4 py-3.5 transition-all duration-300"
              style={{ opacity: i < visible ? 1 : 0, transform: i < visible ? 'translateY(0)' : 'translateY(6px)' }}>
              <span className="text-xs font-bold text-[#C4C9D8] w-5 shrink-0">{i + 1}</span>
              <p className="flex-1 text-[15px] font-medium text-[#F0F0F0] leading-snug">{hook}</p>
              <CopyHookBtn text={hook} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
