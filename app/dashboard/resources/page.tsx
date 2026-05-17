import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ResourcesClient } from './ResourcesClient'

export default async function ResourcesPage() {
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

  const [{ data: resources }, { data: allClients }, { data: templates }] = await Promise.all([
    supabase.from('resources').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    isAdmin
      ? supabase.rpc('get_clients')
      : Promise.resolve({ data: [] }),
    isAdmin
      ? supabase.from('resource_templates').select('*').order('category').order('sort_order')
      : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Resources</h1>
        <p className="text-sm text-[#888888] mt-1">Everything your operator has prepared for you.</p>
      </div>
      <ResourcesClient
        resources={resources ?? []}
        isAdmin={isAdmin}
        clients={allClients ?? []}
        templates={templates ?? []}
      />
    </div>
  )
}
