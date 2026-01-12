'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Pencil } from 'lucide-react'
import { updateMealOption } from '@/lib/actions/meals'
import { toast } from 'sonner'
import type { MealOption } from '@/types/database'

interface MealOptionCardProps {
  meal: MealOption
  dayLabel: string
  isSuperAdmin: boolean
}

export function MealOptionCard({ meal, dayLabel, isSuperAdmin }: MealOptionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateMealOption(meal.id, formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Meal updated')
    setIsEditing(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {dayLabel} - {meal.meal_type === 'lunch' ? 'Lunch' : 'Dinner'}
            </CardTitle>
            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Option A</p>
              <p className="font-medium text-sm">{meal.option_a_name}</p>
              {meal.option_a_description && (
                <p className="text-xs text-zinc-600 line-clamp-2">
                  {meal.option_a_description}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Option B</p>
              <p className="font-medium text-sm">{meal.option_b_name}</p>
              {meal.option_b_description && (
                <p className="text-xs text-zinc-600 line-clamp-2">
                  {meal.option_b_description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {dayLabel} {meal.meal_type === 'lunch' ? 'Lunch' : 'Dinner'}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="font-medium">Option A</h4>
                <div className="space-y-2">
                  <Label htmlFor="option_a_name">Name</Label>
                  <Input
                    id="option_a_name"
                    name="option_a_name"
                    defaultValue={meal.option_a_name}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_a_description">Description</Label>
                  <Textarea
                    id="option_a_description"
                    name="option_a_description"
                    defaultValue={meal.option_a_description ?? ''}
                    rows={2}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_a_image_url">Image URL</Label>
                  <Input
                    id="option_a_image_url"
                    name="option_a_image_url"
                    defaultValue={meal.option_a_image_url ?? ''}
                    placeholder="https://..."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Option B</h4>
                <div className="space-y-2">
                  <Label htmlFor="option_b_name">Name</Label>
                  <Input
                    id="option_b_name"
                    name="option_b_name"
                    defaultValue={meal.option_b_name}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_b_description">Description</Label>
                  <Textarea
                    id="option_b_description"
                    name="option_b_description"
                    defaultValue={meal.option_b_description ?? ''}
                    rows={2}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_b_image_url">Image URL</Label>
                  <Input
                    id="option_b_image_url"
                    name="option_b_image_url"
                    defaultValue={meal.option_b_image_url ?? ''}
                    placeholder="https://..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
