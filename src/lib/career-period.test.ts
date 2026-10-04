import test from "node:test"
import assert from "node:assert/strict"
import { careerPeriodBounds, careerPeriodSummary } from "./career-period"
import type { Project } from "./career-page-models"
import type { CareerDocument } from "./career-overview"

test("periodos de semana y rango usan limites inclusivos", () => {
  assert.deepEqual(careerPeriodBounds({ kind: "week", anchor: "2026-10-07" }), { start: "2026-10-05", end: "2026-10-11" })
  assert.deepEqual(careerPeriodBounds({ kind: "range", start: "2026-10-11", end: "2026-10-05" }), { start: "2026-10-05", end: "2026-10-11" })
})

test("resumen temporal cuenta solo registros fechados y skills de cierres", () => {
  const projects = [{ id: "p1", title: "Proyecto", created_at: "2026-10-05T10:00:00Z", project_tasks: [
    { id: "t1", title: "Cierre", status: "COMPLETADO", completed_at: "2026-10-07T10:00:00Z", task_skills: [{ skill_id: "sql" }] },
    { id: "t2", title: "Sin cierre", status: "SIN EMPEZAR", completed_at: null, task_skills: [{ skill_id: "python" }] },
  ] }] as Project[]
  const docs = [{ task_id: "t1", updated_at: "2026-10-08T10:00:00Z", content: "Evidencia" }, { task_id: "t2", updated_at: "2026-09-01T10:00:00Z", content: "Anterior" }] as CareerDocument[]
  const result = careerPeriodSummary(projects, docs, { kind: "week", anchor: "2026-10-07" })
  assert.equal(result.createdProjects.length, 1)
  assert.equal(result.completedTasks.length, 1)
  assert.equal(result.documentedTasks.length, 1)
  assert.deepEqual([...result.skillIds], ["sql"])
})
