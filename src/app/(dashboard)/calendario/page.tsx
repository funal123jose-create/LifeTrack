"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  type CalendarDay,
  type CalendarEvent,
  WEEKDAY_LABELS,
  addMonths,
  buildCalendarMonth,
  getCalendarRange,
  getCalendarStats,
  getMonthLabel,
  mapBodyRows,
  mapCalendarEvents,
  mapHabitLogs,
  mapHealthRoutineRows,
  mapMealRows,
  mapPersonalCareDailyRows,
  mapPersonalCareRoutineRows,
  mapWaterRows,
  toDateKey,
} from "@/lib/progress-calendar"

type LoadState = "idle" | "loading" | "ready" | "error"

const statusStyles = {
  empty: "border-white/[0.045] bg-[#161821]/70 text-slate-500",
  pending: "border-orange-300/25 bg-gradient-to-br from-orange-500/[0.16] via-[#211811]/85 to-[#141821] text-orange-100",
  partial: "border-blue-300/22 bg-gradient-to-br from-blue-500/[0.16] via-[#101c2d]/85 to-[#141821] text-blue-100",
  completed: "border-emerald-300/25 bg-gradient-to-br from-emerald-500/[0.18] via-[#10261c]/85 to-[#141821] text-emerald-100",
  highlight: "border-violet-300/25 bg-gradient-to-br from-violet-500/[0.18] via-[#21152d]/85 to-[#141821] text-violet-100",
}

const pillarDots: Record<CalendarEvent["pillar"], string> = {
  health: "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.55)]",
  career: "bg-orange-300 shadow-[0_0_14px_rgba(253,186,116,0.55)]",
  care: "bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.55)]",
  general: "bg-blue-300 shadow-[0_0_14px_rgba(147,197,253,0.55)]",
}

const statusLegend = [
  { id: "completed", label: "Completado", className: "bg-emerald-400" },
  { id: "partial", label: "Parcial", className: "bg-blue-400" },
  { id: "pending", label: "Pendiente", className: "bg-orange-400" },
  { id: "highlight", label: "Destacado", className: "bg-violet-400" },
]

