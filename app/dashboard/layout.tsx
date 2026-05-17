import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/Sidebar'
import { SignOutClient } from '@/components/SignOutClient'
import { NotificationBell } from '@/components/NotificationBell'
import { CashRain } from '@/components/CashRain'
import { EditNameButton } from '@/components/EditNameButton'
import { BrandName } from '@/components/BrandName'
import { getPackageLabel, getPackageBadgeColor } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".5"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".5"/></svg> },
  { label: 'Onboarding docs', href: '/dashboard/onboarding', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 5h6M4.5 7.5h6M4.5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label: 'Growth stats', href: '/dashboard/stats', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 12L4.5 7l3 3 3-5 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Revenue', href: '/dashboard/revenue', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4v7M5.5 9.5c0 .828.895 1.5 2 1.5s2-.672 2-1.5S8.605 8 7.5 8s-2-.672-2-1.5S6.395 5 7.5 5s2 .672 2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { label: 'Calls', href: '/dashboard/calls', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3.5 1.5h2.25c.276 0 .5.224.5.5V4.5a.5.5 0 0 1-.5.5H4.5v.25A6.25 6.25 0 0 0 10.75 11H11v-.75a.5.5 0 0 1 .5-.5h2.5a.5.5 0 0 1 .5.5V12.5A1 1 0 0 1 13.5 13.5h-.25A11.25 11.25 0 0 1 2 2.25V2a.5.5 0 0 1 .5-.5H3.5Z" stroke="currentColor" strokeWidth="1.2"/></svg> },
  { label: 'Content plan', href: '/dashboard/content-plan', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5.5h13M5 2v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label: 'Funnel', href: '/dashboard/funnel', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 2h12l-5 6v4l-2-1V8l-5-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="6" y="3" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="3" width="3" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { label: 'Clients', href: '/dashboard/clients', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 12.5c0-2.485 2.015-4.5 4.5-4.5S10 10.015 10 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 8.5c1.933.277 3.5 1.96 3.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label: 'DM Scripts', href: '/dashboard/dm-scripts', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h8A1.5 1.5 0 0 1 13 3.5v6A1.5 1.5 0 0 1 11.5 11H9l-2 2-2-2H3.5A1.5 1.5 0 0 1 2 9.5v-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { label: 'Hook generator', href: '/dashboard/hook-generator', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 1.5L5.5 8H9L5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Win wall', href: '/dashboard/win-wall', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L7.5 9.387 4.91 10.509l.59-3.44L3 4.632l3.455-.502L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { label: 'Resources', href: '/dashboard/resources', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2.5A1.5 1.5 0 0 1 4.5 1H11a1 1 0 0 1 1 1v11l-4.5-2L3 13V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { label: 'Deliverables', href: '/dashboard/deliverables', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('name, role, package').eq('id', user.id).single()

  const cookieStore = await cookies()
  const previewCookie = cookieStore.get('mrscale_preview_client')?.value
  if (profile?.role === 'admin' && !previewCookie) redirect('/admin')

  const displayName = profile?.name ?? user.email ?? ''
  const pkgLabel = getPackageLabel(profile?.package ?? null)
  const pkgColor = getPackageBadgeColor(profile?.package ?? null)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0A0A0A]">
      <header className="h-14 border-b border-white/5 bg-[#0D0D0D] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white"/>
            <path d="M19 5L10 17H16L13 27L22 15H16L19 5Z" fill="#0A0A0A"/>
          </svg>
          <BrandName />
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-white/10 bg-white/5 text-[#999]`}>
            {pkgLabel}
          </span>
          <NotificationBell userId={user.id} />
          <EditNameButton displayName={displayName} />
          <SignOutClient />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={navItems} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] relative">
          <CashRain />
          <div className="relative" style={{ zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
