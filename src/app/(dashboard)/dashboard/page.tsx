"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { RegistrationPanel } from "@/components/registration-panel"
import { DashboardMockupView, type DashboardMockupData } from "@/components/dashboard/dashboard-mockup-view"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import { containerVariants } from "@/lib/dashboard-page-config"
import {
  formatDateShort,
  getCareerDashboardMetrics,
  getCareerProfessionalActivityPct,
  getCareerProfessionalEvents,
  getHealthDashboardMetrics,
  getPersonalCareDashboardMetrics,
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
  const [, setCompletedProjects] = useState(0)
  const [totalCareerTasks, setTotalCareerTasks] = useState(0)
  const [completedCareerTasks, setCompletedCareerTasks] = useState(0)
  const [, setPlannedWorkoutDays] = useState(0)
  const [, setCompletedHealthTasks] = useState(0)
  const [, setTotalHealthTasks] = useState(0)

  // --- NUEVAS MÉTRICAS DE SALUD HISTÓRICA ---
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null)
  const [recentWeights, setRecentWeights] = useState<number[]>([])
  const [latestEnergyLevel, setLatestEnergyLevel] = useState<number | null>(null)
  const [bodyProgressCount, setBodyProgressCount] = useState(0)
  const [, setTodayMealCount] = useState(0)
  const [, setTodayWaterLiters] = useState(0)

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
  const weeklyPersonalCheckins = personalCareMetrics.checkins
  const weeklyPersonalCompletedRoutines = personalCareMetrics.completedRoutines
  const weeklyPersonalActiveRoutines = personalCareMetrics.activeRoutines
  const weeklyPersonalRoutinePct = personalCareMetrics.routinePct
  const weeklyPersonalCheckinPct = personalCareMetrics.checkinPct

  const healthMetrics = getHealthDashboardMetrics(weeklyHealthSummary)
  const weeklyTrainingPct = healthMetrics.trainingPct
  const weeklyPlannedDays = healthMetrics.plannedDays
  const weeklyCompletedDays = healthMetrics.completedDays

  const careerProfessionalEvents = getCareerProfessionalEvents(weeklyCareerActivity)
  const careerProfessionalActivityPct = getCareerProfessionalActivityPct(weeklyCareerActivity)
  const careerMetrics = getCareerDashboardMetrics(weeklyCareerSummary, careerSkillsSummary, careerProfessionalEvents)
  const weeklyCareerPct = careerMetrics.weeklyPct
  const totalCareerPct = careerMetrics.totalPct

  const skillsUsagePct = careerMetrics.skillsUsagePct
  const topCareerSkills = careerMetrics.topSkills

  const weeklyWaterPct = healthMetrics.waterPct
  const caloriesBalancePct = healthMetrics.caloriesBalancePct

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


        <RegistrationPanel open={isPanelOpen} setOpen={setIsPanelOpen} />
      </motion.div>
    </div>
  )
}
