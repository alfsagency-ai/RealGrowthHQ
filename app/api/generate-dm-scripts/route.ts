import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getAnthropicKey(): string | null {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    const content = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    return match?.[1]?.trim() ?? null
  } catch { return null }
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const key = getAnthropicKey()
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const { clientName, offer, audience, price, icp, platform } = await req.json()

  const prompt = `You are a world-class sales copywriter. Generate 5 DM script conversations for ${clientName}.

DETAILS:
- Offer: ${offer}
- Target Audience: ${audience}
- Price: ${price}
- ICP: ${icp || 'Not specified'}
- Platform: ${platform || 'Instagram'}

CRITICAL RULES:
- Return ONLY a valid JSON array. No markdown fences, no explanation, no text before or after.
- Every message must be 100% specific to "${offer}" and "${audience}".
- NEVER write generic placeholders like [specific thing], [result], [your offer], [name].
- Write the ACTUAL words someone would send. Real, human, conversational.
- Prospect messages must sound like a real person from "${audience}" would actually reply.

JSON format — return exactly this structure:
[
  {
    "id": "cold-opener",
    "label": "Cold opener",
    "title": "Cold opener",
    "about": "one sentence on when/why to use this",
    "thread": [
      {"type": "prospect", "text": "something a ${audience} would post or do"},
      {"type": "you", "text": "your opening DM"},
      {"type": "tip", "text": "what makes this work"},
      {"type": "prospect", "text": "a realistic reply"},
      {"type": "you", "text": "your follow-up message"},
      {"type": "tip", "text": "coaching note"}
    ],
    "bottomTip": "the single most important thing to remember about this script"
  }
]

Generate these 5 scripts in this exact order with these exact IDs:

1. id "cold-opener": Cold outreach. Reference what a typical ${audience} would post about (be specific to their niche). Open a conversation without pitching. Goal is a reply, not a sale. The "you" messages must reference ${offer} naturally without being salesy.

2. id "audit-offer": Offer a free Loom audit or quick breakdown specific to ${audience}'s biggest pain point that ${offer} solves. Reference a real, specific outcome that ${offer} delivers (use a believable number). Ask for a call, not a sale.

3. id "followup-1": 3-day soft follow-up. They haven't replied to the audit/initial message. Short, casual, no re-pitching. Just a bump.

4. id "followup-2": Final follow-up. Leave things warm and the door open. Reference one specific gap relevant to ${audience}. This is the last message — many people reply to this one weeks later.

5. id "booking-call": Transition a warm conversation into a booked 20-minute discovery call. Make it feel like a natural next step. Mention ${price} subtly or frame the investment as context for the call.`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55_000)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    clearTimeout(timer)

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })

    const scripts = JSON.parse(jsonMatch[0])
    return NextResponse.json({ scripts })
  } catch {
    clearTimeout(timer)
    return NextResponse.json({ error: 'Generation failed or timed out' }, { status: 500 })
  }
}
