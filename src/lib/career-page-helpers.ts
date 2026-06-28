import {
  mapSkillLink,
  toOptionalString,
  toRequiredString,
  type CareerSkill,
  type PriorityLevel,
  type ProjectCaseStudySkill,
  type ProjectCaseStudyTask,
  type ProjectSkillLink,
  type ProjectStatus,
  type ProjectTaskDoc,
  type ProjectTaskSkillLink,
  type RawProject,
  type TaskStatus,
} from "@/lib/career"
import type {
  Project,
  ProjectCaseStudyDetail,
  ProjectProfessionalScore,
  ProjectTechnicalSummary,
  RawProjectCaseStudyDetail,
  RawProjectProfessionalScore,
  RawProjectTechnicalSummary,
  Task,
} from "@/lib/career-page-models"

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

export const getProjectSkillIds = (project?: Project | null) => {
  return new Set(getProjectSkillLinks(project).map((link) => link.skill_id))
}

export const getTaskSkillIds = (skillLinks: ProjectTaskSkillLink[]) => {
  return new Set(skillLinks.map((link) => link.skill_id))
}

export const groupCareerSkills = (skills: CareerSkill[]): Record<string, CareerSkill[]> => {
  return skills.reduce<Record<string, CareerSkill[]>>((acc, skill) => {
    const category = skill.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})
}

