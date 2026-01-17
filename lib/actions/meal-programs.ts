'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const createProgramSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
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

export async function getMealPrograms() {
  const supabase = await createClient()

  const { data: programs, error } = await supabase
    .from('meal_programs')
    .select(`
      *,
      cohorts:cohorts(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching meal programs:', error)
    return []
  }

  return programs
}

export async function getMealProgram(id: string) {
  const supabase = await createClient()

  const { data: program, error } = await supabase
    .from('meal_programs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching meal program:', error)
    return null
  }

  return program
}

export async function createMealProgram(formData: FormData) {
  const { authorized } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  const input = createProgramSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meal_programs')
    .insert({
      name: input.data.name,
      description: input.data.description || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meal-programs')
  return { data }
}

export async function updateMealProgram(id: string, formData: FormData) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  const input = createProgramSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const { error } = await supabase
    .from('meal_programs')
    .update({
      name: input.data.name,
      description: input.data.description || null,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meal-programs')
  revalidatePath(`/meal-programs/${id}`)
  return { success: true }
}

export async function deleteMealProgram(id: string) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  // Check if any cohorts are using this program
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id')
    .eq('meal_program_id', id)

  if (cohorts && cohorts.length > 0) {
    return { error: `Impossible de supprimer : ${cohorts.length} challenge(s) utilisent ce plan` }
  }

  const { error } = await supabase
    .from('meal_programs')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meal-programs')
  return { success: true }
}

export async function duplicateMealProgram(id: string, newName: string) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Non autorisé' }
  }

  // Get the original program
  const { data: original, error: fetchError } = await supabase
    .from('meal_programs')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    return { error: 'Programme non trouvé' }
  }

  // Create new program
  const { data: newProgram, error: createError } = await supabase
    .from('meal_programs')
    .insert({
      name: newName,
      description: original.description,
    })
    .select()
    .single()

  if (createError || !newProgram) {
    return { error: createError?.message || 'Échec de la création du programme' }
  }

  // Copy all meal options from original to new program
  const { data: meals, error: mealsError } = await supabase
    .from('meal_options')
    .select('*')
    .eq('meal_program_id', id)

  if (mealsError) {
    return { error: mealsError.message }
  }

  if (meals && meals.length > 0) {
    const newMeals = meals.map(meal => ({
      meal_program_id: newProgram.id,
      challenge_week: meal.challenge_week,
      challenge_day: meal.challenge_day,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      option_a_name: meal.option_a_name,
      option_a_description: meal.option_a_description,
      option_a_image_url: meal.option_a_image_url,
      option_b_name: meal.option_b_name,
      option_b_description: meal.option_b_description,
      option_b_image_url: meal.option_b_image_url,
      week_start_date: meal.week_start_date,
    }))

    const { error: insertError } = await supabase
      .from('meal_options')
      .insert(newMeals)

    if (insertError) {
      // Clean up the created program if meals failed
      await supabase.from('meal_programs').delete().eq('id', newProgram.id)
      return { error: insertError.message }
    }
  }

  revalidatePath('/meal-programs')
  return { data: newProgram }
}
