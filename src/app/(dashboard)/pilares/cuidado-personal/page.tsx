"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  Moon,
  SmilePlus,
  Flame,
  HeartHandshake,
  Sun,
  Home,
  Scissors,
  Leaf,
  Target,
  RefreshCw,
  CalendarCheck2,
  NotebookPen,
  BatteryCharging,
  Activity,
  ArrowLeft,
} from "lucide-react"

const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getCurrentWeekStartString = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const day = today.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)

  return formatDateToLocalString(monday)
}

const getCurrentWeekEndString = () => {
  const monday = new Date(`${getCurrentWeekStartString()}T00:00:00`)
  monday.setDate(monday.getDate() + 6)

  return formatDateToLocalString(monday)
}

type PersonalCareRoutine = {
  id: string
  user_id: string
  name: string
  category: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

type PersonalCareCompletion = {
  id: string
  routine_id: string
  date: string
  week_start: string
  completed: boolean
}

type WeeklyPersonalCareSummary = {
  week_start: string | null
  week_end: string | null
  active_days: number
  checkin_days: number
  avg_mood_level: number
  avg_stress_level: number
  avg_motivation_level: number
  avg_sleep_quality: number
  reflection_days: number
  gratitude_days: number
  improvement_days: number
  active_routines: number
  completed_routine_events: number
  routine_completed_days: number
  unique_routines_completed: number
  routine_completion_percentage: number
  checkin_completion_percentage: number
  personal_care_score: number
  last_log_date: string | null
  last_mood_level: number | null
  last_stress_level: number | null
  last_motivation_level: number | null
  last_sleep_quality: number | null
  last_reflection: string | null
  last_gratitude_note: string | null
  last_improvement_note: string | null
  last_activity_at: string | null
  care_intensity: "none" | "low" | "medium" | "high" | string
}

type RoutineTemplate = {
  name: string
  category: string
  description: string
}

const DEFAULT_ROUTINES: RoutineTemplate[] = [
  {
    name: "Lavado facial",
    category: "skincare",
    description: "Rutina básica de limpieza facial para iniciar o cerrar el día.",
  },
  {
    name: "Hidratación de piel",
    category: "skincare",
    description: "Aplicar hidratante o cuidado básico para mantener la piel saludable.",
  },
  {
    name: "Protector solar",
    category: "skincare",
    description: "Aplicar protector solar antes de salir o iniciar actividades del día.",
  },
  {
    name: "Cuidado de cabello",
    category: "presentación",
    description: "Peinar, ordenar o realizar cuidado básico del cabello.",
  },
  {
    name: "Orden del espacio",
    category: "entorno",
    description: "Ordenar el espacio personal para mejorar concentración y bienestar.",
  },
  {
    name: "Pausa mental",
    category: "bienestar",
    description: "Tomar unos minutos para respirar, desconectar o bajar revoluciones.",
  },
]

const categoryStyles: Record<string, { label: string; icon: any; className: string }> = {
  skincare: {
    label: "Skincare",
    icon: Sun,
    className: "border-cyan-300/14 bg-cyan-500/[0.08] text-cyan-200",
  },
  presentación: {
    label: "Presentación",
    icon: Scissors,
    className: "border-orange-300/14 bg-orange-500/[0.08] text-orange-200",
  },
  entorno: {
    label: "Entorno",
    icon: Home,
    className: "border-emerald-300/14 bg-emerald-500/[0.08] text-emerald-200",
  },
  bienestar: {
    label: "Bienestar",
    icon: Leaf,
    className: "border-purple-300/14 bg-purple-500/[0.08] text-purple-200",
  },
  general: {
    label: "General",
    icon: Sparkles,
    className: "border-slate-300/10 bg-slate-500/[0.08] text-slate-200",
  },
}

function PersonalCareBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#02040a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(168,85,247,0.13),transparent_30%),radial-gradient(circle_at_86%_15%,rgba(45,212,191,0.105),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(249,115,22,0.08),transparent_36%),linear-gradient(135deg,#02040a_0%,#060816_48%,#030305_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:78px_78px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
      <motion.div
        animate={{ x: [0, 24, -16, 0], y: [0, -16, 18, 0], scale: [1, 1.08, 0.98, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[7%] top-[18%] h-[30rem] w-[30rem] rounded-full bg-purple-500/[0.075] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -22, 16, 0], y: [0, 18, -14, 0], scale: [1, 0.97, 1.09, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[16%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.065] blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(2,4,10,0.92)_100%)]" />
      <div className="absolute inset-0 bg-[#02040a]/28" />
    </div>
  )
}

