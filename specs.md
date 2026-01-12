# Revive Admin Dashboard - Specifications

## Project Overview

An admin web application for managing the "Revive 28-Day Weight Loss Challenge" mobile app. This dashboard allows administrators to manage challenge cohorts, user enrollment, meal options, and view user activity.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth with role-based access |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | react-hook-form + zod |
| Data Fetching | React Query (client), Server Components (SSR) |
| Icons | lucide-react |
| Dates | date-fns |
| Deployment | Vercel |

## User Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access: create/edit/delete all resources |
| `viewer` | Read-only access to all data |
| `user` | No admin access (mobile app users only) |

## MVP Features

### 1. Authentication
- Email/password login via Supabase Auth
- Role-based access control (only admins can access)
- Automatic redirect for unauthorized users

### 2. Challenge Management (Cohorts)
- List all cohorts with status indicators
- Create new cohort with name, start date (end date auto-calculated as +27 days)
- Edit existing cohorts
- Activate/deactivate cohorts (only ONE active at a time)
- Delete cohorts (with confirmation)

### 3. User Management
- List all users with filtering by cohort
- Create new user accounts (admin API creates auth + profile)
- View user details: habits, check-ins, streaks
- Assign/reassign users to cohorts
- Default password for new users: "challenge"

### 4. Meal Options Management
- View meals organized by week (1-4) and day (1-7)
- Each day has 2 meals: Lunch and Dinner
- Each meal has Option A and Option B with:
  - Name (required)
  - Description (optional)
  - Image URL (optional)
- 56 total meal slots (7 days × 2 meals × 4 weeks)

### 5. Meal Selections Viewer
- View all user meal selections
- Filter by week, cohort, delivery preference
- Displays actual meal names (not just A/B)
- Export to CSV for meal prep (includes meal names)

### 6. Participation History
- Track all challenges a user has participated in
- Show status: active, completed, or left
- Display join dates and challenge periods
- Accessible from user detail page

## Database Schema

### Tables

#### cohorts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | e.g., "January 2026 Challenge" |
| start_date | date | First day of challenge |
| end_date | date | Last day (start_date + 27) |
| is_active | boolean | Only ONE should be true |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

#### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK, FK to auth.users |
| email | text | User email |
| full_name | text | Display name |
| cohort_id | uuid | FK to cohorts (current challenge) |
| role | text | 'user', 'super_admin', 'viewer' |
| push_token | text | Expo push token |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

#### cohort_participants
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| cohort_id | uuid | FK to cohorts |
| joined_at | timestamptz | When user joined this challenge |
| left_at | timestamptz | When user left (null if active) |
| status | text | 'active', 'completed', 'left' |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

*Note: Junction table for tracking participation history. UNIQUE(user_id, cohort_id).*

#### meal_options
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| week_start_date | date | Monday of that week |
| day_of_week | integer | 0-6 (Sun-Sat) |
| challenge_week | integer | 1-4 |
| challenge_day | integer | 1-7 |
| meal_type | text | 'lunch' or 'dinner' |
| option_a_name | text | Name of Option A |
| option_a_description | text | Description |
| option_a_image_url | text | Image URL |
| option_b_name | text | Name of Option B |
| option_b_description | text | Description |
| option_b_image_url | text | Image URL |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

#### meal_selections
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| week_start_date | date | Monday of that week |
| challenge_week | integer | 1-4 |
| selections | jsonb | {"1_lunch": "A", "1_dinner": "B", ...} |
| delivery_preference | text | 'home' or 'pickup' |
| locked | boolean | TRUE after deadline |
| locked_at | timestamptz | When locked |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

#### daily_habits
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| date | date | YYYY-MM-DD |
| weight_kg | decimal | Weight in kg |
| steps | integer | Step count |
| water_ml | integer | Water intake |
| meal_adherence | boolean | Did they follow meal plan? |
| *_logged_at | timestamptz | When each field was logged |

#### check_ins
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| date | date | YYYY-MM-DD |
| challenges_faced | text | User's reflection |
| habits_summary | jsonb | Snapshot of daily_habits |

#### streaks
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles (unique) |
| current_streak | integer | Current consecutive days |
| longest_streak | integer | Max achieved |
| last_check_in_date | date | Last check-in date |

## Business Rules

1. **One Active Cohort**: Only one cohort can be active at a time. Activating a cohort deactivates all others.

2. **Challenge Duration**: Each challenge is exactly 28 days (4 weeks). End date = start_date + 27 days.

3. **Meal Selection Deadline**: Users must select meals by Friday 11:59 PM before each week starts.

4. **Profile Auto-Creation**: When an auth user is created, a profile row is automatically created via database trigger.

5. **Meal Structure**: 2 meals per day (lunch + dinner), each with A/B options. No breakfast.

6. **Participation Tracking**: When a user is added to a new challenge, their previous active participation is marked as "completed" and a new record is created. Users can participate in multiple challenges over time.

## UI/UX Requirements

- **Design**: Clean, minimal, professional (inspired by Linear/Notion)
- **Responsiveness**: Desktop-first, but functional on tablet
- **Navigation**: Challenge-centric (no sidebar)
  - Header with challenge dropdown switcher
  - Horizontal tabs within challenge: Overview | Participants | Selections | Meals
  - Landing page redirects to most recent challenge
- **Create/Edit Flows**: Slide-over panels (Sheet component)
- **Feedback**: Toast notifications for actions (sonner)
- **Loading States**: Skeleton loaders for data fetching
- **Confirmations**: Dialogs for destructive actions

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://cmpecuolthmjxvwcutom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key - KEEP SECRET>
```

## Supabase Project

- **Project ID**: cmpecuolthmjxvwcutom
- **Region**: (check dashboard)
- **First Super Admin**: bbd2501@gmail.com

## Row Level Security

### Security Definer Functions
To avoid RLS infinite recursion when checking admin roles, the following functions are used:

- `is_admin()` - Returns true if current user has role 'super_admin' or 'viewer'
- `is_super_admin()` - Returns true if current user has role 'super_admin'

These functions use `SECURITY DEFINER` to bypass RLS when checking the profiles table.

### Key Policies
- **profiles**: Users can view own profile; admins can view all profiles
- **cohorts**: Admins can view; super_admins can create/update/delete
- **cohort_participants**: Admins can view; super_admins can manage
- **meal_options, meal_selections, daily_habits, check_ins, streaks**: Various policies based on user ownership and admin status
