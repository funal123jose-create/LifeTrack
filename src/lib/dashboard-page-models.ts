export type WeeklyHealthSummary = {
  week_start: string | null
  week_end: string | null
  active_days: number
  meals_count: number
  total_meal_calories: number
  avg_calories_per_meal: number
  water_events_count: number
  total_water_liters: number
  avg_daily_water_liters: number
  tracker_total_calories: number
  avg_daily_calories: number
  avg_calorie_target: number
  workout_days: number
  planned_training_days: number
  completed_training_days: number
  training_completion_percentage: number
  avg_energy_level: number
  progress_records: number
  latest_weight_kg: number | null
  latest_weight_date: string | null
}

export type WeeklyCareerSummary = {
  week_start: string | null
  week_end: string | null
  total_projects: number
  active_projects: number
  completed_projects: number
  backlog_projects: number
  planning_projects: number
  paused_projects: number
  high_priority_projects: number
  projects_created_week: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  archived_tasks: number
  overdue_tasks: number
  due_next_7_days: number
  high_priority_tasks: number
  tasks_created_week: number
  tasks_completed_week: number
  total_task_completion_percentage: number
  weekly_productivity_percentage: number
  top_project_id: string | null
  top_project_title: string | null
  top_project_completed_tasks: number
}

export type WeeklyCareerActivity = {
  week_start: string | null
  week_end: string | null
  total_events: number
  projects_created_events: number
  projects_completed_events: number
  project_status_changed_events: number
  project_priority_changed_events: number
  tasks_created_events: number
  tasks_completed_events: number
  tasks_archived_events: number
  task_status_changed_events: number
  task_priority_changed_events: number
  project_skill_assigned_events: number
  task_skill_assigned_events: number
  task_documented_events: number
  task_documentation_updated_events: number
  task_evidence_uploaded_events: number
  skill_activity_events: number
  documentation_activity_events: number
  evidence_activity_events: number
  professional_activity_events: number
  active_projects_touched: number
  active_tasks_touched: number
  most_active_day: string | null
  most_active_day_events: number
  last_event_type: string | null
  last_event_title: string | null
  last_event_description: string | null
  last_event_at: string | null
  activity_intensity: "none" | "low" | "medium" | "high" | string
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

export type CareerSkillDetail = {
  skill_id: string
  name: string
  category: string
  color: string | null
  icon: string | null
  projects_count: number
  active_projects_count: number
  completed_projects_count: number
  last_used_at: string | null
}

export type RawCareerSkillDetail = {
  skill_id?: unknown
  name?: unknown
  category?: unknown
  color?: unknown
  icon?: unknown
  projects_count?: unknown
  active_projects_count?: unknown
  completed_projects_count?: unknown
  last_used_at?: unknown
}

export type CareerSkillsSummary = {
  total_skills: number
  used_skills: number
  unused_skills: number
  total_skill_project_links: number
  top_skill_name: string | null
  top_skill_category: string | null
  top_skill_projects_count: number
  categories_count: number
  skills_detail: CareerSkillDetail[]
}
