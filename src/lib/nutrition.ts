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

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
  pre_workout: "Pre-entreno",
  post_workout: "Post-entreno",
  other: "Otro",
}

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: "Confianza baja",
  medium: "Confianza media",
  high: "Confianza alta",
}

const CONFIDENCE_CLASSES: Record<ConfidenceLevel, string> = {
  low: "border-amber-300/10 bg-amber-500/[0.07] text-amber-300/85",
  medium: "border-blue-300/10 bg-blue-500/[0.07] text-blue-300/85",
  high: "border-emerald-300/10 bg-emerald-500/[0.07] text-emerald-300/85",
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
  return MEAL_TYPE_LABELS[normalizeMealType(mealType)]
}

export const getConfidenceLabel = (confidence: string) => {
  return CONFIDENCE_LABELS[normalizeConfidence(confidence)]
}

export const getConfidenceClass = (confidence: string) => {
  return CONFIDENCE_CLASSES[normalizeConfidence(confidence)]
}
