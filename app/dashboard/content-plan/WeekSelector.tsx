'use client'

import { useRouter } from 'next/navigation'

export function WeekSelector({ weekStart }: { weekStart: string }) {
  const router = useRouter()

  function navigate(offset: number) {
    const d = new Date(weekStart)
    d.setUTCDate(d.getUTCDate() + offset * 7)
    router.push(`?week=${d.toISOString().split('T')[0]}`)
  }

  const label = new Date(weekStart).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })

  return (
    <div className="flex items-center gap-1 bg-[#141414] border border-[#252525] rounded-lg px-1 py-1">
      <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-md hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span className="text-sm font-medium text-[#F0F0F0] px-3 select-none">Week of {label}</span>
      <button onClick={() => navigate(1)} className="w-7 h-7 rounded-md hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
