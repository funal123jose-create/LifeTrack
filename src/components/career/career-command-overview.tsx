"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog } from "radix-ui"
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2,
  ChevronDown, Clock3, Code2, Database, ExternalLink, FileCode2, FileImage, FileText,
  FolderKanban, ImageIcon, Layers3, ListChecks, Search, Sparkles, Target, X,
  type LucideIcon,
} from "lucide-react"
import {
  siDatabricks, siFigma, siGithub, siJupyter, siMysql, siNextdotjs, siPostgresql,
  siPython, siReact, siSqlite, siSupabase, siTypescript,
} from "simple-icons"
import type { CareerSkill } from "@/lib/career"
import { CareerPeriodFilter, CareerSelect as NativeSelect } from "@/components/career/career-filters"
import { careerPeriodSummary, type CareerPeriod } from "@/lib/career-period"
import type { Project, ProjectProfessionalScore, ProjectTechnicalSummary } from "@/lib/career-page-models"
import { activityTimeline, careerOverviewData, evidenceKind, type CareerActivity, type CareerDocument, type CareerEvidence } from "@/lib/career-overview"

const surface = "group min-w-0 rounded-xl border border-orange-200/15 bg-[linear-gradient(155deg,rgba(10,35,49,.96),rgba(6,23,36,.97)_72%)] p-3 shadow-[inset_0_1px_rgba(255,255,255,.035),0_12px_32px_rgba(0,7,15,.13)] transition-[border-color,box-shadow] duration-300 hover:border-orange-300/30 hover:shadow-[0_18px_38px_rgba(0,7,15,.19)]"
const percent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const statusColors: Record<string, string> = { "Completado": "#ff8a34", "En curso": "#f9b45a", "En planeación": "#83a9c4", "Backlog": "#667a91", "En pausa": "#b698b2", "Cancelado": "#7a818b" }
const taskColors = ["#ff8a34", "#f7bd6d", "#566c80", "#33475a"]
type SummaryMetric = "documents" | "productivity" | "projects" | "skills"
const brandIcons: Array<[RegExp, { path: string; hex: string }]> = [
  [/python/i, siPython], [/postgres/i, siPostgresql], [/mysql/i, siMysql], [/sqlite/i, siSqlite],
  [/react/i, siReact], [/next/i, siNextdotjs], [/supabase/i, siSupabase],
  [/databricks/i, siDatabricks], [/typescript/i, siTypescript], [/jupyter/i, siJupyter],
  [/figma/i, siFigma], [/github|git\b/i, siGithub],
]

function BrandMark({ name, size = 18 }: { name: string; size?: number }) {
  if (/power bi/i.test(name)) return <Image src="/images/lifetrack/tech/power-bi.svg" alt="" width={size} height={size} style={{ width: size, height: size }} className="object-contain" />
  if (/azure/i.test(name)) return <Image src="/images/lifetrack/tech/azure.svg" alt="" width={size} height={size} style={{ width: size, height: size }} className="object-contain" />
  const brand = brandIcons.find(([pattern]) => pattern.test(name))?.[1]
  if (brand) return <svg width={size} height={size} viewBox="0 0 24 24" fill={brand.hex === "000000" ? "#e8eef5" : `#${brand.hex}`} aria-hidden="true"><path d={brand.path} /></svg>
  if (/sql/i.test(name)) return <Database size={size} className="text-cyan-300" aria-hidden="true" />
  return <Code2 size={size} className="text-orange-300" aria-hidden="true" />
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (reduced) return
    const controls = animate(0, value, { duration: .85, ease: "easeOut", onUpdate: (current) => setDisplay(Math.round(current)) })
    return () => controls.stop()
  }, [value, reduced])
  return <>{reduced ? value : display}{suffix}</>
}

