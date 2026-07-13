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
  Target,
  RefreshCw,
  CalendarCheck2,
  NotebookPen,
  BatteryCharging,
  Activity,
  ArrowLeft,
} from "lucide-react"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import { getErrorMessage } from "@/lib/errors"
import { PersonalCareBackground } from "@/components/personal-care/personal-care-background"
import { CheckinMetricCard, WeeklySummaryMetricCard } from "@/components/personal-care/personal-care-metric-cards"
import { fetchPersonalCareOverview } from "@/lib/personal-care-service"
import {
  DEFAULT_ROUTINES,
  categoryStyles,
  clampNumber,
  getPersonalCareDailyMetrics,
  intensityLabel,
} from "@/lib/personal-care-page-helpers"
import type { PersonalCareCompletion, PersonalCareRoutine, WeeklyPersonalCareSummary } from "@/lib/personal-care-page-models"

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

  const personalCareDailyMetrics = useMemo(
    () => getPersonalCareDailyMetrics(routines, todayCompletions, weeklySummary),
    [routines, todayCompletions, weeklySummary]
  )
  const completedRoutineIds = personalCareDailyMetrics.completedRoutineIds
  const activeRoutines = personalCareDailyMetrics.activeRoutines
  const todayRoutineCompletionPct = personalCareDailyMetrics.todayRoutineCompletionPct

  const fetchPersonalCareData = useCallback(async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const overview = await fetchPersonalCareOverview(supabase, session.user.id, today, currentWeekStart)

      if (overview.errors.dailyLog) console.error("Error cargando check-in de hoy:", overview.errors.dailyLog)
      if (overview.errors.routines) console.error("Error cargando rutinas de cuidado personal:", overview.errors.routines)
      if (overview.errors.completions) console.error("Error cargando completados de hoy:", overview.errors.completions)
      if (overview.errors.summary) console.error("Error cargando resumen semanal de cuidado personal:", overview.errors.summary)

      if (overview.dailyLog) {
        setMoodLevel(overview.dailyLog.mood_level)
        setStressLevel(overview.dailyLog.stress_level)
        setMotivationLevel(overview.dailyLog.motivation_level)
        setSleepQuality(overview.dailyLog.sleep_quality)
        setReflection(overview.dailyLog.reflection || "")
        setGratitudeNote(overview.dailyLog.gratitude_note || "")
        setImprovementNote(overview.dailyLog.improvement_note || "")
      }

      setRoutines(overview.routines)
      setTodayCompletions(overview.completions)
      setWeeklySummary(overview.weeklySummary)
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

  const personalScore = personalCareDailyMetrics.personalScore
  const summaryTone = personalCareDailyMetrics.summaryTone

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111419] px-4 pb-14 pt-6 text-slate-100 antialiased md:px-8 [overflow-wrap:anywhere]" style={{ fontFamily: "'Poppins', 'Nunito Sans', 'Inter', 'Manrope', system-ui, sans-serif" }}>
      <PersonalCareBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1540px] flex-col gap-6">
        <Link href="/pilares" className="w-fit">
          <Button className="h-9 rounded-full border border-white/[0.055] bg-white/[0.035] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-200/16 hover:bg-white/[0.055] hover:text-cyan-100 active:scale-[0.98]">
            <ArrowLeft size={13} />
            <span>[ Volver a pilares ]</span>
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.035] bg-[linear-gradient(118deg,rgba(17,20,25,0.96),rgba(18,21,27,0.94)_58%,rgba(38,27,55,0.90)_100%)] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(124,58,237,0.20),transparent_25%),radial-gradient(circle_at_88%_12%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_72%_92%,rgba(168,85,247,0.12),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(88,54,235,0.10),transparent_38%,rgba(34,211,238,0.06))]" />

          <div className="relative grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div className="min-w-0 max-w-4xl space-y-4">
              <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-cyan-100/18 bg-white/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-50 shadow-[0_14px_42px_rgba(8,47,73,0.18)] backdrop-blur-md">
                <HeartHandshake size={14} className="shrink-0 animate-pulse" />
                <span className="truncate">Pilar de bienestar personal</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-balance text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] text-white drop-shadow-[0_22px_55px_rgba(15,23,42,0.30)] md:text-7xl">
                  Cuidado <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">Personal</span>
                </h1>
                <p className="max-w-3xl break-words text-sm font-medium leading-7 text-slate-400/95 md:text-base">
                  Registra cómo te sientes, cuida tus rutinas personales y convierte el autocuidado en una métrica semanal clara y accionable.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.05rem] border border-white/[0.055] bg-white/[0.035] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Check-ins</p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">{weeklySummary ? `${weeklySummary.checkin_days}/7` : "0/7"}</p>
                </div>
                <div className="rounded-[1.05rem] border border-white/[0.055] bg-white/[0.035] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Rutinas hoy</p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">{completedRoutineIds.size}/{activeRoutines.length}</p>
                </div>
                <div className="rounded-[1.05rem] border border-white/[0.055] bg-white/[0.035] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Intensidad</p>
                  <p className="mt-2 text-lg font-black tracking-[-0.03em] text-white">{intensityLabel(weeklySummary?.care_intensity)}</p>
                </div>
              </div>
            </div>

            <div className={`min-w-0 rounded-[1.05rem] border px-6 py-5 shadow-[0_18px_46px_rgba(0,0,0,0.18)] backdrop-blur-xl ${summaryTone}`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Score semanal</p>
              <p className="mt-3 text-6xl font-black tracking-[-0.045em]">{loading ? "..." : `${personalScore}%`}</p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                progreso de autocuidado
              </p>
              <p className="mt-2 text-xs font-bold text-slate-400">
                {intensityLabel(weeklySummary?.care_intensity)}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <Card className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.045] bg-[linear-gradient(118deg,rgba(17,20,25,0.92),rgba(18,21,27,0.86)_58%,rgba(38,27,55,0.72)_100%)] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.14),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.08),transparent_28%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
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
                  ].map((metric) => (
                    <CheckinMetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      helper={metric.helper}
                      Icon={metric.icon}
                      accent={metric.accent}
                      sliderClassName={sliderClass}
                      onChange={metric.setter}
                    />
                  ))}
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
                      className="min-h-[140px] w-full resize-none rounded-lg border border-white/[0.07] bg-[#1d2027]/70 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-purple-300/35 focus:bg-[#1d2027]/90"
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
                      className="min-h-[140px] w-full resize-none rounded-lg border border-white/[0.07] bg-[#1d2027]/70 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-cyan-300/35 focus:bg-[#1d2027]/90"
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
                      className="min-h-[140px] w-full resize-none rounded-lg border border-white/[0.07] bg-[#1d2027]/70 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-[#1d2027]/90"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveDailyCheckin}
                    disabled={savingCheckin}
                    className="h-12 rounded-lg border-0 bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 px-6 text-xs font-black uppercase tracking-[0.08em] text-white shadow-[0_18px_42px_rgba(37,99,235,0.30)] transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-cyan-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
            <Card className="relative h-full overflow-hidden rounded-[1.15rem] border border-white/[0.045] bg-[linear-gradient(118deg,rgba(17,20,25,0.90),rgba(16,28,34,0.78)_58%,rgba(18,21,27,0.76)_100%)] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl xl:sticky xl:top-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.14),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(124,58,237,0.10),transparent_30%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
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
                  ].map((item) => (
                    <WeeklySummaryMetricCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      helper={item.helper}
                      Icon={item.icon}
                    />
                  ))}
                </div>

                <div className="min-w-0 rounded-[1.05rem] border border-white/[0.055] bg-white/[0.035] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]">
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

                <div className="min-w-0 rounded-[1.05rem] border border-white/[0.055] bg-white/[0.035] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]">
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

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            <Card className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.045] bg-[linear-gradient(118deg,rgba(17,20,25,0.90),rgba(35,22,18,0.76)_58%,rgba(18,21,27,0.76)_100%)] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.13),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(34,211,238,0.07),transparent_28%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
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
                    className="h-12 w-full rounded-lg border border-white/[0.07] bg-[#1d2027]/70 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-[#1d2027]/90"
                  />
                </div>

                <div className="space-y-2">
                  <label className="break-words text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Categoría</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(event) => setNewRoutineCategory(event.target.value)}
                    className="h-12 w-full rounded-lg border border-white/[0.07] bg-[#1d2027]/70 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-[#1d2027]/90"
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
                    className="min-h-[110px] w-full resize-none rounded-lg border border-white/[0.07] bg-[#1d2027]/70 p-4 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] outline-none transition focus:border-orange-300/35 focus:bg-[#1d2027]/90"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={createRoutine}
                    disabled={savingRoutine}
                    className="h-12 rounded-lg border border-orange-300/10 bg-orange-500/[0.13] px-5 text-xs font-bold uppercase tracking-[0.08em] text-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-500/[0.20] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {savingRoutine ? "Guardando..." : "Crear rutina"}
                  </Button>

                  <Button
                    onClick={seedDefaultRoutines}
                    disabled={savingRoutine || routines.length > 0}
                    className="h-12 rounded-lg border border-cyan-300/10 bg-cyan-500/[0.11] px-5 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/[0.18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
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
            <Card className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.045] bg-[linear-gradient(118deg,rgba(17,20,25,0.90),rgba(18,21,27,0.82)_58%,rgba(22,32,40,0.70)_100%)] shadow-[0_24px_76px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.12),transparent_32%),radial-gradient(circle_at_10%_0%,rgba(124,58,237,0.09),transparent_28%)]" />

              <CardHeader className="relative">
                <CardTitle className="flex min-w-0 items-center gap-2 break-words text-xl font-extrabold tracking-[-0.045em] text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
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
                  <div className="rounded-[1.05rem] border border-dashed border-white/[0.07] bg-white/[0.035] p-8 text-center">
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
                          className={`relative overflow-hidden rounded-[1.05rem] border p-4 shadow-[0_12px_34px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 ${
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
                                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
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
