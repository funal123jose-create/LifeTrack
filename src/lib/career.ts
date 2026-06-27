import type { Database } from "@/types/database"

export type ProjectStatus = "Backlog" | "En planeación" | "En curso" | "En pausa" | "Completado" | "Cancelado"
export type TaskStatus = "SIN EMPEZAR" | "EN CURSO" | "COMPLETADO" | "ARCHIVADO"
export type PriorityLevel = "Baja" | "Media" | "Alta"

export type CareerSkill = {
  id: string
  name: string
  category: string
  color: string | null
  icon: string | null
}

export type ProjectTaskSkillLink = {
  id: string
  skill_id: string
  proficiency_level: string | null
  notes: string | null
  career_skills: CareerSkill | null
}

export type ProjectSkillLink = {
  id: string
  skill_id: string
  proficiency_level: string | null
  notes: string | null
  career_skills: CareerSkill | null
}

export type RawCareerSkill = {
  id?: unknown
  name?: unknown
  category?: unknown
  color?: unknown
  icon?: unknown
}

export type RawSkillLink = {
  id?: unknown
  skill_id?: unknown
  proficiency_level?: unknown
  notes?: unknown
  career_skills?: RawCareerSkill | null
}

export type RawProjectTask = {
  id?: unknown
  title?: unknown
  status?: unknown
  project_task_skills?: RawSkillLink[] | null
}

export type RawProject = {
  id?: unknown
  title?: unknown
  summary?: unknown
  description?: unknown
  status?: unknown
  priority?: unknown
  start_date?: unknown
  end_date?: unknown
  project_tasks?: RawProjectTask[] | null
  project_skills?: RawSkillLink[] | null
}

export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export const toOptionalString = (value: unknown) =>
  value === null || value === undefined ? null : String(value)

export const toRequiredString = (value: unknown, fallback = "") =>
  value === null || value === undefined ? fallback : String(value)

export const mapCareerSkill = (skill: RawCareerSkill): CareerSkill => ({
  id: toRequiredString(skill.id),
  name: toRequiredString(skill.name),
  category: toRequiredString(skill.category, "General"),
  color: toOptionalString(skill.color) || "#f97316",
  icon: toOptionalString(skill.icon) || "Cpu",
})

export const mapSkillLink = (link: RawSkillLink): ProjectSkillLink => ({
  id: toRequiredString(link.id),
  skill_id: toRequiredString(link.skill_id),
  proficiency_level: toOptionalString(link.proficiency_level),
  notes: toOptionalString(link.notes),
  career_skills: link.career_skills ? mapCareerSkill(link.career_skills) : null,
})
