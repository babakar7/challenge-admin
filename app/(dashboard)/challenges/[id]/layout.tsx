import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChallengeTabs } from '@/components/challenges/challenge-tabs'
import { ChallengeHeader } from '@/components/challenges/challenge-header'

interface ChallengeLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

async function getChallenge(id: string) {
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('cohorts')
    .select('*')
    .eq('id', id)
    .single()

  if (!challenge) return null

  // Get participant count
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', id)

  return {
    ...challenge,
    participantCount: count ?? 0,
  }
}

export default async function ChallengeLayout({
  children,
  params,
}: ChallengeLayoutProps) {
  const { id } = await params
  const challenge = await getChallenge(id)

  if (!challenge) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <ChallengeHeader challenge={challenge} />
      <ChallengeTabs challengeId={id} />
      <div>{children}</div>
    </div>
  )
}
