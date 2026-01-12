Revive Admin Dashboard - Complete Implementation Plan
IMPORTANT: This plan is self-contained. You have NO access to the mobile app codebase. All context needed is provided below.

Project Overview
What we're building: A Next.js admin web app to manage the "Revive 28-Day Weight Loss Challenge" - a mobile app where users track daily habits and select weekly meals.

Supabase Project: cmpecuolthmjxvwcutom (existing, shared with mobile app)

Tech Stack
Framework: Next.js 14+ (App Router)
Language: TypeScript
Database: Supabase (PostgreSQL)
Auth: Supabase Auth with admin role check
UI: shadcn/ui + Tailwind CSS
Forms: react-hook-form + zod
Data Fetching: React Query (client), Server Components (SSR)
Deployment: Vercel
MVP Features
Challenge Management - CRUD for cohorts (challenge groups)
User Enrollment - Create users, assign to cohorts
Meal Options Management - Create/edit A/B meal choices by week
View User Selections - See what users selected, CSV export
Business Context
The Challenge
28-day weight loss challenge (4 weeks)
Users grouped into "cohorts" that start/end together
Only ONE cohort can be active at a time
User Journey
Admin creates user account + assigns to cohort
User logs in and selects meals for Week 1 (before deadline)
User tracks daily: weight, steps, meal adherence
User submits evening check-in (reflection on challenges)
Repeat for 4 weeks
Meal System
2 meals/day: Lunch + Dinner (no breakfast)
Each meal has Option A vs Option B
Users select one week at a time
Selections lock Friday 11:59 PM before each week
56 total meal slots: 7 days × 2 meals × 4 weeks
Complete Database Schema
Tables Overview

cohorts ─────────┐
                 │ cohort_id (FK)
                 ▼
profiles ────────┬── daily_habits (1:N)
                 ├── check_ins (1:N)
                 ├── streaks (1:1)
                 ├── weekly_exercise (1:N)
                 ├── meal_selections (1:N)
                 └── notification_logs (1:N)

meal_options (standalone, admin-managed)
Table: cohorts
Challenge groups that users belong to.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
name	text	NO	e.g., "January 2026 Challenge"
start_date	date	NO	First day of challenge
end_date	date	NO	Last day (start_date + 27 days)
is_active	boolean	NO	Only ONE should be true
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
NOTE: Need to add is_active column - may not exist yet!

Table: profiles
User accounts (extends Supabase auth.users).

Column	Type	Nullable	Description
id	uuid	NO	PK, FK to auth.users
email	text	NO	User email
full_name	text	YES	Display name
cohort_id	uuid	YES	FK to cohorts
push_token	text	YES	Expo push token
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
ADD THIS COLUMN for admin:
| role | text | NO | 'user' (default), 'super_admin', 'viewer' |

Table: meal_options
Available meal choices (admin creates these).

Column	Type	Nullable	Description
id	uuid	NO	Primary key
week_start_date	date	NO	Monday of that week
day_of_week	integer	NO	1-7 (Mon-Sun)
meal_type	text	NO	'lunch' or 'dinner'
option_a_name	text	NO	Name of Option A
option_a_description	text	YES	Description
option_a_image_url	text	YES	Unsplash URL
option_b_name	text	NO	Name of Option B
option_b_description	text	YES	Description
option_b_image_url	text	YES	Unsplash URL
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
Unique constraint: (week_start_date, day_of_week, meal_type)

NOTE: Need to add image_url columns - may not exist yet!

Table: meal_selections
User's meal choices per week.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	NO	FK to profiles
week_start_date	date	NO	Monday of that week
selections	jsonb	YES	{"1_lunch": "A", "1_dinner": "B", ...}
delivery_preference	text	YES	'home' or 'pickup'
locked	boolean	YES	TRUE after deadline
locked_at	timestamptz	YES	When locked
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
Unique constraint: (user_id, week_start_date)

Selections JSON format:


{
  "1_lunch": "A",
  "1_dinner": "B",
  "2_lunch": "A",
  "2_dinner": "A",
  // ... through day 7
  "7_lunch": "B",
  "7_dinner": "A"
}
Table: daily_habits
Daily tracking data per user.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	NO	FK to profiles
date	date	NO	YYYY-MM-DD
weight_kg	decimal	YES	Weight in kg
weight_logged_at	timestamptz	YES	When logged
steps	integer	YES	Step count
steps_logged_at	timestamptz	YES	When logged
water_ml	integer	YES	Water intake
water_logged_at	timestamptz	YES	When logged
meal_adherence	boolean	YES	Did they follow meal plan?
meal_logged_at	timestamptz	YES	When logged
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
Unique constraint: (user_id, date)

