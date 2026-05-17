import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DmScriptsClient } from './DmScriptsClient'

export default async function DmScriptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, cookieStore] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).single(),
    cookies(),
  ])

  const isAdmin = profile?.role === 'admin'
  const previewClientId = cookieStore.get('mrscale_preview_client')?.value
  const clientId = isAdmin && previewClientId ? previewClientId : user.id

  // Fetch the most recent generated scripts for this client
  const { data: saved } = await supabase
    .from('resources')
    .select('id, content, title')
    .eq('client_id', clientId)
    .eq('category', 'dm_scripts')
    .not('content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <DmScriptsClient
      isAdmin={isAdmin}
      clientId={clientId}
      savedScripts={saved?.content ?? null}
      savedTitle={saved?.title ?? null}
    />
  )
}
