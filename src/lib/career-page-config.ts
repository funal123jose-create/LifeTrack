import type { Variants } from "framer-motion"
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Play,
  X,
  type LucideIcon,
} from "lucide-react"
import type { ProjectStatus, TaskStatus } from "@/lib/career"

export const macroColumns: {
  id: ProjectStatus
  label: string
  color: string
  bg: string
  borderGlow: string
  icon: LucideIcon
}[] = [
  { id: "Backlog", label: "Backlog", color: "text-slate-400", bg: "bg-slate-500/5", borderGlow: "group-hover:border-slate-500/30", icon: HelpCircle },
  { id: "En planeación", label: "Planeación", color: "text-amber-500", bg: "bg-amber-500/5", borderGlow: "group-hover:border-amber-500/30", icon: Clock },
  { id: "En curso", label: "En Curso", color: "text-blue-500", bg: "bg-blue-500/5", borderGlow: "group-hover:border-blue-500/30", icon: Play },
  { id: "En pausa", label: "En Pausa", color: "text-purple-400", bg: "bg-purple-500/5", borderGlow: "group-hover:border-purple-500/30", icon: AlertCircle },
  { id: "Completado", label: "Completado", color: "text-emerald-500", bg: "bg-emerald-500/5", borderGlow: "group-hover:border-emerald-500/30", icon: CheckCircle2 },
  { id: "Cancelado", label: "Cancelado", color: "text-rose-400", bg: "bg-rose-500/5", borderGlow: "group-hover:border-rose-500/30", icon: X },
]

export const microColumns: {
  id: TaskStatus
  label: string
  color: string
  border: string
  icon: LucideIcon
}[] = [
  { id: "SIN EMPEZAR", label: "Sin empezar", color: "text-slate-400", border: "border-slate-500/10", icon: Circle },
  { id: "EN CURSO", label: "En curso", color: "text-blue-400", border: "border-blue-500/10", icon: Clock },
  { id: "COMPLETADO", label: "Completado", color: "text-emerald-400", border: "border-emerald-400/10", icon: CheckCircle2 },
  { id: "ARCHIVADO", label: "Archivado", color: "text-zinc-500", border: "border-zinc-500/10", icon: Archive },
]

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.055 } },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.96, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
}
