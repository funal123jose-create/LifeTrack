import type {
  PriorityLevel,
  ProjectCaseStudySkill,
  ProjectCaseStudyTask,
  ProjectSkillLink,
  ProjectStatus,
  ProjectTaskSkillLink,
  TaskStatus,
} from "@/lib/career"

export interface Task {
  id: string
  title: string
  status: TaskStatus
  task_skills: ProjectTaskSkillLink[]
}

export type RawProjectProfessionalScore = Partial<Record<keyof ProjectProfessionalScore, unknown>>
export type RawProjectTechnicalSummary = Partial<Record<keyof ProjectTechnicalSummary, unknown>>

export interface ProjectProfessionalScore {
  project_id: string
  total_tasks: number
  completed_tasks: number
  documented_tasks: number
  total_task_skills: number
  total_assets: number
  task_completion_percentage: number
  documentation_percentage: number
  skill_coverage_percentage: number
  evidence_coverage_percentage: number
  professional_score: number
}

export interface ProjectTechnicalSummary {
  project_id: string
  project_title: string
  project_description: string | null
  project_summary: string | null
  project_status: string | null
  project_priority: string | null
  start_date: string | null
  end_date: string | null
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  archived_tasks: number
  documented_tasks: number
  total_project_skills: number
  total_task_skills: number
  tasks_with_skills: number
  total_assets: number
  total_images: number
  total_documents: number
  tasks_with_assets: number
  project_stack: string
  task_stack: string
  task_completion_percentage: number
  documentation_percentage: number
  skill_coverage_percentage: number
  evidence_coverage_percentage: number
  professional_score: number
}

export interface ProjectCaseStudyDetail extends ProjectTechnicalSummary {
  project_stack_json: ProjectCaseStudySkill[]
  tasks_json: ProjectCaseStudyTask[]
}

export interface Project {
  id: string
  title: string
  summary: string | null
  description: string | null
  status: ProjectStatus
  priority: PriorityLevel
  start_date: string | null
  end_date: string | null
  project_tasks: Task[]
  project_skills: ProjectSkillLink[]
}