Table: check_ins
Evening reflection submissions.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	NO	FK to profiles
date	date	NO	YYYY-MM-DD
challenges_faced	text	NO	User's reflection
habits_summary	jsonb	YES	Snapshot of daily_habits
created_at	timestamptz	YES	Auto-set
Unique constraint: (user_id, date)

Table: streaks
Streak tracking per user (one-to-one).

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	NO	FK to profiles (unique)
current_streak	integer	YES	Current consecutive days
longest_streak	integer	YES	Max achieved
last_check_in_date	date	YES	Last check-in date
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
Table: weekly_exercise
Weekly exercise completion.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	NO	FK to profiles
week_start_date	date	NO	Monday of that week
completed_3x	boolean	YES	Did 3x exercise?
created_at	timestamptz	YES	Auto-set
updated_at	timestamptz	YES	Auto-updated
Table: notification_logs
Push notification audit log.

Column	Type	Nullable	Description
id	uuid	NO	Primary key
user_id	uuid	YES	FK to profiles
notification_type	text	NO	e.g., 'check-in-reminder'
title	text	NO	Notification title
body	text	NO	Notification body
sent_at	timestamptz	YES	When sent
status	text	YES	'sent', 'failed', etc.
Database Migrations to Apply
Run these in Supabase SQL Editor:

Migration 1: Add is_active to cohorts (if missing)

-- Check if column exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cohorts' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.cohorts ADD COLUMN is_active boolean NOT NULL DEFAULT false;
  END IF;
END $$;
Migration 2: Add role to profiles

-- Add role column for admin access control
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Add check constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('user', 'super_admin', 'viewer'));

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
Migration 3: Add image URLs to meal_options (if missing)

-- Add image URL columns if they don't exist
ALTER TABLE public.meal_options
ADD COLUMN IF NOT EXISTS option_a_image_url text;

ALTER TABLE public.meal_options
ADD COLUMN IF NOT EXISTS option_b_image_url text;
Migration 4: Add RLS policies for admin access

-- Drop existing policies that might conflict (be careful in production!)
-- First, let's add admin read access to all tables

-- Profiles: Admins can view all
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Profiles: Super admins can update all
CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Cohorts: Admins can do everything
CREATE POLICY "Admins can manage cohorts"
  ON public.cohorts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Viewers can read cohorts"
  ON public.cohorts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Meal Options: Admins can manage
CREATE POLICY "Admins can manage meal options"
  ON public.meal_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Viewers can read meal options"
  ON public.meal_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Meal Selections: Admins can view all
CREATE POLICY "Admins can view all meal selections"
  ON public.meal_selections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Super admins can update (unlock) meal selections
CREATE POLICY "Super admins can update meal selections"
  ON public.meal_selections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Daily Habits: Admins can view all
CREATE POLICY "Admins can view all daily habits"
  ON public.daily_habits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Check-ins: Admins can view all
CREATE POLICY "Admins can view all check ins"
  ON public.check_ins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );

-- Streaks: Admins can view all
CREATE POLICY "Admins can view all streaks"
  ON public.streaks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'viewer')
    )
  );
Migration 5: Create first super_admin

