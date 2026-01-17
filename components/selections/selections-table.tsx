'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardList } from 'lucide-react'

interface MealOption {
  id: string
  challenge_week: number | null
  challenge_day: number | null
  meal_type: string
  option_a_name: string
  option_b_name: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

interface Selection {
  id: string
  challenge_week: number | null
  selections: JsonValue
  delivery_preference: string | null
  locked: boolean | null
  profiles: {
    id: string
    email: string
    full_name: string | null
  }
}

interface SelectionsTableProps {
  selections: Selection[]
  mealOptions: MealOption[]
  week: number
}

export function SelectionsTable({ selections, mealOptions, week }: SelectionsTableProps) {
  // Helper to get meal name from A/B selection
  function getMealName(day: number, mealType: string, choice: string): string {
    const meal = mealOptions.find(
      m => m.challenge_week === week && m.challenge_day === day && m.meal_type === mealType
    )
    if (!meal) return choice
    return choice === 'A' ? meal.option_a_name : meal.option_b_name
  }

  // Parse selection key like "1_lunch" to get day and meal type
  function parseSelectionKey(key: string): { day: number; mealType: string } | null {
    const match = key.match(/^(\d+)_(lunch|dinner)$/)
    if (!match) return null
    return { day: parseInt(match[1]), mealType: match[2] }
  }

  // Get all days that have selections
  const days = [1, 2, 3, 4, 5, 6, 7]

  if (selections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Aucune sélection pour la semaine {week}</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Les participants apparaîtront ici une fois leurs sélections de repas soumises pour cette semaine.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 bg-card">Participant</TableHead>
            <TableHead>Livraison</TableHead>
            <TableHead>Statut</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="text-center min-w-[140px]">
                Jour {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {selections.map((selection) => (
            <TableRow key={selection.id}>
              <TableCell className="sticky left-0 bg-card font-medium">
                {selection.profiles.full_name || selection.profiles.email}
              </TableCell>
              <TableCell>
                <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground capitalize">
                  {selection.delivery_preference}
                </span>
              </TableCell>
              <TableCell>
                {selection.locked ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                    Verrouillé
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                    En attente
                  </span>
                )}
              </TableCell>
              {days.map((day) => {
                const lunchKey = `${day}_lunch`
                const dinnerKey = `${day}_dinner`
                const sels = selection.selections ?? {}
                const lunchChoice = sels[lunchKey]
                const dinnerChoice = sels[dinnerKey]

                return (
                  <TableCell key={day} className="text-center">
                    <div className="space-y-1">
                      {lunchChoice && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Déj: </span>
                          <span className="text-foreground">
                            {getMealName(day, 'lunch', lunchChoice)}
                          </span>
                        </div>
                      )}
                      {dinnerChoice && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Dîn: </span>
                          <span className="text-foreground">
                            {getMealName(day, 'dinner', dinnerChoice)}
                          </span>
                        </div>
                      )}
                      {!lunchChoice && !dinnerChoice && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
