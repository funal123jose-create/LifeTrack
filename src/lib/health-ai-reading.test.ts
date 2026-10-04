import assert from "node:assert/strict"
import test from "node:test"
import { buildHealthAiSnapshot, createHealthAiPrompt, parseHealthAiText } from "./health-ai-reading"
import type { HealthHistory, NutritionHistory } from "./health-analytics"

const history: HealthHistory = {
  body: [{ date: "2026-10-01", weight_kg: 72, energy_level: null }],
  tracker: [{ date: "2026-10-02", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 1, water_target_liters: 2 }],
  water: [{ date: "2026-10-02", amount_liters: 1 }],
  routine: [{ date: "2026-10-01", week_start: "2026-09-28", dia_semana: 4, routine_type: "fuerza", completed: true }],
  plans: [{ week_start: "2026-09-28", planned_days: [2, 4], planned_routines: { "2": ["cardio"], "4": ["fuerza"] } }],
}
const nutrition: NutritionHistory = {
  meals: [
    { id: "1", date: "2026-10-02", created_at: "", meal_type: "lunch", meal_description: "Almuerzo", estimated_calories: 500, portion_assumption: null, food_breakdown: null, protein_g: 25, carbs_g: null, fat_g: null },
    { id: "2", date: "2026-10-02", created_at: "", meal_type: "snack", meal_description: "Fruta", estimated_calories: 100, portion_assumption: null, food_breakdown: null, protein_g: null, carbs_g: null, fat_g: null },
  ],
  tracker: [{ date: "2026-10-02", calorie_target: 2000, calories_ingested: 600, calorie_manual_adjustment: 0 }],
}

test("la lectura resume datos reales y deja explícita la cobertura incompleta", () => {
  const snapshot = buildHealthAiSnapshot(history, nutrition, null, "2026-10-02", 2.5)
  const today = snapshot.days.find((day) => day.date === "2026-10-02")
  const yesterday = snapshot.days.find((day) => day.date === "2026-10-01")
  assert.equal(today?.caloriesEstimated, 600)
  assert.equal(today?.proteinEstimatedGrams, 25)
  assert.equal(today?.proteinKnownMeals, 1)
  assert.equal(today?.waterLoggedLiters, 1)
  assert.equal(today?.waterGoalLiters, 2)
  assert.equal(yesterday?.caloriesEstimated, null)
  assert.equal(yesterday?.waterLoggedLiters, null)
  assert.equal(yesterday?.waterGoalLiters, null)
  assert.equal(snapshot.currentWeek.workoutsCompletedDays, 1)
  assert.equal(snapshot.currentWeek.workoutsPlannedDays, 2)
  assert.equal(snapshot.limitations.deficitCalorieGoalConfigured, false)
  assert.match(createHealthAiPrompt(snapshot), /No afirmes que existe déficit calórico/)
})

test("la respuesta de Gemini exige cuatro textos breves", () => {
  assert.deepEqual(parseHealthAiText('{"avance":"A","atencion":"B","recomendacion":"C","limite":"D"}'), { avance: "A", atencion: "B", recomendacion: "C", limite: "D" })
  assert.throws(() => parseHealthAiText('{"avance":"A"}'))
  assert.throws(() => parseHealthAiText(JSON.stringify({ avance: "A".repeat(501), atencion: "B", recomendacion: "C", limite: "D" })))
})
