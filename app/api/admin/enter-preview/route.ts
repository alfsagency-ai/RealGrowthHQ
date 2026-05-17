import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', req.url))

  const { searchParams } = req.nextUrl
  const clientId = searchParams.get('client') ?? ''
  const page = searchParams.get('page') ?? 'deliverables'

  const res = NextResponse.redirect(new URL(`/dashboard/${page}`, req.url))
  res.cookies.set('mrscale_preview_client', clientId, { path: '/', httpOnly: false, sameSite: 'lax' })
  return res
}
