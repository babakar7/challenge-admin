import { createClient } from '@/lib/supabase/server'
import { SelectionsTable } from '@/components/selections/selections-table'
import { SelectionExport } from '@/components/selections/selection-export'

interface SelectionsPageProps {
  params: Promise<{ id: string }>
}

async function getSelections(cohortId: string) {
  const supabase = await createClient()

  // Get the cohort to find its meal_program_id and duration
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('meal_program_id, duration_weeks')
    .eq('id', cohortId)
    .single()

  // Get selections with user info
  const { data: selections } = await supabase
    .from('meal_selections')
    .select(`
      *,
      profiles!inner (
        id,
        email,
        full_name,
        cohort_id
      )
    `)
    .eq('profiles.cohort_id', cohortId)
    .order('challenge_week')
    .order('created_at', { ascending: false })

  // Get meal options filtered by the cohort's meal program
  let mealOptions: any[] = []
  if (cohort?.meal_program_id) {
    const { data } = await supabase
      .from('meal_options')
      .select('*')
      .eq('meal_program_id', cohort.meal_program_id)
    mealOptions = data ?? []
  }

  return { selections: selections ?? [], mealOptions, durationWeeks: cohort?.duration_weeks ?? 4 }
}

export default async function SelectionsPage({ params }: SelectionsPageProps) {
  const { id: cohortId } = await params
  const { selections, mealOptions, durationWeeks } = await getSelections(cohortId)

  // Group selections by week
  const selectionsByWeek = selections.reduce((acc, selection) => {
    const week = selection.challenge_week
    if (week === null) return acc
    if (!acc[week]) acc[week] = []
    acc[week].push(selection)
    return acc
  }, {} as Record<number, typeof selections>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selections.length} sélection{selections.length !== 1 ? 's' : ''} au total
        </p>
        <SelectionExport cohortId={cohortId} />
      </div>

      {Object.keys(selectionsByWeek).length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Aucune sélection de repas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Les participants soumettront leurs sélections via l'application mobile
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from({ length: durationWeeks }, (_, i) => i + 1).map((week) => {
            const weekSelections = selectionsByWeek[week]
            if (!weekSelections || weekSelections.length === 0) return null

            return (
              <div key={week}>
                <h2 className="text-lg font-medium text-foreground mb-4">Semaine {week}</h2>
                <SelectionsTable
                  selections={weekSelections}
                  mealOptions={mealOptions}
                  week={week}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