function Fill({ value, className = "" }: { value: number; className?: string }) {
  const reduced = useReducedMotion()
  return <span className={`block h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}><motion.span className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" initial={reduced ? false : { width: 0 }} animate={{ width: `${percent(value)}%` }} transition={{ duration: .8, ease: "easeOut" }} /></span>
}

function SectionHeading({ icon: Icon, title, detail, action }: { icon: LucideIcon; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="flex min-w-0 flex-wrap items-start gap-2 border-b border-white/10 pb-2.5"><span className="mt-0.5 shrink-0 text-orange-400 transition-transform duration-300 group-hover:scale-110"><Icon size={17} /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-white">{title}</h2>{detail && <p className="text-[10px] text-slate-400">{detail}</p>}</div>{action && <div className="ml-auto flex w-full justify-start gap-1 sm:w-auto sm:justify-end">{action}</div>}</div>
}

function SummaryCard({ icon: Icon, title, value, caption, active, onClick, children, visual }: {
  icon: LucideIcon; title: string; value: React.ReactNode; caption: string; active: boolean; onClick: () => void; children?: React.ReactNode; visual?: React.ReactNode
}) {
  return <button type="button" onClick={onClick} aria-label={`Ver desglose de ${title}`} aria-expanded={active} aria-controls={active ? "career-summary-detail" : undefined} className={`group/kpi flex min-h-28 min-w-0 flex-col rounded-md border bg-[#081924]/80 p-2.5 text-left shadow-[inset_0_1px_rgba(255,255,255,.035)] transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-orange-300/60 hover:bg-[#102a39] hover:shadow-[0_10px_26px_rgba(249,115,22,.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 active:translate-y-0 motion-reduce:transform-none ${active ? "border-orange-300/75 bg-[#102a39] shadow-[inset_0_0_0_1px_rgba(251,146,60,.14),0_0_20px_rgba(249,115,22,.13)]" : "border-orange-300/20"}`}>
    <span className="flex w-full items-center gap-2 text-[10px] text-slate-300"><Icon size={17} className="shrink-0 text-orange-400 transition-transform duration-300 group-hover/kpi:scale-110" /><span className="min-w-0 flex-1">{title}</span><ChevronDown size={13} className={`shrink-0 text-orange-300 transition-transform duration-300 ${active ? "rotate-180" : "group-hover/kpi:translate-y-0.5"}`} /></span>
    <span className="mt-1 flex w-full min-w-0 flex-1 items-center justify-between gap-2"><strong className="min-w-0 text-xl text-white">{value}</strong>{visual}</span>
    {children && <span className="block w-full">{children}</span>}
    <span className="mt-1 block text-[9px] text-slate-400">{caption}</span>
  </button>
}

function ProductivityBars({ value }: { value: number }) {
  const reduced = useReducedMotion()
  const filled = percent(value)
  return <span className="group/bars flex h-11 w-16 shrink-0 items-end gap-1" role="img" aria-label={`${filled}% de subtareas completadas`} title={`${filled}% de subtareas completadas`}>
    {Array.from({ length: 7 }, (_, index) => {
      const segment = Math.max(0, Math.min(1, (filled / 100 * 7) - index))
      return <span key={index} className="relative w-1.5 overflow-hidden rounded-t-sm bg-slate-600/55 transition-colors group-hover/kpi:bg-slate-500/65" style={{ height: 11 + index * 4 }}><motion.span className="absolute inset-x-0 bottom-0 rounded-t-sm bg-gradient-to-t from-orange-500 to-amber-300 shadow-[0_0_8px_rgba(255,151,54,.5)]" initial={reduced ? false : { height: 0 }} animate={{ height: `${segment * 100}%` }} transition={{ delay: index * .055, duration: .55, ease: "easeOut" }} /></span>
    })}
  </span>
}

function SkillProgressRing({ value }: { value: number }) {
  const reduced = useReducedMotion()
  const filled = percent(value)
  const circumference = 2 * Math.PI * 22
  return <span className="relative block h-12 w-12 shrink-0 transition-transform duration-300 group-hover/kpi:scale-105" role="img" aria-label={`${filled}% de habilidades aplicadas`} title={`${filled}% de habilidades aplicadas`}>
    <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(132,151,171,.22)" strokeWidth="4" /><motion.circle cx="26" cy="26" r="22" fill="none" stroke="#ff9c45" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} initial={reduced ? false : { strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - filled / 100) }} transition={{ duration: .9, ease: "easeOut" }} className="drop-shadow-[0_0_5px_rgba(255,154,69,.65)]" /></svg>
    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-orange-100">{filled}%</span>
  </span>
}

function HeroMetric({ icon: Icon, label, value, detail, progress, index }: { icon: LucideIcon; label: string; value: string; detail: string; progress?: number; index: number }) {
  const reduced = useReducedMotion()
  return <motion.div initial={reduced ? false : { opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .42, delay: index * .08 }} className="group/metric min-w-0 rounded-lg border border-orange-300/30 bg-[#17191e]/85 p-3 shadow-[0_10px_25px_rgba(0,0,0,.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/70 hover:shadow-[0_12px_30px_rgba(249,115,22,.16)] motion-reduce:transform-none motion-reduce:transition-none">
    <div className="flex min-h-9 items-center gap-1 sm:gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-orange-300/35 bg-orange-400/10 text-orange-300 transition-transform group-hover/metric:scale-110 sm:h-9 sm:w-9"><Icon size={17} /></span><span className="text-[10px] font-semibold leading-3.5 text-slate-100 sm:text-[11px] sm:leading-4">{label}</span></div>
    <div className="mt-2 flex items-end gap-2"><strong className="text-2xl leading-none text-white">{value}</strong>{progress !== undefined && <span className="ml-auto text-[10px] font-bold text-orange-300">{percent(progress)}%</span>}</div>
    <p className="mt-1 text-[10px] text-slate-400">{detail}</p>{progress !== undefined && <Fill value={progress} className="mt-2" />}
  </motion.div>
}

function Donut({ items, value, label, size = 150, activeIndex, onActiveIndexChange }: {
  items: Array<{ name: string; value: number; color: string }>; value: string; label: string; size?: number; activeIndex?: number | null; onActiveIndexChange?: (index: number | null) => void
}) {
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)
  const visible = items.map((item, index) => ({ ...item, index })).filter((item) => item.value > 0)
  const selected = activeIndex ?? hovered
  const highlighted = selected === null ? null : items[selected]?.value > 0 ? items[selected] : null
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const preceding = selected === null ? 0 : items.slice(0, selected).reduce((sum, item) => sum + item.value, 0)
  const angle = total && highlighted ? (90 - (preceding + highlighted.value / 2) / total * 360) * Math.PI / 180 : 0
  const directionX = Math.cos(angle)
  const directionY = -Math.sin(angle)
  const tooltipPosition: React.CSSProperties = Math.abs(directionX) >= Math.abs(directionY)
    ? { top: "50%", transform: "translateY(-50%)", ...(directionX >= 0 ? { left: "calc(100% + 6px)" } : { right: "calc(100% + 6px)" }) }
    : { left: "50%", transform: "translateX(-50%)", ...(directionY < 0 ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }) }
  const selectSegment = (index: number | null) => { setHovered(index); onActiveIndexChange?.(index) }

  return <div className="relative mx-auto shrink-0" style={{ width: size, height: size }} onMouseLeave={() => selectSegment(null)}>
    <PieChart width={size} height={size}>
      <Pie data={visible.length ? visible : [{ name: "Sin datos", value: 1, color: "#26394a", index: -1 }]} dataKey="value" nameKey="name" startAngle={90} endAngle={-270} innerRadius={size * .33} outerRadius={size * .46} stroke="#091722" strokeWidth={2} paddingAngle={visible.length > 1 ? 2 : 0} isAnimationActive={!reduced} animationDuration={800} onMouseEnter={(_, index) => { if (visible[index]) selectSegment(visible[index].index) }} onClick={(_, index) => { if (visible[index]) selectSegment(visible[index].index) }}>
        {(visible.length ? visible : [{ name: "Sin datos", color: "#26394a", index: -1 }]).map((item) => (
          <Cell
            key={item.name}
            fill={item.color}
            opacity={selected === null || item.index === selected ? 1 : .28}
            stroke={item.index === selected ? "#ffe0b6" : "#091722"}
            strokeWidth={item.index === selected ? 3 : 2}
            style={{ filter: item.index === selected ? "drop-shadow(0 0 7px " + item.color + ")" : undefined, transition: "opacity 180ms ease, filter 180ms ease, stroke 180ms ease" }}
            className="cursor-pointer outline-none"
          />
        ))}
      </Pie>
    </PieChart>
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-live="polite"><strong className="text-xl font-bold text-white">{highlighted ? highlighted.value : value}</strong><span className="text-[9px] text-slate-400">{highlighted ? percent(highlighted.value / total * 100) + "% · " + highlighted.name : label}</span></div>
    {highlighted && <div role="status" className="pointer-events-none absolute z-20 w-28 rounded-md border border-orange-300/45 bg-[#081b29]/97 px-2 py-1.5 text-center text-[10px] text-slate-100 shadow-[0_8px_24px_rgba(0,0,0,.45),0_0_12px_rgba(249,115,22,.22)]" style={tooltipPosition}><strong className="block text-orange-200">{highlighted.name}</strong><span>{highlighted.value} · {percent(highlighted.value / total * 100)}%</span></div>}
  </div>
}

