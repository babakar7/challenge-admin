'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { EditMealPanel } from '@/components/meals/edit-meal-panel'
import { Pencil } from 'lucide-react'

interface MealOption {
  id: string
  challenge_week: number | null
  challenge_day: number | null
  meal_type: string
  option_a_name: string
  option_a_description: string | null
  option_b_name: string
  option_b_description: string | null
}

interface Cohort {
  id: string
  start_date: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function MealsPage() {
  const params = useParams()
  const cohortId = params?.id as string

  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [meals, setMeals] = useState<MealOption[]>([])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [editMeal, setEditMeal] = useState<{ day: number; mealType: 'lunch' | 'dinner'; meal?: MealOption } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const [{ data: cohortData }, { data: mealsData }] = await Promise.all([
        supabase.from('cohorts').select('id, start_date').eq('id', cohortId).single(),
        supabase.from('meal_options').select('*').order('challenge_day').order('meal_type'),
      ])

      setCohort(cohortData)
      setMeals(mealsData ?? [])
      setLoading(false)
    }

    fetchData()
  }, [cohortId])

  function getWeekDates(week: number) {
    if (!cohort) return null
    const startDate = new Date(cohort.start_date)
    const weekStart = addDays(startDate, (week - 1) * 7)
    const weekEnd = addDays(weekStart, 6)
    return { start: weekStart, end: weekEnd }
  }

  function getMealForDay(day: number, mealType: string) {
    return meals.find(
      m => m.challenge_week === selectedWeek && m.challenge_day === day && m.meal_type === mealType
    )
  }

  function handleEdit(day: number, mealType: 'lunch' | 'dinner') {
    const meal = getMealForDay(day, mealType)
    setEditMeal({ day, mealType, meal })
  }

  function handleMealUpdated() {
    // Refresh meals data
    const supabase = createClient()
    supabase.from('meal_options').select('*').order('challenge_day').order('meal_type')
      .then(({ data }) => {
        if (data) setMeals(data)
      })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse w-96" />
        <div className="grid gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const weekDates = getWeekDates(selectedWeek)

  return (
    <div className="space-y-6">
      {/* Week Tabs */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((week) => {
          const dates = getWeekDates(week)
          return (
            <Button
              key={week}
              variant={selectedWeek === week ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWeek(week)}
              className={cn(
                'flex-col h-auto py-2 px-4',
                selectedWeek === week && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="font-medium">Week {week}</span>
              {dates && (
                <span className="text-xs opacity-80">
                  {format(dates.start, 'MMM d')} - {format(dates.end, 'MMM d')}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Meals Grid */}
      <div className="space-y-4">
        {DAYS.map((dayName, index) => {
          const dayNumber = index + 1
          const lunchMeal = getMealForDay(dayNumber, 'lunch')
          const dinnerMeal = getMealForDay(dayNumber, 'dinner')
          const dayDate = weekDates ? addDays(weekDates.start, index) : null

          return (
            <div key={dayName} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-foreground">{dayName}</h3>
                  {dayDate && (
                    <p className="text-xs text-muted-foreground">
                      {format(dayDate, 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Day {dayNumber}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Lunch */}
                <MealCard
                  mealType="Lunch"
                  meal={lunchMeal}
                  onEdit={() => handleEdit(dayNumber, 'lunch')}
                />

                {/* Dinner */}
                <MealCard
                  mealType="Dinner"
                  meal={dinnerMeal}
                  onEdit={() => handleEdit(dayNumber, 'dinner')}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Panel */}
      {editMeal && cohort && (
        <EditMealPanel
          open={!!editMeal}
          onOpenChange={(open) => !open && setEditMeal(null)}
          cohortId={cohortId}
          week={selectedWeek}
          day={editMeal.day}
          mealType={editMeal.mealType}
          existingMeal={editMeal.meal}
          weekStartDate={getWeekDates(selectedWeek)?.start}
          onSuccess={handleMealUpdated}
        />
      )}
    </div>
  )
}

function MealCard({
  mealType,
  meal,
  onEdit,
}: {
  mealType: string
  meal?: MealOption
  onEdit: () => void
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">{mealType}</h4>
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      {meal ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Option A</p>
            <p className="text-sm font-medium text-foreground">{meal.option_a_name}</p>
            {meal.option_a_description && (
              <p className="text-xs text-muted-foreground mt-0.5">{meal.option_a_description}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Option B</p>
            <p className="text-sm font-medium text-foreground">{meal.option_b_name}</p>
            {meal.option_b_description && (
              <p className="text-xs text-muted-foreground mt-0.5">{meal.option_b_description}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No meal options set</p>
      )}
    </div>
  )
}