-- Replace with your admin email
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-admin-email@example.com';
Complete TypeScript Types
Create /types/database.ts:


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cohorts: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          cohort_id: string | null
          push_token: string | null
          role: 'user' | 'super_admin' | 'viewer'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          cohort_id?: string | null
          push_token?: string | null
          role?: 'user' | 'super_admin' | 'viewer'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          cohort_id?: string | null
          push_token?: string | null
          role?: 'user' | 'super_admin' | 'viewer'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meal_options: {
        Row: {
          id: string
          week_start_date: string
          day_of_week: number
          meal_type: 'lunch' | 'dinner'
          option_a_name: string
          option_a_description: string | null
          option_a_image_url: string | null
          option_b_name: string
          option_b_description: string | null
          option_b_image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          week_start_date: string
          day_of_week: number
          meal_type: 'lunch' | 'dinner'
          option_a_name: string
          option_a_description?: string | null
          option_a_image_url?: string | null
          option_b_name: string
          option_b_description?: string | null
          option_b_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          week_start_date?: string
          day_of_week?: number
          meal_type?: 'lunch' | 'dinner'
          option_a_name?: string
          option_a_description?: string | null
          option_a_image_url?: string | null
          option_b_name?: string
          option_b_description?: string | null
          option_b_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meal_selections: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          selections: Json | null
          delivery_preference: 'home' | 'pickup' | null
          locked: boolean | null
          locked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          selections?: Json | null
          delivery_preference?: 'home' | 'pickup' | null
          locked?: boolean | null
          locked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          selections?: Json | null
          delivery_preference?: 'home' | 'pickup' | null
          locked?: boolean | null
          locked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      daily_habits: {
        Row: {
          id: string
          user_id: string
          date: string
          weight_kg: number | null
          weight_logged_at: string | null
          steps: number | null
          steps_logged_at: string | null
          water_ml: number | null
          water_logged_at: string | null
          meal_adherence: boolean | null
          meal_logged_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight_kg?: number | null
          steps?: number | null
          water_ml?: number | null
          meal_adherence?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          weight_kg?: number | null
          steps?: number | null
          water_ml?: number | null
          meal_adherence?: boolean | null
          updated_at?: string | null
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          date: string
          challenges_faced: string
          habits_summary: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          challenges_faced: string
          habits_summary?: Json | null
          created_at?: string | null
        }
        Update: {
          challenges_faced?: string
          habits_summary?: Json | null
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number | null
          longest_streak: number | null
          last_check_in_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number | null
          longest_streak?: number | null
          last_check_in_date?: string | null
        }
        Update: {
          current_streak?: number | null
          longest_streak?: number | null
          last_check_in_date?: string | null
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience aliases
export type Cohort = Tables<'cohorts'>
export type Profile = Tables<'profiles'>
export type MealOption = Tables<'meal_options'>
export type MealSelection = Tables<'meal_selections'>
export type DailyHabit = Tables<'daily_habits'>
export type CheckIn = Tables<'check_ins'>
export type Streak = Tables<'streaks'>
Project Structure

revive-admin/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── page.tsx                # Dashboard home
│   │   ├── cohorts/
│   │   │   ├── page.tsx            # List cohorts
│   │   │   ├── new/page.tsx        # Create cohort
│   │   │   └── [id]/page.tsx       # Edit cohort
│   │   ├── users/
│   │   │   ├── page.tsx            # List users
│   │   │   ├── new/page.tsx        # Create user
│   │   │   └── [id]/page.tsx       # User details
│   │   ├── meals/
│   │   │   ├── page.tsx            # Meal options by week
│   │   │   └── [weekStart]/page.tsx # Edit week's meals
│   │   └── selections/
│   │       └── page.tsx            # View all selections + export
│   └── api/
│       └── export/
│           └── selections/route.ts # CSV export
├── components/
│   ├── ui/                         # shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── nav-item.tsx
│   ├── cohorts/
│   │   ├── cohort-form.tsx
│   │   └── cohort-table.tsx
│   ├── users/
│   │   ├── user-form.tsx
│   │   ├── user-table.tsx
│   │   └── assign-cohort-dialog.tsx
│   └── meals/
│       ├── meal-option-form.tsx
│       ├── week-selector.tsx
│       └── selections-table.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server Component client
│   │   ├── middleware.ts           # Auth middleware helper
│   │   └── admin.ts                # Service role client
│   ├── actions/
│   │   ├── cohorts.ts
│   │   ├── users.ts
│   │   └── meals.ts
│   └── utils/
│       ├── dates.ts
│       └── csv.ts
├── types/
│   └── database.ts
├── middleware.ts
└── .env.local
Critical Implementation Files
1. /lib/supabase/server.ts (Server Components)

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}

// Get current user with role
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Check if user is admin
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'viewer'].includes(user.role)) {
    throw new Error('Unauthorized')
  }
  return user
}

// Check if user is super admin
export async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'super_admin') {
    throw new Error('Unauthorized')
  }
  return user
}
2. /lib/supabase/admin.ts (Service Role - User Creation)

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ONLY use server-side! Never expose service role key to client
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
3. /middleware.ts (Auth Protection)

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // Protected routes - require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'viewer'].includes(profile.role)) {
    // Not an admin - sign out and redirect
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
4. /lib/actions/users.ts (Server Actions)

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional(),
  cohort_id: z.string().uuid().optional().nullable(),
})

