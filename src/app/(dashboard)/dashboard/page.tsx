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
        {/* HEADER FUTURISTA */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[#070b14]/78 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.095),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(249,115,22,0.075),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_38%)]" />
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-500/[0.055] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300/20 to-transparent" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl space-y-4">
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Sparkles size={14} className="animate-pulse" /> Status del Sistema
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
                  Hola, <span className="bg-gradient-to-r from-slate-100 via-blue-200 to-slate-400 bg-clip-text text-transparent">{displayName}</span>
                </h2>
                <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Centro de comando personal sincronizado. Tu avance actual es <span className="font-black text-orange-300">{careerProgress}%</span> en Data & Carrera y <span className="font-black text-emerald-300">{healthProgress}%</span> en Salud Física.
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
                <div className="rounded-2xl bg-orange-500/[0.08] px-4 py-3 text-center">
                  <Rocket className="mx-auto mb-1.5 text-orange-300" size={17} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-300/80">Activos</p>
                  <p className="text-2xl font-black text-white">{activeProjects}</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/[0.08] px-4 py-3 text-center">
                  <Trophy className="mx-auto mb-1.5 text-emerald-300" size={17} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">Done</p>
                  <p className="text-2xl font-black text-white">{completedProjects}</p>
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

        {/* GRID DE KPIs */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={itemVariants} whileHover={{ y: -7, scale: 1.015 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
              <Card className="group relative min-h-[188px] overflow-hidden rounded-[1.75rem] border border-white/[0.075] bg-[#070b14]/78 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl transition-all hover:border-white/[0.13]">
                <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.09] blur-3xl transition-opacity group-hover:opacity-[0.18]`} />
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br ${stat.color} ${stat.glow} p-3 text-white shadow-lg`}>
                    <stat.icon size={19} strokeWidth={2.5} />
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-black tracking-tighter text-white">{stat.value}</div>
                    <span className="rounded-full border border-white/[0.06] bg-slate-950/55 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-blue-300">
                      {stat.trend}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <TrendingUp size={12} className="text-emerald-300" />
                      {stat.description}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-950/80">
                      <motion.div
                        initial={false}
                        animate={{ width: stat.value === "..." ? "0%" : `${parseInt(String(stat.value)) || 0}%` }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.color} shadow-[0_0_14px_rgba(59,130,246,0.45)]`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* RESUMEN DIARIO DE SALUD */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1 rounded-[1.4rem] border border-white/[0.06] bg-[#070b14]/45 px-5 py-4 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Resumen de hoy</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Indicadores diarios sincronizados con tus registros del día actual.
            </p>
          </div>
          <div className="mt-3 flex w-fit items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-300 md:mt-0">
            <TimerReset size={13} className="animate-pulse" />
            Corte diario
          </div>
        </motion.div>

        {/* INTELIGENCIA DE SALUD */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.075] bg-[#070b14]/72 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.10),transparent_34%)]" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.07] text-emerald-300">
                <Scale size={18} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Último peso</p>
                <p className="text-xl font-black text-white">{latestWeightKg !== null ? `${latestWeightKg} kg` : "—"}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.075] bg-[#070b14]/72 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.07] text-blue-300">
                <BatteryCharging size={18} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Energía</p>
                <p className="text-xl font-black text-white">{latestEnergyLevel !== null ? `${latestEnergyLevel}/10` : "—"}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.075] bg-[#070b14]/72 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.10),transparent_34%)]" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.07] text-orange-300">
                <Flame size={18} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comidas hoy</p>
                <p className="text-xl font-black text-white">{todayMealCount}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.075] bg-[#070b14]/72 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.10),transparent_34%)]" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-500/[0.07] text-cyan-300">
                <Droplet size={18} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agua hoy</p>
                <p className="text-xl font-black text-white">{todayWaterLiters.toFixed(2)}L</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* RESUMEN SEMANAL DE SALUD */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_86%_70%,rgba(59,130,246,0.08),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_42%)]" />
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 via-cyan-400 to-blue-500" />
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />

            <CardHeader className="relative">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                      <HeartPulse size={18} />
                    </span>
                    Resumen semanal de salud
                  </CardTitle>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {weeklyHealthSummary
                      ? `${formatDateShort(weeklyHealthSummary.week_start)} - ${formatDateShort(weeklyHealthSummary.week_end)} · ${weeklyHealthSummary.active_days} días con actividad`
                      : loadingWeeklyHealth
                        ? "Sincronizando tendencias semanales..."
                        : "Aún no hay datos semanales suficientes"}
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  <ScanLine size={13} className="animate-pulse" />
                  Tendencia BI
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                      <Flame size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      semana
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kcal acumuladas semana</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyHealthSummary ? Math.round(weeklyHealthSummary.tracker_total_calories).toLocaleString("es-PE") : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Promedio diario: {weeklyHealthSummary ? Math.round(weeklyHealthSummary.avg_daily_calories).toLocaleString("es-PE") : "—"} kcal
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-500/[0.08] text-cyan-300">
                      <Droplet size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      hidratación
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agua acumulada semana</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyHealthSummary ? `${weeklyHealthSummary.total_water_liters.toFixed(2)}L` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Promedio diario: {weeklyHealthSummary ? `${weeklyHealthSummary.avg_daily_water_liters.toFixed(2)}L` : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.08] text-emerald-300">
                      <Dumbbell size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
                      rutina real
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rutina semanal</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyHealthSummary ? `${weeklyCompletedDays}/${weeklyPlannedDays}` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {weeklyHealthSummary
                      ? `${weeklyTrainingPct}% cumplido · ${weeklyHealthSummary.workout_days}/7 días marcados`
                      : "Planificados vs cumplidos"}
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Energía promedio</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyHealthSummary && weeklyHealthSummary.avg_energy_level > 0 ? `${weeklyHealthSummary.avg_energy_level.toFixed(1)}/10` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Peso: {weeklyHealthSummary?.latest_weight_kg ? `${weeklyHealthSummary.latest_weight_kg} kg` : "sin registro"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cumplimiento calórico semanal</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                      {weeklyHealthSummary && weeklyHealthSummary.avg_calorie_target > 0
                        ? `${Math.min(Math.round((weeklyHealthSummary.avg_daily_calories / weeklyHealthSummary.avg_calorie_target) * 100), 140)}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{
                        width: weeklyHealthSummary && weeklyHealthSummary.avg_calorie_target > 0
                          ? `${Math.min(Math.round((weeklyHealthSummary.avg_daily_calories / weeklyHealthSummary.avg_calorie_target) * 100), 100)}%`
                          : "0%",
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_14px_rgba(249,115,22,0.42)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Meta promedio: {weeklyHealthSummary ? Math.round(weeklyHealthSummary.avg_calorie_target).toLocaleString("es-PE") : "—"} kcal ·
                    Comidas: {weeklyHealthSummary ? weeklyHealthSummary.meals_count : "—"} ·
                    Actividad: {weeklyHealthSummary ? weeklyHealthSummary.active_days : "—"} días
                  </p>
                </div>

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
                      animate={{ width: weeklyHealthSummary ? `${weeklyTrainingPct}%` : "0%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-cyan-400 to-blue-300 shadow-[0_0_14px_rgba(16,185,129,0.38)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Planificados: {weeklyHealthSummary ? weeklyPlannedDays : "—"} ·
                    Cumplidos: {weeklyHealthSummary ? weeklyCompletedDays : "—"} ·
                    Días marcados: {weeklyHealthSummary ? `${weeklyHealthSummary.workout_days}/7` : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-emerald-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklyHealthSummary
                      ? weeklyPlannedDays > 0
                        ? weeklyCompletedDays === weeklyPlannedDays
                          ? "Excelente semana: completaste todos los días de rutina planificados."
                          : weeklyCompletedDays > 0
                            ? `Tienes ${weeklyPlannedDays} días planificados y ${weeklyCompletedDays} cumplidos. Aún puedes elevar tu constancia semanal.`
                            : `Tienes ${weeklyPlannedDays} días planificados. Aún no hay días completados al 100% esta semana.`
                        : "Aún no hay días de rutina planificados para analizar cumplimiento."
                      : "Aún no hay una semana activa para analizar. Registra comidas, agua y progreso físico para activar esta lectura."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* RESUMEN SEMANAL DE DATA & CARRERA */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.13),transparent_30%),radial-gradient(circle_at_86%_70%,rgba(59,130,246,0.08),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_42%)]" />
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 via-amber-400 to-blue-500" />
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />

            <CardHeader className="relative">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                      <BrainCircuit size={18} />
                    </span>
                    Resumen semanal de Data & Carrera
                  </CardTitle>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {weeklyCareerSummary
                      ? `${formatDateShort(weeklyCareerSummary.week_start)} - ${formatDateShort(weeklyCareerSummary.week_end)} · productividad y avance de proyectos`
                      : loadingWeeklyCareer
                        ? "Sincronizando productividad semanal..."
                        : "Aún no hay datos de carrera suficientes"}
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-orange-400/15 bg-orange-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-300">
                  <Database size={13} className="animate-pulse" />
                  Career BI
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                      <Rocket size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300/80">
                      proyectos
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proyectos activos</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerSummary ? `${weeklyCareerSummary.active_projects}/${weeklyCareerSummary.total_projects}` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Creados semana: {weeklyCareerSummary ? weeklyCareerSummary.projects_created_week : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.08] text-blue-300">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300/80">
                      tareas
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtareas completadas</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerSummary ? `${weeklyCareerSummary.completed_tasks}/${weeklyCareerSummary.total_tasks}` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Esta semana: {weeklyCareerSummary ? weeklyCareerSummary.tasks_completed_week : "—"} completadas
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-500/[0.08] text-rose-300">
                      <TimerReset size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-rose-300/80">
                      control
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendientes críticos</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerSummary ? weeklyCareerSummary.overdue_tasks : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Próx. 7 días: {weeklyCareerSummary ? weeklyCareerSummary.due_next_7_days : "—"} tareas
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-500/[0.08] text-amber-300">
                      <Trophy size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300/80">
                      foco
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proyecto destacado</p>
                  <p className="mt-1 line-clamp-1 text-xl font-black text-white">
                    {weeklyCareerSummary?.top_project_title || "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {weeklyCareerSummary ? `${weeklyCareerSummary.top_project_completed_tasks} tareas completadas` : "Sin actividad semanal"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avance total de carrera</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                      {weeklyCareerSummary ? `${totalCareerPct}%` : "—"}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: weeklyCareerSummary ? `${totalCareerPct}%` : "0%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_14px_rgba(249,115,22,0.42)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    En curso: {weeklyCareerSummary ? weeklyCareerSummary.in_progress_tasks : "—"} ·
                    Pendientes: {weeklyCareerSummary ? weeklyCareerSummary.pending_tasks : "—"} ·
                    Alta prioridad: {weeklyCareerSummary ? weeklyCareerSummary.high_priority_tasks : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Productividad semanal</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                      {weeklyCareerSummary ? `${weeklyCareerPct}%` : "—"}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: weeklyCareerSummary ? `${weeklyCareerPct}%` : "0%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-orange-300 shadow-[0_0_14px_rgba(59,130,246,0.38)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Creadas: {weeklyCareerSummary ? weeklyCareerSummary.tasks_created_week : "—"} ·
                    Completadas: {weeklyCareerSummary ? weeklyCareerSummary.tasks_completed_week : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-orange-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklyCareerSummary
                      ? weeklyCareerSummary.tasks_completed_week > 0
                        ? `Esta semana completaste ${weeklyCareerSummary.tasks_completed_week} subtareas. Tu avance total de carrera está en ${totalCareerPct}%.`
                        : weeklyCareerSummary.total_tasks > 0
                          ? "Tienes tareas registradas, pero aún no hay subtareas completadas esta semana. Prioriza una tarea pequeña para activar productividad."
                          : "Aún no hay subtareas suficientes para analizar productividad semanal."
                      : "Aún no hay actividad de Data & Carrera para analizar esta semana."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ACTIVIDAD REAL DE DATA & CARRERA */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_92%_45%,rgba(249,115,22,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_44%)]" />
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-orange-400 to-amber-300" />
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-300/25 to-transparent" />

            <CardHeader className="relative">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                      <Activity size={18} />
                    </span>
                    Actividad real de Data & Carrera
                  </CardTitle>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {weeklyCareerActivity
                      ? `${formatDateShort(weeklyCareerActivity.week_start)} - ${formatDateShort(weeklyCareerActivity.week_end)} · historial auditado desde project_activity_logs`
                      : loadingWeeklyCareerActivity
                        ? "Sincronizando historial de actividad..."
                        : "Aún no hay eventos reales registrados"}
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-300">
                  <Orbit size={13} className="animate-spin [animation-duration:7s]" />
                  Activity Log
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.08] text-blue-300">
                      <Waves size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300/80">
                      eventos
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Eventos de actividad</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerActivity ? weeklyCareerActivity.total_events : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {weeklyCareerActivity ? careerActivityLabel : "Historial semanal"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.08] text-emerald-300">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
                      completadas
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tareas completadas</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerActivity ? weeklyCareerActivity.tasks_completed_events : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Creadas: {weeklyCareerActivity ? weeklyCareerActivity.tasks_created_events : "—"} tareas
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                      <Database size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300/80">
                      impacto
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Objetos tocados</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerActivity ? `${weeklyCareerActivity.active_projects_touched}/${weeklyCareerActivity.active_tasks_touched}` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Proyectos / tareas con movimiento
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-500/[0.08] text-amber-300">
                      <CalendarClock size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300/80">
                      pico
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Día más activo</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weeklyCareerActivity?.most_active_day ? formatDateShort(weeklyCareerActivity.most_active_day) : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {weeklyCareerActivity ? `${weeklyCareerActivity.most_active_day_events} eventos` : "Sin actividad"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intensidad semanal</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                      {weeklyCareerActivity ? `${careerActivityScore}%` : "—"}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: weeklyCareerActivity ? `${careerActivityScore}%` : "0%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-orange-300 shadow-[0_0_14px_rgba(59,130,246,0.38)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Cambios de estado: {weeklyCareerActivity ? weeklyCareerActivity.task_status_changed_events + weeklyCareerActivity.project_status_changed_events : "—"} ·
                    Cambios de prioridad: {weeklyCareerActivity ? weeklyCareerActivity.task_priority_changed_events + weeklyCareerActivity.project_priority_changed_events : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Última actividad</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                      {weeklyCareerActivity?.last_event_type || "—"}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-slate-300">
                    {lastCareerActivityText}
                  </p>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    {weeklyCareerActivity?.last_event_at
                      ? new Date(weeklyCareerActivity.last_event_at).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sin fecha registrada"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-blue-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklyCareerActivity
                      ? weeklyCareerActivity.total_events >= 6
                        ? `Semana con buena actividad: ${weeklyCareerActivity.total_events} eventos registrados y ${weeklyCareerActivity.tasks_completed_events} tareas completadas.`
                        : weeklyCareerActivity.total_events > 0
                          ? `Semana iniciada: ${weeklyCareerActivity.total_events} evento(s) registrado(s). Sigue moviendo tareas para generar una tendencia real.`
                          : "Aún no hay eventos de actividad esta semana."
                      : "Aún no existe historial suficiente para analizar actividad real."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SKILLS & STACK PROFESIONAL */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_88%_65%,rgba(249,115,22,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_42%)]" />
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-orange-400" />
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />

            <CardHeader className="relative">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                      <Cpu size={18} />
                    </span>
                    Skills & Stack Profesional
                  </CardTitle>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {careerSkillsSummary
                      ? `${careerSkillsSummary.used_skills}/${careerSkillsSummary.total_skills} skills usadas · ${careerSkillsSummary.total_skill_project_links} conexiones proyecto-skill`
                      : loadingCareerSkills
                        ? "Sincronizando stack profesional..."
                        : "Aún no hay skills conectadas a proyectos"}
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  <Layers3 size={13} className="animate-pulse" />
                  Stack BI
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-500/[0.08] text-cyan-300">
                      <Cpu size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300/80">
                      skills
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skills usadas</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {careerSkillsSummary ? `${careerSkillsSummary.used_skills}/${careerSkillsSummary.total_skills}` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Sin usar: {careerSkillsSummary ? careerSkillsSummary.unused_skills : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-500/[0.08] text-orange-300">
                      <Star size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300/80">
                      dominante
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill dominante</p>
                  <p className="mt-1 line-clamp-1 text-2xl font-black text-white">
                    {topSkillLabel}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {topSkillCategoryLabel} · {careerSkillsSummary ? careerSkillsSummary.top_skill_projects_count : "—"} proyecto(s)
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/[0.08] text-blue-300">
                      <Database size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300/80">
                      conexiones
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proyecto-skill</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {careerSkillsSummary ? careerSkillsSummary.total_skill_project_links : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Categorías: {careerSkillsSummary ? careerSkillsSummary.categories_count : "—"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-500/[0.08] text-emerald-300">
                      <Target size={16} />
                    </span>
                    <span className="rounded-full border border-white/[0.05] bg-slate-950/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
                      cobertura
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cobertura técnica</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {careerSkillsSummary ? `${skillsUsagePct}%` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Catálogo técnico activo
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ranking de skills usadas</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                      Top {topCareerSkills.length || 0}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {topCareerSkills.length > 0 ? (
                      topCareerSkills.map((skill, index) => {
                        const maxProjects = Math.max(...topCareerSkills.map((item) => item.projects_count), 1)
                        const widthPct = Math.max(Math.round((skill.projects_count / maxProjects) * 100), 8)

                        return (
                          <div key={skill.skill_id} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-[10px] font-black text-cyan-200">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-black text-slate-200">{skill.name}</p>
                                  <p className="truncate text-[10px] font-semibold text-slate-500">{skill.category}</p>
                                </div>
                              </div>
                              <p className="shrink-0 text-[10px] font-black uppercase tracking-widest text-orange-300">
                                {skill.projects_count} proyecto(s)
                              </p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                              <motion.div
                                initial={false}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-400 to-orange-300 shadow-[0_0_14px_rgba(34,211,238,0.30)]"
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/[0.05] bg-black/20 p-5 text-center text-xs font-semibold text-slate-500">
                        Aún no hay skills asociadas a proyectos. Selecciónalas desde el pilar Data & Carrera.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-cyan-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {careerSkillsSummary
                      ? careerSkillsSummary.used_skills > 0
                        ? `Tu stack profesional ya conecta ${careerSkillsSummary.used_skills} skills con ${careerSkillsSummary.total_skill_project_links} uso(s) en proyectos. La skill más visible por ahora es ${topSkillLabel}.`
                        : "Tu catálogo de skills ya está creado. Falta asociar tecnologías a proyectos para activar el análisis profesional."
                      : "Aún no hay información suficiente para analizar tu stack profesional."}
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: careerSkillsSummary ? `${skillsUsagePct}%` : "0%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-blue-400 to-orange-300 shadow-[0_0_14px_rgba(34,211,238,0.35)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                    Usadas: {careerSkillsSummary ? careerSkillsSummary.used_skills : "—"} ·
                    Sin usar: {careerSkillsSummary ? careerSkillsSummary.unused_skills : "—"} ·
                    Categorías: {careerSkillsSummary ? careerSkillsSummary.categories_count : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECCIÓN CENTRAL: PILARES */}
        <div className="grid gap-8 xl:grid-cols-7">
          <motion.div variants={itemVariants} className="xl:col-span-4">
            <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_95%_85%,rgba(249,115,22,0.10),transparent_34%)]" />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-orange-400 to-emerald-400" />

              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                      <Target size={18} />
                    </span>
                    Nivel de Pilares
                  </CardTitle>
                  <button className="hidden rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-300 transition-all hover:bg-blue-500/15 sm:block">
                    Análisis completo
                  </button>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-8 py-6">
                {pillarRows.map((pilar) => (
                  <div key={pilar.label} className="group space-y-3 rounded-2xl border border-white/[0.055] bg-slate-950/32 p-4 transition-all hover:border-white/[0.10] hover:bg-white/[0.045]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/55">
                          <pilar.icon size={17} className={pilar.text} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-100 transition-colors group-hover:text-white">{pilar.label}</p>
                          <p className="truncate text-xs font-medium text-slate-500">{pilar.description}</p>
                        </div>
                      </div>
                      <span className={`rounded-xl border border-white/[0.06] bg-slate-950/65 px-3 py-1 text-sm font-black ${pilar.text}`}>
                        {pilar.val}%
                      </span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                      <motion.div
                        initial={false}
                        animate={{ width: `${pilar.val}%` }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                        className={`h-full ${pilar.color} rounded-full shadow-[0_0_14px_rgba(255,255,255,0.18)]`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* HITOS PRÓXIMOS */}
          <motion.div variants={itemVariants} className="xl:col-span-3">
            <Card className="relative h-full overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.14),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(16,185,129,0.08),transparent_34%)]" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between text-xl font-black tracking-tight text-white">
                  Próximas Mejoras
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                    <CalendarClock size={18} />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative">
                <div className="space-y-3">
                  {milestones.map((hito, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group flex cursor-pointer items-center gap-4 rounded-[1.5rem] border border-white/[0.06] bg-slate-950/38 p-4 transition-all hover:border-orange-400/20 hover:bg-white/[0.055]"
                    >
                      <div className={`rounded-2xl border p-3 transition-colors ${hito.style}`}>
                        <hito.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-tight text-white">{hito.title}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{hito.label}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-orange-300" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ÁREA DE ANALÍTICA */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[3rem] border border-dashed border-white/[0.10] bg-white/[0.035] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(249,115,22,0.10),transparent_34%)]" />
          <motion.div
            animate={{ x: ["-35%", "135%"] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.16)]">
              <BarChart2 className="animate-bounce" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-tighter text-white md:text-2xl">Terminal de Datos Personal</h4>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-400">
              Sistema conectado a tus pilares. Ya registra salud semanal, productividad de carrera, historial real de actividad y analítica de skills; el siguiente nivel será cuidado personal.
            </p>

            <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/38 p-4">
                <LineChart className="mx-auto mb-2 text-blue-300" size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Carrera</p>
                <p className="text-lg font-black text-white">{completedCareerTasks}/{totalCareerTasks}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/38 p-4">
                <Dumbbell className="mx-auto mb-2 text-emerald-300" size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Salud</p>
                <p className="text-lg font-black text-white">{completedHealthTasks}/{totalHealthTasks}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  {latestWeightKg !== null ? `${latestWeightKg} kg` : "sin peso"} · {latestEnergyLevel !== null ? `${latestEnergyLevel}/10 energía` : "sin energía"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/38 p-4">
                <Star className="mx-auto mb-2 text-purple-300" size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cuidado</p>
                <p className="text-lg font-black text-white">Next</p>
              </div>
            </div>
          </div>
        </motion.div>

        <RegistrationPanel open={isPanelOpen} setOpen={setIsPanelOpen} />
      </motion.div>
    </div>
  )
}