export const getProjectTaskCompletionPct = (project?: Project | null) => {
  const total = project?.project_tasks.length || 0
  const completed = project?.project_tasks.filter((task) => task.status === "COMPLETADO").length || 0

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

export const getProjectProfessionalScore = (
  project: Project | null | undefined,
  scores: Record<string, ProjectProfessionalScore>
) => {
  if (!project) return null
  return scores[project.id] || null
}

export const getProjectTechnicalSummary = (
  project: Project | null | undefined,
  summaries: Record<string, ProjectTechnicalSummary>
) => {
  if (!project) return null
  return summaries[project.id] || null
}

export const getProfessionalScoreMetrics = (score?: ProjectProfessionalScore | null) => [
  {
    label: "Operativo",
    value: score?.task_completion_percentage ?? 0,
    detail: `${score?.completed_tasks ?? 0}/${score?.total_tasks ?? 0} tareas`,
  },
  {
    label: "Documentación",
    value: score?.documentation_percentage ?? 0,
    detail: `${score?.documented_tasks ?? 0}/${score?.total_tasks ?? 0} subtareas`,
  },
  {
    label: "Skills",
    value: score?.skill_coverage_percentage ?? 0,
    detail: `${score?.total_task_skills ?? 0} skills aplicadas`,
  },
  {
    label: "Evidencias",
    value: score?.evidence_coverage_percentage ?? 0,
    detail: `${score?.total_assets ?? 0} archivos`,
  },
]

export const getTechnicalSummaryMetrics = (summary?: ProjectTechnicalSummary | null) => [
  {
    label: "Tareas",
    value: summary?.total_tasks ?? 0,
    detail: `${summary?.completed_tasks ?? 0} completadas`,
  },
  {
    label: "Documentadas",
    value: summary?.documented_tasks ?? 0,
    detail: `${summary?.documentation_percentage ?? 0}% cobertura`,
  },
  {
    label: "Skills aplicadas",
    value: summary?.total_task_skills ?? 0,
    detail: `${summary?.tasks_with_skills ?? 0} subtareas`,
  },
  {
    label: "Evidencias",
    value: summary?.total_assets ?? 0,
    detail: `${summary?.total_images ?? 0} imágenes · ${summary?.total_documents ?? 0} docs`,
  },
]

export const getCaseStudySummaryMetrics = (caseStudy: ProjectCaseStudyDetail) => [
  {
    label: "Tareas",
    value: caseStudy.total_tasks,
    detail: `${caseStudy.completed_tasks} completadas`,
  },
  {
    label: "Documentación",
    value: caseStudy.documented_tasks,
    detail: `${caseStudy.documentation_percentage}% cobertura`,
  },
  {
    label: "Skills",
    value: caseStudy.total_task_skills,
    detail: `${caseStudy.tasks_with_skills} subtareas`,
  },
  {
    label: "Evidencias",
    value: caseStudy.total_assets,
    detail: `${caseStudy.total_images} imágenes · ${caseStudy.total_documents} docs`,
  },
]

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

export const mapProfessionalScores = (
  scores: RawProjectProfessionalScore[]
): Record<string, ProjectProfessionalScore> => {
  const mappedScores: Record<string, ProjectProfessionalScore> = {}

  scores.forEach((score) => {
    const projectId = toRequiredString(score.project_id)

    mappedScores[projectId] = {
      project_id: projectId,
      total_tasks: Number(score.total_tasks || 0),
      completed_tasks: Number(score.completed_tasks || 0),
      documented_tasks: Number(score.documented_tasks || 0),
      total_task_skills: Number(score.total_task_skills || 0),
      total_assets: Number(score.total_assets || 0),
      task_completion_percentage: Number(score.task_completion_percentage || 0),
      documentation_percentage: Number(score.documentation_percentage || 0),
      skill_coverage_percentage: Number(score.skill_coverage_percentage || 0),
      evidence_coverage_percentage: Number(score.evidence_coverage_percentage || 0),
      professional_score: Number(score.professional_score || 0),
    }
  })

  return mappedScores
}

export const mapTechnicalSummaries = (
  summaries: RawProjectTechnicalSummary[]
): Record<string, ProjectTechnicalSummary> => {
  const mappedSummaries: Record<string, ProjectTechnicalSummary> = {}

  summaries.forEach((summary) => {
    const projectId = toRequiredString(summary.project_id)

    mappedSummaries[projectId] = {
      project_id: projectId,
      project_title: toRequiredString(summary.project_title),
      project_description: toOptionalString(summary.project_description),
      project_summary: toOptionalString(summary.project_summary),
      project_status: toOptionalString(summary.project_status),
      project_priority: toOptionalString(summary.project_priority),
      start_date: toOptionalString(summary.start_date),
      end_date: toOptionalString(summary.end_date),
      total_tasks: Number(summary.total_tasks || 0),
      completed_tasks: Number(summary.completed_tasks || 0),
      in_progress_tasks: Number(summary.in_progress_tasks || 0),
      pending_tasks: Number(summary.pending_tasks || 0),
      archived_tasks: Number(summary.archived_tasks || 0),
      documented_tasks: Number(summary.documented_tasks || 0),
      total_project_skills: Number(summary.total_project_skills || 0),
      total_task_skills: Number(summary.total_task_skills || 0),
      tasks_with_skills: Number(summary.tasks_with_skills || 0),
      total_assets: Number(summary.total_assets || 0),
      total_images: Number(summary.total_images || 0),
      total_documents: Number(summary.total_documents || 0),
      tasks_with_assets: Number(summary.tasks_with_assets || 0),
      project_stack: toRequiredString(summary.project_stack),
      task_stack: toRequiredString(summary.task_stack),
      task_completion_percentage: Number(summary.task_completion_percentage || 0),
      documentation_percentage: Number(summary.documentation_percentage || 0),
      skill_coverage_percentage: Number(summary.skill_coverage_percentage || 0),
      evidence_coverage_percentage: Number(summary.evidence_coverage_percentage || 0),
      professional_score: Number(summary.professional_score || 0),
    }
  })

  return mappedSummaries
}

export const mapProjectCaseStudy = (data: RawProjectCaseStudyDetail): ProjectCaseStudyDetail => ({
  project_id: toRequiredString(data.project_id),
  project_title: toRequiredString(data.project_title),
  project_description: toOptionalString(data.project_description),
  project_summary: toOptionalString(data.project_summary),
  project_status: toOptionalString(data.project_status),
  project_priority: toOptionalString(data.project_priority),
  start_date: toOptionalString(data.start_date),
  end_date: toOptionalString(data.end_date),
  total_tasks: Number(data.total_tasks || 0),
  completed_tasks: Number(data.completed_tasks || 0),
  in_progress_tasks: Number(data.in_progress_tasks || 0),
  pending_tasks: Number(data.pending_tasks || 0),
  archived_tasks: Number(data.archived_tasks || 0),
  documented_tasks: Number(data.documented_tasks || 0),
  total_project_skills: Number(data.total_project_skills || 0),
  total_task_skills: Number(data.total_task_skills || 0),
  tasks_with_skills: Number(data.tasks_with_skills || 0),
  total_assets: Number(data.total_assets || 0),
  total_images: Number(data.total_images || 0),
  total_documents: Number(data.total_documents || 0),
  tasks_with_assets: Number(data.tasks_with_assets || 0),
  project_stack: toRequiredString(data.project_stack),
  task_stack: toRequiredString(data.task_stack),
  project_stack_json: (Array.isArray(data.project_stack_json) ? data.project_stack_json : []) as ProjectCaseStudySkill[],
  tasks_json: (Array.isArray(data.tasks_json) ? data.tasks_json : []) as ProjectCaseStudyTask[],
  task_completion_percentage: Number(data.task_completion_percentage || 0),
  documentation_percentage: Number(data.documentation_percentage || 0),
  skill_coverage_percentage: Number(data.skill_coverage_percentage || 0),
  evidence_coverage_percentage: Number(data.evidence_coverage_percentage || 0),
  professional_score: Number(data.professional_score || 0),
})
