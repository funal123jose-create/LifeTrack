"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { PersonalCareCommandCenter } from "@/components/personal-care/personal-care-command-center"
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  Moon,
  SmilePlus,
  HeartHandshake,
  Flame,
  Target,
  RefreshCw,
  CalendarCheck2,
  NotebookPen,
  BatteryCharging,
  Activity,
} from "lucide-react"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import { getErrorMessage } from "@/lib/errors"
import { CheckinMetricCard, WeeklySummaryMetricCard } from "@/components/personal-care/personal-care-metric-cards"
import { fetchPersonalCareOverview } from "@/lib/personal-care-service"
import { fetchPersonalCareHistory } from "@/lib/personal-care-service"
import { carePeriodBounds, type CareLog, type CarePeriod } from "@/lib/personal-care-analytics"
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
  const [historyLogs, setHistoryLogs] = useState<CareLog[]>([])
  const [historyCompletions, setHistoryCompletions] = useState<PersonalCareCompletion[]>([])
  const [historyError, setHistoryError] = useState(false)
  const [carePeriod, setCarePeriod] = useState<CarePeriod>({ kind: "week", anchor: today })
  const [careView, setCareView] = useState<"overview" | "manage">("overview")

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

      const bounds = carePeriodBounds(carePeriod)
      const [overviewResult, historyResult] = await Promise.allSettled([
        fetchPersonalCareOverview(supabase, session.user.id, today, currentWeekStart),
        fetchPersonalCareHistory(supabase, session.user.id, bounds.start, bounds.end),
      ])
      if (overviewResult.status === "rejected") throw overviewResult.reason
      const overview = overviewResult.value
      setHistoryError(historyResult.status === "rejected")
      if (historyResult.status === "rejected") console.error("Error cargando historial de cuidado personal:", historyResult.reason)

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
      setHistoryLogs(historyResult.status === "fulfilled" ? historyResult.value.logs : [])
      setHistoryCompletions(historyResult.status === "fulfilled" ? historyResult.value.completions : [])
    } catch (error) {
      console.error("Error sincronizando cuidado personal:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, today, currentWeekStart, carePeriod])

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
    "w-full cursor-pointer accent-violet-400 transition-all"

  return (
    <div className={`lifetrack-redesign care-page ${careView === "manage" ? "care-manage" : ""} relative min-h-screen overflow-hidden bg-transparent px-2 pb-14 pt-2 font-sans text-slate-100 antialiased sm:px-4 [overflow-wrap:anywhere]`}>

      <div className="relative z-10 mx-auto flex w-full max-w-[1728px] flex-col gap-3">
        {careView === "overview" ? <>{historyError && <p role="alert" className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">No se pudo cargar el historial de este período. Los indicadores no están actualizados.</p>}<PersonalCareCommandCenter logs={historyLogs} completions={historyCompletions} routines={routines} period={carePeriod} today={today} loading={loading} onPeriodChange={setCarePeriod} onToggleRoutine={toggleRoutineCompletion} onManage={() => setCareView("manage")} /></> : <>
        <section className="care-hero relative isolate flex min-h-[220px] flex-col justify-between gap-6 overflow-hidden rounded-lg border border-violet-300/25 bg-[#0a1430] p-4 sm:p-5">
          <Image src="/images/lifetrack/night-mountains.webp" alt="" fill sizes="100vw" className="object-cover opacity-45 [filter:hue-rotate(38deg)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,15,34,.98),rgba(11,16,43,.72)_57%,rgba(8,14,39,.64))]" />
          <div className="absolute inset-y-0 right-[16%] w-[min(36vw,450px)] max-sm:right-[-18%] max-sm:w-64"><Image src="/images/lifetrack/care-meditation.webp" alt="" fill sizes="(max-width: 640px) 256px, 36vw" className="object-contain object-bottom opacity-85 [mask-image:linear-gradient(to_bottom,black_76%,transparent)] max-sm:opacity-35" /></div>
          <div className="relative z-10 max-w-[720px]">
            <div className="mb-3 flex flex-wrap items-center gap-2"><Link href="/pilares" className="inline-flex items-center gap-1.5 rounded-md border border-violet-300/30 bg-[#101d3a]/85 px-3 py-1.5 text-[11px] font-semibold text-violet-100 transition-colors hover:border-violet-300/70 hover:bg-violet-400/15"><ArrowLeft size={13} />Volver a Pilares</Link><span className="rounded-md border border-violet-300/30 bg-violet-400/12 px-2.5 py-1.5 text-[10px] font-bold uppercase text-violet-200">Cuidado personal</span></div>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">Gestionar <span className="text-violet-300">Cuidado Personal</span></h1>
            <p className="mt-1 text-base text-sky-100 sm:text-lg">Registra tu día y organiza tus rutinas.</p>
            <p className="mt-2 max-w-[550px] text-xs leading-relaxed text-slate-300">Tus registros alimentan el resumen de ánimo, descanso y hábitos.</p>
          </div>
          <div className="relative z-10 inline-flex w-fit rounded-md border border-violet-300/25 bg-[#0d1933]/85 p-1" role="group" aria-label="Vista de Cuidado Personal"><button type="button" onClick={() => setCareView("overview")} className="rounded px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-violet-400/15 hover:text-white">Resumen</button><button type="button" aria-pressed className="rounded border border-violet-300/35 bg-violet-400/20 px-3 py-1.5 text-[11px] font-semibold text-violet-100">Gestionar</button></div>
        </section>

        <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.75fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <Card className="care-manage-panel h-full">

              <CardHeader className="care-manage-header">
                <CardTitle className="care-manage-title">
                  <span className="care-manage-icon">
                    <NotebookPen size={18} />
                  </span>
                  Check-in diario
                </CardTitle>
                <p className="text-xs leading-relaxed text-slate-400">
                  No es un diagnóstico. Es una bitácora personal para reconocer patrones de ánimo, estrés, descanso y motivación.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    {
                      label: "Ánimo",
                      value: moodLevel,
                      setter: setMoodLevel,
                      icon: SmilePlus,
                      helper: "Cómo te sentiste hoy",
                      accent: "text-violet-200",
                    },
                    {
                      label: "Estrés",
                      value: stressLevel,
                      setter: setStressLevel,
                      icon: Flame,
                      helper: "Qué tan cargado estuvo el día",
                      accent: "text-violet-300",
                    },
                    {
                      label: "Motivación",
                      value: motivationLevel,
                      setter: setMotivationLevel,
                      icon: BatteryCharging,
                      helper: "Ganas de avanzar y hacer cosas",
                      accent: "text-fuchsia-300",
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

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="space-y-2 lg:col-span-1">
                    <label htmlFor="care-reflection" className="text-[11px] font-semibold text-slate-300">
                      Reflexión del día
                    </label>
                    <textarea
                      id="care-reflection"
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="¿Cómo te sentiste hoy? ¿Qué pasó?"
                      className="min-h-[108px] w-full resize-y p-3 text-sm text-slate-200 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="care-gratitude" className="text-[11px] font-semibold text-slate-300">
                      Algo que agradeces
                    </label>
                    <textarea
                      id="care-gratitude"
                      value={gratitudeNote}
                      onChange={(event) => setGratitudeNote(event.target.value)}
                      placeholder="Hoy agradezco..."
                      className="min-h-[108px] w-full resize-y p-3 text-sm text-slate-200 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="care-improvement" className="text-[11px] font-semibold text-slate-300">
                      Mejora para mañana
                    </label>
                    <textarea
                      id="care-improvement"
                      value={improvementNote}
                      onChange={(event) => setImprovementNote(event.target.value)}
                      placeholder="Mañana puedo mejorar en..."
                      className="min-h-[108px] w-full resize-y p-3 text-sm text-slate-200 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveDailyCheckin}
                    disabled={savingCheckin}
                    className="care-manage-primary h-10 px-5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
            <Card className="care-manage-panel h-full">

              <CardHeader className="care-manage-header">
                <CardTitle className="care-manage-title">
                  <span className="care-manage-icon">
                    <Activity size={18} />
                  </span>
                  Resumen semanal
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Semana {currentWeekStart} al {currentWeekEnd}.
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
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

                <div className="min-w-0 border-t border-violet-300/15 pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-violet-200">Lectura rápida</p>
                    <ShieldCheck size={16} className="text-purple-300" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {weeklySummary
                      ? weeklySummary.checkin_days > 0 || weeklySummary.completed_routine_events > 0
                        ? `Esta semana tienes ${weeklySummary.checkin_days} check-ins y ${weeklySummary.completed_routine_events} rutinas completadas. Intensidad: ${intensityLabel(weeklySummary.care_intensity).toLowerCase()}.`
                        : "Aún no hay actividad de cuidado personal esta semana. Empieza con un check-in y una rutina simple."
                      : "Todavía no hay resumen semanal. Guarda tu primer check-in o crea tus rutinas de cuidado personal."}
                  </p>
                </div>

                <div className="min-w-0 border-t border-violet-300/15 pt-3">
                  <p className="mb-2 text-[11px] font-semibold text-violet-200">
                    Cumplimiento de hoy
                  </p>
                  <div className="h-3 overflow-hidden rounded-full border border-white/[0.04] bg-slate-950 p-[2px]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${todayRoutineCompletionPct}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400 shadow-[0_0_14px_rgba(168,85,247,0.3)]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {completedRoutineIds.size}/{activeRoutines.length} rutinas activas completadas hoy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(300px,.75fr)_minmax(0,1.45fr)]">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            <Card className="care-manage-panel h-full">

              <CardHeader className="care-manage-header">
                <CardTitle className="care-manage-title">
                  <span className="care-manage-icon">
                    <Plus size={18} />
                  </span>
                  Crear rutina
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Define acciones simples que quieras sostener diariamente.
                </p>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="space-y-2">
                  <label htmlFor="care-routine-name" className="text-[11px] font-semibold text-slate-300">Nombre</label>
                  <input
                    id="care-routine-name"
                    value={newRoutineName}
                    onChange={(event) => setNewRoutineName(event.target.value)}
                    placeholder="Ejemplo: protector solar"
                    className="h-10 w-full px-3 text-sm text-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="care-routine-category" className="text-[11px] font-semibold text-slate-300">Categoría</label>
                  <select
                    id="care-routine-category"
                    value={newRoutineCategory}
                    onChange={(event) => setNewRoutineCategory(event.target.value)}
                    className="h-10 w-full px-3 text-sm text-white transition-colors"
                  >
                    <option value="bienestar">Bienestar</option>
                    <option value="skincare">Skincare</option>
                    <option value="presentación">Presentación</option>
                    <option value="entorno">Entorno</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="care-routine-description" className="text-[11px] font-semibold text-slate-300">Descripción</label>
                  <textarea
                    id="care-routine-description"
                    value={newRoutineDescription}
                    onChange={(event) => setNewRoutineDescription(event.target.value)}
                    placeholder="Describe cuándo o cómo quieres realizarla."
                    className="min-h-[96px] w-full resize-y p-3 text-sm text-slate-200 transition-colors"
                  />
                </div>

                <div className="mt-auto grid gap-3 pt-3 sm:grid-cols-2">
                  <Button
                    onClick={createRoutine}
                    disabled={savingRoutine}
                    className="care-manage-primary h-10 px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {savingRoutine ? "Guardando..." : "Crear rutina"}
                  </Button>

                  <Button
                    onClick={seedDefaultRoutines}
                    disabled={savingRoutine || routines.length > 0}
                    className="care-manage-secondary h-10 px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Sparkles size={16} />
                    Sugeridas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <Card className="care-manage-panel h-full">

              <CardHeader className="care-manage-header">
                <CardTitle className="care-manage-title">
                  <span className="care-manage-icon">
                    <Target size={18} />
                  </span>
                  Rutinas de hoy
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Marca solo lo que realmente cumpliste hoy. Mañana empieza una nueva fecha.
                </p>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex min-h-[250px] items-center justify-center">
                    <RefreshCw className="animate-spin text-violet-300" size={28} />
                  </div>
                ) : routines.length === 0 ? (
                  <div className="rounded-md border border-dashed border-violet-300/20 bg-violet-400/5 p-8 text-center">
                    <Sparkles className="mx-auto mb-3 text-purple-300" size={30} />
                    <p className="text-sm font-semibold text-white">Aún no tienes rutinas</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      Crea una rutina manualmente o carga las rutinas sugeridas para iniciar.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    {routines.map((routine) => {
                      const style = categoryStyles[routine.category] || categoryStyles.general
                      const Icon = style.icon
                      const completed = completedRoutineIds.has(routine.id)

                      return (
                        <div
                          key={routine.id}
                          className={`relative overflow-hidden rounded-md border px-3 py-2.5 transition-[border-color,background-color] duration-200 hover:border-violet-300/40 ${
                            routine.active
                              ? completed
                                ? "border-violet-300/45 bg-violet-400/12"
                                : "border-violet-300/15 bg-[#0c1a32]/70"
                              : "border-violet-300/10 bg-[#0c1a32]/35 opacity-55"
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <button
                                type="button"
                                onClick={() => routine.active && toggleRoutineCompletion(routine)}
                                disabled={!routine.active}
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition ${
                                  completed
                                    ? "border-emerald-300/20 bg-emerald-500/[0.12] text-emerald-200"
                                    : "border-violet-300/25 bg-violet-400/7 text-slate-400 hover:text-violet-200"
                                } disabled:cursor-not-allowed`}
                              >
                                {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="break-words text-sm font-extrabold text-white">{routine.name}</p>
                                  <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-medium ${style.className}`}>
                                    <Icon size={11} />
                                    {style.label}
                                  </span>
                                  {!routine.active && (
                                    <span className="rounded border border-slate-300/10 bg-slate-500/[0.06] px-2 py-0.5 text-[9px] text-slate-400">
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
                                className="care-manage-secondary h-8 px-3 text-[10px] font-semibold"
                              >
                                {routine.active ? "Pausar" : "Activar"}
                              </Button>

                              <Button
                                onClick={() => deleteRoutine(routine)}
                                className="h-8 border border-red-300/20 bg-red-500/[0.08] px-3 text-red-200 hover:bg-red-500/[0.14]"
                                aria-label={`Eliminar ${routine.name}`}
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
        </>}
      </div>
    </div>
  )
}
