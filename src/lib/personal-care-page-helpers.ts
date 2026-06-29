import { Home, Leaf, Scissors, Sparkles, Sun, type LucideIcon } from "lucide-react"
import type {
  PersonalCareDailyLog,
  PersonalCareCompletion,
  PersonalCareRoutine,
  RoutineTemplate,
  WeeklyPersonalCareSummary,
} from "@/lib/personal-care-page-models"

export const DEFAULT_ROUTINES: RoutineTemplate[] = [
  {
    name: "Lavado facial",
    category: "skincare",
    description: "Rutina básica de limpieza facial para iniciar o cerrar el día.",
  },
  {
    name: "Hidratación de piel",
    category: "skincare",
    description: "Aplicar hidratante o cuidado básico para mantener la piel saludable.",
  },
  {
    name: "Protector solar",
    category: "skincare",
    description: "Aplicar protector solar antes de salir o iniciar actividades del día.",
  },
  {
    name: "Cuidado de cabello",
    category: "presentación",
    description: "Peinar, ordenar o realizar cuidado básico del cabello.",
  },
  {
    name: "Orden del espacio",
    category: "entorno",
    description: "Ordenar el espacio personal para mejorar concentración y bienestar.",
  },
  {
    name: "Pausa mental",
    category: "bienestar",
    description: "Tomar unos minutos para respirar, desconectar o bajar revoluciones.",
  },
]

export const categoryStyles: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  skincare: {
    label: "Skincare",
    icon: Sun,
    className: "border-cyan-300/14 bg-cyan-500/[0.08] text-cyan-200",
  },
  presentación: {
    label: "Presentación",
    icon: Scissors,
    className: "border-orange-300/14 bg-orange-500/[0.08] text-orange-200",
  },
  entorno: {
    label: "Entorno",
    icon: Home,
    className: "border-emerald-300/14 bg-emerald-500/[0.08] text-emerald-200",
  },
  bienestar: {
    label: "Bienestar",
    icon: Leaf,
    className: "border-purple-300/14 bg-purple-500/[0.08] text-purple-200",
  },
  general: {
    label: "General",
    icon: Sparkles,
    className: "border-slate-300/10 bg-slate-500/[0.08] text-slate-200",
  },
}

export const scoreTone = (score: number) => {
  if (score >= 80) return "text-emerald-200 border-emerald-300/16 bg-emerald-500/[0.08]"
  if (score >= 55) return "text-cyan-200 border-cyan-300/16 bg-cyan-500/[0.08]"
  if (score > 0) return "text-orange-200 border-orange-300/16 bg-orange-500/[0.08]"
  return "text-slate-300 border-slate-300/10 bg-slate-500/[0.06]"
}

export const intensityLabel = (intensity?: string | null) => {
  if (intensity === "high") return "Alta constancia"
  if (intensity === "medium") return "Constancia media"
  if (intensity === "low") return "Inicio activo"
  return "Sin actividad"
}

export const clampNumber = (value: number, min = 1, max = 10) => {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

type RawPersonalCareDailyLog = Partial<Record<keyof PersonalCareDailyLog, unknown>>
type RawWeeklyPersonalCareSummary = Partial<Record<keyof WeeklyPersonalCareSummary, unknown>>

export const mapPersonalCareDailyLog = (log: RawPersonalCareDailyLog): PersonalCareDailyLog => ({
  mood_level: Number(log.mood_level || 7),
  stress_level: Number(log.stress_level || 5),
  motivation_level: Number(log.motivation_level || 7),
  sleep_quality: Number(log.sleep_quality || 7),
  reflection: log.reflection ? String(log.reflection) : "",
  gratitude_note: log.gratitude_note ? String(log.gratitude_note) : "",
  improvement_note: log.improvement_note ? String(log.improvement_note) : "",
})

export const mapWeeklyPersonalCareSummary = (
  summary: RawWeeklyPersonalCareSummary | null | undefined
): WeeklyPersonalCareSummary | null => {
  if (!summary) return null

  return {
    week_start: summary.week_start ? String(summary.week_start) : null,
    week_end: summary.week_end ? String(summary.week_end) : null,
    active_days: Number(summary.active_days || 0),
    checkin_days: Number(summary.checkin_days || 0),
    avg_mood_level: Number(summary.avg_mood_level || 0),
    avg_stress_level: Number(summary.avg_stress_level || 0),
    avg_motivation_level: Number(summary.avg_motivation_level || 0),
    avg_sleep_quality: Number(summary.avg_sleep_quality || 0),
    reflection_days: Number(summary.reflection_days || 0),
    gratitude_days: Number(summary.gratitude_days || 0),
    improvement_days: Number(summary.improvement_days || 0),
    active_routines: Number(summary.active_routines || 0),
    completed_routine_events: Number(summary.completed_routine_events || 0),
    routine_completed_days: Number(summary.routine_completed_days || 0),
    unique_routines_completed: Number(summary.unique_routines_completed || 0),
    routine_completion_percentage: Number(summary.routine_completion_percentage || 0),
    checkin_completion_percentage: Number(summary.checkin_completion_percentage || 0),
    personal_care_score: Number(summary.personal_care_score || 0),
    last_log_date: summary.last_log_date ? String(summary.last_log_date) : null,
    last_mood_level: summary.last_mood_level !== null && summary.last_mood_level !== undefined ? Number(summary.last_mood_level) : null,
    last_stress_level: summary.last_stress_level !== null && summary.last_stress_level !== undefined ? Number(summary.last_stress_level) : null,
    last_motivation_level: summary.last_motivation_level !== null && summary.last_motivation_level !== undefined ? Number(summary.last_motivation_level) : null,
    last_sleep_quality: summary.last_sleep_quality !== null && summary.last_sleep_quality !== undefined ? Number(summary.last_sleep_quality) : null,
    last_reflection: summary.last_reflection ? String(summary.last_reflection) : null,
    last_gratitude_note: summary.last_gratitude_note ? String(summary.last_gratitude_note) : null,
    last_improvement_note: summary.last_improvement_note ? String(summary.last_improvement_note) : null,
    last_activity_at: summary.last_activity_at ? String(summary.last_activity_at) : null,
    care_intensity: summary.care_intensity ? String(summary.care_intensity) : "none",
  }
}

export const getPersonalCareDailyMetrics = (
  routines: PersonalCareRoutine[],
  completions: PersonalCareCompletion[],
  weeklySummary: WeeklyPersonalCareSummary | null
) => {
  const completedRoutineIds = new Set(
    completions.filter((item) => item.completed).map((item) => item.routine_id)
  )
  const activeRoutines = routines.filter((routine) => routine.active)
  const todayRoutineCompletionPct =
    activeRoutines.length > 0 ? Math.round((completedRoutineIds.size / activeRoutines.length) * 100) : 0
  const personalScore = weeklySummary
    ? Math.min(Math.max(Math.round(weeklySummary.personal_care_score), 0), 100)
    : 0

  return {
    completedRoutineIds,
    activeRoutines,
    todayRoutineCompletionPct,
    personalScore,
    summaryTone: scoreTone(personalScore),
  }
}
