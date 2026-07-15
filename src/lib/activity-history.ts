import type { Database } from "@/types/database"

export type ActivityPillar = "all" | "health" | "career" | "care"

export type ActivitySource =
  | "project"
  | "meal"
  | "water"
  | "body"
  | "health_routine"
  | "care_checkin"
  | "care_routine"

export type ActivityDateRange = "7d" | "30d" | "all"

export type ActivityEvent = {
  id: string
  pillar: Exclude<ActivityPillar, "all">
  source: ActivitySource
  title: string
  description: string
  occurredAt: string
  metric?: string
  accent: string
  iconLabel: string
}

export type ActivityPillarDefinition = {
  id: ActivityPillar
  label: string
  accent: string
}

export type ActivitySourceDefinition = {
  id: ActivitySource | "all"
  label: string
  pillar?: Exclude<ActivityPillar, "all">
}

export type ActivityStats = {
  total: number
  today: number
  latestLabel: string
  dominantPillar: ActivityPillarDefinition
  distribution: Array<ActivityPillarDefinition & { count: number; percent: number }>
}

export type WeeklyActivityPoint = {
  key: string
  label: string
  count: number
  percent: number
}

export const ACTIVITY_PILLARS: ActivityPillarDefinition[] = [
  { id: "all", label: "Todo", accent: "from-blue-400 to-cyan-300" },
  { id: "health", label: "Salud", accent: "from-emerald-400 to-teal-300" },
  { id: "career", label: "Data/Carrera", accent: "from-orange-400 to-amber-300" },
  { id: "care", label: "Cuidado personal", accent: "from-violet-400 to-fuchsia-300" },
]

export const ACTIVITY_DATE_RANGES: Array<{ id: ActivityDateRange; label: string }> = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "all", label: "Todo" },
]

export const ACTIVITY_SOURCES: ActivitySourceDefinition[] = [
  { id: "all", label: "Todos" },
  { id: "project", label: "Proyectos", pillar: "career" },
  { id: "meal", label: "Comidas", pillar: "health" },
  { id: "water", label: "Agua", pillar: "health" },
  { id: "body", label: "Fisico", pillar: "health" },
  { id: "health_routine", label: "Rutinas salud", pillar: "health" },
  { id: "care_checkin", label: "Check-ins", pillar: "care" },
  { id: "care_routine", label: "Rutinas cuidado", pillar: "care" },
]

type BodyProgressRow = Database["public"]["Tables"]["body_progress_logs"]["Row"]
type HealthRoutineRow = Database["public"]["Tables"]["health_routine_completions"]["Row"]
type MealLogRow = Database["public"]["Tables"]["meal_logs"]["Row"]
type PersonalCareDailyRow = Database["public"]["Tables"]["personal_care_daily_logs"]["Row"]
type PersonalCareRoutineRow = Database["public"]["Tables"]["personal_care_routine_completions"]["Row"]
type ProjectActivityRow = Database["public"]["Tables"]["project_activity_logs"]["Row"]
type WaterLogRow = Database["public"]["Tables"]["water_logs"]["Row"]

const fallbackDateTime = (date: string) => `${date}T12:00:00.000Z`

const safeDateTime = (createdAt: string | null | undefined, date?: string) =>
  createdAt || (date ? fallbackDateTime(date) : new Date(0).toISOString())

const formatNumber = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 1,
})

const activityDateFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "2-digit",
  month: "short",
})

const activityTimeFormatter = new Intl.DateTimeFormat("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
})

const compactWeekdayFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "short",
})

export function getActivityDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function formatActivityDate(value: string) {
  const formatted = activityDateFormatter.format(new Date(value))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatActivityTime(value: string) {
  return activityTimeFormatter.format(new Date(value))
}

export function isInDateRange(event: ActivityEvent, range: ActivityDateRange) {
  if (range === "all") return true

  const days = range === "7d" ? 7 : 30
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))

  return new Date(event.occurredAt).getTime() >= cutoff.getTime()
}

export function sortActivities(events: ActivityEvent[]) {
  return [...events].sort(
    (current, next) =>
      new Date(next.occurredAt).getTime() - new Date(current.occurredAt).getTime()
  )
}

export function groupActivitiesByDate(events: ActivityEvent[]) {
  return sortActivities(events).reduce<Array<{ dateKey: string; label: string; events: ActivityEvent[] }>>(
    (groups, event) => {
      const dateKey = getActivityDayKey(event.occurredAt)
      const existingGroup = groups.find((group) => group.dateKey === dateKey)

      if (existingGroup) {
        existingGroup.events.push(event)
        return groups
      }

      groups.push({
        dateKey,
        label: formatActivityDate(event.occurredAt),
        events: [event],
      })

      return groups
    },
    []
  )
}

