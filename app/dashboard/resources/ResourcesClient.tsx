'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Category = 'dm_scripts' | 'caption_templates' | 'email_swipe' | 'funnel_copy' | 'weekly_planner' | 'other'
type DocTypeKey =
  | 'webinar_strategy' | 'dm_scripts' | 'caption_templates' | 'email_sequence'
  | 'vsl_script' | 'paid_ads' | 'onboarding_questionnaire' | 'icp_worksheet'
  | 'offer_framework' | 'landing_page_copy'

interface Resource {
  id: string
  title: string
  description: string | null
  url: string | null
  content: string | null
  category: Category
}
interface Client { id: string; name: string | null; email: string }
interface ResourceTemplate { id: string; title: string; description: string | null; category: string; sort_order: number }

interface DocTypeConfig {
  label: string
  category: Category
  extraFields: { key: string; label: string; placeholder: string }[]
}

const DOC_TYPES: Record<DocTypeKey, DocTypeConfig> = {
  webinar_strategy: {
    label: 'Webinar Strategy',
    category: 'weekly_planner',
    extraFields: [{ key: 'webinarTopic', label: 'Webinar Topic', placeholder: 'e.g. How to land 5-figure coaching clients' }],
  },
  dm_scripts: {
    label: 'DM Scripts Pack (5 scripts)',
    category: 'dm_scripts',
    extraFields: [{ key: 'platform', label: 'Platform', placeholder: 'e.g. Instagram' }],
  },
  caption_templates: {
    label: 'Caption Templates Pack',
    category: 'caption_templates',
    extraFields: [{ key: 'contentPillars', label: 'Content Pillars', placeholder: 'e.g. mindset, client results, behind the scenes' }],
  },
  email_sequence: {
    label: 'Welcome Email Sequence',
    category: 'email_swipe',
    extraFields: [{ key: 'leadMagnet', label: 'Lead Magnet / Entry Point', placeholder: 'e.g. Free webinar training' }],
  },
  vsl_script: {
    label: 'VSL Script',
    category: 'funnel_copy',
    extraFields: [{ key: 'mainBenefit', label: 'Main Transformation Promise', placeholder: 'e.g. Go from 0 to £10k/month in 90 days' }],
  },
  paid_ads: {
    label: 'Paid Ads Strategy',
    category: 'weekly_planner',
    extraFields: [
      { key: 'adPlatforms', label: 'Ad Platforms', placeholder: 'e.g. Facebook, Instagram' },
      { key: 'monthlyBudget', label: 'Monthly Ad Budget', placeholder: 'e.g. £500/month' },
    ],
  },
  onboarding_questionnaire: { label: 'Client Onboarding Questionnaire', category: 'other', extraFields: [] },
  icp_worksheet: { label: 'ICP Deep Dive Worksheet', category: 'other', extraFields: [] },
  offer_framework: { label: 'Offer Framework', category: 'other', extraFields: [] },
  landing_page_copy: {
    label: 'Landing Page Copy',
    category: 'funnel_copy',
    extraFields: [{ key: 'pageGoal', label: 'Page Goal', placeholder: 'e.g. Webinar signup, strategy call booking' }],
  },
}

const TABS: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'DM Scripts', value: 'dm_scripts' },
  { label: 'Caption templates', value: 'caption_templates' },
  { label: 'Email swipe files', value: 'email_swipe' },
  { label: 'Funnel copy', value: 'funnel_copy' },
  { label: 'Weekly planner', value: 'weekly_planner' },
  { label: 'Other', value: 'other' },
]

const CAT_LABEL: Record<Category, string> = {
  dm_scripts: 'DM Scripts',
  caption_templates: 'Caption templates',
  email_swipe: 'Email swipe files',
  funnel_copy: 'Funnel copy',
  weekly_planner: 'Weekly planner',
  other: 'Other',
}

