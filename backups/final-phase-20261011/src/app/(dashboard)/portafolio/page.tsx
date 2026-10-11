"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Select } from "radix-ui"
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  BrainCircuit,
  CheckCircle2,
  Check,
  ChevronDown,
  Code2,
  DatabaseIcon,
  FileText,
  FolderKanban,
  Gauge,
  ImageIcon,
  Layers3,
  Loader2,
  Palette,
  Search,
  Star,
  Zap,
} from "lucide-react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { DashboardProgressBar, DashboardProgressRing } from "@/components/dashboard/dashboard-progress"
import { createClient } from "@/lib/supabase/client"
import { profileImageSrc } from "@/lib/dashboard-page-config"
import type { Database } from "@/types/database"
import "./portfolio-overhaul.css"

type ProjectSummary = Database["public"]["Views"]["vw_project_technical_summary"]["Row"]
type CareerSkillsSummary = Database["public"]["Views"]["vw_career_skills_summary"]["Row"]
type WeeklyCareerSummary = Database["public"]["Views"]["vw_weekly_career_summary"]["Row"]
type ProjectActivityLog = Pick<
  Database["public"]["Tables"]["project_activity_logs"]["Row"],
  "event_title" | "event_description" | "event_type" | "created_at" | "project_id"
>
type ProjectAsset = Pick<
  Database["public"]["Tables"]["project_task_assets"]["Row"],
  "asset_type" | "file_name" | "file_url" | "created_at" | "project_id"
>

