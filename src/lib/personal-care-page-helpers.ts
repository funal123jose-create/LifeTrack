import { Home, Leaf, Scissors, Sparkles, Sun, type LucideIcon } from "lucide-react"
import type {
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
