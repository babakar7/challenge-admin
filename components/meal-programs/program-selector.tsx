'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface MealProgram {
  id: string
  name: string
}

interface ProgramSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function ProgramSelector({ value, onChange, disabled }: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<MealProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      const supabase = createClient()
      const { data } = await supabase
        .from('meal_programs')
        .select('id, name')
        .order('name')

      setPrograms(data ?? [])
      setLoading(false)
    }

    fetchPrograms()
  }, [])

  return (
    <div className="space-y-2">
      <Label htmlFor="meal_program">Meal Program (optional)</Label>
      <Select
        value={value ?? 'none'}
        onValueChange={(v) => onChange(v === 'none' ? null : v)}
        disabled={disabled || loading}
      >
        <SelectTrigger id="meal_program">
          <SelectValue placeholder={loading ? 'Loading...' : 'Select a meal program'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {programs.map((program) => (
            <SelectItem key={program.id} value={program.id}>
              {program.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Assign a meal program to show meals in this challenge
      </p>
    </div>
  )
}
