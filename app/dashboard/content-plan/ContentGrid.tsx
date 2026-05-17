'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const FORMAT_COLORS: Record<string, string> = {
  Reel: 'bg-[#1E1E1E] text-[#E0E0E0]',
  Carousel: 'bg-amber-500/10 text-amber-300',
  Story: 'bg-emerald-500/10 text-emerald-300',
  Post: 'bg-white/10 text-[#A0A0A0]',
}
const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-white/10 text-[#A0A0A0]',
  Ready: 'bg-[#1E1E1E] text-[#E0E0E0]',
  Live: 'bg-emerald-500/10 text-emerald-300',
}

interface Comment { author: string; text: string; timestamp: string }
interface Post {
  id: string; day_of_week: string; format: string; hook: string
  caption: string; status: string; admin_only: boolean; comments: Comment[]
}
interface Props {
  posts: Post[]; weekStart: string; userId: string
  userName: string; userRole: 'admin' | 'client'
}

const inputClass = 'w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all'
const taClass = 'w-full px-3 py-2.5 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all resize-none'

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 rounded-lg hover:bg-[#0F0F0F] flex items-center justify-center text-[#888888] cursor-pointer">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
  )
}

export function ContentGrid({ posts, weekStart, userId, userName, userRole }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addDay, setAddDay] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Add form state
  const [aFormat, setAFormat] = useState('Reel')
  const [aHook, setAHook] = useState('')
  const [aCaption, setACaption] = useState('')
  const [aStatus, setAStatus] = useState('Draft')
  const [aAdminOnly, setAAdminOnly] = useState(false)
  const [aSaving, setASaving] = useState(false)

  const viewPost = selectedId ? posts.find(p => p.id === selectedId) ?? null : null
  const postsByDay: Record<string, Post[]> = Object.fromEntries(DAYS.map(d => [d, []]))
  posts.forEach(p => { if (postsByDay[p.day_of_week]) postsByDay[p.day_of_week].push(p) })

  const statusOptions = userRole === 'admin' ? ['Draft', 'Ready', 'Live'] : ['Draft', 'Ready']

  async function updateStatus(postId: string, status: string) {
    setUpdatingStatus(true)
    const supabase = createClient()
    await supabase.from('content_posts').update({ status }).eq('id', postId)
    setUpdatingStatus(false)
    router.refresh()
  }

  async function sendComment() {
    if (!viewPost || !newComment.trim()) return
    setSendingComment(true)
    const comment: Comment = { author: userName, text: newComment.trim(), timestamp: new Date().toISOString() }
    const updated = [...(viewPost.comments ?? []), comment]
    const supabase = createClient()
    await supabase.from('content_posts').update({ comments: updated }).eq('id', viewPost.id)
    setNewComment('')
    setSendingComment(false)
    router.refresh()
  }

  async function submitPost() {
    if (!addDay || !aHook.trim()) return
    setASaving(true)
    const supabase = createClient()
    await supabase.from('content_posts').insert({
      client_id: userId, day_of_week: addDay, week_start: weekStart,
      format: aFormat, hook: aHook, caption: aCaption,
      status: aStatus, admin_only: aAdminOnly, comments: [],
    })
    if (!aAdminOnly) {
      await supabase.from('notifications').insert({
        client_id: userId,
        type: 'content_added',
        title: 'New content added to your calendar',
        message: `${aFormat} added for ${addDay}: "${aHook.slice(0, 50)}${aHook.length > 50 ? '…' : ''}"`,
      })
    }
    setAHook(''); setACaption(''); setAFormat('Reel'); setAStatus('Draft'); setAAdminOnly(false)
    setAddDay(null)
    setASaving(false)
    router.refresh()
  }

  const panelBase = 'absolute right-0 top-0 h-full bg-[#141414] border-l border-[#252525] shadow-xl flex flex-col transition-transform duration-300'

  return (
    <>
      <div className="flex flex-col gap-2">
        {DAYS.map(day => {
          const dayPosts = postsByDay[day] ?? []
          return (
            <div key={day} className={`bg-[#141414] rounded-xl p-4 border ${dayPosts.length === 0 ? 'border-dashed border-[#252525]' : 'border-[#252525]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#888888] uppercase tracking-wide">{day}</span>
                {userRole === 'admin' && (
                  <button onClick={() => setAddDay(day)} className="text-xs text-[#E0E0E0] hover:text-[#D0D0D0] font-medium cursor-pointer transition-colors">+ Add</button>
                )}
              </div>
              {dayPosts.length === 0 ? (
                <p className="text-xs text-[#C4C9D8]">Nothing scheduled</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dayPosts.map(post => (
                    <button key={post.id} onClick={() => setSelectedId(post.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111111] hover:bg-[#1E1E1E] border border-[#252525] transition-colors cursor-pointer text-left max-w-sm">
                      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${FORMAT_COLORS[post.format]}`}>{post.format}</span>
                      <span className="text-sm text-[#F0F0F0] font-medium truncate">{post.hook.slice(0, 60)}{post.hook.length > 60 ? '…' : ''}</span>
                      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[post.status]}`}>{post.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* View post panel */}
      <div className={`fixed inset-0 z-50 ${viewPost ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/20 transition-opacity ${viewPost ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSelectedId(null)} />
        <div className={`${panelBase} w-[480px] ${viewPost ? 'translate-x-0' : 'translate-x-full'}`}>
          {viewPost && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[viewPost.format]}`}>{viewPost.format}</span>
                  <span className="text-xs text-[#888888]">{viewPost.day_of_week}</span>
                </div>
                <CloseBtn onClick={() => setSelectedId(null)} />
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                <div>
                  <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Hook</p>
                  <p className="text-sm font-medium text-[#F0F0F0] leading-relaxed">{viewPost.hook}</p>
                </div>
                {viewPost.caption && (
                  <div>
                    <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-1">Caption</p>
                    <p className="text-sm text-[#C8C8C8] leading-relaxed whitespace-pre-wrap">{viewPost.caption}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-2">Status</p>
                  <select value={viewPost.status} onChange={e => updateStatus(viewPost.id, e.target.value)} disabled={updatingStatus} className={inputClass}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="border-t border-[#252525] pt-5">
                  <p className="text-[11px] font-medium text-[#555555] uppercase tracking-wide mb-3">Comments ({viewPost.comments?.length ?? 0})</p>
                  <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
                    {(viewPost.comments ?? []).length === 0
                      ? <p className="text-xs text-[#555555]">No comments yet.</p>
                      : (viewPost.comments ?? []).map((c, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#F0F0F0]">{c.author}</span>
                            <span className="text-[10px] text-[#555555]">{new Date(c.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-[#C8C8C8]">{c.text}</p>
                        </div>
                      ))
                    }
                  </div>
                  <div className="flex gap-2">
                    <input value={newComment} onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() } }}
                      placeholder="Add a comment…"
                      className="flex-1 h-9 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all" />
                    <button onClick={sendComment} disabled={sendingComment || !newComment.trim()}
                      className="h-9 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add post panel */}
      <div className={`fixed inset-0 z-50 ${addDay ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/20 transition-opacity ${addDay ? 'opacity-100' : 'opacity-0'}`} onClick={() => setAddDay(null)} />
        <div className={`${panelBase} w-[480px] ${addDay ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
            <h3 className="text-sm font-semibold text-[#F0F0F0]">Add post — {addDay}</h3>
            <CloseBtn onClick={() => setAddDay(null)} />
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Format</label>
              <select value={aFormat} onChange={e => setAFormat(e.target.value)} className={inputClass}>
                {['Reel', 'Carousel', 'Story', 'Post'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Hook</label>
              <input value={aHook} onChange={e => setAHook(e.target.value)} placeholder="The hook for this post…" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Caption</label>
              <textarea value={aCaption} onChange={e => setACaption(e.target.value)} rows={4} placeholder="Full caption…" className={taClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#888888]">Status</label>
              <select value={aStatus} onChange={e => setAStatus(e.target.value)} className={inputClass}>
                {['Draft', 'Ready', 'Live'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setAAdminOnly(v => !v)} className={`w-9 h-5 rounded-full transition-colors relative ${aAdminOnly ? 'bg-emerald-500' : 'bg-[#1E1E1E]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aAdminOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-medium text-[#C8C8C8]">Admin only</span>
            </label>
            <button onClick={submitPost} disabled={aSaving || !aHook.trim()}
              className="mt-2 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              {aSaving ? 'Saving…' : 'Add post'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
