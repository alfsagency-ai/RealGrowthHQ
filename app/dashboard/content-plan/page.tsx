import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMondayOfCurrentWeek } from '@/lib/utils'
import { WeekSelector } from './WeekSelector'
import { ContentGrid } from './ContentGrid'

const PILLARS = [
  { n: 1, name: 'Authority', desc: 'Establish expertise and credibility' },
  { n: 2, name: 'Education', desc: 'Teach something valuable for free' },
  { n: 3, name: 'Relatability', desc: 'Share real stories and struggles' },
  { n: 4, name: 'Social proof', desc: 'Results, testimonials, transformations' },
  { n: 5, name: 'Conversion', desc: 'Soft and direct CTAs to your offer' },
]

export default async function ContentPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const weekStart = week ?? getMondayOfCurrentWeek()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from('users').select('name, role').eq('id', user.id).single(),
    supabase.from('content_posts')
      .select('*')
      .eq('client_id', user.id)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: true }),
  ])

  const userRole = (profile?.role ?? 'client') as 'admin' | 'client'
  const visiblePosts = (posts ?? []).filter(p => userRole === 'admin' || !p.admin_only)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F0]">Content plan</h1>
          <p className="text-sm text-[#888888] mt-1">Your weekly content calendar.</p>
        </div>
        <WeekSelector weekStart={weekStart} />
      </div>

      <ContentGrid
        posts={visiblePosts}
        weekStart={weekStart}
        userId={user.id}
        userName={profile?.name ?? user.email ?? 'You'}
        userRole={userRole}
      />

      {/* Content pillars */}
      <div>
        <h2 className="text-sm font-semibold text-[#F0F0F0] mb-3">Your content pillars</h2>
        <div className="flex flex-wrap gap-3">
          {PILLARS.map(p => (
            <div key={p.n} className="flex items-center gap-2.5 bg-[#141414] border border-[#252525] rounded-xl px-4 py-3 flex-1 min-w-[160px]">
              <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-[#E0E0E0] text-xs font-bold flex items-center justify-center shrink-0">{p.n}</span>
              <div>
                <p className="text-sm font-semibold text-[#F0F0F0]">{p.name}</p>
                <p className="text-xs text-[#888888]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
