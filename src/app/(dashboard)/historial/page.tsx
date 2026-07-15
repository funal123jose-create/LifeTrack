"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  HeartPulse,
  History,
  Layers3,
  Loader2,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  ACTIVITY_DATE_RANGES,
  ACTIVITY_PILLARS,
  ACTIVITY_SOURCES,
  type ActivityEvent,
  type ActivityDateRange,
  type ActivityPillar,
  type ActivitySource,
  formatActivityTime,
  getActivityStats,
  getWeeklyActivity,
  groupActivitiesByDate,
  isInDateRange,
  mapBodyProgressLogs,
  mapHealthRoutineCompletions,
  mapMealLogs,
  mapPersonalCareDailyLogs,
  mapPersonalCareRoutineCompletions,
  mapProjectActivityLogs,
  mapWaterLogs,
  sortActivities,
} from "@/lib/activity-history"

type LoadState = "idle" | "loading" | "ready" | "error"

const sourceLabels: Record<ActivityEvent["source"], string> = {
  project: "Carrera",
  meal: "Nutricion",
  water: "Hidratacion",
  body: "Progreso fisico",
  health_routine: "Rutina salud",
  care_checkin: "Check-in",
  care_routine: "Rutina personal",
}

const sourceAccents: Record<ActivityEvent["source"] | "all", string> = {
  all: "from-blue-400 to-cyan-300",
  project: "from-orange-400 to-amber-300",
  meal: "from-emerald-400 to-lime-300",
  water: "from-cyan-400 to-blue-300",
  body: "from-emerald-400 to-teal-300",
  health_routine: "from-green-400 to-emerald-300",
  care_checkin: "from-violet-400 to-fuchsia-300",
  care_routine: "from-purple-400 to-violet-300",
}

const sourceButtonStyles: Record<ActivityEvent["source"] | "all", string> = {
  all: "border-blue-300/20 bg-blue-400/[0.1] text-blue-100",
  project: "border-orange-300/20 bg-orange-400/[0.1] text-orange-100",
  meal: "border-emerald-300/20 bg-emerald-400/[0.1] text-emerald-100",
  water: "border-cyan-300/20 bg-cyan-400/[0.1] text-cyan-100",
  body: "border-teal-300/20 bg-teal-400/[0.1] text-teal-100",
  health_routine: "border-green-300/20 bg-green-400/[0.1] text-green-100",
  care_checkin: "border-violet-300/20 bg-violet-400/[0.1] text-violet-100",
  care_routine: "border-purple-300/20 bg-purple-400/[0.1] text-purple-100",
}

const sourceIcons: Record<ActivityEvent["source"], React.ComponentType<{ className?: string; size?: number }>> = {
  project: BarChart3,
  meal: Activity,
  water: Activity,
  body: HeartPulse,
  health_routine: CheckCircle2,
  care_checkin: Sparkles,
  care_routine: CheckCircle2,
}

function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.055] to-white/[0.018] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className={`absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition group-hover:opacity-20`} />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="relative mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="relative mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  )
}

