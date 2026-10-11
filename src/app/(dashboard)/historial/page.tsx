"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Select } from "radix-ui"
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  History,
  Layers3,
  Loader2,
  Search,
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
import "../final-phase.css"
import "./history-final.css"

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


const sourceIcons: Record<ActivityEvent["source"], React.ComponentType<{ className?: string; size?: number }>> = {
  project: BarChart3,
  meal: Activity,
  water: Activity,
  body: HeartPulse,
  health_routine: CheckCircle2,
  care_checkin: Sparkles,
  care_routine: CheckCircle2,
}


export default function HistorialPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [activities, setActivities] = React.useState<ActivityEvent[]>([])
  const [activeFilter, setActiveFilter] = React.useState<ActivityPillar>("all")
  const [activeSource, setActiveSource] = React.useState<ActivitySource | "all">("all")
  const [activeDateRange, setActiveDateRange] = React.useState<ActivityDateRange>("30d")
  const [search, setSearch] = React.useState("")
  const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null)
  const reducedMotion = useReducedMotion()
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
        const query = search.trim().toLocaleLowerCase("es")
        const matchesSearch = !query || [event.title, event.description, sourceLabels[event.source], event.metric || ""].some((text) => text.toLocaleLowerCase("es").includes(query))

        return matchesPillar && matchesSource && matchesDateRange && matchesSearch
      }),
    [activeDateRange, activeFilter, activeSource, activities, search]
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
    <div id="lt26-content" tabIndex={-1} className="lt-final-page history-overhaul">
      <div className="history-stage">
        <section className="history-masthead" aria-labelledby="history-title">
          <div className="history-masthead__copy">
            <h1 id="history-title">Historial de actividad</h1>
            <p>Un registro cronologico de Salud, Data &amp; Carrera y Cuidado Personal.</p>
          </div>
          <div className="history-masthead__metrics" aria-label="Resumen del historial filtrado">
            {[
              { label: "Registros", value: String(stats.total), detail: "de " + activities.length + " cargados", icon: Layers3 },
              { label: "Hoy", value: String(stats.today), detail: "movimientos", icon: CalendarDays },
              { label: "Pilar principal", value: stats.total ? stats.dominantPillar.label : "Sin datos", detail: "en esta vista", icon: HeartPulse },
              { label: "Ultimo evento", value: stats.latestLabel, detail: "hora registrada", icon: Clock3 },
            ].map(({ label, value, detail, icon: Icon }) => <div className="history-metric" key={label}><Icon size={18} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}
          </div>
        </section>

        <section className="history-command" aria-labelledby="history-filter-title">
          <div className="history-section-head"><div><span className="history-section-icon"><Search size={18} /></span><div><h2 id="history-filter-title">Encontrar registros</h2><p>Filtra los eventos cargados por fecha, pilar o tipo.</p></div></div><span>{filteredActivities.length} resultados</span></div>
          <div className="history-command__primary">
            <label className="history-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Buscar en el historial</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar actividad, descripcion o metrica" /></label>
            <Select.Root value={activeSource} onValueChange={(value) => setActiveSource(value as ActivitySource | "all")}>
              <Select.Trigger className="history-source-trigger" aria-label="Filtrar historial por tipo de actividad"><Select.Value /><Select.Icon><ChevronDown size={15} /></Select.Icon></Select.Trigger>
              <Select.Portal><Select.Content position="popper" sideOffset={6} collisionPadding={10} className="history-source-menu"><Select.Viewport>{ACTIVITY_SOURCES.map((source) => <Select.Item value={source.id} key={source.id} className="history-source-option"><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator><Select.ItemText>{source.label}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
            </Select.Root>
          </div>
          <div className="history-command__secondary">
            <div className="history-segment" role="group" aria-label="Rango de fechas">{ACTIVITY_DATE_RANGES.map((range) => <button type="button" key={range.id} onClick={() => setActiveDateRange(range.id)} aria-pressed={activeDateRange === range.id}>{range.label}</button>)}</div>
            <div className="history-segment history-segment--pillars" role="group" aria-label="Filtrar por pilar">{ACTIVITY_PILLARS.map((pillar) => <button type="button" key={pillar.id} onClick={() => setActiveFilter(pillar.id)} aria-pressed={activeFilter === pillar.id} data-pillar={pillar.id}>{pillar.label}</button>)}</div>
          </div>
        </section>

        <div className="history-workspace">
        <section className="history-ledger" aria-labelledby="history-ledger-title">
          <div className="history-section-head"><div><span className="history-section-icon"><History size={18} /></span><div><h2 id="history-ledger-title">Cronologia de registros</h2><p>De lo mas reciente a lo mas antiguo.</p></div></div><span>{groupedActivities.length} fechas</span></div>
          {loadState === "idle" || loadState === "loading" ? <div className="history-state"><Loader2 size={24} className="animate-spin" /> Cargando actividad desde Supabase...</div> : null}
          {loadState === "error" ? <div className="history-state history-state--error" role="alert">No se pudo cargar el historial desde Supabase.{errorMessage ? <span>{errorMessage}</span> : null}</div> : null}
          {loadState === "ready" && !groupedActivities.length ? <div className="history-state"><Layers3 size={25} /><strong>Sin actividad para estos filtros</strong><span>Prueba otro rango, pilar, tipo o termino de busqueda.</span></div> : null}
          {loadState === "ready" && groupedActivities.map((group) => <div className="history-day" id={"history-day-" + group.dateKey} key={group.dateKey}>
            <div className="history-day__date"><CalendarDays size={16} /><h3>{group.label}</h3><span>{group.events.length} registros</span></div>
            <div className="history-day__events">{group.events.map((event, index) => {
              const Icon = sourceIcons[event.source]
              const expanded = expandedEventId === event.id
              return <motion.article key={event.id} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2, delay: Math.min(index * .025, .12) }} className="history-event" data-pillar={event.pillar}>
                <button type="button" aria-expanded={expanded} aria-controls={"history-detail-" + event.id} onClick={() => setExpandedEventId(expanded ? null : event.id)} className="history-event__trigger">
                  <span className="history-event__icon"><Icon size={17} /></span>
                  <span className="history-event__main"><strong>{event.title}</strong><small>{sourceLabels[event.source]}{event.metric ? " · " + event.metric : ""}</small></span>
                  <span className="history-event__time">{formatActivityTime(event.occurredAt)}</span>
                  <ChevronDown className="history-event__chevron" size={17} />
                </button>
                <div id={"history-detail-" + event.id} hidden={!expanded} className="history-event__detail"><p>{event.description}</p><span>{sourceLabels[event.source]} · {formatActivityTime(event.occurredAt)}</span></div>
              </motion.article>
            })}</div>
          </div>)}
        </section>
        <aside className="history-insights" aria-label="Análisis de los registros">
          <section className="history-week" aria-labelledby="history-week-title">
            <div className="history-mini-head"><h2 id="history-week-title"><Activity size={18} /> Ritmo de los ultimos 7 dias</h2><span>Registros por dia</span></div>
            <div className="history-week__chart">{weeklyActivity.map((day) => <button type="button" key={day.key} disabled={!day.count} onClick={() => document.getElementById("history-day-" + day.key)?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" })} aria-label={day.label + ": " + day.count + " registros. Ir a los eventos del dia."} title={day.label + ": " + day.count + " registros"}><span className="history-week__bar-track"><span className="history-week__bar" style={{ height: String(Math.max(day.percent, day.count ? 9 : 0)) + "%" }} /></span><strong>{day.count}</strong><small>{day.label}</small></button>)}</div>
          </section>
          <section className="history-distribution" aria-labelledby="history-distribution-title">
            <div className="history-mini-head"><h2 id="history-distribution-title"><BarChart3 size={18} /> Por pilar</h2><span>Vista filtrada</span></div>
            <div className="history-distribution__list">{stats.distribution.map((pillar) => <button type="button" key={pillar.id} onClick={() => setActiveFilter(pillar.id)} aria-pressed={activeFilter === pillar.id}><span><strong>{pillar.label}</strong><small>{pillar.count} eventos</small></span><span className="history-distribution__track"><span data-pillar={pillar.id} style={{ width: String(pillar.percent) + "%" }} /></span><b>{pillar.percent}%</b></button>)}</div>
          </section>
          <section className="history-milestones" aria-labelledby="history-milestones-title">
            <div className="history-mini-head"><h2 id="history-milestones-title"><Sparkles size={18} /> Ultimos hitos</h2><span>Actividad reciente</span></div>
            <div className="history-milestones__list">{activities.slice(0, 3).map((event) => <div key={event.id}><span>{formatActivityTime(event.occurredAt)}</span><div><strong>{event.title}</strong><small>{sourceLabels[event.source]}</small></div></div>)}{loadState === "ready" && !activities.length ? <p className="history-empty">Sin hitos recientes.</p> : null}</div>
          </section>
        </aside>
        </div>
      </div>
    </div>
  )
}
