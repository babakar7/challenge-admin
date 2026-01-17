'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { createMealProgram } from '@/lib/actions/meal-programs'
import { toast } from 'sonner'

export function CreateProgramButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)

    const result = await createMealProgram(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Plan alimentaire créé')
    setLoading(false)
    setOpen(false)
    setName('')
    setDescription('')
    router.refresh()

    // Navigate to the new program
    if (result.data?.id) {
      router.push(`/meal-programs/${result.data.id}`)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Créer un plan
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Créer un plan alimentaire</SheetTitle>
            <SheetDescription>
              Créer un nouveau plan alimentaire qui peut être assigné aux challenges.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="ex. Programme Standard"
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
                placeholder="Brève description de ce plan alimentaire..."
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
                onClick={() => setOpen(false)}
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
    </>
  )
}
