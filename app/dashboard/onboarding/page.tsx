import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './OnboardingForm'
import { BrandBrief } from './BrandBrief'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: onboarding }] = await Promise.all([
    supabase.from('users').select('id, name, instagram_handle, niche, main_offer, target_audience, tone_of_voice, revenue_goal, pain_points').eq('id', user.id).single(),
    supabase.from('onboarding_completed').select('completed').eq('client_id', user.id).maybeSingle(),
  ])

  const completed = onboarding?.completed === true

  if (completed && profile) {
    return <BrandBrief profile={profile} />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#F0F0F0]">Onboarding</h1>
        <p className="text-sm text-[#888888] mt-1">
          Let&apos;s get your brand brief set up. This takes about 3 minutes.
        </p>
      </div>
      <OnboardingForm profile={profile ?? { id: user.id, name: null, instagram_handle: null, niche: null, main_offer: null, target_audience: null, tone_of_voice: null, revenue_goal: null, pain_points: null }} />
    </div>
  )
}
