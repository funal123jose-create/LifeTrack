"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog } from "radix-ui"
import {
  Droplet,
  Flame,
  Dumbbell,
  Sparkles,
  Save,
  Scale,
  Ruler,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Loader2,
  CheckSquare,
  Square,
  Percent,
  HeartPulse,
  Waves,
  Orbit,
  Gauge,
  ScanLine,
  Salad,
  AudioWaveform,
  Target,
  BatteryCharging,
  CircleDotDashed,
  X,
} from "lucide-react"
import Link from "next/link"
import { HealthMockupOverview } from "@/components/health/health-mockup-overview"
import { MealMacroEditor } from "@/components/health/meal-macro-editor"
import { HealthPlanManager } from "@/components/health/health-plan-manager"
import { HealthPeriodSelect } from "@/components/health/health-period-select"
import { HealthWaterGlass } from "@/components/health/health-water-glass"
import { fetchHealthHistory, fetchHealthPlanItems, fetchHealthStreak, fetchNutritionHistory, fetchWeightGoal, fetchWeightGoalHistory } from "@/lib/health-history-service"
import { selectNutritionRange, weightGoalStatus, type HealthHistory, type HealthPeriod, type NutritionHistory, type NutritionPeriod, type WeightGoal } from "@/lib/health-analytics"
import { healthDateRange } from "@/lib/health-periods"
import { parseRoutineTemplate, routineSnapshot, ROUTINE_LABELS, ROUTINE_TYPES, type RoutineTemplate, type RoutineType } from "@/lib/health-training"
import { buildWorkoutPlanEntries, historicalWorkoutEntries, type HealthPlanItem } from "@/lib/health-plan"
import { getMealTypeLabel } from "@/lib/nutrition"
import { BodyProgressLogCard, WaterLogCard } from "@/components/health/recent-log-cards"
import { getCurrentWeekStartString, getDateForWeekdayNum, getLocalDateString } from "@/lib/date"
import {
  DAYS_OF_WEEK,
  calculateAgeFromBirthDate,
  getCurrentCalorieTarget,
  getCurrentWeekdayId,
  getDailyHealthMetrics,
  getEstimatedCaloriesFromNutritionResponse,
  getRecentBodyProgressLogs,
  getRecentWaterLogs,
  getRoutineCompletionPercentage,
  mapBodyProgressLog,
  mapMealLog,
  mapNutritionMealsFromAI,
  mapWaterLog,
} from "@/lib/health-page-helpers"
import type {
  BodyProgressLog,
  MealLog,
  RoutineCompletion,
  WaterLog,
} from "@/lib/health-page-models"
import {
  normalizeConfidence,
  normalizeMealType,
  type ConfidenceLevel,
  type MealType,
  type NutritionMeal,
} from "@/lib/nutrition"

