import type {
  CareerSkillsSummary,
  RawCareerSkillDetail,
  WeeklyCareerActivity,
  WeeklyCareerSummary,
  WeeklyHealthSummary,
} from "@/lib/dashboard-page-models"

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
type RawWeeklyCareerActivity = Partial<Record<keyof WeeklyCareerActivity, unknown>>
type RawCareerSkillsSummary = Partial<Record<keyof Omit<CareerSkillsSummary, "skills_detail">, unknown>> & {
  skills_detail?: unknown
}

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

export const mapWeeklyCareerActivity = (
  data: RawWeeklyCareerActivity | null | undefined
): WeeklyCareerActivity | null => {
  if (!data) return null

  return {
    week_start: data.week_start ? String(data.week_start) : null,
    week_end: data.week_end ? String(data.week_end) : null,
    total_events: Number(data.total_events || 0),
    projects_created_events: Number(data.projects_created_events || 0),
    projects_completed_events: Number(data.projects_completed_events || 0),
    project_status_changed_events: Number(data.project_status_changed_events || 0),
    project_priority_changed_events: Number(data.project_priority_changed_events || 0),
    tasks_created_events: Number(data.tasks_created_events || 0),
    tasks_completed_events: Number(data.tasks_completed_events || 0),
    tasks_archived_events: Number(data.tasks_archived_events || 0),
    task_status_changed_events: Number(data.task_status_changed_events || 0),
    task_priority_changed_events: Number(data.task_priority_changed_events || 0),
    project_skill_assigned_events: Number(data.project_skill_assigned_events || 0),
    task_skill_assigned_events: Number(data.task_skill_assigned_events || 0),
    task_documented_events: Number(data.task_documented_events || 0),
    task_documentation_updated_events: Number(data.task_documentation_updated_events || 0),
    task_evidence_uploaded_events: Number(data.task_evidence_uploaded_events || 0),
    skill_activity_events: Number(data.skill_activity_events || 0),
    documentation_activity_events: Number(data.documentation_activity_events || 0),
    evidence_activity_events: Number(data.evidence_activity_events || 0),
    professional_activity_events: Number(data.professional_activity_events || 0),
    active_projects_touched: Number(data.active_projects_touched || 0),
    active_tasks_touched: Number(data.active_tasks_touched || 0),
    most_active_day: data.most_active_day ? String(data.most_active_day) : null,
    most_active_day_events: Number(data.most_active_day_events || 0),
    last_event_type: data.last_event_type ? String(data.last_event_type) : null,
    last_event_title: data.last_event_title ? String(data.last_event_title) : null,
    last_event_description: data.last_event_description ? String(data.last_event_description) : null,
    last_event_at: data.last_event_at ? String(data.last_event_at) : null,
    activity_intensity: data.activity_intensity ? String(data.activity_intensity) : "none",
  }
}

export const mapCareerSkillsSummary = (
  data: RawCareerSkillsSummary | null | undefined
): CareerSkillsSummary | null => {
  if (!data) return null

  const rawSkillsDetail: RawCareerSkillDetail[] = Array.isArray(data.skills_detail)
    ? data.skills_detail as RawCareerSkillDetail[]
    : []

  return {
    total_skills: Number(data.total_skills || 0),
    used_skills: Number(data.used_skills || 0),
    unused_skills: Number(data.unused_skills || 0),
    total_skill_project_links: Number(data.total_skill_project_links || 0),
    top_skill_name: data.top_skill_name ? String(data.top_skill_name) : null,
    top_skill_category: data.top_skill_category ? String(data.top_skill_category) : null,
    top_skill_projects_count: Number(data.top_skill_projects_count || 0),
    categories_count: Number(data.categories_count || 0),
    skills_detail: rawSkillsDetail.map((skill) => ({
      skill_id: String(skill.skill_id || ""),
      name: String(skill.name || "Sin nombre"),
      category: String(skill.category || "General"),
      color: skill.color ? String(skill.color) : null,
      icon: skill.icon ? String(skill.icon) : null,
      projects_count: Number(skill.projects_count || 0),
      active_projects_count: Number(skill.active_projects_count || 0),
      completed_projects_count: Number(skill.completed_projects_count || 0),
      last_used_at: skill.last_used_at ? String(skill.last_used_at) : null,
    })),
  }
}
