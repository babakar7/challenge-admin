'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Cohort } from '@/types/database'
import { addDays, format } from 'date-fns'

interface WeekSelectorProps {
  cohort: Cohort
}

export function WeekSelector({ cohort }: WeekSelectorProps) {
  const pathname = usePathname()
  const startDate = new Date(cohort.start_date)

  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = addDays(startDate, i * 7)
    return {
      week: i + 1,
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      label: `Week ${i + 1}`,
      dateRange: `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d')}`,
    }
  })

  return (
    <div className="flex flex-wrap gap-2">
      {weeks.map((week) => {
        const isActive = pathname.includes(week.weekStart)
        return (
          <Link key={week.week} href={`/meals/${week.weekStart}`}>
            <Button
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'flex flex-col h-auto py-2',
                !isActive && 'text-zinc-600'
              )}
            >
              <span className="font-semibold">{week.label}</span>
              <span className="text-xs opacity-75">{week.dateRange}</span>
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
