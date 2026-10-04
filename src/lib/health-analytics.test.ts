import assert from "node:assert/strict"
import test from "node:test"
import { chartSeries, hydrationReminder, nutritionTotals, selectNutritionRange, streakStats, waterTotals, weightGoalStatus, weightProgress, type HealthHistory, type NutritionHistory } from "./health-analytics"
import { sanitizeNutritionResponse } from "./nutrition"
import { parseRoutineTemplate, trainingStats, trainingStatsForRange } from "./health-training"
import { deriveHealthInsight, streakDayDetails } from "./health-insights"
import { comparablePreviousRange, healthDateRange } from "./health-periods"

test("racha consecutiva y mejor racha no incluyen dias futuros", () => {
  assert.deepEqual(streakStats(["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-30", "2026-10-01", "2026-10-03"], "2026-10-01"), { current: 2, best: 3 })
  assert.deepEqual(streakStats([], "2026-10-01"), { current: 0, best: 0 })
})

test("la meta de peso progresa en la direccion correcta", () => {
  const goal = { id: "g", start_date: "2026-10-01", start_weight_kg: 80, target_weight_kg: 70, target_date: "2026-11-01" }
  assert.deepEqual(weightProgress(75, 77, goal), { change: -2, remaining: -5, progress: 50 })
  assert.equal(weightProgress(82, 80, goal).progress, 0)
  assert.equal(weightProgress(null, null, goal).progress, null)
  assert.equal(weightGoalStatus(69, goal, "2026-10-15"), "Cumplida")
  assert.equal(weightGoalStatus(75, goal, "2026-11-02"), "Vencida")
})

test("calorias se calculan con comidas y ajuste manual; tracker heredado queda auditado", () => {
  const history: NutritionHistory = {
    meals: [
      { id: "1", date: "2026-10-01", created_at: "", meal_type: "lunch", meal_description: "Comida", estimated_calories: 450, portion_assumption: null, food_breakdown: null, protein_g: 20, carbs_g: 40, fat_g: 18 },
      { id: "2", date: "2026-09-30", created_at: "", meal_type: "dinner", meal_description: "Cena", estimated_calories: 300, portion_assumption: null, food_breakdown: null, protein_g: null, carbs_g: null, fat_g: null },
    ],
    tracker: [{ date: "2026-10-01", calorie_target: 2000, calories_ingested: 500, calorie_manual_adjustment: 50 }],
  }
  const totals = nutritionTotals(history)
  assert.equal(totals.calories, 800)
  assert.equal(totals.mealCalories, 750)
  assert.deepEqual(totals.discrepancies, [])
  assert.equal(totals.target, 2000)
  assert.equal(totals.protein, 20)
  assert.equal(totals.proteinKnown, 1)
  assert.equal(totals.mealCount, 2)
})

test("actividad semanal cuenta fechas unicas de rutinas completadas", () => {
  const history: HealthHistory = {
    body: [], tracker: [], water: [], plans: [],
    routine: [
      { date: "2026-09-29", week_start: "2026-09-28", dia_semana: 2, routine_type: "fuerza", completed: true },
      { date: "2026-09-29", week_start: "2026-09-28", dia_semana: 2, routine_type: "cardio", completed: true },
    ],
  }
  const values = chartSeries(history, "activity", 4, new Date("2026-10-01T12:00:00")).map((point) => point.value)
  assert.equal(values.at(-1), 1)
})

test("macros de Gemini invalidos quedan vacios y no se inventan para historicos", () => {
  const response = sanitizeNutritionResponse({
    totalCalories: 400,
    meals: [{ meal_type: "breakfast", description: "Avena", estimated_calories: 400, protein_g: 15, carbs_g: "sin dato", fat_g: -2 }],
  })
  assert.equal(response.meals[0].protein_g, 15)
  assert.equal(response.meals[0].carbs_g, null)
  assert.equal(response.meals[0].fat_g, null)
})

