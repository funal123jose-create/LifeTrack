import type { WeeklyCareerActivity, WeeklyPersonalCareSummary } from "@/lib/dashboard-page-models"

export const formatDateShort = (value?: string | null) => {
  if (!value) return "—"

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    })
  } catch {
    return "—"
  }
}

export type ProfessionalActivityBreakdownItem = {
  label: string
  value: number
  helper: string
  tone: string
}

export const getCareerActivityLabel = (activity?: WeeklyCareerActivity | null) => {
  if (activity?.activity_intensity === "high") return "Alta intensidad"
  if (activity?.activity_intensity === "medium") return "Intensidad media"
  if (activity?.activity_intensity === "low") return "Actividad inicial"

  return "Sin actividad"
}

export const getCareerProfessionalEvents = (activity?: WeeklyCareerActivity | null) => {
  return activity?.professional_activity_events || 0
}

export const getCareerProfessionalActivityPct = (activity?: WeeklyCareerActivity | null) => {
  const professionalEvents = getCareerProfessionalEvents(activity)

  return activity && activity.total_events > 0
    ? Math.round((professionalEvents / activity.total_events) * 100)
    : 0
}

export const getLastCareerActivityText = (activity?: WeeklyCareerActivity | null) => {
  return activity?.last_event_description || activity?.last_event_title || "Sin eventos registrados"
}

export const getLastCareerActivityLabel = (activity?: WeeklyCareerActivity | null) => {
  if (activity?.last_event_type === "project_skill_assigned") return "Skill asignada al proyecto"
  if (activity?.last_event_type === "task_skill_assigned") return "Skill aplicada en subtarea"
  if (activity?.last_event_type === "task_documented") return "Subtarea documentada"
  if (activity?.last_event_type === "task_documentation_updated") return "Documentación actualizada"
  if (activity?.last_event_type === "task_evidence_uploaded") return "Evidencia subida"

  return activity?.last_event_title || "Sin actividad reciente"
}

export const getProfessionalActivityBreakdown = (
  activity?: WeeklyCareerActivity | null
): ProfessionalActivityBreakdownItem[] => [
  {
    label: "Skills",
    value: activity?.skill_activity_events || 0,
    helper: `${activity?.project_skill_assigned_events || 0} proyecto · ${activity?.task_skill_assigned_events || 0} subtarea`,
    tone: "border-purple-300/12 bg-purple-500/[0.075] text-purple-200",
  },
  {
    label: "Documentación",
    value: activity?.documentation_activity_events || 0,
    helper: `${activity?.task_documented_events || 0} nueva · ${activity?.task_documentation_updated_events || 0} actualizada`,
    tone: "border-cyan-300/12 bg-cyan-500/[0.075] text-cyan-200",
  },
  {
    label: "Evidencias",
    value: activity?.evidence_activity_events || 0,
    helper: `${activity?.task_evidence_uploaded_events || 0} archivos subidos`,
    tone: "border-emerald-300/12 bg-emerald-500/[0.075] text-emerald-200",
  },
]

const clampDashboardPct = (value: number) => Math.min(Math.max(Math.round(value || 0), 0), 100)

export const getPersonalCareDashboardMetrics = (
  summary: WeeklyPersonalCareSummary | null,
  fallbackProgress: number
) => {
  const checkins = summary?.checkin_days || 0

  return {
    score: summary
      ? clampDashboardPct(summary.personal_care_score || 0)
      : fallbackProgress,
    intensityLabel:
      summary?.care_intensity === "high"
        ? "Alta constancia"
        : summary?.care_intensity === "medium"
          ? "Constancia media"
          : summary?.care_intensity === "low"
            ? "Inicio activo"
            : "Sin actividad",
    checkins,
    completedRoutines: summary?.completed_routine_events || 0,
    activeRoutines: summary?.active_routines || 0,
    routinePct: summary
      ? clampDashboardPct(summary.routine_completion_percentage || 0)
      : 0,
    checkinPct: summary
      ? clampDashboardPct(summary.checkin_completion_percentage || 0)
      : 0,
    moodPct: summary?.avg_mood_level ? clampDashboardPct(summary.avg_mood_level * 10) : 0,
    motivationPct: summary?.avg_motivation_level ? clampDashboardPct(summary.avg_motivation_level * 10) : 0,
    sleepPct: summary?.avg_sleep_quality ? clampDashboardPct(summary.avg_sleep_quality * 10) : 0,
    stressPct: summary?.avg_stress_level ? clampDashboardPct(summary.avg_stress_level * 10) : 0,
    insight:
      checkins >= 4
        ? "Buen seguimiento personal: existe una base de autocuidado."
        : checkins > 0
          ? "Hay seguimiento inicial, pero hace falta m\u00e1s constancia diaria."
          : "Conviene empezar con check-ins simples y una rutina diaria.",
  }
}
