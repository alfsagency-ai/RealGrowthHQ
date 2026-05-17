import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const newToken: string | undefined = body.token

  if (newToken) {
    await supabase.from('users').update({ calendly_token: newToken }).eq('id', user.id)
  }

  const { data: profile } = await supabase.from('users').select('calendly_token').eq('id', user.id).single()
  const token = profile?.calendly_token
  if (!token) return NextResponse.json({ error: 'No Calendly token saved.' }, { status: 400 })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // Get user URI
  const meRes = await fetch('https://api.calendly.com/users/me', { headers })
  const meData = await meRes.json()
  if (!meRes.ok) {
    return NextResponse.json({ error: meData.message ?? 'Invalid Calendly token.' }, { status: 400 })
  }
  const userUri: string = meData.resource?.uri
  if (!userUri) return NextResponse.json({ error: 'Could not retrieve Calendly user URI.' }, { status: 400 })

  // Fetch scheduled events
  const eventsRes = await fetch(
    `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&count=20`,
    { headers }
  )
  const eventsData = await eventsRes.json()
  if (!eventsRes.ok) {
    return NextResponse.json({ error: eventsData.message ?? 'Failed to fetch Calendly events.' }, { status: 400 })
  }

  const events: CalendlyEvent[] = eventsData.collection ?? []

  // Get existing calendly_event_ids
  const { data: existing } = await supabase
    .from('calls')
    .select('calendly_event_id')
    .eq('client_id', user.id)
    .not('calendly_event_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: { calendly_event_id: string }) => r.calendly_event_id))

  // For each new event, try to get invitee name
  const newEvents = events.filter(e => {
    const uuid = e.uri.split('/').pop()!
    return !existingIds.has(uuid)
  })

  const toInsert = await Promise.all(
    newEvents.map(async (e) => {
      const uuid = e.uri.split('/').pop()!
      let leadName = e.name

      try {
        const invRes = await fetch(`https://api.calendly.com/scheduled_events/${uuid}/invitees?count=1`, { headers })
        if (invRes.ok) {
          const invData = await invRes.json()
          const invitee = invData.collection?.[0]
          if (invitee?.name) leadName = invitee.name
        }
      } catch { /* use event name */ }

      return {
        client_id: user.id,
        lead_name: leadName,
        date: e.start_time,
        type: guessCallType(e.name),
        outcome: 'pending' as const,
        source: 'calendly' as const,
        calendly_event_id: uuid,
      }
    })
  )

  if (toInsert.length > 0) {
    await supabase.from('calls').insert(toInsert)
  }

  return NextResponse.json({ imported: toInsert.length, total: events.length })
}

function guessCallType(name: string): 'discovery' | 'followup' | 'sales' | 'other' {
  const n = name.toLowerCase()
  if (n.includes('discovery') || n.includes('intro') || n.includes('free')) return 'discovery'
  if (n.includes('follow') || n.includes('check')) return 'followup'
  if (n.includes('sales') || n.includes('strategy') || n.includes('consultation')) return 'sales'
  return 'other'
}

interface CalendlyEvent {
  uri: string
  name: string
  start_time: string
  end_time: string
}
