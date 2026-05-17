'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Fetch role to decide redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Authentication failed. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'
    router.push(destination)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#C8C8C8]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#C8C8C8]">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 rounded-lg border border-[#252525] bg-[#141414] text-sm text-[#F0F0F0] placeholder:text-[#555555] outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-800/30 px-3 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
