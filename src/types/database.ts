export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          pillar_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pillar_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pillar_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_areas_by_pillar"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_pillars_summary"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_monthly_pillar_progress"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_pillar_progress"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "vw_weekly_pillar_progress"
            referencedColumns: ["pillar_id"]
          },
          {
            foreignKeyName: "areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      body_progress_logs: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          id: string
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          area_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          goal_id: string | null
          habit_id: string | null
          id: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          goal_id?: string | null
          habit_id?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          goal_id?: string | null
          habit_id?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_areas_by_pillar"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_weekly_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "calendar_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "calendar_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "calendar_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "calendar_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "calendar_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "calendar_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "calendar_events_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      career_skills: {
        Row: {
          category: string
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_health_tracker: {
        Row: {
          calorie_target: number | null
          calories_ingested: number | null
          created_at: string
          date: string
          id: string
          is_workout_day: boolean | null
          routine_id: string | null
          user_id: string | null
          water_ingested_liters: number | null
          water_target_liters: number | null
        }
        Insert: {
          calorie_target?: number | null
          calories_ingested?: number | null
          created_at?: string
          date: string
          id?: string
          is_workout_day?: boolean | null
          routine_id?: string | null
          user_id?: string | null
          water_ingested_liters?: number | null
          water_target_liters?: number | null
        }
        Update: {
          calorie_target?: number | null
          calories_ingested?: number | null
          created_at?: string
          date?: string
          id?: string
          is_workout_day?: boolean | null
          routine_id?: string | null
          user_id?: string | null
          water_ingested_liters?: number | null
          water_target_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_health_tracker_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          area_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_areas_by_pillar"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_weekly_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          created_at: string | null
          habit_id: string
          id: string
          log_date: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          habit_id: string
          id?: string
          log_date: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          habit_id?: string
          id?: string
          log_date?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      habit_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          habit_id: string
          id: string
          planned_time: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          habit_id: string
          id?: string
          planned_time?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          habit_id?: string
          id?: string
          planned_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_schedule_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_schedule_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_schedule_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_schedule_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_schedule_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["habit_id"]
          },
        ]
      }
      habits: {
        Row: {
          area_id: string
          created_at: string | null
          description: string | null
          frequency_type: string | null
          goal_id: string | null
          id: string
          is_active: boolean | null
          target_per_week: number | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id: string
          created_at?: string | null
          description?: string | null
          frequency_type?: string | null
          goal_id?: string | null
          id?: string
          is_active?: boolean | null
          target_per_week?: number | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string
          created_at?: string | null
          description?: string | null
          frequency_type?: string | null
          goal_id?: string | null
          id?: string
          is_active?: boolean | null
          target_per_week?: number | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_areas_by_pillar"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_weekly_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "habits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "habits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "habits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          confidence: string
          created_at: string
          date: string
          estimated_calories: number
          id: string
          meal_description: string
          meal_type: string
          portion_assumption: string | null
          source: string
          user_id: string
        }
        Insert: {
          confidence?: string
          created_at?: string
          date?: string
          estimated_calories?: number
          id?: string
          meal_description: string
          meal_type?: string
          portion_assumption?: string | null
          source?: string
          user_id: string
        }
        Update: {
          confidence?: string
          created_at?: string
          date?: string
          estimated_calories?: number
          id?: string
          meal_description?: string
          meal_type?: string
          portion_assumption?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      perfiles_salud: {
        Row: {
          altura_cm: number
          gasto_basal_bmr: number
          id: string
          meta_agua_ml: number
          peso_kg: number
          updated_at: string
        }
        Insert: {
          altura_cm?: number
          gasto_basal_bmr?: number
          id: string
          meta_agua_ml?: number
          peso_kg?: number
          updated_at?: string
        }
        Update: {
          altura_cm?: number
          gasto_basal_bmr?: number
          id?: string
          meta_agua_ml?: number
          peso_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      pillars: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_activity_logs: {
        Row: {
          created_at: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          metadata: Json
          new_priority: string | null
          new_status: string | null
          old_priority: string | null
          old_status: string | null
          project_id: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          metadata?: Json
          new_priority?: string | null
          new_status?: string | null
          old_priority?: string | null
          old_status?: string | null
          project_id?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          metadata?: Json
          new_priority?: string | null
          new_status?: string | null
          old_priority?: string | null
          old_status?: string | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_progress"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_activity_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_skills: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          proficiency_level: string
          project_id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          proficiency_level?: string
          project_id: string
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          proficiency_level?: string
          project_id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_progress"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "career_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          parent_id: string | null
          priority: string | null
          project_id: string
          sort_order: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          parent_id?: string | null
          priority?: string | null
          project_id: string
          sort_order?: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          parent_id?: string | null
          priority?: string | null
          project_id?: string
          sort_order?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_progress"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          area_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_areas_by_pillar"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_logs_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_habit_schedule_detail"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_today_habits"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_upcoming_events"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_weekly_area_progress"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      registros_diarios_salud: {
        Row: {
          agua_ingerida_ml: number
          calorias_ingeridas: number
          entrenado_completado: boolean
          fecha: string
          id: string
          user_id: string
        }
        Insert: {
          agua_ingerida_ml?: number
          calorias_ingeridas?: number
          entrenado_completado?: boolean
          fecha?: string
          id?: string
          user_id: string
        }
        Update: {
          agua_ingerida_ml?: number
          calorias_ingeridas?: number
          entrenado_completado?: boolean
          fecha?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      rutinas_entrenamiento: {
        Row: {
          activo: boolean
          calorias_extra: number
          descripcion_rutina: string | null
          dia_semana: number
          id: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          calorias_extra?: number
          descripcion_rutina?: string | null
          dia_semana: number
          id?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          calorias_extra?: number
          descripcion_rutina?: string | null
          dia_semana?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_physical_profiles: {
        Row: {
          birth_date: string
          created_at: string
          gender: string
          height_cm: number
          id: string
          updated_at: string
          user_id: string | null
          weight_kg: number
        }
        Insert: {
          birth_date: string
          created_at?: string
          gender: string
          height_cm: number
          id?: string
          updated_at?: string
          user_id?: string | null
          weight_kg: number
        }
        Update: {
          birth_date?: string
          created_at?: string
          gender?: string
          height_cm?: number
          id?: string
          updated_at?: string
          user_id?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_liters: number
          created_at: string
          date: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount_liters?: number
          created_at?: string
          date?: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          amount_liters?: number
          created_at?: string
          date?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_routines: {
        Row: {
          created_at: string
          estimated_calories_burned: number | null
          exercises_json: Json | null
          id: string
          routine_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          estimated_calories_burned?: number | null
          exercises_json?: Json | null
          id?: string
          routine_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          estimated_calories_burned?: number | null
          exercises_json?: Json | null
          id?: string
          routine_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      project_progress: {
        Row: {
          completed_tasks: number | null
          progress_percentage: number | null
          project_id: string | null
          total_tasks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_progress"
            referencedColumns: ["project_id"]
          },
        ]
      }
      vw_area_progress: {
        Row: {
          area_id: string | null
          area_name: string | null
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_areas_by_pillar: {
        Row: {
          area_color: string | null
          area_description: string | null
          area_icon: string | null
          area_id: string | null
          area_is_active: boolean | null
          area_name: string | null
          pillar_color: string | null
          pillar_description: string | null
          pillar_icon: string | null
          pillar_id: string | null
          pillar_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_career_skills_summary: {
        Row: {
          categories_count: number | null
          skills_detail: Json | null
          top_skill_category: string | null
          top_skill_name: string | null
          top_skill_projects_count: number | null
          total_skill_project_links: number | null
          total_skills: number | null
          unused_skills: number | null
          used_skills: number | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_dashboard_pillars_summary: {
        Row: {
          active_goals: number | null
          active_habits: number | null
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          pillar_color: string | null
          pillar_description: string | null
          pillar_icon: string | null
          pillar_id: string | null
          pillar_name: string | null
          total_areas: number | null
          total_goals: number | null
          total_habits: number | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_dashboard_summary: {
        Row: {
          general_completion_percentage: number | null
          total_active_areas: number | null
          total_active_goals: number | null
          total_active_habits: number | null
          total_active_projects: number | null
          total_habit_logs: number | null
          total_scheduled_events: number | null
          user_id: string | null
        }
        Insert: {
          general_completion_percentage?: never
          total_active_areas?: never
          total_active_goals?: never
          total_active_habits?: never
          total_active_projects?: never
          total_habit_logs?: never
          total_scheduled_events?: never
          user_id?: string | null
        }
        Update: {
          general_completion_percentage?: never
          total_active_areas?: never
          total_active_goals?: never
          total_active_habits?: never
          total_active_projects?: never
          total_habit_logs?: never
          total_scheduled_events?: never
          user_id?: string | null
        }
        Relationships: []
      }
      vw_habit_logs_detail: {
        Row: {
          area_id: string | null
          area_name: string | null
          goal_id: string | null
          goal_title: string | null
          habit_id: string | null
          habit_title: string | null
          log_date: string | null
          log_id: string | null
          notes: string | null
          status: string | null
          unit: string | null
          user_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_habit_schedule_detail: {
        Row: {
          area_color: string | null
          area_id: string | null
          area_name: string | null
          day_name: string | null
          day_of_week: number | null
          frequency_type: string | null
          goal_id: string | null
          goal_title: string | null
          habit_description: string | null
          habit_id: string | null
          habit_title: string | null
          planned_time: string | null
          schedule_id: string | null
          target_per_week: number | null
          target_value: number | null
          unit: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_monthly_habit_progress: {
        Row: {
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          month: string | null
          partial_logs: number | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_monthly_pillar_progress: {
        Row: {
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          month: string | null
          partial_logs: number | null
          pillar_color: string | null
          pillar_id: string | null
          pillar_name: string | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_pillar_progress: {
        Row: {
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          pillar_color: string | null
          pillar_description: string | null
          pillar_icon: string | null
          pillar_id: string | null
          pillar_name: string | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_project_progress: {
        Row: {
          completed_tasks: number | null
          progress_percentage: number | null
          project_id: string | null
          project_title: string | null
          total_tasks: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_today_habits: {
        Row: {
          area_color: string | null
          area_id: string | null
          area_name: string | null
          day_of_week: number | null
          habit_description: string | null
          habit_id: string | null
          habit_title: string | null
          log_date: string | null
          log_id: string | null
          log_notes: string | null
          log_status: string | null
          log_value: number | null
          pillar_color: string | null
          pillar_id: string | null
          pillar_name: string | null
          planned_time: string | null
          target_value: number | null
          unit: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_upcoming_events: {
        Row: {
          area_color: string | null
          area_id: string | null
          area_name: string | null
          description: string | null
          end_time: string | null
          event_date: string | null
          event_id: string | null
          goal_id: string | null
          goal_title: string | null
          habit_id: string | null
          habit_title: string | null
          start_time: string | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_weekly_area_progress: {
        Row: {
          area_color: string | null
          area_id: string | null
          area_name: string | null
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          total_logs: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_weekly_career_activity: {
        Row: {
          active_projects_touched: number | null
          active_tasks_touched: number | null
          activity_intensity: string | null
          last_event_at: string | null
          last_event_description: string | null
          last_event_title: string | null
          last_event_type: string | null
          most_active_day: string | null
          most_active_day_events: number | null
          project_priority_changed_events: number | null
          project_status_changed_events: number | null
          projects_completed_events: number | null
          projects_created_events: number | null
          task_priority_changed_events: number | null
          task_status_changed_events: number | null
          tasks_archived_events: number | null
          tasks_completed_events: number | null
          tasks_created_events: number | null
          total_events: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: []
      }
      vw_weekly_career_summary: {
        Row: {
          active_projects: number | null
          archived_tasks: number | null
          backlog_projects: number | null
          completed_projects: number | null
          completed_tasks: number | null
          due_next_7_days: number | null
          high_priority_projects: number | null
          high_priority_tasks: number | null
          in_progress_tasks: number | null
          overdue_tasks: number | null
          paused_projects: number | null
          pending_tasks: number | null
          planning_projects: number | null
          projects_created_week: number | null
          tasks_completed_week: number | null
          tasks_created_week: number | null
          top_project_completed_tasks: number | null
          top_project_id: string | null
          top_project_title: string | null
          total_projects: number | null
          total_task_completion_percentage: number | null
          total_tasks: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
          weekly_productivity_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["top_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["top_project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_progress"
            referencedColumns: ["project_id"]
          },
        ]
      }
      vw_weekly_habit_progress: {
        Row: {
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          total_logs: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vw_weekly_health_summary: {
        Row: {
          active_days: number | null
          avg_calorie_target: number | null
          avg_calories_per_meal: number | null
          avg_daily_calories: number | null
          avg_daily_water_liters: number | null
          avg_energy_level: number | null
          completed_training_days: number | null
          latest_weight_date: string | null
          latest_weight_kg: number | null
          meals_count: number | null
          planned_training_days: number | null
          progress_records: number | null
          total_meal_calories: number | null
          total_water_liters: number | null
          tracker_total_calories: number | null
          training_completion_percentage: number | null
          user_id: string | null
          water_events_count: number | null
          week_end: string | null
          week_start: string | null
          workout_days: number | null
        }
        Relationships: []
      }
      vw_weekly_pillar_progress: {
        Row: {
          completed_logs: number | null
          completion_percentage: number | null
          missed_logs: number | null
          partial_logs: number | null
          pillar_color: string | null
          pillar_id: string | null
          pillar_name: string | null
          total_logs: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      safe_parse_jsonb: { Args: { input_text: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
