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
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  foods?: NutritionFood[]
}

export type NutritionFood = {
  name: string
  portion: string
  estimated_grams: number | null
  estimated_calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
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
  protein_g?: unknown
  carbs_g?: unknown
  fat_g?: unknown
  foods?: unknown
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

const sanitizeMacro = (value: unknown) => {
  if (value === null || value === undefined) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 && amount <= 1000
    ? Math.round(amount * 10) / 10
    : null
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

const sanitizeFoods = (value: unknown): NutritionFood[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const name = String(item.name || "").trim().slice(0, 120)
    const portion = String(item.portion || "").trim().slice(0, 120)
    if (!name || !portion) return []
    return [{
      name,
      portion,
      estimated_grams: sanitizeMacro(item.estimated_grams),
      estimated_calories: sanitizeMacro(item.estimated_calories),
      protein_g: sanitizeMacro(item.protein_g),
      carbs_g: sanitizeMacro(item.carbs_g),
      fat_g: sanitizeMacro(item.fat_g),
    }]
  })
}

export const sanitizeNutritionResponse = (value: unknown): NutritionResponse => {
  const payload: RawNutritionPayload = isRecord(value) ? value : {}
  const rawMeals = Array.isArray(payload.meals) ? payload.meals : []

  const meals = rawMeals.flatMap((item) => {
    const mealItem: RawNutritionMeal = isRecord(item) ? item : {}
    const description = String(mealItem.description || "").trim()
    const estimatedCalories = Math.max(0, Math.round(Number(mealItem.estimated_calories || 0)))

    if (!description || estimatedCalories <= 0) return []

    const foods = sanitizeFoods(mealItem.foods)
    const macroFromFoods = (key: "protein_g" | "carbs_g" | "fat_g") =>
      foods.length && foods.every((food) => food[key] !== null)
        ? Math.round(foods.reduce((sum, food) => sum + Number(food[key]), 0) * 10) / 10
        : null

    return [{
      meal_type: normalizeMealType(mealItem.meal_type),
      description,
      estimated_calories: estimatedCalories,
      confidence: normalizeConfidence(mealItem.confidence),
      portion_assumption: String(mealItem.portion_assumption || "Porcion promedio").trim(),
      protein_g: macroFromFoods("protein_g") ?? sanitizeMacro(mealItem.protein_g),
      carbs_g: macroFromFoods("carbs_g") ?? sanitizeMacro(mealItem.carbs_g),
      fat_g: macroFromFoods("fat_g") ?? sanitizeMacro(mealItem.fat_g),
      foods,
    }]
  })

  const calculatedTotal = meals.reduce((sum, item) => sum + item.estimated_calories, 0)
  const fallbackTotal = Math.max(0, Math.round(Number(payload.totalCalories || 0)))

  return {
    totalCalories: calculatedTotal > 0 ? calculatedTotal : fallbackTotal,
    meals,
  }
}
