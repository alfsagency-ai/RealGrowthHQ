import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DeliverablesList } from './DeliverablesList'

export default async function DeliverablesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, cookieStore] = await Promise.all([
    supabase.from('users').select('role, package').eq('id', user.id).single(),
    cookies(),
  ])

  const isAdmin = profile?.role === 'admin'
  const previewClientId = cookieStore.get('mrscale_preview_client')?.value
  const clientId = isAdmin && previewClientId ? previewClientId : user.id

  // Fetch client's package if admin is previewing
  let clientPackage = profile?.package ?? 'growth'
  if (isAdmin && previewClientId) {
    const { data: rows } = await supabase.rpc('get_client_by_id', { client_id: previewClientId })
    clientPackage = rows?.[0]?.package ?? 'growth'
  }

  // Auto-populate from templates if no deliverables yet
  const { count } = await supabase
    .from('deliverables')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)

  if (count === 0) {
    const { data: templates } = await supabase
      .from('deliverable_templates')
      .select('*')
      .eq('package', clientPackage)
      .order('position')

    if (templates && templates.length > 0) {
      await supabase.from('deliverables').insert(
        templates.map(t => ({
          client_id: clientId,
          title: t.title,
          category: t.category,
          status: 'upcoming',
          position: t.position,
        }))
      )
    }
  }

  const { data: deliverables } = await supabase
    .from('deliverables')
    .select('*')
    .eq('client_id', clientId)
    .order('position')

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Deliverables</h1>
        <p className="text-sm text-[#888888] mt-1">Track everything being built for your brand.</p>
      </div>
      <DeliverablesList
        deliverables={deliverables ?? []}
        isAdmin={isAdmin}
        clientId={clientId}
      />
    </div>
  )
}
