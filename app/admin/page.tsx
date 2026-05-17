import { createClient } from '@/lib/supabase/server'

const PAGES = [
  { label: 'Deliverables', page: 'deliverables' },
  { label: 'Resources', page: 'resources' },
  { label: 'Win wall', page: 'win-wall' },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase.rpc('get_clients')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Clients</h1>
        <p className="text-sm text-[#888888] mt-1">Manage your client accounts and campaigns.</p>
      </div>

      <div className="flex flex-col gap-3">
        {(clients ?? []).length === 0 ? (
          <div className="bg-[#141414] border border-dashed border-[#252525] rounded-xl p-8 text-center">
            <p className="text-sm text-[#555555]">No clients yet.</p>
          </div>
        ) : (
          (clients ?? []).map((c: { id: string; name: string | null; email: string; package: string | null; created_at: string }) => (
            <div key={c.id} className="bg-[#141414] border border-[#252525] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#F0F0F0]">{c.name ?? 'Unnamed'}</p>
                <p className="text-xs text-[#555555]">{c.email} · {c.package ?? 'No package'}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {PAGES.map(p => (
                  <a key={p.page}
                    href={`/api/admin/enter-preview?client=${c.id}&page=${p.page}`}
                    className="h-7 px-3 rounded-lg border border-[#252525] text-xs font-medium text-[#888888] hover:border-white/25 hover:text-[#E0E0E0] transition-colors">
                    {p.label} →
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
