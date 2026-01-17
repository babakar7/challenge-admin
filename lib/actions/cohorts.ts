'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { addDays, format } from 'date-fns'

const cohortSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  start_date: z.string().min(1, 'La date de début est requise'),
  duration_weeks: z.coerce.number().min(1).max(12).default(4),
  meal_program_id: z.string().uuid().optional().nullable(),
})

async function verifySuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { authorized: false, supabase }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    authorized: profile?.role === 'super_admin',
    supabase,
  }
}

export async function createCohort(formData: FormData) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  const mealProgramId = formData.get('meal_program_id')
  const input = cohortSchema.safeParse({
    name: formData.get('name'),
    start_date: formData.get('start_date'),
    duration_weeks: formData.get('duration_weeks') || 4,
    meal_program_id: mealProgramId && mealProgramId !== '' ? mealProgramId : null,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const startDate = new Date(input.data.start_date)
  const durationWeeks = input.data.duration_weeks
  const endDate = addDays(startDate, durationWeeks * 7 - 1)

  const { data, error } = await supabase
    .from('cohorts')
    .insert({
      name: input.data.name,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      duration_weeks: durationWeeks,
      is_active: false,
      meal_program_id: input.data.meal_program_id || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data }
}

export async function updateCohort(id: string, formData: FormData) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  const mealProgramId = formData.get('meal_program_id')
  const input = cohortSchema.safeParse({
    name: formData.get('name'),
    start_date: formData.get('start_date'),
    duration_weeks: formData.get('duration_weeks') || 4,
    meal_program_id: mealProgramId && mealProgramId !== '' ? mealProgramId : null,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const startDate = new Date(input.data.start_date)
  const durationWeeks = input.data.duration_weeks
  const endDate = addDays(startDate, durationWeeks * 7 - 1)

  const { data, error } = await supabase
    .from('cohorts')
    .update({
      name: input.data.name,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      duration_weeks: durationWeeks,
      meal_program_id: input.data.meal_program_id || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/cohorts')
  revalidatePath(`/cohorts/${id}`)
  return { data }
}

export async function activateCohort(id: string) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  // Deactivate all cohorts first
  await supabase
    .from('cohorts')
    .update({ is_active: false })
    .neq('id', id)

  // Activate the selected cohort
  const { error } = await supabase
    .from('cohorts')
    .update({ is_active: true })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deactivateCohort(id: string) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  const { error } = await supabase
    .from('cohorts')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteCohort(id: string) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  // Check if cohort has users
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', id)

  if (count && count > 0) {
    return { error: 'Impossible de supprimer un challenge avec des utilisateurs assignés. Retirez d\'abord les utilisateurs.' }
  }

  const { error } = await supabase
    .from('cohorts')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/cohorts')
  return { success: true }
}
