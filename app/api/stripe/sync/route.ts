import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const newKey: string | undefined = body.key

  // Save new key if provided
  if (newKey) {
    await supabase.from('users').update({ stripe_key: newKey }).eq('id', user.id)
  }

  // Fetch current key from DB
  const { data: profile } = await supabase.from('users').select('stripe_key').eq('id', user.id).single()
  const stripeKey = profile?.stripe_key
  if (!stripeKey) return NextResponse.json({ error: 'No Stripe key saved.' }, { status: 400 })

  // Fetch from Stripe
  const stripeRes = await fetch(
    'https://api.stripe.com/v1/payment_intents?limit=20&status=succeeded',
    { headers: { Authorization: `Bearer ${stripeKey}` } }
  )
  const stripeData = await stripeRes.json()

  if (!stripeRes.ok) {
    return NextResponse.json({ error: stripeData.error?.message ?? 'Stripe API error' }, { status: 400 })
  }

  const intents: StripeIntent[] = stripeData.data ?? []

  // Get existing stripe_payment_ids to avoid duplicates
  const { data: existing } = await supabase
    .from('revenue_entries')
    .select('stripe_payment_id')
    .eq('client_id', user.id)
    .not('stripe_payment_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: { stripe_payment_id: string }) => r.stripe_payment_id))

  const toInsert = intents
    .filter(pi => !existingIds.has(pi.id))
    .map(pi => ({
      client_id: user.id,
      description: pi.description || pi.metadata?.description || 'Stripe payment',
      amount: pi.amount / 100,
      date: new Date(pi.created * 1000).toISOString().split('T')[0],
      source: 'stripe' as const,
      is_recurring: false,
      stripe_payment_id: pi.id,
    }))

  if (toInsert.length > 0) {
    await supabase.from('revenue_entries').insert(toInsert)
  }

  return NextResponse.json({ imported: toInsert.length, total: intents.length })
}

interface StripeIntent {
  id: string
  amount: number
  created: number
  description: string | null
  metadata?: { description?: string }
}
