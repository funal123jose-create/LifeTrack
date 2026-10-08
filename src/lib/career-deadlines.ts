export type DeadlineProject = {
  id: string
  title: string
  status: string | null
  start_date: string | null
  end_date: string | null
  progress?: number | null
  project_tasks?: { status: string }[] | null
}

export type DeadlineAlert = {
  project: DeadlineProject
  kind: "tomorrow" | "overdue"
  days: number
}

export function limaToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${value.year}-${value.month}-${value.day}`
}

function dateNumber(value: string): number {
  const [year, month, day] = value.split("-").map(Number)
  return Date.UTC(year, month - 1, day) / 86_400_000
}

export function validDateRange(start: string | null, end: string | null): boolean {
  return !start || !end || dateNumber(end) >= dateNumber(start)
}

export function deadlineFor(project: DeadlineProject, today = limaToday()): DeadlineAlert | null {
  if (!project.end_date || project.status === "Completado" || project.status === "Cancelado" || project.status === "En pausa") return null
  const tasks = project.project_tasks || []
  if ((project.progress ?? 0) >= 100 || (tasks.length > 0 && tasks.every((task) => task.status === "COMPLETADO"))) return null
  const days = dateNumber(project.end_date) - dateNumber(today)
  if (days !== 1 && days >= 0) return null
  return { project, kind: days === 1 ? "tomorrow" : "overdue", days }
}

export function deadlineAlerts<T extends DeadlineProject>(projects: T[], today = limaToday()): DeadlineAlert[] {
  return projects.flatMap((project) => {
    const alert = deadlineFor(project, today)
    return alert ? [alert] : []
  }).sort((a, b) => a.days - b.days)
}

export function formatProjectDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)))
}
