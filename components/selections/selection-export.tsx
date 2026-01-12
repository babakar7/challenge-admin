'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, ChevronDown } from 'lucide-react'

interface SelectionExportProps {
  cohortId: string
}

export function SelectionExport({ cohortId }: SelectionExportProps) {
  function handleExport(week?: number) {
    const url = new URL('/api/export/selections', window.location.origin)
    url.searchParams.set('cohort_id', cohortId)
    if (week) {
      url.searchParams.set('week', week.toString())
    }
    window.open(url.toString(), '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
          <ChevronDown className="h-4 w-4 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport()}>
          All Weeks
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(1)}>
          Week 1 Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(2)}>
          Week 2 Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(3)}>
          Week 3 Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(4)}>
          Week 4 Only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
