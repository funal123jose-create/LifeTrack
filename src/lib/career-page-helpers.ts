import type { ProjectStatus, ProjectTaskDoc } from "@/lib/career"

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
