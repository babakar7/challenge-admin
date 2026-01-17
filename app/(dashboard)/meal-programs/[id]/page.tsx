'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Pencil, Settings, ImageOff } from 'lucide-react'
import Image from 'next/image'
import { EditMealPanel } from '@/components/meals/edit-meal-panel'
import { EditProgramPanel } from '@/components/meal-programs/edit-program-panel'

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
}

interface MealProgram {
  id: string
  name: string
  description: string | null
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function MealProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params?.id as string

  const [program, setProgram] = useState<MealProgram | null>(null)
  const [meals, setMeals] = useState<MealOption[]>([])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [editMeal, setEditMeal] = useState<{ day: number; mealType: 'lunch' | 'dinner'; meal?: MealOption } | null>(null)
  const [editProgram, setEditProgram] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [programId])

  async function fetchData() {
    const supabase = createClient()

    const [{ data: programData }, { data: mealsData }] = await Promise.all([
      supabase.from('meal_programs').select('*').eq('id', programId).single(),
      supabase
        .from('meal_options')
        .select('*')
        .eq('meal_program_id', programId)
        .order('challenge_day')
        .order('meal_type'),
    ])

    setProgram(programData)
    setMeals(mealsData ?? [])
    setLoading(false)
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
    fetchData()
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-32" />
        <div className="h-8 bg-muted rounded animate-pulse w-64" />
        <div className="h-10 bg-muted rounded animate-pulse w-96 mt-8" />
        <div className="grid gap-4 mt-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Programme non trouvé</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/meal-programs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux Plans alimentaires
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{program.name}</h1>
          {program.description && (
            <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditProgram(true)}>
          <Settings className="h-4 w-4 mr-1.5" />
          Modifier les détails
        </Button>
      </div>

      {/* Week Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((week) => (
          <Button
            key={week}
            variant={selectedWeek === week ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedWeek(week)}
            className={cn(
              'px-6',
              selectedWeek === week && 'bg-primary text-primary-foreground'
            )}
          >
            Semaine {week}
          </Button>
        ))}
      </div>

      {/* Meals Grid */}
      <div className="space-y-4">
        {DAYS.map((dayName, index) => {
          const dayNumber = index + 1
          const lunchMeal = getMealForDay(dayNumber, 'lunch')
          const dinnerMeal = getMealForDay(dayNumber, 'dinner')

          return (
            <div key={dayName} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">{dayName}</h3>
                <span className="text-xs text-muted-foreground">Jour {dayNumber}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Lunch */}
                <MealCard
                  mealType="Déjeuner"
                  meal={lunchMeal}
                  onEdit={() => handleEdit(dayNumber, 'lunch')}
                />

                {/* Dinner */}
                <MealCard
                  mealType="Dîner"
                  meal={dinnerMeal}
                  onEdit={() => handleEdit(dayNumber, 'dinner')}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Meal Panel */}
      {editMeal && (
        <EditMealPanel
          open={!!editMeal}
          onOpenChange={(open) => !open && setEditMeal(null)}
          mealProgramId={programId}
          week={selectedWeek}
          day={editMeal.day}
          mealType={editMeal.mealType}
          existingMeal={editMeal.meal}
          onSuccess={handleMealUpdated}
        />
      )}

      {/* Edit Program Panel */}
      <EditProgramPanel
        open={editProgram}
        onOpenChange={setEditProgram}
        program={program}
        onSuccess={() => {
          fetchData()
          setEditProgram(false)
        }}
      />
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
