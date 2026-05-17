'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string | null
  type: string
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  deliverable_done: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="#10B981" strokeWidth="1.3"/><path d="M4.5 7.5l2 2 4-4" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  content_added: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="#888888" strokeWidth="1.3"/><path d="M1 5.5h13M5 2v3.5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  milestone: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L7.5 9.387 4.91 10.509l.59-3.44L3 4.632l3.455-.502L7.5 1.5Z" stroke="#F59E0B" strokeWidth="1.3" strokeLinejoin="round"/></svg>
  ),
  operator_message: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h8A1.5 1.5 0 0 1 13 3.5v6A1.5 1.5 0 0 1 11.5 11H9l-2 2-2-2H3.5A1.5 1.5 0 0 1 2 9.5v-6Z" stroke="#8B5CF6" strokeWidth="1.3" strokeLinejoin="round"/></svg>
  ),
  general: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5A4.5 4.5 0 0 1 12 6v2.5l1 2H2l1-2V6a4.5 4.5 0 0 1 4.5-4.5Z" stroke="#9CA3AF" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 12.5a1.5 1.5 0 0 0 3 0" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data ?? [])
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setOpen(false)
  }

  async function markAllRead() {
    const supabase = createClient()
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6v2.5l1 2h-11l1-2V6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#141414] border border-[#252525] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#252525]">
            <span className="text-sm font-semibold text-[#F0F0F0]">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#E0E0E0] hover:text-[#D0D0D0] font-medium cursor-pointer transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2A7 7 0 0 1 19 9v4l1.5 3h-17L5 13V9A7 7 0 0 1 12 2Z" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p className="text-sm text-[#555555]">You&apos;re all caught up</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#111111] transition-colors border-b border-[#252525] last:border-0 flex items-start gap-3 ${!n.read ? 'bg-[#1A1A1A] border-l-2 border-l-[#E8E8E8]' : ''}`}
                >
                  <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] ?? TYPE_ICON.general}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#F0F0F0] leading-tight">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-[#888888] mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[11px] text-[#555555] mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