export function getWeeklyActivity(events: ActivityEvent[]): WeeklyActivityPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = getActivityDayKey(date.toISOString())
    const label = compactWeekdayFormatter
      .format(date)
      .replace(".", "")
      .slice(0, 3)

    return {
      key,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count: 0,
      percent: 0,
    }
  })

  const dayMap = new Map(days.map((day) => [day.key, day]))

  events.forEach((event) => {
    const day = dayMap.get(getActivityDayKey(event.occurredAt))
    if (day) day.count += 1
  })

  const maxCount = Math.max(...days.map((day) => day.count), 1)

  return days.map((day) => ({
    ...day,
    percent: Math.round((day.count / maxCount) * 100),
  }))
}

export function getActivityStats(events: ActivityEvent[]): ActivityStats {
  const todayKey = getActivityDayKey(new Date().toISOString())
  const activePillars = ACTIVITY_PILLARS.filter(
    (pillar): pillar is ActivityPillarDefinition & { id: Exclude<ActivityPillar, "all"> } =>
      pillar.id !== "all"
  )

  const distribution = activePillars.map((pillar) => {
    const count = events.filter((event) => event.pillar === pillar.id).length
    const percent = events.length > 0 ? Math.round((count / events.length) * 100) : 0

    return { ...pillar, count, percent }
  })

  const dominantPillar =
    distribution.reduce((current, next) => (next.count > current.count ? next : current), distribution[0]) ??
    activePillars[0]

  return {
    total: events.length,
    today: events.filter((event) => getActivityDayKey(event.occurredAt) === todayKey).length,
    latestLabel: events[0] ? formatActivityTime(sortActivities(events)[0].occurredAt) : "Sin registros",
    dominantPillar,
    distribution,
  }
}

export function mapProjectActivityLogs(rows: ProjectActivityRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `project-${row.id}`,
    pillar: "career",
    source: "project",
    title: row.event_title,
    description: row.event_description || `Movimiento registrado en Data/Carrera: ${row.event_type}.`,
    occurredAt: safeDateTime(row.created_at),
    metric: row.new_status || row.new_priority || row.event_type,
    accent: "from-orange-400 to-amber-300",
    iconLabel: "DC",
  }))
}

export function mapMealLogs(rows: MealLogRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `meal-${row.id}`,
    pillar: "health",
    source: "meal",
    title: `Comida registrada: ${row.meal_type}`,
    description: row.meal_description,
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: `${formatNumber.format(row.estimated_calories)} kcal`,
    accent: "from-emerald-400 to-teal-300",
    iconLabel: "AL",
  }))
}

export function mapWaterLogs(rows: WaterLogRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `water-${row.id}`,
    pillar: "health",
    source: "water",
    title: "Hidratacion registrada",
    description: `Entrada de agua desde ${row.source}.`,
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: `${formatNumber.format(row.amount_liters)} L`,
    accent: "from-cyan-400 to-emerald-300",
    iconLabel: "AG",
  }))
}

export function mapBodyProgressLogs(rows: BodyProgressRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `body-${row.id}`,
    pillar: "health",
    source: "body",
    title: "Progreso corporal actualizado",
    description: row.notes || "Registro fisico agregado al seguimiento de salud.",
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: row.weight_kg ? `${formatNumber.format(row.weight_kg)} kg` : undefined,
    accent: "from-emerald-400 to-cyan-300",
    iconLabel: "PC",
  }))
}

export function mapHealthRoutineCompletions(rows: HealthRoutineRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `health-routine-${row.id}`,
    pillar: "health",
    source: "health_routine",
    title: row.completed ? "Rutina de salud completada" : "Rutina de salud pendiente",
    description: `Rutina ${row.routine_type} marcada para el dia ${row.dia_semana}.`,
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: row.completed ? "Completada" : "Pendiente",
    accent: "from-emerald-400 to-lime-300",
    iconLabel: "RS",
  }))
}

export function mapPersonalCareDailyLogs(rows: PersonalCareDailyRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `care-daily-${row.id}`,
    pillar: "care",
    source: "care_checkin",
    title: "Check-in de cuidado personal",
    description:
      row.reflection ||
      row.gratitude_note ||
      row.improvement_note ||
      "Registro diario de animo, estres, motivacion y descanso.",
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: row.mood_level ? `Animo ${row.mood_level}/10` : undefined,
    accent: "from-violet-400 to-fuchsia-300",
    iconLabel: "CP",
  }))
}

export function mapPersonalCareRoutineCompletions(rows: PersonalCareRoutineRow[]): ActivityEvent[] {
  return rows.map((row) => ({
    id: `care-routine-${row.id}`,
    pillar: "care",
    source: "care_routine",
    title: row.completed ? "Rutina personal completada" : "Rutina personal pendiente",
    description: "Movimiento asociado a una rutina de cuidado personal.",
    occurredAt: safeDateTime(row.created_at, row.date),
    metric: row.completed ? "Completada" : "Pendiente",
    accent: "from-violet-400 to-purple-300",
    iconLabel: "RP",
  }))
}