function EvidenceRow({ asset, project }: { asset: CareerEvidence; project?: Project }) {
  const kind = evidenceKind(asset)
  const category = ({ references: "Referencias", documents: "Documentación", images: "Imágenes", evidence: "Evidencia" } as Record<string, string>)[asset.section_key || ""] || (asset.section_key || asset.asset_type || "General").replace(/[_-]/g, " ")
  const Icon = kind.label === "Imagen" ? FileImage : kind.label === "Código" ? FileCode2 : FileText
  return <a href={asset.file_url} target="_blank" rel="noopener noreferrer" title={`${asset.file_name} · ${project?.title || "Proyecto no disponible"}`} className="group/file flex min-w-0 items-center gap-2 rounded-md border border-white/6 bg-[#081824]/75 px-2 py-1.5 transition-all hover:border-orange-300/40 hover:bg-orange-400/7 focus-visible:outline focus-visible:outline-orange-300">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5" style={{ color: kind.color }}>{kind.short === "BI" ? <BrandMark name="Power BI" size={18} /> : <Icon size={16} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-slate-100">{asset.file_name}</span><span className="block truncate text-[9px] text-slate-400">{project?.title || "Proyecto no disponible"} · {asset.created_at.slice(0, 10)} · {category}</span></span><span className="hidden shrink-0 rounded border border-orange-300/20 bg-orange-400/8 px-1.5 py-0.5 text-[9px] text-orange-200 sm:block">{kind.label}</span><ExternalLink size={12} className="shrink-0 text-slate-500 transition-transform group-hover/file:-translate-y-0.5 group-hover/file:translate-x-0.5 group-hover/file:text-orange-300" /></a>
}

