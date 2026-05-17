'use client'

import { useState } from 'react'

const ZAPIER_FIELDS = [
  { zap: 'followers_count (from Instagram)', our: 'followers' },
  { zap: 'reach (from Instagram Insights)', our: 'reach' },
  { zap: 'engagement_rate (calculate or pass raw)', our: 'engagement_rate' },
  { zap: 'impressions or video_views', our: 'avg_reel_views' },
  { zap: 'saved_count', our: 'saves' },
  { zap: 'Manual or from another tool', our: 'dms' },
  { zap: 'Manual or from email platform', our: 'email_leads' },
]

export function ZapierSetup({ webhookToken }: { webhookToken: string | null }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const webhookUrl = webhookToken
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhooks/stats/${webhookToken}`
    : null

  function copy() {
    if (!webhookUrl) return
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#111111] transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Zapier orange Z icon */}
          <div className="w-8 h-8 rounded-lg bg-[#FF4A00] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">Z</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#F0F0F0]">Auto-import stats with Zapier</p>
            <p className="text-xs text-[#888888]">Connect Instagram → stats update automatically every week</p>
          </div>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`text-[#555555] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t border-[#252525]">

          {/* Webhook URL */}
          <div className="flex flex-col gap-2 pt-4">
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide">Your webhook URL</p>
            {webhookUrl ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-[#0F0F0F] border border-[#252525] rounded-lg px-3 py-2.5 text-[#C8C8C8] font-mono truncate">
                  {webhookUrl}
                </code>
                <button
                  onClick={copy}
                  className="shrink-0 h-9 px-3 rounded-lg border border-[#252525] text-xs font-medium text-[#888888] hover:border-white/20 hover:text-[#E0E0E0] transition-colors cursor-pointer">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#555555]">Token not set — run the SQL migration to generate your token.</p>
            )}
            <p className="text-[11px] text-[#555555]">Keep this URL private. Anyone with it can post stats to your account.</p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide">Setup steps</p>

            {[
              {
                num: 1,
                title: 'Create a free Zapier account',
                body: 'Go to zapier.com and sign up if you haven\'t already.',
              },
              {
                num: 2,
                title: 'Create a new Zap — set the trigger to Schedule',
                body: 'Choose "Schedule by Zapier" as the trigger app. Set it to run every week on Monday morning. This will automatically pull your stats each week.',
              },
              {
                num: 3,
                title: 'Add an Instagram for Business action — Get User',
                body: 'Add a step using "Instagram for Business". Connect your Instagram account (Zapier already has Meta approval — you don\'t need to apply for anything). Use the "Get User" action to fetch your account info including follower count.',
              },
              {
                num: 4,
                title: 'Add a Webhooks by Zapier action — POST',
                body: 'Add another step: "Webhooks by Zapier" → "POST". Paste your webhook URL above into the URL field. Set the payload type to JSON.',
              },
              {
                num: 5,
                title: 'Map the fields',
                body: 'In the data/body section, map Instagram fields to the field names below. Only include fields you have — anything missing will just stay blank.',
              },
              {
                num: 6,
                title: 'Test and turn on',
                body: 'Click "Test step" — you should see your stats appear on this page within seconds. Then turn the Zap on. It\'ll run every Monday automatically.',
              },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#1E1E1E] text-[#E0E0E0] text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0F0F0]">{step.title}</p>
                  <p className="text-xs text-[#888888] mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Field mapping table */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide">Field mapping (step 5)</p>
            <div className="rounded-lg border border-[#252525] overflow-hidden">
              <div className="grid grid-cols-2 bg-[#0F0F0F] px-3 py-2 text-[10px] font-semibold text-[#888888] uppercase tracking-wide">
                <span>Zapier / Instagram field</span>
                <span>Send as (JSON key)</span>
              </div>
              {ZAPIER_FIELDS.map((f, i) => (
                <div key={i} className={`grid grid-cols-2 px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111111]'}`}>
                  <span className="text-[#C8C8C8]">{f.zap}</span>
                  <code className="text-[#E0E0E0] font-mono">{f.our}</code>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#555555]">
              Example JSON body: <code className="font-mono bg-[#0F0F0F] px-1 rounded">{`{"followers": 10400, "reach": 32000, "saves": 240}`}</code>
            </p>
          </div>

          {/* Make.com alternative */}
          <div className="bg-[#0F0F0F] rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-[#C8C8C8]">Prefer Make (formerly Integromat)?</p>
            <p className="text-xs text-[#888888] mt-1">Same concept — use a Schedule module → Instagram module (Get User) → HTTP module (POST to your webhook URL). Make often has more Instagram insight fields available.</p>
          </div>
        </div>
      )}
    </div>
  )
}
