import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getAnthropicKey(): string | null {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    const content = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    return match?.[1]?.trim() ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { topic, format, tone } = await req.json()
    if (!topic || !format || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = getAnthropicKey()
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'You are an expert Instagram content strategist specialising in personal brands, coaches, and service sellers. Generate exactly 10 high-performing hooks for Instagram content. Return ONLY a JSON array of 10 strings, no other text, no markdown, no numbering. Each hook should be under 15 words, create immediate curiosity or emotion, and be optimised for the specified format and tone.',
        messages: [
          { role: 'user', content: `Topic: ${topic}. Format: ${format}. Tone: ${tone}. Generate 10 hooks.` },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic API error:', res.status, err)
      return NextResponse.json({ error: `Anthropic API error: ${res.status}` }, { status: 500 })
    }

    const data = await res.json()
    const raw: string = data.content?.[0]?.text?.trim() ?? ''
    const hooks: string[] = JSON.parse(raw)
    return NextResponse.json({ hooks })
  } catch (err) {
    console.error('Hook generation error:', err)
    return NextResponse.json({ error: 'Failed to generate hooks. Try again.' }, { status: 500 })
  }
}
