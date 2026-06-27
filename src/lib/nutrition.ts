export const ALLOWED_MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
  "other",
] as const

export type MealType = typeof ALLOWED_MEAL_TYPES[number]
export type ConfidenceLevel = "low" | "medium" | "high"

export type NutritionMeal = {
  meal_type: MealType
  description: string
  estimated_calories: number
  confidence?: ConfidenceLevel
  portion_assumption?: string | null
}

export const normalizeMealType = (value: unknown): MealType => {
  const raw = String(value || "").toLowerCase().trim()

  if (ALLOWED_MEAL_TYPES.includes(raw as MealType)) {
    return raw as MealType
  }

  if (raw.includes("desay")) return "breakfast"
  if (raw.includes("almuerzo") || raw.includes("almorc")) return "lunch"
  if (raw.includes("cena") || raw.includes("noche")) return "dinner"
  if (raw.includes("snack") || raw.includes("merienda") || raw.includes("piqueo")) return "snack"
  if (raw.includes("pre")) return "pre_workout"
  if (raw.includes("post")) return "post_workout"

  return "other"
}

export const normalizeConfidence = (value: unknown): ConfidenceLevel => {
  const raw = String(value || "").toLowerCase().trim()

  if (raw === "high" || raw === "medium" || raw === "low") {
    return raw as ConfidenceLevel
  }

  return "medium"
}

export const getMealTypeLabel = (mealType: string) => {
  const labels: Record<string, string> = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Snack",
    pre_workout: "Pre-entreno",
    post_workout: "Post-entreno",
    other: "Otro",
  }

  return labels[mealType] || "Otro"
}

export const getConfidenceLabel = (confidence: string) => {
  const labels: Record<string, string> = {
    low: "Confianza baja",
    medium: "Confianza media",
    high: "Confianza alta",
  }

  return labels[confidence] || "Confianza media"
}

export const getConfidenceClass = (confidence: string) => {
  if (confidence === "high") return "border-emerald-300/10 bg-emerald-500/[0.07] text-emerald-300/85"
  if (confidence === "low") return "border-amber-300/10 bg-amber-500/[0.07] text-amber-300/85"

  return "border-blue-300/10 bg-blue-500/[0.07] text-blue-300/85"
}
