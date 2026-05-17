'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  hasKey: boolean
  clientId: string
}

export function StripeConnect({ hasKey, clientId }: Props) {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(hasKey)

  async function handleSaveAndSync() {
    if (!key.trim()) return
    setSaving(true)
    setError(null)
    setResult(null)

    const res = await fetch('/api/stripe/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key.trim() }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error); return }

    setConnected(true)
    setKey('')
    setResult(`${data.imported} payment${data.imported !== 1 ? 's' : ''} imported.`)
    router.refresh()
  }

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setResult(null)

    const res = await fetch('/api/stripe/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json()
    setSyncing(false)

    if (!res.ok) { setError(data.error); return }
    setResult(`${data.imported} new payment${data.imported !== 1 ? 's' : ''} imported.`)
    router.refresh()
  }

  async function handleDisconnect() {
    const supabase = createClient()
    await supabase.from('users').update({ stripe_key: null }).eq('id', clientId)
    setConnected(false)
    setResult(null)
    setError(null)
    router.refresh()
  }

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Connect Stripe</h3>

      {connected ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-400">Stripe connected</span>
          </div>
          {result && <p className="text-xs text-emerald-400">{result}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSync} disabled={syncing} className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
            <button onClick={handleDisconnect} className="h-9 px-4 border border-[#252525] text-sm text-[#888888] hover:text-red-500 hover:border-red-200 rounded-lg transition-colors cursor-pointer">
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#888888]">Enter your Stripe secret key to import payments automatically.</p>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk_live_…"
            className="w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all font-mono"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {result && <p className="text-xs text-emerald-400">{result}</p>}
          <button onClick={handleSaveAndSync} disabled={saving || !key} className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            {saving ? 'Connecting…' : 'Save & sync'}
          </button>
        </div>
      )}
    </div>
  )
}
