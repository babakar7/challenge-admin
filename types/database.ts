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
      check_ins: {
        Row: {
          challenges_faced: string
          created_at: string | null
          date: string
          habits_summary: Json | null
          id: string
          user_id: string
        }
        Insert: {
          challenges_faced: string
          created_at?: string | null
          date: string
          habits_summary?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          challenges_faced?: string
          created_at?: string | null
          date?: string
          habits_summary?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          duration_weeks: number
          end_date: string
          id: string
          is_active: boolean | null
          meal_program_id: string | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_weeks?: number
          end_date: string
          id?: string
          is_active?: boolean | null
          meal_program_id?: string | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_weeks?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          meal_program_id?: string | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_meal_program_id_fkey"
            columns: ["meal_program_id"]
            isOneToOne: false
            referencedRelation: "meal_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_participants: {
        Row: {
          id: string
          user_id: string
          cohort_id: string
          joined_at: string
          left_at: string | null
          status: 'active' | 'completed' | 'left'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          cohort_id: string
          joined_at?: string
          left_at?: string | null
          status?: 'active' | 'completed' | 'left'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          cohort_id?: string
          joined_at?: string
          left_at?: string | null
          status?: 'active' | 'completed' | 'left'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohort_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_participants_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meal_adherence: boolean | null
          meal_logged_at: string | null
          steps: number | null
          steps_logged_at: string | null
          updated_at: string | null
          user_id: string
          water_logged_at: string | null
          water_ml: number | null
          weight_kg: number | null
          weight_logged_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          meal_adherence?: boolean | null
          meal_logged_at?: string | null
          steps?: number | null
          steps_logged_at?: string | null
          updated_at?: string | null
          user_id: string
          water_logged_at?: string | null
          water_ml?: number | null
          weight_kg?: number | null
          weight_logged_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meal_adherence?: boolean | null
          meal_logged_at?: string | null
          steps?: number | null
          steps_logged_at?: string | null
          updated_at?: string | null
          user_id?: string
          water_logged_at?: string | null
          water_ml?: number | null
          weight_kg?: number | null
          weight_logged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_options: {
        Row: {
          challenge_day: number | null
          challenge_week: number | null
          created_at: string | null
          day_of_week: number | null
          id: string
          meal_program_id: string
          meal_type: string
          option_a_description: string | null
          option_a_image_url: string | null
          option_a_name: string
          option_b_description: string | null
          option_b_image_url: string | null
          option_b_name: string
          updated_at: string | null
          week_start_date: string | null
        }
        Insert: {
          challenge_day?: number | null
          challenge_week?: number | null
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          meal_program_id: string
          meal_type: string
          option_a_description?: string | null
          option_a_image_url?: string | null
          option_a_name: string
          option_b_description?: string | null
          option_b_image_url?: string | null
          option_b_name: string
          updated_at?: string | null
          week_start_date?: string | null
        }
        Update: {
          challenge_day?: number | null
          challenge_week?: number | null
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          meal_program_id?: string
          meal_type?: string
          option_a_description?: string | null
          option_a_image_url?: string | null
          option_a_name?: string
          option_b_description?: string | null
          option_b_image_url?: string | null
          option_b_name?: string
          updated_at?: string | null
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_options_meal_program_id_fkey"
            columns: ["meal_program_id"]
            isOneToOne: false
            referencedRelation: "meal_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_selections: {
        Row: {
          challenge_week: number | null
          created_at: string | null
          delivery_preference: string | null
          id: string
          locked: boolean | null
          locked_at: string | null
          selections: Json | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          challenge_week?: number | null
          created_at?: string | null
          delivery_preference?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          selections?: Json | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          challenge_week?: number | null
          created_at?: string | null
          delivery_preference?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          selections?: Json | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cohort_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          push_token: string | null
          role: 'user' | 'super_admin' | 'viewer'
          updated_at: string | null
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          push_token?: string | null
          role?: 'user' | 'super_admin' | 'viewer'
          updated_at?: string | null
        }
        Update: {
          cohort_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          push_token?: string | null
          role?: 'user' | 'super_admin' | 'viewer'
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_check_in_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_exercise: {
        Row: {
          completed_3x: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          completed_3x?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          completed_3x?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_exercise_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_check_in: {
        Args: { p_date?: string; p_user_id: string }
        Returns: boolean
      }
      get_week_start: { Args: { input_date?: string }; Returns: string }
      invoke_edge_function: {
        Args: { function_name: string; payload?: Json }
        Returns: undefined
      }
      lock_meal_selections: { Args: Record<PropertyKey, never>; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
export type WeeklyExercise = Tables<'weekly_exercise'>
export type NotificationLog = Tables<'notification_logs'>
export type CohortParticipant = Tables<'cohort_participants'>
export type MealProgram = Tables<'meal_programs'>

// Profile with cohort
export type ProfileWithCohort = Profile & {
  cohorts: Cohort | null
}

// Meal selection with profile
export type MealSelectionWithProfile = MealSelection & {
  profiles: Pick<Profile, 'email' | 'full_name' | 'cohort_id'>
}
