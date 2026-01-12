import { createClient } from '@/lib/supabase/server'
import { ParticipantsTable } from '@/components/participants/participants-table'
import { AddParticipantButton } from '@/components/participants/add-participant-button'
import { getCurrentUser } from '@/lib/supabase/server'

interface ParticipantsPageProps {
  params: Promise<{ id: string }>
}

async function getParticipants(cohortId: string) {
  const supabase = await createClient()

  // Get participants with their streaks
  const { data: participants } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      role,
      created_at,
      streaks (
        current_streak,
        last_check_in_date
      )
    `)
    .eq('cohort_id', cohortId)
    .order('created_at', { ascending: false })

  return participants ?? []
}

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { id: cohortId } = await params
  const [participants, user] = await Promise.all([
    getParticipants(cohortId),
    getCurrentUser(),
  ])

  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isSuperAdmin && <AddParticipantButton cohortId={cohortId} />}
      </div>

      <ParticipantsTable
        participants={participants}
        cohortId={cohortId}
        canManage={isSuperAdmin}
      />
    </div>
  )
}
