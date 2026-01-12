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
import { createCohort } from '@/lib/actions/cohorts'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'

interface CreateChallengePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateChallengePanel({ open, onOpenChange }: CreateChallengePanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')

  const endDate = startDate ? format(addDays(new Date(startDate), 27), 'MMM d, yyyy') : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('start_date', startDate)

    const result = await createCohort(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Challenge created successfully')
    setLoading(false)
    onOpenChange(false)
    setName('')
    setStartDate('')

    if (result.data) {
      router.push(`/challenges/${result.data.id}`)
      router.refresh()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create Challenge</SheetTitle>
          <SheetDescription>
            Create a new 28-day challenge. The end date is automatically calculated.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Challenge Name</Label>
            <Input
              id="name"
              placeholder="e.g., January 2026 Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
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
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
