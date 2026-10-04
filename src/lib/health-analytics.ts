import { formatDateToLocalString, getDateForWeekdayNum } from "@/lib/date"
import { healthDateRange, inHealthRange, type HealthDateRange } from "@/lib/health-periods"

export type HealthPeriod = 4 | 8 | 12 | 26
export type HealthChartMode = "weight" | "energy" | "activity" | "calories"
export type NutritionPeriod = "today" | "week" | "month"

export type WeightGoal = {
  id: string
  start_date: string
  start_weight_kg: number
  target_weight_kg: number
  target_date: string
}

export type HealthHistory = {
  body: { date: string; created_at?: string; weight_kg: number | null; energy_level: number | null }[]
  tracker: { date: string; calories_ingested: number; is_workout_day: boolean; water_ingested_liters: number; water_target_liters: number | null }[]
  water: { date: string; amount_liters: number }[]
  routine: { date: string; week_start: string; dia_semana: number; routine_type: string; completed: boolean }[]
  plans: { week_start: string; planned_days: number[]; planned_routines: unknown }[]
}

export type NutritionHistory = {
  meals: {
    id: string
    date: string
    created_at: string
    meal_type: string
    meal_description: string
    estimated_calories: number
    portion_assumption: string | null
    food_breakdown: unknown
    protein_g: number | null
    carbs_g: number | null
    fat_g: number | null
  }[]
  tracker: { date: string; calorie_target: number; calories_ingested: number; calorie_manual_adjustment: number }[]
}

export function dateDaysAgo(days: number, today = new Date()) {
  const date = new Date(today)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return formatDateToLocalString(date)
}

export function nutritionStart(period: NutritionPeriod, today = new Date()) {
  if (period === "today") return formatDateToLocalString(today)
  if (period === "week") {
    const weekday = (today.getDay() + 6) % 7
    return dateDaysAgo(weekday, today)
  }
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
}

export function chartSeries(history: HealthHistory, mode: HealthChartMode, weeks: HealthPeriod, today = new Date(), nutrition?: NutritionHistory) {
  const from = dateDaysAgo(weeks * 7, today)
  if (mode === "weight" || mode === "energy") {
    return history.body
      .filter((row) => row.date >= from)
      .map((row) => ({ date: row.date, value: mode === "weight" ? row.weight_kg : row.energy_level }))
      .filter((point): point is { date: string; value: number } => point.value !== null)
  }
  if (mode === "calories") {
    if (!nutrition) return []
    const dates = [...new Set([...nutrition.meals.map((row) => row.date), ...nutrition.tracker.map((row) => row.date)])].filter((date) => date >= from).sort()
    return dates.map((date) => ({ date, value: nutritionTotals({ meals: nutrition.meals.filter((row) => row.date === date), tracker: nutrition.tracker.filter((row) => row.date === date) }).calories }))
  }
  const activeDates = new Set(history.routine.filter((row) => row.completed).map((row) => row.date))
  if (!activeDates.size) return []
  return Array.from({ length: weeks }, (_, index) => {
    const monday = new Date(`${dateDaysAgo((weeks - index - 1) * 7, today)}T00:00:00`)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    const start = formatDateToLocalString(monday)
    monday.setDate(monday.getDate() + 6)
    const end = formatDateToLocalString(monday)
    return { date: start, value: [...activeDates].filter((date) => date >= start && date <= end).length }
  })
}

export function weightProgress(current: number | null, previous: number | null, goal: WeightGoal | null) {
  const change = current === null || previous === null ? null : Number((current - previous).toFixed(1))
  const remaining = current === null || goal === null ? null : Number((goal.target_weight_kg - current).toFixed(1))
  const total = goal === null ? 0 : Math.abs(goal.start_weight_kg - goal.target_weight_kg)
  const progress = current === null || goal === null || total === 0
    ? null
    : Math.min(100, Math.max(0, Math.round(
      (goal.target_weight_kg < goal.start_weight_kg
        ? goal.start_weight_kg - current
        : current - goal.start_weight_kg) / total * 100
    )))
  return { change, remaining, progress }
}

export function weightGoalStatus(current: number | null, goal: WeightGoal | null, today = formatDateToLocalString(new Date())) {
  if (!goal) return "Sin meta"
  if (current !== null && (goal.target_weight_kg < goal.start_weight_kg ? current <= goal.target_weight_kg : current >= goal.target_weight_kg)) return "Cumplida"
  return goal.target_date < today ? "Vencida" : "Activa"
}

export function streakStats(dates: string[], today = formatDateToLocalString(new Date())) {
  const unique = [...new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today))].sort()
  let best = 0
  let run = 0
  let previous = ""
  for (const date of unique) {
    const yesterday = new Date(`${date}T00:00:00`)
    yesterday.setDate(yesterday.getDate() - 1)
    run = previous === formatDateToLocalString(yesterday) ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }
  const yesterday = dateDaysAgo(1, new Date(`${today}T00:00:00`))
  return { current: previous === today || previous === yesterday ? run : 0, best }
}

