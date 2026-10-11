"use client"

import { PillarDateField } from "@/components/pillars/pillar-date-field"
import { HealthPeriodSelect } from "./health-period-select"
import { useRef, useState } from "react"
import { CalendarDays, Check, Clock3, Loader2, Plus, Trash2 } from "lucide-react"
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const objectiveRef = useRef<HTMLFormElement>(null)
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

  return <div className="hf-plan-workspace">
    <section className="hf-week-agenda"><h3><CalendarDays size={18} /> Agenda de esta semana <span>{all.length}</span></h3>
      <button type="button" className="hf-objective-link" onClick={() => { objectiveRef.current?.scrollIntoView({ block: "start" }); objectiveRef.current?.querySelector("input")?.focus({ preventScroll: true }) }}><Plus size={16} /> Agregar objetivo</button>
      <nav className="hf-day-filter" aria-label="Filtrar agenda por día"><button type="button" aria-pressed={selectedDate === null} onClick={() => setSelectedDate(null)}>Toda la semana</button>{[...new Set(all.map((entry) => entry.date))].map((day) => <button key={day} type="button" aria-pressed={selectedDate === day} onClick={() => setSelectedDate(day)}>{new Date(`${day}T12:00:00`).toLocaleDateString("es-CO", { weekday: "short", day: "numeric" })}</button>)}</nav>
      {all.length ? <div className="hf-day-groups">{[...new Set(all.map((entry) => entry.date))].filter((day) => selectedDate === null || day === selectedDate).map((day) => <section key={day} className="hf-agenda-day"><h4><time dateTime={day}>{new Date(`${day}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })}</time></h4>{all.filter((entry) => entry.date === day).map((entry) => <div key={entry.key} className="hf-agenda-entry" data-completed={entry.completed}><button type="button" role="checkbox" aria-checked={entry.completed} onClick={() => entry.workout ? onToggleWorkout(entry.workout) : entry.item && onToggleItem(entry.item)} aria-label={`${entry.completed ? "Marcar pendiente" : "Marcar completado"}: ${entry.title}`} className="hf-agenda-check"><Check size={16} /></button><div><strong>{entry.title}</strong><span>{entry.category}{entry.time ? ` · ${entry.time.slice(0, 5)}` : ""}{entry.item?.target_value ? ` · ${entry.item.target_value} ${entry.item.target_unit || ""}` : ""}</span></div>{entry.item && <button type="button" onClick={() => onDeleteItem(entry.item!.id)} aria-label={`Eliminar ${entry.title}`} title={`Eliminar ${entry.title}`} className="hf-icon-button"><Trash2 size={15} /></button>}</div>)}</section>)}</div> : <p className="hf-empty">Sin actividades planificadas esta semana.</p>}</section>
    <form ref={objectiveRef} onSubmit={save} className="hf-objective-form"><div><h3><Plus size={18} /> Nuevo objetivo de salud</h3><p>Las rutinas se editan en Plan y entrenamiento; aquí agregas otros objetivos sin duplicarlas.</p></div>
      <label>Actividad<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Ej. preparar almuerzo o registrar peso" /></label>
      <div className="hf-objective-fields"><PillarDateField id="health-plan-date" label="Día" tone="health" min={getCurrentWeekStartString()} max={getCurrentWeekEndString()} value={date} onChange={setDate} /><label><span className="flex items-center gap-1"><Clock3 size={14} /> Hora</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
      <div><span className="hf-field-label">Categoría</span><HealthPeriodSelect label="Categoría del objetivo" value={category} onChange={setCategory}><option value="nutrition">Nutrición</option><option value="hydration">Hidratación</option><option value="measurement">Peso y medidas</option><option value="other">Otro</option></HealthPeriodSelect></div>
      <fieldset className="hf-objective-fields"><legend>Meta cuantitativa <small>Opcional</small></legend><label>Objetivo<input type="number" min="0" step="0.1" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Cantidad" /></label><label>Unidad<input value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={20} placeholder="g, L, kg" /></label></fieldset>
      {error && <p role="alert" className="hf-notice">{error}</p>}<button type="submit" disabled={saving} aria-busy={saving} className="hf-primary">{saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{saving ? "Guardando..." : "Agregar al plan"}</button>
    </form>
  </div>
}
