'use client'

import { Logo } from './Logo'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  userName?: string
}

export function Topbar({ userName }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-[#252525] bg-[#141414] flex items-center justify-between px-6 shrink-0">
      <Logo />
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-[#888888]">{userName}</span>
        )}
        <button
          onClick={handleSignOut}
          className="text-sm text-[#888888] hover:text-[#F0F0F0] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