function StatTile({
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className={`absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition group-hover:opacity-20`} />
      <p className="relative text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="relative mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="relative mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  )
}

function CalendarCell({
  day,
  isSelected,
  onSelect,
}: {
  day: CalendarDay
  isSelected: boolean
  onSelect: () => void
}) {
  const visibleEvents = day.events.slice(0, 3)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative min-h-[104px] overflow-hidden rounded-2xl border p-3 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(0,0,0,0.32)] ${
        statusStyles[day.status]
      } ${isSelected ? "ring-2 ring-white/35" : ""} ${day.isCurrentMonth ? "" : "opacity-40"}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/[0.08] blur-2xl" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-black ${day.isToday ? "text-cyan-200" : "text-slate-200"}`}>
          {day.dayNumber}
        </span>
        {day.events.length > 0 ? (
          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-black text-slate-200">
            {day.events.length}
          </span>
        ) : null}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-950/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${day.completionRate}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-blue-300 to-violet-300"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleEvents.map((event) => (
          <span
            key={event.id}
            className={`h-2 w-2 rounded-full ${pillarDots[event.pillar]} shadow-[0_0_14px_rgba(34,211,238,0.25)]`}
            title={event.title}
          />
        ))}
      </div>

      {day.events[0] ? (
        <p className="mt-2 line-clamp-1 text-[11px] font-semibold text-slate-400">{day.events[0].title}</p>
      ) : null}
    </button>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-2xl border border-white/[0.055] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-4 transition hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pillarDots[event.pillar]}`} />
            <p className="truncate text-sm font-black text-white">{event.title}</p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{event.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.035] px-2.5 py-1 text-[11px] font-bold text-slate-300">
          {event.source}
        </span>
      </div>
      {event.metric ? <p className="mt-3 text-xs font-bold text-cyan-200">{event.metric}</p> : null}
    </div>
  )
}

export default function CalendarioPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [monthDate, setMonthDate] = React.useState(() => new Date())
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = React.useState(() => toDateKey(new Date()))
  const [loadState, setLoadState] = React.useState<LoadState>("idle")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isActive = true

    async function loadCalendarData() {
      setLoadState("loading")
      setErrorMessage(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace("/login")
        return
      }

      const range = getCalendarRange(monthDate)
      const userId = session.user.id

      const [
        habitLogs,
        calendarEvents,
        healthRoutines,
        mealLogs,
        waterLogs,
        bodyLogs,
        careDailyLogs,
        careRoutineLogs,
      ] = await Promise.all([
        supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("log_date", range.startDate)
          .lte("log_date", range.endDate),
        supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", userId)
          .gte("event_date", range.startDate)
          .lte("event_date", range.endDate),
        supabase
          .from("health_routine_completions")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
        supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
        supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
        supabase
          .from("body_progress_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
        supabase
          .from("personal_care_daily_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
        supabase
          .from("personal_care_routine_completions")
          .select("*")
          .eq("user_id", userId)
          .gte("date", range.startDate)
          .lte("date", range.endDate),
      ])

      const queryError =
        habitLogs.error ||
        calendarEvents.error ||
        healthRoutines.error ||
        mealLogs.error ||
        waterLogs.error ||
        bodyLogs.error ||
        careDailyLogs.error ||
        careRoutineLogs.error

      if (queryError) {
        if (isActive) {
          setErrorMessage(queryError.message)
          setLoadState("error")
        }
        return
      }

      const nextEvents = [
        ...mapHabitLogs(habitLogs.data ?? []),
        ...mapCalendarEvents(calendarEvents.data ?? []),
        ...mapHealthRoutineRows(healthRoutines.data ?? []),
        ...mapMealRows(mealLogs.data ?? []),
        ...mapWaterRows(waterLogs.data ?? []),
        ...mapBodyRows(bodyLogs.data ?? []),
        ...mapPersonalCareDailyRows(careDailyLogs.data ?? []),
        ...mapPersonalCareRoutineRows(careRoutineLogs.data ?? []),
      ]

      if (isActive) {
        setEvents(nextEvents)
        setLoadState("ready")
      }
    }

    loadCalendarData()

    return () => {
      isActive = false
    }
  }, [monthDate, router, supabase])

  const calendarMonth = React.useMemo(
    () => buildCalendarMonth(monthDate, events),
    [events, monthDate]
  )

  const stats = React.useMemo(() => getCalendarStats(calendarMonth.days), [calendarMonth.days])

  const selectedDay = React.useMemo(
    () => calendarMonth.days.find((day) => day.date === selectedDate) ?? calendarMonth.days.find((day) => day.isToday) ?? calendarMonth.days[0],
    [calendarMonth.days, selectedDate]
  )

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden py-6 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070b12]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_22%_90%,rgba(16,185,129,0.14),transparent_34%)]" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#101621]/78 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-violet-500/[0.1] via-orange-500/[0.05] to-transparent" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
              <CalendarDays size={14} />
              Calendario de progreso
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Visualiza tus habitos y avances en el tiempo.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Una lectura mensual basada en registros reales: habitos, rutinas, salud, cuidado personal y eventos
              planificados por fecha.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
            <StatTile label="Actividad" value={stats.activeDays.toString()} detail="Dias con registros" accent="from-blue-400 to-cyan-300" />
            <StatTile label="Completados" value={stats.completedDays.toString()} detail="Dias con avance fuerte" accent="from-emerald-400 to-teal-300" />
            <StatTile label="Eventos" value={stats.totalEvents.toString()} detail="Registros del mes" accent="from-violet-400 to-fuchsia-300" />
            <StatTile label="Racha" value={`${stats.currentStreak}d`} detail="Continuidad actual" accent="from-orange-400 to-amber-300" />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[2rem] border border-white/[0.06] bg-[#0d131d]/82 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">{calendarMonth.label}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Verde completado, cyan parcial, ambar pendiente y violeta destacado.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusLegend.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.03] px-3 py-1 text-[11px] font-bold text-slate-300"
                  >
                    <span className={`h-2 w-2 rounded-full ${item.className}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthDate((current) => addMonths(current, -1))}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/20 hover:text-cyan-100"
                title="Mes anterior"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  setMonthDate(today)
                  setSelectedDate(toDateKey(today))
                }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-cyan-300/20 hover:text-cyan-100"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setMonthDate((current) => addMonths(current, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/20 hover:text-cyan-100"
                title="Mes siguiente"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-7">
            {calendarMonth.days.map((day) => (
              <CalendarCell
                key={day.date}
                day={day}
                isSelected={selectedDay?.date === day.date}
                onSelect={() => setSelectedDate(day.date)}
              />
            ))}
          </div>

          {loadState === "loading" ? (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5 text-sm text-slate-400">
              <Loader2 size={18} className="animate-spin text-cyan-300" />
              Cargando calendario real desde Supabase...
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-100">
              No se pudo cargar el calendario desde Supabase.
              {errorMessage ? <span className="mt-2 block text-rose-200/80">{errorMessage}</span> : null}
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-500/[0.13] to-white/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-2 text-emerald-200">
                <Trophy size={16} />
                <p className="text-[11px] font-black uppercase tracking-[0.18em]">Mejor dia</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">
                {stats.bestDay ? `${stats.bestDay.dayNumber}` : "--"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {stats.bestDay ? `${stats.bestDay.events.length} registros · ${stats.bestDay.completionRate}%` : "Sin actividad"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-orange-300/15 bg-gradient-to-br from-orange-500/[0.13] to-white/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-2 text-orange-200">
                <Flame size={16} />
                <p className="text-[11px] font-black uppercase tracking-[0.18em]">Racha actual</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">{stats.currentStreak} dias</p>
              <p className="mt-1 text-sm text-slate-400">Dias seguidos con actividad</p>
            </div>
            <div className="rounded-[1.5rem] border border-violet-300/15 bg-gradient-to-br from-violet-500/[0.13] to-white/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-2 text-violet-200">
                <MapPin size={16} />
                <p className="text-[11px] font-black uppercase tracking-[0.18em]">Proximo foco</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">
                {stats.nextObjective ? stats.nextObjective.dayNumber : "--"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {stats.nextObjective ? "Dia para activar progreso" : "Mes cubierto"}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/[0.06] bg-[#101621]/82 p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Detalle del dia</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedDay?.date}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-cyan-200">
                <Target size={18} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-blue-300/10 bg-blue-400/[0.06] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Eventos</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedDay?.events.length ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.06] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Score</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedDay?.completionRate ?? 0}%</p>
              </div>
              <div className="rounded-2xl border border-violet-300/10 bg-violet-400/[0.06] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Estado</p>
                <p className="mt-2 text-sm font-black capitalize text-cyan-100">{selectedDay?.status}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDay?.events.map((event) => <EventCard key={event.id} event={event} />)}

              {loadState === "ready" && selectedDay?.events.length === 0 ? (
                <div className="rounded-3xl border border-white/[0.055] bg-white/[0.025] p-6 text-center">
                  <Layers3 size={24} className="mx-auto text-slate-500" />
                  <h3 className="mt-3 text-base font-black text-white">Sin registros este dia</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Cuando existan habitos, rutinas o eventos para esta fecha, apareceran aqui.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/[0.06] bg-[#101621]/82 p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Lectura mensual</h2>
                <p className="mt-1 text-sm text-slate-500">Resumen para decidir foco.</p>
              </div>
              <Sparkles size={18} className="text-violet-300" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-300">
                  {stats.activeDays > 0
                    ? `Tienes ${stats.activeDays} dias activos y ${stats.totalEvents} registros visibles en ${getMonthLabel(monthDate)}.`
                    : "Todavia no hay registros visibles para este mes."}
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <Clock3 size={18} className="mt-0.5 text-cyan-300" />
                <p className="text-sm leading-6 text-slate-300">
                  Usa el calendario para detectar continuidad, dias vacios y semanas con mejor adherencia.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <Activity size={18} className="mt-0.5 text-violet-300" />
                <p className="text-sm leading-6 text-slate-300">
                  La vista combina datos reales de calendario, habitos, salud y cuidado personal sin duplicar logica.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
