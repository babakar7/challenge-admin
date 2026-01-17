# Revive Admin Dashboard - Project Status

## Current Phase: UX IMPROVEMENTS COMPLETED

## Recent Changes (January 2026)

### Configurable Challenge Duration
- [x] Added `duration_weeks` column to cohorts table (default: 4)
- [x] Duration dropdown (1-8 weeks) in create/edit challenge panels
- [x] Dynamic end date calculation based on duration
- [x] Dynamic week tabs in meals page
- [x] Dynamic week sections in selections page
- [x] Overview page shows "of X weeks" dynamically

### UX & Data Display Improvements
- [x] Added meal image previews to meal cards (with fallback for broken images)
- [x] Added image preview in edit meal form
- [x] Improved empty states with icons and guidance (participants, selections, meals)
- [x] Added participant search (filter by name or email)
- [x] Added streak filter dropdown (all, active streak, no streak)
- [x] Added weekly exercise display to user detail page (3x/week goal status)
- [x] Added admin RLS policies for `meal_selections` and `weekly_exercise`

### Meal Programs Feature
- [x] Created `meal_programs` table with RLS policies
- [x] Added `meal_program_id` to `meal_options` (required) and `cohorts` (optional)
- [x] Created default program and migrated existing meal data
- [x] Created `/meal-programs` list page with program cards
- [x] Created `/meal-programs/[id]` detail page with week tabs for editing meals
- [x] Added program selector dropdown to challenge create/edit panels
- [x] Meals tab in challenges now read-only with link to edit in Meal Programs
- [x] Selections page filters meal options by cohort's assigned program
- [x] Added "Meal Programs" nav link in header
- [x] Implemented duplicate program functionality
- [x] Added INSERT/UPDATE/DELETE RLS policies for `meal_options` table
- [x] Fixed empty date string bug when creating meals in programs
- [x] Added image URL fields to meal options form (Option A & B)

### Participation History Tracking
- [x] Created `cohort_participants` junction table for tracking user participation across challenges
- [x] Added RLS policies for cohort_participants table
- [x] Updated createUser action to track participation history
- [x] User detail page now shows challenge history with status (active, completed, left)
- [x] Existing users can be added to new challenges (moves from previous challenge)

### RLS & Auth Fixes
- [x] Fixed RLS infinite recursion with security definer functions
- [x] Added INSERT/UPDATE/DELETE policies on cohorts table for super_admins
- [x] Added admin view policies for profiles table
- [x] Created `is_admin()` and `is_super_admin()` functions

### Challenge-Centric Navigation Redesign
- [x] Removed sidebar navigation
- [x] Added challenge switcher dropdown in header
- [x] Landing page redirects to most recent challenge
- [x] Challenge pages use horizontal tabs (Overview | Participants | Selections | Meals)
- [x] Selections now display actual meal names instead of A/B
- [x] User details accessible via Participants > User drill-down
- [x] All create/edit flows use slide-over panels

## Progress Tracker

### Phase 1: Project Setup - COMPLETED
- [x] Install dependencies (Supabase, React Query, forms, dates, icons)
- [x] Initialize shadcn/ui
- [x] Add shadcn components (button, input, table, dialog, sheet, etc.)
- [x] Create .env.local with Supabase credentials
- [x] Create TypeScript database types

### Phase 2: Supabase Client Setup - COMPLETED
- [x] Create `/lib/supabase/client.ts` (browser client)
- [x] Create `/lib/supabase/server.ts` (server client + auth helpers)
- [x] Create `/lib/supabase/admin.ts` (service role client)

### Phase 3: Auth & Middleware - COMPLETED
- [x] Create `/middleware.ts` (route protection)
- [x] Create `/app/(auth)/layout.tsx`
- [x] Create `/app/(auth)/login/page.tsx`

### Phase 4: Challenge-Centric Layout - COMPLETED
- [x] Create `/app/(dashboard)/layout.tsx` (no sidebar)
- [x] Create `/components/layout/header.tsx` (with challenge dropdown)
- [x] Create `/components/layout/challenge-switcher.tsx`
- [x] Create `/app/(dashboard)/page.tsx` (redirects to most recent challenge)

### Phase 5: Challenge Module - COMPLETED
- [x] Create challenge layout with tabs
- [x] Create Overview tab with stats
- [x] Create create/edit challenge slide-over panels
- [x] Challenge actions (edit, activate, delete)

### Phase 6: Participants Module - COMPLETED
- [x] Create participants list page
- [x] Create add participant slide-over
- [x] Create user detail page with check-ins, habits, selections

### Phase 7: Meals Module - COMPLETED
- [x] Create meals page with week tabs (1-4)
- [x] Create day cards with lunch/dinner options
- [x] Create edit meal slide-over panel

### Phase 8: Selections Module - COMPLETED
- [x] Create selections page with meal name resolution
- [x] Create export dropdown (CSV with meal names)
- [x] Group selections by week

---

### Phase 9: Meal Programs Module - COMPLETED
- [x] Create meal_programs table with RLS
- [x] Create meal programs list page
- [x] Create meal program detail/edit page
- [x] Create program selector component
- [x] Add program selector to challenge panels
- [x] Update meals tab to be read-only
- [x] Update selections to filter by program
- [x] Add Meal Programs link to header

### Phase 10: UX & Data Display Improvements - COMPLETED
- [x] Meal image previews in cards and edit form
- [x] Improved empty states with icons
- [x] Participant search and streak filter
- [x] Weekly exercise goal display on user detail

---

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/` | Redirects to most recent challenge |
| `/challenges/[id]` | Challenge overview (stats, dates) |
| `/challenges/[id]/participants` | Participants list for challenge |
| `/challenges/[id]/participants/[uid]` | User detail page |
| `/challenges/[id]/meals` | Meal options (read-only, links to program) |
| `/challenges/[id]/selections` | Meal selections with actual names |
| `/meal-programs` | List all meal programs |
| `/meal-programs/[id]` | Edit meals within a program |
| `/api/export/selections` | CSV export endpoint |

---

## How to Run

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Run production build
```

---

## Notes & Decisions

- **Design**: Refined minimal with Revive brand colors (#7C547D purple, #FBF6F0 cream, #413733 brown)
- **Typography**: Instrument Serif for headings, Geist Sans for body
- **Navigation**: Challenge-centric (no sidebar, dropdown in header)
- **First Admin**: bbd2501@gmail.com
- **Database**: Existing Supabase project (cmpecuolthmjxvwcutom)
- **Toast**: Using sonner for notifications
- **Build**: Passing successfully
- **Default Password**: New users created with password "challenge"

---

## Last Updated
January 15, 2026
