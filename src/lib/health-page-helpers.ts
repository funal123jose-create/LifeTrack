import { normalizeConfidence, normalizeMealType, type NutritionMeal } from "@/lib/nutrition"
import type { BodyProgressLog, MealLog, RawNutritionMeal, WaterLog } from "@/lib/health-page-models"

export const DAYS_OF_WEEK = [
  { id: "mon", name: "Lunes", num: 1 },
  { id: "tue", name: "Martes", num: 2 },
  { id: "wed", name: "Miércoles", num: 3 },
  { id: "thu", name: "Jueves", num: 4 },
  { id: "fri", name: "Viernes", num: 5 },
  { id: "sat", name: "Sábado", num: 6 },
  { id: "sun", name: "Domingo", num: 7 },
]

export const formatLocalDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "--/--/---- --:--"
  }
}

type RawMealLog = Partial<Record<keyof MealLog, unknown>>
type RawWaterLog = Partial<Record<keyof WaterLog, unknown>>
type RawBodyProgressLog = Partial<Record<keyof BodyProgressLog, unknown>>

export const mapMealLog = (
  item: RawMealLog,
  fallback: Partial<Pick<MealLog, "source" | "meal_type" | "confidence" | "portion_assumption">> = {}
): MealLog => ({
  id: String(item.id || ""),
  meal_description: String(item.meal_description || ""),
  estimated_calories: Number(item.estimated_calories || 0),
  source: String(item.source || fallback.source || "text"),
  meal_type: normalizeMealType(item.meal_type || fallback.meal_type || "other"),
  confidence: normalizeConfidence(item.confidence || fallback.confidence || "medium"),
  portion_assumption: item.portion_assumption !== undefined && item.portion_assumption !== null
    ? String(item.portion_assumption)
    : fallback.portion_assumption || null,
  created_at: String(item.created_at || ""),
})

export const mapWaterLog = (item: RawWaterLog, fallbackAmount = 0): WaterLog => ({
  id: String(item.id || ""),
  amount_liters: Number(item.amount_liters || fallbackAmount),
  source: String(item.source || "manual"),
  created_at: String(item.created_at || ""),
})

export const mapBodyProgressLog = (item: RawBodyProgressLog): BodyProgressLog => ({
  id: String(item.id || ""),
  date: String(item.date || ""),
  weight_kg: item.weight_kg !== null && item.weight_kg !== undefined ? Number(item.weight_kg) : null,
  energy_level: item.energy_level !== null && item.energy_level !== undefined ? Number(item.energy_level) : null,
  notes: item.notes !== null && item.notes !== undefined ? String(item.notes) : null,
  created_at: String(item.created_at || ""),
})

export const mapNutritionMealsFromAI = (items: RawNutritionMeal[]): NutritionMeal[] => {
  return items
    .map((item) => ({
      meal_type: normalizeMealType(String(item.meal_type || "other")),
      description: String(item.description || "").trim(),
      estimated_calories: Math.max(0, Math.round(Number(item.estimated_calories || 0))),
      confidence: normalizeConfidence(String(item.confidence || "medium")),
      portion_assumption: String(item.portion_assumption || "Porción promedio estimada por IA").trim(),
    }))
    .filter((item) => item.description && item.estimated_calories > 0)
}

export const getEstimatedCaloriesFromNutritionResponse = (
  meals: NutritionMeal[],
  fallbackTotalCalories: unknown
) => {
  return meals.length > 0
    ? meals.reduce((sum, item) => sum + item.estimated_calories, 0)
    : Math.max(0, Math.round(Number(fallbackTotalCalories || 0)))
}

export const getDailyHealthMetrics = (
  waterIngested: number,
  caloriesIngested: number,
  isWorkoutDay: boolean,
  bmrTarget: number
) => {
  const currentCalorieTarget = isWorkoutDay ? bmrTarget + 400 : bmrTarget
  const waterGoal = 3

  return {
    currentCalorieTarget,
    waterGoal,
    waterPct: Math.min(Math.round((waterIngested / waterGoal) * 100), 100),
    caloriePct: Math.min(Math.round((caloriesIngested / currentCalorieTarget) * 100), 140),
  }
}