test("hidratacion usa metas registradas y no inventa metas historicas", () => {
  const history: HealthHistory = {
    body: [], routine: [], plans: [],
    water: [
      { date: "2026-10-01", amount_liters: 1.5 },
      { date: "2026-09-30", amount_liters: 1 },
    ],
    tracker: [
      { date: "2026-10-01", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 1.5, water_target_liters: 2 },
      { date: "2026-09-30", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 1, water_target_liters: null },
    ],
  }
  assert.deepEqual(waterTotals(history, "week", new Date("2026-10-01T12:00:00")), { liters: 2.5, target: 2, daysRecorded: 2, targetDays: 1, percent: null, discrepancies: [] })
  assert.match(hydrationReminder(1, 2, 12), /1000 ml/)
})

test("entrenamiento resume cuatro tipos a partir del plan y cumplimiento", () => {
  const history: HealthHistory = {
    body: [], tracker: [], water: [],
    plans: [{ week_start: "2026-09-28", planned_days: [1, 2], planned_routines: { 1: ["fuerza", "movilidad"], 2: ["cardio", "hiit"] } }],
    routine: [
      { date: "2026-09-28", week_start: "2026-09-28", dia_semana: 1, routine_type: "fuerza", completed: true },
      { date: "2026-09-28", week_start: "2026-09-28", dia_semana: 1, routine_type: "movilidad", completed: true },
    ],
  }
  const stats = trainingStats(history, "week", new Date("2026-10-01T12:00:00"))
  assert.equal(stats.completedDays, 1)
  assert.equal(stats.plannedDays, 2)
  assert.equal(stats.byType.find((item) => item.type === "movilidad")?.percent, 100)
  assert.equal(stats.byType.find((item) => item.type === "hiit")?.percent, 0)
  assert.equal(parseRoutineTemplate("correr 30 min").fuerza, "correr 30 min")
})

test("insight advierte de macros incompletos con base explicita", () => {
  const history: HealthHistory = { body: [], tracker: [], water: [], routine: [], plans: [] }
  const nutrition: NutritionHistory = { meals: [{ id: "1", date: "2026-10-01", created_at: "", meal_type: "lunch", meal_description: "Almuerzo", estimated_calories: 400, portion_assumption: null, food_breakdown: null, protein_g: null, carbs_g: null, fat_g: null }], tracker: [] }
  const result = deriveHealthInsight(history, nutrition, null, trainingStats(history, "week", new Date("2026-10-01T12:00:00")), new Date("2026-10-01T12:00:00"))
  assert.match(result.attention, /total visible es parcial/)
})

test("lectura y detalle de racha usan eventos reales y comparacion equivalente", () => {
  const today = new Date("2026-10-02T12:00:00")
  const history: HealthHistory = {
    body: [
      { date: "2026-08-17", weight_kg: 72, energy_level: null },
      { date: "2026-10-01", weight_kg: 71, energy_level: null },
    ],
    tracker: [
      { date: "2026-09-28", calories_ingested: 0, is_workout_day: true, water_ingested_liters: 2, water_target_liters: 2 },
      { date: "2026-10-01", calories_ingested: 300, is_workout_day: true, water_ingested_liters: 2, water_target_liters: 2 },
    ],
    water: [
      { date: "2026-09-21", amount_liters: 1 },
      { date: "2026-09-28", amount_liters: 2 },
      { date: "2026-10-01", amount_liters: 2 },
    ],
    plans: [
      { week_start: "2026-09-21", planned_days: [1], planned_routines: { 1: ["cardio"] } },
      { week_start: "2026-09-28", planned_days: [1, 4], planned_routines: { 1: ["fuerza"], 4: ["cardio"] } },
    ],
    routine: [
      { date: "2026-09-21", week_start: "2026-09-21", dia_semana: 1, routine_type: "cardio", completed: true },
      { date: "2026-09-28", week_start: "2026-09-28", dia_semana: 1, routine_type: "fuerza", completed: true },
      { date: "2026-10-01", week_start: "2026-09-28", dia_semana: 4, routine_type: "cardio", completed: true },
    ],
  }
  const nutrition: NutritionHistory = {
    meals: [{ id: "m", date: "2026-10-01", created_at: "", meal_type: "lunch", meal_description: "Almuerzo", estimated_calories: 300, portion_assumption: null, food_breakdown: null, protein_g: 20, carbs_g: 30, fat_g: 10 }],
    tracker: [],
  }
  const insight = deriveHealthInsight(history, nutrition, null, trainingStats(history, "week", today), today)
  assert.match(insight.positive, /1 más/)
  assert.equal(insight.signals[0].value, "2.00 L")
  assert.match(insight.signals[0].detail, /antes 1.00 L/)
  assert.equal(insight.signals[1].value, "2/2")
  assert.equal(insight.signals[2].value, "71 kg")
  assert.match(insight.signals[2].detail, /-1 kg/)
  assert.deepEqual(streakDayDetails(history, nutrition, "2026-10-01").sources, ["1 comida", "2.00 L de agua", "1 rutina", "peso registrado"])
  assert.equal(streakDayDetails(history, nutrition, "2026-10-02").active, false)
})

