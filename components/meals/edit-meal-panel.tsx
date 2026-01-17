'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { createMealOption, updateMealOption } from '@/lib/actions/meals'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ImageOff } from 'lucide-react'

interface MealOption {
  id: string
  option_a_name: string
  option_a_description: string | null
  option_a_image_url: string | null
  option_b_name: string
  option_b_description: string | null
  option_b_image_url: string | null
}

interface EditMealPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealProgramId: string
  week: number
  day: number
  mealType: 'lunch' | 'dinner'
  existingMeal?: MealOption
  weekStartDate?: Date
  onSuccess: () => void
}

export function EditMealPanel({
  open,
  onOpenChange,
  mealProgramId,
  week,
  day,
  mealType,
  existingMeal,
  weekStartDate,
  onSuccess,
}: EditMealPanelProps) {
  const [loading, setLoading] = useState(false)
  const [optionAName, setOptionAName] = useState('')
  const [optionADesc, setOptionADesc] = useState('')
  const [optionAImage, setOptionAImage] = useState('')
  const [optionAImageError, setOptionAImageError] = useState(false)
  const [optionBName, setOptionBName] = useState('')
  const [optionBDesc, setOptionBDesc] = useState('')
  const [optionBImage, setOptionBImage] = useState('')
  const [optionBImageError, setOptionBImageError] = useState(false)

  useEffect(() => {
    if (open) {
      setOptionAName(existingMeal?.option_a_name ?? '')
      setOptionADesc(existingMeal?.option_a_description ?? '')
      setOptionAImage(existingMeal?.option_a_image_url ?? '')
      setOptionAImageError(false)
      setOptionBName(existingMeal?.option_b_name ?? '')
      setOptionBDesc(existingMeal?.option_b_description ?? '')
      setOptionBImage(existingMeal?.option_b_image_url ?? '')
      setOptionBImageError(false)
    }
  }, [open, existingMeal])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('option_a_name', optionAName)
    formData.append('option_a_description', optionADesc)
    formData.append('option_a_image_url', optionAImage)
    formData.append('option_b_name', optionBName)
    formData.append('option_b_description', optionBDesc)
    formData.append('option_b_image_url', optionBImage)

    let result
    if (existingMeal) {
      result = await updateMealOption(existingMeal.id, formData)
    } else {
      // Calculate day_of_week (0-6, where 0 is Sunday)
      const dayOfWeek = day === 7 ? 0 : day // Convert our 1-7 (Mon-Sun) to 0-6 (Sun-Sat)
      result = await createMealOption(
        mealProgramId,
        weekStartDate ? format(weekStartDate, 'yyyy-MM-dd') : '',
        week,
        dayOfWeek,
        day,
        mealType,
        formData
      )
    }

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success(existingMeal ? 'Repas mis à jour' : 'Repas créé')
    setLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {existingMeal ? 'Modifier' : 'Ajouter'} {mealType === 'lunch' ? 'Déjeuner' : 'Dîner'} - Jour {day}
          </SheetTitle>
          <SheetDescription>
            Options de repas de la semaine {week}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Option A */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Option A</h3>
            <div className="space-y-2">
              <Label htmlFor="option_a_name">Nom</Label>
              <Input
                id="option_a_name"
                value={optionAName}
                onChange={(e) => setOptionAName(e.target.value)}
                placeholder="ex. Salade de poulet grillé"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_a_desc">Description (optionnel)</Label>
              <Textarea
                id="option_a_desc"
                value={optionADesc}
                onChange={(e) => setOptionADesc(e.target.value)}
                placeholder="Brève description du repas"
                disabled={loading}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_a_image">URL de l'image (optionnel)</Label>
              <Input
                id="option_a_image"
                type="url"
                value={optionAImage}
                onChange={(e) => {
                  setOptionAImage(e.target.value)
                  setOptionAImageError(false)
                }}
                placeholder="https://exemple.com/image.jpg"
                disabled={loading}
              />
              {optionAImage && (
                <div className="mt-2">
                  {!optionAImageError ? (
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                      <img
                        src={optionAImage}
                        alt="Aperçu Option A"
                        className="h-full w-full object-cover"
                        onError={() => setOptionAImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <ImageOff className="h-5 w-5 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Invalide</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Option B */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Option B</h3>
            <div className="space-y-2">
              <Label htmlFor="option_b_name">Nom</Label>
              <Input
                id="option_b_name"
                value={optionBName}
                onChange={(e) => setOptionBName(e.target.value)}
                placeholder="ex. Saumon aux légumes"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_b_desc">Description (optionnel)</Label>
              <Textarea
                id="option_b_desc"
                value={optionBDesc}
                onChange={(e) => setOptionBDesc(e.target.value)}
                placeholder="Brève description du repas"
                disabled={loading}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_b_image">URL de l'image (optionnel)</Label>
              <Input
                id="option_b_image"
                type="url"
                value={optionBImage}
                onChange={(e) => {
                  setOptionBImage(e.target.value)
                  setOptionBImageError(false)
                }}
                placeholder="https://exemple.com/image.jpg"
                disabled={loading}
              />
              {optionBImage && (
                <div className="mt-2">
                  {!optionBImageError ? (
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                      <img
                        src={optionBImage}
                        alt="Aperçu Option B"
                        className="h-full w-full object-cover"
                        onError={() => setOptionBImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <ImageOff className="h-5 w-5 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Invalide</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