const scoreTone = (score: number) => {
  if (score >= 80) return "text-emerald-200 border-emerald-300/16 bg-emerald-500/[0.08]"
  if (score >= 55) return "text-cyan-200 border-cyan-300/16 bg-cyan-500/[0.08]"
  if (score > 0) return "text-orange-200 border-orange-300/16 bg-orange-500/[0.08]"
  return "text-slate-300 border-slate-300/10 bg-slate-500/[0.06]"
}

const intensityLabel = (intensity?: string | null) => {
  if (intensity === "high") return "Alta constancia"
  if (intensity === "medium") return "Constancia media"
  if (intensity === "low") return "Inicio activo"
  return "Sin actividad"
}

const clampNumber = (value: number, min = 1, max = 10) => {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

export default function CuidadoPersonalPage() {
  const supabase = createClient()

  const today = getLocalDateString()
  const currentWeekStart = getCurrentWeekStartString()
  const currentWeekEnd = getCurrentWeekEndString()

  const [loading, setLoading] = useState(true)
  const [savingCheckin, setSavingCheckin] = useState(false)
  const [savingRoutine, setSavingRoutine] = useState(false)

  const [moodLevel, setMoodLevel] = useState(7)
  const [stressLevel, setStressLevel] = useState(5)
  const [motivationLevel, setMotivationLevel] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(7)

  const [reflection, setReflection] = useState("")
  const [gratitudeNote, setGratitudeNote] = useState("")
  const [improvementNote, setImprovementNote] = useState("")

  const [routines, setRoutines] = useState<PersonalCareRoutine[]>([])
  const [todayCompletions, setTodayCompletions] = useState<PersonalCareCompletion[]>([])
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPersonalCareSummary | null>(null)

  const [newRoutineName, setNewRoutineName] = useState("")
  const [newRoutineCategory, setNewRoutineCategory] = useState("bienestar")
  const [newRoutineDescription, setNewRoutineDescription] = useState("")

  const completedRoutineIds = useMemo(() => {
    return new Set(todayCompletions.filter((item) => item.completed).map((item) => item.routine_id))
  }, [todayCompletions])

  const activeRoutines = useMemo(() => routines.filter((routine) => routine.active), [routines])

  const todayRoutineCompletionPct =
    activeRoutines.length > 0 ? Math.round((completedRoutineIds.size / activeRoutines.length) * 100) : 0

  const fetchPersonalCareData = useCallback(async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const [
        { data: dailyLog, error: dailyLogError },
        { data: routinesData, error: routinesError },
        { data: completionsData, error: completionsError },
        { data: summaryData, error: summaryError },
      ] = await Promise.all([
        supabase
          .from("personal_care_daily_logs")
          .select(`
            mood_level,
            stress_level,
            motivation_level,
            sleep_quality,
            reflection,
            gratitude_note,
            improvement_note
          `)
          .eq("user_id", session.user.id)
          .eq("date", today)
          .maybeSingle(),

        supabase
          .from("personal_care_routines")
          .select(`
            id,
            user_id,
            name,
            category,
            description,
            active,
            created_at,
            updated_at
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true }),

        supabase
          .from("personal_care_routine_completions")
          .select(`
            id,
            routine_id,
            date,
            week_start,
            completed
          `)
          .eq("user_id", session.user.id)
          .eq("date", today),

        supabase
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
          .maybeSingle(),
      ])

      if (dailyLogError) console.error("Error cargando check-in de hoy:", dailyLogError)
      if (routinesError) console.error("Error cargando rutinas de cuidado personal:", routinesError)
      if (completionsError) console.error("Error cargando completados de hoy:", completionsError)
      if (summaryError) console.error("Error cargando resumen semanal de cuidado personal:", summaryError)

      if (dailyLog) {
        setMoodLevel(Number(dailyLog.mood_level || 7))
        setStressLevel(Number(dailyLog.stress_level || 5))
        setMotivationLevel(Number(dailyLog.motivation_level || 7))
        setSleepQuality(Number(dailyLog.sleep_quality || 7))
        setReflection(dailyLog.reflection || "")
        setGratitudeNote(dailyLog.gratitude_note || "")
        setImprovementNote(dailyLog.improvement_note || "")
      }

      setRoutines((routinesData || []) as PersonalCareRoutine[])
      setTodayCompletions((completionsData || []) as PersonalCareCompletion[])

      setWeeklySummary(summaryData ? {
        week_start: summaryData.week_start || null,
        week_end: summaryData.week_end || null,
        active_days: Number(summaryData.active_days || 0),
        checkin_days: Number(summaryData.checkin_days || 0),
        avg_mood_level: Number(summaryData.avg_mood_level || 0),
        avg_stress_level: Number(summaryData.avg_stress_level || 0),
        avg_motivation_level: Number(summaryData.avg_motivation_level || 0),
        avg_sleep_quality: Number(summaryData.avg_sleep_quality || 0),
        reflection_days: Number(summaryData.reflection_days || 0),
        gratitude_days: Number(summaryData.gratitude_days || 0),
        improvement_days: Number(summaryData.improvement_days || 0),
        active_routines: Number(summaryData.active_routines || 0),
        completed_routine_events: Number(summaryData.completed_routine_events || 0),
        routine_completed_days: Number(summaryData.routine_completed_days || 0),
        unique_routines_completed: Number(summaryData.unique_routines_completed || 0),
        routine_completion_percentage: Number(summaryData.routine_completion_percentage || 0),
        checkin_completion_percentage: Number(summaryData.checkin_completion_percentage || 0),
        personal_care_score: Number(summaryData.personal_care_score || 0),
        last_log_date: summaryData.last_log_date || null,
        last_mood_level: summaryData.last_mood_level !== null && summaryData.last_mood_level !== undefined ? Number(summaryData.last_mood_level) : null,
        last_stress_level: summaryData.last_stress_level !== null && summaryData.last_stress_level !== undefined ? Number(summaryData.last_stress_level) : null,
        last_motivation_level: summaryData.last_motivation_level !== null && summaryData.last_motivation_level !== undefined ? Number(summaryData.last_motivation_level) : null,
        last_sleep_quality: summaryData.last_sleep_quality !== null && summaryData.last_sleep_quality !== undefined ? Number(summaryData.last_sleep_quality) : null,
        last_reflection: summaryData.last_reflection || null,
        last_gratitude_note: summaryData.last_gratitude_note || null,
        last_improvement_note: summaryData.last_improvement_note || null,
        last_activity_at: summaryData.last_activity_at || null,
        care_intensity: summaryData.care_intensity || "none",
      } : null)
    } catch (error) {
      console.error("Error sincronizando cuidado personal:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, today, currentWeekStart])

  useEffect(() => {
    fetchPersonalCareData()
  }, [fetchPersonalCareData])

  const saveDailyCheckin = async () => {
    try {
      setSavingCheckin(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from("personal_care_daily_logs")
        .upsert(
          {
            user_id: session.user.id,
            date: today,
            mood_level: clampNumber(moodLevel),
            stress_level: clampNumber(stressLevel),
            motivation_level: clampNumber(motivationLevel),
            sleep_quality: clampNumber(sleepQuality),
            reflection: reflection.trim() || null,
            gratitude_note: gratitudeNote.trim() || null,
            improvement_note: improvementNote.trim() || null,
          },
          {
            onConflict: "user_id,date",
          }
        )

      if (error) throw error

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error guardando check-in diario:", error?.message || error)
      alert(`No se pudo guardar el check-in: ${error?.message || "Error desconocido"}`)
    } finally {
      setSavingCheckin(false)
    }
  }

  const createRoutine = async () => {
    try {
      if (!newRoutineName.trim()) {
        alert("Escribe el nombre de la rutina.")
        return
      }

      setSavingRoutine(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from("personal_care_routines")
        .insert({
          user_id: session.user.id,
          name: newRoutineName.trim(),
          category: newRoutineCategory,
          description: newRoutineDescription.trim() || null,
          active: true,
        })

      if (error) throw error

      setNewRoutineName("")
      setNewRoutineDescription("")
      setNewRoutineCategory("bienestar")

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error creando rutina:", error?.message || error)
      alert(`No se pudo crear la rutina: ${error?.message || "Error desconocido"}`)
    } finally {
      setSavingRoutine(false)
    }
  }

  const seedDefaultRoutines = async () => {
    try {
      setSavingRoutine(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      if (routines.length > 0) {
        alert("Ya tienes rutinas creadas. Puedes agregar más manualmente.")
        return
      }

      const { error } = await supabase
        .from("personal_care_routines")
        .insert(
          DEFAULT_ROUTINES.map((routine) => ({
            user_id: session.user.id,
            name: routine.name,
            category: routine.category,
            description: routine.description,
            active: true,
          }))
        )

      if (error) throw error

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error cargando rutinas sugeridas:", error?.message || error)
      alert(`No se pudieron crear las rutinas sugeridas: ${error?.message || "Error desconocido"}`)
    } finally {
      setSavingRoutine(false)
    }
  }

  const toggleRoutineCompletion = async (routine: PersonalCareRoutine) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const existing = todayCompletions.find((item) => item.routine_id === routine.id)

      if (existing) {
        if (existing.completed) {
          const { error } = await supabase
            .from("personal_care_routine_completions")
            .delete()
            .eq("id", existing.id)
            .eq("user_id", session.user.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from("personal_care_routine_completions")
            .update({ completed: true })
            .eq("id", existing.id)
            .eq("user_id", session.user.id)

          if (error) throw error
        }
      } else {
        const { error } = await supabase
          .from("personal_care_routine_completions")
          .insert({
            user_id: session.user.id,
            routine_id: routine.id,
            date: today,
            week_start: currentWeekStart,
            completed: true,
          })

        if (error) throw error
      }

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error actualizando cumplimiento de rutina:", error?.message || error)
      alert(`No se pudo actualizar la rutina: ${error?.message || "Error desconocido"}`)
    }
  }

  const toggleRoutineActive = async (routine: PersonalCareRoutine) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from("personal_care_routines")
        .update({ active: !routine.active })
        .eq("id", routine.id)
        .eq("user_id", session.user.id)

      if (error) throw error

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error cambiando estado de rutina:", error?.message || error)
      alert(`No se pudo actualizar la rutina: ${error?.message || "Error desconocido"}`)
    }
  }

  const deleteRoutine = async (routine: PersonalCareRoutine) => {
    try {
      const confirmed = confirm(`¿Eliminar la rutina "${routine.name}"?`)
      if (!confirmed) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from("personal_care_routines")
        .delete()
        .eq("id", routine.id)
        .eq("user_id", session.user.id)

      if (error) throw error

      await fetchPersonalCareData()
    } catch (error: any) {
      console.error("Error eliminando rutina:", error?.message || error)
      alert(`No se pudo eliminar la rutina: ${error?.message || "Error desconocido"}`)
    }
  }

  const sliderClass =
    "w-full accent-cyan-400 cursor-pointer"

  const personalScore = weeklySummary ? Math.min(Math.max(Math.round(weeklySummary.personal_care_score), 0), 100) : 0
  const summaryTone = scoreTone(personalScore)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040a] px-4 pb-14 pt-6 text-slate-100 antialiased md:px-8">
      <PersonalCareBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <Link href="/pilares" className="w-fit">
          <Button className="h-11 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-4 text-xs font-black uppercase tracking-widest text-slate-300 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white">
            <ArrowLeft size={15} />
            Volver a pilares
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.075] bg-[#070b14]/78 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_78%_0%,rgba(45,212,191,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_38%)]" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-300/35 to-transparent" />

          <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
            <div className="max-w-4xl space-y-4">
              <div className="flex w-fit items-center gap-2 rounded-full border border-purple-300/14 bg-purple-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.38em] text-purple-200">
                <HeartHandshake size={14} className="animate-pulse" />
                Pilar de bienestar personal
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
                  Cuidado <span className="bg-gradient-to-r from-purple-200 via-cyan-200 to-orange-200 bg-clip-text text-transparent">Personal</span>
                </h1>
                <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Registra cómo te sientes, cuida tus rutinas personales y convierte el autocuidado en una métrica semanal clara y accionable.
                </p>
              </div>
            </div>

            <div className={`rounded-[1.6rem] border px-6 py-5 text-right ${summaryTone}`}>
              <p className="text-5xl font-black tracking-tight">{loading ? "..." : `${personalScore}%`}</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
                score semanal
              </p>
              <p className="mt-2 text-xs font-bold text-slate-400">
                {intensityLabel(weeklySummary?.care_intensity)}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <Card className="relative overflow-hidden rounded-[2rem] border border-purple-300/[0.10] bg-white/[0.05] shadow-[0_24px_76px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                    <NotebookPen size={18} />
                  </span>
                  Check-in diario
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  No es un diagnóstico. Es una bitácora personal para reconocer patrones de ánimo, estrés, descanso y motivación.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      label: "Ánimo",
                      value: moodLevel,
                      setter: setMoodLevel,
                      icon: SmilePlus,
                      helper: "Cómo te sentiste hoy",
                      accent: "text-emerald-300",
                    },
                    {
                      label: "Estrés",
                      value: stressLevel,
                      setter: setStressLevel,
                      icon: Flame,
                      helper: "Qué tan cargado estuvo el día",
                      accent: "text-orange-300",
                    },
                    {
                      label: "Motivación",
                      value: motivationLevel,
                      setter: setMotivationLevel,
                      icon: BatteryCharging,
                      helper: "Ganas de avanzar y hacer cosas",
                      accent: "text-cyan-300",
                    },
                    {
                      label: "Sueño",
                      value: sleepQuality,
                      setter: setSleepQuality,
                      icon: Moon,
                      helper: "Calidad percibida del descanso",
                      accent: "text-purple-300",
                    },
                  ].map((metric) => {
                    const Icon = metric.icon

                    return (
                      <div key={metric.label} className="rounded-[1.4rem] border border-white/[0.06] bg-slate-950/38 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] ${metric.accent}`}>
                              <Icon size={16} />
                            </span>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{metric.label}</p>
                              <p className="text-xs font-medium text-slate-600">{metric.helper}</p>
                            </div>
                          </div>
                          <p className={`text-2xl font-black ${metric.accent}`}>{metric.value}/10</p>
                        </div>

                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={metric.value}
                          onChange={(event) => metric.setter(Number(event.target.value))}
                          className={sliderClass}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Reflexión del día
                    </label>
                    <textarea
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="¿Cómo te sentiste hoy? ¿Qué pasó?"
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/45 p-4 text-sm font-medium text-slate-200 outline-none transition focus:border-purple-300/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Algo que agradeces
                    </label>
                    <textarea
                      value={gratitudeNote}
                      onChange={(event) => setGratitudeNote(event.target.value)}
                      placeholder="Hoy agradezco..."
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/45 p-4 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-300/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Mejora para mañana
                    </label>
                    <textarea
                      value={improvementNote}
                      onChange={(event) => setImprovementNote(event.target.value)}
                      placeholder="Mañana puedo mejorar en..."
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/45 p-4 text-sm font-medium text-slate-200 outline-none transition focus:border-orange-300/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveDailyCheckin}
                    disabled={savingCheckin}
                    className="h-12 rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.13] px-6 text-xs font-black uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-500/[0.20] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {savingCheckin ? "Guardando..." : "Guardar check-in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.10 }}
          >
            <Card className="relative h-full overflow-hidden rounded-[2rem] border border-cyan-300/[0.10] bg-white/[0.05] shadow-[0_24px_76px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                    <Activity size={18} />
                  </span>
                  Resumen semanal
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  Semana {currentWeekStart} al {currentWeekEnd}.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Check-ins",
                      value: weeklySummary ? `${weeklySummary.checkin_days}/7` : "0/7",
                      helper: `${weeklySummary?.checkin_completion_percentage || 0}% semana`,
                      icon: CalendarCheck2,
                    },
                    {
                      label: "Rutinas",
                      value: weeklySummary ? `${weeklySummary.completed_routine_events}` : "0",
                      helper: `${weeklySummary?.routine_completion_percentage || 0}% cumplimiento`,
                      icon: CheckCircle2,
                    },
                    {
                      label: "Ánimo prom.",
                      value: weeklySummary && weeklySummary.avg_mood_level > 0 ? `${weeklySummary.avg_mood_level.toFixed(1)}/10` : "—",
                      helper: "Promedio semanal",
                      icon: SmilePlus,
                    },
                    {
                      label: "Estrés prom.",
                      value: weeklySummary && weeklySummary.avg_stress_level > 0 ? `${weeklySummary.avg_stress_level.toFixed(1)}/10` : "—",
                      helper: "Mientras menor, mejor",
                      icon: Flame,
                    },
                  ].map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.label} className="rounded-[1.35rem] border border-white/[0.06] bg-slate-950/38 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <Icon size={16} className="text-cyan-300" />
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.04] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500">
                            semana
                          </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                        <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
                        <p className="mt-1 text-xs font-medium text-slate-600">{item.helper}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/32 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-purple-300" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklySummary
                      ? weeklySummary.checkin_days > 0 || weeklySummary.completed_routine_events > 0
                        ? `Esta semana tienes ${weeklySummary.checkin_days} check-ins y ${weeklySummary.completed_routine_events} rutinas completadas. Intensidad: ${intensityLabel(weeklySummary.care_intensity).toLowerCase()}.`
                        : "Aún no hay actividad de cuidado personal esta semana. Empieza con un check-in y una rutina simple."
                      : "Todavía no hay resumen semanal. Guarda tu primer check-in o crea tus rutinas de cuidado personal."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-slate-950/32 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Cumplimiento de hoy
                  </p>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${todayRoutineCompletionPct}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-300 shadow-[0_0_18px_rgba(45,212,191,0.32)]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {completedRoutineIds.size}/{activeRoutines.length} rutinas activas completadas hoy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            <Card className="relative overflow-hidden rounded-[2rem] border border-orange-300/[0.10] bg-white/[0.05] shadow-[0_24px_76px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                    <Plus size={18} />
                  </span>
                  Crear rutina
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  Define acciones simples que quieras sostener diariamente.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre</label>
                  <input
                    value={newRoutineName}
                    onChange={(event) => setNewRoutineName(event.target.value)}
                    placeholder="Ejemplo: protector solar"
                    className="h-12 w-full rounded-2xl border border-white/[0.07] bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-orange-300/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(event) => setNewRoutineCategory(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/[0.07] bg-slate-950/45 px-4 text-sm font-bold text-white outline-none transition focus:border-orange-300/30"
                  >
                    <option value="bienestar">Bienestar</option>
                    <option value="skincare">Skincare</option>
                    <option value="presentación">Presentación</option>
                    <option value="entorno">Entorno</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descripción</label>
                  <textarea
                    value={newRoutineDescription}
                    onChange={(event) => setNewRoutineDescription(event.target.value)}
                    placeholder="Describe cuándo o cómo quieres realizarla."
                    className="min-h-[110px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/45 p-4 text-sm font-medium text-slate-200 outline-none transition focus:border-orange-300/30"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={createRoutine}
                    disabled={savingRoutine}
                    className="h-12 rounded-2xl border border-orange-300/10 bg-orange-500/[0.13] px-5 text-xs font-black uppercase tracking-widest text-orange-100 transition hover:bg-orange-500/[0.20] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {savingRoutine ? "Guardando..." : "Crear rutina"}
                  </Button>

                  <Button
                    onClick={seedDefaultRoutines}
                    disabled={savingRoutine || routines.length > 0}
                    className="h-12 rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.11] px-5 text-xs font-black uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-500/[0.18] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Sparkles size={16} />
                    Sugeridas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <Card className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.05] shadow-[0_24px_76px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.10),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                    <Target size={18} />
                  </span>
                  Rutinas de hoy
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">
                  Marca solo lo que realmente cumpliste hoy. Mañana empieza una nueva fecha.
                </p>
              </CardHeader>

              <CardContent className="relative">
                {loading ? (
                  <div className="flex min-h-[250px] items-center justify-center">
                    <RefreshCw className="animate-spin text-cyan-300" size={28} />
                  </div>
                ) : routines.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/[0.07] bg-slate-950/35 p-8 text-center">
                    <Sparkles className="mx-auto mb-3 text-purple-300" size={30} />
                    <p className="text-sm font-black uppercase tracking-widest text-white">Aún no tienes rutinas</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                      Crea una rutina manualmente o carga las rutinas sugeridas para iniciar.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {routines.map((routine) => {
                      const style = categoryStyles[routine.category] || categoryStyles.general
                      const Icon = style.icon
                      const completed = completedRoutineIds.has(routine.id)

                      return (
                        <div
                          key={routine.id}
                          className={`relative overflow-hidden rounded-[1.35rem] border p-4 transition-all ${
                            routine.active
                              ? completed
                                ? "border-emerald-300/20 bg-emerald-500/[0.08]"
                                : "border-white/[0.065] bg-slate-950/34"
                              : "border-white/[0.04] bg-slate-950/20 opacity-55"
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <button
                                type="button"
                                onClick={() => routine.active && toggleRoutineCompletion(routine)}
                                disabled={!routine.active}
                                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition ${
                                  completed
                                    ? "border-emerald-300/20 bg-emerald-500/[0.12] text-emerald-200"
                                    : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-cyan-200"
                                } disabled:cursor-not-allowed`}
                              >
                                {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-black text-white">{routine.name}</p>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${style.className}`}>
                                    <Icon size={11} />
                                    {style.label}
                                  </span>
                                  {!routine.active && (
                                    <span className="rounded-full border border-slate-300/10 bg-slate-500/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                      inactiva
                                    </span>
                                  )}
                                </div>

                                {routine.description && (
                                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                    {routine.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                onClick={() => toggleRoutineActive(routine)}
                                className="h-9 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/[0.08]"
                              >
                                {routine.active ? "Pausar" : "Activar"}
                              </Button>

                              <Button
                                onClick={() => deleteRoutine(routine)}
                                className="h-9 rounded-xl border border-red-300/10 bg-red-500/[0.08] px-3 text-red-200 hover:bg-red-500/[0.14]"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
