import type { WeeklyCareerActivity } from "@/lib/dashboard-page-models"

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
