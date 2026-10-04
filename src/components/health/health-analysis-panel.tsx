"use client"

import { AlertCircle, ArrowRightLeft, CalendarDays, Droplet, Dumbbell, Utensils } from "lucide-react"
import { nutritionTotals, selectNutritionRange, waterTotalsForRange, type HealthHistory, type NutritionHistory } from "@/lib/health-analytics"
import { comparablePreviousRange, inHealthRange, type HealthDateRange } from "@/lib/health-periods"
import { ROUTINE_LABELS, trainingStatsForRange } from "@/lib/health-training"

type View = "nutrition" | "hydration" | "training"

function Comparison({ current, previous, unit, available }: { current: number; previous: number; unit: string; available: boolean }) {
  if (!available) return <span className="text-slate-400">Sin base comparable registrada.</span>
  const change = Math.round((current - previous) * 100) / 100
  return <span className="text-slate-200">{change > 0 ? "+" : ""}{change.toLocaleString("es-CO")} {unit} {previous > 0 ? `(${change > 0 ? "+" : ""}${Math.round(change / previous * 100)}%)` : ""}</span>
}

export function HealthAnalysisPanel({ view, range, history, nutrition }: { view: View; range: HealthDateRange; history: HealthHistory; nutrition: NutritionHistory }) {
  const previous = comparablePreviousRange(range)
  const title = view === "nutrition" ? "Análisis de nutrición" : view === "hydration" ? "Análisis de hidratación" : "Análisis de entrenamiento"
  const Icon = view === "nutrition" ? Utensils : view === "hydration" ? Droplet : Dumbbell
  const nowNutrition = nutritionTotals(selectNutritionRange(nutrition, range))
  const beforeNutrition = nutritionTotals(selectNutritionRange(nutrition, previous))
  const nowWater = waterTotalsForRange(history, range)
  const beforeWater = waterTotalsForRange(history, previous)
  const nowTraining = trainingStatsForRange(history, range)
  const beforeTraining = trainingStatsForRange(history, previous)
  const value = view === "nutrition" ? nowNutrition.calories : view === "hydration" ? nowWater.liters : nowTraining.completedDays
  const oldValue = view === "nutrition" ? beforeNutrition.calories : view === "hydration" ? beforeWater.liters : beforeTraining.completedDays
  const unit = view === "nutrition" ? "kcal" : view === "hydration" ? "L" : "días"
  const comparable = view === "nutrition"
    ? beforeNutrition.mealCount > 0 || beforeNutrition.manualCalories !== 0
    : view === "hydration" ? beforeWater.daysRecorded > 0 : beforeTraining.plannedDays !== null || beforeTraining.completedDays > 0
  const discrepancies = view === "nutrition" ? nowNutrition.discrepancies : view === "hydration" ? nowWater.discrepancies : []

  return <div className="space-y-4 text-xs">
    <div className="flex items-center gap-2"><Icon size={18} className="text-emerald-300" /><div><h3 className="text-base font-bold text-white">{title}</h3><p className="text-slate-400">{range.label}: {range.start} a {range.end}</p></div></div>
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/[0.06] p-3"><span className="text-slate-400">Periodo seleccionado</span><strong className="mt-1 block text-lg text-white">{value.toLocaleString("es-CO")} {unit}</strong></div>
      <div className="rounded-lg border border-sky-100/15 bg-[#0a2230] p-3"><span className="text-slate-400">{previous.label}</span><strong className="mt-1 block text-lg text-white">{comparable ? `${oldValue.toLocaleString("es-CO")} ${unit}` : "Sin datos"}</strong></div>
      <div className="rounded-lg border border-sky-100/15 bg-[#0a2230] p-3"><span className="flex items-center gap-1 text-slate-400"><ArrowRightLeft size={12} /> Diferencia</span><strong className="mt-1 block text-sm"><Comparison current={value} previous={oldValue} unit={unit} available={comparable} /></strong></div>
    </div>
    {range.offset === 0 && range.unit !== "today" && <p className="text-[11px] text-slate-400">El periodo anterior se compara hasta el mismo día transcurrido; no se enfrentan días futuros con días completos.</p>}
    {view === "nutrition" && <>
      <div className="grid gap-2 sm:grid-cols-3">{([ ["Proteínas", nowNutrition.protein, nowNutrition.proteinKnown], ["Carbohidratos", nowNutrition.carbs, nowNutrition.carbsKnown], ["Grasas", nowNutrition.fat, nowNutrition.fatKnown] ] as const).map(([label, grams, known]) => <div key={label} className="rounded-lg border border-sky-100/10 p-3"><span className="text-slate-400">{label}</span><strong className="block text-white">{grams === null ? nowNutrition.mealCount === 0 ? "0 g" : "Sin estimación" : `${grams} g${known < nowNutrition.mealCount ? " · parcial" : ""}`}</strong><small className="text-slate-500">{known}/{nowNutrition.mealCount} comidas con dato</small></div>)}</div>
      <div className="max-h-48 overflow-auto rounded-lg border border-sky-100/10 p-2"><h4 className="mb-2 font-semibold text-white">Comidas del periodo</h4>{nutrition.meals.filter((meal) => inHealthRange(meal.date, range)).map((meal) => <div key={meal.id} className="flex justify-between gap-3 border-t border-sky-100/10 py-1.5"><span className="min-w-0 truncate text-slate-300">{meal.date} · {meal.meal_description}</span><span className="shrink-0 text-white">{meal.estimated_calories} kcal</span></div>)}{nowNutrition.mealCount === 0 && <p className="text-slate-400">Sin comidas registradas.</p>}</div>
    </>}
    {view === "hydration" && <div className="max-h-48 overflow-auto rounded-lg border border-sky-100/10 p-2"><h4 className="mb-2 font-semibold text-white">Consumo por fecha</h4>{[...new Set(history.water.filter((row) => inHealthRange(row.date, range)).map((row) => row.date))].sort().reverse().map((date) => <div key={date} className="flex justify-between border-t border-sky-100/10 py-1.5"><span className="text-slate-300">{date}</span><span className="text-white">{history.water.filter((row) => row.date === date).reduce((sum, row) => sum + row.amount_liters, 0).toFixed(2)} L</span></div>)}{nowWater.liters === 0 && <p className="text-slate-400">Sin agua registrada en este periodo.</p>}<p className="mt-2 text-slate-400">Meta registrada en {nowWater.targetDays}/{nowWater.daysRecorded} días; cumplimiento {nowWater.percent === null ? "no calculable" : `${nowWater.percent}%`}.</p></div>}
    {view === "training" && <div className="rounded-lg border border-sky-100/10 p-3"><h4 className="mb-2 font-semibold text-white">Sesiones por tipo</h4>{nowTraining.byType.map((row) => { const old = beforeTraining.byType.find((item) => item.type === row.type); return <div key={row.type} className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-sky-100/10 py-1.5"><span className="text-slate-300">{ROUTINE_LABELS[row.type]}</span><span className="text-white">{row.completed}/{row.planned ?? "—"}</span><span className="text-slate-400">Anterior: {old?.completed ?? 0}/{old?.planned ?? "—"}</span></div> })}<p className="mt-2 text-slate-400">El porcentaje solo se calcula cuando existe un plan semanal desglosado. Los registros anteriores a ese desglose muestran sesiones sin inventar un denominador.</p></div>}
    {discrepancies.length > 0 && <div className="rounded-lg border border-amber-300/25 bg-amber-400/[0.06] p-3"><p className="flex items-center gap-2 font-semibold text-amber-200"><AlertCircle size={14} /> Registros heredados no conciliados</p>{discrepancies.map((row) => <p key={row.date} className="mt-1 text-slate-300">{row.date}: tracker {row.tracker} {unit}; eventos {view === "nutrition" ? ("calculated" in row ? row.calculated : 0) : ("logged" in row ? row.logged : 0)} {unit}.</p>)}<p className="mt-2 text-[11px] text-slate-400">Se muestran los eventos como fuente principal. No se alteró el tracker histórico.</p></div>}
    <p className="flex items-center gap-1 text-[10px] text-slate-500"><CalendarDays size={11} /> Fechas de calendario de tu zona local.</p>
  </div>
}
