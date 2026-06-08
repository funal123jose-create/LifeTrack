"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Activity,
  Target,
  ArrowUpRight,
  Plus,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  BarChart2,
  HeartPulse,
  Dumbbell,
  Droplet,
  Flame,
  ShieldCheck,
  Orbit,
  Database,
  CheckCircle2,
  CircleDotDashed,
  TimerReset,
  ScanLine,
  Gauge,
  Layers3,
  Trophy,
  UserRound,
  CalendarClock,
  Waves,
  ChevronRight,
  Rocket,
  LineChart,
  Star,
  Cpu,
  Scale,
  BatteryCharging,
} from "lucide-react"
import { motion } from "framer-motion"
import { RegistrationPanel } from "@/components/registration-panel"

const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type WeeklyHealthSummary = {
  week_start: string | null
  week_end: string | null
  active_days: number
  meals_count: number
  total_meal_calories: number
  avg_calories_per_meal: number
  water_events_count: number
  total_water_liters: number
  avg_daily_water_liters: number
  tracker_total_calories: number
  avg_daily_calories: number
  avg_calorie_target: number
  workout_days: number
  planned_training_days: number
  completed_training_days: number
  training_completion_percentage: number
  avg_energy_level: number
  progress_records: number
  latest_weight_kg: number | null
  latest_weight_date: string | null
}

type WeeklyCareerSummary = {
  week_start: string | null
  week_end: string | null
  total_projects: number
  active_projects: number
  completed_projects: number
  backlog_projects: number
  planning_projects: number
  paused_projects: number
  high_priority_projects: number
  projects_created_week: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  archived_tasks: number
  overdue_tasks: number
  due_next_7_days: number
  high_priority_tasks: number
  tasks_created_week: number
  tasks_completed_week: number
  total_task_completion_percentage: number
  weekly_productivity_percentage: number
  top_project_id: string | null
  top_project_title: string | null
  top_project_completed_tasks: number
}

type WeeklyCareerActivity = {
  week_start: string | null
  week_end: string | null
  total_events: number
  projects_created_events: number
  projects_completed_events: number
  project_status_changed_events: number
  project_priority_changed_events: number
  tasks_created_events: number
  tasks_completed_events: number
  tasks_archived_events: number
  task_status_changed_events: number
  task_priority_changed_events: number
  active_projects_touched: number
  active_tasks_touched: number
  most_active_day: string | null
  most_active_day_events: number
  last_event_type: string | null
  last_event_title: string | null
  last_event_description: string | null
  last_event_at: string | null
  activity_intensity: "none" | "low" | "medium" | "high" | string
}

type CareerSkillDetail = {
  skill_id: string
  name: string
  category: string
  color: string | null
  icon: string | null
  projects_count: number
  active_projects_count: number
  completed_projects_count: number
  last_used_at: string | null
}

type CareerSkillsSummary = {
  total_skills: number
  used_skills: number
  unused_skills: number
  total_skill_project_links: number
  top_skill_name: string | null
  top_skill_category: string | null
  top_skill_projects_count: number
  categories_count: number
  skills_detail: CareerSkillDetail[]
}

const formatDateShort = (value?: string | null) => {
  if (!value) return "—"

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    })
  } catch {
    return "—"
  }
}

