"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import {
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
  type LucideIcon,
} from "lucide-react"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import { getErrorMessage } from "@/lib/errors"

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

const categoryStyles: Record<string, { label: string; icon: LucideIcon; className: string }> = {
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
  const lightningCore =
    "absolute h-[3px] rounded-full bg-gradient-to-r from-transparent via-purple-200 to-transparent shadow-[0_0_18px_rgba(216,180,254,0.75),0_0_42px_rgba(168,85,247,0.42)]"

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02040a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(168,85,247,0.38),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(217,70,239,0.22),transparent_30%),radial-gradient(circle_at_45%_82%,rgba(99,102,241,0.20),transparent_34%),linear-gradient(135deg,#02040a_0%,#08051a_44%,#030305_100%)]" />

      <motion.div
        animate={{ opacity: [0.22, 0.46, 0.26, 0.22], x: [0, 22, -14, 0], y: [0, -10, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(216,180,254,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_72%_24%,rgba(168,85,247,0.34)_0_1px,transparent_2px),radial-gradient(circle_at_52%_74%,rgba(192,132,252,0.28)_0_1px,transparent_2px),radial-gradient(circle_at_88%_68%,rgba(240,171,252,0.22)_0_1px,transparent_2px)] bg-[size:46px_46px]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(216,180,254,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(216,180,254,0.038)_1px,transparent_1px)] bg-[size:86px_86px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <motion.div
        animate={{ x: ["-22%", "16%", "-22%"], opacity: [0.12, 0.42, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[16%] h-[2px] w-[82%] rotate-[-12deg] bg-gradient-to-r from-transparent via-purple-300/70 to-transparent shadow-[0_0_24px_rgba(192,132,252,0.45)] blur-[0.6px]"
      />

      <motion.div
        animate={{ x: ["18%", "-14%", "18%"], opacity: [0.10, 0.34, 0.10] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[24%] right-0 h-[2px] w-[74%] rotate-[14deg] bg-gradient-to-r from-transparent via-fuchsia-300/60 to-transparent shadow-[0_0_24px_rgba(217,70,239,0.38)] blur-[0.6px]"
      />

      {/* Relámpagos morados: hechos con divs animados, sin librerías externas */}
      <motion.div
        animate={{ opacity: [0, 0, 0.95, 0.18, 0.78, 0], scaleX: [0.75, 0.75, 1.04, 0.92, 1.08, 0.75] }}
        transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        className="absolute left-[9%] top-[33%] h-[150px] w-[240px]"
      >
        <div className={`${lightningCore} left-0 top-0 w-[92px] rotate-[28deg]`} />
        <div className={`${lightningCore} left-[74px] top-[43px] w-[86px] rotate-[-48deg]`} />
        <div className={`${lightningCore} left-[126px] top-[82px] w-[110px] rotate-[25deg]`} />
        <div className="absolute left-[112px] top-[56px] h-2 w-2 rounded-full bg-purple-100 shadow-[0_0_28px_rgba(216,180,254,0.95)]" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0, 0.82, 0.08, 0.72, 0], scaleX: [0.85, 1.05, 0.90, 1.12, 0.85] }}
        transition={{ duration: 5.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut", delay: 1.2 }}
        className="absolute right-[8%] top-[22%] h-[170px] w-[270px]"
      >
        <div className={`${lightningCore} right-[140px] top-[18px] w-[120px] rotate-[-24deg]`} />
        <div className={`${lightningCore} right-[74px] top-[54px] w-[94px] rotate-[45deg]`} />
        <div className={`${lightningCore} right-[18px] top-[100px] w-[126px] rotate-[-22deg]`} />
        <div className="absolute right-[106px] top-[73px] h-2 w-2 rounded-full bg-fuchsia-100 shadow-[0_0_30px_rgba(240,171,252,0.95)]" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0, 0, 0.64, 0.10, 0.58, 0], scaleX: [0.80, 0.80, 1.10, 0.92, 1.04, 0.80] }}
        transition={{ duration: 6.4, repeat: Infinity, repeatDelay: 4.2, ease: "easeInOut", delay: 2.1 }}
        className="absolute bottom-[18%] left-[34%] h-[130px] w-[280px]"
      >
        <div className={`${lightningCore} left-[8px] top-[22px] w-[122px] rotate-[10deg]`} />
        <div className={`${lightningCore} left-[110px] top-[50px] w-[84px] rotate-[-42deg]`} />
        <div className={`${lightningCore} left-[168px] top-[84px] w-[94px] rotate-[18deg]`} />
      </motion.div>

      <motion.div
        animate={{ x: [0, 36, -24, 0], y: [0, -22, 24, 0], scale: [1, 1.12, 0.98, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] top-[14%] h-[34rem] w-[34rem] rounded-full bg-purple-500/[0.18] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -28, 24, 0], y: [0, 22, -18, 0], scale: [1, 0.96, 1.10, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/[0.11] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, -18, 0], y: [0, -16, 16, 0], opacity: [0.10, 0.24, 0.12, 0.10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[36%] h-[24rem] w-[24rem] rounded-full bg-indigo-500/[0.12] blur-3xl"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(2,4,10,0.48)_100%)]" />
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
    let isActive = true

    queueMicrotask(() => {
      if (isActive) {
        fetchPersonalCareData()
      }
    })

    return () => {
      isActive = false
    }
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error guardando check-in diario:", message)
      alert(`No se pudo guardar el check-in: ${message}`)
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error creando rutina:", message)
      alert(`No se pudo crear la rutina: ${message}`)
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error cargando rutinas sugeridas:", message)
      alert(`No se pudieron crear las rutinas sugeridas: ${message}`)
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error actualizando cumplimiento de rutina:", message)
      alert(`No se pudo actualizar la rutina: ${message}`)
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error cambiando estado de rutina:", message)
      alert(`No se pudo actualizar la rutina: ${message}`)
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      console.error("Error eliminando rutina:", message)
      alert(`No se pudo eliminar la rutina: ${message}`)
    }
  }

  const sliderClass =
    "w-full cursor-pointer accent-cyan-400 transition-all"

  const personalScore = weeklySummary ? Math.min(Math.max(Math.round(weeklySummary.personal_care_score), 0), 100) : 0
  const summaryTone = scoreTone(personalScore)

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent px-4 pb-14 pt-6 text-slate-100 antialiased md:px-8 [overflow-wrap:anywhere]" style={{ fontFamily: "'Poppins', 'Nunito Sans', 'Inter', 'Manrope', system-ui, sans-serif" }}>
      <PersonalCareBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <Link href="/pilares" className="w-fit">
          <Button className="h-9 rounded-full border border-white/[0.08] bg-black/24 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-purple-300/18 hover:bg-purple-500/[0.08] hover:text-purple-100 active:scale-[0.98]">
            <ArrowLeft size={13} />
            <span>[ Volver a pilares ]</span>
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.2rem] border border-purple-300/[0.11] bg-[linear-gradient(135deg,rgba(18,12,27,0.92),rgba(6,11,20,0.76))] p-6 shadow-[0_30px_88px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_78%_0%,rgba(45,212,191,0.12),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(249,115,22,0.07),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_38%)]" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-300/35 to-transparent" />

          <div className="relative flex min-w-0 flex-col justify-between gap-8 xl:flex-row xl:items-end">
            <div className="min-w-0 max-w-4xl space-y-4">
              <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-purple-300/16 bg-purple-500/[0.10] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-200 shadow-[0_10px_28px_rgba(168,85,247,0.08)]">
                <HeartHandshake size={14} className="shrink-0 animate-pulse" />
                <span className="truncate">Pilar de bienestar personal</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.065em] text-white md:text-7xl">
                  Cuidado <span className="bg-gradient-to-r from-purple-200 via-cyan-200 to-orange-200 bg-clip-text text-transparent">Personal</span>
                </h1>
                <p className="max-w-3xl break-words text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Registra cómo te sientes, cuida tus rutinas personales y convierte el autocuidado en una métrica semanal clara y accionable.
                </p>
              </div>
            </div>

            <div className={`min-w-0 rounded-[1.6rem] border px-6 py-5 text-right shadow-[0_18px_46px_rgba(0,0,0,0.18)] backdrop-blur-xl ${summaryTone}`}>
              <p className="text-5xl font-extrabold tracking-[-0.035em]">{loading ? "..." : `${personalScore}%`}</p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
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
            <Card className="relative overflow-hidden rounded-[2rem] border border-purple-300/[0.12] bg-[linear-gradient(135deg,rgba(18,12,27,0.82),rgba(8,11,20,0.62))] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                    <NotebookPen size={18} />
                  </span>
                  Check-in diario
                </CardTitle>
                <p className="break-words text-xs font-medium text-slate-500">
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
                      <div key={metric.label} className="min-w-0 rounded-[1.4rem] border border-white/[0.065] bg-slate-950/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] ${metric.accent}`}>
                              <Icon size={16} />
                            </span>
                            <div>
                              <p className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                              <p className="text-xs font-medium text-slate-600">{metric.helper}</p>
                            </div>
                          </div>
                          <p className={`text-2xl font-extrabold ${metric.accent}`}>{metric.value}/10</p>
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
                    <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Reflexión del día
                    </label>
                    <textarea
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="¿Cómo te sentiste hoy? ¿Qué pasó?"
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/42 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-purple-300/35 focus:bg-slate-950/55"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Algo que agradeces
                    </label>
                    <textarea
                      value={gratitudeNote}
                      onChange={(event) => setGratitudeNote(event.target.value)}
                      placeholder="Hoy agradezco..."
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/42 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-cyan-300/35 focus:bg-slate-950/55"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Mejora para mañana
                    </label>
                    <textarea
                      value={improvementNote}
                      onChange={(event) => setImprovementNote(event.target.value)}
                      placeholder="Mañana puedo mejorar en..."
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/42 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-slate-950/55"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveDailyCheckin}
                    disabled={savingCheckin}
                    className="h-12 rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.13] px-6 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/[0.20] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
            <Card className="relative h-full overflow-hidden rounded-[2rem] border border-cyan-300/[0.12] bg-[linear-gradient(135deg,rgba(10,24,30,0.78),rgba(8,11,20,0.62))] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                    <Activity size={18} />
                  </span>
                  Resumen semanal
                </CardTitle>
                <p className="break-words text-xs font-medium text-slate-500">
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
                      <div key={item.label} className="min-w-0 rounded-[1.35rem] border border-white/[0.065] bg-slate-950/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                        <div className="mb-3 flex items-center justify-between">
                          <Icon size={16} className="text-cyan-300" />
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.04] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500">
                            semana
                          </span>
                        </div>
                        <p className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                        <p className="mt-1 text-2xl font-extrabold text-white">{item.value}</p>
                        <p className="mt-1 break-words text-xs font-medium text-slate-600">{item.helper}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="min-w-0 rounded-[1.5rem] border border-white/[0.065] bg-slate-950/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-purple-300" />
                  </div>
                  <p className="break-words text-sm font-semibold leading-relaxed text-slate-400">
                    {weeklySummary
                      ? weeklySummary.checkin_days > 0 || weeklySummary.completed_routine_events > 0
                        ? `Esta semana tienes ${weeklySummary.checkin_days} check-ins y ${weeklySummary.completed_routine_events} rutinas completadas. Intensidad: ${intensityLabel(weeklySummary.care_intensity).toLowerCase()}.`
                        : "Aún no hay actividad de cuidado personal esta semana. Empieza con un check-in y una rutina simple."
                      : "Todavía no hay resumen semanal. Guarda tu primer check-in o crea tus rutinas de cuidado personal."}
                  </p>
                </div>

                <div className="min-w-0 rounded-[1.5rem] border border-white/[0.065] bg-slate-950/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.10em] text-slate-500">
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
                  <p className="mt-3 break-words text-xs font-medium text-slate-500">
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
            <Card className="relative overflow-hidden rounded-[2rem] border border-orange-300/[0.12] bg-[linear-gradient(135deg,rgba(35,18,10,0.78),rgba(8,11,20,0.62))] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.12),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                    <Plus size={18} />
                  </span>
                  Crear rutina
                </CardTitle>
                <p className="break-words text-xs font-medium text-slate-500">
                  Define acciones simples que quieras sostener diariamente.
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="space-y-2">
                  <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Nombre</label>
                  <input
                    value={newRoutineName}
                    onChange={(event) => setNewRoutineName(event.target.value)}
                    placeholder="Ejemplo: protector solar"
                    className="h-12 w-full rounded-2xl border border-white/[0.07] bg-slate-950/42 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-slate-950/55"
                  />
                </div>

                <div className="space-y-2">
                  <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Categoría</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(event) => setNewRoutineCategory(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/[0.07] bg-slate-950/42 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-slate-950/55"
                  >
                    <option value="bienestar">Bienestar</option>
                    <option value="skincare">Skincare</option>
                    <option value="presentación">Presentación</option>
                    <option value="entorno">Entorno</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Descripción</label>
                  <textarea
                    value={newRoutineDescription}
                    onChange={(event) => setNewRoutineDescription(event.target.value)}
                    placeholder="Describe cuándo o cómo quieres realizarla."
                    className="min-h-[110px] w-full resize-none rounded-2xl border border-white/[0.07] bg-slate-950/42 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-slate-950/55"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={createRoutine}
                    disabled={savingRoutine}
                    className="h-12 rounded-2xl border border-orange-300/10 bg-orange-500/[0.13] px-5 text-xs font-bold uppercase tracking-[0.08em] text-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-500/[0.20] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {savingRoutine ? "Guardando..." : "Crear rutina"}
                  </Button>

                  <Button
                    onClick={seedDefaultRoutines}
                    disabled={savingRoutine || routines.length > 0}
                    className="h-12 rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.11] px-5 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/[0.18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
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
            <Card className="relative overflow-hidden rounded-[2rem] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(15,23,42,0.72),rgba(8,11,20,0.62))] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.10),transparent_32%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                    <Target size={18} />
                  </span>
                  Rutinas de hoy
                </CardTitle>
                <p className="break-words text-xs font-medium text-slate-500">
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
                    <p className="text-sm font-extrabold uppercase tracking-[0.10em] text-white">Aún no tienes rutinas</p>
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
                          className={`relative overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_12px_34px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 ${
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
                                  <p className="break-words text-sm font-extrabold text-white">{routine.name}</p>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${style.className}`}>
                                    <Icon size={11} />
                                    {style.label}
                                  </span>
                                  {!routine.active && (
                                    <span className="rounded-full border border-slate-300/10 bg-slate-500/[0.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                      inactiva
                                    </span>
                                  )}
                                </div>

                                {routine.description && (
                                  <p className="mt-1 break-words text-xs font-medium leading-relaxed text-slate-500">
                                    {routine.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                onClick={() => toggleRoutineActive(routine)}
                                className="h-9 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-300 hover:bg-white/[0.08]"
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
