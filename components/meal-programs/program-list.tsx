'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { MoreHorizontal, Pencil, Copy, Trash2, Utensils, Calendar } from 'lucide-react'
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
import { toast } from 'sonner'
import { useState } from 'react'
import { deleteMealProgram, duplicateMealProgram } from '@/lib/actions/meal-programs'

interface Program {
  id: string
  name: string
  description: string | null
  created_at: string | null
  meal_options: { count: number }[]
  cohorts: { count: number }[]
}

interface ProgramListProps {
  programs: Program[]
  canManage: boolean
}

export function ProgramList({ programs, canManage }: ProgramListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [duplicateId, setDuplicateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)

    const result = await deleteMealProgram(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Program deleted')
      router.refresh()
    }

    setLoading(false)
    setDeleteId(null)
  }

  async function handleDuplicate(id: string, name: string) {
    setLoading(true)

    const result = await duplicateMealProgram(id, `${name} (Copy)`)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Program duplicated')
      router.refresh()
    }

    setLoading(false)
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No meal programs</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first meal program to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => {
          const mealCount = program.meal_options?.[0]?.count ?? 0
          const challengeCount = program.cohorts?.[0]?.count ?? 0

          return (
            <Link
              key={program.id}
              href={`/meal-programs/${program.id}`}
              className="group bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {program.description}
                    </p>
                  )}
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/meal-programs/${program.id}`)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Meals
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault()
                          handleDuplicate(program.id, program.name)
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteId(program.id)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5" />
                  {mealCount} meals
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {challengeCount} challenge{challengeCount !== 1 ? 's' : ''}
                </span>
              </div>

              {program.created_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Created {format(new Date(program.created_at), 'MMM d, yyyy')}
                </p>
              )}
            </Link>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this meal program and all its meals.
              This action cannot be undone.
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
