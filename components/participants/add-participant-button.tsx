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
import { Plus } from 'lucide-react'
import { createUser } from '@/lib/actions/users'
import { toast } from 'sonner'

interface AddParticipantButtonProps {
  cohortId: string
}

export function AddParticipantButton({ cohortId }: AddParticipantButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('full_name', fullName)
    formData.append('cohort_id', cohortId)

    const result = await createUser(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    if (result.existing) {
      toast.success('Participant existant déplacé vers ce challenge')
    } else {
      toast.success('Participant ajouté avec succès')
    }
    setLoading(false)
    setOpen(false)
    setEmail('')
    setFullName('')
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Ajouter un participant
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Ajouter un participant</SheetTitle>
            <SheetDescription>
              Ajouter un nouveau participant à ce challenge. Il recevra ses identifiants de connexion par courriel.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Mot de passe par défaut : « challenge »
              </p>
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
                {loading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