const CAT_ICON: Record<Category, React.ReactNode> = {
  dm_scripts: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4A1.5 1.5 0 0 1 3.5 2.5h11A1.5 1.5 0 0 1 16 4v7A1.5 1.5 0 0 1 14.5 12.5H11l-2 2.5-2-2.5H3.5A1.5 1.5 0 0 1 2 11V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  caption_templates: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12M3 6.5h12M3 10h8M5 14l2-1 6-6-1-1-6 6-1 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  email_swipe: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  funnel_copy: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3h14l-5.5 7v4.5l-3-1.5V10L2 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  weekly_planner: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7h14M6 3v4M12 3v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  other: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 3h7l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M11 3v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'
const taClass = 'w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none'

// ── Content viewer ────────────────────────────────────────────────────────────

function ContentViewer({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyAll() {
    navigator.clipboard.writeText(resource.content ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#141414] rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525] shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#F0F0F0]">{resource.title}</h3>
            <span className="text-[11px] font-semibold bg-[#1E1E1E] text-[#E0E0E0] px-2 py-0.5 rounded-full mt-1 inline-block">{CAT_LABEL[resource.category]}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyAll}
              className="h-8 px-3 rounded-lg border border-[#252525] text-xs font-medium text-[#888888] hover:border-white/20 hover:text-[#E0E0E0] transition-colors cursor-pointer">
              {copied ? 'Copied!' : 'Copy all'}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="text-sm text-[#C8C8C8] whitespace-pre-wrap font-[inherit] leading-relaxed">{resource.content}</pre>
        </div>
      </div>
    </div>
  )
}

// ── Add modal ─────────────────────────────────────────────────────────────────

function AddModal({ clients, templates, onClose }: { clients: Client[]; templates: ResourceTemplate[]; onClose: () => void }) {
  const router = useRouter()
  const [mode, setMode] = useState<'generate' | 'manual'>('generate')

  // Shared
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  // Generate mode
  const [docType, setDocType] = useState<DocTypeKey>('webinar_strategy')
  const [offer, setOffer] = useState('')
  const [audience, setAudience] = useState('')
  const [price, setPrice] = useState('')
  const [icp, setIcp] = useState('')
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [genView, setGenView] = useState<'form' | 'preview'>('form')
  const [genTitle, setGenTitle] = useState('')
  const [genContent, setGenContent] = useState('')
  const [genCategory, setGenCategory] = useState<Category>('other')

  // Manual mode
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<Category>('other')

  const selectedClient = clients.find(c => c.id === clientId)
  const clientDisplayName = selectedClient?.name ?? selectedClient?.email ?? 'the client'
  const docConfig = DOC_TYPES[docType]

  function setExtra(key: string, val: string) {
    setExtras(prev => ({ ...prev, [key]: val }))
  }

  function applyTemplate(templateId: string) {
    const t = templates.find(t => t.id === templateId)
    if (!t) return
    setTitle(t.title)
    setDescription(t.description ?? '')
    setCategory(t.category as Category)
  }

  async function generate() {
    if (!offer.trim() || !audience.trim() || !price.trim()) return
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, clientName: clientDisplayName, offer, audience, price, icp, extras }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setGenTitle(data.title)
      setGenContent(data.content)
      setGenCategory(data.category as Category)
      setGenView('preview')
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  async function saveGenerated() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('resources').insert({
      client_id: clientId,
      title: genTitle,
      description: `AI-generated ${docConfig.label}`,
      url: null,
      content: genContent,
      category: genCategory,
    })
    setSaving(false)
    setSavedToast(true)
    setTimeout(() => { setSavedToast(false); onClose(); router.refresh() }, 1500)
  }

  async function saveManual(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('resources').insert({
      client_id: clientId,
      title: title.trim(),
      description: description.trim() || null,
      url: url.trim(),
      content: null,
      category,
    })
    setSaving(false)
    setSavedToast(true)
    setTimeout(() => { setSavedToast(false); onClose(); router.refresh() }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[#141414] rounded-xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: '92vh' }}>
        {savedToast && (
          <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg">Resource added</div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <h3 className="text-sm font-semibold text-[#F0F0F0]">Add resource</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 px-6 pb-4 shrink-0">
          <button onClick={() => { setMode('generate'); setGenView('form') }}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${mode === 'generate' ? 'bg-emerald-500 text-white' : 'bg-[#0F0F0F] text-[#888888] hover:bg-[#1E1E1E]'}`}>
            Generate with AI
          </button>
          <button onClick={() => setMode('manual')}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${mode === 'manual' ? 'bg-emerald-500 text-white' : 'bg-[#0F0F0F] text-[#888888] hover:bg-[#1E1E1E]'}`}>
            Add link manually
          </button>
        </div>

        <div className="h-px bg-[#1A1A1A] shrink-0" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Client picker (shared) */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-medium text-[#888888]">Client</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputClass}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name ?? c.email}</option>)}
            </select>
          </div>

          {/* ── GENERATE MODE ── */}
          {mode === 'generate' && genView === 'form' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Document type</label>
                <select value={docType} onChange={e => { setDocType(e.target.value as DocTypeKey); setExtras({}) }} className={inputClass}>
                  {(Object.entries(DOC_TYPES) as [DocTypeKey, DocTypeConfig][]).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="h-px bg-[#1A1A1A]" />
              <p className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide">Client details</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Their offer / service *</label>
                <input value={offer} onChange={e => setOffer(e.target.value)}
                  placeholder="e.g. 6-week 1:1 coaching to help women lose 20lbs"
                  className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Target audience *</label>
                <input value={audience} onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. Women aged 35–50 who want to lose weight after having kids"
                  className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Price point *</label>
                <input value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. £2,500 one-time or £497/month"
                  className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Ideal client description</label>
                <textarea value={icp} onChange={e => setIcp(e.target.value)} rows={2}
                  placeholder="Any extra detail about their dream client — struggles, goals, mindset…"
                  className={taClass} />
              </div>

              {docConfig.extraFields.length > 0 && (
                <>
                  <div className="h-px bg-[#1A1A1A]" />
                  <p className="text-[11px] font-semibold text-[#555555] uppercase tracking-wide">{docConfig.label} details</p>
                  {docConfig.extraFields.map(f => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-[#888888]">{f.label}</label>
                      <input value={extras[f.key] ?? ''} onChange={e => setExtra(f.key, e.target.value)}
                        placeholder={f.placeholder} className={inputClass} />
                    </div>
                  ))}
                </>
              )}

              {genError && <p className="text-xs text-red-500">{genError}</p>}

              <button onClick={generate} disabled={generating || !offer.trim() || !audience.trim() || !price.trim()}
                className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1">
                {generating ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeOpacity="0.3" strokeWidth="2"/><path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5L7 1Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    Generate {docConfig.label}
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── GENERATE PREVIEW ── */}
          {mode === 'generate' && genView === 'preview' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setGenView('form')}
                  className="text-xs text-[#888888] hover:text-[#E0E0E0] transition-colors cursor-pointer">← Back</button>
                <span className="text-[#666666]">·</span>
                <span className="text-xs text-[#555555]">Preview generated doc</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Title</label>
                <input value={genTitle} onChange={e => setGenTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="rounded-lg border border-[#252525] bg-[#111111] p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs text-[#C8C8C8] whitespace-pre-wrap font-[inherit] leading-relaxed">{genContent}</pre>
              </div>
              <button onClick={saveGenerated} disabled={saving}
                className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                {saving ? 'Saving…' : `Send to ${clientDisplayName}`}
              </button>
            </div>
          )}

          {/* ── MANUAL MODE ── */}
          {mode === 'manual' && (
            <form onSubmit={saveManual} className="flex flex-col gap-3">
              {templates.length > 0 && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#888888]">Start from template (optional)</label>
                    <select defaultValue="" onChange={e => applyTemplate(e.target.value)} className={inputClass}>
                      <option value="">— Choose a template to pre-fill —</option>
                      {(Object.keys(CAT_LABEL) as Category[]).map(cat => {
                        const catT = templates.filter(t => t.category === cat)
                        if (!catT.length) return null
                        return (
                          <optgroup key={cat} label={CAT_LABEL[cat]}>
                            {catT.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </optgroup>
                        )
                      })}
                    </select>
                    <p className="text-[11px] text-[#555555]">Selecting pre-fills the fields below — add the URL and send.</p>
                  </div>
                  <div className="h-px bg-[#1A1A1A]" />
                </>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title" className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description…" className={taClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">URL *</label>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/…" className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#888888]">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value as Category)} className={inputClass}>
                  {(Object.keys(CAT_LABEL) as Category[]).map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving || !title.trim() || !url.trim()}
                className="h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer mt-1">
                {saving ? 'Adding…' : 'Add resource'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResourcesClient({
  resources,
  isAdmin,
  clients,
  templates = [],
}: {
  resources: Resource[]
  isAdmin: boolean
  clients: Client[]
  templates?: ResourceTemplate[]
}) {
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewingResource, setViewingResource] = useState<Resource | null>(null)

  const filtered = activeTab === 'all' ? resources : resources.filter(r => r.category === activeTab)

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeTab === tab.value ? 'bg-emerald-500 text-white' : 'bg-[#141414] border border-[#252525] text-[#888888] hover:border-white/20'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#141414] border border-dashed border-[#252525] rounded-xl">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 6h11l5 5v15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round"/><path d="M19 6v5h5" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="text-center">
            <p className="text-sm font-medium text-[#C8C8C8]">No {activeTab === 'all' ? '' : CAT_LABEL[activeTab as Category] + ' '}resources yet</p>
            <p className="text-xs text-[#555555] mt-0.5">Your operator will add resources here</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-[#141414] border border-[#252525] rounded-xl p-4 flex items-start gap-3 hover:border-white/15 hover:shadow-sm transition-all">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-[#1E1E1E] text-[#E0E0E0] flex items-center justify-center">
                {CAT_ICON[r.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F0F0F0] leading-tight">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-[#888888] mt-1 leading-snug line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold bg-[#0F0F0F] text-[#888888] px-2 py-0.5 rounded-full">{CAT_LABEL[r.category]}</span>
                    {r.content && !r.url && (
                      <span className="text-[11px] font-semibold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </div>
                  {r.content ? (
                    <button onClick={() => setViewingResource(r)}
                      className="text-xs font-medium text-[#E0E0E0] hover:text-[#D0D0D0] transition-colors cursor-pointer">
                      Read doc →
                    </button>
                  ) : r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-[#E0E0E0] hover:text-[#D0D0D0] transition-colors">
                      Open resource →
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin floating button */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-40" style={{ width: 48, height: 48 }}>
          <button onClick={() => setModalOpen(true)}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {modalOpen && <AddModal clients={clients} templates={templates} onClose={() => setModalOpen(false)} />}
      {viewingResource && <ContentViewer resource={viewingResource} onClose={() => setViewingResource(null)} />}
    </>
  )
}
