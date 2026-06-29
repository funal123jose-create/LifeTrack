import type { createClient } from "@/lib/supabase/client"
import {
  mapPersonalCareDailyLog,
  mapWeeklyPersonalCareSummary,
} from "@/lib/personal-care-page-helpers"
import type {
  PersonalCareCompletion,
  PersonalCareDailyLog,
  PersonalCareRoutine,
  WeeklyPersonalCareSummary,
} from "@/lib/personal-care-page-models"
import type { Database } from "@/types/database"

type SupabaseClient = ReturnType<typeof createClient<Database>>

type PersonalCareOverview = {
  dailyLog: PersonalCareDailyLog | null
  routines: PersonalCareRoutine[]
  completions: PersonalCareCompletion[]
  weeklySummary: WeeklyPersonalCareSummary | null
  errors: {
    dailyLog?: unknown
    routines?: unknown
    completions?: unknown
    summary?: unknown
  }
}

export const fetchPersonalCareOverview = async (
  supabase: SupabaseClient,
  userId: string,
  today: string,
  currentWeekStart: string
): Promise<PersonalCareOverview> => {
  const [
    { data: dailyLog, error: dailyLogError },
    { data: routinesData, error: routinesError },
    { data: completionsData, error: completionsError },
    { data: summaryData, error: summaryError },
  ] = await Promise.all([
    supabase
      .from("personal_care_daily_logs")
      .select(`
        mood_level,
        stress_level,
        motivation_level,
        sleep_quality,
        reflection,
        gratitude_note,
        improvement_note
      `)
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),

    supabase
      .from("personal_care_routines")
      .select(`
        id,
        user_id,
        name,
        category,
        description,
        active,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),

    supabase
      .from("personal_care_routine_completions")
      .select(`
        id,
        routine_id,
        date,
        week_start,
        completed
      `)
      .eq("user_id", userId)
      .eq("date", today),

    supabase
      .from("vw_weekly_personal_care_summary")
      .select(`
        week_start,
        week_end,
        active_days,
        checkin_days,
        avg_mood_level,
        avg_stress_level,
        avg_motivation_level,
        avg_sleep_quality,
        reflection_days,
        gratitude_days,
        improvement_days,
        active_routines,
        completed_routine_events,
        routine_completed_days,
        unique_routines_completed,
        routine_completion_percentage,
        checkin_completion_percentage,
        personal_care_score,
        last_log_date,
        last_mood_level,
        last_stress_level,
        last_motivation_level,
        last_sleep_quality,
        last_reflection,
        last_gratitude_note,
        last_improvement_note,
        last_activity_at,
        care_intensity
      `)
      .eq("user_id", userId)
      .eq("week_start", currentWeekStart)
      .maybeSingle(),
  ])

  return {
    dailyLog: dailyLog ? mapPersonalCareDailyLog(dailyLog) : null,
    routines: (routinesData || []) as PersonalCareRoutine[],
    completions: (completionsData || []) as PersonalCareCompletion[],
    weeklySummary: mapWeeklyPersonalCareSummary(summaryData),
    errors: {
      dailyLog: dailyLogError,
      routines: routinesError,
      completions: completionsError,
      summary: summaryError,
    },
  }
}
