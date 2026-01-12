import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface MealOption {
  challenge_week: number | null
  challenge_day: number | null
  meal_type: string
  option_a_name: string
  option_b_name: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')
  const week = searchParams.get('week')

  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['super_admin', 'viewer'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch meal options to resolve names
  const { data: mealOptions } = await supabase
    .from('meal_options')
    .select('challenge_week, challenge_day, meal_type, option_a_name, option_b_name')

  // Build query
  let query = supabase
    .from('meal_selections')
    .select(`
      *,
      profiles!inner(email, full_name, cohort_id)
    `)

  if (cohortId) {
    query = query.eq('profiles.cohort_id', cohortId)
  }

  if (week) {
    query = query.eq('challenge_week', parseInt(week))
  }

  const { data: selections, error } = await query.order('challenge_week')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Helper to get meal name
  function getMealName(weekNum: number | null, day: number, mealType: string, choice: string): string {
    if (weekNum === null) return choice
    const meal = mealOptions?.find(
      (m: MealOption) => m.challenge_week === weekNum && m.challenge_day === day && m.meal_type === mealType
    )
    if (!meal) return choice
    return choice === 'A' ? meal.option_a_name : meal.option_b_name
  }

  // Generate CSV headers
  const headers = [
    'Email',
    'Name',
    'Week',
    'Delivery',
    'Locked',
    // Days 1-7, Lunch and Dinner
    ...Array.from({ length: 7 }, (_, i) => [`Day${i + 1}_Lunch`, `Day${i + 1}_Dinner`]).flat()
  ]

  // Generate CSV rows
  const rows = selections?.map((s) => {
    const selProfile = s.profiles as { email: string; full_name: string | null }
    const sels = (s.selections || {}) as Record<string, string>
    const weekNum = s.challenge_week

    const mealCols = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1
      const lunchChoice = sels[`${day}_lunch`]
      const dinnerChoice = sels[`${day}_dinner`]
      return [
        lunchChoice ? getMealName(weekNum, day, 'lunch', lunchChoice) : '',
        dinnerChoice ? getMealName(weekNum, day, 'dinner', dinnerChoice) : ''
      ]
    }).flat()

    return [
      selProfile.email,
      selProfile.full_name || '',
      weekNum?.toString() || '',
      s.delivery_preference || '',
      s.locked ? 'Yes' : 'No',
      ...mealCols
    ]
  }) || []

  // Build CSV string
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = week
    ? `meal-selections-week-${week}.csv`
    : 'meal-selections-all.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=${filename}`,
    },
  })
}
