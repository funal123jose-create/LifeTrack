import {
  mapSkillLink,
  toOptionalString,
  toRequiredString,
  type CareerSkill,
  type PriorityLevel,
  type ProjectSkillLink,
  type ProjectStatus,
  type ProjectTaskDoc,
  type ProjectTaskSkillLink,
  type RawProject,
  type TaskStatus,
} from "@/lib/career"
import type { Project, Task } from "@/lib/career-page-models"

type TaskDocumentSeed = {
  title?: string | null
}

export const buildEmptyTaskDoc = (task?: TaskDocumentSeed | null): ProjectTaskDoc => ({
  title: task?.title || "",
  objective: "",
  content: "",
  technical_notes: "",
  challenges: "",
  solution: "",
  learnings: "",
  result_summary: "",
  reference_links: "",
  document_content_json: null,
  document_content_html: "",
})

export const sanitizeStatusForDB = (status: string): ProjectStatus => {
  const lower = status.toLowerCase().trim()

  if (lower === "backlog") return "Backlog"
  if (lower === "en planeación" || lower === "en planeacion" || lower === "planeación" || lower === "planeacion") {
    return "En planeación"
  }
  if (lower === "en curso") return "En curso"
  if (lower === "en pausa") return "En pausa"
  if (lower === "completado") return "Completado"
  if (lower === "cancelado") return "Cancelado"

  return "Backlog"
}

export const getProjectSkillLinks = (project?: Project | null): ProjectSkillLink[] => {
  return project?.project_skills || []
}

export const getProjectSkills = (project?: Project | null): CareerSkill[] => {
  return getProjectSkillLinks(project)
    .map((link) => link.career_skills)
    .filter((skill): skill is CareerSkill => Boolean(skill))
}

export const groupCareerSkills = (skills: CareerSkill[]): Record<string, CareerSkill[]> => {
  return skills.reduce<Record<string, CareerSkill[]>>((acc, skill) => {
    const category = skill.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})
}

const normalizeProjectPriority = (priority: unknown): PriorityLevel => {
  return priority === "Baja" || priority === "Media" || priority === "Alta" ? priority : "Media"
}

const normalizeTaskStatus = (status: unknown): TaskStatus => {
  const rawStatus = String(status || "SIN EMPEZAR").toUpperCase() as TaskStatus
  return ["SIN EMPEZAR", "EN CURSO", "COMPLETADO", "ARCHIVADO"].includes(rawStatus)
    ? rawStatus
    : "SIN EMPEZAR"
}

export const mapRawProjects = (projects: RawProject[]): Project[] => {
  return projects.map((proj) => {
    const tasks: Task[] = (Array.isArray(proj.project_tasks) ? proj.project_tasks : []).map((task) => {
      const taskSkillLinks: ProjectTaskSkillLink[] = (Array.isArray(task.project_task_skills)
        ? task.project_task_skills
        : []
      ).map((link) => ({
        ...mapSkillLink(link),
        proficiency_level: toOptionalString(link.proficiency_level) || "Aplicado",
      }))

      return {
        id: toRequiredString(task.id),
        title: toRequiredString(task.title),
        status: normalizeTaskStatus(task.status),
        task_skills: taskSkillLinks,
      }
    })

    const skillLinks: ProjectSkillLink[] = (Array.isArray(proj.project_skills) ? proj.project_skills : []).map((link) => ({
      ...mapSkillLink(link),
      proficiency_level: toOptionalString(link.proficiency_level) || "Practicando",
    }))

    return {
      id: toRequiredString(proj.id),
      title: toRequiredString(proj.title),
      summary: toOptionalString(proj.summary),
      description: toOptionalString(proj.description),
      status: sanitizeStatusForDB(String(proj.status || "Backlog")),
      priority: normalizeProjectPriority(proj.priority),
      start_date: toOptionalString(proj.start_date),
      end_date: toOptionalString(proj.end_date),
      project_tasks: tasks,
      project_skills: skillLinks,
    }
  })
}