export async function createUser(formData: FormData) {
  // Verify super_admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (adminProfile?.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const input = createUserSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    cohort_id: formData.get('cohort_id') || null,
  })

  if (!input.success) {
    return { error: input.error.errors[0].message }
  }

  // Create auth user with admin client
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: input.data.email,
    password: 'challenge', // Default password
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
        full_name: input.data.full_name,
        cohort_id: input.data.cohort_id,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/users')
  return { data: authData.user }
}

export async function assignUserToCohort(userId: string, cohortId: string | null) {
  const supabase = await createClient()

  // Verify super_admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (adminProfile?.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ cohort_id: cohortId })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/users')
  return { success: true }
}
5. /app/api/export/selections/route.ts (CSV Export)

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start')
  const cohortId = searchParams.get('cohort_id')

  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (!['super_admin', 'viewer'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Build query
  let query = supabase
    .from('meal_selections')
    .select(`
      *,
      profiles!inner(email, full_name, cohort_id)
    `)

  if (weekStart) {
    query = query.eq('week_start_date', weekStart)
  }
  if (cohortId) {
    query = query.eq('profiles.cohort_id', cohortId)
  }

  const { data: selections, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate CSV
  const headers = [
    'Email',
    'Name',
    'Week Start',
    'Delivery',
    'Locked',
    ...Array.from({ length: 7 }, (_, i) => [`Day${i + 1}_Lunch`, `Day${i + 1}_Dinner`]).flat()
  ]

  const rows = selections?.map((s: any) => {
    const sels = s.selections || {}
    const mealCols = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1
      return [sels[`${day}_lunch`] || '', sels[`${day}_dinner`] || '']
    }).flat()

    return [
      s.profiles.email,
      s.profiles.full_name || '',
      s.week_start_date,
      s.delivery_preference || '',
      s.locked ? 'Yes' : 'No',
      ...mealCols
    ]
  }) || []

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=meal-selections-${weekStart || 'all'}.csv`,
    },
  })
}
Environment Variables
Create .env.local:


NEXT_PUBLIC_SUPABASE_URL=https://cmpecuolthmjxvwcutom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard - KEEP SECRET>
Setup Commands

# Create project
npx create-next-app@latest revive-admin --typescript --tailwind --app --src-dir=false

# Install dependencies
cd revive-admin
npm install @supabase/ssr @supabase/supabase-js @tanstack/react-query zod react-hook-form @hookform/resolvers date-fns lucide-react

# Initialize shadcn
npx shadcn@latest init

# Add shadcn components
npx shadcn@latest add button input table dialog select form card badge tabs toast dropdown-menu skeleton avatar separator
Implementation Order
Setup - Create Next.js project, install deps, init shadcn
Types - Copy database.ts types file
Supabase clients - Create server.ts, client.ts, admin.ts, middleware.ts
Auth - Create middleware.ts, login page
Layout - Create sidebar, header, dashboard layout
Cohorts - List, create, edit pages
Users - List, create (with admin API), assign cohort
Meals - Week selector, meal option form, list by week
Selections - Table view, filters, CSV export
Deploy - Push to GitHub, connect Vercel
Verification
Login - Sign in as super_admin, verify access
Create cohort - Add new challenge, activate it
Create user - Add user via admin form, verify auth.users created
Assign cohort - Assign user to cohort
Add meals - Create Week 1 meals with A/B options
View selections - After user selects meals in mobile app, verify they appear
Export CSV - Download selections, verify format
Notes for Implementation
Profiles are auto-created - When you create an auth user, a trigger creates the profile row automatically. You just need to UPDATE it with cohort_id.

meal_options week_start_date - Use the Monday of each challenge week. Calculate from cohort.start_date: Week 1 = start_date, Week 2 = start_date + 7 days, etc.

Selections JSON - Keys are {dayOfWeek}_lunch and {dayOfWeek}_dinner where dayOfWeek is 1-7. Values are 'A' or 'B'.

Only one active cohort - When activating a cohort, deactivate all others first.

Service role key - NEVER expose to client. Only use in Server Actions and API routes.

