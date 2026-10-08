import assert from "node:assert/strict"
import { test } from "node:test"
import { deadlineAlerts, deadlineFor, limaToday, validDateRange } from "./career-deadlines"

const project = { id: "a", title: "Proyecto", status: "En curso", start_date: "2026-10-08", end_date: "2026-10-09", progress: 20, project_tasks: [] }

test("uses the calendar day in Lima", () => {
  assert.equal(limaToday(new Date("2026-10-09T03:30:00Z")), "2026-10-08")
})

test("alerts tomorrow and overdue but not before", () => {
  assert.equal(deadlineFor(project, "2026-10-08")?.kind, "tomorrow")
  assert.equal(deadlineFor(project, "2026-10-10")?.kind, "overdue")
  assert.equal(deadlineFor(project, "2026-10-07"), null)
  assert.equal(deadlineFor(project, "2026-10-09"), null)
})

test("ignores completed, paused, canceled and fully done tasks", () => {
  assert.equal(deadlineAlerts([{ ...project, status: "En pausa" }, { ...project, id: "b", status: "Completado" }, { ...project, id: "c", progress: 100 }], "2026-10-08").length, 0)
  assert.equal(deadlineFor({ ...project, project_tasks: [{ status: "COMPLETADO" }] }, "2026-10-08"), null)
})

test("end date cannot precede start date", () => {
  assert.equal(validDateRange("2026-10-09", "2026-10-08"), false)
  assert.equal(validDateRange("2026-10-09", "2026-10-09"), true)
})

test("postpone, pause and resume recompute the same project's alert", () => {
  assert.equal(deadlineAlerts([project], "2026-10-08").length, 1)
  const postponed = { ...project, end_date: "2026-10-23" }
  assert.equal(deadlineAlerts([postponed], "2026-10-08").length, 0)
  const paused = { ...project, status: "En pausa", start_date: null, end_date: null }
  assert.equal(deadlineAlerts([paused], "2026-10-10").length, 0)
  const resumed = { ...paused, status: "En curso", start_date: "2026-10-20", end_date: "2026-10-30" }
  assert.equal(deadlineAlerts([resumed], "2026-10-29")[0]?.kind, "tomorrow")
  assert.equal(deadlineAlerts([resumed], "2026-10-31")[0]?.kind, "overdue")
})
