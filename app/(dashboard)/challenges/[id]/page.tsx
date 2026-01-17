import { createClient } from '@/lib/supabase/server'
import { Users, Calendar, UtensilsCrossed, CheckCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface OverviewPageProps {
  params: Promise<{ id: string }>
}

async function getChallengeStats(id: string) {
  const supabase = await createClient()

  const [
    { data: challenge },
    { count: participantCount },
    { count: selectionsCount },
    { data: habits },
  ] = await Promise.all([
    supabase.from('cohorts').select('*').eq('id', id).single(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('cohort_id', id),
    supabase.from('meal_selections').select('*, profiles!inner(cohort_id)', { count: 'exact', head: true }).eq('profiles.cohort_id', id),
    supabase.from('daily_habits').select('meal_adherence, profiles!inner(cohort_id)').eq('profiles.cohort_id', id),
  ])

  // Calculate current week
  let currentWeek = 0
  const durationWeeks = challenge?.duration_weeks ?? 4
  if (challenge) {
    const today = new Date()
    const startDate = new Date(challenge.start_date)
    const daysDiff = differenceInDays(today, startDate)
    const totalDays = durationWeeks * 7
    if (daysDiff >= 0 && daysDiff < totalDays) {
      currentWeek = Math.floor(daysDiff / 7) + 1
    }
  }

  // Calculate meal adherence rate
  const totalHabits = habits?.length ?? 0
  const adherentHabits = habits?.filter(h => h.meal_adherence)?.length ?? 0
  const adherenceRate = totalHabits > 0 ? Math.round((adherentHabits / totalHabits) * 100) : 0

  return {
    challenge,
    participantCount: participantCount ?? 0,
    selectionsCount: selectionsCount ?? 0,
    currentWeek,
    durationWeeks,
    adherenceRate,
  }
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params
  const stats = await getChallengeStats(id)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Participants"
          value={stats.participantCount}
          description="Inscrits à ce challenge"
          icon={Users}
        />
        <StatCard
          title="Semaine en cours"
          value={stats.currentWeek > 0 ? `Semaine ${stats.currentWeek}` : 'Non commencé'}
          description={stats.currentWeek > 0 ? `sur ${stats.durationWeeks} semaines` : 'Le challenge n\'a pas encore commencé'}
          icon={Calendar}
          isText
        />
        <StatCard
          title="Sélections repas"
          value={stats.selectionsCount}
          description="Sélections hebdomadaires soumises"
          icon={UtensilsCrossed}
        />
        <StatCard
          title="Adhérence repas"
          value={`${stats.adherenceRate}%`}
          description="Suivent le plan alimentaire"
          icon={CheckCircle}
          isText
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isText = false,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  isText?: boolean
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={`font-medium text-foreground ${isText ? 'text-lg' : 'text-2xl tabular-nums'}`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  )
}
