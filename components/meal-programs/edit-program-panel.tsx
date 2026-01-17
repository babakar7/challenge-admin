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
import { updateMealProgram } from '@/lib/actions/meal-programs'
import { toast } from 'sonner'

interface MealProgram {
  id: string
  name: string
  description: string | null
}

interface EditProgramPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: MealProgram
  onSuccess: () => void
}

export function EditProgramPanel({
  open,
  onOpenChange,
  program,
  onSuccess,
}: EditProgramPanelProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setName(program.name)
      setDescription(program.description ?? '')
    }
  }, [open, program])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)

    const result = await updateMealProgram(program.id, formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Plan alimentaire mis à jour')
    setLoading(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Modifier le plan alimentaire</SheetTitle>
          <SheetDescription>
            Modifier le nom et la description du plan.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
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
