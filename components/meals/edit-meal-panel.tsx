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

interface MealOption {
  id: string
  option_a_name: string
  option_a_description: string | null
  option_b_name: string
  option_b_description: string | null
}

interface EditMealPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cohortId: string
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
  cohortId,
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
  const [optionBName, setOptionBName] = useState('')
  const [optionBDesc, setOptionBDesc] = useState('')

  useEffect(() => {
    if (open) {
      setOptionAName(existingMeal?.option_a_name ?? '')
      setOptionADesc(existingMeal?.option_a_description ?? '')
      setOptionBName(existingMeal?.option_b_name ?? '')
      setOptionBDesc(existingMeal?.option_b_description ?? '')
    }
  }, [open, existingMeal])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('option_a_name', optionAName)
    formData.append('option_a_description', optionADesc)
    formData.append('option_b_name', optionBName)
    formData.append('option_b_description', optionBDesc)

    let result
    if (existingMeal) {
      result = await updateMealOption(existingMeal.id, formData)
    } else {
      // Calculate day_of_week (0-6, where 0 is Sunday)
      const dayOfWeek = day === 7 ? 0 : day // Convert our 1-7 (Mon-Sun) to 0-6 (Sun-Sat)
      result = await createMealOption(
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

    toast.success(existingMeal ? 'Meal updated' : 'Meal created')
    setLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {existingMeal ? 'Edit' : 'Add'} {mealType.charAt(0).toUpperCase() + mealType.slice(1)} - Day {day}
          </SheetTitle>
          <SheetDescription>
            Week {week} meal options
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Option A */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Option A</h3>
            <div className="space-y-2">
              <Label htmlFor="option_a_name">Name</Label>
              <Input
                id="option_a_name"
                value={optionAName}
                onChange={(e) => setOptionAName(e.target.value)}
                placeholder="e.g., Grilled Chicken Salad"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_a_desc">Description (optional)</Label>
              <Textarea
                id="option_a_desc"
                value={optionADesc}
                onChange={(e) => setOptionADesc(e.target.value)}
                placeholder="Brief description of the meal"
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          {/* Option B */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Option B</h3>
            <div className="space-y-2">
              <Label htmlFor="option_b_name">Name</Label>
              <Input
                id="option_b_name"
                value={optionBName}
                onChange={(e) => setOptionBName(e.target.value)}
                placeholder="e.g., Salmon with Vegetables"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option_b_desc">Description (optional)</Label>
              <Textarea
                id="option_b_desc"
                value={optionBDesc}
                onChange={(e) => setOptionBDesc(e.target.value)}
                placeholder="Brief description of the meal"
                disabled={loading}
                rows={2}
              />
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
