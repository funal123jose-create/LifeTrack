import type { Database } from "@/types/database"

export type CalendarStatus = "empty" | "pending" | "partial" | "completed" | "highlight"

export type CalendarPillar = "health" | "career" | "care" | "general"

export type CalendarEvent = {
  id: string
  date: string
  title: string
  description: string
  status: CalendarStatus
  pillar: CalendarPillar
  source: string
  metric?: string
}

export type CalendarDay = {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  status: CalendarStatus
  completionRate: number
  events: CalendarEvent[]
}

export type CalendarMonth = {
  key: string
  label: string
  startDate: string
  endDate: string
  days: CalendarDay[]
}

export type CalendarStats = {
  completedDays: number
  partialDays: number
  pendingDays: number
  activeDays: number
  totalEvents: number
  completionRate: number
  currentStreak: number
  bestDay: CalendarDay | null
  nextObjective: CalendarDay | null
}

type HabitLogRow = Database["public"]["Tables"]["habit_logs"]["Row"]
type CalendarEventRow = Database["public"]["Tables"]["calendar_events"]["Row"]
type HealthRoutineRow = Database["public"]["Tables"]["health_routine_completions"]["Row"]
type MealLogRow = Database["public"]["Tables"]["meal_logs"]["Row"]
type WaterLogRow = Database["public"]["Tables"]["water_logs"]["Row"]
type BodyProgressRow = Database["public"]["Tables"]["body_progress_logs"]["Row"]
type PersonalCareDailyRow = Database["public"]["Tables"]["personal_care_daily_logs"]["Row"]
type PersonalCareRoutineRow = Database["public"]["Tables"]["personal_care_routine_completions"]["Row"]

const monthFormatter = new Intl.DateTimeFormat("es-PE", {
  month: "long",
  year: "numeric",
})

const weekdayFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "short",
})

const numberFormatter = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 1,
})

export const WEEKDAY_LABELS = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 0, 5 + index)
  return weekdayFormatter.format(date).replace(".", "").slice(0, 3)
})