export default function CentroSaludPage() {
  const supabase = createClient()
  const healthDialogRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<"nutrition" | "hydration" | "routine" | "progress" | "plan" | null>(null)
  const [chartPeriod, setChartPeriod] = useState<HealthPeriod>(8)
  const [nutritionPeriod, setNutritionPeriod] = useState<NutritionPeriod>("today")
  const [nutritionOffset, setNutritionOffset] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0)
  const [planWeekOffset, setPlanWeekOffset] = useState(0)
  const [history, setHistory] = useState<HealthHistory>({ body: [], tracker: [], water: [], routine: [], plans: [] })
  const [nutritionHistory, setNutritionHistory] = useState<NutritionHistory>({ meals: [], tracker: [] })
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null)
  const [weightGoalHistory, setWeightGoalHistory] = useState<Awaited<ReturnType<typeof fetchWeightGoalHistory>>>([])
  const [streak, setStreak] = useState({ current: 0, best: 0, recentDays: [] as string[] })
  const [analyticsRevision, setAnalyticsRevision] = useState(0)
  const [waterGoal, setWaterGoal] = useState(3)
  const [waterGoalInput, setWaterGoalInput] = useState("3")
  const [waterGoalError, setWaterGoalError] = useState("")
  const [waterGoalSaving, setWaterGoalSaving] = useState(false)
  const [planItems, setPlanItems] = useState<HealthPlanItem[]>([])
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [goalWeightInput, setGoalWeightInput] = useState("")
  const [goalDateInput, setGoalDateInput] = useState("")
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalError, setGoalError] = useState("")

  // --- Estados del Perfil Físico ---
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("male")

  // --- Estados del Tracker Diario ---
  const [waterIngested, setWaterIngested] = useState(0)
  const [caloriesIngested, setCaloriesIngested] = useState(0)
  const [manualCalories, setManualCalories] = useState(0)
  const [isWorkoutDay, setIsWorkoutDay] = useState(false)

  // bmrTarget guardará el BMR BASE de descanso
  const [bmrTarget, setBmrTarget] = useState(2000)

  // --- Estado del Planificador Semanal ---
  const [plannedDays, setPlannedDays] = useState<string[]>([])

  // --- Plantilla semanal por tipo y cumplimiento por fecha ---
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ id: string; name: string; num: number } | null>(null)
  const [routineDescriptions, setRoutineDescriptions] = useState<Record<RoutineType, Record<string, string>>>(() => Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, string>>)
  const [routineTimes, setRoutineTimes] = useState<Record<RoutineType, Record<string, string>>>(() => Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, string>>)
  const [routineChecked, setRoutineChecked] = useState<Record<RoutineType, Record<string, boolean>>>(() => Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, boolean>>)

  const [isSavingRoutine, setIsSavingRoutine] = useState(false)
  const [routineError, setRoutineError] = useState("")

  // --- Estado para saber qué día de la semana es HOY en base a la semana actual ---
  const [currentDayId, setCurrentDayId] = useState("")

  // --- Estados: Asistente Nutricional por Voz/Texto de Gemini ---
  const [iaInput, setIaInput] = useState("")
  const [iaInputSource, setIaInputSource] = useState<"text" | "audio">("text")
  const [iaLoading, setIaLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // --- Historiales diarios para análisis posterior ---
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])

  // --- Historial de progreso físico ---
  const [bodyProgressLogs, setBodyProgressLogs] = useState<BodyProgressLog[]>([])
  const [progressWeight, setProgressWeight] = useState("")
  const [energyLevel, setEnergyLevel] = useState("7")
  const [progressNotes, setProgressNotes] = useState("")
  const [isSavingProgress, setIsSavingProgress] = useState(false)

  // Referencias para MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const loadedDateRef = useRef("")


  // --- Calcular Meta Calórica Actual Dinámicamente ---
  const dailyHealthMetrics = getDailyHealthMetrics(waterIngested, caloriesIngested, isWorkoutDay, bmrTarget, waterGoal)
  const currentCalorieTarget = dailyHealthMetrics.currentCalorieTarget
  const waterPct = dailyHealthMetrics.waterPct
  const caloriePct = dailyHealthMetrics.caloriePct
  const plannedCount = plannedDays.length
  const currentAge = birthDate ? calculateAgeFromBirthDate(birthDate) : null

  useEffect(() => {
    if (!userId || !hasProfile) return
    let active = true
    Promise.all([
      fetchHealthHistory(supabase, userId),
      fetchNutritionHistory(supabase, userId),
      fetchWeightGoal(supabase, userId),
      fetchWeightGoalHistory(supabase, userId),
      fetchHealthStreak(supabase),
      fetchHealthPlanItems(supabase, userId),
    ]).then(([nextHistory, nextNutrition, nextGoal, nextGoalHistory, nextStreak, nextPlanItems]) => {
      if (!active) return
      setHistory(nextHistory)
      setNutritionHistory(nextNutrition)
      setWeightGoal(nextGoal)
      setWeightGoalHistory(nextGoalHistory)
      setStreak(nextStreak)
      setPlanItems(nextPlanItems)
    }).catch((error) => console.error("Error cargando analítica de salud:", error))
    return () => { active = false }
  }, [supabase, userId, hasProfile, analyticsRevision])

  const saveWeightGoal = async () => {
    const current = bodyProgressLogs.find((log) => log.weight_kg !== null)?.weight_kg ?? Number(weight)
    const target = Number(goalWeightInput)
    if (!userId || !Number.isFinite(current) || current <= 0 || !Number.isFinite(target) || target <= 0 || target >= 1000 || goalDateInput < getLocalDateString()) {
      setGoalError("Ingresa un peso objetivo y una fecha futura válidos.")
      return
    }
    setGoalSaving(true)
    setGoalError("")
    const { error } = await supabase.rpc("replace_health_weight_goal", {
      p_start_weight: current,
      p_target_weight: target,
      p_target_date: goalDateInput,
    })
    setGoalSaving(false)
    if (error) setGoalError("No se pudo guardar la meta. Intenta nuevamente.")
    else setAnalyticsRevision((value) => value + 1)
  }

  const cancelWeightGoal = async () => {
    if (!weightGoal || !userId) return
    setGoalSaving(true)
    setGoalError("")
    const { error } = await supabase.rpc("cancel_health_weight_goal")
    setGoalSaving(false)
    if (error) setGoalError("No se pudo cancelar la meta.")
    else setAnalyticsRevision((value) => value + 1)
  }

  // --- Cargar historiales diarios de comida y agua ---
  const loadTodayLogs = useCallback(async (userId?: string) => {
    try {
      const todayStr = getLocalDateString()

      let resolvedUserId = userId
      if (!resolvedUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        resolvedUserId = session?.user?.id
      }

      if (!resolvedUserId) return null

      const [{ data: meals, error: mealsError }, { data: waters, error: watersError }] = await Promise.all([
        supabase
          .from("meal_logs")
          .select("id, meal_description, estimated_calories, source, meal_type, confidence, portion_assumption, protein_g, carbs_g, fat_g, created_at")
          .eq("user_id", resolvedUserId)
          .eq("date", todayStr)
          .order("created_at", { ascending: false }),

        supabase
          .from("water_logs")
          .select("id, amount_liters, source, created_at")
          .eq("user_id", resolvedUserId)
          .eq("date", todayStr)
          .order("created_at", { ascending: false }),
      ])

      if (mealsError || watersError) throw mealsError || watersError

      setMealLogs((meals || []).map((item) => mapMealLog(item)))
      setWaterLogs((waters || []).map((item) => mapWaterLog(item)))
      return {
        mealCalories: (meals || []).reduce((sum, item) => sum + Number(item.estimated_calories), 0),
        water: Math.round((waters || []).reduce((sum, item) => sum + Number(item.amount_liters), 0) * 100) / 100,
      }
    } catch (error) {
      console.error("Error sincronizando historiales diarios:", error)
      return null
    }
  }, [supabase])

  // --- Cargar historial reciente de progreso físico ---
  const loadBodyProgressLogs = useCallback(async (userId?: string) => {
    try {
      let resolvedUserId = userId

      if (!resolvedUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        resolvedUserId = session?.user?.id
      }

      if (!resolvedUserId) return

      const { data, error } = await supabase
        .from("body_progress_logs")
        .select("id, date, weight_kg, energy_level, notes, created_at")
        .eq("user_id", resolvedUserId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error cargando progreso físico:", error)
        return
      }

      setBodyProgressLogs((data || []).map((item) => mapBodyProgressLog(item)))
    } catch (error) {
      console.error("Error sincronizando progreso físico:", error)
    }
  }, [supabase])

  // --- Registrar comida individual para analítica histórica ---
  const insertMealLog = async (
    description: string,
    estimatedCalories: number,
    source: "text" | "audio" | "manual" | "ai" = "text",
    mealType: MealType = "other",
    confidence: ConfidenceLevel = "medium",
    portionAssumption: string | null = null
  ) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false

    const todayStr = getLocalDateString()

    const { data, error } = await supabase
      .from("meal_logs")
      .insert({
        user_id: session.user.id,
        date: todayStr,
        meal_description: description,
        estimated_calories: estimatedCalories,
        source,
        meal_type: mealType,
        confidence,
        portion_assumption: portionAssumption,
      })
      .select("id, meal_description, estimated_calories, source, meal_type, confidence, portion_assumption, created_at")
      .single()

    if (error) {
      console.error("Error guardando meal_logs:", error)
      return false
    }

    if (data) {
      setMealLogs((prev) => [
        mapMealLog(data, { source, meal_type: mealType, confidence, portion_assumption: portionAssumption }),
        ...prev,
      ])
      setAnalyticsRevision((value) => value + 1)
    }
    return true
  }


  // --- Registrar varias comidas separadas para analítica histórica ---
  const insertMealLogsBatch = async (
    meals: NutritionMeal[],
    source: "text" | "audio" | "manual" | "ai" = "text"
  ) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || meals.length === 0) return false

    const todayStr = getLocalDateString()

    const rows = meals
      .map((meal) => ({
        user_id: session.user.id,
        date: todayStr,
        meal_description: meal.description,
        estimated_calories: Math.max(0, Math.round(Number(meal.estimated_calories || 0))),
        source,
        meal_type: normalizeMealType(meal.meal_type || "other"),
        confidence: normalizeConfidence(meal.confidence || "medium"),
        portion_assumption: meal.portion_assumption || "Porción promedio estimada por IA",
        protein_g: meal.protein_g ?? null,
        carbs_g: meal.carbs_g ?? null,
        fat_g: meal.fat_g ?? null,
        food_breakdown: meal.foods?.map((food) => ({ ...food })) || null,
      }))
      .filter((meal) => meal.meal_description.trim() !== "" && meal.estimated_calories > 0)

    if (rows.length === 0) return false

    const { data, error } = await supabase
      .from("meal_logs")
      .insert(rows)
      .select("id, meal_description, estimated_calories, source, meal_type, confidence, portion_assumption, protein_g, carbs_g, fat_g, created_at")

    if (error) {
      console.error("Error guardando meal_logs por lote:", error)
      return false
    }

    if (data) {
      const mappedLogs = data.map((item) => mapMealLog(item, { source }))

      setMealLogs((prev) => [...mappedLogs, ...prev])
      setAnalyticsRevision((value) => value + 1)
    }
    return true
  }

  // --- Registrar evento individual de agua para analítica histórica ---
  const insertWaterLog = async (amountLiters: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || amountLiters <= 0) return false

    const todayStr = getLocalDateString()

    const { data, error } = await supabase
      .from("water_logs")
      .insert({
        user_id: session.user.id,
        date: todayStr,
        amount_liters: amountLiters,
        source: "manual",
      })
      .select("id, amount_liters, source, created_at")
      .single()

    if (error) {
      console.error("Error guardando water_logs:", error)
      return false
    }

    if (data) {
      setWaterLogs((prev) => [
        mapWaterLog(data, amountLiters),
        ...prev,
      ])
      setAnalyticsRevision((value) => value + 1)
    }
    return true
  }

  const handleSaveBodyProgress = async () => {
    if (!progressWeight.trim() && !energyLevel.trim() && !progressNotes.trim()) return

    setIsSavingProgress(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const todayStr = getLocalDateString()
      const parsedWeight = progressWeight.trim() ? Number(progressWeight) : null
      const parsedEnergy = energyLevel.trim() ? Number(energyLevel) : null

      if (parsedWeight !== null && (Number.isNaN(parsedWeight) || parsedWeight <= 0)) return
      if (parsedEnergy !== null && (Number.isNaN(parsedEnergy) || parsedEnergy < 1 || parsedEnergy > 10)) return

      const { data, error } = await supabase
        .from("body_progress_logs")
        .insert({
          user_id: session.user.id,
          date: todayStr,
          weight_kg: parsedWeight,
          energy_level: parsedEnergy,
          notes: progressNotes.trim() || null,
        })
        .select("id, date, weight_kg, energy_level, notes, created_at")
        .single()

      if (error) {
        console.error("Error guardando progreso físico:", error)
        return
      }

      if (data) {
        const newLog = mapBodyProgressLog(data)

        setBodyProgressLogs((prev) => [newLog, ...prev].slice(0, 5))
        setAnalyticsRevision((value) => value + 1)

        if (parsedWeight !== null) {
          setWeight(String(parsedWeight))
          setProgressWeight(String(parsedWeight))
        }

        setProgressNotes("")
      }
    } catch (error) {
      console.error("Error sincronizando body_progress_logs:", error)
    } finally {
      setIsSavingProgress(false)
    }
  }

  // --- Cargar Información Completa de Salud ---
  const loadHealthData = useCallback(async () => {
    try {
      // Determinamos dinámicamente qué día es hoy en la semana actual real del sistema
      const todayId = getCurrentWeekdayId()
      setCurrentDayId(todayId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setUserId(null)
        return
      }
      setUserId(session.user.id)

      // 1. Cargar Perfil Físico
      const { data: profile } = await supabase
        .from("user_physical_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (profile) {
        setHasProfile(true)
        setWaterGoal(Number(profile.water_goal_ml || 3000) / 1000)
        setWaterGoalInput(String(Number(profile.water_goal_ml || 3000) / 1000))
        setWeight(String(profile.weight_kg))
        setHeight(String(profile.height_cm))
        setBirthDate(profile.birth_date)
        setGender(profile.gender)
        setProgressWeight(String(profile.weight_kg))

        // Calcular BMR Base con edad exacta
        const age = calculateAgeFromBirthDate(profile.birth_date) || 0
        let baseCalories = (10 * Number(profile.weight_kg)) + (6.25 * Number(profile.height_cm)) - (5 * age)
        baseCalories = profile.gender === "male" ? baseCalories + 5 : baseCalories - 161
        const calculatedBmr = Math.round(baseCalories * 1.2)
        setBmrTarget(calculatedBmr)

        // 2. Cargar Rutinas Semanales Agendadas
        const { data: dbRoutines } = await supabase
          .from("rutinas_entrenamiento")
          .select("*")
          .eq("user_id", session.user.id)

        const activeDays: string[] = []
        const descriptions = Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, string>>
        const times = Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, string>>

        // Los checks ya no se leen desde rutinas_entrenamiento.
        // Esa tabla queda como plantilla semanal; el cumplimiento real se lee por semana/fecha.
        const checks = Object.fromEntries(ROUTINE_TYPES.map((type) => [type, {}])) as Record<RoutineType, Record<string, boolean>>
        const templates: Record<number, RoutineTemplate> = {}

        if (dbRoutines && dbRoutines.length > 0) {
          dbRoutines.forEach((row) => {
            const dayObj = DAYS_OF_WEEK.find((d) => d.num === row.dia_semana)
            if (dayObj) {
              if (row.activo) {
                activeDays.push(dayObj.id)
              }

              const parsed = parseRoutineTemplate(row.descripcion_rutina)
              if (row.activo) templates[dayObj.num] = parsed
              for (const type of ROUTINE_TYPES) {
                descriptions[type][dayObj.id] = parsed[type]
                times[type][dayObj.id] = parsed.times[type] || ""
              }
            }
          })
        }

        const currentWeekStart = getCurrentWeekStartString()
        const plannedRoutines = routineSnapshot(templates)

        const { data: existingWeekPlan } = await supabase.from("health_weekly_plans")
          .select("week_start, planned_routines")
          .eq("user_id", session.user.id)
          .eq("week_start", currentWeekStart)
          .maybeSingle()
        if (!existingWeekPlan) {
          const { error: planError } = await supabase.from("health_weekly_plans").insert({
            user_id: session.user.id,
            week_start: currentWeekStart,
            planned_days: [...new Set(activeDays)].map((id) => DAYS_OF_WEEK.find((day) => day.id === id)!.num),
            planned_routines: plannedRoutines,
          })
          if (planError) console.error("Error guardando plan semanal de salud:", planError)
        } else if (!existingWeekPlan.planned_routines || Object.keys(existingWeekPlan.planned_routines).length === 0) {
          const { error: planError } = await supabase.from("health_weekly_plans").update({ planned_routines: plannedRoutines }).eq("user_id", session.user.id).eq("week_start", currentWeekStart)
          if (planError) console.error("Error completando plantilla semanal:", planError)
        }

        const { data: currentWeekCompletions, error: currentWeekCompletionsError } = await supabase
          .from("health_routine_completions")
          .select("date, dia_semana, routine_type, completed")
          .eq("user_id", session.user.id)
          .eq("week_start", currentWeekStart)
          .eq("completed", true)

        if (currentWeekCompletionsError) {
          console.error("Error cargando cumplimiento semanal de rutina:", currentWeekCompletionsError)
        }

        ;((currentWeekCompletions || []) as RoutineCompletion[]).forEach((completion) => {
          const dayObj = DAYS_OF_WEEK.find((d) => d.num === Number(completion.dia_semana))
          if (!dayObj) return

          if (ROUTINE_TYPES.includes(completion.routine_type as RoutineType)) checks[completion.routine_type as RoutineType][dayObj.id] = true
        })

        setPlannedDays(activeDays)
        setRoutineDescriptions(descriptions)
        setRoutineTimes(times)
        setRoutineChecked(checks)

        // Asignar por defecto la visualización al día de hoy en curso
        const defaultDay = DAYS_OF_WEEK.find((d) => d.id === todayId) || DAYS_OF_WEEK[0]
        setSelectedDayDetail(defaultDay)

        // 3. Cargar Tracker Diario (Hoy)
        const todayStr = getLocalDateString()
        const { data: todayLog } = await supabase
          .from("daily_health_tracker")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("date", todayStr)
          .maybeSingle()

        const todayTotals = await loadTodayLogs(session.user.id)
        const manual = Number(todayLog?.calorie_manual_adjustment || 0)
        setManualCalories(manual)
        setWaterIngested(todayTotals?.water ?? 0)
        setCaloriesIngested(Math.max(0, (todayTotals?.mealCalories ?? 0) + manual))
        setIsWorkoutDay(todayLog ? !!todayLog.is_workout_day : activeDays.includes(todayId))
        loadedDateRef.current = todayStr
        await loadBodyProgressLogs(session.user.id)
      } else {
        setHasProfile(false)
        setMealLogs([])
        setWaterLogs([])
        setBodyProgressLogs([])
      }
    } catch (e) {
      console.error("Error cargando telemetría de salud:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, loadTodayLogs, loadBodyProgressLogs])

  useEffect(() => {
    let isActive = true

    queueMicrotask(() => {
      if (isActive) {
        loadHealthData()
      }
    })

    return () => {
      isActive = false
    }
  }, [loadHealthData])

  useEffect(() => {
    const refreshIfNewDay = () => {
      if (loadedDateRef.current && loadedDateRef.current !== getLocalDateString()) void loadHealthData()
    }
    const timer = window.setInterval(refreshIfNewDay, 30000)
    window.addEventListener("focus", refreshIfNewDay)
    document.addEventListener("visibilitychange", refreshIfNewDay)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", refreshIfNewDay)
      document.removeEventListener("visibilitychange", refreshIfNewDay)
    }
  }, [loadHealthData])

  // --- Guardar/Actualizar Perfil Físico ---
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { error } = await supabase
        .from("user_physical_profiles")
        .upsert(
          {
            user_id: session.user.id,
            weight_kg: parseFloat(weight),
            height_cm: parseFloat(height),
            birth_date: birthDate,
            gender: gender,
          },
          { onConflict: "user_id" }
        )

      if (!error) {
        await loadHealthData()
      } else {
        console.error("Error al guardar perfil:", error)
        setLoading(false)
      }
    }
  }

  // --- Sincronizar Tracker Diario ---
  const syncDailyTracker = async (updatedWater: number, updatedCalories: number, workoutState: boolean, targetWater = waterGoal, manualAdjustment = manualCalories) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false

    const todayStr = getLocalDateString()
    if (loadedDateRef.current !== todayStr) {
      await loadHealthData()
      return false
    }
    const finalCalorieTarget = getCurrentCalorieTarget(workoutState, bmrTarget)

    const { error } = await supabase
      .from("daily_health_tracker")
      .upsert(
        {
          user_id: session.user.id,
          date: todayStr,
          water_ingested_liters: updatedWater,
          water_target_liters: targetWater,
          calories_ingested: updatedCalories,
          calorie_manual_adjustment: manualAdjustment,
          is_workout_day: workoutState,
          calorie_target: finalCalorieTarget,
        },
        { onConflict: "user_id,date" }
      )
    if (error) {
      console.error("Error sincronizando tracker diario:", error)
      return false
    }
    setAnalyticsRevision((value) => value + 1)
    return true
  }

  const handleAddWater = async () => {
    if (loadedDateRef.current !== getLocalDateString()) {
      await loadHealthData()
      return
    }
    const nextWater = Math.min(waterIngested + 0.25, Math.max(5, waterGoal + 2))
    const addedAmount = Number((nextWater - waterIngested).toFixed(2))
    if (addedAmount <= 0) return
    const saved = await insertWaterLog(addedAmount)
    if (!saved) return
    const totals = await loadTodayLogs(userId || undefined)
    if (!totals) return
    setWaterIngested(totals.water)
    await syncDailyTracker(totals.water, caloriesIngested, isWorkoutDay)
  }

  const handleRemoveWater = async () => {
    if (loadedDateRef.current !== getLocalDateString()) {
      await loadHealthData()
      return
    }
    const latest = waterLogs[0]
    if (!latest || !userId) return
    const remaining = Number((latest.amount_liters - 0.25).toFixed(2))
    const query = remaining > 0
      ? supabase.from("water_logs").update({ amount_liters: remaining }).eq("id", latest.id).eq("user_id", userId)
      : supabase.from("water_logs").delete().eq("id", latest.id).eq("user_id", userId)
    const { error } = await query
    if (error) {
      console.error("Error ajustando agua registrada:", error)
      return
    }
    const totals = await loadTodayLogs(userId)
    if (!totals) return
    setWaterIngested(totals.water)
    await syncDailyTracker(totals.water, caloriesIngested, isWorkoutDay)
  }

  const handleAdjustCalories = async (delta: number) => {
    if (loadedDateRef.current !== getLocalDateString()) {
      await loadHealthData()
      return
    }
    const mealTotal = mealLogs.reduce((sum, meal) => sum + meal.estimated_calories, 0)
    const nextManual = Math.max(-mealTotal, manualCalories + delta)
    const nextCalories = Math.max(0, mealTotal + nextManual)
    if (await syncDailyTracker(waterIngested, nextCalories, isWorkoutDay, waterGoal, nextManual)) {
      setManualCalories(nextManual)
      setCaloriesIngested(nextCalories)
    }
  }

  const saveWaterGoal = async () => {
    const target = Number(waterGoalInput)
    if (!userId || !Number.isFinite(target) || target < 0.25 || target > 10) {
      setWaterGoalError("Ingresa una meta entre 0.25 y 10 litros.")
      return
    }
    setWaterGoalSaving(true)
    setWaterGoalError("")
    const { error } = await supabase.from("user_physical_profiles").update({ water_goal_ml: Math.round(target * 1000) }).eq("user_id", userId)
    if (error) setWaterGoalError("No se pudo guardar la meta de agua.")
    else {
      setWaterGoal(target)
      await syncDailyTracker(waterIngested, caloriesIngested, isWorkoutDay, target)
    }
    setWaterGoalSaving(false)
  }

  const saveMealMacros = async (mealId: string, input: { protein_g: number | null; carbs_g: number | null; fat_g: number | null; portion_assumption: string; foods: import("@/lib/nutrition").NutritionFood[] }) => {
    if (!userId) return false
    const { error } = await supabase.from("meal_logs").update({
      protein_g: input.protein_g,
      carbs_g: input.carbs_g,
      fat_g: input.fat_g,
      portion_assumption: input.portion_assumption || null,
      food_breakdown: input.foods.map((food) => ({ ...food })),
    }).eq("id", mealId).eq("user_id", userId)
    if (error) return false
    setAnalyticsRevision((value) => value + 1)
    return true
  }

  const addPlanItem = async (input: Pick<HealthPlanItem, "date" | "category" | "title" | "scheduled_time" | "target_value" | "target_unit">) => {
    if (!userId) return false
    const { error } = await supabase.from("health_plan_items").insert({ ...input, user_id: userId })
    if (error) return false
    setAnalyticsRevision((value) => value + 1)
    return true
  }

  const togglePlanItem = async (item: HealthPlanItem) => {
    if (!userId) return
    const { error } = await supabase.from("health_plan_items").update({ completed: !item.completed }).eq("id", item.id).eq("user_id", userId)
    if (error) console.error("Error actualizando objetivo de salud:", error)
    else setAnalyticsRevision((value) => value + 1)
  }

  const deletePlanItem = async (id: string) => {
    if (!userId) return
    const { error } = await supabase.from("health_plan_items").delete().eq("id", id).eq("user_id", userId)
    if (error) console.error("Error eliminando objetivo de salud:", error)
    else setAnalyticsRevision((value) => value + 1)
  }

  const handleSelectDay = (dayId: string) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.id === dayId)
    if (!dayObj) return
    setSelectedDayDetail(dayObj)
  }

  // --- Guardar plantilla semanal; el cumplimiento se registra por fecha. ---
  // Esta función guarda solo la plantilla semanal.
  // El cumplimiento/check se guarda aparte en health_routine_completions.
  const handleSaveDayRoutine = async () => {
    if (!selectedDayDetail) return
    setIsSavingRoutine(true)
    setRoutineError("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const template = Object.fromEntries(ROUTINE_TYPES.map((type) => [type, routineDescriptions[type][selectedDayDetail.id] || ""])) as Record<RoutineType, string>
      const shouldBeActive = ROUTINE_TYPES.some((type) => template[type].trim())

      // Plantilla semanal limpia: aquí NO guardamos checks.
      // Los checks se guardan por fecha real en health_routine_completions.
      const payloadString = JSON.stringify({ ...template, times: Object.fromEntries(ROUTINE_TYPES.map((type) => [type, routineTimes[type][selectedDayDetail.id] || ""])) })

      const { error } = await supabase
        .from("rutinas_entrenamiento")
        .upsert(
          {
            user_id: session.user.id,
            dia_semana: selectedDayDetail.num,
            activo: shouldBeActive,
            descripcion_rutina: payloadString,
          },
          { onConflict: "user_id,dia_semana" }
        )

      if (error) throw error

      const nextPlannedDays = shouldBeActive
        ? [...new Set([...plannedDays, selectedDayDetail.id])]
        : plannedDays.filter((id) => id !== selectedDayDetail.id)
      const { error: planError } = await supabase.from("health_weekly_plans").upsert({
        user_id: session.user.id,
        week_start: getCurrentWeekStartString(),
        planned_days: nextPlannedDays.map((id) => DAYS_OF_WEEK.find((day) => day.id === id)!.num),
        planned_routines: Object.fromEntries(nextPlannedDays.map((id) => [DAYS_OF_WEEK.find((day) => day.id === id)!.num, ROUTINE_TYPES.filter((type) => (routineDescriptions[type][id] || "").trim())])),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,week_start" })
      if (planError) throw planError
      setAnalyticsRevision((value) => value + 1)

      if (shouldBeActive) {
        if (!plannedDays.includes(selectedDayDetail.id)) {
          setPlannedDays([...plannedDays, selectedDayDetail.id])
        }
      } else {
        setPlannedDays(plannedDays.filter((d) => d !== selectedDayDetail.id))
      }

      if (selectedDayDetail.id === currentDayId) {
        setIsWorkoutDay(shouldBeActive)
        await syncDailyTracker(waterIngested, caloriesIngested, shouldBeActive)
      }
    } catch (error) {
      console.error("Error al sincronizar itinerario de entrenamiento:", error)
      setRoutineError("No se pudo guardar todo el plan. Vuelve a intentar.")
    } finally {
      setIsSavingRoutine(false)
    }
  }

  const syncRoutineCompletion = async (
    dayId: string,
    routineType: RoutineType,
    completed: boolean
  ) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.id === dayId)
    if (!dayObj) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const weekStart = getCurrentWeekStartString()
    const routineDate = getDateForWeekdayNum(weekStart, dayObj.num)

    if (completed) {
      const { error } = await supabase
        .from("health_routine_completions")
        .upsert(
          {
            user_id: session.user.id,
            date: routineDate,
            week_start: weekStart,
            dia_semana: dayObj.num,
            routine_type: routineType,
            completed: true,
          },
          { onConflict: "user_id,date,routine_type" }
        )

      if (error) throw error
      return
    }

    const { error } = await supabase
      .from("health_routine_completions")
      .delete()
      .eq("user_id", session.user.id)
      .eq("date", routineDate)
      .eq("routine_type", routineType)

    if (error) throw error
  }

  const toggleRoutineCheck = async (dayId: string, type: RoutineType) => {
    const previousVal = !!routineChecked[type][dayId]
    const newVal = !previousVal
    setRoutineChecked((prev) => ({ ...prev, [type]: { ...prev[type], [dayId]: newVal } }))

    try {
      await syncRoutineCompletion(dayId, type, newVal)
      setAnalyticsRevision((value) => value + 1)
    } catch (error) {
      console.error("Error guardando cumplimiento de rutina:", error)
      setRoutineChecked((prev) => ({ ...prev, [type]: { ...prev[type], [dayId]: previousVal } }))
      setRoutineError("No se pudo actualizar el cumplimiento.")
    }
  }

  // Calcular la tasa de éxito diaria acumulada para preparar la futura exportación al Dashboard
  const getCompletionPercentage = (dayId: string) => {
    return getRoutineCompletionPercentage(dayId, routineDescriptions, routineChecked)
  }

  // --- Grabación de Audio ---
  const handleMicrofonoClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        setIaLoading(true)
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1]
          try {
            const response = await fetch("/api/nutrition", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audio: base64Audio,
                mimeType: "audio/webm",
                mode: "transcribe",
              }),
            })
            const data = await response.json()
            if (data.text) {
              setIaInput(data.text)
              setIaInputSource("audio")
            }
          } catch (error) {
            console.error("Error al procesar audio:", error)
          } finally {
            setIaLoading(false)
          }
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("No se pudo acceder al micrófono:", err)
    }
  }

  // --- Analizar Nutrición por IA ---
  const handleAnalyzeNutrition = async () => {
    const mealDescription = iaInput.trim()
    if (!mealDescription) return
    if (loadedDateRef.current !== getLocalDateString()) {
      await loadHealthData()
      return
    }

    setIaLoading(true)
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: mealDescription }),
      })

      const data = await response.json()
      const mealsFromAI = Array.isArray(data.meals) ? mapNutritionMealsFromAI(data.meals) : []
      const estimatedCalories = getEstimatedCaloriesFromNutritionResponse(mealsFromAI, data.totalCalories)

      if (estimatedCalories > 0) {
        const saved = mealsFromAI.length > 0
          ? await insertMealLogsBatch(mealsFromAI, iaInputSource)
          : await insertMealLog(
            mealDescription,
            estimatedCalories,
            iaInputSource,
            "other",
            "medium",
            "Porción promedio estimada por IA"
          )
        if (!saved) return
        const totals = await loadTodayLogs(userId || undefined)
        if (!totals) return
        const nextCalories = Math.max(0, totals.mealCalories + manualCalories)
        setCaloriesIngested(nextCalories)
        await syncDailyTracker(totals.water, nextCalories, isWorkoutDay)

        setIaInput("")
        setIaInputSource("text")
      }
    } catch (error) {
      console.error("Error en el endpoint de IA:", error)
    } finally {
      setIaLoading(false)
    }
  }

  const workoutEntries = buildWorkoutPlanEntries(getCurrentWeekStartString(), routineDescriptions, routineTimes, routineChecked)
  const nutritionRange = healthDateRange(nutritionPeriod, nutritionOffset)
  const selectedNutrition = selectNutritionRange(nutritionHistory, nutritionRange)
  const planRange = healthDateRange("week", planWeekOffset)
  const selectedPlanItems = planItems.filter((item) => item.date >= planRange.start && item.date <= planRange.end)
  const selectedPlanWorkouts = planWeekOffset === 0 ? workoutEntries : historicalWorkoutEntries(history, planRange.start)

  if (loading) {
    return (
      <div className="relative flex h-[70vh] items-center justify-center overflow-hidden text-slate-300">
        <div className="relative z-10 flex flex-col items-center gap-5 rounded-[2rem] border border-white/[0.08] bg-white/[0.04] px-10 py-9 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-emerald-400/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 rounded-full border border-dashed border-blue-400/30"
            />
            <HeartPulse className="text-emerald-300 drop-shadow-[0_0_22px_rgba(16,185,129,0.55)]" size={34} />
          </div>
          <div className="text-center">
            <p className="animate-pulse text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              SINCRO-BIOMÉTRICA EN CURSO
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Calibrando datos físicos, rutina semanal y telemetría diaria...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="health-command-center lifetrack-redesign relative min-h-screen w-full overflow-hidden bg-transparent px-2 pb-12 pt-2 font-sans text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-100 sm:px-4 [overflow-wrap:anywhere]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1728px] flex-col gap-6">
        {/* Retorno al menú general sin alterarlo */}
        {!hasProfile ? <div className="relative z-10 flex items-center justify-between">
          <Link href="/pilares" className="group flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/35 hover:bg-emerald-500/[0.08] hover:text-emerald-200">
            <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1.5" /> [ VOLVER A PILARES ]
          </Link>
        </div> : (
          <HealthMockupOverview
            water={waterIngested}
            waterGoal={dailyHealthMetrics.waterGoal}
            calories={caloriesIngested}
            calorieGoal={currentCalorieTarget}
            energy={bodyProgressLogs.find((log) => log.energy_level !== null)?.energy_level ?? null}
            weight={bodyProgressLogs.find((log) => log.weight_kg !== null)?.weight_kg ?? (Number(weight) || null)}
            history={history}
            nutrition={nutritionHistory}
            goal={weightGoal}
            streak={streak}
            planItems={planItems}
            workouts={workoutEntries}
            onTogglePlanItem={togglePlanItem}
            onToggleWorkout={(entry) => toggleRoutineCheck(entry.dayId, entry.type)}
            chartPeriod={chartPeriod}
            analyticsRevision={analyticsRevision}
            nutritionPeriod={nutritionPeriod}
            nutritionOffset={nutritionOffset}
            weekOffset={weekOffset}
            planWeekOffset={planWeekOffset}
            onChartPeriodChange={setChartPeriod}
            onNutritionPeriodChange={setNutritionPeriod}
            onNutritionOffsetChange={setNutritionOffset}
            onWeekOffsetChange={setWeekOffset}
            onPlanWeekOffsetChange={setPlanWeekOffset}
            onOpenPanel={setActivePanel}
            days={DAYS_OF_WEEK.map((day) => ({
              id: day.id,
              name: day.name,
              planned: plannedDays.includes(day.id),
              progress: getCompletionPercentage(day.id),
            }))}
            onAddWater={handleAddWater}
            onSelectDay={(dayId) => {
              handleSelectDay(dayId)
              setActivePanel("routine")
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {!hasProfile ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.96, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.78),rgba(3,10,18,0.68))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-9">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(16,185,129,0.075),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.12),transparent_28%)]" />
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

                <div className="relative flex h-full flex-col justify-between gap-8">
                  <div className="space-y-5">
                    <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.055] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                      <ScanLine size={14} className="animate-pulse" /> Calibración Inicial
                    </div>
                    <div className="space-y-3">
                      <h1 className="break-words text-balance text-[clamp(2.45rem,5vw,4.8rem)] font-extrabold leading-[0.94] tracking-[-0.075em] text-white">
                        Perfil <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">Biométrico</span>
                      </h1>
                      <p className="max-w-xl break-words text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                        Inicializa tu centro de salud para calcular tus metas diarias, sincronizar tu rutina semanal y activar tu panel de seguimiento físico.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="min-w-0 rounded-2xl border border-white/[0.065] bg-black/24 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <Scale className="mx-auto mb-2 text-emerald-300" size={20} />
                      <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">Peso</p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-white/[0.065] bg-black/24 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <Ruler className="mx-auto mb-2 text-blue-300" size={20} />
                      <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">Altura</p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-white/[0.065] bg-black/24 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <Gauge className="mx-auto mb-2 text-orange-300" size={20} />
                      <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">BMR</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.78),rgba(3,10,18,0.68))] shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.06),transparent_32%)]" />
                <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                <CardHeader className="relative space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    <Sparkles size={14} className="animate-pulse" /> Calibración de Sistema
                  </div>
                  <CardTitle className="break-words text-3xl font-extrabold tracking-[-0.04em] text-white">Datos físicos base</CardTitle>
                  <CardDescription className="break-words text-slate-400">
                    Registra tus datos para inicializar el algoritmo de gasto calórico predictivo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          <Scale size={14} /> Peso (kg)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="75.5"
                          required
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-12 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-white placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          <Ruler size={14} /> Altura (cm)
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="175"
                          required
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-12 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-white placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        <Calendar size={14} /> Fecha de Nacimiento
                      </Label>
                      <Input
                        id="birth"
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-12 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Género Biológico</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setGender("male")}
                          className={`h-12 rounded-2xl border text-sm font-extrabold transition-all ${
                            gender === "male"
                              ? "border-emerald-300/30 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "border-white/10 bg-black/25 text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          Masculino
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender("female")}
                          className={`h-12 rounded-2xl border text-sm font-extrabold transition-all ${
                            gender === "female"
                              ? "border-emerald-300/30 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "border-white/10 bg-black/25 text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          Femenino
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="mt-2 flex h-12 w-full gap-2 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-[11px] font-bold tracking-[0.08em] text-white shadow-[0_18px_42px_rgba(16,185,129,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(16,185,129,0.38)] active:scale-[0.98]"
                    >
                      <Save size={16} /> GUARDAR CONFIGURACIÓN
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Dialog.Root open={activePanel !== null} onOpenChange={(open) => { if (!open) setActivePanel(null) }}>
              <Dialog.Portal>
                <Dialog.Overlay className="health-dialog-overlay fixed inset-0 z-[60] bg-[#020c15]/85 backdrop-blur-sm" />
                <Dialog.Content ref={healthDialogRef} onOpenAutoFocus={() => requestAnimationFrame(() => healthDialogRef.current?.scrollTo(0, 0))} data-active-panel={activePanel || ""} className="health-dialog-content health-detail-modal fixed inset-x-2 top-1/2 z-[61] mx-auto max-h-[92dvh] w-[calc(100%-1rem)] max-w-5xl -translate-y-1/2 overflow-y-auto rounded-xl border border-emerald-300/25 bg-[#071a29] p-3 text-slate-100 shadow-[0_30px_100px_rgba(0,0,0,.7)] outline-none sm:p-5">
                  <div className="health-dialog-header sticky top-0 z-20 mb-4 flex items-center gap-3 border-b border-emerald-300/15 bg-[#0b2431]/95 pb-3 backdrop-blur-md">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-400/10 text-emerald-300"><HeartPulse size={20} /></div>
                    <div className="min-w-0 flex-1"><Dialog.Title className="text-base font-extrabold text-white">{activePanel === "nutrition" ? "Nutrición y comidas" : activePanel === "hydration" ? "Hidratación" : activePanel === "routine" ? "Plan y entrenamiento" : activePanel === "plan" ? "Plan semanal de salud" : "Progreso físico"}</Dialog.Title><Dialog.Description className="text-xs text-slate-400">Tus registros y acciones de Salud</Dialog.Description></div>
                    <Dialog.Close className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-100/10 text-slate-300 transition hover:border-emerald-300/40 hover:text-white" aria-label="Cerrar"><X size={17} /></Dialog.Close>
                  </div>
                  {activePanel === "progress" && <div className="mb-4 grid gap-3 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.05] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div><Label htmlFor="health-goal-weight" className="mb-1 block text-[11px] text-slate-300">Peso objetivo (kg)</Label><Input id="health-goal-weight" type="number" min="1" max="999" step="0.1" value={goalWeightInput} onChange={(event) => setGoalWeightInput(event.target.value)} placeholder={weightGoal ? String(weightGoal.target_weight_kg) : "Ej. 70"} className="border-emerald-300/20 bg-[#061923] text-white" /></div>
                    <div><Label htmlFor="health-goal-date" className="mb-1 block text-[11px] text-slate-300">Fecha objetivo</Label><Input id="health-goal-date" type="date" min={getLocalDateString()} value={goalDateInput} onChange={(event) => setGoalDateInput(event.target.value)} className="border-emerald-300/20 bg-[#061923] text-white" /></div>
                    <Button type="button" onClick={saveWeightGoal} disabled={goalSaving} className="bg-emerald-500 font-semibold text-[#03221b] hover:bg-emerald-400">{goalSaving ? "Guardando..." : weightGoal ? "Guardar nueva meta" : "Crear meta"}</Button>
                    {goalError && <p className="text-xs text-orange-300 sm:col-span-3" role="alert">{goalError}</p>}
                    <p className="text-[11px] text-slate-400 sm:col-span-3">Una nueva meta archiva la anterior sin borrar su resultado. El peso inicial se toma del último registro.</p>
                    {weightGoal && <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 sm:col-span-3"><span>Meta {weightGoalStatus(bodyProgressLogs.find((log) => log.weight_kg !== null)?.weight_kg ?? null, weightGoal).toLowerCase()}: {weightGoal.start_weight_kg} → {weightGoal.target_weight_kg} kg · {weightGoal.start_date} a {weightGoal.target_date}</span><button type="button" disabled={goalSaving} onClick={cancelWeightGoal} className="text-orange-300 hover:text-white">Cancelar meta</button></div>}
                  </div>}
                  {activePanel === "progress" && <div className="mb-4 grid gap-3 sm:grid-cols-2"><section className="rounded-xl border border-emerald-300/15 p-3"><h3 className="mb-2 text-xs font-bold text-white">Historial de peso</h3>{history.body.filter((row) => row.weight_kg !== null).slice(-10).reverse().map((row) => <div key={`${row.date}-${row.created_at}`} className="flex justify-between border-t border-sky-100/10 py-1 text-[11px] text-slate-300"><span>{row.date}</span><strong className="text-white">{row.weight_kg} kg</strong></div>)}</section><section className="rounded-xl border border-emerald-300/15 p-3"><h3 className="mb-2 text-xs font-bold text-white">Metas cerradas</h3>{weightGoalHistory.length ? weightGoalHistory.map((goal) => <div key={goal.id} className="border-t border-sky-100/10 py-1.5 text-[11px] text-slate-300"><strong className="text-white">{goal.start_weight_kg} → {goal.target_weight_kg} kg</strong> · {goal.start_date} a {goal.target_date}<span className="block text-slate-400">{({ completed: "Cumplida", expired: "Vencida", cancelled: "Cancelada", replaced: "Reemplazada" } as Record<string, string>)[goal.status] || goal.status} · final {goal.final_weight_kg ?? "sin registro"} kg</span></div>) : <p className="text-[11px] text-slate-400">Aún no hay metas cerradas.</p>}</section></div>}
                  {activePanel === "nutrition" && <div className="mb-4 rounded-xl border border-emerald-300/15 bg-[#09202b] p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-white">Historial de comidas</h3><div className="flex flex-wrap gap-2"><HealthPeriodSelect label="Periodo de comidas" value={nutritionPeriod} onChange={(value) => { setNutritionPeriod(value as NutritionPeriod); setNutritionOffset(0) }}><option value="today">Día</option><option value="week">Semana</option><option value="month">Mes</option></HealthPeriodSelect><HealthPeriodSelect label="Fecha de comidas" value={nutritionOffset} onChange={(value) => setNutritionOffset(Number(value))}>{Array.from({ length: nutritionPeriod === "today" ? 14 : nutritionPeriod === "week" ? 8 : 7 }, (_, offset) => <option key={offset} value={offset}>{healthDateRange(nutritionPeriod, offset).label}</option>)}</HealthPeriodSelect></div></div>
                    {selectedNutrition.meals.length ? <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">{selectedNutrition.meals.map((meal) => <div key={meal.id} className="rounded-lg border border-emerald-300/10 bg-[#081b27] p-2 text-xs"><div className="flex min-w-0 flex-wrap items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-orange-300"><Salad size={16} /></span><div className="min-w-0 flex-1"><strong className="text-white">{getMealTypeLabel(meal.meal_type)}</strong><p className="truncate text-slate-300" title={meal.meal_description}>{meal.date} · {meal.meal_description}</p></div><div className="shrink-0 text-right text-slate-300"><strong className="text-white">{meal.estimated_calories} kcal</strong><p>{new Date(meal.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p></div><button type="button" onClick={() => setEditingMealId(editingMealId === meal.id ? null : meal.id)} className="rounded-lg border border-emerald-300/20 px-2 py-1 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-400/10">{meal.protein_g == null || meal.carbs_g == null || meal.fat_g == null ? "Completar macros" : "Revisar macros"}</button></div>{editingMealId === meal.id && <div className="mt-2"><MealMacroEditor key={meal.id} meal={meal} onSave={(input) => saveMealMacros(meal.id, input)} /></div>}</div>)}</div> : <p className="text-xs text-slate-400">Sin comidas registradas en este periodo.</p>}
                  </div>}
                  {activePanel === "hydration" && <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-cyan-300/20 bg-cyan-400/[0.05] p-4"><div><Label htmlFor="water-goal" className="mb-1 block text-[11px] text-slate-300">Meta diaria de agua (L)</Label><Input id="water-goal" type="number" inputMode="decimal" min="0.25" max="10" step="0.25" value={waterGoalInput} onChange={(event) => setWaterGoalInput(event.target.value)} className="w-36 border-cyan-300/20 bg-[#061923] text-white" /></div><Button type="button" onClick={saveWaterGoal} disabled={waterGoalSaving} className="bg-cyan-500 font-semibold text-[#03222b] hover:bg-cyan-400">{waterGoalSaving ? "Guardando..." : "Guardar meta"}</Button>{waterGoalError && <p role="alert" className="w-full text-xs text-orange-300">{waterGoalError}</p>}</div>}
                  {activePanel === "plan" && <HealthPlanManager items={selectedPlanItems} workouts={selectedPlanWorkouts} weekOffset={planWeekOffset} onAdd={addPlanItem} onToggleItem={togglePlanItem} onDeleteItem={deletePlanItem} onToggleWorkout={(entry) => toggleRoutineCheck(entry.dayId, entry.type)} />}
            {activePanel !== "plan" && <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className={activePanel === "routine" ? "health-routine-layout grid min-w-0 items-start gap-4 md:grid-cols-2" : "grid min-w-0 items-start gap-4"}
            >
              {/* Controles y registros existentes, enlazados desde el resumen visual. */}
              <div className={`health-detail-primary min-w-0 space-y-4 ${activePanel === "progress" ? "hidden" : ""}`}>
                {/* CONTADORES DIARIOS */}
                <div className="health-tracker-counters grid gap-4">
                  <Card data-health-panel="hydration" className="group relative min-h-[285px] overflow-hidden rounded-[2.1rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.76),rgba(3,10,18,0.68))] shadow-[0_26px_85px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all hover:-translate-y-1.5 hover:border-blue-400/35 hover:shadow-[0_32px_80px_-28px_rgba(59,130,246,0.72)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.10),transparent_34%)]" />
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-600" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Hidratación Diaria
                      </CardTitle>
                      <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.14)]">
                        <Droplet size={20} />
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-5">
                      <div className="flex items-center gap-5">
                        <HealthWaterGlass percent={waterPct} large />
                        <div className="min-w-0"><div className="text-4xl font-extrabold text-white">{waterIngested} L</div><span className="text-sm font-semibold text-slate-400">Meta: {waterGoal.toFixed(2)} L</span></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">
                          <span>Progreso hídrico</span>
                          <span className="text-blue-300">{waterPct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${waterPct}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-200 shadow-[0_0_16px_rgba(59,130,246,0.62)]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddWater}
                          className="h-11 flex-1 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-blue-600 to-cyan-500 text-[10px] font-extrabold tracking-[0.08em] text-white shadow-lg shadow-blue-500/10 hover:from-blue-500 hover:to-cyan-400"
                        >
                          +250 ml
                        </Button>
                        <Button
                          onClick={handleRemoveWater}
                          variant="outline"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.035] px-4 text-slate-400 hover:bg-white/8 hover:text-white"
                        >
                          -
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-health-panel="nutrition" className="group relative min-h-[285px] overflow-hidden rounded-[2.1rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.76),rgba(3,10,18,0.68))] shadow-[0_26px_85px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all hover:-translate-y-1.5 hover:border-orange-400/35 hover:shadow-[0_32px_80px_-28px_rgba(249,115,22,0.72)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(251,191,36,0.10),transparent_34%)]" />
                    <motion.div
                      animate={{ y: [0, -10, 0], opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute right-6 top-20 h-24 w-16 rounded-full bg-orange-400/10 blur-2xl"
                    />
                    <div
                      className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b transition-colors duration-300 ${
                        caloriesIngested > currentCalorieTarget
                          ? "from-red-400 via-red-500 to-rose-700"
                          : "from-orange-400 via-amber-400 to-yellow-500"
                      }`}
                    />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Presupuesto Energético
                      </CardTitle>
                      <div
                        className={`rounded-2xl border p-3 shadow-[0_0_22px_rgba(249,115,22,0.14)] transition-colors ${
                          caloriesIngested > currentCalorieTarget
                            ? "border-red-400/20 bg-red-500/10 text-red-300"
                            : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                        }`}
                      >
                        <Flame size={20} />
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-5">
                      <div className="flex items-end gap-2">
                        <div className="text-5xl font-extrabold tracking-tighter text-white">{caloriesIngested}</div>
                        <span className="pb-2 text-sm font-bold text-slate-500">/ {currentCalorieTarget} kcal</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">
                          <span>Consumo energético</span>
                          <span className={caloriesIngested > currentCalorieTarget ? "text-red-300" : "text-orange-300"}>
                            {caloriePct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(caloriePct, 100)}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={`h-full rounded-full shadow-[0_0_16px_rgba(249,115,22,0.62)] ${
                              caloriesIngested > currentCalorieTarget
                                ? "bg-gradient-to-r from-red-600 via-red-400 to-rose-200"
                                : "bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => void handleAdjustCalories(100)}
                          className={`h-11 flex-1 rounded-2xl border-none text-[10px] font-extrabold tracking-[0.08em] text-white shadow-lg ${
                            caloriesIngested > currentCalorieTarget
                              ? "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-500/10"
                              : "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-orange-500/10"
                          }`}
                        >
                          +100 kcal
                        </Button>
                        <Button
                          onClick={() => void handleAdjustCalories(-100)}
                          variant="outline"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.035] px-4 text-slate-400 hover:bg-white/8 hover:text-white"
                        >
                          -
                        </Button>
                      </div>
                      <AnimatePresence>
                        {caloriesIngested > currentCalorieTarget && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-[10px] font-bold uppercase tracking-[0.08em] text-red-300">
                              <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                              <span>¡Límite Calórico Excedido!</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>

                {/* ASISTENTE NUTRICIONAL */}
                <Card data-health-panel="nutrition" id="health-nutrition" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.12),transparent_28%)]" />
                  <motion.div
                    animate={{ x: ["-20%", "120%"] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
                  />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  <CardHeader className="relative">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-white">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                            <Sparkles size={18} />
                          </span>
                          Asistente Nutricional Inteligente
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-slate-400">
                          Describe tus platos en lenguaje natural o graba tu voz para computar calorías dinámicamente.
                        </CardDescription>
                      </div>
                      <div className="rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3 text-center">
                        <Salad className="mx-auto mb-1 text-emerald-300" size={18} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">IA Nutricional</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Ej: Desayuné dos huevos revueltos con café y pan integral..."
                        value={iaInput}
                        onChange={(e) => {
                          setIaInput(e.target.value)
                          setIaInputSource("text")
                        }}
                        disabled={iaLoading}
                        className="h-12 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] pr-14 text-sm font-medium text-white placeholder:text-slate-600 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/10"
                      />
                      <button
                        type="button"
                        onClick={handleMicrofonoClick}
                        disabled={iaLoading}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 transition-all ${
                          isRecording
                            ? "border border-red-400/30 bg-red-500/20 text-red-300 shadow-[0_0_22px_rgba(239,68,68,0.25)] animate-pulse"
                            : "bg-white/[0.055] text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {isRecording ? <AudioWaveform size={17} /> : <Mic size={17} />}
                      </button>
                    </div>
                    <Button
                      onClick={handleAnalyzeNutrition}
                      disabled={iaLoading || !iaInput.trim()}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 text-[11px] font-bold tracking-[0.08em] text-white shadow-[0_18px_42px_rgba(249,115,22,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(249,115,22,0.28)] disabled:opacity-55"
                    >
                      {iaLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> PROCESANDO...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> CALCULAR E INTEGRAR CALORÍAS
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>


                {/* HISTORIAL DIARIO */}
                <Card data-health-panel="hydration" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.10),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(59,130,246,0.08),transparent_28%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.055] text-emerald-300">
                        <CircleDotDashed size={18} />
                      </span>
                      Historial de Hidratación de Hoy
                    </CardTitle>
                    <CardDescription className="break-words text-slate-400">
                      Eventos de agua registrados durante el día.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative grid gap-4">
                    <div className="rounded-[1.5rem] border border-white/[0.06] bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet size={15} className="text-blue-300" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-slate-400">Agua</p>
                        </div>
                        <span className="rounded-full border border-blue-300/15 bg-blue-500/[0.055] px-2 py-1 text-[9px] font-extrabold text-blue-200">
                          {waterLogs.length} registros
                        </span>
                      </div>

                      <div className="space-y-2">
                        {waterLogs.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] p-4 text-center text-[11px] font-medium text-slate-500">
                            Aún no hay eventos de agua registrados hoy.
                          </div>
                        ) : (
                          getRecentWaterLogs(waterLogs).map((water) => (
                            <WaterLogCard key={water.id} water={water} />
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PLANIFICADOR */}
                <Card data-health-panel="routine" id="health-routine" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_90%_88%,rgba(34,211,238,0.08),transparent_34%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                        <Calendar size={18} />
                      </span>
                      Planificación Semanal de Entrenamiento
                    </CardTitle>
                    <CardDescription className="break-words text-slate-400">
                      Haz clic en cualquier día para desglosar o reestructurar su itinerario deportivo de la semana actual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-5">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                      {DAYS_OF_WEEK.map((day) => {
                        const isPlanned = plannedDays.includes(day.id)
                        const isToday = day.id === currentDayId
                        const isSelected = selectedDayDetail?.id === day.id
                        const pct = getCompletionPercentage(day.id)

                        return (
                          <button
                            key={day.id}
                            onClick={() => handleSelectDay(day.id)}
                            type="button"
                            className={`group/day relative flex min-h-[82px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border p-2 font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] ${
                              isPlanned
                                ? "border-emerald-300/30 bg-emerald-500/20 text-white"
                                : "border-white/[0.06] bg-black/20 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            } ${isToday ? "ring-1 ring-emerald-400/70" : ""} ${isSelected ? "border-emerald-300/70 bg-emerald-400/[0.12]" : ""}`}
                          >
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="text-[10px] uppercase tracking-[0.08em]">{day.name}</span>
                            {isPlanned ? (
                              <CheckCircle2 size={17} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                            )}
                            {pct !== null && (
                              <span className="rounded-full bg-black/25 px-2 py-0.5 text-[8px] font-extrabold text-cyan-200">
                                {pct}%
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedDayDetail && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="mt-2 overflow-hidden border-t border-white/[0.06] pt-5"
                        >
                          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-black/24 p-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(59,130,246,0.10),transparent_30%)]" />
                            <div className="relative space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-300">
                                  <Dumbbell size={14} className="text-blue-300" /> Configurar Itinerario:{" "}
                                  {selectedDayDetail.name}
                                </h4>
                                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.10em] text-blue-300">
                                  Semana actual
                                </span>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                {ROUTINE_TYPES.map((type) => <div key={type} className="space-y-2 rounded-xl border border-emerald-300/10 bg-[#071c28] p-3">
                                  <Label htmlFor={`routine-${type}`} className="text-[11px] font-bold text-slate-200">{ROUTINE_LABELS[type]}</Label>
                                  <Textarea id={`routine-${type}`} placeholder={`Actividad de ${ROUTINE_LABELS[type].toLowerCase()} para ${selectedDayDetail.name}`} value={routineDescriptions[type][selectedDayDetail.id] || ""} onChange={(event) => setRoutineDescriptions((previous) => ({ ...previous, [type]: { ...previous[type], [selectedDayDetail.id]: event.target.value } }))} className="min-h-[68px] resize-y rounded-lg border-white/10 bg-slate-950/50 text-xs text-slate-100" />
                                  <div className="flex items-center gap-2"><Label htmlFor={`routine-time-${type}`} className="text-[10px] text-slate-400">Hora</Label><Input id={`routine-time-${type}`} type="time" value={routineTimes[type][selectedDayDetail.id] || ""} onChange={(event) => setRoutineTimes((previous) => ({ ...previous, [type]: { ...previous[type], [selectedDayDetail.id]: event.target.value } }))} className="h-8 w-32 border-white/10 bg-slate-950/50 text-xs text-white" /></div>
                                </div>)}
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleSaveDayRoutine()}
                                  disabled={isSavingRoutine}
                                  className="flex h-10 items-center gap-1.5 rounded-xl border border-blue-300/20 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-[10px] font-extrabold tracking-[0.08em] text-white shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-400"
                                >
                                  {isSavingRoutine ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                  GUARDAR ACTIVIDADES
                                </Button>
                              </div>
                              {routineError && <p role="alert" className="text-xs text-orange-300">{routineError}</p>}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* ACCIÓN ADAPTATIVA */}
                <Card data-health-panel="routine" data-routine-action className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_88%_70%,rgba(20,184,166,0.08),transparent_32%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                  <CardContent className="relative flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-white sm:justify-start">
                        <BatteryCharging size={16} className="text-emerald-300" /> ¿Ya entrenaste o vas a entrenar hoy?
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {isWorkoutDay
                          ? "🔥 Meta adaptada: Excedente muscular activo (+400 kcal)"
                          : "💤 Modo descanso: Gasto calórico base asignado"}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const s = !isWorkoutDay
                        setIsWorkoutDay(s)
                        syncDailyTracker(waterIngested, caloriesIngested, s)
                      }}
                      className={`h-12 rounded-2xl border px-6 text-[10px] font-extrabold tracking-[0.08em] transition-all hover:-translate-y-0.5 ${
                        isWorkoutDay
                          ? "border-emerald-300/20 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                          : "border-white/10 bg-white/[0.055] text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {isWorkoutDay ? "ENTRENAMIENTO COMPLETADO" : "MARCAR COMO ENTRENADO"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* LADO DERECHO */}
              <div className={`health-detail-secondary space-y-4 ${activePanel === "nutrition" || activePanel === "hydration" ? "hidden" : ""}`}>
                {/* ESTADO FÍSICO BASE */}
                <Card data-health-panel="progress" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.075),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(59,130,246,0.08),transparent_32%)]" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-white">
                      <Scale size={16} className="text-emerald-300" /> Estado Físico Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4 text-xs font-semibold text-slate-400">
                    <div className="relative flex min-h-[170px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-black/20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                        className="absolute h-36 w-36 rounded-full border border-dashed border-emerald-400/20"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        className="absolute h-24 w-24 rounded-full border border-dashed border-blue-400/20"
                      />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/[0.055] shadow-[0_0_35px_rgba(16,185,129,0.16)]">
                        <HeartPulse className="text-emerald-300" size={34} />
                      </div>
                      <Orbit size={16} className="absolute right-5 top-5 text-white/20" />
                      <Waves size={16} className="absolute bottom-5 left-5 text-white/20" />
                    </div>

                    <div className="flex justify-between border-b border-white/[0.06] py-2">
                      <span>Peso registrado</span> <span className="font-extrabold text-white">{weight} kg</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] py-2">
                      <span>Altura base</span> <span className="font-extrabold text-white">{height} cm</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] py-2">
                      <span>Edad actual</span>{" "}
                      <span className="font-extrabold text-blue-300">
                        {currentAge !== null ? `${currentAge} años` : "Sin fecha"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] py-2">
                      <span>Gasto Metabólico (BMR)</span>{" "}
                      <span className="font-extrabold text-emerald-300">{currentCalorieTarget} kcal</span>
                    </div>
                    <Button
                      onClick={() => setHasProfile(false)}
                      variant="ghost"
                      className="mt-2 h-10 w-full rounded-xl text-[10px] font-bold uppercase tracking-[0.10em] text-slate-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      RE-CALIBRAR PERFIL
                    </Button>
                  </CardContent>
                </Card>

                {/* PROGRESO FÍSICO */}
                <Card data-health-panel="progress" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.075),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(245,158,11,0.06),transparent_32%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                  <CardHeader className="relative pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-white">
                      <BatteryCharging size={16} className="text-emerald-300" /> Progreso Físico
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Registra tu peso, energía y una nota breve para analizar evolución semanal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">
                          Peso actual
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ej. 74.8"
                          value={progressWeight}
                          onChange={(e) => setProgressWeight(e.target.value)}
                          className="h-11 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-xs font-bold text-white placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">
                          Energía 1-10
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="7"
                          value={energyLevel}
                          onChange={(e) => setEnergyLevel(e.target.value)}
                          className="h-11 rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-xs font-bold text-white placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">
                        Nota de progreso
                      </Label>
                      <Textarea
                        placeholder="Ej: Me sentí con más energía, mejor descanso o más fuerza esta semana..."
                        value={progressNotes}
                        onChange={(e) => setProgressNotes(e.target.value)}
                        className="min-h-[82px] resize-none rounded-2xl border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] text-xs font-medium text-white placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    <Button
                      onClick={handleSaveBodyProgress}
                      disabled={isSavingProgress}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-500/[0.12] text-[10px] font-bold uppercase tracking-[0.10em] text-emerald-100 shadow-lg shadow-emerald-950/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/[0.18] disabled:opacity-60"
                    >
                      {isSavingProgress ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Guardar Progreso
                    </Button>

                    <div className="space-y-2 border-t border-white/[0.06] pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-slate-500">Historial reciente</p>
                        <span className="rounded-full border border-emerald-300/15 bg-emerald-500/[0.055] px-2 py-1 text-[9px] font-extrabold text-emerald-200">
                          {bodyProgressLogs.length}
                        </span>
                      </div>

                      {bodyProgressLogs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] p-4 text-center text-[11px] font-medium text-slate-500">
                          Aún no hay registros de progreso físico.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {getRecentBodyProgressLogs(bodyProgressLogs).map((log) => (
                            <BodyProgressLogCard key={log.id} log={log} />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CUMPLIMIENTO */}
                <Card data-health-panel="routine" data-routine-checklist className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(16,185,129,0.08),transparent_32%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                  <CardHeader className="relative pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-white">
                      <CheckSquare size={16} className="text-blue-300" /> Cumplimiento de Tareas
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {selectedDayDetail ? `Progreso auditado para el día ${selectedDayDetail.name}` : "Selecciona un día en el planificador"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {selectedDayDetail ? (
                      (() => {
                        const dayId = selectedDayDetail.id
                        const plannedTypes = ROUTINE_TYPES.filter((type) => (routineDescriptions[type][dayId] || "").trim())
                        const pct = getCompletionPercentage(dayId)

                        if (!plannedTypes.length) {
                          return (
                            <div className="rounded-2xl border border-dashed border-white/[0.07] bg-slate-950/35 px-5 py-8 text-center text-xs font-medium leading-relaxed text-slate-500">
                              No hay ejercicios guardados para este día. Planifica actividades a la izquierda para activar el checklist interactivo.
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-4">
                            {pct !== null && (
                              <div className="rounded-2xl border border-white/[0.06] bg-black/24 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    <Percent size={12} /> Tasa de Éxito
                                  </span>
                                  <span
                                    className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${
                                      pct === 100
                                        ? "bg-emerald-500/[0.055] text-emerald-300"
                                        : pct === 50
                                        ? "bg-amber-500/10 text-amber-300"
                                        : "bg-slate-500/10 text-slate-400"
                                    }`}
                                  >
                                    {pct}%
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className={`h-full rounded-full ${
                                      pct === 100
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_14px_rgba(16,185,129,0.55)]"
                                        : "bg-gradient-to-r from-blue-600 to-cyan-300 shadow-[0_0_14px_rgba(59,130,246,0.45)]"
                                    }`}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              {plannedTypes.map((type) => <button key={type} type="button" onClick={() => toggleRoutineCheck(dayId, type)} className="group/check flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.055]"><span className="mt-0.5 shrink-0">{routineChecked[type][dayId] ? <CheckCircle2 size={19} className="text-emerald-300" /> : <Square size={19} className="text-slate-500" />}</span><span className="min-w-0"><strong className="block text-[10px] uppercase text-white">{ROUTINE_LABELS[type]}{routineTimes[type][dayId] ? ` · ${routineTimes[type][dayId]}` : ""}</strong><span className="block text-xs text-slate-400">{routineDescriptions[type][dayId]}</span></span></button>)}
                            </div>
                            {routineError && <p role="alert" className="text-xs text-orange-300">{routineError}</p>}
                          </div>
                        )
                      })()
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/[0.07] bg-slate-950/35 py-6 text-center text-xs text-slate-500">
                        Selecciona un día en el planificador semanal para ver tus tareas.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* RESUMEN */}
                <Card data-health-panel="progress" className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(16,185,129,0.08),transparent_32%)]" />
                  <CardContent className="relative space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">Resumen de control</p>
                        <p className="text-xs font-medium text-slate-500">Panel diario sincronizado</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-black/24 p-3 text-center">
                        <CircleDotDashed className="mx-auto mb-1 text-blue-300" size={14} />
                        <p className="text-[9px] font-bold uppercase text-slate-500">Agua</p>
                        <p className="text-sm font-extrabold text-white">{waterPct}%</p>
                      </div>
                      <div className="rounded-2xl bg-black/24 p-3 text-center">
                        <CircleDotDashed className="mx-auto mb-1 text-orange-300" size={14} />
                        <p className="text-[9px] font-bold uppercase text-slate-500">Kcal</p>
                        <p className="text-sm font-extrabold text-white">{caloriePct}%</p>
                      </div>
                      <div className="rounded-2xl bg-black/24 p-3 text-center">
                        <CircleDotDashed className="mx-auto mb-1 text-emerald-300" size={14} />
                        <p className="text-[9px] font-bold uppercase text-slate-500">Plan</p>
                        <p className="text-sm font-extrabold text-white">{plannedCount}/7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
