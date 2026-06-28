import type { ConfidenceLevel, MealType } from "@/lib/nutrition"

export type MealLog = {
  id: string
  meal_description: string
  estimated_calories: number
  source: string
  meal_type: MealType
  confidence: ConfidenceLevel
  portion_assumption: string | null
  created_at: string
}

export type RawNutritionMeal = {
  meal_type?: unknown
  description?: unknown
  estimated_calories?: unknown
  confidence?: unknown
  portion_assumption?: unknown
}

export type WaterLog = {
  id: string
  amount_liters: number
  source: string
  created_at: string
}

export type BodyProgressLog = {
  id: string
  date: string
  weight_kg: number | null
  energy_level: number | null
  notes: string | null
  created_at: string
}

export type RoutineCompletion = {
  date: string
  dia_semana: number
  routine_type: "fuerza" | "cardio"
  completed: boolean
}
