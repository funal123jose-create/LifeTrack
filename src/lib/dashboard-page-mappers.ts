import type { WeeklyHealthSummary } from "@/lib/dashboard-page-models"

type RoutineMetrics = {
  weekStart: string
  weekEnd: string
  activeDays: number
  plannedTrainingDays: number
  completedTrainingDays: number
  trainingCompletionPercentage: number
}

type RawWeeklyHealthSummary = Partial<Record<keyof WeeklyHealthSummary, unknown>>

export const mapWeeklyHealthSummary = (
  data: RawWeeklyHealthSummary | null | undefined,
  routineMetrics: RoutineMetrics
): WeeklyHealthSummary => ({
  week_start: String(data?.week_start || routineMetrics.weekStart),
  week_end: String(data?.week_end || routineMetrics.weekEnd),
  active_days: routineMetrics.activeDays,
  meals_count: Number(data?.meals_count || 0),
  total_meal_calories: Number(data?.total_meal_calories || 0),
  avg_calories_per_meal: Number(data?.avg_calories_per_meal || 0),
  water_events_count: Number(data?.water_events_count || 0),
  total_water_liters: Number(data?.total_water_liters || 0),
  avg_daily_water_liters: Number(data?.avg_daily_water_liters || 0),
  tracker_total_calories: Number(data?.tracker_total_calories || 0),
  avg_daily_calories: Number(data?.avg_daily_calories || 0),
  avg_calorie_target: Number(data?.avg_calorie_target || 0),
  workout_days: Number(data?.workout_days || 0),
  planned_training_days: routineMetrics.plannedTrainingDays,
  completed_training_days: routineMetrics.completedTrainingDays,
  training_completion_percentage: routineMetrics.trainingCompletionPercentage,
  avg_energy_level: Number(data?.avg_energy_level || 0),
  progress_records: Number(data?.progress_records || 0),
  latest_weight_kg: data?.latest_weight_kg !== null && data?.latest_weight_kg !== undefined
    ? Number(data.latest_weight_kg)
    : null,
  latest_weight_date: data?.latest_weight_date ? String(data.latest_weight_date) : null,
})
