import type { WeeklyCareerSummary, WeeklyHealthSummary } from "@/lib/dashboard-page-models"

type RoutineMetrics = {
  weekStart: string
  weekEnd: string
  activeDays: number
  plannedTrainingDays: number
  completedTrainingDays: number
  trainingCompletionPercentage: number
}

type RawWeeklyHealthSummary = Partial<Record<keyof WeeklyHealthSummary, unknown>>
type RawWeeklyCareerSummary = Partial<Record<keyof WeeklyCareerSummary, unknown>>

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

export const mapWeeklyCareerSummary = (
  data: RawWeeklyCareerSummary | null | undefined
): WeeklyCareerSummary | null => {
  if (!data) return null

  return {
    week_start: data.week_start ? String(data.week_start) : null,
    week_end: data.week_end ? String(data.week_end) : null,
    total_projects: Number(data.total_projects || 0),
    active_projects: Number(data.active_projects || 0),
    completed_projects: Number(data.completed_projects || 0),
    backlog_projects: Number(data.backlog_projects || 0),
    planning_projects: Number(data.planning_projects || 0),
    paused_projects: Number(data.paused_projects || 0),
    high_priority_projects: Number(data.high_priority_projects || 0),
    projects_created_week: Number(data.projects_created_week || 0),
    total_tasks: Number(data.total_tasks || 0),
    completed_tasks: Number(data.completed_tasks || 0),
    in_progress_tasks: Number(data.in_progress_tasks || 0),
    pending_tasks: Number(data.pending_tasks || 0),
    archived_tasks: Number(data.archived_tasks || 0),
    overdue_tasks: Number(data.overdue_tasks || 0),
    due_next_7_days: Number(data.due_next_7_days || 0),
    high_priority_tasks: Number(data.high_priority_tasks || 0),
    tasks_created_week: Number(data.tasks_created_week || 0),
    tasks_completed_week: Number(data.tasks_completed_week || 0),
    total_task_completion_percentage: Number(data.total_task_completion_percentage || 0),
    weekly_productivity_percentage: Number(data.weekly_productivity_percentage || 0),
    top_project_id: data.top_project_id ? String(data.top_project_id) : null,
    top_project_title: data.top_project_title ? String(data.top_project_title) : null,
    top_project_completed_tasks: Number(data.top_project_completed_tasks || 0),
  }
}
