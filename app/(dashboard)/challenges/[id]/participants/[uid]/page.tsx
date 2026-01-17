import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Flame, Mail, Calendar, Trophy, CheckCircle2, Clock, Dumbbell, Check, X } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface UserDetailPageProps {
  params: Promise<{ id: string; uid: string }>
}

async function getUserData(userId: string, cohortId: string) {
  const supabase = await createClient()

  const [
    { data: user },
    { data: checkIns },
    { data: habits },
    { data: streak },
    { data: selections },
    { data: mealOptions },
    { data: participationHistory },
    { data: weeklyExercise },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('cohort_id', cohortId)
      .single(),
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14),
    supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('meal_selections')
      .select('*')
      .eq('user_id', userId)
      .order('challenge_week', { ascending: true }),
    supabase
      .from('meal_options')
      .select('*'),
    supabase
      .from('cohort_participants')
      .select(`
        *,
        cohorts (
          id,
          name,
          start_date,
          end_date
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false }),
    supabase
      .from('weekly_exercise')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: true }),
  ])

  return { user, checkIns, habits, streak, selections, mealOptions, participationHistory, weeklyExercise }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id: cohortId, uid: userId } = await params
  const { user, checkIns, habits, streak, selections, mealOptions, participationHistory, weeklyExercise } = await getUserData(userId, cohortId)

  if (!user) {
    notFound()
  }

  // Helper to get meal name from selection
  function getMealName(week: number | null, day: number, mealType: string, choice: string) {
    if (week === null) return choice
    const meal = mealOptions?.find(
      m => m.challenge_week === week && m.challenge_day === day && m.meal_type === mealType
    )
    if (!meal) return choice
    return choice === 'A' ? meal.option_a_name : meal.option_b_name
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href={`/challenges/${cohortId}/participants`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Participants
      </Link>

      {/* User Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-foreground">
              {user.full_name || 'Unnamed Participant'}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
              {user.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-accent rounded-lg px-4 py-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-lg font-semibold text-foreground">{streak?.current_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Exercise */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="h-4 w-4 text-primary" />
          <h2 className="font-medium text-foreground">Weekly Exercise Goal (3x/week)</h2>
        </div>
        {weeklyExercise && weeklyExercise.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {weeklyExercise.map((week, index) => (
              <div
                key={week.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  week.completed_3x
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-muted'
                }`}
              >
                {week.completed_3x ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  Week {index + 1}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({format(new Date(week.week_start_date), 'MMM d')})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No exercise data recorded yet</p>
        )}
      </div>

      {/* Challenge History */}
      {participationHistory && participationHistory.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="font-medium text-foreground">Challenge History</h2>
          </div>
          <div className="space-y-3">
            {participationHistory.map((participation) => {
              const cohort = participation.cohorts as { id: string; name: string; start_date: string; end_date: string } | null
              const isCurrentChallenge = cohort?.id === cohortId
              return (
                <div
                  key={participation.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentChallenge ? 'bg-primary/5 border border-primary/20' : 'bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {participation.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : participation.status === 'active' ? (
                      <Clock className="h-4 w-4 text-blue-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {cohort?.name || 'Unknown Challenge'}
                        {isCurrentChallenge && (
                          <span className="ml-2 text-xs text-primary">(Current)</span>
                        )}
                      </p>
                      {cohort && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(cohort.start_date), 'MMM d')} - {format(new Date(cohort.end_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      participation.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : participation.status === 'active'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {participation.status === 'completed' ? 'Completed' : participation.status === 'active' ? 'In Progress' : 'Left'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {format(new Date(participation.joined_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-ins */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-medium text-foreground mb-4">Recent Check-ins</h2>
          {checkIns && checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(new Date(checkIn.date), 'EEEE, MMM d')}
                  </p>
                  <p className="text-sm text-foreground">
                    {checkIn.challenges_faced || 'No challenges noted'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No check-ins yet</p>
          )}
        </div>

        {/* Daily Habits */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-medium text-foreground mb-4">Daily Habits</h2>
          {habits && habits.length > 0 ? (
            <div className="space-y-3">
              {habits.slice(0, 7).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(habit.date), 'EEE, MMM d')}
                  </span>
                  <div className="flex items-center gap-4">
                    {habit.weight_kg && (
                      <span>{habit.weight_kg} kg</span>
                    )}
                    {habit.steps && (
                      <span>{habit.steps.toLocaleString()} steps</span>
                    )}
                    {habit.water_ml && (
                      <span>{habit.water_ml} ml</span>
                    )}
                    <span className={habit.meal_adherence ? 'text-green-600' : 'text-muted-foreground'}>
                      {habit.meal_adherence ? '✓ Meals' : '○ Meals'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No habits logged yet</p>
          )}
        </div>
      </div>

      {/* Meal Selections */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-medium text-foreground mb-4">Meal Selections</h2>
        {selections && selections.length > 0 ? (
          <div className="space-y-6">
            {selections.map((selection) => (
              <div key={selection.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Week {selection.challenge_week}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {selection.delivery_preference}
                    </span>
                    {selection.locked && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(selection.selections as Record<string, string>).map(([key, value]) => {
                    const [day, mealType] = key.split('_')
                    const mealName = getMealName(selection.challenge_week, parseInt(day), mealType, value)
                    return (
                      <div key={key} className="text-sm">
                        <span className="text-muted-foreground">
                          Day {day} {mealType}:
                        </span>{' '}
                        <span className="text-foreground">{mealName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No meal selections yet</p>
        )}
      </div>
    </div>
  )
}
