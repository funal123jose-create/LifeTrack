"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
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
import "../final-phase.css"
import "./calendar-final.css"

type LoadState = "idle" | "loading" | "ready" | "error"

const statusLegend = [
  { id: "completed", label: "Completado" },
  { id: "partial", label: "Parcial" },
  { id: "pending", label: "Pendiente" },
  { id: "highlight", label: "Destacado" },
]

function CalendarCell({
  day,
  isSelected,
  onSelect,
  reducedMotion,
}: {
  day: CalendarDay
  isSelected: boolean
  onSelect: () => void
  reducedMotion: boolean | null
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={day.date + ", " + day.events.length + " registros, estado " + day.status}
      className="calendar-day-cell"
      data-status={day.status}
      data-outside={!day.isCurrentMonth}
      data-today={day.isToday}
    >
      <span className="calendar-day-cell__top"><strong>{day.dayNumber}</strong>{day.events.length > 0 ? <span>{day.events.length}</span> : null}</span>
      <span className="calendar-day-cell__progress"><motion.span initial={reducedMotion ? false : { width: 0 }} animate={{ width: String(day.completionRate) + "%" }} transition={{ duration: .35 }} /></span>
      <span className="calendar-day-cell__dots" aria-hidden="true">{day.events.slice(0, 3).map((event) => <i key={event.id} data-pillar={event.pillar} />)}</span>
      {day.events[0] ? <span className="calendar-day-cell__title">{day.events[0].title}</span> : null}
    </button>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  return <article className="calendar-event" data-pillar={event.pillar}>
    <span className="calendar-event__marker" aria-hidden="true" />
    <div className="calendar-event__body"><div><h4>{event.title}</h4><span>{event.source}</span></div><p>{event.description}</p>{event.metric ? <strong>{event.metric}</strong> : null}</div>
  </article>
}

export default function CalendarioPage() {
  const reducedMotion = useReducedMotion()
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
      setEvents([])

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
    () => calendarMonth.days.find((day) => day.date === selectedDate && day.isCurrentMonth) ?? calendarMonth.days.find((day) => day.isToday) ?? calendarMonth.days.find((day) => day.isCurrentMonth),
    [calendarMonth.days, selectedDate]
  )

  const changeMonth = (amount: number) => {
    const nextMonth = addMonths(monthDate, amount)
    setMonthDate(nextMonth)
    setSelectedDate(toDateKey(nextMonth))
  }

  const selectDay = (day: CalendarDay) => {
    setSelectedDate(day.date)
    if (!day.isCurrentMonth) setMonthDate(new Date(day.date + "T12:00:00"))
  }

  return (
    <div id="lt26-content" tabIndex={-1} className="lt-final-page calendar-overhaul">
      <div className="calendar-stage">
        <section className="calendar-masthead" aria-labelledby="calendar-title">
          <div className="calendar-masthead__copy">
            <h1 id="calendar-title">Calendario</h1>
            <p>Habitos, rutinas, salud, cuidado personal y eventos organizados por fecha.</p>
          </div>
          <div className="calendar-masthead__metrics" aria-label="Resumen del mes">
            {[
              { icon: Activity, label: "Dias activos", value: stats.activeDays, detail: "Con registros" },
              { icon: CheckCircle2, label: "Completados", value: stats.completedDays, detail: "Dias con avance fuerte" },
              { icon: Layers3, label: "Eventos", value: stats.totalEvents, detail: "Registros del mes" },
              { icon: Flame, label: "Racha", value: String(stats.currentStreak) + "d", detail: "Continuidad actual" },
            ].map(({ icon: Icon, label, value, detail }) => <div className="calendar-metric" key={label}><Icon size={18} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}
          </div>
        </section>

        <div className="calendar-planning-layout">
        <section className="calendar-workspace" aria-labelledby="calendar-month-title">
          <div className="calendar-workspace__head">
            <div><span className="calendar-section-icon"><CalendarDays size={19} /></span><div><h2 id="calendar-month-title">{calendarMonth.label}</h2><p>Selecciona una fecha para revisar sus registros.</p></div></div>
            <div className="calendar-navigation" role="group" aria-label="Navegar por meses">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior" title="Mes anterior"><ArrowLeft size={17} /></button>
              <button type="button" onClick={() => { const today = new Date(); setMonthDate(today); setSelectedDate(toDateKey(today)) }}>Hoy</button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente" title="Mes siguiente"><ArrowRight size={17} /></button>
            </div>
          </div>
          <div className="calendar-legend" aria-label="Estados del calendario">{statusLegend.map((item) => <span key={item.id}><i data-status={item.id} />{item.label}</span>)}</div>
          {loadState === "idle" || loadState === "loading" ? <div className="calendar-state" role="status"><Loader2 size={22} className="animate-spin" /> Cargando calendario desde Supabase...</div> : null}
          {loadState === "error" ? <div className="calendar-state calendar-state--error" role="alert">No se pudo cargar el calendario desde Supabase.{errorMessage ? <span>{errorMessage}</span> : null}</div> : null}
          {loadState !== "error" ? <>
            <div className="calendar-desktop-grid" aria-busy={loadState !== "ready"}>
              <div className="calendar-weekdays">{WEEKDAY_LABELS.map((day) => <span key={day}>{day}</span>)}</div>
              <motion.div key={calendarMonth.key} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="calendar-days-grid">
                {calendarMonth.days.map((day) => <CalendarCell key={day.date} day={day} isSelected={selectedDay?.date === day.date} onSelect={() => selectDay(day)} reducedMotion={reducedMotion} />)}
              </motion.div>
            </div>
            <div className="calendar-mobile-agenda" aria-label="Fechas del mes">
              {calendarMonth.days.filter((day) => day.isCurrentMonth).map((day) => <button type="button" key={day.date} onClick={() => setSelectedDate(day.date)} aria-pressed={selectedDay?.date === day.date} className="calendar-agenda-day" data-status={day.status}><strong>{day.dayNumber}</strong><span><b>{new Intl.DateTimeFormat("es-PE", { weekday: "long" }).format(new Date(day.date + "T12:00:00"))}</b><small>{day.events[0]?.title || "Sin registros"}</small></span><i>{day.events.length}</i></button>)}
            </div>
          </> : null}
        </section>

        <section className="calendar-selected" aria-labelledby="calendar-selected-title">
          <div className="calendar-section-head"><div><span className="calendar-section-icon"><Target size={19} /></span><div><h2 id="calendar-selected-title">Detalle del dia</h2><p>{selectedDay?.date || "Selecciona una fecha"}</p></div></div><span>{selectedDay?.events.length || 0} registros</span></div>
          <div className="calendar-selected__body">
            <div className="calendar-selected__summary">
              <div><span>Fecha</span><strong>{selectedDay ? new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(new Date(selectedDay.date + "T12:00:00")) : "--"}</strong></div>
              <div><span>Eventos</span><strong>{selectedDay?.events.length ?? 0}</strong></div>
              <div><span>Avance de registros</span><strong>{selectedDay?.completionRate ?? 0}%</strong></div>
              <div><span>Estado</span><strong className="calendar-selected__status" data-status={selectedDay?.status}>{statusLegend.find((status) => status.id === selectedDay?.status)?.label || "Sin registros"}</strong></div>
            </div>
            <div className="calendar-selected__events">
              <h3><Layers3 size={16} /> Registros de la fecha</h3>
              <div key={selectedDay?.date} className="calendar-selected__list" role="region" aria-label="Actividades de la fecha seleccionada" tabIndex={0}>
                {loadState === "ready" && selectedDay?.events.length ? selectedDay.events.map((event) => <EventCard key={event.id} event={event} />) : <div className="calendar-selected__empty">{loadState === "loading" ? "Cargando registros..." : "Sin registros para esta fecha."}</div>}
              </div>
            </div>
          </div>
        </section>

        </div>
        <div className="calendar-bottom">
          <section className="calendar-milestones" aria-labelledby="calendar-milestones-title">
            <div className="calendar-section-head"><div><span className="calendar-section-icon"><Trophy size={19} /></span><div><h2 id="calendar-milestones-title">Senales del mes</h2><p>Fechas que destacan dentro de los registros.</p></div></div></div>
            <div className="calendar-milestones__items">
              <button type="button" disabled={!stats.bestDay} onClick={() => stats.bestDay && setSelectedDate(stats.bestDay.date)}><Trophy size={18} /><span><small>Mejor dia</small><strong>{stats.bestDay ? String(stats.bestDay.dayNumber) + " · " + stats.bestDay.events.length + " registros" : "Sin actividad"}</strong></span></button>
              <button type="button" disabled={!stats.nextObjective} onClick={() => stats.nextObjective && setSelectedDate(stats.nextObjective.date)}><MapPin size={18} /><span><small>Proximo foco</small><strong>{stats.nextObjective ? String(stats.nextObjective.dayNumber) + " · " + stats.nextObjective.date : "Mes cubierto"}</strong></span></button>
              <div><Sparkles size={18} /><span><small>Avance medio</small><strong>{stats.completionRate}%</strong></span></div>
            </div>
          </section>
          <section className="calendar-reading" aria-labelledby="calendar-reading-title">
            <div className="calendar-section-head"><div><span className="calendar-section-icon"><Activity size={19} /></span><div><h2 id="calendar-reading-title">Lectura mensual</h2><p>Resumen basado en lo registrado.</p></div></div></div>
            <p>{stats.activeDays > 0 ? "En " + getMonthLabel(monthDate) + " registraste actividad en " + stats.activeDays + " dias, con " + stats.totalEvents + " eventos visibles." : "Todavia no hay registros visibles para " + getMonthLabel(monthDate) + "."}</p>
            <div className="calendar-reading__counts"><span><i data-status="completed" />{stats.completedDays} completados</span><span><i data-status="partial" />{stats.partialDays} parciales</span><span><i data-status="pending" />{stats.pendingDays} pendientes</span></div>
          </section>
        </div>
      </div>
    </div>
  )
}
