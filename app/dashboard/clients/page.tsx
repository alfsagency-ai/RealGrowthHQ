import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ClientsBoard } from './ClientsBoard'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const previewClientId = cookieStore.get('mrscale_preview_client')?.value

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  const isAdmin = profile?.role === 'admin'
  const ownerId = isAdmin && previewClientId ? previewClientId : user.id

  const { data: contacts } = await supabase
    .from('client_contacts')
    .select('*')
    .eq('owner_id', ownerId)
    .order('position')

  return (
    <ClientsBoard
      initialContacts={contacts ?? []}
      ownerId={ownerId}
    />
  )
}
