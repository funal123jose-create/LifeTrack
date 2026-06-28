"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
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
} from "lucide-react"
import Link from "next/link"
import { BiometricsBackground, FloatingBioChips, HudCornerFrame } from "@/components/health/biometrics-background"
import { getCurrentWeekStartString, getDateForWeekdayNum, getLocalDateString } from "@/lib/date"
import {
  DAYS_OF_WEEK,
  formatLocalDateTime,
  getEstimatedCaloriesFromNutritionResponse,
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
  getConfidenceClass,
  getConfidenceLabel,
  getMealTypeLabel,
  normalizeConfidence,
  normalizeMealType,
  type ConfidenceLevel,
  type MealType,
  type NutritionMeal,
} from "@/lib/nutrition"

export default function CentroSaludPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  // --- Estados del Perfil Físico ---
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("male")

  // --- Estados del Tracker Diario ---
  const [waterIngested, setWaterIngested] = useState(0)
  const [caloriesIngested, setCaloriesIngested] = useState(0)
  const [isWorkoutDay, setIsWorkoutDay] = useState(false)

  // bmrTarget guardará el BMR BASE de descanso
  const [bmrTarget, setBmrTarget] = useState(2000)

  // --- Estado del Planificador Semanal ---
  const [plannedDays, setPlannedDays] = useState<string[]>([])

  // --- Estados Separados para Rutinas por Tipo (Fuerza / Cardio) ---
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ id: string; name: string; num: number } | null>(null)
  const [fuerzaDescriptions, setFuerzaDescriptions] = useState<{ [key: string]: string }>({})
  const [cardioDescriptions, setCardioDescriptions] = useState<{ [key: string]: string }>({})

  // --- Estados para el Cumplimiento del Checklist Semanal ---
  const [fuerzaChecked, setFuerzaChecked] = useState<{ [key: string]: boolean }>({})
  const [cardioChecked, setCardioChecked] = useState<{ [key: string]: boolean }>({})

  const [isSavingRoutine, setIsSavingRoutine] = useState(false)

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

  const calculateAge = (birthDateValue: string) => {
    if (!birthDateValue) return null

    const today = new Date()
    const birth = new Date(birthDateValue)

    if (Number.isNaN(birth.getTime())) return null

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const dayDiff = today.getDate() - birth.getDate()

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }

    return age
  }

  // --- Calcular Meta Calórica Actual Dinámicamente ---
  const currentCalorieTarget = isWorkoutDay ? bmrTarget + 400 : bmrTarget
  const waterGoal = 3
  const waterPct = Math.min(Math.round((waterIngested / waterGoal) * 100), 100)
  const caloriePct = Math.min(Math.round((caloriesIngested / currentCalorieTarget) * 100), 140)
  const plannedCount = plannedDays.length
  const currentAge = birthDate ? calculateAge(birthDate) : null

  const formatLogTime = (value: string) => {
    return formatLocalDateTime(value)
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

      if (!resolvedUserId) return

      const [{ data: meals, error: mealsError }, { data: waters, error: watersError }] = await Promise.all([
        supabase
          .from("meal_logs")
          .select("id, meal_description, estimated_calories, source, meal_type, confidence, portion_assumption, created_at")
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

      if (mealsError) console.error("Error cargando historial de comidas:", mealsError)
      if (watersError) console.error("Error cargando historial de agua:", watersError)

      setMealLogs((meals || []).map((item) => mapMealLog(item)))
      setWaterLogs((waters || []).map((item) => mapWaterLog(item)))
    } catch (error) {
      console.error("Error sincronizando historiales diarios:", error)
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
    if (!session?.user) return

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
      return
    }

    if (data) {
      setMealLogs((prev) => [
        mapMealLog(data, { source, meal_type: mealType, confidence, portion_assumption: portionAssumption }),
        ...prev,
      ])
    }
  }


  // --- Registrar varias comidas separadas para analítica histórica ---
  const insertMealLogsBatch = async (
    meals: NutritionMeal[],
    source: "text" | "audio" | "manual" | "ai" = "text"
  ) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || meals.length === 0) return

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
      }))
      .filter((meal) => meal.meal_description.trim() !== "" && meal.estimated_calories > 0)

    if (rows.length === 0) return

    const { data, error } = await supabase
      .from("meal_logs")
      .insert(rows)
      .select("id, meal_description, estimated_calories, source, meal_type, confidence, portion_assumption, created_at")

    if (error) {
      console.error("Error guardando meal_logs por lote:", error)
      return
    }

    if (data) {
      const mappedLogs = data.map((item) => mapMealLog(item, { source }))

      setMealLogs((prev) => [...mappedLogs, ...prev])
    }
  }

  // --- Registrar evento individual de agua para analítica histórica ---
  const insertWaterLog = async (amountLiters: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || amountLiters <= 0) return

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
      return
    }

    if (data) {
      setWaterLogs((prev) => [
        mapWaterLog(data, amountLiters),
        ...prev,
      ])
    }
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
      const daysMapping = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
      const todayIndex = new Date().getDay()
      const todayId = daysMapping[todayIndex]
      setCurrentDayId(todayId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // 1. Cargar Perfil Físico
      const { data: profile } = await supabase
        .from("user_physical_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (profile) {
        setHasProfile(true)
        setWeight(String(profile.weight_kg))
        setHeight(String(profile.height_cm))
        setBirthDate(profile.birth_date)
        setGender(profile.gender)
        setProgressWeight(String(profile.weight_kg))

        // Calcular BMR Base con edad exacta
        const age = calculateAge(profile.birth_date) || 0
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
        const fuerzaDescs: { [key: string]: string } = {}
        const cardioDescs: { [key: string]: string } = {}

        // Los checks ya no se leen desde rutinas_entrenamiento.
        // Esa tabla queda como plantilla semanal; el cumplimiento real se lee por semana/fecha.
        const fuerzaChecks: { [key: string]: boolean } = {}
        const cardioChecks: { [key: string]: boolean } = {}

        if (dbRoutines && dbRoutines.length > 0) {
          dbRoutines.forEach((row) => {
            const dayObj = DAYS_OF_WEEK.find((d) => d.num === row.dia_semana)
            if (dayObj) {
              if (row.activo) {
                activeDays.push(dayObj.id)
              }

              // Intentamos parsear la nueva estructura JSON de la rutina de entrenamiento
              try {
                const parsed = JSON.parse(row.descripcion_rutina || "{}") as Partial<Record<"fuerza" | "cardio", string>>
                fuerzaDescs[dayObj.id] = parsed.fuerza || ""
                cardioDescs[dayObj.id] = parsed.cardio || ""
              } catch {
                // Si venía de texto plano tradicional, lo mapeamos directamente a fuerza por seguridad
                fuerzaDescs[dayObj.id] = row.descripcion_rutina || ""
                cardioDescs[dayObj.id] = ""
              }
            }
          })
        }

        const currentWeekStart = getCurrentWeekStartString()

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

          if (completion.routine_type === "fuerza") {
            fuerzaChecks[dayObj.id] = true
          }

          if (completion.routine_type === "cardio") {
            cardioChecks[dayObj.id] = true
          }
        })

        setPlannedDays(activeDays)
        setFuerzaDescriptions(fuerzaDescs)
        setCardioDescriptions(cardioDescs)
        setFuerzaChecked(fuerzaChecks)
        setCardioChecked(cardioChecks)

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

        if (todayLog) {
          setWaterIngested(Number(todayLog.water_ingested_liters))
          setCaloriesIngested(Number(todayLog.calories_ingested))
          setIsWorkoutDay(!!todayLog.is_workout_day)
        } else {
          const isTodayPlanned = activeDays.includes(todayId)
          setIsWorkoutDay(isTodayPlanned)
          setWaterIngested(0)
          setCaloriesIngested(0)
        }

        await loadTodayLogs(session.user.id)
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
  const syncDailyTracker = async (updatedWater: number, updatedCalories: number, workoutState: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const todayStr = getLocalDateString()
    const finalCalorieTarget = workoutState ? bmrTarget + 400 : bmrTarget

    await supabase
      .from("daily_health_tracker")
      .upsert(
        {
          user_id: session.user.id,
          date: todayStr,
          water_ingested_liters: updatedWater,
          calories_ingested: updatedCalories,
          is_workout_day: workoutState,
          calorie_target: finalCalorieTarget,
        },
        { onConflict: "user_id,date" }
      )
  }

  const handleAddWater = async () => {
    const nextWater = Math.min(waterIngested + 0.25, 5)
    const addedAmount = Number((nextWater - waterIngested).toFixed(2))

    setWaterIngested(nextWater)
    await syncDailyTracker(nextWater, caloriesIngested, isWorkoutDay)

    if (addedAmount > 0) {
      await insertWaterLog(addedAmount)
    }
  }

  const handleRemoveWater = async () => {
    const nextWater = Math.max(waterIngested - 0.25, 0)
    setWaterIngested(nextWater)
    await syncDailyTracker(nextWater, caloriesIngested, isWorkoutDay)
  }

  const handleSelectDay = (dayId: string) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.id === dayId)
    if (!dayObj) return
    setSelectedDayDetail(dayObj)
  }

  // --- Guardar Rutina Combinada (Fuerza + Cardio) ---
  // Esta función guarda solo la plantilla semanal.
  // El cumplimiento/check se guarda aparte en health_routine_completions.
  const handleSaveDayRoutine = async () => {
    if (!selectedDayDetail) return
    setIsSavingRoutine(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const fText = fuerzaDescriptions[selectedDayDetail.id] || ""
      const cText = cardioDescriptions[selectedDayDetail.id] || ""

      const shouldBeActive = fText.trim() !== "" || cText.trim() !== ""

      // Plantilla semanal limpia: aquí NO guardamos checks.
      // Los checks se guardan por fecha real en health_routine_completions.
      const payloadString = JSON.stringify({
        fuerza: fText,
        cardio: cText,
      })

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
    } finally {
      setIsSavingRoutine(false)
    }
  }

  const syncRoutineCompletion = async (
    dayId: string,
    routineType: "fuerza" | "cardio",
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

  // --- Handlers de interacción directa con los Checkboxes de Cumplimiento ---
  const toggleFuerzaCheck = async (dayId: string) => {
    const previousVal = !!fuerzaChecked[dayId]
    const newVal = !previousVal

    setFuerzaChecked((prev) => ({ ...prev, [dayId]: newVal }))

    try {
      await syncRoutineCompletion(dayId, "fuerza", newVal)
    } catch (error) {
      console.error("Error guardando cumplimiento de fuerza:", error)
      setFuerzaChecked((prev) => ({ ...prev, [dayId]: previousVal }))
    }
  }

  const toggleCardioCheck = async (dayId: string) => {
    const previousVal = !!cardioChecked[dayId]
    const newVal = !previousVal

    setCardioChecked((prev) => ({ ...prev, [dayId]: newVal }))

    try {
      await syncRoutineCompletion(dayId, "cardio", newVal)
    } catch (error) {
      console.error("Error guardando cumplimiento de cardio:", error)
      setCardioChecked((prev) => ({ ...prev, [dayId]: previousVal }))
    }
  }

  // Calcular la tasa de éxito diaria acumulada para preparar la futura exportación al Dashboard
  const getCompletionPercentage = (dayId: string) => {
    const hasFuerza = (fuerzaDescriptions[dayId] || "").trim() !== ""
    const hasCardio = (cardioDescriptions[dayId] || "").trim() !== ""

    if (!hasFuerza && !hasCardio) return null

    let totalTasks = 0
    let completedTasks = 0

    if (hasFuerza) {
      totalTasks++
      if (fuerzaChecked[dayId]) completedTasks++
    }
    if (hasCardio) {
      totalTasks++
      if (cardioChecked[dayId]) completedTasks++
    }

    return Math.round((completedTasks / totalTasks) * 100)
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
        const nuevasCalorias = caloriesIngested + estimatedCalories

        setCaloriesIngested(nuevasCalorias)
        await syncDailyTracker(waterIngested, nuevasCalorias, isWorkoutDay)

        if (mealsFromAI.length > 0) {
          await insertMealLogsBatch(mealsFromAI, iaInputSource)
        } else {
          await insertMealLog(
            mealDescription,
            estimatedCalories,
            iaInputSource,
            "other",
            "medium",
            "Porción promedio estimada por IA"
          )
        }

        setIaInput("")
        setIaInputSource("text")
      }
    } catch (error) {
      console.error("Error en el endpoint de IA:", error)
    } finally {
      setIaLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex h-[70vh] items-center justify-center overflow-hidden text-slate-300">
        <BiometricsBackground />
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#02050a] px-4 pb-12 pt-6 text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-100 md:px-8 [overflow-wrap:anywhere]" style={{ fontFamily: "'Poppins', 'Nunito Sans', 'Inter', 'Manrope', system-ui, sans-serif" }}>
      <BiometricsBackground />
      <FloatingBioChips />
      <HudCornerFrame />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-8">
        {/* Retorno al menú general sin alterarlo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/pilares">
            <Button
              variant="ghost"
              className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.035] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all hover:border-emerald-400/25 hover:bg-emerald-500/[0.07] hover:text-emerald-300"
            >
              <ChevronLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" /> Volver a Pilares
            </Button>
          </Link>
        </div>

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
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative z-10 grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_420px]"
            >
              {/* LADO IZQUIERDO */}
              <div className="min-w-0 space-y-6">
                <div className="group relative overflow-hidden rounded-[2.25rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.78),rgba(3,10,18,0.68))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.075),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.14),transparent_30%)]" />
                  <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/55 to-transparent" />
                  <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl transition-all duration-700 group-hover:scale-125" />
                  <div className="absolute right-8 top-8 hidden h-36 w-36 items-center justify-center rounded-full border border-dashed border-emerald-300/15 md:flex">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-3 rounded-full border border-dashed border-blue-300/15"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-500/[0.055]"
                    >
                      <HeartPulse className="text-emerald-300" size={28} />
                    </motion.div>
                  </div>
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                      <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.055] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-emerald-300">
                        <Activity size={14} className="animate-pulse" /> Centro de Operaciones
                      </div>
                      <h2 className="break-words text-balance text-[clamp(2.35rem,4.5vw,4.3rem)] font-extrabold leading-[0.95] tracking-[-0.07em] text-white">
                        Pilar de <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">Salud Física</span>
                      </h2>
                      <p className="max-w-2xl break-words text-sm font-medium leading-relaxed text-slate-400">
                        Controla hidratación, energía diaria, entrenamiento semanal y checklist de cumplimiento desde una consola biométrica integrada.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-[1.4rem] border border-white/[0.06] bg-black/25 p-2 backdrop-blur-xl">
                      <div className="min-w-0 rounded-2xl bg-blue-500/[0.08] px-4 py-3 text-center">
                        <Droplet className="mx-auto mb-1.5 text-blue-300" size={17} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-blue-300/80">Agua</p>
                        <p className="text-xl font-extrabold text-white">{waterPct}%</p>
                      </div>
                      <div className="min-w-0 rounded-2xl bg-orange-500/[0.08] px-4 py-3 text-center">
                        <Flame className="mx-auto mb-1.5 text-orange-300" size={17} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-orange-300/80">Kcal</p>
                        <p className="text-xl font-extrabold text-white">{caloriePct}%</p>
                      </div>
                      <div className="min-w-0 rounded-2xl bg-emerald-500/[0.08] px-4 py-3 text-center">
                        <Dumbbell className="mx-auto mb-1.5 text-emerald-300" size={17} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-emerald-300/80">Días</p>
                        <p className="text-xl font-extrabold text-white">{plannedCount}/7</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTADORES DIARIOS */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="group relative min-h-[285px] overflow-hidden rounded-[2.1rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.76),rgba(3,10,18,0.68))] shadow-[0_26px_85px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all hover:-translate-y-1.5 hover:border-blue-400/35 hover:shadow-[0_32px_80px_-28px_rgba(59,130,246,0.72)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.10),transparent_34%)]" />
                    <motion.div
                      animate={{ y: [0, -10, 0], opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute right-6 top-20 h-24 w-16 rounded-full bg-blue-400/10 blur-2xl"
                    />
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
                      <div className="flex items-end gap-2">
                        <div className="text-5xl font-extrabold tracking-tighter text-white">{waterIngested}L</div>
                        <span className="pb-2 text-sm font-bold text-slate-500">/ 3.0L</span>
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

                  <Card className="group relative min-h-[285px] overflow-hidden rounded-[2.1rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(7,16,15,0.76),rgba(3,10,18,0.68))] shadow-[0_26px_85px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all hover:-translate-y-1.5 hover:border-orange-400/35 hover:shadow-[0_32px_80px_-28px_rgba(249,115,22,0.72)]">
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
                          onClick={() => {
                            const c = caloriesIngested + 100
                            setCaloriesIngested(c)
                            syncDailyTracker(waterIngested, c, isWorkoutDay)
                          }}
                          className={`h-11 flex-1 rounded-2xl border-none text-[10px] font-extrabold tracking-[0.08em] text-white shadow-lg ${
                            caloriesIngested > currentCalorieTarget
                              ? "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-500/10"
                              : "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-orange-500/10"
                          }`}
                        >
                          +100 kcal
                        </Button>
                        <Button
                          onClick={() => {
                            const c = Math.max(caloriesIngested - 100, 0)
                            setCaloriesIngested(c)
                            syncDailyTracker(waterIngested, c, isWorkoutDay)
                          }}
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
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.10),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(59,130,246,0.08),transparent_28%)]" />
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.055] text-emerald-300">
                        <CircleDotDashed size={18} />
                      </span>
                      Historial de Salud de Hoy
                    </CardTitle>
                    <CardDescription className="break-words text-slate-400">
                      Registro individual de comidas y eventos de hidratación guardados para análisis semanal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/[0.06] bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame size={15} className="text-orange-300" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-slate-400">Comidas IA</p>
                        </div>
                        <span className="rounded-full border border-orange-300/15 bg-orange-500/[0.055] px-2 py-1 text-[9px] font-extrabold text-orange-200">
                          {mealLogs.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {mealLogs.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] p-4 text-center text-[11px] font-medium text-slate-500">
                            Aún no hay comidas registradas hoy.
                          </div>
                        ) : (
                          mealLogs.slice(0, 3).map((meal) => (
                            <div key={meal.id} className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-300">
                                  {meal.meal_description}
                                </p>
                                <span className="shrink-0 rounded-lg bg-orange-500/[0.08] px-2 py-1 text-[10px] font-extrabold text-orange-300">
                                  {Math.round(meal.estimated_calories)} kcal
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-emerald-300/10 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.10em] text-emerald-300/80">
                                    {getMealTypeLabel(meal.meal_type)}
                                  </span>
                                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.10em] ${getConfidenceClass(meal.confidence)}`}>
                                    {getConfidenceLabel(meal.confidence)}
                                  </span>
                                  <span>{meal.source === "audio" ? "Audio" : "Texto"}</span>
                                </div>
                                <span>{formatLogTime(meal.created_at)}</span>
                              </div>
                              {meal.portion_assumption && (
                                <p className="mt-2 line-clamp-2 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-[10px] font-medium leading-relaxed text-slate-500">
                                  Porción asumida: {meal.portion_assumption}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

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
                          waterLogs.slice(0, 5).map((water) => (
                            <div key={water.id} className="flex items-center justify-between rounded-2xl border border-white/[0.055] bg-black/20 p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-300/15 bg-blue-500/[0.055] text-blue-300">
                                  <Droplet size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-200">
                                    +{water.amount_liters}L
                                  </p>
                                  <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
                                    Manual
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">
                                {formatLogTime(water.created_at)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PLANIFICADOR */}
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
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
                            className={`group/day relative flex min-h-[112px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-3 font-bold transition-all hover:-translate-y-1.5 hover:shadow-[0_18px_35px_rgba(0,0,0,0.25)] ${
                              isPlanned
                                ? "border-blue-300/20 bg-blue-600/90 text-white shadow-lg shadow-blue-500/10"
                                : "border-white/[0.06] bg-black/20 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            } ${isToday ? "ring-2 ring-blue-400/70" : ""} ${isSelected ? "border-cyan-300/40 bg-white/[0.08]" : ""}`}
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

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                    💪 Ejercicios de Fuerza
                                  </Label>
                                  <Textarea
                                    placeholder="Ej: Sentadillas 4x12, Press de banca 4x10, Peso muerto..."
                                    value={fuerzaDescriptions[selectedDayDetail.id] || ""}
                                    onChange={(e) =>
                                      setFuerzaDescriptions({
                                        ...fuerzaDescriptions,
                                        [selectedDayDetail.id]: e.target.value,
                                      })
                                    }
                                    className="min-h-[96px] resize-none rounded-2xl border-white/10 bg-slate-950/60 text-xs font-medium text-slate-200 placeholder:text-slate-700 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                    🏃 Ejercicios de Cardio
                                  </Label>
                                  <Textarea
                                    placeholder="Ej: 30 minutos de running en cinta, HIIT o ciclismo..."
                                    value={cardioDescriptions[selectedDayDetail.id] || ""}
                                    onChange={(e) =>
                                      setCardioDescriptions({
                                        ...cardioDescriptions,
                                        [selectedDayDetail.id]: e.target.value,
                                      })
                                    }
                                    className="min-h-[96px] resize-none rounded-2xl border-white/10 bg-slate-950/60 text-xs font-medium text-slate-200 placeholder:text-slate-700 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10"
                                  />
                                </div>
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
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* ACCIÓN ADAPTATIVA */}
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
              <div className="space-y-6 xl:sticky xl:top-6">
                {/* ESTADO FÍSICO BASE */}
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
                          {bodyProgressLogs.slice(0, 3).map((log) => (
                            <div key={log.id} className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-extrabold text-white">
                                    {log.weight_kg !== null ? `${log.weight_kg} kg` : "Peso no registrado"}
                                  </p>
                                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.10em] text-slate-600">
                                    {new Date(log.date).toLocaleDateString("es-PE")}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-lg bg-emerald-500/[0.08] px-2 py-1 text-[10px] font-extrabold text-emerald-300">
                                  {log.energy_level !== null ? `${log.energy_level}/10 energía` : "Sin energía"}
                                </span>
                              </div>
                              {log.notes && (
                                <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-400">
                                  {log.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CUMPLIMIENTO */}
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
                        const fText = fuerzaDescriptions[dayId] || ""
                        const cText = cardioDescriptions[dayId] || ""
                        const fDone = fuerzaChecked[dayId] || false
                        const cDone = cardioChecked[dayId] || false
                        const pct = getCompletionPercentage(dayId)

                        if (!fText.trim() && !cText.trim()) {
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
                              {fText.trim() !== "" && (
                                <button
                                  type="button"
                                  onClick={() => toggleFuerzaCheck(dayId)}
                                  className="group/check flex w-full items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.055]"
                                >
                                  <div className="mt-0.5 shrink-0 text-blue-300">
                                    {fDone ? (
                                      <CheckCircle2 size={19} className="fill-emerald-500/10 text-emerald-300" />
                                    ) : (
                                      <Square size={19} className="text-slate-500" />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">Fuerza</p>
                                    <p className="line-clamp-2 text-xs font-medium text-slate-400">{fText}</p>
                                  </div>
                                </button>
                              )}

                              {cText.trim() !== "" && (
                                <button
                                  type="button"
                                  onClick={() => toggleCardioCheck(dayId)}
                                  className="group/check flex w-full items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-white/[0.055]"
                                >
                                  <div className="mt-0.5 shrink-0 text-blue-300">
                                    {cDone ? (
                                      <CheckCircle2 size={19} className="fill-emerald-500/10 text-emerald-300" />
                                    ) : (
                                      <Square size={19} className="text-slate-500" />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">Cardio / Resistencia</p>
                                    <p className="line-clamp-2 text-xs font-medium text-slate-400">{cText}</p>
                                  </div>
                                </button>
                              )}
                            </div>
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
                <Card className="relative overflow-hidden rounded-[2.15rem] border border-white/[0.08] bg-[#07100f]/70 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
