"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  BrainCircuit,
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
  Gauge,
  Layers3,
  UserRound,
  CalendarClock,
  Waves,
  Rocket,
  LineChart,
  Star,
  Cpu,
  Scale,
  BatteryCharging,
  type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"
import { RegistrationPanel } from "@/components/registration-panel"
import { DashboardMockupView, type DashboardMockupData } from "@/components/dashboard/dashboard-mockup-view"
import { DashboardProgressBar, DashboardProgressRing } from "@/components/dashboard/dashboard-progress"
import {
  DashboardInsightCard,
  DashboardKpiCard,
  DashboardSectionHeader,
  DashboardSoftMetric,
} from "@/components/dashboard/dashboard-widgets"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import { containerVariants, itemVariants } from "@/lib/dashboard-page-config"
import {
  formatDateShort,
  getCareerActivityLabel,
  getCareerDashboardMetrics,
  getCareerProfessionalActivityPct,
  getCareerProfessionalEvents,
  getHealthDashboardMetrics,
  getLastCareerActivityLabel,
  getLastCareerActivityText,
  getPersonalCareDashboardMetrics,
  getProfessionalActivityBreakdown,
} from "@/lib/dashboard-page-helpers"
import {
  mapCareerSkillsSummary,
  mapWeeklyPersonalCareSummary,
  mapWeeklyCareerActivity,
  mapWeeklyCareerSummary,
  mapWeeklyHealthSummary,
} from "@/lib/dashboard-page-mappers"
import type {
  CareerSkillsSummary,
  WeeklyCareerActivity,
  WeeklyCareerSummary,
  WeeklyHealthSummary,
  WeeklyPersonalCareSummary,
} from "@/lib/dashboard-page-models"

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("Cargando...")
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // --- ESTADOS PARA LÓGICA REAL ---
  const [careerProgress, setCareerProgress] = useState(0)
  const [healthProgress, setHealthProgress] = useState(0)
  const [, setLoadingProgress] = useState(true)
  const [, setLoadingHealth] = useState(true)

  // --- NUEVAS MÉTRICAS DEL DASHBOARD GENERAL ---
  const [totalProjects, setTotalProjects] = useState(0)
  const [activeProjects, setActiveProjects] = useState(0)
  const [completedProjects, setCompletedProjects] = useState(0)
  const [totalCareerTasks, setTotalCareerTasks] = useState(0)
  const [completedCareerTasks, setCompletedCareerTasks] = useState(0)
  const [, setPlannedWorkoutDays] = useState(0)
  const [completedHealthTasks, setCompletedHealthTasks] = useState(0)
  const [totalHealthTasks, setTotalHealthTasks] = useState(0)

  // --- NUEVAS MÉTRICAS DE SALUD HISTÓRICA ---
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null)
  const [recentWeights, setRecentWeights] = useState<number[]>([])
  const [latestEnergyLevel, setLatestEnergyLevel] = useState<number | null>(null)
  const [bodyProgressCount, setBodyProgressCount] = useState(0)
  const [todayMealCount, setTodayMealCount] = useState(0)
  const [todayWaterLiters, setTodayWaterLiters] = useState(0)

  // --- RESUMEN SEMANAL DE SALUD ---
  const [weeklyHealthSummary, setWeeklyHealthSummary] = useState<WeeklyHealthSummary | null>(null)
  const [, setLoadingWeeklyHealth] = useState(true)

  // --- RESUMEN SEMANAL DE DATA & CARRERA ---
  const [weeklyCareerSummary, setWeeklyCareerSummary] = useState<WeeklyCareerSummary | null>(null)
  const [, setLoadingWeeklyCareer] = useState(true)

  // --- ACTIVIDAD SEMANAL REAL DE DATA & CARRERA ---
  const [weeklyCareerActivity, setWeeklyCareerActivity] = useState<WeeklyCareerActivity | null>(null)
  const [, setLoadingWeeklyCareerActivity] = useState(true)

  // --- SKILLS & STACK PROFESIONAL ---
  const [careerSkillsSummary, setCareerSkillsSummary] = useState<CareerSkillsSummary | null>(null)
  const [, setLoadingCareerSkills] = useState(true)

  // --- RESUMEN SEMANAL DE CUIDADO PERSONAL ---
  const [personalCareProgress, setPersonalCareProgress] = useState(0)
  const [weeklyPersonalCareSummary, setWeeklyPersonalCareSummary] = useState<WeeklyPersonalCareSummary | null>(null)
  const [, setLoadingPersonalCare] = useState(true)

  const supabase = createClient()

  // --- REFS DE FLUIDEZ VISUAL ---
  // Evitan que los KPIs vuelvan a "..." o a 0 en cada refresh/realtime.
  // La data se sigue recalculando igual; solo se conserva el último valor visible mientras llega la nueva consulta.
  const hasFetchedCareerRef = useRef(false)
  const hasFetchedHealthRef = useRef(false)
  const hasFetchedPersonalCareRef = useRef(false)
  const hasMountedPanelRefreshRef = useRef(false)

  // --- FUNCIÓN CENTRAL PARA CALCULAR CUMPLIMIENTO DE RUTINA SEMANAL ---
  // La plantilla vive en rutinas_entrenamiento, pero los checks reales viven en health_routine_completions.
  // Por eso este cálculo sí reconoce que cada lunes inicia una semana nueva.
  const fetchCurrentRoutineMetrics = useCallback(async (userId: string) => {
    const weekStart = getCurrentWeekStartString()
    const weekEnd = getCurrentWeekEndString()

    const [{ data: routines, error: routinesError }, { data: completions, error: completionsError }] = await Promise.all([
      supabase
        .from("rutinas_entrenamiento")
        .select("dia_semana, descripcion_rutina, activo")
        .eq("user_id", userId)
        .eq("activo", true),

      supabase
        .from("health_routine_completions")
        .select("dia_semana, routine_type, completed")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .eq("completed", true),
    ])

    if (routinesError) throw routinesError
    if (completionsError) throw completionsError

    const completionSet = new Set(
      (completions || []).map((row) => `${Number(row.dia_semana)}-${String(row.routine_type)}`)
    )

    let plannedTrainingDays = 0
    let completedTrainingDays = 0
    let activeDays = 0
    let totalRoutineItems = 0
    let completedRoutineItems = 0

    ;(routines || []).forEach((row) => {
      let hasFuerza = false
      let hasCardio = false

      try {
        const parsed = JSON.parse(row.descripcion_rutina || "{}")
        hasFuerza = String(parsed.fuerza || "").trim() !== ""
        hasCardio = String(parsed.cardio || "").trim() !== ""
      } catch {
        hasFuerza = String(row.descripcion_rutina || "").trim() !== ""
      }

      const hasAnyRoutine = hasFuerza || hasCardio
      if (!hasAnyRoutine) return

      plannedTrainingDays++

      const fuerzaCompleted = hasFuerza && completionSet.has(`${Number(row.dia_semana)}-fuerza`)
      const cardioCompleted = hasCardio && completionSet.has(`${Number(row.dia_semana)}-cardio`)

      if (hasFuerza) {
        totalRoutineItems++
        if (fuerzaCompleted) completedRoutineItems++
      }

      if (hasCardio) {
        totalRoutineItems++
        if (cardioCompleted) completedRoutineItems++
      }

      if (fuerzaCompleted || cardioCompleted) {
        activeDays++
      }

      const dayCompleted =
        (!hasFuerza || fuerzaCompleted) &&
        (!hasCardio || cardioCompleted)

      if (dayCompleted) {
        completedTrainingDays++
      }
    })

    const trainingCompletionPercentage =
      plannedTrainingDays > 0 ? Math.round((completedTrainingDays / plannedTrainingDays) * 100) : 0

    const routineItemCompletionPercentage =
      totalRoutineItems > 0 ? Math.round((completedRoutineItems / totalRoutineItems) * 100) : 0

    return {
      weekStart,
      weekEnd,
      plannedTrainingDays,
      completedTrainingDays,
      activeDays,
      totalRoutineItems,
      completedRoutineItems,
      trainingCompletionPercentage,
      routineItemCompletionPercentage,
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR INSIGHTS HISTÓRICOS DE SALUD ---
  const fetchHealthInsights = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const todayStr = getLocalDateString()

      const [
        { data: recentProgress, error: latestProgressError },
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
          .limit(7),

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

      const latestProgress = recentProgress?.[0]
      setLatestWeightKg(latestProgress?.weight_kg !== null && latestProgress?.weight_kg !== undefined ? Number(latestProgress.weight_kg) : null)
      setRecentWeights((recentProgress || []).map((entry) => Number(entry.weight_kg)).filter(Number.isFinite).reverse())
      setLatestEnergyLevel(latestProgress?.energy_level !== null && latestProgress?.energy_level !== undefined ? Number(latestProgress.energy_level) : null)
      setBodyProgressCount(progressCount || 0)
      setTodayMealCount(mealsCount || 0)
      setTodayWaterLiters(
        (waterRows || []).reduce((total, row) => total + Number(row.amount_liters || 0), 0)
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

      const routineMetrics = await fetchCurrentRoutineMetrics(session.user.id)

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
      }

      setWeeklyHealthSummary(mapWeeklyHealthSummary(data, routineMetrics))
    } catch (error) {
      console.error("Error sincronizando resumen semanal de salud:", error)
      setWeeklyHealthSummary(null)
    } finally {
      setLoadingWeeklyHealth(false)
    }
  }, [supabase, fetchCurrentRoutineMetrics])

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

      setWeeklyCareerSummary(mapWeeklyCareerSummary(data))
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
          project_skill_assigned_events,
          task_skill_assigned_events,
          task_documented_events,
          task_documentation_updated_events,
          task_evidence_uploaded_events,
          skill_activity_events,
          documentation_activity_events,
          evidence_activity_events,
          professional_activity_events,
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

      setWeeklyCareerActivity(mapWeeklyCareerActivity(data))
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

      setCareerSkillsSummary(mapCareerSkillsSummary(data))
    } catch (error) {
      console.error("Error sincronizando skills profesionales:", error)
      setCareerSkillsSummary(null)
    } finally {
      setLoadingCareerSkills(false)
    }
  }, [supabase])

  // --- FUNCIÓN PARA CARGAR RESUMEN SEMANAL DE CUIDADO PERSONAL ---
  const fetchWeeklyPersonalCareSummary = useCallback(async () => {
    try {
      if (!hasFetchedPersonalCareRef.current) {
        setLoadingPersonalCare(true)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const currentWeekStart = getCurrentWeekStartString()
      const currentWeekEnd = getCurrentWeekEndString()

      const { data, error } = await supabase
        .from("vw_weekly_personal_care_summary")
        .select(`
          week_start,
          week_end,
          active_days,
          checkin_days,
          avg_mood_level,
          avg_stress_level,
          avg_motivation_level,
          avg_sleep_quality,
          reflection_days,
          gratitude_days,
          improvement_days,
          active_routines,
          completed_routine_events,
          routine_completed_days,
          unique_routines_completed,
          routine_completion_percentage,
          checkin_completion_percentage,
          personal_care_score,
          last_log_date,
          last_mood_level,
          last_stress_level,
          last_motivation_level,
          last_sleep_quality,
          last_reflection,
          last_gratitude_note,
          last_improvement_note,
          last_activity_at,
          care_intensity
        `)
        .eq("user_id", session.user.id)
        .eq("week_start", currentWeekStart)
        .maybeSingle()

      if (error) {
        console.error("Error cargando resumen semanal de Cuidado Personal:", error)
        setWeeklyPersonalCareSummary(null)
        setPersonalCareProgress(0)
        return
      }

      const mappedSummary = mapWeeklyPersonalCareSummary(data, currentWeekStart, currentWeekEnd)

      setWeeklyPersonalCareSummary(mappedSummary)
      setPersonalCareProgress(Math.min(Math.max(Math.round(mappedSummary.personal_care_score || 0), 0), 100))
    } catch (error) {
      console.error("Error sincronizando resumen semanal de Cuidado Personal:", error)
      setWeeklyPersonalCareSummary(null)
      setPersonalCareProgress(0)
    } finally {
      hasFetchedPersonalCareRef.current = true
      setLoadingPersonalCare(false)
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

        projects.forEach((project) => {
          const tasks = project.project_tasks || []
          totalTasks += tasks.length
          completedTasks += tasks.filter((task) => String(task.status).toUpperCase() === "COMPLETADO").length
        })

        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        setCareerProgress(percentage)
        setTotalProjects(projects.length)
        setActiveProjects(projects.filter((project) => String(project.status).toLowerCase() === "en curso").length)
        setCompletedProjects(projects.filter((project) => String(project.status).toLowerCase() === "completado").length)
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

      const routineMetrics = await fetchCurrentRoutineMetrics(session.user.id)

      setHealthProgress(routineMetrics.trainingCompletionPercentage)
      setPlannedWorkoutDays(routineMetrics.plannedTrainingDays)
      setCompletedHealthTasks(routineMetrics.completedTrainingDays)
      setTotalHealthTasks(routineMetrics.plannedTrainingDays)
    } catch (error) {
      console.error("Error calculando progreso de salud:", error)
    } finally {
      hasFetchedHealthRef.current = true
      setLoadingHealth(false)
    }
  }, [supabase, fetchCurrentRoutineMetrics])

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

    let isActive = true

    queueMicrotask(() => {
      if (!isActive) return

      getUserProfile()
      fetchRealProgress()
      fetchHealthProgress()
      fetchHealthInsights()
      fetchWeeklyHealthSummary()
      fetchWeeklyCareerSummary()
      fetchWeeklyCareerActivity()
      fetchCareerSkillsSummary()
      fetchWeeklyPersonalCareSummary()
    })

    return () => {
      isActive = false
    }
  }, [supabase, fetchRealProgress, fetchHealthProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary, fetchWeeklyPersonalCareSummary])

  // --- ESCUCHA EN TIEMPO REAL DESDE SUPABASE ---
  useEffect(() => {
    const healthChannel = supabase
      .channel("realtime-health-changes")
      .on(
        "postgres_changes",
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

    const routineCompletionsChannel = supabase
      .channel("realtime-health-routine-completions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "health_routine_completions",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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
        "postgres_changes",
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

    const personalCareDailyLogsChannel = supabase
      .channel("realtime-personal-care-daily-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_care_daily_logs",
        },
        () => {
          fetchWeeklyPersonalCareSummary()
        }
      )
      .subscribe()

    const personalCareRoutinesChannel = supabase
      .channel("realtime-personal-care-routines-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_care_routines",
        },
        () => {
          fetchWeeklyPersonalCareSummary()
        }
      )
      .subscribe()

    const personalCareCompletionsChannel = supabase
      .channel("realtime-personal-care-completions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_care_routine_completions",
        },
        () => {
          fetchWeeklyPersonalCareSummary()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(healthChannel)
      supabase.removeChannel(routineCompletionsChannel)
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(careerActivityChannel)
      supabase.removeChannel(careerSkillsChannel)
      supabase.removeChannel(projectSkillsChannel)
      supabase.removeChannel(bodyProgressChannel)
      supabase.removeChannel(mealLogsChannel)
      supabase.removeChannel(waterLogsChannel)
      supabase.removeChannel(personalCareDailyLogsChannel)
      supabase.removeChannel(personalCareRoutinesChannel)
      supabase.removeChannel(personalCareCompletionsChannel)
    }
  }, [supabase, fetchHealthProgress, fetchRealProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary, fetchWeeklyPersonalCareSummary])

  // --- REFRESCAR CUANDO SE CIERRA EL PANEL ---
  useEffect(() => {
    if (!hasMountedPanelRefreshRef.current) {
      hasMountedPanelRefreshRef.current = true
      return
    }

    if (!isPanelOpen) {
      let isActive = true

      queueMicrotask(() => {
        if (!isActive) return

        fetchRealProgress()
        fetchHealthProgress()
        fetchHealthInsights()
        fetchWeeklyHealthSummary()
        fetchWeeklyCareerSummary()
        fetchWeeklyCareerActivity()
        fetchCareerSkillsSummary()
        fetchWeeklyPersonalCareSummary()
      })

      return () => {
        isActive = false
      }
    }
  }, [isPanelOpen, fetchRealProgress, fetchHealthProgress, fetchHealthInsights, fetchWeeklyHealthSummary, fetchWeeklyCareerSummary, fetchWeeklyCareerActivity, fetchCareerSkillsSummary, fetchWeeklyPersonalCareSummary])

  const globalProgress = Math.round((healthProgress + careerProgress + personalCareProgress) / 3)

  const personalCareMetrics = getPersonalCareDashboardMetrics(weeklyPersonalCareSummary, personalCareProgress)
  const personalCareScore = personalCareMetrics.score
  const personalCareIntensityLabel = personalCareMetrics.intensityLabel
  const weeklyPersonalCheckins = personalCareMetrics.checkins
  const weeklyPersonalCompletedRoutines = personalCareMetrics.completedRoutines
  const weeklyPersonalActiveRoutines = personalCareMetrics.activeRoutines
  const weeklyPersonalRoutinePct = personalCareMetrics.routinePct
  const weeklyPersonalCheckinPct = personalCareMetrics.checkinPct

  const healthMetrics = getHealthDashboardMetrics(weeklyHealthSummary)
  const weeklyTrainingPct = healthMetrics.trainingPct
  const weeklyPlannedDays = healthMetrics.plannedDays
  const weeklyCompletedDays = healthMetrics.completedDays

  const careerActivityLabel = getCareerActivityLabel(weeklyCareerActivity)
  const careerProfessionalEvents = getCareerProfessionalEvents(weeklyCareerActivity)
  const careerProfessionalActivityPct = getCareerProfessionalActivityPct(weeklyCareerActivity)
  const careerMetrics = getCareerDashboardMetrics(weeklyCareerSummary, careerSkillsSummary, careerProfessionalEvents)
  const weeklyCareerPct = careerMetrics.weeklyPct
  const totalCareerPct = careerMetrics.totalPct

  const lastCareerActivityText = getLastCareerActivityText(weeklyCareerActivity)

  const lastCareerActivityLabel = getLastCareerActivityLabel(weeklyCareerActivity)

  const professionalActivityIcons = [Cpu, Database, ShieldCheck]
  const professionalActivityBreakdown = getProfessionalActivityBreakdown(weeklyCareerActivity).map((item, index) => ({
    ...item,
    icon: professionalActivityIcons[index],
  }))

  const skillsUsagePct = careerMetrics.skillsUsagePct
  const topCareerSkills = careerMetrics.topSkills
  const topSkillLabel = careerMetrics.topSkillLabel

  const weeklyWaterPct = healthMetrics.waterPct
  const weeklyMealsPct = healthMetrics.mealsPct
  const caloriesBalancePct = healthMetrics.caloriesBalancePct

  const weeklyMoodPct = personalCareMetrics.moodPct
  const weeklyMotivationPct = personalCareMetrics.motivationPct
  const weeklySleepPct = personalCareMetrics.sleepPct
  const weeklyStressPct = personalCareMetrics.stressPct

  const healthInsightSummary = healthMetrics.insight

  const careerInsightSummary = careerMetrics.insight

  const careInsightSummary = personalCareMetrics.insight

  const sectionHeader = (title: string, subtitle: string, accentClassName: string) => (
    <DashboardSectionHeader title={title} subtitle={subtitle} accentClassName={accentClassName} />
  )

  const kpiCard = (
    title: string,
    value: string,
    helper: string,
    Icon: LucideIcon,
    shellClassName: string,
    iconClassName: string,
    progress?: number
  ) => (
    <DashboardKpiCard
      title={title}
      value={value}
      helper={helper}
      Icon={Icon}
      shellClassName={shellClassName}
      iconClassName={iconClassName}
      progress={progress}
    />
  )

  const softMetric = (
    title: string,
    value: string,
    helper: string,
    Icon: LucideIcon,
    colorClasses: string
  ) => (
    <DashboardSoftMetric
      title={title}
      value={value}
      helper={helper}
      Icon={Icon}
      colorClasses={colorClasses}
    />
  )

  const insightCard = (
    title: string,
    whatGood: string,
    whatBad: string,
    focus: string,
    best: string,
    recommendation: string,
    Icon: LucideIcon,
    accentShell: string,
    accentText: string
  ) => (
    <DashboardInsightCard
      title={title}
      whatGood={whatGood}
      whatBad={whatBad}
      focus={focus}
      best={best}
      recommendation={recommendation}
      Icon={Icon}
      accentShell={accentShell}
      accentText={accentText}
    />
  )

  const dashboardMockupData: DashboardMockupData = {
    name: displayName,
    photo: "/images/lifetrack/jose-cutout.webp",
    week: `Semana ${formatDateShort(getCurrentWeekStartString())} - ${formatDateShort(getCurrentWeekEndString())}`,
    progress: { general: globalProgress, health: healthProgress, career: careerProgress, care: personalCareProgress },
    health: {
      planned: weeklyPlannedDays,
      completed: weeklyCompletedDays,
      trainingPct: weeklyTrainingPct,
      waterLiters: weeklyHealthSummary?.total_water_liters ?? null,
      waterPct: weeklyWaterPct,
      calories: weeklyHealthSummary?.avg_daily_calories ?? null,
      calorieTarget: weeklyHealthSummary?.avg_calorie_target ?? null,
      caloriePct: caloriesBalancePct,
      energy: weeklyHealthSummary?.avg_energy_level || latestEnergyLevel,
      weight: latestWeightKg,
      weightRecords: bodyProgressCount,
      recentWeights,
    },
    career: {
      activeProjects,
      totalProjects,
      completedTasks: completedCareerTasks,
      totalTasks: totalCareerTasks,
      taskPct: weeklyCareerSummary ? totalCareerPct : careerProgress,
      weeklyPct: weeklyCareerPct,
      weeklyCompleted: weeklyCareerSummary?.tasks_completed_week ?? null,
      usedSkills: careerSkillsSummary?.used_skills ?? null,
      totalSkills: careerSkillsSummary?.total_skills ?? null,
      skillsPct: skillsUsagePct,
      events: careerProfessionalEvents,
      activityPct: careerProfessionalActivityPct,
      totalSkillLinks: careerSkillsSummary?.total_skill_project_links ?? 0,
      topSkills: topCareerSkills.map((skill) => ({ name: skill.name, projectsCount: skill.projects_count, color: skill.color })),
    },
    care: {
      checkins: weeklyPersonalCheckins,
      checkinPct: weeklyPersonalCheckinPct,
      routines: weeklyPersonalCompletedRoutines,
      activeRoutines: weeklyPersonalActiveRoutines,
      routinePct: weeklyPersonalRoutinePct,
      mood: weeklyPersonalCareSummary?.avg_mood_level || null,
      stress: weeklyPersonalCareSummary?.avg_stress_level || null,
      motivation: weeklyPersonalCareSummary?.avg_motivation_level || null,
      sleepQuality: weeklyPersonalCareSummary?.avg_sleep_quality || null,
      reflections: weeklyPersonalCareSummary?.reflection_days ?? 0,
    },
    insights: {
      health: {
        good: weeklyCompletedDays > 0
          ? `Ya existe actividad real: ${weeklyCompletedDays} de ${weeklyPlannedDays} días completados.`
          : "Tienes una base de planificación creada para empezar a medir constancia.",
        improve: weeklyTrainingPct < 50
          ? "El cumplimiento de rutina aún es bajo y eso limita el avance global."
          : "Todavía puedes seguir empujando consistencia en agua, comida o energía.",
        recommendation: "Completar más días de rutina y sostener hidratación diaria.",
      },
      career: {
        good: completedCareerTasks > 0
          ? `Se observa ejecución real: ${completedCareerTasks} subtareas completadas y ${activeProjects} proyectos activos.`
          : "Ya tienes estructura de proyectos y tareas lista para medir progreso profesional.",
        improve: careerProfessionalEvents === 0
          ? "Aún falta transformar avance en evidencia profesional más visible."
          : "Todavía puedes equilibrar mejor actividad operativa con actividad demostrable.",
        recommendation: "Cerrar subtareas y documentar skills, evidencias y documentación del trabajo realizado.",
      },
      care: {
        good: weeklyPersonalCheckins > 0
          ? `Ya comenzaste seguimiento emocional con ${weeklyPersonalCheckins} check-ins registrados.`
          : "El pilar ya está conectado y listo para captar hábitos personales.",
        improve: weeklyPersonalCheckins < 3
          ? "La constancia de check-ins aún es baja y eso reduce la calidad del análisis."
          : "Aún se puede mejorar la regularidad entre check-ins y rutinas personales.",
        recommendation: "Mantener check-ins más frecuentes y reforzar rutinas activas de cuidado.",
      },
    },
  }

  return (
    <div className="dashboard-redesign relative min-h-screen overflow-hidden bg-transparent px-2 pb-8 pt-2 font-sans text-slate-100 antialiased selection:bg-blue-500/30 selection:text-white sm:px-4 [overflow-wrap:anywhere]">

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-col gap-3"
      >
        <DashboardMockupView data={dashboardMockupData} onRegister={() => setIsPanelOpen(true)} />

        <details className="group rounded-xl border border-sky-200/10 bg-[#081725]/80 p-3 text-slate-200">
          <summary className="cursor-pointer list-none text-xs font-bold text-sky-200 focus-visible:outline-2 focus-visible:outline-sky-300">Explorar análisis detallado de todos los pilares</summary>
          <div className="mt-5 space-y-6">

        <motion.section variants={itemVariants} className="space-y-4">
          {sectionHeader(
            "Principales indicadores",
            "Vista rápida del avance global y del desempeño por cada pilar principal.",
            "border-blue-400/14 bg-blue-500/[0.07] text-blue-300"
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCard(
              "Avance general",
              `${globalProgress}%`,
              "Promedio consolidado de Salud, Data/Carrera y Cuidado Personal.",
              Gauge,
              "border-blue-300/20 bg-gradient-to-br from-[#102949] via-[#174477] to-[#1b5e9b]",
              "border-white/18 bg-white/12 text-white",
              globalProgress
            )}
            {kpiCard(
              "Avance de Salud",
              `${healthProgress}%`,
              `${weeklyCompletedDays}/${weeklyPlannedDays} días de rutina completados esta semana.`,
              HeartPulse,
              "border-emerald-300/20 bg-gradient-to-br from-[#0d3027] via-[#0e604b] to-[#0b7b5d]",
              "border-white/18 bg-white/12 text-white",
              healthProgress
            )}
            {kpiCard(
              "Avance de Data/Carrera",
              `${careerProgress}%`,
              `${completedCareerTasks}/${totalCareerTasks} subtareas completadas y ${activeProjects} proyectos activos.`,
              BrainCircuit,
              "border-orange-300/20 bg-gradient-to-br from-[#39220f] via-[#754020] to-[#a65a22]",
              "border-white/18 bg-white/12 text-white",
              careerProgress
            )}
            {kpiCard(
              "Avance de Cuidado Personal",
              `${personalCareProgress}%`,
              `${weeklyPersonalCheckins}/7 check-ins y ${weeklyPersonalCompletedRoutines} rutinas completadas.`,
              UserRound,
              "border-purple-300/20 bg-gradient-to-br from-[#271742] via-[#533080] to-[#6936a2]",
              "border-white/18 bg-white/12 text-white",
              personalCareProgress
            )}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          {sectionHeader(
            "Indicadores clave para el pilar de Salud",
            "Lectura visual de tu constancia semanal, energía, alimentación, hidratación y progreso físico.",
            "border-emerald-400/14 bg-emerald-500/[0.07] text-emerald-300"
          )}

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden rounded-[1.8rem] border border-emerald-300/[0.14] bg-[linear-gradient(135deg,rgba(6,18,24,0.94),rgba(9,42,36,0.92))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-500/10 text-emerald-300">
                      <HeartPulse size={18} />
                    </span>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-[-0.03em] text-white">Resumen integral de Salud</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">No solo números: combina avance, hábitos y contexto semanal.</p>
                    </div>
                  </div>
                  <DashboardProgressRing value={healthProgress} color="#34d399" />
                </div>
              </CardHeader>

              <CardContent className="min-w-0 space-y-6">
                <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Cumplimiento semanal de rutina</p>
                      <p className="mt-1 text-xs text-slate-500">Estado principal para entender constancia física.</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/12 bg-emerald-500/[0.07] px-3 py-1 text-xs font-bold text-emerald-300">
                      {weeklyTrainingPct}%
                    </span>
                  </div>

                  <DashboardProgressBar value={weeklyTrainingPct} fillClassName="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" heightClassName="h-3" />
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                    <p>Planificados: <span className="font-semibold text-white">{weeklyPlannedDays}</span></p>
                    <p>Cumplidos: <span className="font-semibold text-white">{weeklyCompletedDays}</span></p>
                    <p>Días activos: <span className="font-semibold text-white">{weeklyHealthSummary?.active_days || 0}</span></p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Mini lectura de hábitos</p>
                      <LineChart size={16} className="text-emerald-300" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Agua semanal</span>
                          <span>{weeklyHealthSummary ? `${weeklyHealthSummary.total_water_liters.toFixed(2)}L` : "—"}</span>
                        </div>
                        <DashboardProgressBar value={weeklyWaterPct} fillClassName="bg-gradient-to-r from-cyan-500 to-sky-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Comidas registradas</span>
                          <span>{weeklyHealthSummary ? `${weeklyHealthSummary.meals_count}` : `${todayMealCount} hoy`}</span>
                        </div>
                        <DashboardProgressBar value={weeklyMealsPct} fillClassName="bg-gradient-to-r from-orange-500 to-amber-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Calorías vs meta</span>
                          <span>
                            {weeklyHealthSummary
                              ? `${Math.round(weeklyHealthSummary.avg_daily_calories).toLocaleString("es-PE")} / ${Math.round(weeklyHealthSummary.avg_calorie_target).toLocaleString("es-PE")}`
                              : "—"}
                          </span>
                        </div>
                        <DashboardProgressBar value={caloriesBalancePct} fillClassName="bg-gradient-to-r from-violet-500 to-fuchsia-400" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Indicadores circulares</p>
                      <Orbit size={16} className="text-cyan-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3 text-center">
                        <DashboardProgressRing
                          value={
                            weeklyHealthSummary?.avg_energy_level
                              ? weeklyHealthSummary.avg_energy_level * 10
                              : latestEnergyLevel !== null ? latestEnergyLevel * 10 : 0
                          }
                          color="#60a5fa"
                          size="h-16 w-16"
                          inner="h-[36px] w-[36px]"
                          label={
                            weeklyHealthSummary?.avg_energy_level
                              ? `${weeklyHealthSummary.avg_energy_level.toFixed(1)}`
                              : latestEnergyLevel !== null ? `${latestEnergyLevel}` : "—"
                          }
                        />
                        <p className="mt-2 text-xs font-bold text-slate-300">Energía</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3 text-center">
                        <DashboardProgressRing value={weeklyTrainingPct} color="#34d399" size="h-16 w-16" inner="h-[36px] w-[36px]" label={`${weeklyTrainingPct}%`} />
                        <p className="mt-2 text-xs font-bold text-slate-300">Rutina</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-emerald-300/12 bg-emerald-500/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-300" />
                    <p className="text-sm font-bold text-white">Interpretación rápida del pilar Salud</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{healthInsightSummary}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {softMetric(
                "Rutina semanal",
                `${weeklyHealthSummary ? weeklyCompletedDays : completedHealthTasks}/${weeklyHealthSummary ? weeklyPlannedDays : totalHealthTasks}`,
                `${weeklyTrainingPct}% completado`,
                Dumbbell,
                "border-emerald-300/15 bg-emerald-500/10 text-emerald-300"
              )}
              {softMetric(
                "Agua hoy",
                `${todayWaterLiters.toFixed(2)}L`,
                weeklyHealthSummary ? `Semana ${weeklyHealthSummary.total_water_liters.toFixed(2)}L` : "Registro diario",
                Droplet,
                "border-cyan-300/15 bg-cyan-500/10 text-cyan-300"
              )}
              {softMetric(
                "Energía",
                weeklyHealthSummary && weeklyHealthSummary.avg_energy_level > 0
                  ? `${weeklyHealthSummary.avg_energy_level.toFixed(1)}/10`
                  : latestEnergyLevel !== null ? `${latestEnergyLevel}/10` : "—",
                "Promedio semanal o último registro",
                BatteryCharging,
                "border-blue-300/15 bg-blue-500/10 text-blue-300"
              )}
              {softMetric(
                "Último peso",
                latestWeightKg !== null ? `${latestWeightKg} kg` : "—",
                `${bodyProgressCount} registros físicos`,
                Scale,
                "border-amber-300/15 bg-amber-500/10 text-amber-300"
              )}
              {softMetric(
                "Comidas",
                `${todayMealCount}`,
                weeklyHealthSummary ? `${weeklyHealthSummary.meals_count} registradas esta semana` : "Conteo diario",
                Flame,
                "border-rose-300/15 bg-rose-500/10 text-rose-300"
              )}
              {softMetric(
                "Calorías promedio",
                weeklyHealthSummary ? `${Math.round(weeklyHealthSummary.avg_daily_calories).toLocaleString("es-PE")} kcal` : "—",
                weeklyHealthSummary ? `Meta ${Math.round(weeklyHealthSummary.avg_calorie_target).toLocaleString("es-PE")} kcal` : "Sin meta semanal",
                Gauge,
                "border-violet-300/15 bg-violet-500/10 text-violet-300"
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          {sectionHeader(
            "Indicadores clave para el pilar de Data/Carrera",
            "Vista profesional para entender productividad, ejecución, skills utilizadas y evidencia real del avance.",
            "border-amber-400/14 bg-amber-500/[0.07] text-amber-300"
          )}

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="overflow-hidden rounded-[1.8rem] border border-orange-300/[0.14] bg-[linear-gradient(135deg,rgba(27,16,8,0.94),rgba(55,27,10,0.92))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-500/10 text-amber-300">
                      <Database size={18} />
                    </span>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-[-0.03em] text-white">Resumen integral de Data/Carrera</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">Proyectos, subtareas, actividad profesional y stack usado.</p>
                    </div>
                  </div>
                  <DashboardProgressRing value={careerProgress} color="#f59e0b" />
                </div>
              </CardHeader>

              <CardContent className="min-w-0 space-y-6">
                <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Avance de subtareas</p>
                      <p className="mt-1 text-xs text-slate-500">La base operativa del progreso profesional.</p>
                    </div>
                    <span className="rounded-full border border-amber-300/12 bg-amber-500/[0.07] px-3 py-1 text-xs font-bold text-amber-300">
                      {weeklyCareerSummary ? `${totalCareerPct}%` : `${careerProgress}%`}
                    </span>
                  </div>

                  <DashboardProgressBar value={weeklyCareerSummary ? totalCareerPct : careerProgress} fillClassName="bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300" heightClassName="h-3" />
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                    <p>Completadas: <span className="font-semibold text-white">{completedCareerTasks}</span></p>
                    <p>En curso: <span className="font-semibold text-white">{weeklyCareerSummary?.in_progress_tasks ?? 0}</span></p>
                    <p>Pendientes: <span className="font-semibold text-white">{weeklyCareerSummary?.pending_tasks ?? 0}</span></p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Pulso semanal</p>
                      <BarChart2 size={16} className="text-amber-300" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Productividad semanal</span>
                          <span>{weeklyCareerPct}%</span>
                        </div>
                        <DashboardProgressBar value={weeklyCareerPct} fillClassName="bg-gradient-to-r from-sky-500 to-blue-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Uso del stack</span>
                          <span>{skillsUsagePct}%</span>
                        </div>
                        <DashboardProgressBar value={skillsUsagePct} fillClassName="bg-gradient-to-r from-violet-500 to-fuchsia-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Actividad demostrable</span>
                          <span>{careerProfessionalActivityPct}%</span>
                        </div>
                        <DashboardProgressBar value={careerProfessionalActivityPct} fillClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Actividad profesional demostrable</p>
                      <span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1 text-xs font-bold text-white">
                        {careerProfessionalEvents}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {professionalActivityBreakdown.map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.label} className={`rounded-2xl border p-3 ${item.tone}`}>
                            <div className="mb-2 flex items-center justify-between">
                              <Icon size={14} />
                              <span className="text-lg font-extrabold">{item.value}</span>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em]">{item.label}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-amber-300/12 bg-amber-500/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-300" />
                    <p className="text-sm font-bold text-white">Interpretación rápida de Data/Carrera</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{careerInsightSummary}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {softMetric(
                  "Subtareas",
                  `${completedCareerTasks}/${totalCareerTasks}`,
                  `${totalCareerPct}% de avance total`,
                  CheckCircle2,
                  "border-amber-300/15 bg-amber-500/10 text-amber-300"
                )}
                {softMetric(
                  "Proyectos activos",
                  `${activeProjects}/${totalProjects}`,
                  `${completedProjects} completados`,
                  Layers3,
                  "border-orange-300/15 bg-orange-500/10 text-orange-300"
                )}
                {softMetric(
                  "Productividad semanal",
                  `${weeklyCareerPct}%`,
                  weeklyCareerSummary ? `${weeklyCareerSummary.tasks_completed_week} tareas completadas` : "Semana actual",
                  TrendingUp,
                  "border-blue-300/15 bg-blue-500/10 text-blue-300"
                )}
                {softMetric(
                  "Skills usadas",
                  careerSkillsSummary ? `${careerSkillsSummary.used_skills}/${careerSkillsSummary.total_skills}` : "—",
                  `${skillsUsagePct}% del catálogo aplicado`,
                  Cpu,
                  "border-purple-300/15 bg-purple-500/10 text-purple-300"
                )}
              </div>

              <Card className="rounded-[1.4rem] border border-white/[0.065] bg-white/[0.035]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold tracking-[-0.03em] text-white">Último movimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-300">{lastCareerActivityLabel}</p>
                    <span className="rounded-full border border-white/[0.06] px-2.5 py-1 text-[11px] text-slate-500">
                      {weeklyCareerActivity?.last_event_at ? formatDateShort(weeklyCareerActivity.last_event_at.slice(0, 10)) : "Sin fecha"}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{lastCareerActivityText}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Eventos totales</p>
                      <p className="mt-2 text-2xl font-extrabold text-white">{weeklyCareerActivity?.total_events || 0}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Intensidad</p>
                      <p className="mt-2 text-lg font-bold text-white">{careerActivityLabel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {topCareerSkills.length > 0 && (
                <Card className="rounded-[1.4rem] border border-white/[0.065] bg-white/[0.035]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold tracking-[-0.03em] text-white">Stack más usado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topCareerSkills.map((skill) => (
                        <span
                          key={skill.skill_id}
                          className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-slate-300"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: skill.color || "#f59e0b" }} />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          {sectionHeader(
            "Indicadores clave para el pilar de Cuidado Personal",
            "Seguimiento del bienestar diario mediante check-ins, rutinas, ánimo, estrés, descanso y reflexiones.",
            "border-purple-400/14 bg-purple-500/[0.07] text-purple-300"
          )}

          <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
            <Card className="overflow-hidden rounded-[1.8rem] border border-purple-300/[0.14] bg-[linear-gradient(135deg,rgba(19,11,30,0.94),rgba(47,18,66,0.92))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/18 bg-purple-500/10 text-purple-300">
                      <UserRound size={18} />
                    </span>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-[-0.03em] text-white">Resumen integral de Cuidado Personal</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">Autocuidado, constancia emocional y hábitos personales.</p>
                    </div>
                  </div>
                  <DashboardProgressRing value={personalCareProgress} color="#c084fc" />
                </div>
              </CardHeader>

              <CardContent className="min-w-0 space-y-6">
                <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Seguimiento semanal de autocuidado</p>
                      <p className="mt-1 text-xs text-slate-500">Mezcla de check-ins, rutinas y consistencia personal.</p>
                    </div>
                    <span className="rounded-full border border-purple-300/12 bg-purple-500/[0.07] px-3 py-1 text-xs font-bold text-purple-300">
                      {personalCareScore}%
                    </span>
                  </div>

                  <DashboardProgressBar value={personalCareScore} fillClassName="bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-300" heightClassName="h-3" />
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                    <p>Check-ins: <span className="font-semibold text-white">{weeklyPersonalCheckins}</span></p>
                    <p>Rutinas: <span className="font-semibold text-white">{weeklyPersonalCompletedRoutines}</span></p>
                    <p>Intensidad: <span className="font-semibold text-white">{personalCareIntensityLabel}</span></p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Lectura emocional</p>
                      <Activity size={16} className="text-purple-300" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Ánimo</span>
                          <span>{weeklyPersonalCareSummary?.avg_mood_level ? `${weeklyPersonalCareSummary.avg_mood_level.toFixed(1)}/10` : "—"}</span>
                        </div>
                        <DashboardProgressBar value={weeklyMoodPct} fillClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Motivación</span>
                          <span>{weeklyPersonalCareSummary?.avg_motivation_level ? `${weeklyPersonalCareSummary.avg_motivation_level.toFixed(1)}/10` : "—"}</span>
                        </div>
                        <DashboardProgressBar value={weeklyMotivationPct} fillClassName="bg-gradient-to-r from-sky-500 to-blue-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Estrés</span>
                          <span>{weeklyPersonalCareSummary?.avg_stress_level ? `${weeklyPersonalCareSummary.avg_stress_level.toFixed(1)}/10` : "—"}</span>
                        </div>
                        <DashboardProgressBar value={weeklyStressPct} fillClassName="bg-gradient-to-r from-rose-500 to-pink-400" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Sueño</span>
                          <span>{weeklyPersonalCareSummary?.avg_sleep_quality ? `${weeklyPersonalCareSummary.avg_sleep_quality.toFixed(1)}/10` : "—"}</span>
                        </div>
                        <DashboardProgressBar value={weeklySleepPct} fillClassName="bg-gradient-to-r from-violet-500 to-indigo-400" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Indicadores circulares</p>
                      <Orbit size={16} className="text-fuchsia-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3 text-center">
                        <DashboardProgressRing value={weeklyPersonalCheckinPct} color="#c084fc" size="h-16 w-16" inner="h-[36px] w-[36px]" label={`${weeklyPersonalCheckins}`} />
                        <p className="mt-2 text-xs font-bold text-slate-300">Check-ins</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3 text-center">
                        <DashboardProgressRing value={weeklyPersonalRoutinePct} color="#f472b6" size="h-16 w-16" inner="h-[36px] w-[36px]" label={`${weeklyPersonalCompletedRoutines}`} />
                        <p className="mt-2 text-xs font-bold text-slate-300">Rutinas</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Bloque reflexivo</p>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xl font-extrabold text-white">{weeklyPersonalCareSummary?.reflection_days || 0}</p>
                          <p className="text-[11px] text-slate-500">Reflexiones</p>
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-white">{weeklyPersonalCareSummary?.gratitude_days || 0}</p>
                          <p className="text-[11px] text-slate-500">Gratitud</p>
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-white">{weeklyPersonalCareSummary?.improvement_days || 0}</p>
                          <p className="text-[11px] text-slate-500">Mejoras</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-purple-300/12 bg-purple-500/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-purple-300" />
                    <p className="text-sm font-bold text-white">Interpretación rápida del Cuidado Personal</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{careInsightSummary}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {softMetric(
                "Check-ins",
                `${weeklyPersonalCheckins}/7`,
                `${weeklyPersonalCheckinPct}% de seguimiento semanal`,
                CalendarClock,
                "border-purple-300/15 bg-purple-500/10 text-purple-300"
              )}
              {softMetric(
                "Rutinas completadas",
                `${weeklyPersonalCompletedRoutines}`,
                `${weeklyPersonalActiveRoutines} rutinas activas`,
                CheckCircle2,
                "border-fuchsia-300/15 bg-fuchsia-500/10 text-fuchsia-300"
              )}
              {softMetric(
                "Ánimo promedio",
                weeklyPersonalCareSummary?.avg_mood_level ? `${weeklyPersonalCareSummary.avg_mood_level.toFixed(1)}/10` : "—",
                personalCareIntensityLabel,
                Activity,
                "border-emerald-300/15 bg-emerald-500/10 text-emerald-300"
              )}
              {softMetric(
                "Estrés promedio",
                weeklyPersonalCareSummary?.avg_stress_level ? `${weeklyPersonalCareSummary.avg_stress_level.toFixed(1)}/10` : "—",
                weeklyPersonalCareSummary?.avg_sleep_quality ? `Sueño ${weeklyPersonalCareSummary.avg_sleep_quality.toFixed(1)}/10` : "Sin sueño registrado",
                Waves,
                "border-rose-300/15 bg-rose-500/10 text-rose-300"
              )}
              {softMetric(
                "Motivación",
                weeklyPersonalCareSummary?.avg_motivation_level ? `${weeklyPersonalCareSummary.avg_motivation_level.toFixed(1)}/10` : "—",
                "Promedio semanal",
                Rocket,
                "border-blue-300/15 bg-blue-500/10 text-blue-300"
              )}
              {softMetric(
                "Reflexiones",
                `${weeklyPersonalCareSummary?.reflection_days || 0}`,
                `${weeklyPersonalCareSummary?.gratitude_days || 0} gratitud · ${weeklyPersonalCareSummary?.improvement_days || 0} mejoras`,
                Star,
                "border-amber-300/15 bg-amber-500/10 text-amber-300"
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          {sectionHeader(
            "Análisis inteligente por pilar",
            "Interpretación breve para que el dashboard no solo muestre números, sino también contexto y foco de mejora.",
            "border-sky-400/14 bg-sky-500/[0.07] text-sky-300"
          )}

          <div className="grid gap-4 xl:grid-cols-3">
            {insightCard(
              "Salud",
              weeklyCompletedDays > 0
                ? `Ya existe actividad real: ${weeklyCompletedDays} de ${weeklyPlannedDays} días completados.`
                : "Tienes una base de planificación creada para empezar a medir constancia.",
              weeklyTrainingPct < 50
                ? "El cumplimiento de rutina aún es bajo y eso limita el avance global."
                : "Todavía puedes seguir empujando consistencia en agua, comida o energía.",
              "Completar más días de rutina y sostener hidratación diaria.",
              latestWeightKg !== null
                ? `Ya cuentas con referencia física: último peso ${latestWeightKg} kg.`
                : "La estructura semanal de salud ya está activa.",
              "Haz que el siguiente objetivo sea cerrar la semana con más días marcados y al menos un registro físico extra.",
              HeartPulse,
              "border-emerald-300/12 bg-emerald-500/[0.05]",
              "border-white/18 bg-white/12 text-white"
            )}

            {insightCard(
              "Data/Carrera",
              completedCareerTasks > 0
                ? `Se observa ejecución real: ${completedCareerTasks} subtareas completadas y ${activeProjects} proyectos activos.`
                : "Ya tienes estructura de proyectos y tareas lista para medir progreso profesional.",
              careerProfessionalEvents === 0
                ? "Aún falta transformar avance en evidencia profesional más visible."
                : "Todavía puedes equilibrar mejor actividad operativa con actividad demostrable.",
              "Cerrar subtareas y documentar skills, evidencias y documentación del trabajo realizado.",
              topCareerSkills.length > 0
                ? `Tu stack ya muestra uso real; skill dominante actual: ${topSkillLabel}.`
                : "Tu tablero ya diferencia avance operativo y avance demostrable.",
              "Si completas una tarea, documenta inmediatamente qué skill usaste o qué evidencia generaste.",
              BrainCircuit,
              "border-amber-300/12 bg-amber-500/[0.05]",
              "border-white/18 bg-white/12 text-white"
            )}

            {insightCard(
              "Cuidado Personal",
              weeklyPersonalCheckins > 0
                ? `Ya comenzaste seguimiento emocional con ${weeklyPersonalCheckins} check-ins registrados.`
                : "El pilar ya está conectado y listo para captar hábitos personales.",
              weeklyPersonalCheckins < 3
                ? "La constancia de check-ins aún es baja y eso reduce la calidad del análisis."
                : "Aún se puede mejorar la regularidad entre check-ins y rutinas personales.",
              "Mantener check-ins más frecuentes y reforzar rutinas activas de cuidado.",
              weeklyPersonalCareSummary?.avg_mood_level
                ? `Tu ánimo promedio actual se sitúa en ${weeklyPersonalCareSummary.avg_mood_level.toFixed(1)}/10.`
                : "Ya puedes medir varias dimensiones: ánimo, estrés, motivación, sueño y reflexión.",
              "Haz un check-in corto cada día y registra al menos una reflexión o mejora para enriquecer el análisis.",
              UserRound,
              "border-purple-300/12 bg-purple-500/[0.05]",
              "border-white/18 bg-white/12 text-white"
            )}
          </div>
        </motion.section>

          </div>
        </details>

        <RegistrationPanel open={isPanelOpen} setOpen={setIsPanelOpen} />
      </motion.div>
    </div>
  )
}
