import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { ProgramList } from '@/components/meal-programs/program-list'
import { CreateProgramButton } from '@/components/meal-programs/create-program-button'

async function getMealPrograms() {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from('meal_programs')
    .select(`
      *,
      meal_options(count),
      cohorts(count)
    `)
    .order('created_at', { ascending: false })

  return programs ?? []
}

export default async function MealProgramsPage() {
  const [programs, user] = await Promise.all([
    getMealPrograms(),
    getCurrentUser(),
  ])

  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meal Programs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage 28-day meal plans that can be assigned to challenges
          </p>
        </div>
        {isSuperAdmin && <CreateProgramButton />}
      </div>

      <ProgramList programs={programs} canManage={isSuperAdmin} />
    </div>
  )
}
