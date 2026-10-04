"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog } from "radix-ui"
import { motion, useReducedMotion } from "framer-motion"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BatteryCharging,
  CalendarDays, Check, CircleCheck, Droplet, Dumbbell, Flame, HeartPulse, X,
  Leaf, Scale, Utensils, Zap, type LucideIcon,
} from "lucide-react"
import { chartSeries, dateDaysAgo, hydrationReminder, nutritionTotals, selectNutritionRange, waterTotalsForRange, weightProgress, type HealthChartMode, type HealthHistory, type HealthPeriod, type NutritionHistory, type NutritionPeriod, type WaterPeriod, type WeightGoal } from "@/lib/health-analytics"
import { healthDateRange, inHealthRange } from "@/lib/health-periods"
import { getCurrentWeekStartString, getDateForWeekdayNum } from "@/lib/date"
import { getMealTypeLabel } from "@/lib/nutrition"
import { LifeTrackFooter } from "@/components/lifetrack-footer"
import { trainingStats, trainingStatsForRange, ROUTINE_LABELS, type TrainingPeriod } from "@/lib/health-training"
import { deriveHealthInsight, streakDayDetails } from "@/lib/health-insights"
import { HealthAiReading } from "@/components/health/health-ai-reading"
import { historicalWorkoutEntries, type HealthPlanItem, type WorkoutPlanEntry } from "@/lib/health-plan"
import { HealthAnalysisPanel } from "@/components/health/health-analysis-panel"
import { HealthPeriodSelect } from "@/components/health/health-period-select"
import { HealthWaterGlass } from "@/components/health/health-water-glass"

type Day = { id: string; name: string; planned: boolean; progress: number | null }
type Panel = "nutrition" | "hydration" | "routine" | "progress" | "plan"
type Props = {
  water: number
  waterGoal: number
  calories: number
  calorieGoal: number
  energy: number | null
  weight: number | null
  days: Day[]
  history: HealthHistory
  nutrition: NutritionHistory
  goal: WeightGoal | null
  streak: { current: number; best: number; recentDays: string[] }
  planItems: HealthPlanItem[]
  workouts: WorkoutPlanEntry[]
  chartPeriod: HealthPeriod
  analyticsRevision: number
  nutritionPeriod: NutritionPeriod
  nutritionOffset: number
  weekOffset: number
  planWeekOffset: number
  onChartPeriodChange: (period: HealthPeriod) => void
  onNutritionPeriodChange: (period: NutritionPeriod) => void
  onNutritionOffsetChange: (offset: number) => void
  onWeekOffsetChange: (offset: number) => void
  onPlanWeekOffsetChange: (offset: number) => void
  onOpenPanel: (panel: Panel) => void
  onAddWater: () => void
  onSelectDay: (dayId: string) => void
  onTogglePlanItem: (item: HealthPlanItem) => void
  onToggleWorkout: (entry: WorkoutPlanEntry) => void
}

const panel = "health-surface min-w-0 rounded-xl border p-3.5 sm:p-4"
const pct = (value: number) => Math.min(100, Math.max(0, Math.round(value)))

function Ring({ value, color, children, size = 74 }: { value: number | null; color: string; children: React.ReactNode; size?: number }) {
  return <div className="flex shrink-0 items-center justify-center rounded-full p-[6px]" style={{ width: size, height: size, background: `conic-gradient(${color} ${pct(value ?? 0)}%, #1c3441 0)`, boxShadow: `0 0 18px ${color}20, inset 0 0 0 1px ${color}30` }} role="img" aria-label={value === null ? "Sin porcentaje calculable" : `${pct(value)}%`}>
    <span className="flex h-full w-full items-center justify-center rounded-full border border-white/5 bg-[#071722] text-center text-sm font-extrabold text-white">{children}</span>
  </div>
}

function SectionTitle({ icon: Icon, children, action, tone = "emerald" }: { icon: LucideIcon; children: React.ReactNode; action?: React.ReactNode; tone?: "emerald" | "cyan" | "orange" }) {
  const accent = tone === "cyan" ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-300" : tone === "orange" ? "border-orange-300/20 bg-orange-400/10 text-orange-300" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"
  return <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2 border-b border-sky-100/10 pb-3">
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${accent}`}><Icon size={17} /></span>
    <h2 className="min-w-0 flex-1 text-sm font-extrabold text-white sm:text-[15px]">{children}</h2>
    {action}
  </div>
}

function TimeSelect({ label, value, onChange, children }: { label: string; value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <HealthPeriodSelect label={label} value={value} onChange={onChange}>{children}</HealthPeriodSelect>
}

function HistoryOffset({ unit, value, onChange }: { unit: "today" | "week" | "month"; value: number; onChange: (value: number) => void }) {
  const count = unit === "today" ? 14 : unit === "week" ? 8 : 7
  return <TimeSelect label="Periodo histórico" value={value} onChange={(next) => onChange(Number(next))}>{Array.from({ length: count }, (_, offset) => <option key={offset} value={offset}>{healthDateRange(unit, offset).label}</option>)}</TimeSelect>
}

function HeroMetric({ icon: Icon, label, value, detail, progress, color, className, index }: { icon: LucideIcon; label: string; value: string; detail: string; progress: number; color: string; className: string; index: number }) {
  const reduced = useReducedMotion()
  return <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: index * 0.06 }} whileHover={reduced ? undefined : { y: -2, boxShadow: `0 12px 28px ${color}20` }} className={`min-w-0 rounded-xl border p-2.5 shadow-[inset_0_1px_rgba(255,255,255,.08)] backdrop-blur-sm ${className}`}>
    <div className="flex items-center gap-2"><Icon size={19} style={{ color }} /><span className="text-[11px] font-semibold leading-4 text-slate-200">{label}</span></div>
    <div className="mt-2 flex items-center gap-2"><Ring value={progress} color={color} size={58}>{pct(progress)}%</Ring><div className="min-w-0"><strong className="block text-sm text-white">{value}</strong><span className="block text-[10px] leading-4 text-slate-300">{detail}</span></div></div>
  </motion.div>
}

function MealThumbnail({ type }: { type: string }) {
  const isMorning = type === "breakfast"
  const isMain = type === "lunch" || type === "dinner"
  return <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isMorning ? "border-amber-300/20 bg-amber-400/10 text-amber-300" : isMain ? "border-orange-300/20 bg-orange-400/10 text-orange-300" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"}`} aria-hidden="true"><Utensils size={15} /></span>
}

