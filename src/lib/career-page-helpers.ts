import type { CareerSkill, ProjectSkillLink, ProjectStatus, ProjectTaskDoc } from "@/lib/career"
import type { Project } from "@/lib/career-page-models"

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
