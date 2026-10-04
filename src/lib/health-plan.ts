import { getDateForWeekdayNum } from "@/lib/date"
import { DAYS_OF_WEEK } from "@/lib/health-page-helpers"
import { ROUTINE_LABELS, ROUTINE_TYPES, type RoutineType } from "@/lib/health-training"
import type { HealthHistory } from "@/lib/health-analytics"

export type HealthPlanItem = {
  id: string
  date: string
  category: string
  title: string
  scheduled_time: string | null
  target_value: number | null
  target_unit: string | null
  completed: boolean
}

export type WorkoutPlanEntry = {
  key: string
  date: string
  dayId: string
  type: RoutineType
  title: string
  time: string | null
  completed: boolean
}

export function buildWorkoutPlanEntries(
  weekStart: string,
  descriptions: Record<RoutineType, Record<string, string>>,
  times: Record<RoutineType, Record<string, string>>,
  checked: Record<RoutineType, Record<string, boolean>>,
): WorkoutPlanEntry[] {
  return DAYS_OF_WEEK.flatMap((day) => ROUTINE_TYPES.flatMap((type) => {
    const description = (descriptions[type][day.id] || "").trim()
    if (!description) return []
    return [{
      key: `${day.id}-${type}`,
      date: getDateForWeekdayNum(weekStart, day.num),
      dayId: day.id,
      type,
      title: `${ROUTINE_LABELS[type]} · ${description}`,
      time: times[type][day.id] || null,
      completed: !!checked[type][day.id],
    }]
  }))
}

export function historicalWorkoutEntries(history: HealthHistory, weekStart: string): WorkoutPlanEntry[] {
  const plan = history.plans.find((item) => item.week_start === weekStart)
  const snapshot = plan?.planned_routines
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return []
  return Object.entries(snapshot as Record<string, unknown>).flatMap(([dayNumber, types]) => {
    const day = DAYS_OF_WEEK.find((item) => item.num === Number(dayNumber))
    if (!day || !Array.isArray(types)) return []
    const date = getDateForWeekdayNum(weekStart, day.num)
    return types.filter((type): type is RoutineType => ROUTINE_TYPES.includes(type as RoutineType)).map((type) => ({
      key: `${weekStart}-${day.id}-${type}`,
      date,
      dayId: day.id,
      type,
      title: `${ROUTINE_LABELS[type]} · planificación histórica`,
      time: null,
      completed: history.routine.some((row) => row.date === date && row.routine_type === type && row.completed),
    }))
  })
}