export function HealthMockupOverview(props: Props) {
  const {
    water, waterGoal, calories, calorieGoal, energy, weight, days, history, nutrition,
    goal, streak, planItems, workouts, chartPeriod, analyticsRevision, nutritionPeriod, nutritionOffset, weekOffset, planWeekOffset, onChartPeriodChange,
    onNutritionPeriodChange, onNutritionOffsetChange, onWeekOffsetChange, onPlanWeekOffsetChange, onOpenPanel, onAddWater, onSelectDay, onTogglePlanItem, onToggleWorkout,
  } = props
  const reduced = useReducedMotion()
  const [chartMode, setChartMode] = useState<HealthChartMode>("weight")
  const [trainingPeriod, setTrainingPeriod] = useState<TrainingPeriod>("week")
  const [trainingOffset, setTrainingOffset] = useState(0)
  const [hydrationPeriod, setHydrationPeriod] = useState<WaterPeriod>("today")
  const [hydrationOffset, setHydrationOffset] = useState(0)
  const [planPeriod, setPlanPeriod] = useState<"today" | "week">("today")
  const [analysisView, setAnalysisView] = useState<"nutrition" | "hydration" | "training" | null>(null)
  const [selectedStreakDay, setSelectedStreakDay] = useState<string | null>(null)
  const [showStreakRule, setShowStreakRule] = useState(false)
  const waterPct = waterGoal > 0 ? pct(water / waterGoal * 100) : 0
  const caloriePct = calorieGoal > 0 ? pct(calories / calorieGoal * 100) : 0
  const planned = days.filter((day) => day.planned)
  const complete = planned.filter((day) => day.progress === 100).length
  const completionPct = planned.length ? pct(complete / planned.length * 100) : 0
  const selectedMonday = new Date(`${getCurrentWeekStartString()}T00:00:00`)
  selectedMonday.setDate(selectedMonday.getDate() - weekOffset * 7)
  const weekStart = `${selectedMonday.getFullYear()}-${String(selectedMonday.getMonth() + 1).padStart(2, "0")}-${String(selectedMonday.getDate()).padStart(2, "0")}`
  const selectedPlan = history.plans.find((plan) => plan.week_start === weekStart)
  const snapshot = selectedPlan?.planned_routines && typeof selectedPlan.planned_routines === "object" && !Array.isArray(selectedPlan.planned_routines) ? selectedPlan.planned_routines as Record<string, unknown> : {}
  const hasSnapshot = Object.keys(snapshot).length > 0
  const pastDates = hasSnapshot ? new Set((selectedPlan?.planned_days || []).flatMap((dayNum) => {
    const plannedTypes = snapshot[String(dayNum)]
    if (!Array.isArray(plannedTypes) || !plannedTypes.length) return []
    const date = getDateForWeekdayNum(weekStart, dayNum)
    return plannedTypes.every((type) => history.routine.some((row) => row.date === date && row.routine_type === type && row.completed)) ? [date] : []
  })) : new Set(history.routine.filter((row) => row.week_start === weekStart && row.completed).map((row) => row.date))
  const shownComplete = weekOffset === 0 ? complete : pastDates.size
  const shownTotal = weekOffset === 0 ? planned.length : hasSnapshot ? selectedPlan?.planned_days.length : undefined
  const shownDays = days.map((day, index) => ({ ...day, completed: weekOffset === 0 ? day.progress === 100 : pastDates.has(getDateForWeekdayNum(weekStart, index + 1)) }))
  const series = chartSeries(history, chartMode, chartPeriod, new Date(), nutrition)
  const weightEntries = history.body.filter((row) => row.weight_kg !== null)
  const previousWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2].weight_kg : null
  const goalState = weightProgress(weight, previousWeight, goal)
  const goalReached = goal !== null && weight !== null && (goal.target_weight_kg < goal.start_weight_kg ? weight <= goal.target_weight_kg : weight >= goal.target_weight_kg)
  const today = new Date()
  const nutritionRange = healthDateRange(nutritionPeriod, nutritionOffset, today)
  const nutritionSelected = selectNutritionRange(nutrition, nutritionRange)
  const totals = nutritionTotals(nutritionSelected)
  const periodCalories = totals.calories
  const periodTarget = nutritionPeriod === "today" && nutritionOffset === 0 ? calorieGoal : totals.target
  const periodPct = periodTarget > 0 ? pct(periodCalories / periodTarget * 100) : 0
  const recentSet = new Set(streak.recentDays)
  const trainingRange = healthDateRange(trainingPeriod, trainingOffset, today)
  const training = trainingStatsForRange(history, trainingRange, today)
  const hydrationRange = healthDateRange(hydrationPeriod, hydrationOffset, today)
  const hydration = hydrationPeriod === "today" && hydrationOffset === 0
    ? { liters: water, target: waterGoal, percent: waterPct, daysRecorded: 1, targetDays: 1, discrepancies: [] }
    : waterTotalsForRange(history, hydrationRange)
  const hydrationPct = hydration.percent === null ? 0 : pct(hydration.percent)
  const insight = deriveHealthInsight(history, selectNutritionRange(nutrition, healthDateRange("week", 0, today)), goal, trainingStats(history, "week", today), today)
  const todayString = dateDaysAgo(0, today)
  const highlightedStreakDay = selectedStreakDay ?? todayString
  const highlightedDayDetails = streakDayDetails(history, nutrition, highlightedStreakDay)
  const planRange = healthDateRange("week", planWeekOffset, today)
  const visibleWorkouts = planWeekOffset === 0 ? workouts : historicalWorkoutEntries(history, planRange.start)
  const agenda = [
    ...visibleWorkouts.map((entry) => ({ key: entry.key, date: entry.date, title: `${entry.time ? `${entry.time} · ` : ""}${entry.title}`, completed: entry.completed, workout: entry, item: null as HealthPlanItem | null })),
    ...planItems.map((item) => ({ key: item.id, date: item.date, title: `${item.scheduled_time ? `${item.scheduled_time.slice(0, 5)} · ` : ""}${item.title}`, completed: item.completed, workout: null as WorkoutPlanEntry | null, item })),
  ].filter((entry) => inHealthRange(entry.date, planRange) && (planPeriod === "week" || planWeekOffset !== 0 || entry.date === todayString)).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))

  return <div className="space-y-3">
    <section className="health-hero relative isolate overflow-hidden rounded-xl border border-emerald-300/20 bg-[#071a2a] p-3 sm:p-4">
      <Image src="/images/lifetrack/night-mountains.webp" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#041422]/95 via-[#061827]/72 to-[#041722]/63" />
      <div className="relative grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.55fr)_minmax(0,1.9fr)] xl:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pilares" className="health-pressable inline-flex items-center gap-1.5 rounded-lg border border-sky-200/20 bg-[#091c2c]/70 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:border-emerald-300/40 hover:text-emerald-200"><ArrowLeft size={14} />Volver a Pilares</Link>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase text-emerald-300">Pilar: Salud</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.02] text-white sm:text-5xl">Centro de Salud <span className="text-emerald-300">Física</span></h1>
          <p className="mt-1 text-lg text-sky-100">Un cuerpo fuerte hoy, más libertad mañana.</p>
          <p className="mt-2 max-w-[510px] text-xs leading-5 text-slate-300">Monitorea tu actividad, nutrición, descanso y hábitos para mantener tu mejor versión. Tu salud es el motor de todo lo demás.</p>
          <p className="mt-3 w-fit max-w-full rounded-lg border border-emerald-300/20 bg-[#091e2d]/70 px-3 py-2 text-xs italic text-slate-200">“Cuida tu cuerpo. Es el único lugar que tienes para vivir.”</p>
        </div>
        <div className="relative hidden h-[205px] xl:block"><Image src="/images/lifetrack/health-athlete.webp" alt="" fill sizes="25vw" className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" /></div>
        <div className="min-w-0">
          <p className="mb-3 text-right text-[10px] font-bold uppercase leading-4 text-cyan-200/80">Cuerpo sano<br />Mente clara<br />Vida extraordinaria</p>
          <div className="grid min-w-0 grid-cols-2 gap-2 2xl:grid-cols-4">
            <HeroMetric index={0} icon={Dumbbell} label="Actividad semanal" value={`${complete}/${planned.length} días`} detail="Rutina completada" progress={completionPct} color="#34dca4" className="border-emerald-400/50 bg-emerald-500/15" />
            <HeroMetric index={1} icon={Droplet} label="Hidratación" value={`${water.toFixed(2)} / ${waterGoal.toFixed(1)} L`} detail="Meta diaria" progress={waterPct} color="#35cfff" className="border-cyan-400/50 bg-cyan-500/15" />
            <HeroMetric index={2} icon={Flame} label="Calorías" value={`${Math.round(calories).toLocaleString("es-PE")} kcal`} detail={`de ${Math.round(calorieGoal).toLocaleString("es-PE")}`} progress={caloriePct} color="#ff9b55" className="border-orange-400/50 bg-orange-500/15" />
            <HeroMetric index={3} icon={BatteryCharging} label="Energía" value={energy == null ? "—" : `${energy}/10`} detail="Último registro" progress={energy == null ? 0 : energy * 10} color="#78e971" className="border-lime-400/50 bg-lime-500/15" />
          </div>
        </div>
      </div>
    </section>

    <div className="grid gap-3 xl:grid-cols-[1.4fr_.95fr_.85fr]">
      <section className={panel}>
        <SectionTitle icon={Activity} action={<TimeSelect label="Periodo de progreso" value={chartPeriod} onChange={(value) => onChartPeriodChange(Number(value) as HealthPeriod)}>{([4, 8, 12, 26] as const).map((weeks) => <option key={weeks} value={weeks}>Últimas {weeks} semanas</option>)}</TimeSelect>}>Tu progreso de salud</SectionTitle>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Métrica de progreso">
          {(["weight", "energy", "activity", "calories"] as const).map((mode) => <button key={mode} type="button" role="tab" aria-selected={chartMode === mode} onClick={() => setChartMode(mode)} className={`health-pressable rounded-md border px-3 py-1.5 text-[11px] font-semibold ${chartMode === mode ? "border-emerald-400/55 bg-emerald-400/18 text-emerald-100 shadow-[inset_0_-2px_0_rgba(52,211,153,.55)]" : "border-sky-100/10 text-slate-400 hover:border-emerald-300/30 hover:bg-emerald-400/5 hover:text-white"}`}>{mode === "weight" ? "Peso" : mode === "energy" ? "Energía" : mode === "activity" ? "Actividad" : "Calorías"}</button>)}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div className="h-[205px] min-w-0">
            {series.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 320, height: 205 }}>
              <AreaChart data={series} margin={{ left: 4, right: 12, top: 10, bottom: 8 }}>
                <defs><linearGradient id="health-progress-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20dfa8" stopOpacity={0.38} /><stop offset="100%" stopColor="#20dfa8" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid stroke="#1d3841" strokeDasharray="3 3" />
                <XAxis dataKey="date" height={32} tickMargin={10} tick={{ fill: "#91a8b8", fontSize: 9 }} tickFormatter={(date: string) => date.slice(5)} axisLine={false} tickLine={false} minTickGap={18} />
                <YAxis width={42} tickMargin={10} tick={{ fill: "#91a8b8", fontSize: 9 }} axisLine={false} tickLine={false} domain={chartMode === "activity" ? [0, 7] : ["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#081c29", border: "1px solid #205348", borderRadius: 8, color: "#fff" }} formatter={(value) => [`${value} ${chartMode === "weight" ? "kg" : chartMode === "energy" ? "/10" : chartMode === "activity" ? "días" : "kcal"}`, chartMode === "weight" ? "Peso" : chartMode === "energy" ? "Energía" : chartMode === "activity" ? "Actividad" : "Calorías"]} />
                <Area type="monotone" dataKey="value" stroke="#26dfad" strokeWidth={2.5} fill="url(#health-progress-area)" dot={{ r: 3, fill: "#26dfad" }} activeDot={{ r: 6, fill: "#071c28", stroke: "#6ee7b7", strokeWidth: 2 }} isAnimationActive={!reduced} connectNulls />
              </AreaChart>
            </ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-sky-100/10 p-3 text-center text-xs text-slate-400">Sin registros para este periodo.</div>}
          </div>
          <button type="button" onClick={() => onOpenPanel("progress")} className="health-pressable flex min-w-0 flex-col rounded-lg border border-emerald-300/15 bg-[#0a1f2b] p-3 text-left hover:border-emerald-300/45 hover:bg-[#0c2933]" aria-label="Ver y editar progreso físico y meta de peso">
            <div className="flex items-center gap-2"><span className="rounded-lg border border-sky-300/20 bg-sky-400/10 p-2 text-sky-300"><Scale size={17} /></span><span className="text-[10px] font-semibold text-slate-300">Peso actual</span></div>
            <strong className="mt-2 block text-2xl leading-none text-white">{weight == null ? "—" : `${weight} kg`}</strong>
            <span className={`mt-1.5 text-[10px] font-semibold ${goalState.change == null ? "text-slate-400" : goal && (goal.target_weight_kg < goal.start_weight_kg ? goalState.change < 0 : goalState.change > 0) ? "text-emerald-300" : "text-orange-300"}`}>
              {goalState.change == null ? "Sin registro previo para comparar" : <>{goalState.change < 0 ? <ArrowDown size={12} className="inline" /> : goalState.change > 0 ? <ArrowUp size={12} className="inline" /> : null} {Math.abs(goalState.change)} kg frente al registro anterior</>}
            </span>
            <div className="mt-auto border-t border-sky-100/10 pt-2">
              <div className="flex items-end justify-between gap-2"><span className="text-[10px] text-slate-400">Meta<br /><strong className="text-sm text-white">{goal ? `${goal.target_weight_kg} kg` : "Sin definir"}</strong></span><span className="text-right text-[10px] text-emerald-300">{goal ? goalReached ? "Alcanzada" : goalState.remaining == null ? "Sin peso actual" : `Faltan ${Math.abs(goalState.remaining)} kg` : "Definir meta"} <ArrowRight size={11} className="inline" /></span></div>
              {goal && <><div className="health-meter-track mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100/10"><motion.span initial={reduced ? false : { width: 0 }} animate={{ width: `${goalState.progress ?? 0}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="block h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300" /></div><span className="mt-1 flex justify-between text-[9px] text-slate-400"><span>Objetivo: {goal.target_date}</span><span>{goalState.progress ?? "—"}%</span></span></>}
              <span className="mt-2 block text-[10px] font-semibold text-emerald-300">Gestionar meta <ArrowRight size={11} className="inline" /></span>
            </div>
          </button>
        </div>
      </section>

      <section className={`${panel} flex flex-col justify-between`}>
        <SectionTitle icon={CalendarDays} action={<TimeSelect label="Semana de rutina" value={weekOffset} onChange={(value) => onWeekOffsetChange(Number(value))}>{Array.from({ length: 8 }, (_, offset) => <option key={offset} value={offset}>{offset === 0 ? "Esta semana" : `Hace ${offset} semana${offset > 1 ? "s" : ""}`}</option>)}</TimeSelect>}>Cumplimiento de rutina semanal</SectionTitle>
        <div className="grid grid-cols-7 gap-1">{shownDays.map((day) => <button key={day.id} type="button" onClick={() => weekOffset === 0 && onSelectDay(day.id)} disabled={weekOffset !== 0} title={`${day.name}: ${day.completed ? weekOffset > 0 && !hasSnapshot ? "actividad registrada" : "rutina completada" : "sin cumplimiento"}`} className="health-pressable group flex min-w-0 flex-col items-center gap-2 rounded-lg py-1.5 enabled:hover:bg-emerald-400/10 disabled:cursor-default"><span className="text-[10px] text-slate-400 group-hover:text-slate-200">{day.name.slice(0, 3)}</span><span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-transform enabled:group-hover:scale-110 ${day.completed ? "border-emerald-400 bg-emerald-400/35 text-emerald-100 shadow-[0_0_13px_rgba(52,211,153,.28)]" : "border-sky-300/25 text-slate-500 group-hover:border-emerald-300/50"}`}>{day.completed && <Check size={18} strokeWidth={2.5} />}</span></button>)}</div>
        <div className="mt-3 flex items-end justify-between"><div><strong className="text-2xl text-white">{shownComplete}{shownTotal === undefined ? " días" : `/${shownTotal}`}</strong><p className="text-[10px] text-slate-400">{shownTotal === undefined ? "días con actividad registrada; sin plan desglosado" : "días planificados completados"}</p></div>{shownTotal !== undefined && shownTotal > 0 && <span className="text-xs text-emerald-300">{pct(shownComplete / shownTotal * 100)}%</span>}</div>
        {shownTotal !== undefined && shownTotal > 0 && <div className="health-meter-track mt-2 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${pct(shownComplete / shownTotal * 100)}%` }} className="h-full rounded-full bg-emerald-400" /></div>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-1.5 text-[10px] italic text-emerald-200"><Dumbbell size={13} />“La constancia de hoy es el resultado de mañana.”</p><button type="button" onClick={() => onOpenPanel("routine")} className="health-action inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white">Gestionar <ArrowRight size={12} /></button></div>
      </section>

      <section className={`${panel} health-surface--amber flex flex-col`}>
        <SectionTitle icon={Flame} tone="orange">Racha de hábitos</SectionTitle>
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-300/25 bg-orange-400/15 text-orange-300"><Flame size={25} /></span><div className="min-w-0"><strong className="text-2xl text-white">{streak.current} días</strong><p className="text-[10px] text-slate-400">con registro de salud consecutivo</p></div><span className="ml-auto shrink-0 text-right text-[10px] text-slate-400">Mejor racha<br /><strong className="text-white">{streak.best} días</strong></span></div>
        <div className="mt-4 flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-300">Últimos 14 días</span><span className="text-emerald-300">{streak.recentDays.length}/14 con registro</span></div>
        <div className="mt-2 grid flex-1 grid-cols-7 gap-1.5" role="group" aria-label="Actividad de los últimos 14 días">{Array.from({ length: 14 }, (_, index) => { const date = dateDaysAgo(13 - index, today); const active = recentSet.has(date); const day = new Date(`${date}T00:00:00`); const details = streakDayDetails(history, nutrition, date); return <motion.button key={date} type="button" onClick={() => setSelectedStreakDay(date)} initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} whileHover={reduced ? undefined : { y: -2, scale: 1.04 }} transition={{ delay: reduced ? 0 : index * 0.025 }} title={`${date}: ${details.sources.join(", ") || "sin registro"}`} aria-label={`${date}: ${active ? details.sources.join(", ") || "con registro" : "sin registro"}`} aria-pressed={highlightedStreakDay === date} className={`flex min-h-10 flex-col items-center justify-center rounded-lg border text-[10px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-300 ${highlightedStreakDay === date ? "border-orange-300 bg-orange-400/15 text-white" : active ? "border-emerald-300/55 bg-emerald-400/20 text-emerald-200 hover:border-emerald-200 hover:bg-emerald-400/30" : "border-sky-100/10 bg-[#0a202c] text-slate-500 hover:border-sky-300/40 hover:text-slate-200"}`}><span className="text-[8px] uppercase">{day.toLocaleDateString("es-PE", { weekday: "short" }).slice(0, 2)}</span><strong>{day.getDate()}</strong></motion.button> })}</div>
        <div className="mt-2 min-h-10 border-t border-sky-100/10 pt-2 text-[10px]" aria-live="polite"><strong className="text-slate-200">{highlightedStreakDay}</strong><p className={highlightedDayDetails.active ? "text-emerald-200" : "text-slate-400"}>{highlightedDayDetails.sources.join(" · ") || "Sin registros de salud ese día"}</p></div>
        <button type="button" onClick={() => setShowStreakRule((value) => !value)} aria-expanded={showStreakRule} className="health-pressable mt-2 w-full rounded-md p-1 text-left outline-none hover:bg-orange-400/5 focus-visible:ring-2 focus-visible:ring-orange-300"><span className="flex justify-between text-[10px] text-slate-400"><span>Racha actual frente a tu récord</span><strong className="text-orange-200">{streak.best ? `${pct(streak.current / streak.best * 100)}%` : "—"}</strong></span><span className="health-meter-track mt-1 block h-1.5 overflow-hidden rounded-full bg-sky-100/10"><motion.span initial={reduced ? false : { width: 0 }} animate={{ width: `${streak.best ? pct(streak.current / streak.best * 100) : 0}%` }} className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-300" /></span></button>
        {showStreakRule && <p className="mt-2 text-[10px] leading-4 text-slate-400">Se cuentan días consecutivos con comida, agua, rutina, peso o ajuste manual registrado. La racha sigue vigente si el último registro fue hoy o ayer.</p>}
      </section>
    </div>

    <div className="grid gap-3 xl:grid-cols-[1fr_1.15fr_1fr]">
      <section className={`${panel} flex flex-col`}>
        <SectionTitle icon={Utensils} action={<div className="flex items-center gap-2"><TimeSelect label="Periodo de nutrición" value={nutritionPeriod} onChange={(value) => { onNutritionPeriodChange(value as NutritionPeriod); onNutritionOffsetChange(0) }}><option value="today">Hoy</option><option value="week">Semana</option><option value="month">Mes</option></TimeSelect><button type="button" onClick={() => setAnalysisView("nutrition")} className="health-action inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white">Análisis <ArrowRight size={12} /></button></div>}>Nutrición y alimentación</SectionTitle>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><HistoryOffset unit={nutritionPeriod} value={nutritionOffset} onChange={onNutritionOffsetChange} /><button type="button" onClick={() => onOpenPanel("nutrition")} className="health-action text-[11px] font-semibold text-emerald-300 hover:text-white">Comidas y macros <ArrowRight size={12} className="inline" /></button></div>
        <div className="flex flex-1 flex-wrap items-center gap-4"><Ring value={periodPct} color="#25dda5" size={108}><span className="text-base">{Math.round(periodCalories).toLocaleString("es-PE")}<small className="block text-[10px] font-normal">kcal · {periodPct}%</small></span></Ring><div className="min-w-0 flex-1 space-y-1.5"><p className="text-[11px] text-slate-300">{nutritionPeriod === "today" ? "Meta diaria" : "Meta de días registrados"}: <strong className="text-white">{periodTarget > 0 ? `${Math.round(periodTarget).toLocaleString("es-PE")} kcal` : "Sin datos"}</strong></p>{([ ["Proteínas", totals.protein, totals.proteinKnown, "bg-cyan-400", "text-cyan-300", HeartPulse], ["Carbohidratos", totals.carbs, totals.carbsKnown, "bg-emerald-400", "text-emerald-300", Leaf], ["Grasas", totals.fat, totals.fatKnown, "bg-amber-400", "text-orange-300", Zap] ] as const).map(([label, amount, known, color, iconColor, Icon]) => { const complete = known === totals.mealCount && known > 0; const share = !complete || amount == null || periodCalories <= 0 ? null : pct(amount * (label === "Grasas" ? 9 : 4) / periodCalories * 100); return <div key={label} className="flex items-center gap-1.5 text-[10px]"><Icon size={12} className={`shrink-0 ${iconColor}`} /><span className="w-20 text-slate-300">{label}</span><div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10"><span className={`block h-full ${color}`} style={{ width: `${share ?? 0}%` }} /></div><span className="w-16 text-right text-white" title={`${known} de ${totals.mealCount} comidas con este macro`}>{amount == null ? totals.mealCount === 0 ? "0 g" : "—" : `${amount} g${complete ? "" : "*"}`}</span><span className="w-7 text-right text-slate-400">{share == null ? "—" : `${share}%`}</span></div> })}{totals.mealCount > 0 && [totals.proteinKnown, totals.carbsKnown, totals.fatKnown].some((count) => count < totals.mealCount) && <p className="text-[10px] text-slate-400">* Total parcial. Completa los macros de las comidas en Ver más.</p>}</div></div>
      </section>
      <section className={`${panel} flex flex-col`}>
        <SectionTitle icon={Utensils} action={<button type="button" onClick={() => onOpenPanel("nutrition")} className="health-action inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white">Agregar comida <ArrowRight size={12} /></button>}>Registro de comidas</SectionTitle>
        <div className="space-y-1.5">{nutritionSelected.meals.length ? nutritionSelected.meals.slice(0, 4).map((meal) => <button key={meal.id} type="button" onClick={() => onOpenPanel("nutrition")} className="health-pressable flex w-full min-w-0 items-center gap-2 rounded-lg border border-sky-100/10 bg-[#071723] px-2 py-2 text-left hover:border-emerald-300/35 hover:bg-[#0b2730]"><MealThumbnail type={meal.meal_type} /><span className="min-w-0 flex-1"><strong className="block text-[11px] text-white">{getMealTypeLabel(meal.meal_type)}</strong><span className="block truncate text-[10px] text-slate-300" title={meal.meal_description}>{meal.meal_description}</span></span><span className="shrink-0 text-[10px] text-slate-300">{Math.round(meal.estimated_calories)} kcal<br />{new Date(meal.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</span><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-400 text-[#071c28]"><Check size={12} strokeWidth={3} /></span></button>) : <p className="rounded-lg border border-dashed border-sky-100/15 bg-[#081d29]/60 p-6 text-center text-xs text-slate-400">Sin comidas registradas en este periodo.</p>}</div>
      </section>
      <section className={`${panel} flex flex-col`}>
        <SectionTitle icon={Dumbbell} action={<div className="flex items-center gap-2"><TimeSelect label="Periodo de entrenamiento" value={trainingPeriod} onChange={(value) => { setTrainingPeriod(value as TrainingPeriod); setTrainingOffset(0) }}><option value="today">Hoy</option><option value="week">Semana</option><option value="month">Mes</option></TimeSelect><button type="button" onClick={() => setAnalysisView("training")} className="health-action inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white">Análisis <ArrowRight size={12} /></button></div>}>Entrenamiento</SectionTitle>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><HistoryOffset unit={trainingPeriod} value={trainingOffset} onChange={setTrainingOffset} /><button type="button" onClick={() => onOpenPanel("routine")} className="health-action text-[11px] font-semibold text-emerald-300 hover:text-white">Gestionar <ArrowRight size={12} className="inline" /></button></div>
        <div className="flex flex-1 items-center gap-4"><Ring value={training.percent} color="#25dda5" size={100}><span>{training.completedDays}/{training.plannedDays ?? "—"}<small className="block text-[10px] font-normal">días</small></span></Ring><div className="min-w-0 flex-1 space-y-1.5"><p className="text-[10px] text-slate-400">Cumplimiento por tipo</p>{training.byType.map((row) => { const style = { fuerza: { icon: Dumbbell, color: "text-sky-300", bar: "bg-sky-400" }, cardio: { icon: HeartPulse, color: "text-rose-300", bar: "bg-rose-400" }, movilidad: { icon: Activity, color: "text-emerald-300", bar: "bg-emerald-400" }, hiit: { icon: Zap, color: "text-amber-300", bar: "bg-amber-400" } }[row.type]; const Icon = style.icon; return <div key={row.type} className="flex items-center gap-2 text-[10px]"><Icon size={13} className={`shrink-0 ${style.color}`} /><span className="w-14 text-slate-300">{ROUTINE_LABELS[row.type]}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sky-100/10"><span className={`block h-full rounded-full ${style.bar}`} style={{ width: `${row.percent ?? 0}%` }} /></div><span className="w-8 text-right text-slate-200">{row.completed}/{row.planned ?? "—"}</span></div> })}</div></div>
        {training.plannedDays === null && <p className="mt-2 text-[10px] text-slate-400">Sin plan histórico completo para calcular el porcentaje.</p>}
      </section>
    </div>

    <div className="grid gap-3 xl:grid-cols-[.9fr_1.15fr_1fr]">
      <section className={`${panel} health-surface--cyan flex flex-col`}>
        <SectionTitle icon={Droplet} tone="cyan" action={<div className="flex items-center gap-2"><TimeSelect label="Periodo de hidratación" value={hydrationPeriod} onChange={(value) => { setHydrationPeriod(value as WaterPeriod); setHydrationOffset(0) }}><option value="today">Hoy</option><option value="week">Semana</option><option value="month">Mes</option></TimeSelect><button type="button" onClick={() => setAnalysisView("hydration")} className="health-action health-action--cyan text-[11px] font-semibold text-cyan-300 hover:text-white">Análisis <ArrowRight size={12} className="inline" /></button></div>}>Hidratación</SectionTitle>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><HistoryOffset unit={hydrationPeriod} value={hydrationOffset} onChange={setHydrationOffset} /><button type="button" onClick={() => onOpenPanel("hydration")} className="health-action health-action--cyan text-[11px] font-semibold text-cyan-300 hover:text-white">Registrar y meta <ArrowRight size={12} className="inline" /></button></div>
        <div className="flex flex-1 flex-wrap items-center gap-3"><HealthWaterGlass percent={hydrationPct} /><div><strong className="text-lg text-white">{hydration.liters.toFixed(2)} L</strong><p className="text-[10px] text-slate-400">{hydration.percent !== null ? `de ${hydration.target.toFixed(2)} L · ${hydration.percent}%` : "Meta incompleta en este periodo"}</p></div></div>
        <p className="mt-2 text-[10px] leading-4 text-cyan-100/80">{hydrationPeriod === "today" && hydrationOffset === 0 ? hydrationReminder(water, waterGoal, today.getHours()) : `${hydration.daysRecorded} día${hydration.daysRecorded === 1 ? "" : "s"} con tracker; ${hydration.targetDays} con meta.`}</p>
        <button type="button" onClick={onAddWater} disabled={hydrationPeriod !== "today" || hydrationOffset !== 0 || water >= 10} className="health-pressable mt-2 self-start rounded-lg border border-cyan-400/40 bg-cyan-400/12 px-3 py-1.5 text-[11px] font-semibold text-cyan-100 hover:border-cyan-300/70 hover:bg-cyan-400/20 disabled:opacity-50">+ 250 ml</button>
      </section>
      <section className={`${panel} health-surface--insight flex flex-col`}><HealthAiReading fallback={insight} revision={analyticsRevision} /></section>
      <section className={`${panel} flex h-[300px] min-h-0 flex-col overflow-hidden`}>
        <SectionTitle icon={CalendarDays} action={<button type="button" onClick={() => onOpenPanel("plan")} className="health-action text-[11px] font-semibold text-emerald-300 hover:text-white">Ver todo <ArrowRight size={12} className="inline" /></button>}>Plan semanal de salud</SectionTitle>
        <div className="mb-2 flex flex-wrap gap-2"><TimeSelect label="Vista del plan" value={planPeriod} onChange={(value) => setPlanPeriod(value as "today" | "week")}><option value="today" disabled={planWeekOffset !== 0}>Hoy</option><option value="week">Semana</option></TimeSelect><TimeSelect label="Semana del plan" value={planWeekOffset} onChange={(value) => { const offset = Number(value); onPlanWeekOffsetChange(offset); if (offset > 0) setPlanPeriod("week") }}>{Array.from({ length: 8 }, (_, offset) => <option key={offset} value={offset}>{healthDateRange("week", offset).label}</option>)}</TimeSelect></div>
        <div className="health-plan-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1" aria-label="Actividades del plan seleccionado">{agenda.map((entry) => <button key={entry.key} type="button" disabled={planWeekOffset !== 0} onClick={() => entry.workout ? onToggleWorkout(entry.workout) : entry.item && onTogglePlanItem(entry.item)} className="health-pressable flex w-full min-w-0 items-start gap-2 rounded-md border border-transparent px-1.5 py-1.5 text-left text-[11px] text-slate-300 enabled:hover:border-emerald-300/15 enabled:hover:bg-emerald-400/8 enabled:hover:text-white disabled:cursor-default"><span className="mt-0.5 shrink-0 text-emerald-300">{entry.completed ? <CircleCheck size={14} /> : <span className="block h-3.5 w-3.5 rounded-sm border border-emerald-300/50" />}</span><span className="min-w-0 flex-1 truncate" title={entry.title}>{planPeriod === "week" || planWeekOffset > 0 ? `${entry.date.slice(5)} · ` : ""}{entry.title}</span></button>)}{!agenda.length && <p className="py-5 text-center text-xs text-slate-400">Sin actividades planificadas en esta vista.</p>}</div>
        {planWeekOffset === 0 && <button type="button" onClick={() => onOpenPanel("plan")} className="health-action mt-2 self-start text-[11px] font-semibold text-emerald-300 hover:text-white">Agregar objetivo <ArrowRight size={12} className="inline" /></button>}
      </section>
    </div>
    <LifeTrackFooter />
    <Dialog.Root open={analysisView !== null} onOpenChange={(open) => { if (!open) setAnalysisView(null) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="health-dialog-overlay fixed inset-0 z-[70] bg-[#020c15]/85 backdrop-blur-sm" />
        <Dialog.Content className="health-dialog-content health-analysis-modal fixed inset-x-2 top-1/2 z-[71] mx-auto max-h-[90dvh] w-[calc(100%-1rem)] max-w-3xl -translate-y-1/2 overflow-y-auto rounded-xl border border-emerald-300/25 bg-[#071a29] p-4 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,.7)] outline-none sm:p-5">
          <Dialog.Title className="sr-only">Análisis histórico de salud</Dialog.Title>
          <Dialog.Description className="sr-only">Comparación con el periodo anterior y registros del periodo seleccionado.</Dialog.Description>
          <Dialog.Close className="health-dialog-close absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100/15 text-slate-300 hover:border-emerald-300/40 hover:text-white" aria-label="Cerrar análisis"><X size={16} /></Dialog.Close>
          {analysisView && <HealthAnalysisPanel view={analysisView} range={analysisView === "nutrition" ? nutritionRange : analysisView === "hydration" ? hydrationRange : trainingRange} history={history} nutrition={nutrition} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>
}
