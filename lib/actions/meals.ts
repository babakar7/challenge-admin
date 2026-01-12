'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const mealOptionSchema = z.object({
  option_a_name: z.string().min(1, 'Option A name is required'),
  option_a_description: z.string().optional(),
  option_a_image_url: z.string().optional(),
  option_b_name: z.string().min(1, 'Option B name is required'),
  option_b_description: z.string().optional(),
  option_b_image_url: z.string().optional(),
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

export async function updateMealOption(id: string, formData: FormData) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  const input = mealOptionSchema.safeParse({
    option_a_name: formData.get('option_a_name'),
    option_a_description: formData.get('option_a_description') || undefined,
    option_a_image_url: formData.get('option_a_image_url') || undefined,
    option_b_name: formData.get('option_b_name'),
    option_b_description: formData.get('option_b_description') || undefined,
    option_b_image_url: formData.get('option_b_image_url') || undefined,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const { error } = await supabase
    .from('meal_options')
    .update({
      option_a_name: input.data.option_a_name,
      option_a_description: input.data.option_a_description || null,
      option_a_image_url: input.data.option_a_image_url || null,
      option_b_name: input.data.option_b_name,
      option_b_description: input.data.option_b_description || null,
      option_b_image_url: input.data.option_b_image_url || null,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meals')
  return { success: true }
}

export async function createMealOption(
  mealProgramId: string,
  weekStart: string,
  challengeWeek: number,
  dayOfWeek: number,
  challengeDay: number,
  mealType: 'lunch' | 'dinner',
  formData: FormData
) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  const input = mealOptionSchema.safeParse({
    option_a_name: formData.get('option_a_name'),
    option_a_description: formData.get('option_a_description') || undefined,
    option_a_image_url: formData.get('option_a_image_url') || undefined,
    option_b_name: formData.get('option_b_name'),
    option_b_description: formData.get('option_b_description') || undefined,
    option_b_image_url: formData.get('option_b_image_url') || undefined,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  const { error } = await supabase
    .from('meal_options')
    .insert({
      meal_program_id: mealProgramId,
      week_start_date: weekStart || null,
      challenge_week: challengeWeek,
      day_of_week: dayOfWeek,
      challenge_day: challengeDay,
      meal_type: mealType,
      option_a_name: input.data.option_a_name,
      option_a_description: input.data.option_a_description || null,
      option_a_image_url: input.data.option_a_image_url || null,
      option_b_name: input.data.option_b_name,
      option_b_description: input.data.option_b_description || null,
      option_b_image_url: input.data.option_b_image_url || null,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meal-programs')
  revalidatePath(`/meal-programs/${mealProgramId}`)
  return { success: true }
}
