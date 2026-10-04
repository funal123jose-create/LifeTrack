import type { CareerSkill } from "@/lib/career"
import type { Project, ProjectProfessionalScore, ProjectTechnicalSummary } from "@/lib/career-page-models"

export type CareerEvidence = {
  id: string
  project_id: string
  task_id?: string
  file_name: string
  file_url: string
  mime_type: string | null
  asset_type?: string
  section_key?: string
  created_at: string
}

export type CareerActivity = {
  id: string
  project_id: string | null
  task_id: string | null
  event_type: string
  event_title: string
  created_at: string
}

export type CareerDocument = {
  id: string
  project_id: string
  task_id: string
  title: string | null
  objective: string | null
  content: string | null
  technical_notes: string | null
  result_summary: string | null
  reference_links?: string | null
  updated_at: string
}

export function evidenceKind(asset: CareerEvidence) {
  const extension = asset.file_name.split(".").at(-1)?.toLowerCase() || ""
  if (["pbix", "pbit"].includes(extension)) return { label: "Dashboard", short: "BI", color: "#f4c544" }
  if (["ppt", "pptx"].includes(extension)) return { label: "Presentación", short: "PPT", color: "#f28d48" }
  if (["doc", "docx"].includes(extension)) return { label: "Documento", short: "DOC", color: "#65a9f2" }
  if (["xls", "xlsx", "csv", "parquet"].includes(extension)) return { label: "Dataset", short: "DATA", color: "#5bd5a7" }
  if (["ipynb", "py", "ts", "tsx", "js", "jsx", "sql", "json"].includes(extension)) return { label: "Código", short: "CODE", color: "#a8b7ff" }
  if (asset.mime_type?.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(extension)) return { label: "Imagen", short: "IMG", color: "#f6b86b" }
  if (extension === "pdf") return { label: "PDF", short: "PDF", color: "#f28686" }
  return { label: "Archivo", short: "FILE", color: "#a7b6c8" }
}

export function activityTimeline(projects: Project[], activity: CareerActivity[], projectId: string, months: number, today = new Date()) {
  const projectIds = new Set(projects.map((project) => project.id))
  const filtered = activity.filter((entry) => entry.project_id && projectIds.has(entry.project_id) && (projectId === "all" || entry.project_id === projectId))
  const fallback = projects.flatMap((project) => project.project_tasks
    .filter((task) => task.completed_at && (projectId === "all" || project.id === projectId))
    .map((task) => ({ created_at: task.completed_at! })))
  const records = filtered.length ? filtered : fallback
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    return { key, label: new Intl.DateTimeFormat("es", { month: "short" }).format(date), count: records.filter((event) => event.created_at.slice(0, 7) === key).length }
  })
}

export function careerOverviewData(
  projects: Project[],
  scores: Record<string, ProjectProfessionalScore>,
  summaries: Record<string, ProjectTechnicalSummary>,
  skills: CareerSkill[],
  evidence: CareerEvidence[],
  activity: CareerActivity[] = [],
  documents: CareerDocument[] = [],
) {
  const allTasks = projects.flatMap((project) => project.project_tasks)
  const completed = allTasks.filter((task) => task.status === "COMPLETADO").length
  const inProgress = allTasks.filter((task) => task.status === "EN CURSO").length
  const pending = allTasks.filter((task) => task.status === "SIN EMPEZAR").length
  const archived = allTasks.filter((task) => task.status === "ARCHIVADO").length
  const documented = Object.values(scores).reduce((total, score) => total + score.documented_tasks, 0)
  const assets = Object.values(summaries).reduce((total, summary) => total + summary.total_assets, 0)
  const taskCount = allTasks.length
  const completion = taskCount ? Math.round(completed / taskCount * 100) : 0
  const documentation = taskCount ? Math.round(documented / taskCount * 100) : 0
  const activeProjects = projects.filter((project) => project.status === "En curso")
  const projectStatuses = projects.reduce<Record<string, number>>((counts, project) => {
    counts[project.status] = (counts[project.status] || 0) + 1
    return counts
  }, {})
  const skillsUsed = new Map<string, number>()

  for (const project of projects) {
    for (const link of project.project_skills) skillsUsed.set(link.skill_id, (skillsUsed.get(link.skill_id) || 0) + 1)
    for (const task of project.project_tasks) {
      for (const link of task.task_skills) skillsUsed.set(link.skill_id, (skillsUsed.get(link.skill_id) || 0) + 1)
    }
  }

  const appliedSkills = skills.map((skill) => ({ ...skill, uses: skillsUsed.get(skill.id) || 0 }))
    .filter((skill) => skill.uses > 0)
    .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name))

  const timeline = activityTimeline(projects, activity, "all", 12)
  const docsWithContent = new Set(documents.filter((doc) => [doc.objective, doc.content, doc.technical_notes, doc.result_summary].some((value) => value?.trim())).map((doc) => doc.task_id)).size
  const documentationInProgress = Math.max(0, docsWithContent - documented)
  const documentationPending = Math.max(0, taskCount - documented - documentationInProgress)

  const featured = [...projects].sort((a, b) => (scores[b.id]?.professional_score || 0) - (scores[a.id]?.professional_score || 0))[0] || null

  return {
    taskCount, completed, inProgress, pending, archived, documented, assets,
    completion, documentation, activeProjects, projectStatuses, appliedSkills, timeline, featured,
    documentationInProgress, documentationPending,
    recentEvidence: [...evidence].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4),
  }
}
