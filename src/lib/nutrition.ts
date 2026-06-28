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

export type NutritionResponse = {
  totalCalories: number
  meals: NutritionMeal[]
}

type RawNutritionMeal = {
  meal_type?: unknown
  description?: unknown
  estimated_calories?: unknown
  confidence?: unknown
  portion_assumption?: unknown
}

type RawNutritionPayload = {
  totalCalories?: unknown
  meals?: unknown
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
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

const applyRealisticCalorieFloor = (meal: NutritionMeal): NutritionMeal => {
  const text = meal.description.toLowerCase()
  let floor = 0

  if (text.includes("pollo a la brasa")) floor = Math.max(floor, 850)
  if (text.includes("arroz con pollo")) floor = Math.max(floor, 650)
  if (text.includes("papa a la huanca") || text.includes("huancaína") || text.includes("huancaina")) floor = Math.max(floor, 300)

  if (
    text.includes("arroz con pollo") &&
    (text.includes("papa a la huanca") || text.includes("huancaína") || text.includes("huancaina"))
  ) {
    floor = Math.max(floor, 950)
  }

  if (text.includes("lomo saltado")) floor = Math.max(floor, 850)
  if (text.includes("tallarín") || text.includes("tallarin")) floor = Math.max(floor, 650)
  if (text.includes("chaufa")) floor = Math.max(floor, 700)
  if (text.includes("tamal")) floor = Math.max(floor, 320)
  if (text.includes("jugo") && !text.includes("sin azúcar") && !text.includes("sin azucar")) floor = Math.max(floor, 120)
  if (text.includes("pringles") || text.includes("papitas") || text.includes("snack")) floor = Math.max(floor, 250)
  if (text.includes("tortilla de huevo")) floor = Math.max(floor, 160)
  if (text.includes("tortilla de maíz") || text.includes("tortilla de maiz")) floor = Math.max(floor, 60)

  if (floor > 0 && meal.estimated_calories < floor) {
    return {
      ...meal,
      estimated_calories: floor,
      confidence: meal.confidence || "medium",
      portion_assumption: meal.portion_assumption || "Porción peruana promedio ajustada por piso calórico",
    }
  }

  return meal
}

export const sanitizeNutritionResponse = (value: unknown): NutritionResponse => {
  const payload: RawNutritionPayload = isRecord(value) ? value : {}
  const rawMeals = Array.isArray(payload.meals) ? payload.meals : []

  const meals = rawMeals.flatMap((item) => {
    const mealItem: RawNutritionMeal = isRecord(item) ? item : {}
    const description = String(mealItem.description || "").trim()
    const estimatedCalories = Math.max(0, Math.round(Number(mealItem.estimated_calories || 0)))

    if (!description || estimatedCalories <= 0) return []

    return applyRealisticCalorieFloor({
      meal_type: normalizeMealType(mealItem.meal_type),
      description,
      estimated_calories: estimatedCalories,
      confidence: normalizeConfidence(mealItem.confidence),
      portion_assumption: String(mealItem.portion_assumption || "Porcion promedio").trim(),
    })
  })

  const calculatedTotal = meals.reduce((sum, item) => sum + item.estimated_calories, 0)
  const fallbackTotal = Math.max(0, Math.round(Number(payload.totalCalories || 0)))

  return {
    totalCalories: calculatedTotal > 0 ? calculatedTotal : fallbackTotal,
    meals,
  }
}
