'use client'

import { useState, useEffect } from 'react'

const DEFAULT_TASKS = [
  'Post 3 reels this week',
  'Reply to all DMs within 24 hours',
  'Update your link-in-bio offer',
  'Send weekly email to your list',
  'Review your stats and log them',
]

export function WeeklyTasks() {
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false, false])

  useEffect(() => {
    const saved = localStorage.getItem('mrscale_weekly_tasks')
    if (saved) {
      try { setChecked(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  function toggle(i: number) {
    const next = checked.map((v, idx) => (idx === i ? !v : v))
    setChecked(next)
    localStorage.setItem('mrscale_weekly_tasks', JSON.stringify(next))
  }

  const done = checked.filter(Boolean).length

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F0F0F0]">This week&apos;s tasks</h3>
        <span className="text-xs text-[#888888]">{done}/{DEFAULT_TASKS.length} done</span>
      </div>
      <div className="flex flex-col gap-2">
        {DEFAULT_TASKS.map((task, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checked[i]
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-[#D1D5DB] group-hover:border-emerald-500'
              }`}
            >
              {checked[i] && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm transition-colors ${checked[i] ? 'line-through text-[#555555]' : 'text-[#C8C8C8]'}`}>
              {task}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
