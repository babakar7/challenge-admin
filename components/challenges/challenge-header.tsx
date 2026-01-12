'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2, Users } from 'lucide-react'
import { activateCohort, deactivateCohort, deleteCohort } from '@/lib/actions/cohorts'
import { EditChallengePanel } from './edit-challenge-panel'
import { toast } from 'sonner'
import type { Cohort } from '@/types/database'

interface ChallengeHeaderProps {
  challenge: Cohort & { participantCount: number }
}

export function ChallengeHeader({ challenge }: ChallengeHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const startDate = new Date(challenge.start_date)
  const endDate = new Date(challenge.end_date)

  async function handleActivate() {
    setLoading(true)
    const result = challenge.is_active
      ? await deactivateCohort(challenge.id)
      : await activateCohort(challenge.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(challenge.is_active ? 'Challenge deactivated' : 'Challenge activated')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteCohort(challenge.id)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      setDeleteOpen(false)
      return
    }

    toast.success('Challenge deleted')
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-foreground">
              {challenge.name}
            </h1>
            {challenge.is_active && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
            <span>
              {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {challenge.participantCount} participants
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={loading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleActivate}>
              {challenge.is_active ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditChallengePanel
        challenge={challenge}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{challenge.name}"? This action cannot be undone.
              {challenge.participantCount > 0 && (
                <span className="block mt-2 text-destructive">
                  This challenge has {challenge.participantCount} participants. You must remove them first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
