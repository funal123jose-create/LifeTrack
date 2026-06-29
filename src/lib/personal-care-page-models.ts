export type PersonalCareRoutine = {
  id: string
  user_id: string
  name: string
  category: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type PersonalCareCompletion = {
  id: string
  routine_id: string
  date: string
  week_start: string
  completed: boolean
}

export type PersonalCareDailyLog = {
  mood_level: number
  stress_level: number
  motivation_level: number
  sleep_quality: number
  reflection: string | null
  gratitude_note: string | null
  improvement_note: string | null
}

export type WeeklyPersonalCareSummary = {
  week_start: string | null
  week_end: string | null
  active_days: number
  checkin_days: number
  avg_mood_level: number
  avg_stress_level: number
  avg_motivation_level: number
  avg_sleep_quality: number
  reflection_days: number
  gratitude_days: number
  improvement_days: number
  active_routines: number
  completed_routine_events: number
  routine_completed_days: number
  unique_routines_completed: number
  routine_completion_percentage: number
  checkin_completion_percentage: number
  personal_care_score: number
  last_log_date: string | null
  last_mood_level: number | null
  last_stress_level: number | null
  last_motivation_level: number | null
  last_sleep_quality: number | null
  last_reflection: string | null
  last_gratitude_note: string | null
  last_improvement_note: string | null
  last_activity_at: string | null
  care_intensity: "none" | "low" | "medium" | "high" | string
}

export type RoutineTemplate = {
  name: string
  category: string
  description: string
}
