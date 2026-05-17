import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NoteForm } from './NoteForm'

export default async function AdminNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: clients }, { data: recentNotes }] = await Promise.all([
    supabase.rpc('get_clients'),
    supabase
      .from('operator_notes')
      .select('*, users!inner(name, email)')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Operator notes</h1>
        <p className="text-sm text-[#888888] mt-1">Send weekly notes to your clients.</p>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        {/* Recent notes */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#F0F0F0]">Recent notes</h2>
          {(recentNotes ?? []).length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-[#252525] rounded-xl p-6 text-center">
              <p className="text-sm text-[#555555]">No notes sent yet.</p>
            </div>
          ) : (
            (recentNotes ?? []).map((n: { id: string; note: string; created_at: string; users: { name: string | null; email: string } }) => (
              <div key={n.id} className="bg-[#141414] border border-[#252525] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#E0E0E0]">{n.users?.name ?? n.users?.email}</span>
                  <span className="text-xs text-[#555555]">
                    {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-[#C8C8C8] leading-relaxed whitespace-pre-wrap">{n.note}</p>
              </div>
            ))
          )}
        </div>

        {/* Post form */}
        <div className="sticky top-0">
          <NoteForm clients={clients ?? []} />
        </div>
      </div>
    </div>
  )
}
