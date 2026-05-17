'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutClient() {
  const router = useRouter()
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={signOut} className="text-sm text-[#888888] hover:text-[#F0F0F0] transition-colors cursor-pointer">
      Sign out
    </button>
  )
}
