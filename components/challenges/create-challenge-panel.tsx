'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCohort } from '@/lib/actions/cohorts'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ProgramSelector } from '@/components/meal-programs/program-selector'

interface CreateChallengePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateChallengePanel({ open, onOpenChange }: CreateChallengePanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(3)
  const [mealProgramId, setMealProgramId] = useState<string | null>(null)

  const endDate = startDate ? format(addDays(new Date(startDate), durationWeeks * 7 - 1), 'd MMM yyyy', { locale: fr }) : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('start_date', startDate)
    formData.append('duration_weeks', durationWeeks.toString())
    if (mealProgramId) {
      formData.append('meal_program_id', mealProgramId)
    }

    const result = await createCohort(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Challenge créé avec succès')
    setLoading(false)
    onOpenChange(false)
    setName('')
    setStartDate('')
    setDurationWeeks(3)
    setMealProgramId(null)

    if (result.data) {
      router.push(`/challenges/${result.data.id}`)
      router.refresh()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Créer un challenge</SheetTitle>
          <SheetDescription>
            Créer un nouveau challenge. La date de fin est calculée automatiquement.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du challenge</Label>
            <Input
              id="name"
              placeholder="ex: Challenge Janvier 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Select
              value={durationWeeks.toString()}
              onValueChange={(v) => setDurationWeeks(parseInt(v))}
              disabled={loading}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Sélectionner la durée" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((weeks) => (
                  <SelectItem key={weeks} value={weeks.toString()}>
                    {weeks} {weeks === 1 ? 'semaine' : 'semaines'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {endDate && (
              <p className="text-xs text-muted-foreground">
                Fin du challenge le {endDate} ({durationWeeks * 7} jours)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal_program">Plan alimentaire (optionnel)</Label>
            <ProgramSelector
              value={mealProgramId}
              onChange={setMealProgramId}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Sélectionner un plan alimentaire pour ce challenge
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
