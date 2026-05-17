'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Call {
  id: string
  lead_name: string
  date: string
  type: 'discovery' | 'followup' | 'sales' | 'other'
  outcome: 'showed' | 'noshow' | 'proposal_sent' | 'closed' | 'pending'
  notes: string | null
  source: string
}

const TYPE_COLORS: Record<string, string> = {
  discovery: 'bg-[#1E1E1E] text-[#E0E0E0]',
  sales: 'bg-emerald-500/10 text-emerald-300',
  followup: 'bg-amber-500/10 text-amber-300',
  other: 'bg-white/10 text-[#A0A0A0]',
}

const OUTCOME_COLORS: Record<string, string> = {
  showed: 'bg-emerald-500/10 text-emerald-300',
  closed: 'bg-emerald-100 text-emerald-800',
  proposal_sent: 'bg-blue-500/10 text-blue-300',
  noshow: 'bg-red-500/10 text-red-300',
  pending: 'bg-white/10 text-[#A0A0A0]',
}

const OUTCOME_OPTIONS = ['showed', 'noshow', 'proposal_sent', 'closed', 'pending']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pill(text: string, color: string) {
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{text.replace('_', ' ')}</span>
}

export function CallsCalendar({ calls }: { calls: Call[] }) {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<Call | null>(null)
  const [panelOutcome, setPanelOutcome] = useState<string>('')
  const [savingOutcome, setSavingOutcome] = useState(false)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  // Build calendar grid (Monday-first)
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0 Sun=6
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  // Group calls by date string YYYY-MM-DD
  const callsByDate: Record<string, Call[]> = {}
  calls.forEach(c => {
    const d = new Date(c.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString()
      if (!callsByDate[key]) callsByDate[key] = []
      callsByDate[key].push(c)
    }
  })

  function openPanel(call: Call) {
    setSelected(call)
    setPanelOutcome(call.outcome)
  }

  async function saveOutcome() {
    if (!selected) return
    setSavingOutcome(true)
    const supabase = createClient()
    await supabase.from('calls').update({ outcome: panelOutcome }).eq('id', selected.id)
    setSavingOutcome(false)
    setSelected(null)
    router.refresh()
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="bg-[#141414] border border-[#252525] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
          <h3 className="text-sm font-semibold text-[#F0F0F0]">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#252525]">
          {DAY_LABELS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-[#555555] uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
            const dayCalls = day ? (callsByDate[day.toString()] ?? []) : []

            return (
              <div
                key={i}
                className={`min-h-[80px] p-2 border-b border-r border-[#252525] ${!day ? 'bg-[#111111]' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white' : 'text-[#888888]'}`}>
                      {day}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayCalls.map(call => (
                        <button
                          key={call.id}
                          onClick={() => openPanel(call)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${TYPE_COLORS[call.type]}`}
                        >
                          {call.lead_name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className={`fixed inset-0 z-50 ${selected ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSelected(null)}
        />
        <div className={`absolute right-0 top-0 h-full w-96 bg-[#141414] border-l border-[#252525] shadow-xl flex flex-col transition-transform duration-300 ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
          {selected && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
                <h3 className="text-sm font-semibold text-[#F0F0F0]">{selected.lead_name}</h3>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Date & time</p>
                    <p className="text-sm text-[#F0F0F0]">
                      {new Date(selected.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Type</p>
                    {pill(selected.type, TYPE_COLORS[selected.type])}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Source</p>
                    <p className="text-sm text-[#C8C8C8] capitalize">{selected.source}</p>
                  </div>
                  {selected.notes && (
                    <div>
                      <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-[#C8C8C8] whitespace-pre-wrap">{selected.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#252525] pt-5">
                  <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-2">Update outcome</p>
                  <select
                    value={panelOutcome}
                    onChange={e => setPanelOutcome(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all mb-3"
                  >
                    {OUTCOME_OPTIONS.map(o => (
                      <option key={o} value={o}>{o.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveOutcome}
                    disabled={savingOutcome || panelOutcome === selected.outcome}
                    className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {savingOutcome ? 'Saving…' : 'Save outcome'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
