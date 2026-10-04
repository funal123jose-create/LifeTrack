import type { Project } from "@/lib/career-page-models"
import type { CareerDocument } from "@/lib/career-overview"

export type CareerPeriod =
  | { kind: "all" }
  | { kind: "day" | "week" | "month"; anchor: string }
  | { kind: "range"; start: string; end: string }

const localDate = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`)
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export function careerPeriodBounds(period: CareerPeriod) {
  if (period.kind === "all") return null
  if (period.kind === "range") return period.start <= period.end ? { start: period.start, end: period.end } : { start: period.end, end: period.start }
  const date = localDate(period.anchor)
  if (period.kind === "day") return { start: dateKey(date), end: dateKey(date) }
  if (period.kind === "week") {
    date.setDate(date.getDate() - (date.getDay() + 6) % 7)
    const start = dateKey(date)
    date.setDate(date.getDate() + 6)
    return { start, end: dateKey(date) }
  }
  return { start: dateKey(new Date(date.getFullYear(), date.getMonth(), 1)), end: dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)) }
}

export function careerPeriodSummary(projects: Project[], documents: CareerDocument[], period: CareerPeriod) {
  const bounds = careerPeriodBounds(period)
  const inPeriod = (value?: string | null) => Boolean(value && bounds && value.slice(0, 10) >= bounds.start && value.slice(0, 10) <= bounds.end)
  const createdProjects = projects.filter((project) => inPeriod(project.created_at))
  const completedTasks = projects.flatMap((project) => project.project_tasks.filter((task) => task.status === "COMPLETADO" && inPeriod(task.completed_at)).map((task) => ({ ...task, projectTitle: project.title })))
  const documentedTasks = documents.filter((doc) => inPeriod(doc.updated_at) && [doc.objective, doc.content, doc.technical_notes, doc.result_summary].some((value) => value?.trim()))
  const skillIds = new Set(completedTasks.flatMap((task) => task.task_skills.map((link) => link.skill_id)))
  return { createdProjects, completedTasks, documentedTasks, skillIds }
}
