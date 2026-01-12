'use client'

import { useState, useEffect } from 'react'
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
import { updateCohort } from '@/lib/actions/cohorts'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import type { Cohort } from '@/types/database'

interface EditChallengePanelProps {
  challenge: Cohort
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditChallengePanel({ challenge, open, onOpenChange }: EditChallengePanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(challenge.name)
  const [startDate, setStartDate] = useState(challenge.start_date)

  useEffect(() => {
    if (open) {
      setName(challenge.name)
      setStartDate(challenge.start_date)
    }
  }, [open, challenge])

  const endDate = startDate ? format(addDays(new Date(startDate), 27), 'MMM d, yyyy') : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('start_date', startDate)

    const result = await updateCohort(challenge.id, formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Challenge updated')
    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Challenge</SheetTitle>
          <SheetDescription>
            Update challenge details. The end date is automatically calculated.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Challenge Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start Date</Label>
            <Input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
            />
            {endDate && (
              <p className="text-xs text-muted-foreground">
                Challenge ends on {endDate} (28 days)
              </p>
            )}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
