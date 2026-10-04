import test from "node:test"
import assert from "node:assert/strict"
import { activityTimeline, careerOverviewData, evidenceKind } from "./career-overview"
import type { Project, ProjectProfessionalScore, ProjectTechnicalSummary } from "./career-page-models"

const projects = [
  {
    id: "p1", title: "Proyecto real", status: "En curso", start_date: "2026-07-10",
    project_skills: [{ id: "l1", skill_id: "python", career_skills: null }],
    project_tasks: [
      { id: "t1", status: "COMPLETADO", task_skills: [{ id: "l2", skill_id: "python", career_skills: null }] },
      { id: "t2", status: "SIN EMPEZAR", task_skills: [] },
    ],
  },
] as Project[]
const scores = { p1: { project_id: "p1", total_tasks: 2, completed_tasks: 1, documented_tasks: 1, professional_score: 42 } } as unknown as Record<string, ProjectProfessionalScore>
const summaries = { p1: { project_id: "p1", total_assets: 3 } } as unknown as Record<string, ProjectTechnicalSummary>

test("resumen profesional usa tareas, documentos y evidencias reales", () => {
  const data = careerOverviewData(projects, scores, summaries, [{ id: "python", name: "Python", category: "Lenguaje", color: null, icon: null }], [])
  assert.equal(data.taskCount, 2)
  assert.equal(data.completed, 1)
  assert.equal(data.completion, 50)
  assert.equal(data.documentation, 50)
  assert.equal(data.assets, 3)
  assert.equal(data.activeProjects.length, 1)
  assert.equal(data.projectStatuses["En curso"], 1)
  assert.equal(data.documentationPending, 1)
  assert.equal(data.appliedSkills[0].uses, 2)
  assert.ok(data.timeline.every((month) => month.count === 0))
  assert.equal(data.featured?.id, "p1")
})

test("sin registros no inventa porcentajes ni actividad", () => {
  const data = careerOverviewData([], {}, {}, [], [])
  assert.equal(data.completion, 0)
  assert.equal(data.documentation, 0)
  assert.ok(data.timeline.every((month) => month.count === 0))
  assert.equal(data.featured, null)
})

test("la línea usa eventos fechados y respeta el filtro de proyecto", () => {
  const events = [
    { id: "e1", project_id: "p1", task_id: "t1", event_type: "task", event_title: "Avance", created_at: "2026-08-04T10:00:00Z" },
    { id: "e2", project_id: "p2", task_id: null, event_type: "project", event_title: "Otro", created_at: "2026-08-05T10:00:00Z" },
  ]
  const series = activityTimeline(projects, events, "p1", 3, new Date(2026, 9, 1))
  assert.deepEqual(series.map((month) => month.count), [1, 0, 0])
})

test("la categoría de evidencia procede del archivo", () => {
  assert.equal(evidenceKind({ id: "a", project_id: "p1", file_name: "modelo.pbix", file_url: "", mime_type: null, created_at: "2026-10-01" }).label, "Dashboard")
})
