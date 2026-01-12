'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  full_name: z.string().optional(),
  cohort_id: z.string().uuid().optional().nullable(),
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

export async function createUser(formData: FormData) {
  const { authorized } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  const input = createUserSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name') || undefined,
    cohort_id: formData.get('cohort_id') || null,
  })

  if (!input.success) {
    return { error: input.error.issues[0].message }
  }

  // Create auth user with admin client
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: input.data.email,
    password: 'challenge', // Default password - user should change on first login
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Update profile with full_name and cohort
  if (input.data.full_name || input.data.cohort_id) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: input.data.full_name || null,
        cohort_id: input.data.cohort_id || null,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/users')
  return { data: authData.user }
}

export async function updateUser(id: string, formData: FormData) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  const fullName = formData.get('full_name') as string
  const cohortId = formData.get('cohort_id') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName || null,
      cohort_id: cohortId || null,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
  return { success: true }
}

export async function assignUserToCohort(userId: string, cohortId: string | null) {
  const { authorized, supabase } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ cohort_id: cohortId })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const { authorized } = await verifySuperAdmin()

  if (!authorized) {
    return { error: 'Unauthorized' }
  }

  // Use admin client to delete auth user (profile will cascade)
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/users')
  return { success: true }
}