export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`
}

export function getMonthLabel(date: Date) {
  const label = monthFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function getCalendarRange(monthDate: Date) {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const startsOnMondayIndex = (firstDayOfMonth.getDay() + 6) % 7
  const visibleStart = new Date(firstDayOfMonth)
  visibleStart.setDate(firstDayOfMonth.getDate() - startsOnMondayIndex)

  const visibleEnd = new Date(visibleStart)
  visibleEnd.setDate(visibleStart.getDate() + 41)

  return {
    firstDayOfMonth,
    lastDayOfMonth,
    visibleStart,
    visibleEnd,
    startDate: toDateKey(visibleStart),
    endDate: toDateKey(visibleEnd),
  }
}

function normalizeStatus(status: string | null | undefined): CalendarStatus {
  const lowerStatus = status?.toLowerCase()
  if (lowerStatus === "completed" || lowerStatus === "done") return "completed"
  if (lowerStatus === "partial" || lowerStatus === "in_progress") return "partial"
  if (lowerStatus === "missed" || lowerStatus === "pending") return "pending"
  return "highlight"
}

function resolveDayStatus(events: CalendarEvent[]): CalendarStatus {
  if (events.length === 0) return "empty"
  if (events.some((event) => event.status === "completed")) return "completed"
  if (events.some((event) => event.status === "partial" || event.status === "highlight")) return "partial"
  return "pending"
}

function resolveCompletionRate(events: CalendarEvent[]) {
  if (events.length === 0) return 0

  const points = events.reduce((total, event) => {
    if (event.status === "completed") return total + 1
    if (event.status === "partial" || event.status === "highlight") return total + 0.5
    return total
  }, 0)

  return Math.round((points / events.length) * 100)
}

export function mapHabitLogs(rows: HabitLogRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `habit-${row.id}`,
    date: row.log_date,
    title: "Habito registrado",
    description: row.notes || `Estado del habito: ${row.status}.`,
    status: normalizeStatus(row.status),
    pillar: "general",
    source: "Habito",
    metric: row.value !== null ? numberFormatter.format(row.value) : undefined,
  }))
}

export function mapCalendarEvents(rows: CalendarEventRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `calendar-${row.id}`,
    date: row.event_date,
    title: row.title,
    description: row.description || "Evento planificado en el calendario.",
    status: normalizeStatus(row.status),
    pillar: "general",
    source: "Evento",
    metric: row.start_time || undefined,
  }))
}

export function mapHealthRoutineRows(rows: HealthRoutineRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `health-routine-${row.id}`,
    date: row.date,
    title: row.completed ? "Rutina de salud completada" : "Rutina de salud pendiente",
    description: `Rutina ${row.routine_type} del dia ${row.dia_semana}.`,
    status: row.completed ? "completed" : "pending",
    pillar: "health",
    source: "Salud",
    metric: row.completed ? "Completada" : "Pendiente",
  }))
}

export function mapMealRows(rows: MealLogRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `meal-${row.id}`,
    date: row.date,
    title: `Comida: ${row.meal_type}`,
    description: row.meal_description,
    status: "highlight",
    pillar: "health",
    source: "Nutricion",
    metric: `${numberFormatter.format(row.estimated_calories)} kcal`,
  }))
}

export function mapWaterRows(rows: WaterLogRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `water-${row.id}`,
    date: row.date,
    title: "Hidratacion",
    description: `Registro desde ${row.source}.`,
    status: "highlight",
    pillar: "health",
    source: "Agua",
    metric: `${numberFormatter.format(row.amount_liters)} L`,
  }))
}

export function mapBodyRows(rows: BodyProgressRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `body-${row.id}`,
    date: row.date,
    title: "Progreso corporal",
    description: row.notes || "Registro fisico agregado.",
    status: "highlight",
    pillar: "health",
    source: "Fisico",
    metric: row.weight_kg ? `${numberFormatter.format(row.weight_kg)} kg` : undefined,
  }))
}

export function mapPersonalCareDailyRows(rows: PersonalCareDailyRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `care-daily-${row.id}`,
    date: row.date,
    title: "Check-in personal",
    description:
      row.reflection ||
      row.gratitude_note ||
      row.improvement_note ||
      "Registro de animo, estres, motivacion y descanso.",
    status: "partial",
    pillar: "care",
    source: "Cuidado",
    metric: row.mood_level ? `Animo ${row.mood_level}/10` : undefined,
  }))
}

export function mapPersonalCareRoutineRows(rows: PersonalCareRoutineRow[]): CalendarEvent[] {
  return rows.map((row) => ({
    id: `care-routine-${row.id}`,
    date: row.date,
    title: row.completed ? "Rutina personal completada" : "Rutina personal pendiente",
    description: "Movimiento asociado a una rutina de cuidado personal.",
    status: row.completed ? "completed" : "pending",
    pillar: "care",
    source: "Cuidado",
    metric: row.completed ? "Completada" : "Pendiente",
  }))
}

export function buildCalendarMonth(monthDate: Date, events: CalendarEvent[]): CalendarMonth {
  const range = getCalendarRange(monthDate)
  const todayKey = toDateKey(new Date())
  const eventMap = events.reduce<Map<string, CalendarEvent[]>>((map, event) => {
    const currentEvents = map.get(event.date) ?? []
    currentEvents.push(event)
    map.set(event.date, currentEvents)
    return map
  }, new Map())

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(range.visibleStart)
    date.setDate(range.visibleStart.getDate() + index)
    const dateKey = toDateKey(date)
    const dayEvents = eventMap.get(dateKey) ?? []

    return {
      date: dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: dateKey === todayKey,
      status: resolveDayStatus(dayEvents),
      completionRate: resolveCompletionRate(dayEvents),
      events: dayEvents,
    }
  })

  return {
    key: getMonthKey(monthDate),
    label: getMonthLabel(monthDate),
    startDate: range.startDate,
    endDate: range.endDate,
    days,
  }
}

export function getCalendarStats(days: CalendarDay[]): CalendarStats {
  const monthDays = days.filter((day) => day.isCurrentMonth)
  const activeDays = monthDays.filter((day) => day.events.length > 0)
  const completedDays = monthDays.filter((day) => day.status === "completed").length
  const partialDays = monthDays.filter((day) => day.status === "partial" || day.status === "highlight").length
  const pendingDays = monthDays.filter((day) => day.status === "pending").length
  const totalEvents = monthDays.reduce((total, day) => total + day.events.length, 0)
  const todayKey = toDateKey(new Date())
  const todayIndex = monthDays.findIndex((day) => day.date === todayKey)
  const streakSource = todayIndex >= 0 ? monthDays.slice(0, todayIndex + 1) : monthDays
  const currentStreak = [...streakSource]
    .reverse()
    .reduce<{ active: boolean; count: number }>(
      (result, day) => {
        if (!result.active) return result
        if (day.status === "completed" || day.status === "partial" || day.status === "highlight") {
          return { active: true, count: result.count + 1 }
        }

        return { active: false, count: result.count }
      },
      { active: true, count: 0 }
    ).count
  const bestDay = activeDays.reduce<CalendarDay | null>((best, day) => {
    if (!best) return day
    if (day.completionRate > best.completionRate) return day
    if (day.completionRate === best.completionRate && day.events.length > best.events.length) return day
    return best
  }, null)
  const nextObjective =
    monthDays.find((day) => day.date >= todayKey && (day.status === "empty" || day.status === "pending")) ??
    monthDays.find((day) => day.status === "empty" || day.status === "pending") ??
    null
  const completionRate =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((total, day) => total + day.completionRate, 0) / activeDays.length)
      : 0

  return {
    completedDays,
    partialDays,
    pendingDays,
    activeDays: activeDays.length,
    totalEvents,
    completionRate,
    currentStreak,
    bestDay,
    nextObjective,
  }
}