test("lectura de hidratacion evalua solo dias completos con metas guardadas", () => {
  const today = new Date("2026-10-02T12:00:00")
  const history: HealthHistory = {
    body: [], routine: [], plans: [],
    water: [
      { date: "2026-09-29", amount_liters: 0.5 },
      { date: "2026-09-30", amount_liters: 0.5 },
      { date: "2026-10-02", amount_liters: 0.1 },
    ],
    tracker: [
      { date: "2026-09-29", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 0.5, water_target_liters: 2 },
      { date: "2026-09-30", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 0.5, water_target_liters: 2 },
      { date: "2026-10-02", calories_ingested: 0, is_workout_day: false, water_ingested_liters: 0.1, water_target_liters: 2 },
    ],
  }
  const insight = deriveHealthInsight(history, { meals: [], tracker: [] }, null, trainingStats(history, "week", today), today)
  assert.match(insight.attention, /25%/)
  assert.match(insight.basis, /2026-10-01/)
})

test("al cambiar de dia no se arrastran calorias ni agua y se conserva ayer", () => {
  const nutrition: NutritionHistory = {
    meals: [{ id: "m", date: "2026-10-01", created_at: "", meal_type: "lunch", meal_description: "Comida", estimated_calories: 1510, portion_assumption: null, food_breakdown: null, protein_g: 40, carbs_g: 180, fat_g: 30 }],
    tracker: [
      { date: "2026-10-01", calorie_target: 2004, calories_ingested: 1510, calorie_manual_adjustment: 0 },
      { date: "2026-10-02", calorie_target: 2004, calories_ingested: 1510, calorie_manual_adjustment: 0 },
    ],
  }
  const today = new Date("2026-10-02T12:00:00")
  const current = nutritionTotals(selectNutritionRange(nutrition, healthDateRange("today", 0, today)))
  const previous = nutritionTotals(selectNutritionRange(nutrition, healthDateRange("today", 1, today)))
  assert.equal(current.calories, 0)
  assert.equal(current.protein, null)
  assert.deepEqual(current.discrepancies, [{ date: "2026-10-02", tracker: 1510, calculated: 0 }])
  assert.equal(previous.calories, 1510)
  assert.equal(previous.protein, 40)

  const health: HealthHistory = {
    body: [], routine: [], plans: [],
    water: [{ date: "2026-10-01", amount_liters: 0.75 }, { date: "2026-10-02", amount_liters: 1 }],
    tracker: [
      { date: "2026-10-01", water_ingested_liters: 0.8, water_target_liters: 3, calories_ingested: 1510, is_workout_day: false },
      { date: "2026-10-02", water_ingested_liters: 1.9, water_target_liters: 3, calories_ingested: 1510, is_workout_day: false },
    ],
  }
  const currentWater = waterTotals(health, "today", today)
  assert.equal(currentWater.liters, 1)
  assert.deepEqual(currentWater.discrepancies, [{ date: "2026-10-02", tracker: 1.9, logged: 1 }])
  assert.equal(waterTotals(health, "today", new Date("2026-10-01T12:00:00")).liters, 0.75)
})

