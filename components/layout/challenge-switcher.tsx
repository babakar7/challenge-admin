'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Plus, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Cohort {
  id: string
  name: string
  start_date: string
  is_active: boolean | null
}

interface ChallengeSwitcherProps {
  cohorts: Cohort[]
  onCreateClick?: () => void
}

export function ChallengeSwitcher({ cohorts, onCreateClick }: ChallengeSwitcherProps) {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const currentCohortId = params?.id as string | undefined
  const currentCohort = cohorts.find(c => c.id === currentCohortId)

  function handleSelect(cohortId: string) {
    setOpen(false)
    router.push(`/challenges/${cohortId}`)
  }

  function handleCreate() {
    setOpen(false)
    onCreateClick?.()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-secondary rounded-lg max-w-[280px]"
        >
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {currentCohort?.name ?? 'Sélectionner un challenge'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {cohorts.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucun challenge
          </div>
        ) : (
          cohorts.map((cohort) => (
            <DropdownMenuItem
              key={cohort.id}
              onClick={() => handleSelect(cohort.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium truncate">{cohort.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(cohort.start_date), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
              {cohort.is_active && (
                <span className="shrink-0 ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  Actif
                </span>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Créer un challenge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
