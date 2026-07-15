"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  BrainCircuit,
  CheckCircle2,
  Code2,
  DatabaseIcon,
  FileText,
  FolderKanban,
  Gauge,
  ImageIcon,
  Layers3,
  Loader2,
  Palette,
  Star,
  Zap,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DashboardProgressBar, DashboardProgressRing } from "@/components/dashboard/dashboard-progress"
import { createClient } from "@/lib/supabase/client"
import { containerVariants, itemVariants, profileImageSrc } from "@/lib/dashboard-page-config"
import type { Database } from "@/types/database"

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

const getProjectTone = (index: number) => {
  const tones = [
    {
      shell: "from-orange-500/20 via-amber-400/8 to-white/[0.025]",
      icon: "text-orange-200 border-orange-300/16 bg-orange-500/10",
      progress: "bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300",
      ring: "#f59e0b",
    },
    {
      shell: "from-cyan-500/18 via-blue-400/8 to-white/[0.025]",
      icon: "text-cyan-200 border-cyan-300/16 bg-cyan-500/10",
      progress: "bg-gradient-to-r from-cyan-500 via-blue-400 to-sky-300",
      ring: "#22d3ee",
    },
    {
      shell: "from-purple-500/20 via-fuchsia-400/8 to-white/[0.025]",
      icon: "text-purple-200 border-purple-300/16 bg-purple-500/10",
      progress: "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-300",
      ring: "#c084fc",
    },
  ]

  return tones[index % tones.length]
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
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [skillsSummary, setSkillsSummary] = useState<CareerSkillsSummary | null>(null)
  const [weeklySummary, setWeeklySummary] = useState<WeeklyCareerSummary | null>(null)
  const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([])
  const [assets, setAssets] = useState<ProjectAsset[]>([])
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
  const topProjects = projects.slice(0, 4)
  const usedSkillsProgress = scaleToPct(numberOrZero(skillsSummary?.used_skills), numberOrZero(skillsSummary?.total_skills))
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
    <main
      className="relative min-h-[calc(100vh-72px)] overflow-hidden py-5 text-white antialiased sm:py-6"
      style={{ fontFamily: "'Poppins', 'Nunito Sans', 'Inter', 'Manrope', system-ui, sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 bg-[#060a12]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_54%_92%,rgba(34,211,238,0.10),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 28, 0], y: [0, -18, 0], opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed left-[-10%] top-[12%] h-[22rem] w-[22rem] rounded-full bg-blue-500/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -24, 0], y: [0, 18, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed right-[-8%] top-[22%] h-[24rem] w-[24rem] rounded-full bg-orange-500/18 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.10, 0.20, 0.10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed bottom-[-18%] left-[30%] h-[26rem] w-[26rem] rounded-full bg-cyan-400/16 blur-3xl"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 space-y-5 sm:space-y-6"
      >
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.055] bg-[linear-gradient(118deg,rgba(17,20,25,0.94),rgba(18,21,27,0.92)_55%,rgba(28,25,45,0.88)_100%)] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-6 md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.18),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_76%_92%,rgba(34,211,238,0.10),transparent_28%)]" />

          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-center">
            <div className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-white/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-cyan-50 shadow-[0_14px_42px_rgba(8,47,73,0.18)] backdrop-blur-md">
                  <BriefcaseBusiness size={13} />
                  Portafolio profesional
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/12 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-bold text-emerald-100">
                  <CheckCircle2 size={13} />
                  Datos reales desde Supabase
                </span>
              </div>

              <h1 className="max-w-4xl text-balance text-[clamp(2.35rem,5vw,4.9rem)] font-black leading-[0.97] tracking-[-0.045em] text-white">
                Evidencia real de tu avance tecnico.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
                Una vista enfocada en proyectos, skills, documentacion y evidencia profesional generada desde tu pilar Data/Carrera.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Proyectos", value: portfolioStats.totalProjects, helper: `${portfolioStats.activeProjects} activos`, icon: FolderKanban },
                  { label: "Tareas", value: portfolioStats.completedTasks, helper: `${portfolioStats.totalTasks} registradas`, icon: CheckCircle2 },
                  { label: "Evidencias", value: portfolioStats.totalAssets, helper: `${portfolioStats.totalDocs} docs`, icon: ImageIcon },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <Icon className="h-5 w-5 text-cyan-200" />
                      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">{item.value}</p>
                      <p className="text-sm font-bold text-white/80">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/[0.06] bg-white/[0.04] p-5 text-center shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
              <Image
                src={profile?.avatar_url || profileImageSrc}
                alt={`Foto de perfil de ${displayName}`}
                width={150}
                height={150}
                className="mx-auto h-32 w-32 rounded-full border-4 border-white/[0.08] bg-[#111419] object-cover p-1 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              />
              <p className="mt-4 text-lg font-black text-white">{displayName}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/55">LifeTrack Portfolio</p>
              <div className="mt-5 flex justify-center">
                <DashboardProgressRing
                  value={portfolioStats.averageScore}
                  color="#60a5fa"
                  size="h-24 w-24"
                  inner="h-[54px] w-[54px]"
                  label={`${portfolioStats.averageScore}%`}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">Score profesional promedio</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)]">
          <div className="rounded-[1.2rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xl font-black tracking-[-0.035em] text-white">Perfil que ve un reclutador</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Resumen directo de capacidades demostrables: datos, IA, desarrollo web y experiencia visual.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/12 bg-blue-500/[0.075] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-blue-100">
                <Gauge className="h-3.5 w-3.5" />
                Perfil tecnico integral
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recruiterHighlights.map((item) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -4 }}
                    className={`group relative overflow-hidden rounded-[1.05rem] border border-white/[0.06] bg-gradient-to-br ${item.className} p-4 shadow-[0_16px_45px_rgba(0,0,0,0.18)]`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.12),transparent_28%)] opacity-0 transition group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-black/20">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full border border-white/[0.07] bg-black/24 px-2.5 py-1 text-[10px] font-black text-white">
                          {item.value}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{item.title}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{item.text}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black tracking-[-0.03em] text-white">Mapa de especialidades</p>
                <p className="mt-1 text-xs text-slate-500">Lectura visual desde skills y proyectos.</p>
              </div>
              <BrainCircuit className="h-5 w-5 text-violet-200" />
            </div>
            <div className="h-[260px] min-h-[220px] w-full">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={specialtyData} outerRadius="78%">
                    <PolarGrid stroke="rgba(255,255,255,0.10)" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 700 }} />
                    <Radar
                      name="Especialidad"
                      dataKey="value"
                      stroke="#22d3ee"
                      fill="#22d3ee"
                      fillOpacity={0.26}
                      strokeWidth={2}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.035]" />
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
          <div className="rounded-[1.2rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xl font-black tracking-[-0.035em] text-white">Tecnologias con evidencia</p>
                <p className="mt-1 text-sm text-slate-500">Ranking real por presencia en proyectos registrados.</p>
              </div>
              <span className="rounded-full border border-cyan-300/12 bg-cyan-500/[0.075] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">
                {topSkills.length} principales
              </span>
            </div>
            <div className="h-[280px] min-h-[240px] w-full">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSkills} layout="vertical" margin={{ top: 4, right: 18, left: 10, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" hide domain={[0, "dataMax"]} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={92}
                      tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(255,255,255,0.035)" }} />
                    <Bar dataKey="projects_count" radius={[0, 10, 10, 0]} fill="#22d3ee" barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.035]" />
              )}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black tracking-[-0.03em] text-white">Categorias del stack</p>
                <p className="mt-1 text-xs text-slate-500">Distribucion real de tecnologias.</p>
              </div>
              <Layers3 className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-3">
              {categoryData.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/[0.06] bg-black/20 p-4 text-sm text-slate-500">
                  Las categorias apareceran cuando registres skills en Data/Carrera.
                </p>
              ) : (
                categoryData.map((item) => (
                  <div key={item.category} className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-white">{item.category}</span>
                      <span className="font-black text-cyan-200">{item.total}</span>
                    </div>
                    <DashboardProgressBar
                      value={scaleToPct(item.total, Math.max(...categoryData.map((category) => category.total), 1))}
                      fillClassName="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300"
                      heightClassName="h-2"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Completitud tecnica", value: portfolioStats.taskProgress, color: "#f59e0b", fill: "bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" },
                { title: "Skills usadas", value: numberOrZero(skillsSummary?.used_skills), progress: usedSkillsProgress, helper: `${skillsSummary?.total_skills || 0} registradas`, color: "#22d3ee", fill: "bg-gradient-to-r from-cyan-500 to-blue-300", suffix: "" },
                { title: "Actividad semanal", value: weeklyProductivityProgress, color: "#c084fc", fill: "bg-gradient-to-r from-purple-500 to-fuchsia-300", suffix: "%" },
              ].map((item) => (
                <div key={item.title} className="group relative overflow-hidden rounded-[1.15rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition hover:border-white/[0.12] hover:bg-white/[0.055]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(255,255,255,0.10),transparent_26%)] opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{"helper" in item ? item.helper : "Lectura consolidada"}</p>
                    </div>
                    <DashboardProgressRing
                      value={Number("progress" in item ? item.progress ?? 0 : item.value)}
                      color={item.color}
                      size="h-16 w-16"
                      inner="h-[36px] w-[36px]"
                      label={`${Math.round(Number(item.value || 0))}${"suffix" in item ? item.suffix : "%"}`}
                    />
                  </div>
                  <DashboardProgressBar value={Number("progress" in item ? item.progress ?? 0 : item.value)} fillClassName={item.fill} heightClassName="mt-4 h-2.5" />
                </div>
              ))}
            </div>

            <div className="rounded-[1.2rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-black tracking-[-0.035em] text-white">Proyectos destacados</p>
                  <p className="mt-1 text-sm text-slate-500">Ordenados por score profesional y evidencia tecnica.</p>
                </div>
                <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {topProjects.length} visibles
                </span>
              </div>

              {loading ? (
                <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-white/[0.06] bg-black/20">
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-200" />
                </div>
              ) : errorMessage ? (
                <div className="rounded-2xl border border-rose-300/15 bg-rose-500/[0.06] p-5 text-sm font-semibold text-rose-100">
                  {errorMessage}
                </div>
              ) : topProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.06] bg-black/20 p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-500" />
                  <p className="mt-3 text-sm font-bold text-white">Aun no hay proyectos para mostrar.</p>
                  <p className="mt-1 text-xs text-slate-500">Cuando registres proyectos en Data/Carrera, apareceran aqui automaticamente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProjects.map((project, index) => {
                    const tone = getProjectTone(index)
                    const projectScore = pct(project.professional_score)
                    const skillCoverage = pct(project.skill_coverage_percentage)
                    const evidenceCoverage = pct(project.evidence_coverage_percentage)

                    return (
                      <motion.article
                        key={project.project_id || project.project_title || index}
                        whileHover={{ y: -4 }}
                        className={`relative overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-gradient-to-br ${tone.shell} p-5 shadow-[0_24px_66px_rgba(0,0,0,0.23)] sm:p-6`}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_16%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_16%_90%,rgba(34,211,238,0.09),transparent_28%)]" />
                        <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
                          <div className="min-w-0">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${tone.icon}`}>
                                <Code2 className="h-3.5 w-3.5" />
                                Proyecto {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="rounded-full border border-white/[0.07] bg-black/24 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                                {project.project_status || "Sin estado"}
                              </span>
                            </div>

                            <h2 className="text-balance text-2xl font-black leading-tight tracking-[-0.04em] text-white sm:text-3xl">
                              {project.project_title || "Proyecto sin titulo"}
                            </h2>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
                              {getRecruiterProjectDescription(project)}
                            </p>

                            <div className="mt-5 grid gap-2 sm:grid-cols-4">
                              {[
                                { label: "Score", value: `${projectScore}%` },
                                { label: "Tareas", value: `${project.completed_tasks || 0}/${project.total_tasks || 0}` },
                                { label: "Docs", value: `${project.total_documents || 0}` },
                                { label: "Assets", value: `${project.total_assets || 0}` },
                              ].map((metric) => (
                                <div key={metric.label} className="rounded-xl border border-white/[0.055] bg-black/24 p-3">
                                  <p className="text-xl font-black text-white">{metric.value}</p>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-500">{metric.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                            <DashboardProgressRing value={projectScore} color={tone.ring} size="h-28 w-28" inner="h-[64px] w-[64px]" label={`${projectScore}%`} />
                            <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              Evidencia lista para entrevista
                            </p>
                          </div>
                        </div>

                        <div className="relative mt-5 grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                              <span>Cobertura de skills</span>
                              <span className="font-bold text-white">{skillCoverage}%</span>
                            </div>
                            <DashboardProgressBar value={skillCoverage} fillClassName="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300" />
                          </div>
                          <div>
                            <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                              <span>Cobertura de evidencia</span>
                              <span className="font-bold text-white">{evidenceCoverage}%</span>
                            </div>
                            <DashboardProgressBar value={evidenceCoverage} fillClassName={tone.progress} />
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.15rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-black tracking-[-0.03em] text-white">Stack y skills</p>
                  <p className="mt-1 text-xs text-slate-500">Resumen real de Data/Carrera.</p>
                </div>
                <Layers3 className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
                  <p className="text-2xl font-black text-white">{skillsSummary?.total_skills || 0}</p>
                  <p className="text-xs text-slate-500">Skills creadas</p>
                </div>
                <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
                  <p className="text-2xl font-black text-white">{skillsSummary?.categories_count || 0}</p>
                  <p className="text-xs text-slate-500">Categorias</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.055] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200/80">Skill mas usada</p>
                <p className="mt-2 text-lg font-black text-white">{skillsSummary?.top_skill_name || "Sin datos"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {skillsSummary?.top_skill_category || "Categoria pendiente"} · {skillsSummary?.top_skill_projects_count || 0} proyectos
                </p>
              </div>
            </div>

            <div className="rounded-[1.15rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-black tracking-[-0.03em] text-white">Actividad reciente</p>
                <Activity className="h-5 w-5 text-orange-200" />
              </div>
              <div className="space-y-3">
                {activityLogs.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/[0.06] bg-black/20 p-4 text-sm text-slate-500">
                    Todavia no hay actividad profesional reciente.
                  </p>
                ) : (
                  activityLogs.map((log, index) => (
                    <div key={`${log.created_at}-${index}`} className="rounded-2xl border border-white/[0.05] bg-black/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-orange-300/12 bg-orange-500/[0.08] text-orange-200">
                          <Zap className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-bold text-white">{log.event_title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{log.event_description || log.event_type}</p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{formatDate(log.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.15rem] border border-white/[0.055] bg-white/[0.04] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-black tracking-[-0.03em] text-white">Evidencia</p>
                <Star className="h-5 w-5 text-purple-200" />
              </div>
              <div className="space-y-3">
                {assets.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/[0.06] bg-black/20 p-4 text-sm text-slate-500">
                    Las evidencias cargadas apareceran en esta seccion.
                  </p>
                ) : (
                  assets.map((asset, index) => (
                    <a
                      key={`${asset.file_url}-${index}`}
                      href={asset.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-black/20 p-4 transition hover:border-purple-300/16 hover:bg-purple-500/[0.055]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-purple-300/12 bg-purple-500/[0.08] text-purple-200">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{asset.file_name}</span>
                        <span className="block text-xs text-slate-500">{asset.asset_type} · {formatDate(asset.created_at)}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-purple-200" />
                    </a>
                  ))
                )}
              </div>
            </div>
          </aside>
        </motion.section>
      </motion.div>
    </main>
  )
}

