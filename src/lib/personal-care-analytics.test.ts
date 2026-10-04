import test from "node:test"
import assert from "node:assert/strict"
import { analyzePersonalCare, carePeriodBounds, type CareLog } from "./personal-care-analytics"
import type { PersonalCareCompletion, PersonalCareRoutine } from "./personal-care-page-models"

test("los filtros de semana, mes y rango usan fechas inclusivas", () => {
  assert.deepEqual(carePeriodBounds({ kind: "week", anchor: "2026-10-03" }), { start: "2026-09-28", end: "2026-10-04" })
  assert.deepEqual(carePeriodBounds({ kind: "month", anchor: "2026-02-15" }), { start: "2026-02-01", end: "2026-02-28" })
  assert.deepEqual(carePeriodBounds({ kind: "range", start: "2026-10-05", end: "2026-10-01" }), { start: "2026-10-01", end: "2026-10-05" })
})

test("sin check-ins no inventa score ni promedios", () => {
  const result = analyzePersonalCare([], [], [], { kind: "week", anchor: "2026-10-03" }, "2026-10-03")
  assert.equal(result.score, null)
  assert.equal(result.mood, null)
  assert.equal(result.sleep, null)
  assert.equal(result.periodLogs.length, 0)
})

test("deriva KPI y lectura de registros fechados sin usar horas de sueño", () => {
  const logs = [
    { date: "2026-10-01", mood_level: 8, stress_level: 3, motivation_level: 6, sleep_quality: 7 },
    { date: "2026-10-02", mood_level: 6, stress_level: 5, motivation_level: 8, sleep_quality: 9 },
    { date: "2026-09-20", mood_level: 1, stress_level: 10, motivation_level: 1, sleep_quality: 1 },
  ] as CareLog[]
  const completions = [
    { id: "c1", routine_id: "r1", date: "2026-10-02", completed: true },
    { id: "c2", routine_id: "r1", date: "2026-09-20", completed: true },
  ] as PersonalCareCompletion[]
  const routines = [{ id: "r1", active: true }] as PersonalCareRoutine[]
  const result = analyzePersonalCare(logs, completions, routines, { kind: "week", anchor: "2026-10-03" }, "2026-10-03")
  assert.equal(result.mood, 7)
  assert.equal(result.sleep, 8)
  assert.equal(result.stress, 4)
  assert.equal(result.components.emotional, 70)
  assert.equal(result.components.sleep, 80)
  assert.equal(result.components.stress, 70)
  assert.equal(result.components.consistency, 33)
  assert.equal(result.score, 63)
  assert.equal(result.periodCompletions.length, 1)
  assert.equal(result.completionDays, 1)
  assert.match(result.insight, /2 check-ins/)
  assert.match(result.insight, /muestra es demasiado pequeña/)
  assert.match(result.recommendation, /varios días/)
})

test("un solo registro de estrés alto no se interpreta como tendencia anual", () => {
  const result = analyzePersonalCare(
    [{ date: "2026-06-13", mood_level: 9, stress_level: 8, motivation_level: 9, sleep_quality: 8 }],
    [],
    [],
    { kind: "year", anchor: "2026-10-03" },
    "2026-10-03"
  )
  assert.equal(result.periodLogs.length, 1)
  assert.match(result.recommendation, /varios días/)
  assert.doesNotMatch(result.recommendation, /estrés registrado es alto/)
})