export function nutritionTotals(history: NutritionHistory) {
  const mealsByDate = new Map<string, number>()
  for (const meal of history.meals) mealsByDate.set(meal.date, (mealsByDate.get(meal.date) || 0) + Number(meal.estimated_calories))
  const mealCalories = [...mealsByDate.values()].reduce((sum, value) => sum + value, 0)
  const manualCalories = history.tracker.reduce((sum, day) => sum + Number(day.calorie_manual_adjustment), 0)
  const calories = Math.max(0, mealCalories + manualCalories)
  const target = history.tracker.reduce((sum, day) => sum + Number(day.calorie_target), 0)
  const discrepancies = history.tracker.flatMap((day) => {
    const calculated = Math.max(0, (mealsByDate.get(day.date) || 0) + Number(day.calorie_manual_adjustment))
    return Math.abs(Number(day.calories_ingested) - calculated) > 1 ? [{ date: day.date, tracker: Number(day.calories_ingested), calculated }] : []
  })
  const sumMacro = (key: "protein_g" | "carbs_g" | "fat_g") => {
    const known = history.meals.filter((meal) => meal[key] !== null)
    return {
      grams: known.length === 0 ? null : Math.round(known.reduce((sum, meal) => sum + Number(meal[key]), 0) * 10) / 10,
      known: known.length,
    }
  }
  const protein = sumMacro("protein_g")
  const carbs = sumMacro("carbs_g")
  const fat = sumMacro("fat_g")
  return {
    calories,
    mealCalories,
    manualCalories,
    discrepancies,
    target,
    percent: target > 0 ? Math.round(calories / target * 100) : null,
    protein: protein.grams,
    carbs: carbs.grams,
    fat: fat.grams,
    proteinKnown: protein.known,
    carbsKnown: carbs.known,
    fatKnown: fat.known,
    mealCount: history.meals.length,
  }
}

export type WaterPeriod = "today" | "week" | "month"

export function waterTotalsForRange(history: HealthHistory, range: HealthDateRange) {
  const rows = history.tracker.filter((row) => inHealthRange(row.date, range))
  const water = history.water.filter((row) => inHealthRange(row.date, range))
  const liters = Math.round(water.reduce((sum, row) => sum + row.amount_liters, 0) * 100) / 100
  const target = Math.round(rows.reduce((sum, row) => sum + (row.water_target_liters || 0), 0) * 100) / 100
  const targetDays = rows.filter((row) => row.water_target_liters !== null && row.water_target_liters > 0).length
  const discrepancies = rows.flatMap((row) => {
    const logged = Math.round(water.filter((event) => event.date === row.date).reduce((sum, event) => sum + event.amount_liters, 0) * 100) / 100
    return Math.abs(row.water_ingested_liters - logged) > 0.01 ? [{ date: row.date, tracker: row.water_ingested_liters, logged }] : []
  })
  return { liters, target, daysRecorded: rows.length, targetDays, percent: target > 0 && targetDays === rows.length ? Math.round(liters / target * 100) : null, discrepancies }
}

export function waterTotals(history: HealthHistory, period: WaterPeriod, today = new Date()) {
  return waterTotalsForRange(history, healthDateRange(period, 0, today))
}

export function selectNutritionRange(history: NutritionHistory, range: HealthDateRange): NutritionHistory {
  return { meals: history.meals.filter((row) => inHealthRange(row.date, range)), tracker: history.tracker.filter((row) => inHealthRange(row.date, range)) }
}

export function selectHealthRange(history: HealthHistory, range: HealthDateRange): HealthHistory {
  return { body: history.body.filter((row) => inHealthRange(row.date, range)), tracker: history.tracker.filter((row) => inHealthRange(row.date, range)), water: history.water.filter((row) => inHealthRange(row.date, range)), routine: history.routine.filter((row) => inHealthRange(row.date, range)), plans: history.plans.filter((row) => row.week_start <= range.end && getDateForWeekdayNum(row.week_start, 7) >= range.start) }
}

export function hydrationReminder(consumedLiters: number, goalLiters: number, hour: number) {
  const remainingMl = Math.max(0, Math.round((goalLiters - consumedLiters) * 1000))
  if (remainingMl === 0) return "Meta de agua alcanzada por hoy."
  const hoursLeft = Math.max(1, 22 - hour)
  const nextHourMl = Math.min(500, Math.ceil(remainingMl / hoursLeft / 50) * 50)
  return hour >= 22
    ? `Quedan ${remainingMl} ml para tu meta diaria. Continúa mañana a tu ritmo.`
    : `Quedan ${remainingMl} ml. Una referencia para la próxima hora es ${nextHourMl} ml, según el tiempo restante del día.`
}
