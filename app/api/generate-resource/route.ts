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

interface Params {
  docType: string
  clientName: string
  offer: string
  audience: string
  price: string
  icp: string
  extras: Record<string, string>
}

function buildPrompt(p: Params): { title: string; category: string; prompt: string } {
  const profile = `CLIENT PROFILE:
- Client Name: ${p.clientName}
- Offer/Service: ${p.offer}
- Target Audience: ${p.audience}
- Price Point: ${p.price}
- Ideal Client (ICP): ${p.icp}`

  switch (p.docType) {
    case 'webinar_strategy': {
      const topic = p.extras.webinarTopic || 'their core offer'
      return {
        title: `Webinar Strategy — ${topic}`,
        category: 'weekly_planner',
        prompt: `You are an expert webinar strategist and high-ticket sales coach. Create a complete, professional Webinar Strategy Document.

${profile}
- Webinar Topic: ${topic}

Write the full strategy document. Be specific, detailed, and tailor everything to their exact offer and audience. Use clear headings and bullet points.

# WEBINAR STRATEGY: ${topic}
*For: ${p.clientName}*

## 1. PRE-WEBINAR PREPARATION (2 Weeks Before)
Tech setup checklist, slide structure outline (10–12 slides), practice schedule, logistics (landing page, confirmation email, reminder sequence).

## 2. PROMOTION PLAN (7 Days Before)
Day-by-day promotion plan:
- Instagram story/post schedule with specific content ideas
- Email blast schedule (days 7, 3, 1 before and day-of)
- DM outreach to warm leads (include exact template messages)
- Last 48-hour urgency push

## 3. WEBINAR STRUCTURE (90-Minute Breakdown)
Minute-by-minute guide covering welcome, teaching, case studies, bridge to offer, pitch, and close.

## 4. THE PITCH (Presenting "${p.offer}" at ${p.price})
Complete pitch script: bridge statement, value stack, price reveal with anchoring, bonus stack, guarantee, and call to action.

## 5. POST-WEBINAR FOLLOW-UP (48 Hours)
Replay email, objection-handling email, DM script for attendees who didn't buy, DM script for no-shows, final deadline email.

## 6. KPIs & BENCHMARKS
Specific numbers to aim for based on ${p.audience}.

Write the complete, detailed document now.`,
      }
    }

    case 'dm_scripts': {
      const platform = p.extras.platform || 'Instagram'
      return {
        title: `DM Scripts Pack — ${platform}`,
        category: 'dm_scripts',
        prompt: `You are an expert sales copywriter who writes high-converting DM scripts for coaches and consultants. Write 5 fully complete, word-for-word DM scripts. Do NOT use placeholders like [name] or [result] — write the actual messages as they would be sent.

${profile}
- Platform: ${platform}

Each script must directly reference:
- The specific transformation "${p.offer}" delivers
- The specific struggles of "${p.audience}"
- The ${p.price} price context where relevant (don't mention price in cold outreach, do in objection handling)
- The tone and language that resonates on ${platform}

# DM SCRIPTS PACK — ${platform}
*For: ${p.clientName}*

---

## SCRIPT 1: Cold Outreach (First Touch)
Write the exact opening DM to send to a cold ${platform} account who fits the profile of "${p.audience}". Reference something specific about them (their content, bio, or a common situation this audience faces). Do not pitch. Goal is a reply.

Opening message:
[write it out in full]

If no reply after 3 days, follow-up:
[write it out in full]

When to use this: [1 sentence]

---

## SCRIPT 2: Warm Lead Opener (They Watched Your Story / Liked Your Post)
Write the exact DM to send when someone from "${p.audience}" engages with ${p.clientName}'s content but doesn't reach out. Reference the content they engaged with or their situation. Keep it conversational.

Message:
[write it out in full]

When to use this: [1 sentence]

---

## SCRIPT 3: Objection Handler — "I need to think about it" / "I can't afford it"
Write the exact response when a prospect from "${p.audience}" says they need to think about it or questions the ${p.price} investment in "${p.offer}". Acknowledge the concern, reframe the value, and move forward without being pushy.

Response:
[write it out in full]

---

## SCRIPT 4: Booking the Discovery Call
Write the exact DM to send when the conversation is going well and it's time to transition to a call. Make it feel like a natural next step, not a hard close. The call should feel low-pressure.

Message:
[write it out in full]

---

## SCRIPT 5: Post-Call Follow-Up (They Didn't Buy on the Call)
Write the exact DM to send 24–48 hours after a discovery call where the prospect from "${p.audience}" didn't sign up. Re-open the conversation, address likely hesitation around "${p.offer}", and give them a clear path forward.

Message:
[write it out in full]

---

## HOW TO USE THESE ON ${platform}
4 specific tips for ${p.clientName} on timing, tone, and volume when using these scripts with ${p.audience} on ${platform}.`,
      }
    }

    case 'caption_templates': {
      const pillars = p.extras.contentPillars || 'authority, social proof, value'
      return {
        title: 'Caption Templates Pack',
        category: 'caption_templates',
        prompt: `You are an expert social media copywriter for personal brand coaches. Create 5 done-for-you caption templates.

${profile}
- Content Pillars: ${pillars}

Write 5 complete, post-ready captions with hook, body, and CTA. Each should attract ${p.audience}.

# CAPTION TEMPLATES PACK
*For: ${p.clientName}*

## CAPTION 1: Authority / Credibility Post
Hook (scroll-stopping first line), body (3–4 sentences), CTA, 6–8 hashtags.

## CAPTION 2: Social Proof / Client Result
Hook, body showcasing a transformation, CTA, hashtags.

## CAPTION 3: Value / Education Post
Hook leading with a bold insight, body with actionable value, CTA, hashtags.

## CAPTION 4: Controversial / Opinion Post (Engagement Driver)
Hook with a polarising take, body that expands, CTA inviting responses, hashtags.

## CAPTION 5: Personal Story / Vulnerability Post
Hook opening with a vulnerable moment, body with the lesson, CTA, hashtags.

## HOW TO USE THESE CAPTIONS
Tips on adapting and scheduling for maximum reach with ${p.audience}.

Write all 5 captions now, tailored to ${p.audience} for ${p.offer}.`,
      }
    }

    case 'email_sequence': {
      const leadMagnet = p.extras.leadMagnet || 'the free training'
      return {
        title: 'Welcome Email Sequence',
        category: 'email_swipe',
        prompt: `You are an expert email copywriter for high-ticket coaches. Write a 5-email welcome sequence.

${profile}
- Lead Magnet / Entry Point: ${leadMagnet}

Write 5 complete emails. Each needs subject line, preview text, and full body copy.

# WELCOME EMAIL SEQUENCE
*For: ${p.clientName} | Entry: ${leadMagnet}*

## EMAIL 1 — Immediate Delivery (Send: Instantly)
Subject, preview text, full body (~150 words), CTA.

## EMAIL 2 — The Origin Story (Send: Day 2)
Subject, preview text, transformation/credibility story (~200 words), CTA.

## EMAIL 3 — Value Bomb (Send: Day 3)
Subject, preview text, actionable tip for ${p.audience} (~200 words), CTA.

## EMAIL 4 — Social Proof (Send: Day 5)
Subject, preview text, client case study (~200 words), CTA.

## EMAIL 5 — Soft Pitch (Send: Day 7)
Subject, preview text, natural introduction of ${p.offer} (~200 words), CTA to book.

## SEQUENCE SETUP NOTES
Technical tips and key metrics to watch.

Write all 5 emails now, tailored to ${p.audience} for ${p.offer} at ${p.price}.`,
      }
    }

    case 'vsl_script': {
      const mainBenefit = p.extras.mainBenefit || `achieve results with ${p.offer}`
      return {
        title: 'VSL Script',
        category: 'funnel_copy',
        prompt: `You are an expert direct response copywriter. Write a complete 15-minute VSL (Video Sales Letter) script.

${profile}
- Main Transformation Promise: ${mainBenefit}

Write a full script with time markers.

# VSL SCRIPT
*For: ${p.clientName} | Offer: ${p.offer} — ${p.price}*

## [0:00–1:00] HOOK & PATTERN INTERRUPT
Bold opening statement, question, or story that grabs attention immediately.

## [1:00–3:00] IDENTIFY THE PROBLEM
Agitate the pain points of ${p.audience}. Make them feel deeply understood.

## [3:00–6:00] YOUR STORY / CREDIBILITY
Transformation journey. Why ${p.clientName} is qualified to help.

## [6:00–9:00] THE SOLUTION
Introduce ${p.offer} as the vehicle to achieve ${mainBenefit}.

## [9:00–11:00] SOCIAL PROOF
3 specific client case studies with numbers.

## [11:00–13:00] THE OFFER STACK
Everything included in ${p.offer}. Stack the value.

## [13:00–14:00] PRICE & ANCHOR
Reveal ${p.price}. Use anchoring to make it a no-brainer.

## [14:00–15:00] CTA & CLOSE
Clear, urgent call to action.

## PRODUCTION NOTES
Tips on recording, editing, and funnel placement.

Write the complete script now.`,
      }
    }

    case 'paid_ads': {
      const platforms = p.extras.adPlatforms || 'Facebook and Instagram'
      const budget = p.extras.monthlyBudget || '£500/month'
      return {
        title: 'Paid Ads Strategy',
        category: 'weekly_planner',
        prompt: `You are an expert paid advertising strategist for coaches. Create a complete paid ads strategy.

${profile}
- Ad Platforms: ${platforms}
- Monthly Budget: ${budget}

# PAID ADS STRATEGY
*For: ${p.clientName} | Platforms: ${platforms} | Budget: ${budget}*

## CAMPAIGN OVERVIEW
Objective, funnel structure (awareness → interest → conversion), budget split recommendation.

## TARGET AUDIENCE SETUP
Detailed targeting for ${p.audience}: demographics, 15–20 interest targets, lookalike strategy, exclusions.

## AD CREATIVE STRATEGY

### Hook Ads — Awareness (30% of budget)
3 complete ad concepts: hook (first 3 seconds), body copy, CTA, format recommendation.

### Social Proof Ads — Retargeting (40% of budget)
2 complete ad concepts with full copy.

### Conversion Ads — Bottom of Funnel (30% of budget)
2 complete ad concepts for ${p.offer} at ${p.price}.

## CAMPAIGN STRUCTURE
Recommended campaign / ad set / ad organisation.

## KPIs & OPTIMISATION
Target CPL, target CPA, when to scale/kill/test, weekly optimisation checklist.

## 30-DAY LAUNCH PLAN
Week-by-week rollout.

Write the complete strategy now.`,
      }
    }

    case 'onboarding_questionnaire': {
      return {
        title: 'Client Onboarding Questionnaire',
        category: 'other',
        prompt: `You are an expert business coach. Create a comprehensive client onboarding questionnaire.

${profile}

Create a detailed questionnaire for new clients of ${p.offer} at ${p.price}. Mark each question with [SHORT ANSWER], [LONG ANSWER], [MULTIPLE CHOICE: option a / option b / option c], or [SCALE 1–10].

# CLIENT ONBOARDING QUESTIONNAIRE
*For: ${p.clientName} | Offer: ${p.offer}*

## SECTION 1: About You (5–6 questions)
Personal and professional background.

## SECTION 2: Your Current Situation (6–8 questions)
Where they are now — the problem they're experiencing.

## SECTION 3: Goals & Vision (5–6 questions)
What they want to achieve and by when.

## SECTION 4: Your Business & Offer (8–10 questions)
Details relevant to what ${p.offer} helps with.

## SECTION 5: Audience & Marketing (6–8 questions)
Current marketing efforts and audience size.

## SECTION 6: Resources & Constraints (4–5 questions)
Time, budget, team, tools available.

## SECTION 7: Past Experiences (4–5 questions)
What they've tried before, what worked/didn't.

## SECTION 8: Working Together (4–5 questions)
Communication preferences, availability, expectations.

Write all questions now, tailored specifically to clients of ${p.offer}.`,
      }
    }

    case 'icp_worksheet': {
      return {
        title: 'ICP Deep Dive Worksheet',
        category: 'other',
        prompt: `You are an expert marketing strategist. Create a complete, filled-in ICP (Ideal Client Profile) worksheet.

${profile}

Fill in the worksheet based on the information provided. Make it specific and actionable.

# IDEAL CLIENT PROFILE — DEEP DIVE
*For: ${p.clientName}*

## WHO THEY ARE
Demographics (age, gender, location, income, job, family situation) and psychographics (values, personality, lifestyle, aspirations). Fill in specifics for ${p.audience}.

## THEIR PROBLEM
Surface-level problem (what they'd Google), deep emotional problem (what they feel), and root cause.

## THEIR DREAM OUTCOME
Tangible result they want, how they want to feel, identity/status change they seek.

## TOP 5 OBJECTIONS
Each objection with a script for how to overcome it.

## WHERE TO FIND THEM
Online platforms, communities/groups, content they consume, influencers they follow.

## HOW TO SPEAK TO THEM
Power words and phrases that resonate, words to avoid, and the transformation in one sentence.

## MESSAGING FRAMEWORK
Headline formula, hook formula, and CTA that converts — all specific to ${p.audience}.

Write the complete, detailed worksheet now for ${p.audience} who buy ${p.offer}.`,
      }
    }

    case 'offer_framework': {
      return {
        title: 'Offer Framework',
        category: 'other',
        prompt: `You are an expert offer strategist. Create a complete offer framework document.

${profile}

Fill in the framework specifically for their offer.

# OFFER FRAMEWORK
*For: ${p.clientName} | Offer: ${p.offer} — ${p.price}*

## 1. THE CORE TRANSFORMATION
One-sentence promise, before state, after state, time frame.

## 2. THE VEHICLE
Why this method is the best way to get the result. What makes it different from every other solution. The unique mechanism.

## 3. THE VALUE STACK
Table format: component name, what it is, and assigned value for each deliverable. Total value vs. actual price (${p.price}).

## 4. THE GUARANTEE
Recommended guarantee structure and exact wording.

## 5. PRICING STRATEGY
Anchoring strategy, instalment option if applicable, and payment options.

## 6. THE OFFER NARRATIVE
Full 60-second script for presenting this offer verbally.

## 7. POSITIONING STATEMENT
How ${p.clientName} should be known in the market, 1-line social bio, 30-second elevator pitch.

## 8. OBJECTION RESPONSES
Top 3 objections with pre-emptive handling scripts.

Write the complete framework now, specific to ${p.offer} for ${p.audience} at ${p.price}.`,
      }
    }

    case 'landing_page_copy': {
      const pageGoal = p.extras.pageGoal || 'book a strategy call'
      return {
        title: 'Landing Page Copy',
        category: 'funnel_copy',
        prompt: `You are an expert conversion copywriter for high-ticket coaches. Write complete landing page copy.

${profile}
- Page Goal: ${pageGoal}

Write every section of the page in full.

# LANDING PAGE COPY
*For: ${p.clientName} | Goal: ${pageGoal}*

## ABOVE THE FOLD
H1 headline, sub-headline, 2–3 sentence hero copy, CTA button text, supporting line below CTA.

## SOCIAL PROOF STRIP
3 short testimonial snippets relevant to ${p.audience}'s results.

## THE PROBLEM SECTION
Section headline, 3–4 pain bullet points for ${p.audience}, empathy paragraph.

## THE SOLUTION SECTION
Section headline, intro to ${p.offer}, 3 key benefits (headline + 2 sentences each).

## HOW IT WORKS
Section headline, 3-step process explanation.

## WHAT YOU GET
Full value stack with benefit-focused descriptions for each component.

## ABOUT [CLIENT NAME]
3–4 sentence authority bio.

## FAQ
5 most common objections answered.

## FINAL CTA SECTION
Closing statement, CTA button text, urgency/scarcity element, risk reversal line.

Write all copy now, tailored to ${p.audience} for ${p.offer} at ${p.price}.`,
      }
    }

    default:
      return {
        title: 'Custom Document',
        category: 'other',
        prompt: `Create a comprehensive, professional document for the following client:\n\n${profile}\n\nWrite a detailed, actionable document with clear sections and specific guidance tailored to their offer and audience.`,
      }
  }
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const key = getAnthropicKey()
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const body = await req.json()
  const { docType, clientName, offer, audience, price, icp, extras = {} } = body

  const { title, category, prompt: docPrompt } = buildPrompt({ docType, clientName, offer, audience, price, icp, extras })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55_000)

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
      max_tokens: 3000,
      messages: [{ role: 'user', content: docPrompt }],
    }),
  })

  clearTimeout(timer)

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  const content = data.content?.[0]?.text ?? ''
  return NextResponse.json({ title, category, content })
}
