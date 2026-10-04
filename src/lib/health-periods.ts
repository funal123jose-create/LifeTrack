import { formatDateToLocalString } from "@/lib/date"

export type HealthPeriodUnit = "today" | "week" | "month"
export type HealthDateRange = { start: string; end: string; label: string; unit: HealthPeriodUnit; offset: number }

function startOfPeriod(unit: HealthPeriodUnit, anchor: Date) {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
  if (unit === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  if (unit === "month") start.setDate(1)
  return start
}

function shiftPeriod(unit: HealthPeriodUnit, anchor: Date, offset: number) {
  const shifted = new Date(anchor)
  if (unit === "today") shifted.setDate(shifted.getDate() - offset)
  if (unit === "week") shifted.setDate(shifted.getDate() - offset * 7)
  if (unit === "month") shifted.setMonth(shifted.getMonth() - offset)
  return shifted
}

export function healthDateRange(unit: HealthPeriodUnit, offset = 0, today = new Date()): HealthDateRange {
  const start = shiftPeriod(unit, startOfPeriod(unit, today), offset)
  const end = new Date(start)
  if (unit === "week") end.setDate(end.getDate() + 6)
  if (unit === "month") end.setMonth(end.getMonth() + 1, 0)
  const label = unit === "today"
    ? offset === 0 ? "Hoy" : offset === 1 ? "Ayer" : formatDateToLocalString(start)
    : unit === "week"
      ? offset === 0 ? "Esta semana" : offset === 1 ? "Semana anterior" : `Hace ${offset} semanas`
      : offset === 0 ? "Este mes" : start.toLocaleDateString("es-CO", { month: "long", year: "numeric" })
  return { start: formatDateToLocalString(start), end: formatDateToLocalString(end), label, unit, offset }
}

export function comparablePreviousRange(range: HealthDateRange, today = new Date()): HealthDateRange {
  const previous = healthDateRange(range.unit, range.offset + 1, today)
  if (range.offset !== 0 || range.unit === "today") return previous
  const elapsedDays = Math.floor((new Date(`${formatDateToLocalString(today)}T12:00:00`).getTime() - new Date(`${range.start}T12:00:00`).getTime()) / 86400000)
  const end = new Date(`${previous.start}T12:00:00`)
  end.setDate(end.getDate() + elapsedDays)
  previous.end = previous.end < formatDateToLocalString(end) ? previous.end : formatDateToLocalString(end)
  previous.label += " (mismo tramo)"
  return previous
}

export function inHealthRange(date: string, range: HealthDateRange) {
  return date >= range.start && date <= range.end
}