export function CareerCommandOverview({ projects, scores, summaries, skills, evidence, activity, documents, view, onViewChange, onOpenProject, onOpenCaseStudy, onShowBoard }: {
  projects: Project[]
  scores: Record<string, ProjectProfessionalScore>
  summaries: Record<string, ProjectTechnicalSummary>
  skills: CareerSkill[]
  evidence: CareerEvidence[]
  activity: CareerActivity[]
  documents: CareerDocument[]
  view: "overview" | "board"
  onViewChange: (view: "overview" | "board") => void
  onOpenProject: (project: Project) => void
  onOpenCaseStudy: (projectId: string) => void
  onShowBoard: () => void
}) {
  const reduced = useReducedMotion()
  const [projectStatus, setProjectStatus] = useState("all")
  const [taskProject, setTaskProject] = useState("all")
  const [activeTaskSegment, setActiveTaskSegment] = useState<number | null>(null)
  const [activeDocSegment, setActiveDocSegment] = useState<number | null>(null)
  const [timelineProject, setTimelineProject] = useState("all")
  const [timelineMonths, setTimelineMonths] = useState("12")
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [evidenceProject, setEvidenceProject] = useState("all")
  const [evidenceType, setEvidenceType] = useState("all")
  const [evidenceSearch, setEvidenceSearch] = useState("")
  const [activeSummary, setActiveSummary] = useState<SummaryMetric | null>(null)
  const [summaryPeriod, setSummaryPeriod] = useState<CareerPeriod>({ kind: "all" })
  const data = careerOverviewData(projects, scores, summaries, skills, evidence, activity, documents)
  const projectMap = new Map(projects.map((project) => [project.id, project]))
  const taskPool = taskProject === "all" ? projects.flatMap((project) => project.project_tasks) : projectMap.get(taskProject)?.project_tasks || []
  const taskSegments = [
    { name: "Completadas", value: taskPool.filter((task) => task.status === "COMPLETADO").length, color: taskColors[0] },
    { name: "En curso", value: taskPool.filter((task) => task.status === "EN CURSO").length, color: taskColors[1] },
    { name: "Pendientes", value: taskPool.filter((task) => task.status === "SIN EMPEZAR").length, color: taskColors[2] },
    { name: "Archivadas", value: taskPool.filter((task) => task.status === "ARCHIVADO").length, color: taskColors[3] },
  ]
  const filteredProjects = [...projects].filter((project) => projectStatus === "all" || project.status === projectStatus).sort((a, b) => (scores[b.id]?.professional_score || 0) - (scores[a.id]?.professional_score || 0))
  const timeline = useMemo(() => activityTimeline(projects, activity, timelineProject, Number(timelineMonths)), [projects, activity, timelineProject, timelineMonths])
  const filteredEvidence = evidence.filter((asset) => (evidenceProject === "all" || asset.project_id === evidenceProject) && (evidenceType === "all" || evidenceKind(asset).label === evidenceType) && asset.file_name.toLowerCase().includes(evidenceSearch.toLowerCase()))
  const featured = data.featured
  const featuredSkills = featured ? Array.from(new Set([
    ...featured.project_skills.map((link) => link.career_skills?.name),
    ...featured.project_tasks.flatMap((task) => task.task_skills.map((link) => link.career_skills?.name)),
  ].filter((name): name is string => Boolean(name)))) : []
  const featuredImage = featured ? evidence.find((asset) => asset.project_id === featured.id && asset.mime_type?.startsWith("image/")) : null
  const featuredGitHub = featured ? documents.filter((doc) => doc.project_id === featured.id).flatMap((doc) => doc.reference_links?.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/gi) || [])[0] : undefined
  const maxSkillUses = Math.max(1, ...data.appliedSkills.map((skill) => skill.uses))
  const completedProjects = data.projectStatuses.Completado || 0
  const periodData = careerPeriodSummary(projects, documents, summaryPeriod)
  const isPeriod = summaryPeriod.kind !== "all"
  const periodSkillCount = periodData.skillIds.size
  const periodProjectCount = periodData.createdProjects.length
  const periodTaskCount = periodData.completedTasks.length
  const periodDocumentCount = new Set(periodData.documentedTasks.map((doc) => doc.task_id)).size
  const activeCount = data.activeProjects.length
  const docSegments = [
    { name: "Documentadas", value: data.documented, color: taskColors[0] },
    { name: "En proceso", value: data.documentationInProgress, color: taskColors[1] },
    { name: "Pendientes", value: data.documentationPending, color: taskColors[2] },
  ]
  const summaryDetails = isPeriod ? activeSummary === "documents" ? {
    title: "Documentos actualizados en el periodo", note: `${periodDocumentCount} subtareas con documentación actualizada`,
    rows: periodData.documentedTasks.map((doc) => ({ label: doc.title || projects.find((project) => project.id === doc.project_id)?.title || "Subtarea", value: doc.updated_at.slice(0, 10), progress: 100 })),
  } : activeSummary === "productivity" ? {
    title: "Subtareas cerradas en el periodo", note: `${periodTaskCount} cierres con fecha registrada`,
    rows: periodData.completedTasks.map((task) => ({ label: task.title, value: task.completed_at?.slice(0, 10) || "", progress: 100 })),
  } : activeSummary === "projects" ? {
    title: "Proyectos creados en el periodo", note: `${periodProjectCount} proyectos con fecha de creación`,
    rows: periodData.createdProjects.map((project) => ({ label: project.title, value: project.created_at?.slice(0, 10) || "", progress: 100 })),
  } : activeSummary === "skills" ? {
    title: "Skills en subtareas cerradas", note: `${periodSkillCount} habilidades distintas aplicadas en cierres del periodo`,
    rows: skills.filter((skill) => periodData.skillIds.has(skill.id)).map((skill) => ({ label: skill.name, value: "Aplicada", progress: 100 })),
  } : null : activeSummary === "documents" ? {
    title: "Cobertura documental por proyecto", note: `${data.documented} documentadas · ${data.documentationInProgress} en proceso · ${data.documentationPending} pendientes`,
    rows: projects.map((project) => ({ label: project.title, value: `${scores[project.id]?.documented_tasks || 0}/${project.project_tasks.length}`, progress: project.project_tasks.length ? (scores[project.id]?.documented_tasks || 0) / project.project_tasks.length * 100 : 0 })),
  } : activeSummary === "productivity" ? {
    title: "Avance de subtareas por proyecto", note: `${data.completed} completadas · ${data.inProgress} en curso · ${data.pending} pendientes · ${data.archived} archivadas`,
    rows: projects.map((project) => ({ label: project.title, value: `${project.project_tasks.filter((task) => task.status === "COMPLETADO").length}/${project.project_tasks.length}`, progress: scores[project.id]?.task_completion_percentage || 0 })),
  } : activeSummary === "projects" ? {
    title: "Distribución de proyectos", note: `${projects.length} proyectos registrados con su estado actual`,
    rows: Object.entries(data.projectStatuses).map(([status, count]) => ({ label: status, value: String(count), progress: projects.length ? count / projects.length * 100 : 0 })),
  } : activeSummary === "skills" ? {
    title: "Habilidades vinculadas", note: `${data.appliedSkills.length} de ${skills.length} habilidades registradas tienen vínculos con proyectos o subtareas`,
    rows: data.appliedSkills.map((skill) => ({ label: skill.name, value: `${skill.uses} vínculos`, progress: skill.uses / maxSkillUses * 100 })),
  } : null

  const evidencePortal = <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-[#020b14]/75 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in" /><Dialog.Content className="fixed inset-x-2 top-1/2 z-[81] mx-auto flex max-h-[88dvh] w-[calc(100%-1rem)] max-w-4xl -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-orange-300/30 bg-[#091b29] text-slate-100 shadow-[0_35px_100px_rgba(0,0,0,.7),0_0_30px_rgba(249,115,22,.12)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"><div className="flex items-center justify-between gap-3 border-b border-orange-300/15 p-4"><div><Dialog.Title className="text-lg font-bold">Todas las evidencias</Dialog.Title><Dialog.Description className="text-xs text-slate-400">{filteredEvidence.length} archivos de {evidence.length} registrados</Dialog.Description></div><Dialog.Close className="rounded-md p-2 text-slate-400 transition-colors hover:bg-orange-400/10 hover:text-white" aria-label="Cerrar evidencias"><X size={18} /></Dialog.Close></div><div className="flex flex-wrap gap-2 border-b border-white/10 p-3"><NativeSelect label="Filtrar evidencias por proyecto" value={evidenceProject} onChange={setEvidenceProject}><option value="all">Todos los proyectos</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</NativeSelect><NativeSelect label="Filtrar evidencias por tipo" value={evidenceType} onChange={setEvidenceType}><option value="all">Todos los tipos</option>{Array.from(new Set(evidence.map((asset) => evidenceKind(asset).label))).map((type) => <option key={type} value={type}>{type}</option>)}</NativeSelect><label className="flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-sky-200/15 bg-[#0a2230] px-2 text-slate-400 focus-within:border-orange-300/65"><Search size={14} /><span className="sr-only">Buscar archivo</span><input value={evidenceSearch} onChange={(event) => setEvidenceSearch(event.target.value)} placeholder="Buscar archivo" className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500" /></label></div><div className="career-project-scroll min-h-0 space-y-1.5 overflow-y-auto p-3">{filteredEvidence.map((asset) => <EvidenceRow key={asset.id} asset={asset} project={projectMap.get(asset.project_id)} />)}{!filteredEvidence.length && <p className="py-12 text-center text-xs text-slate-400">No hay evidencias con estos filtros.</p>}</div></Dialog.Content></Dialog.Portal>

  return <Dialog.Root open={Boolean(detailProject)} onOpenChange={(open) => { if (!open) setDetailProject(null) }}><div className="career-command space-y-3">
    <section className="career-hero relative isolate overflow-hidden rounded-xl border border-orange-300/20 bg-[#071a2a] p-3 shadow-[inset_0_1px_rgba(255,255,255,.06),0_18px_48px_rgba(0,8,17,.22)] sm:p-4">
      <Image src="/images/lifetrack/career-sunrise.webp" alt="" fill priority loading="eager" sizes="100vw" className="object-cover object-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#041422]/95 via-[#061827]/72 to-[#041722]/63" />
      <div className="relative grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.55fr)_minmax(0,1.9fr)] xl:items-end">
        <div className="z-10 min-w-0">
          <div className="flex flex-wrap items-center gap-2"><Link href="/pilares" className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/20 bg-[#091c2c]/75 px-3 py-1.5 text-[11px] font-semibold text-slate-100 transition-colors hover:border-orange-300/50 hover:text-orange-200"><ArrowLeft size={14} />Volver a Pilares</Link><span className="rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1.5 text-[10px] font-bold uppercase text-orange-300">Pilar profesional</span></div>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.02] text-white sm:text-5xl">Centro de<br /><span className="text-orange-400">Data &amp; Carrera</span></h1>
          <p className="mt-1 text-lg text-sky-100">Convierte tu aprendizaje en resultados reales.</p>
          <p className="mt-2 max-w-[510px] text-xs leading-5 text-slate-300">Proyectos, habilidades y evidencia de tu crecimiento profesional.</p>
          <p className="mt-3 w-fit max-w-full rounded-lg border border-orange-300/20 bg-[#091e2d]/70 px-3 py-2 text-xs italic text-slate-200">“Disciplina en el presente, oportunidades en el futuro.”</p>
        </div>
        <div className="pointer-events-none relative hidden h-[220px] xl:block"><Image src="/images/lifetrack/jose-cutout.webp" alt="" fill sizes="25vw" className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" /></div>
        <div className="z-10 min-w-0"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="inline-flex rounded-md border border-orange-300/25 bg-[#0b1b29]/85 p-1 backdrop-blur-md" role="group" aria-label="Vista de Data y Carrera">{(["overview", "board"] as const).map((target) => <button key={target} type="button" onClick={() => onViewChange(target)} aria-pressed={view === target} className={`rounded px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${view === target ? "border border-orange-300/35 bg-orange-500/25 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,.16)]" : "border border-transparent text-slate-300 hover:bg-orange-400/10 hover:text-white"}`}>{target === "overview" ? "Resumen" : "Tablero"}</button>)}</div><p className="text-right text-[10px] font-bold uppercase text-orange-200/80">Aprender · construir · avanzar</p></div><div className="grid min-w-0 grid-cols-2 gap-2 2xl:grid-cols-4"><HeroMetric index={0} icon={FolderKanban} label="Proyectos activos" value={String(activeCount)} detail={`de ${projects.length} registrados`} progress={projects.length ? activeCount / projects.length * 100 : 0} /><HeroMetric index={1} icon={CheckCircle2} label="Subtareas completadas" value={`${data.completed}/${data.taskCount}`} detail="del total registrado" progress={data.completion} /><HeroMetric index={2} icon={FileText} label="Documentación" value={`${data.documentation}%`} detail={`${data.documented} subtareas`} progress={data.documentation} /><HeroMetric index={3} icon={ImageIcon} label="Evidencias" value={String(data.assets)} detail="archivos y entregables" /></div></div>
      </div>
    </section>

    <section className={`${surface} career-glow`}>
      <SectionHeading icon={BarChart3} title="Resumen profesional" detail={isPeriod ? "Actividad fechada en el periodo seleccionado; no representa el estado histórico del portafolio." : "Indicadores calculados desde tus proyectos y subtareas."} action={<CareerPeriodFilter value={summaryPeriod} onChange={(period) => { setSummaryPeriod(period); setActiveSummary(null) }} />} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard icon={BookOpen} title={isPeriod ? "Documentación actualizada" : "Subtareas documentadas"} value={isPeriod ? <AnimatedNumber value={periodDocumentCount} /> : <><AnimatedNumber value={data.documented} />/{data.taskCount}</>} caption={isPeriod ? "Subtareas con cambios fechados" : "Cobertura documental"} active={activeSummary === "documents"} onClick={() => setActiveSummary(activeSummary === "documents" ? null : "documents")}>{!isPeriod && <Fill value={data.documentation} className="mt-2" />}</SummaryCard>
        <SummaryCard icon={ListChecks} title={isPeriod ? "Subtareas cerradas" : "Productividad registrada"} value={<AnimatedNumber value={isPeriod ? periodTaskCount : data.completion} suffix={isPeriod ? "" : "%"} />} caption={isPeriod ? "Cierres con fecha registrada" : `${data.completed} de ${data.taskCount} subtareas completas`} active={activeSummary === "productivity"} onClick={() => setActiveSummary(activeSummary === "productivity" ? null : "productivity")} visual={!isPeriod ? <ProductivityBars value={data.completion} /> : undefined} />
        <SummaryCard icon={FolderKanban} title={isPeriod ? "Proyectos creados" : "Proyectos completados"} value={isPeriod ? <AnimatedNumber value={periodProjectCount} /> : <><AnimatedNumber value={completedProjects} />/{projects.length}</>} caption={isPeriod ? "Altas registradas en el periodo" : "Distribución real por estado"} active={activeSummary === "projects"} onClick={() => setActiveSummary(activeSummary === "projects" ? null : "projects")}>{!isPeriod && <span className="mt-2 flex flex-wrap gap-1">{Object.entries(data.projectStatuses).map(([status, count]) => <span key={status} title={`${status}: ${count}`} className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[9px] text-slate-300"><i className="h-1.5 w-1.5 rounded-full" style={{ background: statusColors[status] || "#8394a6" }} />{count} {status}</span>)}</span>}</SummaryCard>
        <SummaryCard icon={Layers3} title={isPeriod ? "Skills en cierres" : "Skills aplicadas"} value={isPeriod ? <AnimatedNumber value={periodSkillCount} /> : <><AnimatedNumber value={data.appliedSkills.length} />/{skills.length}</>} caption={isPeriod ? "Habilidades en subtareas cerradas" : "Habilidades con uso registrado"} active={activeSummary === "skills"} onClick={() => setActiveSummary(activeSummary === "skills" ? null : "skills")} visual={!isPeriod ? <SkillProgressRing value={skills.length ? data.appliedSkills.length / skills.length * 100 : 0} /> : undefined} />
        <div className="relative isolate min-h-28 overflow-hidden rounded-md border border-orange-300/20 bg-[#0d1c28]"><Image src="/images/lifetrack/career-sunrise.webp" alt="" fill loading="eager" sizes="320px" className="object-cover object-right opacity-70 transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" /><div className="absolute inset-0 bg-gradient-to-r from-[#081824]/90 to-transparent" /><p className="relative flex h-full items-center gap-2 p-3 text-[11px] italic text-white"><Target size={19} className="shrink-0 text-orange-300" />Pequeños proyectos construyen grandes carreras.</p></div>
      </div>
      <AnimatePresence mode="wait">
        {summaryDetails && <motion.div key={activeSummary} id="career-summary-detail" role="region" aria-label={summaryDetails.title} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? undefined : { opacity: 0, height: 0 }} transition={{ duration: .26 }} className="overflow-hidden">
          <div className="mt-2 rounded-md border border-orange-300/25 bg-[#081b2a] p-3">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-xs font-bold text-white">{summaryDetails.title}</h3><p className="mt-0.5 text-[10px] text-slate-400">{summaryDetails.note}</p></div><button type="button" onClick={() => setActiveSummary(null)} aria-label="Cerrar desglose del resumen" className="rounded-md p-1 text-slate-400 transition-colors hover:bg-orange-400/10 hover:text-white focus-visible:outline focus-visible:outline-orange-300"><X size={15} /></button></div>
            <div className="career-project-scroll mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">{summaryDetails.rows.map((row) => <div key={row.label} className="min-w-0 rounded-md border border-sky-100/10 bg-[#0b2533] p-2 transition-colors hover:border-orange-300/35"><div className="flex items-center justify-between gap-2 text-[10px]"><span className="min-w-0 truncate text-slate-200" title={row.label}>{row.label}</span><strong className="shrink-0 text-orange-200">{row.value}</strong></div><Fill value={row.progress} className="mt-2" /></div>)}{!summaryDetails.rows.length && <p className="text-xs text-slate-400">Sin registros para este indicador.</p>}</div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </section>

    <div className="grid gap-3 xl:grid-cols-[1.3fr_.95fr_.85fr_.85fr]">
      <section className={`${surface} flex flex-col`}><SectionHeading icon={FolderKanban} title="Proyectos y estado" detail="Selecciona un proyecto para consultar su detalle." action={<NativeSelect label="Filtrar proyectos por estado" value={projectStatus} onChange={setProjectStatus}><option value="all">Todos</option>{Object.keys(data.projectStatuses).map((status) => <option key={status} value={status}>{status}</option>)}</NativeSelect>} /><div className="career-project-scroll mt-2 max-h-[248px] min-h-[190px] space-y-1 overflow-y-auto pr-1">{filteredProjects.map((project, index) => { const progress = percent(scores[project.id]?.task_completion_percentage || 0); return <Dialog.Trigger key={project.id} asChild><button type="button" onClick={() => setDetailProject(project)} title={`Ver detalle de ${project.title}`} className="group/row flex w-full min-w-0 items-center gap-2 rounded-md border border-white/6 bg-[#081824] px-2 py-2 text-left transition-all hover:border-orange-300/45 hover:bg-orange-400/7 focus-visible:outline focus-visible:outline-orange-300"><span className="w-5 shrink-0 font-mono text-[10px] text-slate-500">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-100" title={project.title}>{project.title}</span><span className="hidden shrink-0 text-[9px] text-slate-400 sm:inline">{project.status}</span><span className="hidden w-12 shrink-0 sm:block"><Fill value={progress} /></span><span className="w-7 shrink-0 text-right text-[10px] text-orange-200">{progress}%</span></button></Dialog.Trigger> })}{!filteredProjects.length && <p className="py-12 text-center text-xs text-slate-400">No hay proyectos para este filtro.</p>}</div><button type="button" onClick={onShowBoard} className="mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-semibold text-orange-200 transition-colors hover:text-white">Ir al tablero <ArrowRight size={12} /></button></section>

      <section className={`${surface} career-glow flex flex-col`}>
        <SectionHeading icon={CheckCircle2} title="Estado de subtareas" detail="Distribución de estados registrados." action={<NativeSelect label="Filtrar subtareas por proyecto" value={taskProject} onChange={(value) => { setTaskProject(value); setActiveTaskSegment(null) }}><option value="all">Todos los proyectos</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</NativeSelect>} />
        <div className="flex flex-1 flex-col items-center justify-center gap-1 sm:flex-row xl:flex-col 2xl:flex-row">
          <Donut items={taskSegments} value={`${taskPool.length ? percent(taskSegments[0].value / taskPool.length * 100) : 0}%`} label="completadas" activeIndex={activeTaskSegment} onActiveIndexChange={setActiveTaskSegment} />
          <div className="w-full min-w-0 space-y-1.5">{taskSegments.map((part, index) => <button key={part.name} type="button" disabled={!part.value} onMouseEnter={() => setActiveTaskSegment(index)} onMouseLeave={() => setActiveTaskSegment(null)} onFocus={() => setActiveTaskSegment(index)} onBlur={() => setActiveTaskSegment(null)} onClick={() => setActiveTaskSegment(index)} aria-pressed={activeTaskSegment === index} aria-label={`${part.name}: ${part.value} subtareas${taskPool.length ? `, ${percent(part.value / taskPool.length * 100)}%` : ""}`} className={`group/legend flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-[10px] transition-[border-color,background-color,opacity,transform] duration-200 focus-visible:outline focus-visible:outline-orange-300 disabled:cursor-default disabled:opacity-50 ${activeTaskSegment === index ? "border-orange-300/55 bg-orange-400/12 text-white shadow-[0_0_13px_rgba(249,115,22,.14)]" : "border-transparent text-slate-300 hover:border-orange-300/25 hover:bg-orange-400/6"}`}><i className="h-2 w-2 shrink-0 rounded-full transition-transform group-hover/legend:scale-125" style={{ background: part.color }} /><span className="min-w-0 flex-1">{part.name}</span><strong className="text-white">{part.value}</strong></button>)}</div>
        </div>
      </section>

      <section className={`${surface} flex flex-col`}><SectionHeading icon={Layers3} title="Habilidades aplicadas" detail="Todas las skills vinculadas a proyectos o tareas." /><div className="career-project-scroll mt-3 max-h-[252px] min-h-[190px] space-y-2 overflow-y-auto pr-1">{data.appliedSkills.map((skill) => <div key={skill.id} title={`${skill.name}: ${skill.uses} vínculos registrados`} className="group/skill flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-[10px] transition-colors hover:bg-orange-400/7"><span className="shrink-0 transition-transform group-hover/skill:scale-115"><BrandMark name={skill.name} size={16} /></span><span className="w-20 min-w-0 truncate text-slate-200">{skill.name}</span><span className="min-w-0 flex-1"><Fill value={skill.uses / maxSkillUses * 100} /></span><strong className="w-5 text-right text-orange-200">{skill.uses}</strong></div>)}{!data.appliedSkills.length && <p className="py-12 text-center text-xs text-slate-400">Sin habilidades vinculadas.</p>}</div></section>

      <section className={`${surface} flex flex-col`}><SectionHeading icon={Code2} title="Tech Stack" detail="Tecnologías realmente utilizadas." /><div className="career-project-scroll mt-3 grid max-h-[252px] min-h-[190px] grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">{data.appliedSkills.map((skill) => <div key={skill.id} title={`${skill.name} · ${skill.uses} aplicaciones`} className="group/tech flex min-h-10 min-w-0 items-center gap-1.5 rounded-md border border-white/10 bg-[#0a1a27] px-2 py-1.5 transition-all hover:-translate-y-0.5 hover:border-orange-300/45 hover:bg-orange-400/8 motion-reduce:transform-none"><span className="shrink-0 transition-transform group-hover/tech:scale-110"><BrandMark name={skill.name} size={18} /></span><span className="truncate text-[10px] text-slate-200">{skill.name}</span></div>)}{!data.appliedSkills.length && <p className="col-span-2 py-12 text-center text-xs text-slate-400">Sin stack aplicado.</p>}</div></section>
    </div>

    <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr_.95fr]">
      <section className={`${surface} flex flex-col`}><SectionHeading icon={BarChart3} title="Línea de actividad profesional" detail="Eventos fechados del historial; no son horas ni progreso estimado." action={<div className="flex gap-1"><NativeSelect label="Proyecto de la línea temporal" value={timelineProject} onChange={setTimelineProject}><option value="all">Todos</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</NativeSelect><NativeSelect label="Periodo de la línea temporal" value={timelineMonths} onChange={setTimelineMonths}><option value="3">3 meses</option><option value="6">6 meses</option><option value="12">12 meses</option></NativeSelect></div>} /><div className="mt-3 h-[178px] w-full min-w-0 flex-1">{timeline.some((month) => month.count > 0) ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={178} initialDimension={{ width: 320, height: 178 }}><AreaChart data={timeline} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}><defs><linearGradient id="careerActivityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a34" stopOpacity={.42} /><stop offset="100%" stopColor="#ff8a34" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#254052" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="label" stroke="#8da0ad" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis stroke="#8da0ad" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ border: "1px solid #89562f", borderRadius: 7, background: "#0a1c2a", color: "#f8fafc", fontSize: 11 }} formatter={(value) => [value, "Eventos"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.key || ""} /><Area type="monotone" dataKey="count" stroke="#ff9a46" strokeWidth={2.5} fill="url(#careerActivityGradient)" isAnimationActive={!reduced} activeDot={{ r: 5, stroke: "#ffe1b3" }} /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">No hay actividad fechada en este periodo.<br />Prueba otro proyecto o periodo.</div>}</div></section>
      <section className={`${surface} career-glow flex flex-col`}>
        <SectionHeading icon={FileText} title="Documentación y evidencia" detail="Cobertura calculada desde subtareas y documentos." />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:flex-row">
          <Donut items={docSegments} value={`${data.documentation}%`} label="cobertura" activeIndex={activeDocSegment} onActiveIndexChange={setActiveDocSegment} />
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">{[{ label: "Documentadas", value: data.documented, icon: BookOpen, color: "text-orange-300" }, { label: "En proceso", value: data.documentationInProgress, icon: Clock3, color: "text-amber-200" }, { label: "Pendientes", value: data.documentationPending, icon: ListChecks, color: "text-slate-300" }, { label: "Evidencias", value: data.assets, icon: ImageIcon, color: "text-sky-300" }].map(({ label, value, icon: Icon, color }, index) => <button key={label} type="button" disabled={index < 3 && value === 0} onMouseEnter={() => { if (index < 3 && value) setActiveDocSegment(index) }} onMouseLeave={() => setActiveDocSegment(null)} onFocus={() => { if (index < 3 && value) setActiveDocSegment(index) }} onBlur={() => setActiveDocSegment(null)} onClick={() => index === 3 ? setEvidenceOpen(true) : setActiveDocSegment(index)} aria-pressed={index < 3 ? activeDocSegment === index : undefined} aria-label={index === 3 ? `Ver ${value} evidencias` : `${label}: ${value} subtareas`} className={`rounded-md border bg-[#081925] p-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300/50 hover:bg-orange-400/10 focus-visible:outline focus-visible:outline-orange-300 disabled:cursor-default disabled:opacity-50 motion-reduce:transform-none ${activeDocSegment === index ? "border-orange-300/60 shadow-[0_0_15px_rgba(249,115,22,.18)]" : "border-orange-300/15"}`}><Icon size={15} className={color} /><strong className="mt-1 block text-base text-white">{value}</strong><span className="text-[9px] text-slate-400">{label}</span></button>)}</div>
        </div>
      </section>
      <Dialog.Root open={evidenceOpen} onOpenChange={setEvidenceOpen}><section className={`${surface} flex flex-col`}><SectionHeading icon={ImageIcon} title="Últimas evidencias" detail="Archivos adjuntos a subtareas." action={<Dialog.Trigger asChild><button type="button" className="inline-flex shrink-0 items-center gap-1 text-[10px] text-orange-200 transition-colors hover:text-white">Ver todas <ArrowRight size={12} /></button></Dialog.Trigger>} /><div className="mt-2 space-y-1">{data.recentEvidence.map((asset) => <EvidenceRow key={asset.id} asset={asset} project={projectMap.get(asset.project_id)} />)}{!data.recentEvidence.length && <p className="py-10 text-center text-xs text-slate-400">Aún no hay evidencias registradas.</p>}</div></section>{evidencePortal}</Dialog.Root>
    </div>

    {featured && <section className={`${surface} career-glow relative overflow-hidden p-0`}><div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(249,115,22,.08),transparent_45%)]" /><div className="relative grid gap-3 p-3 xl:grid-cols-[190px_minmax(0,1.2fr)_minmax(0,.65fr)_170px] xl:items-center">
      <div className="relative h-32 overflow-hidden rounded-md border border-orange-300/25 bg-[#101d2b]" title={featuredImage ? "Imagen de evidencia del proyecto" : "Visual ilustrativa; no hay imagen de evidencia"}>{featuredImage ? <Image src={featuredImage.file_url} alt={`Evidencia visual de ${featured.title}`} fill unoptimized sizes="190px" className="object-cover" /> : <><Image src="/images/lifetrack/career-sunrise.webp" alt="" fill sizes="190px" className="object-cover opacity-55" /><Image src="/images/lifetrack/career-bars.png" alt="" fill sizes="190px" className="object-contain p-2" /><span className="absolute bottom-1 left-1 rounded bg-[#071725]/85 px-1.5 py-0.5 text-[8px] text-slate-300">Imagen ilustrativa</span></>}</div>
      <div className="min-w-0"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-orange-300"><Sparkles size={14} />Proyecto destacado</p><div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="max-w-full truncate text-lg font-bold text-white" title={featured.title}>{featured.title}</h2><span className="rounded border px-1.5 py-0.5 text-[9px]" style={{ color: statusColors[featured.status] || "#a7b6c8", borderColor: `${statusColors[featured.status] || "#a7b6c8"}66` }}>{featured.status}</span></div><p className="mt-1 line-clamp-2 text-[11px] text-slate-300">{featured.summary || featured.description || "Sin descripción técnica registrada."}</p><div className="career-project-scroll mt-2 flex max-h-20 flex-wrap content-start gap-1 overflow-y-auto px-1 py-1.5">{featuredSkills.map((name) => <span key={name} title={name} className="group/chip flex items-center gap-1 rounded border border-orange-300/20 bg-orange-400/7 px-1.5 py-0.5 text-[9px] text-orange-100 transition-[border-color,background-color,box-shadow] duration-200 hover:border-orange-300/55 hover:bg-orange-400/16 hover:shadow-[0_0_12px_rgba(249,115,22,.22)]"><span className="transition-transform duration-200 group-hover/chip:scale-105"><BrandMark name={name} size={12} /></span>{name}</span>)}</div></div>
      <div className="min-w-0"><div className="flex justify-between text-[11px] text-slate-300"><span>Avance de tareas</span><strong className="text-white">{percent(scores[featured.id]?.task_completion_percentage || 0)}%</strong></div><Fill value={scores[featured.id]?.task_completion_percentage || 0} className="mt-2" /><p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400"><CalendarDays size={12} />{featured.end_date ? `${featured.status === "Completado" ? "Cierre" : "Fecha objetivo"}: ${featured.end_date}` : "Fecha no registrada"}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><ImageIcon size={12} />{summaries[featured.id]?.total_assets || 0} evidencias · Tipo no registrado</p></div>
      <div className="grid grid-cols-2 gap-1.5 xl:flex xl:flex-col"><button type="button" onClick={() => onOpenCaseStudy(featured.id)} className="col-span-2 inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-orange-300/45 bg-orange-500/20 px-2 py-2 text-[10px] font-bold text-orange-100 shadow-[0_0_18px_rgba(249,115,22,.12)] transition-all hover:-translate-y-0.5 hover:bg-orange-500/35 hover:shadow-[0_0_22px_rgba(249,115,22,.28)] motion-reduce:transform-none"><FileText size={14} />Ver caso técnico</button><Dialog.Trigger asChild><button type="button" onClick={() => setDetailProject(featured)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-orange-300/20 px-2 py-2 text-[10px] text-orange-200 transition-colors hover:bg-orange-400/10"><Search size={13} />Ver detalle</button></Dialog.Trigger>{featuredGitHub ? <a href={featuredGitHub} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-orange-300/20 px-2 py-2 text-[10px] text-orange-200 transition-colors hover:bg-orange-400/10"><BrandMark name="GitHub" size={13} />GitHub</a> : <span title="No hay repositorio GitHub asociado en la documentación" className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-2 text-[10px] text-slate-500"><BrandMark name="GitHub" size={13} />Sin repositorio</span>}</div>
    </div></section>}


    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-[#020b14]/75 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in" /><Dialog.Content className="fixed inset-x-2 top-1/2 z-[81] mx-auto max-h-[88dvh] w-[calc(100%-1rem)] max-w-xl -translate-y-1/2 overflow-y-auto rounded-xl border border-orange-300/30 bg-[#091b29] p-5 text-slate-100 shadow-[0_35px_100px_rgba(0,0,0,.7),0_0_30px_rgba(249,115,22,.12)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95">{detailProject && <><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase text-orange-300">Detalle de proyecto</p><Dialog.Title className="mt-1 text-xl font-bold">{detailProject.title}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-slate-400">{detailProject.summary || detailProject.description || "Sin descripción registrada."}</Dialog.Description></div><Dialog.Close className="rounded-md p-2 text-slate-400 hover:bg-orange-400/10 hover:text-white" aria-label="Cerrar detalle"><X size={18} /></Dialog.Close></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-md border border-white/10 p-3"><span className="text-slate-400">Estado</span><strong className="block text-white">{detailProject.status}</strong></div><div className="rounded-md border border-white/10 p-3"><span className="text-slate-400">Subtareas</span><strong className="block text-white">{scores[detailProject.id]?.completed_tasks || 0}/{scores[detailProject.id]?.total_tasks || 0}</strong></div><div className="rounded-md border border-white/10 p-3"><span className="text-slate-400">Fecha registrada</span><strong className="block text-white">{detailProject.end_date || detailProject.start_date || "No registrada"}</strong></div><div className="rounded-md border border-white/10 p-3"><span className="text-slate-400">Evidencias</span><strong className="block text-white">{summaries[detailProject.id]?.total_assets || 0}</strong></div></div><div className="mt-4 flex flex-wrap gap-1">{detailProject.project_skills.map((link) => link.career_skills && <span key={link.id} className="rounded border border-orange-300/20 bg-orange-400/7 px-2 py-1 text-[10px] text-orange-100">{link.career_skills.name}</span>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => { onOpenCaseStudy(detailProject.id); setDetailProject(null) }} className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-[#24140b] hover:bg-orange-400"><FileText size={14} />Ver caso técnico</button><button type="button" onClick={() => { onViewChange("board"); onOpenProject(detailProject); setDetailProject(null) }} className="inline-flex items-center gap-1 rounded-md border border-orange-300/25 px-3 py-2 text-xs text-orange-200 hover:bg-orange-400/10"><FolderKanban size={14} />Gestionar en Tablero</button></div></>}</Dialog.Content></Dialog.Portal>
  </div></Dialog.Root>
}
