import type { Database, Json } from "@/types/database"

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

export type ProjectTaskDoc = {
  id?: string
  title: string
  objective: string
  content: string
  technical_notes: string
  challenges: string
  solution: string
  learnings: string
  result_summary: string
  reference_links: string
  document_content_json: Json | null
  document_content_html: string
}

export type RichEditorJSON = { [key: string]: Json | undefined }

export type ProjectTaskAsset = {
  id: string
  asset_type: "image" | "document" | "link"
  section_key: string
  file_name: string
  file_path: string
  file_url: string
  mime_type: string | null
  file_size: number | null
  created_at: string
}

export type ProjectCaseStudySkill = {
  skill_id: string
  name: string
  category: string | null
  color: string | null
  icon: string | null
  proficiency_level?: string | null
  notes?: string | null
}

export type ProjectCaseStudyAsset = {
  asset_id: string
  asset_type: "image" | "document" | "link"
  section_key: string
  file_name: string
  file_path: string
  file_url: string
  mime_type: string | null
  file_size: number | null
  created_at: string
}

export type ProjectCaseStudyTaskDoc = {
  doc_id?: string | null
  title?: string | null
  objective?: string | null
  content?: string | null
  technical_notes?: string | null
  challenges?: string | null
  solution?: string | null
  learnings?: string | null
  result_summary?: string | null
  reference_links?: string | null
  document_content_html?: string | null
  document_content_json?: Json | null
}

export type ProjectCaseStudyTask = {
  task_id: string
  task_title: string
  task_status: string
  documentation: ProjectCaseStudyTaskDoc
  skills: ProjectCaseStudySkill[]
  assets: ProjectCaseStudyAsset[]
  total_assets: number
  total_images: number
  total_documents: number
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

export const formatAssetSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "Tamaño no disponible"

  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const getAssetVisual = (mimeType?: string | null, fileName?: string) => {
  const lowerName = (fileName || "").toLowerCase()
  const mime = mimeType || ""

  if (mime.includes("pdf") || lowerName.endsWith(".pdf")) {
    return { label: "PDF", accent: "text-rose-300", bg: "bg-rose-500/[0.10]", border: "border-rose-300/15" }
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv")
  ) {
    return { label: "DATA", accent: "text-emerald-300", bg: "bg-emerald-500/[0.10]", border: "border-emerald-300/15" }
  }

  if (
    mime.includes("word") ||
    lowerName.endsWith(".doc") ||
    lowerName.endsWith(".docx")
  ) {
    return { label: "DOC", accent: "text-blue-300", bg: "bg-blue-500/[0.10]", border: "border-blue-300/15" }
  }

  if (
    mime.includes("presentation") ||
    lowerName.endsWith(".ppt") ||
    lowerName.endsWith(".pptx")
  ) {
    return { label: "PPT", accent: "text-orange-300", bg: "bg-orange-500/[0.10]", border: "border-orange-300/15" }
  }

  if (
    mime.includes("zip") ||
    lowerName.endsWith(".zip") ||
    lowerName.endsWith(".rar") ||
    lowerName.endsWith(".7z")
  ) {
    return { label: "ZIP", accent: "text-purple-300", bg: "bg-purple-500/[0.10]", border: "border-purple-300/15" }
  }

  return { label: "FILE", accent: "text-slate-300", bg: "bg-white/[0.045]", border: "border-white/[0.08]" }
}

export const buildRichDocumentSeed = (taskTitle: string, doc?: Partial<ProjectTaskDoc> | null): RichEditorJSON => {
  const paragraph = (text?: string | null) => ({
    type: "paragraph",
    content: text ? [{ type: "text", text }] : undefined,
  })

  const heading = (text: string, level: 1 | 2 | 3 = 2) => ({
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  })

  return {
    type: "doc",
    content: [
      heading(doc?.title || taskTitle || "Documento de subtarea", 1),
      paragraph("Documenta aquí el proceso completo de esta subtarea. Puedes usar títulos, colores, resaltados, listas, enlaces y bloques técnicos."),
      heading("Objetivo", 2),
      paragraph(doc?.objective || ""),
      heading("Proceso realizado / bitácora", 2),
      paragraph(doc?.content || ""),
      heading("Notas técnicas", 2),
      paragraph(doc?.technical_notes || ""),
      heading("Problemas encontrados", 2),
      paragraph(doc?.challenges || ""),
      heading("Solución aplicada", 2),
      paragraph(doc?.solution || ""),
      heading("Aprendizajes", 2),
      paragraph(doc?.learnings || ""),
      heading("Resultado final", 2),
      paragraph(doc?.result_summary || ""),
      heading("Links / referencias", 2),
      paragraph(doc?.reference_links || ""),
    ],
  }
}

export const splitStack = (stack?: string | null) =>
  (stack || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

export const getCaseStudyDocHasContent = (doc?: ProjectCaseStudyTaskDoc | null) => {
  if (!doc) return false

  return Boolean(
    doc.document_content_html ||
      doc.objective ||
      doc.content ||
      doc.technical_notes ||
      doc.challenges ||
      doc.solution ||
      doc.learnings ||
      doc.result_summary ||
      doc.reference_links
  )
}

export const getTaskStatusTone = (status?: string | null) => {
  const normalized = String(status || "").toUpperCase()

  if (normalized === "COMPLETADO") return "border-emerald-300/16 bg-emerald-500/[0.08] text-emerald-200"
  if (normalized === "EN CURSO") return "border-blue-300/16 bg-blue-500/[0.08] text-blue-200"
  if (normalized === "ARCHIVADO") return "border-zinc-300/10 bg-zinc-500/[0.06] text-zinc-300"

  return "border-slate-300/10 bg-slate-500/[0.06] text-slate-300"
}

export const getProjectPriorityTone = (priority?: PriorityLevel | null) => {
  if (priority === "Alta") return "border-red-400/25 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.16)]"
  if (priority === "Media") return "border-amber-400/25 bg-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.12)]"

  return "border-blue-400/25 bg-blue-500/10 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.12)]"
}

export const getScoreTone = (score?: number | null) => {
  const safeScore = Number(score || 0)

  if (safeScore >= 80) {
    return {
      label: "Excelente",
      text: "text-emerald-200",
      border: "border-emerald-300/20",
      bg: "bg-emerald-500/[0.10]",
      gradient: "from-emerald-500 via-teal-300 to-lime-300",
    }
  }

  if (safeScore >= 55) {
    return {
      label: "Sólido",
      text: "text-cyan-200",
      border: "border-cyan-300/20",
      bg: "bg-cyan-500/[0.10]",
      gradient: "from-cyan-500 via-blue-300 to-sky-300",
    }
  }

  if (safeScore >= 30) {
    return {
      label: "En construcción",
      text: "text-orange-200",
      border: "border-orange-300/20",
      bg: "bg-orange-500/[0.10]",
      gradient: "from-orange-600 via-amber-400 to-yellow-200",
    }
  }

  return {
    label: "Inicial",
    text: "text-slate-300",
    border: "border-white/[0.08]",
    bg: "bg-white/[0.035]",
    gradient: "from-slate-600 via-slate-400 to-slate-300",
  }
}
