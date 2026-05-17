'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function EditNameButton({ displayName }: { displayName: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function save() {
    const trimmed = value.trim()
    if (!trimmed) { setEditing(false); return }
    if (trimmed === displayName) { setEditing(false); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ name: trimmed }).eq('id', user.id)
    }
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') { setValue(displayName); setEditing(false) }
          }}
          className="text-sm bg-[#1C1C1C] border border-emerald-500/40 rounded-md px-2 py-0.5 text-[#F0F0F0] outline-none w-36 focus:border-emerald-500/70"
          style={{ fontSize: '13px' }}
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          onClick={() => { setValue(displayName); setEditing(false) }}
          className="text-[11px] text-[#555] hover:text-[#888]"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#C8C8C8] group transition-colors"
    >
      <span style={{ fontSize: '13px' }}>{displayName}</span>
      <svg
        width="11" height="11" viewBox="0 0 12 12" fill="none"
        className="opacity-0 group-hover:opacity-50 transition-opacity"
      >
        <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