test("rangos historicos y comparacion respetan semanas lunes-domingo y mes calendario", () => {
  const today = new Date("2026-10-02T12:00:00")
  assert.deepEqual(healthDateRange("week", 0, today), { start: "2026-09-28", end: "2026-10-04", label: "Esta semana", unit: "week", offset: 0 })
  assert.deepEqual(comparablePreviousRange(healthDateRange("week", 0, today), today), { start: "2026-09-21", end: "2026-09-25", label: "Semana anterior (mismo tramo)", unit: "week", offset: 1 })
  assert.equal(healthDateRange("month", 1, new Date("2026-10-31T12:00:00")).start, "2026-09-01")
  assert.equal(comparablePreviousRange(healthDateRange("month", 0, today), today).end, "2026-09-02")
})

test("entrenamiento compara semanas sin mezclar completados futuros", () => {
  const history: HealthHistory = {
    body: [], tracker: [], water: [],
    plans: [
      { week_start: "2026-09-21", planned_days: [1], planned_routines: { 1: ["cardio"] } },
      { week_start: "2026-09-28", planned_days: [1], planned_routines: { 1: ["fuerza"] } },
    ],
    routine: [
      { date: "2026-09-21", week_start: "2026-09-21", dia_semana: 1, routine_type: "cardio", completed: true },
      { date: "2026-09-28", week_start: "2026-09-28", dia_semana: 1, routine_type: "fuerza", completed: true },
    ],
  }
  const today = new Date("2026-10-02T12:00:00")
  assert.equal(trainingStatsForRange(history, healthDateRange("week", 0, today), today).byType.find((item) => item.type === "fuerza")?.completed, 1)
  assert.equal(trainingStatsForRange(history, healthDateRange("week", 1, today), today).byType.find((item) => item.type === "cardio")?.completed, 1)
})

test("un dia de entrenamiento no cuenta completo hasta terminar todos sus tipos planificados", () => {
  const history: HealthHistory = {
    body: [], tracker: [], water: [],
    plans: [{ week_start: "2026-09-28", planned_days: [1], planned_routines: { 1: ["fuerza", "cardio"] } }],
    routine: [{ date: "2026-09-28", week_start: "2026-09-28", dia_semana: 1, routine_type: "fuerza", completed: true }],
  }
  const stats = trainingStatsForRange(history, healthDateRange("week", 0, new Date("2026-10-02T12:00:00")), new Date("2026-10-02T12:00:00"))
  assert.equal(stats.completedDays, 0)
  assert.equal(stats.plannedDays, 1)
  assert.equal(stats.percent, 0)
  assert.equal(stats.byType.find((item) => item.type === "fuerza")?.completed, 1)
})

test("Gemini suma macros conocidos por alimento sin fabricar nutriente faltante", () => {
  const result = sanitizeNutritionResponse({ meals: [{ meal_type: "breakfast", description: "Pan con atun", estimated_calories: 350, foods: [
    { name: "Atun", portion: "100 g", protein_g: 25, carbs_g: 0, fat_g: 1, estimated_grams: 100, estimated_calories: 110 },
    { name: "Pan", portion: "2 rebanadas", protein_g: 6, carbs_g: 28, fat_g: null, estimated_grams: 60, estimated_calories: 160 },
  ] }] })
  assert.equal(result.meals[0].protein_g, 31)
  assert.equal(result.meals[0].carbs_g, 28)
  assert.equal(result.meals[0].fat_g, null)
})