function DashboardBackground() {
  const particles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    size: 2 + (i % 5) * 1.1,
    left: `${3 + ((i * 13) % 94)}%`,
    top: `${5 + ((i * 19) % 88)}%`,
    duration: 8 + (i % 8),
    delay: (i % 10) * 0.38,
    x: (i % 2 === 0 ? 14 : -14) + (i % 5) * 3,
    y: -14 - (i % 6) * 6,
    opacity: 0.10 + (i % 5) * 0.035,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02040a]">
      {/* Dark premium base: más minimalista, menos saturado */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.105),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(249,115,22,0.075),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(16,185,129,0.055),transparent_36%),linear-gradient(135deg,#02040a_0%,#050914_44%,#030305_100%)]" />

      {/* Grid ultra sutil */}
      <div className="absolute inset-0 opacity-[0.42] bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:82px_82px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      {/* Scanlines muy suaves */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.55)_50%,transparent_100%)] bg-[length:100%_10px]" />

      {/* Glows ambientales, no invasivos */}
      <motion.div
        animate={{ x: [0, 26, -14, 0], y: [0, -18, 14, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[5%] top-[14%] h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.075] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -22, 18, 0], y: [0, 18, -16, 0], scale: [1, 0.96, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[7%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-orange-500/[0.06] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 18, -18, 0], y: [0, -22, 14, 0], scale: [1, 1.12, 0.98, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-5%] left-[42%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.045] blur-3xl"
      />

      {/* HUD rings minimalistas */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300/[0.045]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 88, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[690px] w-[690px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-300/[0.04]"
      />

      {/* Barrido sutil */}
      <motion.div
        animate={{ y: ["-18%", "120%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 top-0 h-52 w-full bg-gradient-to-b from-transparent via-slate-300/[0.026] to-transparent"
      />

      {/* Línea de pulso minimal */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.10, 0.24, 0.10] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-[23%] w-[120%]"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L140 100 L190 92 L230 108 L270 62 L315 140 L370 100 L520 100 L650 100 L700 95 L745 112 L790 60 L835 142 L890 100 L1040 100 L1110 100 L1150 92 L1190 108 L1240 58 L1288 142 L1340 100 L1600 100"
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Partículas discretas tipo polvo digital */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-slate-200"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              boxShadow:
                p.id % 3 === 0
                  ? "0 0 14px rgba(59,130,246,0.42), 0 0 28px rgba(59,130,246,0.16)"
                  : p.id % 3 === 1
                    ? "0 0 14px rgba(249,115,22,0.32), 0 0 28px rgba(249,115,22,0.12)"
                    : "0 0 14px rgba(16,185,129,0.30), 0 0 28px rgba(16,185,129,0.10)",
            }}
            animate={{
              y: [0, p.y, 0],
              x: [0, p.x, 0],
              scale: [1, 1.25, 1],
              opacity: [p.opacity * 0.45, p.opacity, p.opacity * 0.42],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Viñeta fuerte para mantener modo dark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(2,4,10,0.90)_100%)]" />
      <div className="absolute inset-0 bg-[#02040a]/35" />
    </div>
  )
}

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("Cargando...")
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // --- ESTADOS PARA LÓGICA REAL ---
  const [careerProgress, setCareerProgress] = useState(0)
  const [healthProgress, setHealthProgress] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [loadingHealth, setLoadingHealth] = useState(true)

  // --- NUEVAS MÉTRICAS DEL DASHBOARD GENERAL ---
  const [totalProjects, setTotalProjects] = useState(0)
  const [activeProjects, setActiveProjects] = useState(0)
  const [completedProjects, setCompletedProjects] = useState(0)
  const [totalCareerTasks, setTotalCareerTasks] = useState(0)
  const [completedCareerTasks, setCompletedCareerTasks] = useState(0)
  const [plannedWorkoutDays, setPlannedWorkoutDays] = useState(0)
  const [completedHealthTasks, setCompletedHealthTasks] = useState(0)
  const [totalHealthTasks, setTotalHealthTasks] = useState(0)

  // --- NUEVAS MÉTRICAS DE SALUD HISTÓRICA ---
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null)
  const [latestEnergyLevel, setLatestEnergyLevel] = useState<number | null>(null)
  const [bodyProgressCount, setBodyProgressCount] = useState(0)
  const [todayMealCount, setTodayMealCount] = useState(0)
  const [todayWaterLiters, setTodayWaterLiters] = useState(0)

  // --- RESUMEN SEMANAL DE SALUD ---
  const [weeklyHealthSummary, setWeeklyHealthSummary] = useState<WeeklyHealthSummary | null>(null)
  const [loadingWeeklyHealth, setLoadingWeeklyHealth] = useState(true)

  // --- RESUMEN SEMANAL DE DATA & CARRERA ---
  const [weeklyCareerSummary, setWeeklyCareerSummary] = useState<WeeklyCareerSummary | null>(null)
  const [loadingWeeklyCareer, setLoadingWeeklyCareer] = useState(true)

  // --- ACTIVIDAD SEMANAL REAL DE DATA & CARRERA ---
  const [weeklyCareerActivity, setWeeklyCareerActivity] = useState<WeeklyCareerActivity | null>(null)
  const [loadingWeeklyCareerActivity, setLoadingWeeklyCareerActivity] = useState(true)

  // --- SKILLS & STACK PROFESIONAL ---
  const [careerSkillsSummary, setCareerSkillsSummary] = useState<CareerSkillsSummary | null>(null)
  const [loadingCareerSkills, setLoadingCareerSkills] = useState(true)

  // Pilar todavía pendiente de conectar a tablas reales de cuidado personal
  const [personalCareProgress] = useState(0)

  const supabase = createClient()

  // --- REFS DE FLUIDEZ VISUAL ---
  // Evitan que los KPIs vuelvan a "..." o a 0 en cada refresh/realtime.
  // La data se sigue recalculando igual; solo se conserva el último valor visible mientras llega la nueva consulta.
  const hasFetchedCareerRef = useRef(false)
  const hasFetchedHealthRef = useRef(false)
  const hasMountedPanelRefreshRef = useRef(false)

  // --- FUNCIÓN PARA CARGAR INSIGHTS HISTÓRICOS DE SALUD ---
  const fetchHealthInsights = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const todayStr = getLocalDateString()

      const [
        { data: latestProgress, error: latestProgressError },
        { count: progressCount, error: progressCountError },
        { count: mealsCount, error: mealsCountError },
        { data: waterRows, error: waterRowsError },
      ] = await Promise.all([
        supabase
          .from("body_progress_logs")
          .select("weight_kg, energy_level, created_at")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("body_progress_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id),

        supabase
          .from("meal_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("date", todayStr),

        supabase
          .from("water_logs")
          .select("amount_liters")
          .eq("user_id", session.user.id)
          .eq("date", todayStr),
      ])

      if (latestProgressError) console.error("Error cargando último progreso físico:", latestProgressError)
      if (progressCountError) console.error("Error contando progreso físico:", progressCountError)
      if (mealsCountError) console.error("Error contando comidas de hoy:", mealsCountError)
      if (waterRowsError) console.error("Error cargando agua de hoy:", waterRowsError)

      setLatestWeightKg(latestProgress?.weight_kg !== null && latestProgress?.weight_kg !== undefined ? Number(latestProgress.weight_kg) : null)
      setLatestEnergyLevel(latestProgress?.energy_level !== null && latestProgress?.energy_level !== undefined ? Number(latestProgress.energy_level) : null)
      setBodyProgressCount(progressCount || 0)
      setTodayMealCount(mealsCount || 0)
      setTodayWaterLiters(
        (waterRows || []).reduce((total: number, row: any) => total + Number(row.amount_liters || 0), 0)
      )
    } catch (error) {
      console.error("Error cargando insights históricos de salud:", error)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR RESUMEN SEMANAL DE SALUD ---
  const fetchWeeklyHealthSummary = useCallback(async () => {
    try {
      setLoadingWeeklyHealth(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("vw_weekly_health_summary")
        .select(`
          week_start,
          week_end,
          active_days,
          meals_count,
          total_meal_calories,
          avg_calories_per_meal,
          water_events_count,
          total_water_liters,
          avg_daily_water_liters,
          tracker_total_calories,
          avg_daily_calories,
          avg_calorie_target,
          workout_days,
          planned_training_days,
          completed_training_days,
          training_completion_percentage,
          avg_energy_level,
          progress_records,
          latest_weight_kg,
          latest_weight_date
        `)
        .eq("user_id", session.user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("Error cargando resumen semanal de salud:", error)
        setWeeklyHealthSummary(null)
        return
      }

      setWeeklyHealthSummary(data ? {
        week_start: data.week_start || null,
        week_end: data.week_end || null,
        active_days: Number(data.active_days || 0),
        meals_count: Number(data.meals_count || 0),
        total_meal_calories: Number(data.total_meal_calories || 0),
        avg_calories_per_meal: Number(data.avg_calories_per_meal || 0),
        water_events_count: Number(data.water_events_count || 0),
        total_water_liters: Number(data.total_water_liters || 0),
        avg_daily_water_liters: Number(data.avg_daily_water_liters || 0),
        tracker_total_calories: Number(data.tracker_total_calories || 0),
        avg_daily_calories: Number(data.avg_daily_calories || 0),
        avg_calorie_target: Number(data.avg_calorie_target || 0),
        workout_days: Number(data.workout_days || 0),
        planned_training_days: Number(data.planned_training_days || 0),
        completed_training_days: Number(data.completed_training_days || 0),
        training_completion_percentage: Number(data.training_completion_percentage || 0),
        avg_energy_level: Number(data.avg_energy_level || 0),
        progress_records: Number(data.progress_records || 0),
        latest_weight_kg: data.latest_weight_kg !== null && data.latest_weight_kg !== undefined ? Number(data.latest_weight_kg) : null,
        latest_weight_date: data.latest_weight_date || null,
      } : null)
    } catch (error) {
      console.error("Error sincronizando resumen semanal de salud:", error)
      setWeeklyHealthSummary(null)
    } finally {
      setLoadingWeeklyHealth(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR RESUMEN SEMANAL DE DATA & CARRERA ---
  const fetchWeeklyCareerSummary = useCallback(async () => {
    try {
      setLoadingWeeklyCareer(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("vw_weekly_career_summary")
        .select(`
          week_start,
          week_end,
          total_projects,
          active_projects,
          completed_projects,
          backlog_projects,
          planning_projects,
          paused_projects,
          high_priority_projects,
          projects_created_week,
          total_tasks,
          completed_tasks,
          in_progress_tasks,
          pending_tasks,
          archived_tasks,
          overdue_tasks,
          due_next_7_days,
          high_priority_tasks,
          tasks_created_week,
          tasks_completed_week,
          total_task_completion_percentage,
          weekly_productivity_percentage,
          top_project_id,
          top_project_title,
          top_project_completed_tasks
        `)
        .eq("user_id", session.user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("Error cargando resumen semanal de Data & Carrera:", error)
        setWeeklyCareerSummary(null)
        return
      }

      setWeeklyCareerSummary(data ? {
        week_start: data.week_start || null,
        week_end: data.week_end || null,
        total_projects: Number(data.total_projects || 0),
        active_projects: Number(data.active_projects || 0),
        completed_projects: Number(data.completed_projects || 0),
        backlog_projects: Number(data.backlog_projects || 0),
        planning_projects: Number(data.planning_projects || 0),
        paused_projects: Number(data.paused_projects || 0),
        high_priority_projects: Number(data.high_priority_projects || 0),
        projects_created_week: Number(data.projects_created_week || 0),
        total_tasks: Number(data.total_tasks || 0),
        completed_tasks: Number(data.completed_tasks || 0),
        in_progress_tasks: Number(data.in_progress_tasks || 0),
        pending_tasks: Number(data.pending_tasks || 0),
        archived_tasks: Number(data.archived_tasks || 0),
        overdue_tasks: Number(data.overdue_tasks || 0),
        due_next_7_days: Number(data.due_next_7_days || 0),
        high_priority_tasks: Number(data.high_priority_tasks || 0),
        tasks_created_week: Number(data.tasks_created_week || 0),
        tasks_completed_week: Number(data.tasks_completed_week || 0),
        total_task_completion_percentage: Number(data.total_task_completion_percentage || 0),
        weekly_productivity_percentage: Number(data.weekly_productivity_percentage || 0),
        top_project_id: data.top_project_id || null,
        top_project_title: data.top_project_title || null,
        top_project_completed_tasks: Number(data.top_project_completed_tasks || 0),
      } : null)
    } catch (error) {
      console.error("Error sincronizando resumen semanal de Data & Carrera:", error)
      setWeeklyCareerSummary(null)
    } finally {
      setLoadingWeeklyCareer(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR ACTIVIDAD SEMANAL REAL DE DATA & CARRERA ---
  const fetchWeeklyCareerActivity = useCallback(async () => {
    try {
      setLoadingWeeklyCareerActivity(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("vw_weekly_career_activity")
        .select(`
          week_start,
          week_end,
          total_events,
          projects_created_events,
          projects_completed_events,
          project_status_changed_events,
          project_priority_changed_events,
          tasks_created_events,
          tasks_completed_events,
          tasks_archived_events,
          task_status_changed_events,
          task_priority_changed_events,
          active_projects_touched,
          active_tasks_touched,
          most_active_day,
          most_active_day_events,
          last_event_type,
          last_event_title,
          last_event_description,
          last_event_at,
          activity_intensity
        `)
        .eq("user_id", session.user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("Error cargando actividad semanal de Data & Carrera:", error)
        setWeeklyCareerActivity(null)
        return
      }

      setWeeklyCareerActivity(data ? {
        week_start: data.week_start || null,
        week_end: data.week_end || null,
        total_events: Number(data.total_events || 0),
        projects_created_events: Number(data.projects_created_events || 0),
        projects_completed_events: Number(data.projects_completed_events || 0),
        project_status_changed_events: Number(data.project_status_changed_events || 0),
        project_priority_changed_events: Number(data.project_priority_changed_events || 0),
        tasks_created_events: Number(data.tasks_created_events || 0),
        tasks_completed_events: Number(data.tasks_completed_events || 0),
        tasks_archived_events: Number(data.tasks_archived_events || 0),
        task_status_changed_events: Number(data.task_status_changed_events || 0),
        task_priority_changed_events: Number(data.task_priority_changed_events || 0),
        active_projects_touched: Number(data.active_projects_touched || 0),
        active_tasks_touched: Number(data.active_tasks_touched || 0),
        most_active_day: data.most_active_day || null,
        most_active_day_events: Number(data.most_active_day_events || 0),
        last_event_type: data.last_event_type || null,
        last_event_title: data.last_event_title || null,
        last_event_description: data.last_event_description || null,
        last_event_at: data.last_event_at || null,
        activity_intensity: data.activity_intensity || "none",
      } : null)
    } catch (error) {
      console.error("Error sincronizando actividad semanal de Data & Carrera:", error)
      setWeeklyCareerActivity(null)
    } finally {
      setLoadingWeeklyCareerActivity(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR SKILLS & STACK PROFESIONAL ---
  const fetchCareerSkillsSummary = useCallback(async () => {
    try {
      setLoadingCareerSkills(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("vw_career_skills_summary")
        .select(`
          total_skills,
          used_skills,
          unused_skills,
          total_skill_project_links,
          top_skill_name,
          top_skill_category,
          top_skill_projects_count,
          categories_count,
          skills_detail
        `)
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (error) {
        console.error("Error cargando resumen de skills profesionales:", error)
        setCareerSkillsSummary(null)
        return
      }

      const rawSkillsDetail = Array.isArray(data?.skills_detail) ? data.skills_detail : []

      setCareerSkillsSummary(data ? {
        total_skills: Number(data.total_skills || 0),
        used_skills: Number(data.used_skills || 0),
        unused_skills: Number(data.unused_skills || 0),
        total_skill_project_links: Number(data.total_skill_project_links || 0),
        top_skill_name: data.top_skill_name || null,
        top_skill_category: data.top_skill_category || null,
        top_skill_projects_count: Number(data.top_skill_projects_count || 0),
        categories_count: Number(data.categories_count || 0),
        skills_detail: rawSkillsDetail.map((skill: any) => ({
          skill_id: String(skill.skill_id || ""),
          name: String(skill.name || "Sin nombre"),
          category: String(skill.category || "General"),
          color: skill.color || null,
          icon: skill.icon || null,
          projects_count: Number(skill.projects_count || 0),
          active_projects_count: Number(skill.active_projects_count || 0),
          completed_projects_count: Number(skill.completed_projects_count || 0),
          last_used_at: skill.last_used_at || null,
        }))
      } : null)
    } catch (error) {
      console.error("Error sincronizando skills profesionales:", error)
      setCareerSkillsSummary(null)
    } finally {
      setLoadingCareerSkills(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CALCULAR PROGRESO REAL (DATA & CARRERA) ---
  const fetchRealProgress = useCallback(async () => {
    try {
      if (!hasFetchedCareerRef.current) {
        setLoadingProgress(true)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          id,
          status,
          project_tasks (
            id,
            status
          )
        `)
        .eq("user_id", session.user.id)

      if (error) throw error

      if (projects && projects.length > 0) {
        let totalTasks = 0
        let completedTasks = 0

        projects.forEach((project: any) => {
          const tasks = project.project_tasks || []
          totalTasks += tasks.length
          completedTasks += tasks.filter((t: any) => String(t.status).toUpperCase() === "COMPLETADO").length
        })

        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        setCareerProgress(percentage)
        setTotalProjects(projects.length)
        setActiveProjects(projects.filter((p: any) => String(p.status).toLowerCase() === "en curso").length)
        setCompletedProjects(projects.filter((p: any) => String(p.status).toLowerCase() === "completado").length)
        setTotalCareerTasks(totalTasks)
        setCompletedCareerTasks(completedTasks)
      } else {
        setCareerProgress(0)
        setTotalProjects(0)
        setActiveProjects(0)
        setCompletedProjects(0)
        setTotalCareerTasks(0)
        setCompletedCareerTasks(0)
      }
    } catch (error) {
      console.error("Error calculando progreso de carrera:", error)
    } finally {
      hasFetchedCareerRef.current = true
      setLoadingProgress(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CALCULAR PROGRESO REAL DE SALUD (SEMANA ACTUAL) ---
  const fetchHealthProgress = useCallback(async () => {
    try {
      if (!hasFetchedHealthRef.current) {
        setLoadingHealth(true)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: routines, error } = await supabase
        .from("rutinas_entrenamiento")
        .select("descripcion_rutina, activo")
        .eq("user_id", session.user.id)

      if (error) throw error

      if (routines && routines.length > 0) {
        let totalWeeklyTasks = 0
        let completedWeeklyTasks = 0
        let activeDays = 0

        routines.forEach((row: any) => {
          if (row.activo && row.descripcion_rutina) {
            activeDays++

            try {
              const parsed = JSON.parse(row.descripcion_rutina)

              const hasFuerza = (parsed.fuerza || "").trim() !== ""
              const hasCardio = (parsed.cardio || "").trim() !== ""

              if (hasFuerza) {
                totalWeeklyTasks++
                if (parsed.fuerzaDone === true) completedWeeklyTasks++
              }

              if (hasCardio) {
                totalWeeklyTasks++
                if (parsed.cardioDone === true) completedWeeklyTasks++
              }
            } catch (e) {
              totalWeeklyTasks++
            }
          }
        })

        const percentage = totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0

        setHealthProgress(percentage)
        setPlannedWorkoutDays(activeDays)
        setCompletedHealthTasks(completedWeeklyTasks)
        setTotalHealthTasks(totalWeeklyTasks)
      } else {
        setHealthProgress(0)
        setPlannedWorkoutDays(0)
        setCompletedHealthTasks(0)
        setTotalHealthTasks(0)
      }
    } catch (error) {
      console.error("Error calculando progreso de salud:", error)
    } finally {
      hasFetchedHealthRef.current = true
      setLoadingHealth(false)
    }
  }, [supabase])

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          setDisplayName(profile.full_name || profile.username || "Usuario")
        }
      }
    }

    getUserProfile()
    fetchRealProgress()
    fetchHealthProgress()
    fetchHealthInsights()
    fetchWeeklyHealthSummary()
    fetchWeeklyCareerSummary()
    fetchWeeklyCareerActivity()
    fetchCareerSkillsSummary()
  }, [supabase, fetchRealProgress, fetchHealthProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary])

  // --- ESCUCHA EN TIEMPO REAL DESDE SUPABASE ---
  useEffect(() => {
    const healthChannel = supabase
      .channel("realtime-health-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "rutinas_entrenamiento",
        },
        () => {
          fetchHealthProgress()
          fetchWeeklyHealthSummary()
        }
      )
      .subscribe()

    const projectsChannel = supabase
      .channel("realtime-career-projects-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          fetchRealProgress()
          fetchWeeklyCareerSummary()
          fetchWeeklyCareerActivity()
          fetchCareerSkillsSummary()
        }
      )
      .subscribe()

    const tasksChannel = supabase
      .channel("realtime-career-tasks-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
        },
        () => {
          fetchRealProgress()
          fetchWeeklyCareerSummary()
          fetchWeeklyCareerActivity()
        }
      )
      .subscribe()

    const careerActivityChannel = supabase
      .channel("realtime-career-activity-logs-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "project_activity_logs",
        },
        () => {
          fetchWeeklyCareerActivity()
        }
      )
      .subscribe()

    const careerSkillsChannel = supabase
      .channel("realtime-career-skills-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "career_skills",
        },
        () => {
          fetchCareerSkillsSummary()
        }
      )
      .subscribe()

    const projectSkillsChannel = supabase
      .channel("realtime-project-skills-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "project_skills",
        },
        () => {
          fetchCareerSkillsSummary()
        }
      )
      .subscribe()

    const bodyProgressChannel = supabase
      .channel("realtime-body-progress-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "body_progress_logs",
        },
        () => {
          fetchHealthInsights()
          fetchWeeklyHealthSummary()
        }
      )
      .subscribe()

    const mealLogsChannel = supabase
      .channel("realtime-meal-logs-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "meal_logs",
        },
        () => {
          fetchHealthInsights()
          fetchWeeklyHealthSummary()
        }
      )
      .subscribe()

    const waterLogsChannel = supabase
      .channel("realtime-water-logs-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "water_logs",
        },
        () => {
          fetchHealthInsights()
          fetchWeeklyHealthSummary()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(healthChannel)
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(careerActivityChannel)
      supabase.removeChannel(careerSkillsChannel)
      supabase.removeChannel(projectSkillsChannel)
      supabase.removeChannel(bodyProgressChannel)
      supabase.removeChannel(mealLogsChannel)
      supabase.removeChannel(waterLogsChannel)
    }
  }, [supabase, fetchHealthProgress, fetchRealProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary])

  // --- REFRESCAR CUANDO SE CIERRA EL PANEL ---
  useEffect(() => {
    if (!hasMountedPanelRefreshRef.current) {
      hasMountedPanelRefreshRef.current = true
      return
    }

    if (!isPanelOpen) {
      fetchRealProgress()
      fetchHealthProgress()
      fetchHealthInsights()
      fetchWeeklyHealthSummary()
      fetchWeeklyCareerSummary()
      fetchWeeklyCareerActivity()
      fetchCareerSkillsSummary()
    }
  }, [isPanelOpen, fetchRealProgress, fetchHealthProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary])

  const globalProgress = Math.round((healthProgress + careerProgress + personalCareProgress) / 3)

  const weeklyTrainingPct = weeklyHealthSummary
    ? Math.min(Math.max(Math.round(weeklyHealthSummary.training_completion_percentage || 0), 0), 100)
    : 0

  const weeklyPlannedDays = weeklyHealthSummary?.planned_training_days || 0
  const weeklyCompletedDays = weeklyHealthSummary?.completed_training_days || 0

  const weeklyCareerPct = weeklyCareerSummary
    ? Math.min(Math.max(Math.round(weeklyCareerSummary.weekly_productivity_percentage || 0), 0), 100)
    : 0

  const totalCareerPct = weeklyCareerSummary
    ? Math.min(Math.max(Math.round(weeklyCareerSummary.total_task_completion_percentage || 0), 0), 100)
    : 0

  const careerActivityScore = weeklyCareerActivity
    ? Math.min(Math.round((weeklyCareerActivity.total_events / 15) * 100), 100)
    : 0

  const careerActivityLabel =
    weeklyCareerActivity?.activity_intensity === "high"
      ? "Alta intensidad"
      : weeklyCareerActivity?.activity_intensity === "medium"
        ? "Intensidad media"
        : weeklyCareerActivity?.activity_intensity === "low"
          ? "Actividad inicial"
          : "Sin actividad"

  const lastCareerActivityText = weeklyCareerActivity?.last_event_description || weeklyCareerActivity?.last_event_title || "Sin eventos registrados"

  const skillsUsagePct = careerSkillsSummary && careerSkillsSummary.total_skills > 0
    ? Math.round((careerSkillsSummary.used_skills / careerSkillsSummary.total_skills) * 100)
    : 0

  const topCareerSkills = careerSkillsSummary?.skills_detail
    ? careerSkillsSummary.skills_detail.filter((skill) => skill.projects_count > 0).slice(0, 5)
    : []

  const topSkillLabel = careerSkillsSummary && careerSkillsSummary.top_skill_projects_count > 0
    ? careerSkillsSummary.top_skill_name || "Sin skill dominante"
    : "Sin skill dominante"

  const topSkillCategoryLabel = careerSkillsSummary && careerSkillsSummary.top_skill_projects_count > 0
    ? careerSkillsSummary.top_skill_category || "Sin categoría"
    : "Aún sin proyectos"

  const stats = [
    {
      title: "Sistema Global",
      value: `${globalProgress}%`,
      icon: Gauge,
      color: "from-slate-700 via-blue-600 to-cyan-500",
      glow: "shadow-blue-500/10",
      accent: "text-blue-300",
      description: "Promedio de 3 pilares",
      trend: "Live",
    },
    {
      title: "Salud Física",
      value: loadingHealth ? "..." : `${healthProgress}%`,
      icon: HeartPulse,
      color: "from-slate-700 via-emerald-600 to-teal-500",
      glow: "shadow-emerald-500/10",
      accent: "text-emerald-300",
      description: `Rutina ${completedHealthTasks}/${totalHealthTasks} · ${latestWeightKg !== null ? `${latestWeightKg} kg` : "sin peso"}`,
      trend: "Real-time",
    },
    {
      title: "Data & Carrera",
      value: loadingProgress ? "..." : `${careerProgress}%`,
      icon: BrainCircuit,
      color: "from-slate-700 via-orange-600 to-amber-500",
      glow: "shadow-orange-500/10",
      accent: "text-orange-300",
      description: `${completedCareerTasks}/${totalCareerTasks} subtareas completadas`,
      trend: "Real-time",
    },
    {
      title: "Cuidado Personal",
      value: `${personalCareProgress}%`,
      icon: UserRound,
      color: "from-slate-700 via-purple-600 to-fuchsia-500",
      glow: "shadow-purple-500/10",
      accent: "text-purple-300",
      description: "Pendiente de conectar módulo",
      trend: "Next",
    },
  ]

  const pillarRows = [
    {
      label: "Salud Física",
      val: healthProgress,
      color: "bg-emerald-500",
      text: "text-emerald-300",
      icon: Activity,
      description: `${plannedWorkoutDays} días planificados · ${completedHealthTasks}/${totalHealthTasks} tareas · energía ${latestEnergyLevel !== null ? `${latestEnergyLevel}/10` : "sin registro"}`,
    },
    {
      label: "Carrera & Datos",
      val: careerProgress,
      color: "bg-orange-500",
      text: "text-orange-300",
      icon: Database,
      description: `${activeProjects} proyectos activos de ${totalProjects} totales`,
    },
    {
      label: "Cuidado Personal",
      val: personalCareProgress,
      color: "bg-purple-500",
      text: "text-purple-300",
      icon: UserRound,
      description: "Rutinas de imagen y cuidado por implementar",
    },
  ]

  const milestones = [
    {
      title: "Completar módulo de Cuidado Personal",
      label: "Siguiente prioridad",
      icon: UserRound,
      style: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    },
    {
      title: "Analizar tendencia semanal de salud",
      label: "Resumen semanal conectado",
      icon: Flame,
      style: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    },
    {
      title: "Analizar productividad semanal de carrera",
      label: "Resumen Data & Carrera conectado",
      icon: Cpu,
      style: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
  }

  const itemVariants = {
    hidden: { y: 12, opacity: 0, filter: "blur(3px)" },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040a] px-4 pb-12 pt-6 text-slate-100 antialiased selection:bg-slate-700/60 selection:text-white md:px-8">
      <DashboardBackground />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-6"
      >
        {/* HEADER PRINCIPAL */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[#070b14]/78 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.095),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(249,115,22,0.075),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_38%)]" />
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-500/[0.055] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300/20 to-transparent" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl space-y-4">
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Sparkles size={14} className="animate-pulse" /> Centro de comando personal
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
                  Hola, <span className="bg-gradient-to-r from-slate-100 via-blue-200 to-slate-400 bg-clip-text text-transparent">{displayName}</span>
                </h2>
                <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Panel limpio para ver lo importante: tu constancia en salud y tu avance profesional en Data & Carrera, sin saturarte con métricas repetidas.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <div className="grid grid-cols-3 gap-2 rounded-[1.35rem] border border-white/[0.07] bg-black/25 p-2 backdrop-blur-xl">
                <div className="rounded-2xl bg-blue-500/[0.08] px-4 py-3 text-center">
                  <Layers3 className="mx-auto mb-1.5 text-blue-300" size={17} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-300/80">Global</p>
                  <p className="text-2xl font-black text-white">{globalProgress}%</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/[0.08] px-4 py-3 text-center">
                  <HeartPulse className="mx-auto mb-1.5 text-emerald-300" size={17} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">Salud</p>
                  <p className="text-2xl font-black text-white">{loadingHealth ? "..." : `${healthProgress}%`}</p>
                </div>
                <div className="rounded-2xl bg-orange-500/[0.08] px-4 py-3 text-center">
                  <BrainCircuit className="mx-auto mb-1.5 text-orange-300" size={17} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-300/80">Carrera</p>
                  <p className="text-2xl font-black text-white">{loadingProgress ? "..." : `${careerProgress}%`}</p>
                </div>
              </div>

              <Button
                onClick={() => setIsPanelOpen(true)}
                className="h-14 rounded-2xl border border-white/[0.08] bg-white/[0.07] px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_18px_42px_rgba(0,0,0,0.30)] transition-all hover:-translate-y-0.5 hover:border-blue-300/20 hover:bg-blue-500/15 active:scale-[0.98]"
              >
                <Plus size={20} strokeWidth={3} />
                Registrar Entrada
              </Button>
            </div>
          </div>
        </motion.div>

        {/* VISTA GENERAL: SOLO LO ESENCIAL */}
        <div className="grid gap-6 xl:grid-cols-2">
          <motion.div variants={itemVariants}>
            <Card className="relative h-full overflow-hidden rounded-[2.2rem] border border-emerald-300/[0.10] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.13),transparent_30%),radial-gradient(circle_at_86%_70%,rgba(59,130,246,0.07),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_42%)]" />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 via-cyan-400 to-blue-500" />

              <CardHeader className="relative">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                        <HeartPulse size={18} />
                      </span>
                      Salud Física
                    </CardTitle>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Constancia semanal, energía, peso e hidratación. Lo suficiente para saber si vas bien.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-300/14 bg-emerald-500/[0.08] px-4 py-3 text-right">
                    <p className="text-4xl font-black tracking-tight text-emerald-200">
                      {loadingHealth ? "..." : `${healthProgress}%`}
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
                      avance salud
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.08] text-emerald-300">
                        <Dumbbell size={16} />
                      </span>
                      <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
                        semana
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rutina semanal</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {weeklyHealthSummary ? `${weeklyCompletedDays}/${weeklyPlannedDays}` : `${completedHealthTasks}/${totalHealthTasks}`}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {weeklyHealthSummary ? `${weeklyTrainingPct}% cumplido` : "Planificados vs cumplidos"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.08] text-blue-300">
                        <BatteryCharging size={16} />
                      </span>
                      <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        energía
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Energía</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {weeklyHealthSummary && weeklyHealthSummary.avg_energy_level > 0
                        ? `${weeklyHealthSummary.avg_energy_level.toFixed(1)}/10`
                        : latestEnergyLevel !== null
                          ? `${latestEnergyLevel}/10`
                          : "—"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Promedio semanal o último registro
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-500/[0.08] text-cyan-300">
                        <Droplet size={16} />
                      </span>
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300/80">
                        hoy
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agua hoy</p>
                    <p className="mt-1 text-2xl font-black text-white">{todayWaterLiters.toFixed(2)}L</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Semana: {weeklyHealthSummary ? `${weeklyHealthSummary.total_water_liters.toFixed(2)}L` : "—"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                        <Scale size={16} />
                      </span>
                      <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        físico
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Último peso</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {latestWeightKg !== null ? `${latestWeightKg} kg` : "—"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {bodyProgressCount} registros de progreso
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida de salud</p>
                    <ShieldCheck size={16} className="text-emerald-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklyHealthSummary
                      ? weeklyPlannedDays > 0
                        ? weeklyCompletedDays === weeklyPlannedDays
                          ? "Excelente semana: completaste todos los días de rutina planificados."
                          : weeklyCompletedDays > 0
                            ? `Tienes ${weeklyPlannedDays} días planificados y ${weeklyCompletedDays} cumplidos. El foco es mejorar constancia.`
                            : `Tienes ${weeklyPlannedDays} días planificados. Aún falta marcar días completados.`
                        : "Aún no hay días de rutina planificados para analizar cumplimiento."
                      : "Registra comida, agua, rutina o progreso físico para activar una lectura semanal más útil."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative h-full overflow-hidden rounded-[2.2rem] border border-orange-300/[0.10] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.14),transparent_30%),radial-gradient(circle_at_86%_70%,rgba(59,130,246,0.08),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_42%)]" />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 via-amber-400 to-blue-500" />

              <CardHeader className="relative">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                        <BrainCircuit size={18} />
                      </span>
                      Data & Carrera
                    </CardTitle>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Avance real de proyectos, productividad semanal y stack profesional usado.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-300/14 bg-orange-500/[0.08] px-4 py-3 text-right">
                    <p className="text-4xl font-black tracking-tight text-orange-200">
                      {loadingProgress ? "..." : `${careerProgress}%`}
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
                      avance carrera
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                        <CheckCircle2 size={16} />
                      </span>
                      <span className="rounded-full border border-orange-400/15 bg-orange-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300/80">
                        global
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtareas completadas</p>
                    <p className="mt-1 text-2xl font-black text-white">{completedCareerTasks}/{totalCareerTasks}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {weeklyCareerSummary ? `${totalCareerPct}% total` : "Avance general"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.08] text-blue-300">
                        <Rocket size={16} />
                      </span>
                      <span className="rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300/80">
                        proyectos
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proyectos activos</p>
                    <p className="mt-1 text-2xl font-black text-white">{activeProjects}/{totalProjects}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {completedProjects} completados
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-500/[0.08] text-cyan-300">
                        <TimerReset size={16} />
                      </span>
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300/80">
                        semana
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Productividad semanal</p>
                    <p className="mt-1 text-2xl font-black text-white">{weeklyCareerSummary ? `${weeklyCareerPct}%` : "—"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {weeklyCareerSummary ? `${weeklyCareerSummary.tasks_completed_week} tareas completadas` : "Sin datos semanales"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/[0.08] text-purple-300">
                        <Cpu size={16} />
                      </span>
                      <span className="rounded-full border border-purple-400/15 bg-purple-500/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-purple-300/80">
                        stack
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skills usadas</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {careerSkillsSummary ? `${careerSkillsSummary.used_skills}/${careerSkillsSummary.total_skills}` : "—"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {careerSkillsSummary ? `${skillsUsagePct}% del catálogo` : "Sin resumen de skills"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida de carrera</p>
                    <Cpu size={16} className="text-orange-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklyCareerSummary
                      ? weeklyCareerSummary.tasks_completed_week > 0
                        ? `Esta semana cerraste ${weeklyCareerSummary.tasks_completed_week} tareas. Tu proyecto más fuerte es ${weeklyCareerSummary.top_project_title || "aún no definido"}.`
                        : "Esta semana aún no registra tareas completadas. El foco debería ser cerrar al menos una subtarea documentada."
                      : "Aún no hay resumen semanal de carrera. Registra proyectos y subtareas para activar este análisis."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* DETALLE ORDENADO POR PILAR */}
        <div className="grid gap-6 xl:grid-cols-2">
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-[2rem] border border-emerald-300/[0.09] bg-[#070b14]/72 shadow-[0_24px_74px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.09),transparent_32%)]" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                    <LineChart size={17} />
                  </span>
                  Salud: tendencia útil
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  Solo indicadores accionables para decidir si debes ajustar rutina, hidratación o energía.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cumplimiento de rutina</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      {weeklyHealthSummary ? `${weeklyTrainingPct}%` : "—"}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: weeklyHealthSummary ? `${weeklyTrainingPct}%` : `${healthProgress}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-cyan-400 to-blue-300 shadow-[0_0_14px_rgba(16,185,129,0.38)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Planificados: {weeklyHealthSummary ? weeklyPlannedDays : plannedWorkoutDays} ·
                    Cumplidos: {weeklyHealthSummary ? weeklyCompletedDays : completedHealthTasks} ·
                    Días con actividad: {weeklyHealthSummary ? `${weeklyHealthSummary.active_days}` : "—"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.06] bg-slate-950/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calorías promedio</p>
                    <p className="mt-2 text-xl font-black text-white">
                      {weeklyHealthSummary ? Math.round(weeklyHealthSummary.avg_daily_calories).toLocaleString("es-PE") : "—"} kcal
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Meta: {weeklyHealthSummary ? Math.round(weeklyHealthSummary.avg_calorie_target).toLocaleString("es-PE") : "—"} kcal
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-slate-950/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comidas hoy</p>
                    <p className="mt-2 text-xl font-black text-white">{todayMealCount}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Semana: {weeklyHealthSummary ? `${weeklyHealthSummary.meals_count} comidas` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-[2rem] border border-orange-300/[0.09] bg-[#070b14]/72 shadow-[0_24px_74px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.10),transparent_32%)]" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                    <Database size={17} />
                  </span>
                  Carrera: ejecución y stack
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  Métricas que te dicen si estás avanzando y qué habilidades estás realmente usando.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avance de subtareas</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                      {weeklyCareerSummary ? `${totalCareerPct}%` : `${careerProgress}%`}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: weeklyCareerSummary ? `${totalCareerPct}%` : `${careerProgress}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_14px_rgba(249,115,22,0.42)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Completadas: {completedCareerTasks}/{totalCareerTasks} · En curso: {weeklyCareerSummary?.in_progress_tasks ?? "—"} · Pendientes: {weeklyCareerSummary?.pending_tasks ?? "—"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.06] bg-slate-950/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actividad semanal</p>
                    <p className="mt-2 text-xl font-black text-white">{weeklyCareerActivity ? weeklyCareerActivity.total_events : "—"}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {careerActivityLabel} · Score {careerActivityScore}%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-slate-950/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill dominante</p>
                    <p className="mt-2 truncate text-xl font-black text-white">{topSkillLabel}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {topSkillCategoryLabel}
                    </p>
                  </div>
                </div>

                {topCareerSkills.length > 0 && (
                  <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Stack más usado</p>
                    <div className="flex flex-wrap gap-2">
                      {topCareerSkills.map((skill) => (
                        <span
                          key={skill.skill_id}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-orange-100/85"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: skill.color || "#f97316" }}
                          />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SIGUIENTE ACCIÓN */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.045] p-6 shadow-[0_24px_74px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(249,115,22,0.10),transparent_34%)]" />

          <div className="relative grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-1">
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-slate-300">
                <Target size={13} /> Prioridad
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-white">Qué mirar primero</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                El dashboard ya no intenta mostrar todo. Te deja una lectura clara: salud para constancia y carrera para ejecución técnica.
              </p>
            </div>

            <div className="grid gap-3 xl:col-span-2 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-emerald-300/10 bg-emerald-500/[0.055] p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200/85">
                  <HeartPulse size={14} />
                  Salud
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-300">
                  {weeklyTrainingPct >= 80
                    ? "Mantén la rutina y enfócate en consistencia de agua y energía."
                    : "Tu foco debería ser completar más días de rutina antes de obsesionarte con métricas secundarias."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-orange-300/10 bg-orange-500/[0.055] p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-orange-200/85">
                  <BrainCircuit size={14} />
                  Data & Carrera
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-300">
                  {weeklyCareerSummary && weeklyCareerSummary.tasks_completed_week > 0
                    ? "Vas avanzando. El siguiente paso es documentar subtareas y evidencias para subir valor de portafolio."
                    : "Cierra al menos una subtarea y documenta qué skill usaste para que tu avance sea demostrable."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <RegistrationPanel open={isPanelOpen} setOpen={setIsPanelOpen} />
      </motion.div>
    </div>
  )
}
