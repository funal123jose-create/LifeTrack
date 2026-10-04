import type { PersonalCareCompletion, PersonalCareRoutine } from "@/lib/personal-care-page-models"

export type CareLog = {
  date: string
  mood_level: number | null
  stress_level: number | null
  motivation_level: number | null
  sleep_quality: number | null
}

export type CarePeriod =
  | { kind: "today" | "week" | "month" | "year"; anchor: string }
  | { kind: "range"; start: string; end: string }

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const localDate = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`)
const average = (values: Array<number | null>) => {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null
}
const pct = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function carePeriodBounds(period: CarePeriod) {
  if (period.kind === "range") return period.start <= period.end ? { start: period.start, end: period.end } : { start: period.end, end: period.start }
  const date = localDate(period.anchor)
  if (period.kind === "today") return { start: dateKey(date), end: dateKey(date) }
  if (period.kind === "week") {
    date.setDate(date.getDate() - (date.getDay() + 6) % 7)
    const start = dateKey(date)
    date.setDate(date.getDate() + 6)
    return { start, end: dateKey(date) }
  }
  if (period.kind === "month") return { start: dateKey(new Date(date.getFullYear(), date.getMonth(), 1)), end: dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)) }
  return { start: `${date.getFullYear()}-01-01`, end: `${date.getFullYear()}-12-31` }
}

function daysThrough(start: string, end: string, today: string) {
  const limit = end < today ? end : today
  if (limit < start) return 0
  const first = localDate(start)
  const last = localDate(limit)
  return Math.round((last.getTime() - first.getTime()) / 86400000) + 1
}

export function analyzePersonalCare(logs: CareLog[], completions: PersonalCareCompletion[], routines: PersonalCareRoutine[], period: CarePeriod, today: string) {
  const bounds = carePeriodBounds(period)
  const periodLogs = [...logs].filter((log) => log.date >= bounds.start && log.date <= bounds.end).sort((a, b) => a.date.localeCompare(b.date))
  const periodCompletions = completions.filter((item) => item.completed && item.date >= bounds.start && item.date <= bounds.end)
  const latest = periodLogs.at(-1) || null
  const mood = average(periodLogs.map((log) => log.mood_level))
  const stress = average(periodLogs.map((log) => log.stress_level))
  const motivation = average(periodLogs.map((log) => log.motivation_level))
  const sleep = average(periodLogs.map((log) => log.sleep_quality))
  const elapsedDays = daysThrough(bounds.start, bounds.end, today)
  const logCoverage = elapsedDays ? pct(periodLogs.length / elapsedDays * 100) : null
  const components = {
    emotional: mood === null || motivation === null ? null : pct((mood + motivation) * 5),
    sleep: sleep === null ? null : pct(sleep * 10),
    stress: stress === null ? null : pct((11 - stress) * 10),
    consistency: logCoverage,
  }
  const componentValues = Object.values(components).filter((value): value is number => value !== null)
  const score = periodLogs.length && componentValues.length ? pct(componentValues.reduce((sum, value) => sum + value, 0) / componentValues.length) : null
  const activeRoutines = routines.filter((routine) => routine.active)
  const completedTodayIds = new Set(completions.filter((item) => item.completed && item.date === today).map((item) => item.routine_id))
  const completedToday = activeRoutines.filter((routine) => completedTodayIds.has(routine.id)).length
  const completionDays = new Set(periodCompletions.map((item) => item.date)).size
  const daily = periodLogs.map((log) => ({ date: log.date, label: log.date.slice(5), mood: log.mood_level, stress: log.stress_level, sleep: log.sleep_quality }))
  const insight = !periodLogs.length
    ? "Aún no hay check-ins en este período. Registra cómo te sientes para observar tendencias personales."
    : `Registraste ${periodLogs.length} check-in${periodLogs.length === 1 ? "" : "s"} en ${elapsedDays} día${elapsedDays === 1 ? "" : "s"} transcurrido${elapsedDays === 1 ? "" : "s"}. ${mood !== null ? `Ánimo medio: ${mood.toFixed(1)}/10. ` : ""}${stress !== null ? `Estrés medio: ${stress.toFixed(1)}/10. ` : ""}${sleep !== null ? `Calidad del sueño: ${sleep.toFixed(1)}/10. ` : ""}${periodCompletions.length} rutinas completadas en ${completionDays} día${completionDays === 1 ? "" : "s"}.${periodLogs.length < 3 && elapsedDays > 1 ? " La muestra es demasiado pequeña para inferir una tendencia." : ""}`
  const recommendation = !periodLogs.length
    ? "Empieza con un check-in breve; no necesitas completar todos los campos narrativos."
    : periodLogs.length < 3 && elapsedDays > 1
      ? "Registra cómo te sientes durante varios días antes de interpretar estos valores como una tendencia."
      : stress !== null && stress >= 7
      ? "Tu estrés registrado es alto en este período. Revisa tus notas y reserva una pausa breve en tu rutina."
      : sleep !== null && sleep <= 5
        ? "La calidad de sueño que reportaste es baja. Observa si tus rutinas de descanso son constantes."
        : logCoverage !== null && logCoverage < 50
          ? "Registra más días para que las tendencias sean más representativas."
          : completionDays === 0 && activeRoutines.length > 0
            ? "Elige una rutina pequeña para empezar a construir constancia."
            : "Mantén tus registros y revisa cómo cambian ánimo, estrés y descanso con el tiempo."
  return { bounds, periodLogs, periodCompletions, latest, mood, stress, motivation, sleep, elapsedDays, logCoverage, components, score, activeRoutines, completedTodayIds, completedToday, completionDays, daily, insight, recommendation }
}
