'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight, UtensilsCrossed, ImageOff } from 'lucide-react'

interface MealOption {
  id: string
  challenge_week: number | null
  challenge_day: number | null
  meal_type: string
  option_a_name: string
  option_a_description: string | null
  option_a_image_url: string | null
  option_b_name: string
  option_b_description: string | null
  option_b_image_url: string | null
  meal_program_id: string
}

interface Cohort {
  id: string
  start_date: string
  duration_weeks: number | null
  meal_program_id: string | null
  meal_programs?: {
    id: string
    name: string
  } | null
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function MealsPage() {
  const params = useParams()
  const cohortId = params?.id as string

  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [meals, setMeals] = useState<MealOption[]>([])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('id, start_date, duration_weeks, meal_program_id, meal_programs(id, name)')
        .eq('id', cohortId)
        .single()

      setCohort(cohortData)

      // Only fetch meals if a program is assigned
      if (cohortData?.meal_program_id) {
        const { data: mealsData } = await supabase
          .from('meal_options')
          .select('*')
          .eq('meal_program_id', cohortData.meal_program_id)
          .order('challenge_day')
          .order('meal_type')

        setMeals(mealsData ?? [])
      }

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

  // No meal program assigned
  if (!cohort?.meal_program_id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Aucun plan alimentaire assigné</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Ce challenge n'a pas encore de plan alimentaire assigné. Modifiez le challenge pour en sélectionner un.
        </p>
        <Button asChild variant="outline">
          <Link href="/meal-programs">
            Parcourir les plans alimentaires
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  const weekDates = getWeekDates(selectedWeek)
  const program = cohort.meal_programs

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Plan alimentaire</p>
          <p className="font-medium text-foreground">{program?.name ?? 'Programme inconnu'}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/meal-programs/${cohort.meal_program_id}`}>
            Modifier dans Plans alimentaires
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Week Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: cohort.duration_weeks ?? 4 }, (_, i) => i + 1).map((week) => {
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
              <span className="font-medium">Semaine {week}</span>
              {dates && (
                <span className="text-xs opacity-80">
                  {format(dates.start, 'd MMM', { locale: fr })} - {format(dates.end, 'd MMM', { locale: fr })}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Meals Grid (Read-only) */}
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
                      {format(dayDate, 'd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Jour {dayNumber}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Lunch */}
                <MealCard mealType="Déjeuner" meal={lunchMeal} />

                {/* Dinner */}
                <MealCard mealType="Dîner" meal={dinnerMeal} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MealCard({
  mealType,
  meal,
}: {
  mealType: string
  meal?: MealOption
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-foreground">{mealType}</h4>
      </div>

      {meal ? (
        <div className="space-y-3">
          <MealOptionDisplay
            label="Option A"
            name={meal.option_a_name}
            description={meal.option_a_description}
            imageUrl={meal.option_a_image_url}
          />
          <MealOptionDisplay
            label="Option B"
            name={meal.option_b_name}
            description={meal.option_b_description}
            imageUrl={meal.option_b_image_url}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune option de repas définie</p>
      )}
    </div>
  )
}

function MealOptionDisplay({
  label,
  name,
  description,
  imageUrl,
}: {
  label: string
  name: string
  description: string | null
  imageUrl: string | null
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex gap-3">
      {imageUrl && !imageError ? (
        <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : imageUrl ? (
        <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center">
          <ImageOff className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        )}
      </div>
    </div>
  )
}
