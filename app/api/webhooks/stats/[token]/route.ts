import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getMondayOfCurrentWeek(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = await createClient()

  // Look up client by webhook token
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('webhook_token', token)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const week_start = (body.week_start as string) || getMondayOfCurrentWeek()

  const payload: Record<string, unknown> = {
    client_id: user.id,
    week_start,
  }

  // Accept any fields that are present and numeric
  const fields = ['followers', 'reach', 'engagement_rate', 'avg_reel_views', 'saves', 'dms', 'bio_clicks', 'email_leads']
  for (const field of fields) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const num = Number(body[field])
      if (!isNaN(num)) payload[field] = num
    }
  }

  // Upsert — updates existing row for the week if it exists
  const { error } = await supabase
    .from('stats_entries')
    .upsert(payload, { onConflict: 'client_id,week_start' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, week_start, fields_received: Object.keys(payload).filter(k => k !== 'client_id' && k !== 'week_start') })
}

// Allow Zapier to verify the webhook is alive
export async function GET() {
  return NextResponse.json({ ok: true, service: 'mr-scale-stats' })
}
