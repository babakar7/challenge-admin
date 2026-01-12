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

  const adminClient = createAdminClient()

  // Check if user already exists
  const { data: existingUsers } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('email', input.data.email)
    .limit(1)

  if (existingUsers && existingUsers.length > 0) {
    // User exists - update their cohort and track participation history
    const existingUser = existingUsers[0]

    // Mark any previous active participation as "completed"
    const { error: completeError } = await adminClient
      .from('cohort_participants')
      .update({
        status: 'completed',
        left_at: new Date().toISOString()
      })
      .eq('user_id', existingUser.id)
      .eq('status', 'active')

    if (completeError) {
      console.error('Error completing previous participation:', completeError)
    }

    // Create new participation record if cohort_id provided
    if (input.data.cohort_id) {
      const { error: participationError } = await adminClient
        .from('cohort_participants')
        .insert({
          user_id: existingUser.id,
          cohort_id: input.data.cohort_id,
          status: 'active',
        })

      if (participationError) {
        // Might already exist if re-adding to same cohort - just update status
        if (participationError.code === '23505') {
          await adminClient
            .from('cohort_participants')
            .update({ status: 'active', left_at: null })
            .eq('user_id', existingUser.id)
            .eq('cohort_id', input.data.cohort_id)
        } else {
          return { error: participationError.message }
        }
      }
    }

    // Update profile with current cohort (for quick access)
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        full_name: input.data.full_name || existingUser.full_name,
        cohort_id: input.data.cohort_id || null,
      })
      .eq('id', existingUser.id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/challenges')
    return { data: { id: existingUser.id, email: input.data.email }, existing: true }
  }

  // Create new auth user
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

  // Create participation record for new user
  if (input.data.cohort_id) {
    const { error: participationError } = await adminClient
      .from('cohort_participants')
      .insert({
        user_id: authData.user.id,
        cohort_id: input.data.cohort_id,
        status: 'active',
      })

    if (participationError) {
      console.error('Error creating participation record:', participationError)
    }
  }

  revalidatePath('/challenges')
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
