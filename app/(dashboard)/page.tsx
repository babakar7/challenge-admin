import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get the most recent cohort
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id')
    .order('start_date', { ascending: false })
    .limit(1)

  if (cohorts && cohorts.length > 0) {
    redirect(`/challenges/${cohorts[0].id}`)
  }

  // No challenges exist - show empty state
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
        <span className="text-primary text-2xl font-semibold">R</span>
      </div>
      <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-foreground mb-2">
        Welcome to Revive Admin
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Get started by creating your first challenge. Use the dropdown in the header to create a new 28-day challenge.
      </p>
    </div>
  )
}
