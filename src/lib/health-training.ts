import { formatDateToLocalString, getDateForWeekdayNum } from "@/lib/date"
import type { HealthHistory } from "@/lib/health-analytics"
import { healthDateRange, type HealthDateRange } from "@/lib/health-periods"

export const ROUTINE_TYPES = ["fuerza", "cardio", "movilidad", "hiit"] as const
export type RoutineType = typeof ROUTINE_TYPES[number]
export const ROUTINE_LABELS: Record<RoutineType, string> = {
  fuerza: "Fuerza", cardio: "Cardio", movilidad: "Movilidad", hiit: "HIIT",
}
export type TrainingPeriod = "today" | "week" | "month"
export type RoutineTemplate = Record<RoutineType, string> & { times: Partial<Record<RoutineType, string>> }

const emptyTemplate = (): RoutineTemplate => ({ fuerza: "", cardio: "", movilidad: "", hiit: "", times: {} })

export function parseRoutineTemplate(value: string | null): RoutineTemplate {
  if (!value) return emptyTemplate()
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return emptyTemplate()
    const record = parsed as Record<string, unknown>
    const times = typeof record.times === "object" && record.times !== null && !Array.isArray(record.times)
      ? record.times as Record<string, unknown> : {}
    return {
      fuerza: typeof record.fuerza === "string" ? record.fuerza : "",
      cardio: typeof record.cardio === "string" ? record.cardio : "",
      movilidad: typeof record.movilidad === "string" ? record.movilidad : "",
      hiit: typeof record.hiit === "string" ? record.hiit : "",
      times: Object.fromEntries(ROUTINE_TYPES.filter((type) => typeof times[type] === "string").map((type) => [type, times[type]])) as Partial<Record<RoutineType, string>>,
    }
  } catch {
    return { ...emptyTemplate(), fuerza: value }
  }
}

export function routineSnapshot(templates: Record<number, RoutineTemplate>) {
  return Object.fromEntries(Object.entries(templates).map(([day, template]) => [day, ROUTINE_TYPES.filter((type) => template[type].trim())]))
}

function isSnapshot(value: unknown): value is Record<string, string[]> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function trainingStats(history: HealthHistory, period: TrainingPeriod, today = new Date()) {
  return trainingStatsForRange(history, healthDateRange(period, 0, today), today)
}

export function trainingStatsForRange(history: HealthHistory, range: HealthDateRange, today = new Date()) {
  const todayString = formatDateToLocalString(today)
  const from = range.start
  const plannedEnd = range.end
  const actualEnd = range.end < todayString ? range.end : todayString
  const completedRows = history.routine.filter((row) => row.completed && row.date >= from && row.date <= actualEnd)
  const expectedWeeks: string[] = []
  if (range.unit === "month") {
    const first = new Date(`${from}T00:00:00`)
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
    for (let cursor = first; formatDateToLocalString(cursor) <= actualEnd; cursor.setDate(cursor.getDate() + 7)) expectedWeeks.push(formatDateToLocalString(cursor))
  } else {
    const first = new Date(`${from}T00:00:00`)
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
    expectedWeeks.push(formatDateToLocalString(first))
  }
  const snapshotsComplete = expectedWeeks.every((start) => history.plans.some((plan) => plan.week_start === start && isSnapshot(plan.planned_routines) && Object.keys(plan.planned_routines).length > 0))
  const results = ROUTINE_TYPES.map((type) => {
    const completed = new Set(completedRows.filter((row) => row.routine_type === type).map((row) => row.date)).size
    let planned = 0
    for (const plan of history.plans) {
      const snapshot = plan.planned_routines
      if (!isSnapshot(snapshot)) continue
      for (const [day, types] of Object.entries(snapshot)) {
        if (!Array.isArray(types)) continue
        const date = getDateForWeekdayNum(plan.week_start, Number(day))
        if (date >= from && date <= plannedEnd && types.includes(type)) planned++
      }
    }
    return { type, completed, planned: snapshotsComplete ? planned : null, percent: snapshotsComplete && planned > 0 ? Math.min(100, Math.round(completed / planned * 100)) : null }
  })
  const completedTypesByDate = new Map<string, Set<string>>()
  for (const row of completedRows) {
    const types = completedTypesByDate.get(row.date) || new Set<string>()
    types.add(row.routine_type)
    completedTypesByDate.set(row.date, types)
  }
  const plannedDays = new Set<string>()
  const completedPlannedDays = new Set<string>()
  for (const plan of history.plans) {
    if (!isSnapshot(plan.planned_routines)) continue
    for (const [day, types] of Object.entries(plan.planned_routines)) {
      if (!Array.isArray(types) || !types.length) continue
      const date = getDateForWeekdayNum(plan.week_start, Number(day))
      if (date >= from && date <= plannedEnd) {
        plannedDays.add(date)
        if (types.every((type) => completedTypesByDate.get(date)?.has(type))) completedPlannedDays.add(date)
      }
    }
  }
  const completedDays = snapshotsComplete ? completedPlannedDays.size : completedTypesByDate.size
  return { byType: results, completedDays, plannedDays: snapshotsComplete ? plannedDays.size : null, percent: snapshotsComplete && plannedDays.size ? Math.min(100, Math.round(completedDays / plannedDays.size * 100)) : null }
}
