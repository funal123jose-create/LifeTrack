"use client"

import { useState } from "react"
import { Check, Clock3, Plus, Trash2 } from "lucide-react"
import { getCurrentWeekEndString, getCurrentWeekStartString, getLocalDateString } from "@/lib/date"
import type { HealthPlanItem, WorkoutPlanEntry } from "@/lib/health-plan"
import { healthDateRange } from "@/lib/health-periods"

type Input = { date: string; category: string; title: string; scheduled_time: string | null; target_value: number | null; target_unit: string | null }

export function HealthPlanManager({ items, workouts, weekOffset, onAdd, onToggleItem, onDeleteItem, onToggleWorkout }: {
  items: HealthPlanItem[]
  workouts: WorkoutPlanEntry[]
  weekOffset: number
  onAdd: (input: Input) => Promise<boolean>
  onToggleItem: (item: HealthPlanItem) => void
  onDeleteItem: (id: string) => void
  onToggleWorkout: (entry: WorkoutPlanEntry) => void
}) {
  const [date, setDate] = useState(getLocalDateString())
  const [category, setCategory] = useState("nutrition")
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [target, setTarget] = useState("")
  const [unit, setUnit] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = target.trim() ? Number(target) : null
    if (title.trim().length < 2 || title.trim().length > 160 || date < getCurrentWeekStartString() || date > getCurrentWeekEndString() || (amount !== null && (!Number.isFinite(amount) || amount <= 0))) {
      setError("Revisa la fecha, el nombre y el objetivo.")
      return
    }
    setSaving(true)
    setError("")
    const okay = await onAdd({ date, category, title: title.trim(), scheduled_time: time || null, target_value: amount, target_unit: unit.trim() || null })
    setSaving(false)
    if (okay) { setTitle(""); setTarget(""); setUnit("") }
    else setError("No se pudo guardar el objetivo.")
  }
  const all = [
    ...workouts.map((entry) => ({ key: entry.key, date: entry.date, title: entry.title, time: entry.time, category: "Entrenamiento", completed: entry.completed, workout: entry, item: null as HealthPlanItem | null })),
    ...items.map((item) => ({ key: item.id, date: item.date, title: item.title, time: item.scheduled_time, category: ({ nutrition: "Nutrición", hydration: "Hidratación", measurement: "Peso y medidas", other: "Otro" } as Record<string, string>)[item.category] || "Otro", completed: item.completed, workout: null as WorkoutPlanEntry | null, item })),
  ].sort((a, b) => a.date.localeCompare(b.date) || (a.time || "99:99").localeCompare(b.time || "99:99"))

  if (weekOffset > 0) return <section className="rounded-xl border border-emerald-300/15 bg-[#081f2b] p-4"><h3 className="mb-1 text-sm font-bold text-white">{healthDateRange("week", weekOffset).label}</h3><p className="mb-3 text-[11px] text-slate-400">Vista histórica de solo lectura. Las rutinas antiguas muestran tipo y cumplimiento; el detalle y la hora no se conservaron en los planes previos.</p>{all.length ? <div className="space-y-1.5">{all.map((entry) => <div key={entry.key} className="flex items-center gap-2 rounded-lg border border-sky-100/10 p-2 text-xs"><span className={entry.completed ? "text-emerald-300" : "text-slate-500"}><Check size={15} /></span><span className="flex-1 text-slate-200">{entry.date} · {entry.title}</span><span className="text-slate-400">{entry.completed ? "Completado" : "Pendiente"}</span></div>)}</div> : <p className="py-5 text-xs text-slate-400">No hay plan desglosado ni objetivos guardados para esta semana.</p>}</section>

  return <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
    <section className="min-w-0 rounded-xl border border-emerald-300/15 bg-[#081f2b] p-4"><h3 className="mb-3 text-sm font-bold text-white">Agenda de esta semana</h3>{all.length ? <div className="health-plan-scroll max-h-[55dvh] space-y-1.5 overflow-y-auto pr-1">{all.map((entry) => <div key={entry.key} className="flex min-w-0 items-center gap-2 rounded-lg border border-sky-100/10 bg-[#071923] p-2"><button type="button" onClick={() => entry.workout ? onToggleWorkout(entry.workout) : entry.item && onToggleItem(entry.item)} aria-label={`${entry.completed ? "Marcar pendiente" : "Marcar completado"}: ${entry.title}`} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${entry.completed ? "border-emerald-300 bg-emerald-400 text-[#06251c]" : "border-sky-100/25 text-transparent hover:border-emerald-300"}`}><Check size={15} /></button><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-100" title={entry.title}>{entry.title}</strong><span className="text-[10px] text-slate-400">{entry.date} · {entry.category}{entry.time ? ` · ${entry.time.slice(0, 5)}` : ""}{entry.item?.target_value ? ` · ${entry.item.target_value} ${entry.item.target_unit || ""}` : ""}</span></div>{entry.item && <button type="button" onClick={() => onDeleteItem(entry.item!.id)} aria-label={`Eliminar ${entry.title}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-400/10 hover:text-orange-300"><Trash2 size={14} /></button>}</div>)}</div> : <p className="rounded-lg border border-dashed border-sky-100/15 p-6 text-center text-xs text-slate-400">Sin actividades planificadas esta semana.</p>}</section>
    <form onSubmit={save} className="space-y-3 rounded-xl border border-emerald-300/15 bg-[#081f2b] p-4"><div><h3 className="text-sm font-bold text-white">Nuevo objetivo de salud</h3><p className="mt-1 text-[11px] text-slate-400">Las rutinas se editan en Plan y entrenamiento; aquí agregas otros objetivos sin duplicarlas.</p></div><div className="grid gap-2 sm:grid-cols-2"><label className="text-[11px] text-slate-300">Día<input type="date" min={getCurrentWeekStartString()} max={getCurrentWeekEndString()} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white" /></label><label className="text-[11px] text-slate-300">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white"><option value="nutrition">Nutrición</option><option value="hydration">Hidratación</option><option value="measurement">Peso y medidas</option><option value="other">Otro</option></select></label></div><label className="block text-[11px] text-slate-300">Actividad<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Ej. preparar almuerzo o registrar peso" className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-3 py-2 text-white" /></label><div className="grid grid-cols-3 gap-2"><label className="text-[11px] text-slate-300"><span className="flex items-center gap-1"><Clock3 size={11} /> Hora</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white" /></label><label className="text-[11px] text-slate-300">Objetivo<input type="number" min="0" step="0.1" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Opcional" className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white" /></label><label className="text-[11px] text-slate-300">Unidad<input value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={20} placeholder="g, L, kg" className="mt-1 w-full rounded-lg border border-sky-100/15 bg-[#092331] px-2 py-2 text-white" /></label></div>{error && <p role="alert" className="text-xs text-orange-300">{error}</p>}<button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-[#06251e] hover:bg-emerald-400 disabled:opacity-50"><Plus size={15} />{saving ? "Guardando..." : "Agregar al plan"}</button></form>
  </div>
}