type Profile = {
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

type SkillDetail = {
  name: string
  category: string
  color: string | null
  projects_count: number
  active_projects_count: number
  completed_projects_count: number
}

const numberOrZero = (value: number | null | undefined) => Number(value || 0)
const pct = (value: number | null | undefined) => Math.min(Math.max(Math.round(numberOrZero(value)), 0), 100)
const scaleToPct = (value: number, maxValue: number) => {
  if (maxValue <= 0) return 0
  return pct((value / maxValue) * 100)
}

const isSkillDetail = (value: unknown): value is SkillDetail => {
  if (!value || typeof value !== "object") return false

  const skill = value as Record<string, unknown>
  return typeof skill.name === "string" && typeof skill.category === "string"
}

const getSkillDetails = (summary: CareerSkillsSummary | null): SkillDetail[] => {
  if (!Array.isArray(summary?.skills_detail)) return []

  return summary.skills_detail.filter(isSkillDetail).map((skill) => ({
    name: skill.name,
    category: skill.category,
    color: typeof skill.color === "string" ? skill.color : null,
    projects_count: numberOrZero(skill.projects_count),
    active_projects_count: numberOrZero(skill.active_projects_count),
    completed_projects_count: numberOrZero(skill.completed_projects_count),
  }))
}

const chartTooltipStyle = {
  backgroundColor: "rgba(17, 20, 25, 0.94)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#e5e7eb",
  boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
}

function subscribeToClientMount(onStoreChange: () => void) {
  onStoreChange()

  return () => {}
}

const formatDate = (value: string | null) => {
  if (!value) return "Sin fecha"

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

const getRecruiterProjectDescription = (project: ProjectSummary) => {
  const title = (project.project_title || "").toLowerCase()

  if (title.includes("lifetrack")) {
    return "Aplicacion full-stack creada para convertir salud, carrera y cuidado personal en un sistema medible. Demuestra arquitectura frontend, autenticacion, Supabase, dashboards, UX/UI y capacidad para transformar vida personal en producto digital con datos accionables."
  }

  if (title.includes("retail") || title.includes("cloud")) {
    return "Proyecto orientado a analitica cloud para retail: integra procesamiento, modelado y visualizacion de datos para convertir informacion operativa en indicadores de negocio. Relevante para roles de data engineering, BI y plataformas analiticas modernas."
  }

  if (title.includes("educativo") || title.includes("educativa")) {
    return "Aplicativo web enfocado en experiencia educativa, gestion de contenido y seguimiento de avance. Aporta valor al mostrar criterio de producto, UX para usuarios reales, estructura frontend y capacidad de construir soluciones utiles para aprendizaje."
  }

  if (title.includes("copilot") || title.includes("mcp") || title.includes("power bi")) {
    return "Caso orientado a IA, automatizacion y analitica conversacional. Busca conectar asistentes, MCP y Power BI para facilitar consulta de datos y toma de decisiones, mostrando potencial en integracion de IA con herramientas empresariales."
  }

  return project.project_summary || project.project_description || "Proyecto registrado con evidencia tecnica, tareas, skills y activos asociados. Muestra capacidad para estructurar trabajo, documentar avances y convertir ejecucion en evidencia profesional verificable."
}

export default function PortfolioPage() {
  const reducedMotion = useReducedMotion()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [skillsSummary, setSkillsSummary] = useState<CareerSkillsSummary | null>(null)
  const [weeklySummary, setWeeklySummary] = useState<WeeklyCareerSummary | null>(null)
  const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([])
  const [assets, setAssets] = useState<ProjectAsset[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [projectSearch, setProjectSearch] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const chartsReady = useSyncExternalStore(subscribeToClientMount, () => true, () => false)

  useEffect(() => {
    let isActive = true

    const loadPortfolio = async () => {
      setLoading(true)
      setErrorMessage(null)

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (sessionError || !userId) {
        if (isActive) {
          setErrorMessage("No se pudo validar la sesion para cargar el portafolio.")
          setLoading(false)
        }
        return
      }

      const [
        profileResponse,
        projectsResponse,
        skillsResponse,
        weeklyResponse,
        logsResponse,
        assetsResponse,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("vw_project_technical_summary")
          .select("*")
          .eq("user_id", userId)
          .order("professional_score", { ascending: false, nullsFirst: false }),
        supabase
          .from("vw_career_skills_summary")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("vw_weekly_career_summary")
          .select("*")
          .eq("user_id", userId)
          .order("week_start", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("project_activity_logs")
          .select("event_title, event_description, event_type, created_at, project_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("project_task_assets")
          .select("asset_type, file_name, file_url, created_at, project_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6),
      ])

      const firstError =
        profileResponse.error ||
        projectsResponse.error ||
        skillsResponse.error ||
        weeklyResponse.error ||
        logsResponse.error ||
        assetsResponse.error

      if (firstError) {
        console.error("Error cargando portafolio:", firstError)
        if (isActive) setErrorMessage("No se pudo cargar el portafolio desde Supabase.")
      }

      if (isActive) {
        setProfile(profileResponse.data ?? null)
        setProjects(projectsResponse.data ?? [])
        setSkillsSummary(skillsResponse.data ?? null)
        setWeeklySummary(weeklyResponse.data ?? null)
        setActivityLogs(logsResponse.data ?? [])
        setAssets(assetsResponse.data ?? [])
        setLoading(false)
      }
    }

    loadPortfolio()

    return () => {
      isActive = false
    }
  }, [supabase])

  const portfolioStats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((project) => project.project_status !== "Completado" && project.project_status !== "Cancelado").length
    const completedTasks = projects.reduce((acc, project) => acc + numberOrZero(project.completed_tasks), 0)
    const totalTasks = projects.reduce((acc, project) => acc + numberOrZero(project.total_tasks), 0)
    const totalAssets = projects.reduce((acc, project) => acc + numberOrZero(project.total_assets), 0)
    const totalDocs = projects.reduce((acc, project) => acc + numberOrZero(project.total_documents), 0)
    const averageScore = totalProjects
      ? Math.round(projects.reduce((acc, project) => acc + numberOrZero(project.professional_score), 0) / totalProjects)
      : 0
    const taskProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalProjects,
      activeProjects,
      completedTasks,
      totalTasks,
      totalAssets,
      totalDocs,
      averageScore,
      taskProgress,
    }
  }, [projects])

  const displayName = profile?.full_name || profile?.username || "Jose Luis"
  const projectStatuses = useMemo(() => [...new Set(projects.map((project) => project.project_status || "Sin estado"))], [projects])
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesStatus = projectFilter === "all" || (project.project_status || "Sin estado") === projectFilter
    const matchesSearch = (project.project_title || "").toLocaleLowerCase("es").includes(projectSearch.trim().toLocaleLowerCase("es"))
    return matchesStatus && matchesSearch
  }), [projects, projectFilter, projectSearch])
  const selectedProject = filteredProjects.find((project) => project.project_id === selectedProjectId) || filteredProjects[0] || null
  const weeklyProductivityProgress = pct(weeklySummary?.weekly_productivity_percentage)
  const skillDetails = useMemo(() => getSkillDetails(skillsSummary), [skillsSummary])
  const topSkills = useMemo(
    () => [...skillDetails].sort((a, b) => b.projects_count - a.projects_count).slice(0, 8),
    [skillDetails]
  )
  const categoryData = useMemo(() => {
    const categories = skillDetails.reduce<Record<string, number>>((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1
      return acc
    }, {})

    return Object.entries(categories)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [skillDetails])
  const specialtyData = useMemo(() => {
    const dataEngineering = skillDetails
      .filter((skill) => /data|sql|python|warehouse|cloud|fabric|databricks|bigquery|bi/i.test(`${skill.category} ${skill.name}`))
      .reduce((acc, skill) => acc + Math.max(skill.projects_count, 1), 0)
    const web = skillDetails
      .filter((skill) => /frontend|backend|react|next|typescript|supabase/i.test(`${skill.category} ${skill.name}`))
      .reduce((acc, skill) => acc + Math.max(skill.projects_count, 1), 0)
    const automation = skillDetails
      .filter((skill) => /automation|power apps|power automate|ia|ai|copilot/i.test(`${skill.category} ${skill.name}`))
      .reduce((acc, skill) => acc + Math.max(skill.projects_count, 1), 0)
    const design = skillDetails
      .filter((skill) => /ux|ui|design|frontend/i.test(`${skill.category} ${skill.name}`))
      .reduce((acc, skill) => acc + Math.max(skill.projects_count, 1), 0)

    const max = Math.max(dataEngineering, web, automation, design, 1)

    return [
      { area: "Datos", value: scaleToPct(dataEngineering, max) },
      { area: "IA/Auto", value: scaleToPct(automation, max) },
      { area: "Web", value: scaleToPct(web, max) },
      { area: "UX/UI", value: scaleToPct(design, max) },
      { area: "BI", value: scaleToPct(numberOrZero(skillsSummary?.top_skill_projects_count), Math.max(portfolioStats.totalProjects, 1)) },
    ]
  }, [portfolioStats.totalProjects, skillDetails, skillsSummary?.top_skill_projects_count])
  const recruiterHighlights = [
    {
      title: "Ingenieria de datos",
      value: `${categoryData.find((item) => /data/i.test(item.category))?.total || 0}+ skills`,
      text: "Python, SQL, cloud data, BI y modelado de evidencia tecnica.",
      icon: DatabaseIcon,
      className: "from-emerald-500/18 to-cyan-400/8 text-emerald-200",
    },
    {
      title: "IA y automatizacion",
      value: `${skillDetails.filter((skill) => /power|copilot|automat|ia|ai/i.test(`${skill.name} ${skill.category}`)).length}`,
      text: "Capacidad para conectar flujos, asistentes y decisiones basadas en datos.",
      icon: BrainCircuit,
      className: "from-violet-500/18 to-fuchsia-400/8 text-violet-200",
    },
    {
      title: "Full-stack web",
      value: `${topSkills.filter((skill) => /react|next|typescript|supabase/i.test(skill.name)).length}`,
      text: "Aplicaciones con frontend moderno, backend gestionado y autenticacion real.",
      icon: Code2,
      className: "from-blue-500/18 to-cyan-400/8 text-cyan-200",
    },
    {
      title: "UX/UI aplicado",
      value: `${skillDetails.some((skill) => /ux|ui/i.test(skill.name)) ? "Activo" : "Base"}`,
      text: "Cuidado visual, jerarquia, microinteracciones y experiencia usable.",
      icon: Palette,
      className: "from-pink-500/18 to-purple-400/8 text-pink-200",
    },
  ]

  return (
    <main className="lifetrack-general portfolio-overhaul min-h-[calc(100vh-72px)] text-white">
      <div className="portfolio-stage">
        <section className="portfolio-masthead" aria-labelledby="portfolio-title">
          <Image src="/images/lifetrack/career-sunrise.webp" alt="" fill priority sizes="100vw" className="portfolio-masthead__image" />
          <div className="portfolio-masthead__shade" aria-hidden="true" />
          <div className="portfolio-masthead__copy">
            <span className="portfolio-kicker"><BriefcaseBusiness size={14} /> Pilar profesional</span>
            <h1 id="portfolio-title">Portafolio <span>profesional</span></h1>
            <p>Proyectos, habilidades y evidencia de tu crecimiento en Data &amp; Carrera.</p>
            <div className="portfolio-owner">
              <Image src={profile?.avatar_url || profileImageSrc} alt="" width={36} height={36} />
              <div><strong>{displayName}</strong><span>Proyectos registrados en LifeTrack</span></div>
            </div>
          </div>
          <div className="portfolio-masthead__metrics" aria-label="Resumen del portafolio">
            {[
              { icon: FolderKanban, label: "Proyectos", value: portfolioStats.totalProjects, detail: String(portfolioStats.activeProjects) + " activos" },
              { icon: CheckCircle2, label: "Tareas", value: portfolioStats.completedTasks, detail: String(portfolioStats.totalTasks) + " registradas" },
              { icon: FileText, label: "Documentos", value: portfolioStats.totalDocs, detail: "En proyectos" },
              { icon: ImageIcon, label: "Evidencias", value: portfolioStats.totalAssets, detail: "Archivos y entregables" },
            ].map(({ icon: Icon, label, value, detail }) => (
              <div className="portfolio-metric" key={label}>
                <Icon size={19} aria-hidden="true" />
                <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
              </div>
            ))}
          </div>
        </section>

        <section className="portfolio-explorer" aria-labelledby="portfolio-explorer-title">
          <div className="portfolio-section-heading">
            <div><span className="portfolio-section-icon"><FolderKanban size={19} /></span><div><h2 id="portfolio-explorer-title">Explorar proyectos</h2><p>Selecciona un proyecto para revisar su avance y evidencia.</p></div></div>
            <span className="portfolio-count">{filteredProjects.length} de {projects.length}</span>
          </div>
          <div className="portfolio-explorer__body">
            <div className="portfolio-index">
              <div className="portfolio-index__controls">
                <label className="portfolio-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Buscar proyectos</span><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Buscar proyecto" /></label>
                <Select.Root value={projectFilter} onValueChange={setProjectFilter}>
                  <Select.Trigger className="portfolio-filter" aria-label="Filtrar proyectos por estado"><Select.Value /><Select.Icon><ChevronDown size={14} /></Select.Icon></Select.Trigger>
                  <Select.Portal><Select.Content position="popper" sideOffset={6} collisionPadding={10} className="portfolio-filter-menu"><Select.Viewport>
                    {[{ value: "all", label: "Todos los estados" }, ...projectStatuses.map((status) => ({ value: status, label: status }))].map(({ value, label }) => <Select.Item className="portfolio-filter-option" value={value} key={value}><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator><Select.ItemText>{label}</Select.ItemText></Select.Item>)}
                  </Select.Viewport></Select.Content></Select.Portal>
                </Select.Root>
              </div>
              <div className="portfolio-index__list" aria-label="Proyectos disponibles">
                {loading ? <div className="portfolio-state"><Loader2 className="animate-spin" size={24} /><span>Cargando proyectos...</span></div> :
                  errorMessage ? <div className="portfolio-state portfolio-state--error" role="alert">{errorMessage}</div> :
                  projects.length === 0 ? <div className="portfolio-state">Todavia no hay proyectos. Registra uno en Data &amp; Carrera para verlo aqui.</div> :
                  filteredProjects.length === 0 ? <div className="portfolio-state">No hay proyectos para esta busqueda o estado.</div> :
                  filteredProjects.map((project, index) => {
                    const score = pct(project.professional_score)
                    const active = selectedProject?.project_id === project.project_id
                    return <button type="button" key={project.project_id || index} className={"portfolio-project-row" + (active ? " is-active" : "")} aria-pressed={active} onClick={() => setSelectedProjectId(project.project_id)} title={"Ver detalle de " + (project.project_title || "Proyecto sin titulo")}>
                      <span className="portfolio-project-row__number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="portfolio-project-row__main"><strong>{project.project_title || "Proyecto sin titulo"}</strong><span>{project.project_status || "Sin estado"} <i aria-hidden="true">·</i> {numberOrZero(project.completed_tasks)}/{numberOrZero(project.total_tasks)} tareas</span></span>
                      <span className="portfolio-project-row__score">{score}%</span>
                    </button>
                  })}
              </div>
            </div>
            <div className="portfolio-case" aria-live="polite">
              {!loading && !errorMessage && selectedProject ? (
                <motion.div key={selectedProject.project_id || selectedProject.project_title} initial={reducedMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="portfolio-case__inner">
                  <div className="portfolio-case__top"><span className="portfolio-case__label"><Code2 size={15} /> Caso de proyecto</span><span className="portfolio-status">{selectedProject.project_status || "Sin estado"}</span></div>
                  <div className="portfolio-case__lead">
                    <div><h3>{selectedProject.project_title || "Proyecto sin titulo"}</h3><p>{getRecruiterProjectDescription(selectedProject)}</p></div>
                    <div className="portfolio-case__score"><DashboardProgressRing value={pct(selectedProject.professional_score)} color="#fb923c" size="h-24 w-24" inner="h-[54px] w-[54px]" label={String(pct(selectedProject.professional_score)) + "%"} /><span>Score profesional</span></div>
                  </div>
                  <div className="portfolio-case__facts">
                    <div><span>Tareas completadas</span><strong>{numberOrZero(selectedProject.completed_tasks)} / {numberOrZero(selectedProject.total_tasks)}</strong></div>
                    <div><span>Documentos</span><strong>{numberOrZero(selectedProject.total_documents)}</strong></div>
                    <div><span>Evidencias</span><strong>{numberOrZero(selectedProject.total_assets)}</strong></div>
                  </div>
                  <div className="portfolio-case__coverage">
                    <div><span>Cobertura de skills <strong>{pct(selectedProject.skill_coverage_percentage)}%</strong></span><DashboardProgressBar value={pct(selectedProject.skill_coverage_percentage)} fillClassName="bg-gradient-to-r from-sky-500 to-cyan-300" heightClassName="h-1.5" /></div>
                    <div><span>Cobertura de evidencia <strong>{pct(selectedProject.evidence_coverage_percentage)}%</strong></span><DashboardProgressBar value={pct(selectedProject.evidence_coverage_percentage)} fillClassName="bg-gradient-to-r from-orange-500 to-amber-300" heightClassName="h-1.5" /></div>
                  </div>
                  <div className="portfolio-case__files">
                    <h4><ImageIcon size={16} /> Evidencias recientes del proyecto</h4>
                    {assets.filter((asset) => asset.project_id === selectedProject.project_id).length ? assets.filter((asset) => asset.project_id === selectedProject.project_id).map((asset, index) => <a key={asset.file_url + index} href={asset.file_url} target="_blank" rel="noreferrer"><FileText size={16} /><span>{asset.file_name}<small>{asset.asset_type} · {formatDate(asset.created_at)}</small></span><ArrowUpRight size={15} /></a>) : <p>Sin archivos recientes entre las ultimas evidencias registradas.</p>}
                  </div>
                </motion.div>
              ) : <div className="portfolio-state portfolio-state--detail">{loading ? "Preparando el detalle..." : errorMessage ? "El detalle no esta disponible mientras falla la carga." : projects.length && !filteredProjects.length ? "No hay proyectos para estos filtros." : projects.length ? "Selecciona un proyecto para ver su detalle." : "Los proyectos apareceran aqui cuando los registres en Data & Carrera."}</div>}
            </div>
          </div>
        </section>

        <div className="portfolio-secondary">
          <section className="portfolio-capabilities" aria-labelledby="portfolio-capabilities-title">
            <div className="portfolio-section-heading"><div><span className="portfolio-section-icon"><BrainCircuit size={19} /></span><div><h2 id="portfolio-capabilities-title">Capacidades demostradas</h2><p>Skills vinculadas a los proyectos registrados.</p></div></div></div>
            <div className="portfolio-capabilities__grid">{recruiterHighlights.map(({ title, value, icon: Icon }) => <div key={title}><Icon size={18} /><span>{title}</span><strong>{value}</strong></div>)}</div>
            <div className="portfolio-skills-list"><div className="portfolio-minor-heading"><h3><Layers3 size={16} /> Tecnologias con evidencia</h3><span>{topSkills.length} principales</span></div>{topSkills.length ? topSkills.map((skill) => <div key={skill.name} className="portfolio-skill-row"><span>{skill.name}</span><div><DashboardProgressBar value={scaleToPct(skill.projects_count, Math.max(...topSkills.map((item) => item.projects_count), 1))} fillClassName="bg-gradient-to-r from-orange-500 to-amber-300" heightClassName="h-1.5" /></div><strong>{skill.projects_count}</strong></div>) : <p className="portfolio-empty">Las tecnologias apareceran al registrar skills en Data &amp; Carrera.</p>}</div>
          </section>
          <section className="portfolio-specialties" aria-labelledby="portfolio-specialties-title">
            <div className="portfolio-section-heading"><div><span className="portfolio-section-icon"><Gauge size={19} /></span><div><h2 id="portfolio-specialties-title">Perfil tecnico</h2><p>Distribucion basada en skills registradas.</p></div></div></div>
            <div className="portfolio-specialties__summary"><div><span>Score promedio</span><strong>{portfolioStats.averageScore}%</strong></div><div><span>Skills usadas</span><strong>{numberOrZero(skillsSummary?.used_skills)} / {numberOrZero(skillsSummary?.total_skills)}</strong></div><div><span>Actividad semanal</span><strong>{weeklyProductivityProgress}%</strong></div></div>
            <div className="portfolio-specialties__chart">{chartsReady ? <ResponsiveContainer width="100%" height="100%"><RadarChart data={specialtyData} outerRadius="72%"><PolarGrid stroke="rgba(255,255,255,.12)" /><PolarAngleAxis dataKey="area" tick={{ fill: "#aebecb", fontSize: 11 }} /><Radar name="Especialidad relativa" dataKey="value" stroke="#fb923c" fill="#fb923c" fillOpacity={0.2} strokeWidth={2} /><Tooltip contentStyle={chartTooltipStyle} /></RadarChart></ResponsiveContainer> : null}</div>
            <div className="portfolio-minor-heading"><h3>Categorias del stack</h3><span>{numberOrZero(skillsSummary?.categories_count)}</span></div>
            <div className="portfolio-category-list">{categoryData.length ? categoryData.map((item) => <div key={item.category}><span>{item.category}</span><strong>{item.total}</strong></div>) : <p className="portfolio-empty">Sin categorias registradas.</p>}</div>
          </section>
        </div>

        <section className="portfolio-stream" aria-labelledby="portfolio-stream-title">
          <div className="portfolio-section-heading"><div><span className="portfolio-section-icon"><Activity size={19} /></span><div><h2 id="portfolio-stream-title">Actividad y archivos recientes</h2><p>Los ultimos registros profesionales disponibles.</p></div></div></div>
          <div className="portfolio-stream__columns">
            <div><h3><Zap size={16} /> Actividad</h3>{activityLogs.length ? activityLogs.map((log, index) => <div className="portfolio-stream__row" key={String(log.created_at) + index}><span>{formatDate(log.created_at)}</span><div><strong>{log.event_title}</strong><p>{log.event_description || log.event_type}</p></div></div>) : <p className="portfolio-empty">Todavia no hay actividad reciente.</p>}</div>
            <div><h3><Star size={16} /> Evidencias</h3>{assets.length ? assets.map((asset, index) => <a className="portfolio-stream__row portfolio-stream__row--link" href={asset.file_url} target="_blank" rel="noreferrer" key={asset.file_url + index}><FileText size={17} /><div><strong>{asset.file_name}</strong><p>{asset.asset_type} · {formatDate(asset.created_at)}</p></div><ArrowUpRight size={16} /></a>) : <p className="portfolio-empty">Todavia no hay archivos recientes.</p>}</div>
          </div>
        </section>
      </div>
    </main>
  )
}