function TimelineItem({ event, index }: { event: ActivityEvent; index: number }) {
  const Icon = sourceIcons[event.source]

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.18) }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.055] bg-gradient-to-br from-[#141821]/95 to-[#101621]/82 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#141b28]"
    >
      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${event.accent}`} />
      <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${event.accent} opacity-[0.06] blur-2xl transition group-hover:opacity-[0.12]`} />
      <div className="flex gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${event.accent} p-px shadow-[0_0_28px_rgba(34,211,238,0.14)]`}>
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#111827]">
            <Icon size={17} className="text-slate-100" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">{event.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{event.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
              <Clock3 size={13} />
              {formatActivityTime(event.occurredAt)}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
              {sourceLabels[event.source]}
            </span>
            {event.metric ? (
              <span className={`rounded-full bg-gradient-to-r ${event.accent} px-2.5 py-1 text-[11px] font-black text-slate-950`}>
                {event.metric}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function HistorialPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [activities, setActivities] = React.useState<ActivityEvent[]>([])
  const [activeFilter, setActiveFilter] = React.useState<ActivityPillar>("all")
  const [activeSource, setActiveSource] = React.useState<ActivitySource | "all">("all")
  const [activeDateRange, setActiveDateRange] = React.useState<ActivityDateRange>("30d")
  const [loadState, setLoadState] = React.useState<LoadState>("idle")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isActive = true

    async function loadActivityHistory() {
      setLoadState("loading")
      setErrorMessage(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace("/login")
        return
      }

      const userId = session.user.id

      const [
        projectLogs,
        mealLogs,
        waterLogs,
        bodyLogs,
        healthRoutines,
        careDailyLogs,
        careRoutineLogs,
      ] = await Promise.all([
        supabase
          .from("project_activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(40),
        supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("body_progress_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("health_routine_completions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("personal_care_daily_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("personal_care_routine_completions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
      ])

      const queryError =
        projectLogs.error ||
        mealLogs.error ||
        waterLogs.error ||
        bodyLogs.error ||
        healthRoutines.error ||
        careDailyLogs.error ||
        careRoutineLogs.error

      if (queryError) {
        if (isActive) {
          setErrorMessage(queryError.message)
          setLoadState("error")
        }
        return
      }

      const nextActivities = sortActivities([
        ...mapProjectActivityLogs(projectLogs.data ?? []),
        ...mapMealLogs(mealLogs.data ?? []),
        ...mapWaterLogs(waterLogs.data ?? []),
        ...mapBodyProgressLogs(bodyLogs.data ?? []),
        ...mapHealthRoutineCompletions(healthRoutines.data ?? []),
        ...mapPersonalCareDailyLogs(careDailyLogs.data ?? []),
        ...mapPersonalCareRoutineCompletions(careRoutineLogs.data ?? []),
      ])

      if (isActive) {
        setActivities(nextActivities)
        setLoadState("ready")
      }
    }

    loadActivityHistory()

    return () => {
      isActive = false
    }
  }, [router, supabase])

  const filteredActivities = React.useMemo(
    () =>
      activities.filter((event) => {
        const matchesPillar = activeFilter === "all" || event.pillar === activeFilter
        const matchesSource = activeSource === "all" || event.source === activeSource
        const matchesDateRange = isInDateRange(event, activeDateRange)

        return matchesPillar && matchesSource && matchesDateRange
      }),
    [activeDateRange, activeFilter, activeSource, activities]
  )

  const stats = React.useMemo(() => getActivityStats(filteredActivities), [filteredActivities])
  const weeklyActivity = React.useMemo(
    () => getWeeklyActivity(filteredActivities),
    [filteredActivities]
  )
  const groupedActivities = React.useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  )

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden py-6 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b12]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_78%_85%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_28%_90%,rgba(20,184,166,0.14),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#101621]/78 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-violet-500/[0.1] via-orange-500/[0.05] to-transparent" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
              <History size={14} />
              Historial global
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Toda tu actividad en una sola linea de tiempo.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Unifica movimientos reales de Salud, Data/Carrera y Cuidado Personal para entender continuidad,
              progreso y senales recientes sin cambiar la logica de cada modulo.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[460px]">
            <StatCard
              label="Registros"
              value={stats.total.toString()}
              detail={`Vista filtrada de ${activities.length} eventos`}
              accent="from-blue-400 to-cyan-300"
            />
            <StatCard
              label="Hoy"
              value={stats.today.toString()}
              detail="Movimientos del dia"
              accent="from-emerald-400 to-teal-300"
            />
            <StatCard
              label="Pilar dominante"
              value={stats.dominantPillar.label}
              detail="Mayor volumen reciente"
              accent={stats.dominantPillar.accent}
            />
            <StatCard
              label="Ultimo evento"
              value={stats.latestLabel}
              detail="Hora registrada"
              accent="from-violet-400 to-fuchsia-300"
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[2rem] border border-white/[0.06] bg-[#0d131d]/80 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Linea de tiempo</h2>
              <p className="mt-1 text-sm text-slate-400">
                Filtra por pilar, tipo y rango para revisar la actividad en orden cronologico.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:flex">
                  <CalendarDays size={13} />
                  Rango
                </span>
                {ACTIVITY_DATE_RANGES.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setActiveDateRange(range.id)}
                    className={`rounded-full border px-3 py-2 text-xs font-black transition duration-300 ${
                      activeDateRange === range.id
                        ? "border-cyan-300/20 bg-cyan-300/[0.12] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
                        : "border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:flex">
                  <Filter size={13} />
                  Pilar
                </span>
                {ACTIVITY_PILLARS.map((pillar) => (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActiveFilter(pillar.id)}
                    className={`relative overflow-hidden rounded-full border px-3 py-2 text-xs font-black transition duration-300 ${
                      activeFilter === pillar.id
                        ? "border-white/15 text-white shadow-[0_0_28px_rgba(59,130,246,0.18)]"
                        : "border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200"
                    }`}
                  >
                    {activeFilter === pillar.id ? (
                      <span className={`absolute inset-0 bg-gradient-to-r ${pillar.accent} opacity-25`} />
                    ) : null}
                    <span className="relative">{pillar.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 rounded-3xl border border-white/[0.045] bg-white/[0.02] p-2">
            {ACTIVITY_SOURCES.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => setActiveSource(source.id)}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition duration-300 ${
                  activeSource === source.id
                    ? `${sourceButtonStyles[source.id]} shadow-[0_0_24px_rgba(255,255,255,0.08)]`
                    : "border-transparent text-slate-500 hover:bg-white/[0.045] hover:text-slate-300"
                }`}
              >
                {source.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {loadState === "loading" ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.02] text-slate-400">
                <Loader2 size={26} className="animate-spin text-cyan-300" />
                <p className="mt-3 text-sm">Cargando actividad real desde Supabase...</p>
              </div>
            ) : null}

            {loadState === "error" ? (
              <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">
                No se pudo cargar el historial desde Supabase.
                {errorMessage ? <span className="mt-2 block text-rose-200/80">{errorMessage}</span> : null}
              </div>
            ) : null}

            {loadState === "ready" && groupedActivities.length === 0 ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.02] p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-200">
                  <Layers3 size={22} />
                </div>
                <h3 className="mt-4 text-xl font-black text-white">Aun no hay actividad para este filtro</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Cuando registres comidas, hidratacion, rutinas, check-ins o avances de proyectos, apareceran aqui.
                </p>
              </div>
            ) : null}

            {loadState === "ready" && groupedActivities.length > 0 ? (
              <div className="space-y-6">
                {groupedActivities.map((group) => (
                  <div key={group.dateKey}>
                    <div className="sticky top-[78px] z-10 mb-3 flex items-center gap-3 bg-[#0d131d]/90 py-2 backdrop-blur">
                      <div className="h-px flex-1 bg-white/[0.08]" />
                      <p className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                        {group.label}
                      </p>
                      <div className="h-px flex-1 bg-white/[0.08]" />
                    </div>

                    <div className="space-y-3">
                      {group.events.map((event, index) => (
                        <TimelineItem key={event.id} event={event} index={index} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-[#101621]/90 to-[#15131f]/82 p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Actividad semanal</h2>
                <p className="mt-1 text-sm text-slate-500">Ritmo de los ultimos 7 dias.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-cyan-200">
                <Activity size={18} />
              </div>
            </div>

            <div className="mt-6 flex h-36 items-end gap-2">
              {weeklyActivity.map((day) => (
                <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-24 w-full items-end overflow-hidden rounded-full bg-slate-950/70">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(day.percent, day.count > 0 ? 10 : 0)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-full bg-gradient-to-t from-orange-400 via-violet-400 to-emerald-300 shadow-[0_0_22px_rgba(168,85,247,0.28)]"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-300">{day.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{day.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-[#101621]/90 to-[#101b18]/82 p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Distribucion</h2>
                <p className="mt-1 text-sm text-slate-500">Peso relativo por pilar.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-cyan-200">
                <BarChart3 size={18} />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {stats.distribution.map((pillar) => (
                <div key={pillar.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">{pillar.label}</span>
                    <span className="text-slate-500">{pillar.count} eventos</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pillar.percent}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${pillar.accent}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-[#101621]/90 to-[#1b1216]/82 p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Ultimos hitos</h2>
                <p className="mt-1 text-sm text-slate-500">Lectura rapida reciente.</p>
              </div>
              <Sparkles size={18} className="text-violet-300" />
            </div>

            <div className="mt-5 space-y-3">
              {activities.slice(0, 5).map((event) => (
                <div
                  key={`highlight-${event.id}`}
                  className="rounded-2xl border border-white/[0.055] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-3 transition hover:border-white/[0.11]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{event.title}</p>
                      <p className={`mt-1 bg-gradient-to-r ${sourceAccents[event.source]} bg-clip-text text-xs font-bold text-transparent`}>
                        {sourceLabels[event.source]}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{formatActivityTime(event.occurredAt)}</span>
                  </div>
                </div>
              ))}

              {loadState === "ready" && activities.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-sm text-slate-400">
                  Sin hitos recientes por ahora.
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
