"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, animate, useReducedMotion } from "framer-motion"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { ArrowLeft, ArrowRight, Brain, Check, CheckCircle2, ClipboardCheck, Heart, Info, Leaf, Moon, Plus, Smile, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { CarePeriodFilter } from "@/components/personal-care/care-period-filter"
import { analyzePersonalCare, type CareLog, type CarePeriod } from "@/lib/personal-care-analytics"
import { categoryStyles } from "@/lib/personal-care-page-helpers"
import type { PersonalCareCompletion, PersonalCareRoutine } from "@/lib/personal-care-page-models"

type Props = {
  logs: CareLog[]
  completions: PersonalCareCompletion[]
  routines: PersonalCareRoutine[]
  period: CarePeriod
  today: string
  loading: boolean
  onPeriodChange: (period: CarePeriod) => void
  onToggleRoutine: (routine: PersonalCareRoutine) => void
  onManage: () => void
}

const panel = "care-panel min-w-0 rounded-lg border border-violet-300/20 bg-[linear-gradient(155deg,rgba(16,27,52,.97),rgba(8,19,37,.98))] p-3 shadow-[inset_0_1px_rgba(255,255,255,.045),0_14px_35px_rgba(0,5,20,.2)] transition-[border-color,box-shadow,transform] duration-300 hover:border-violet-300/42 hover:shadow-[0_0_23px_rgba(168,85,247,.09),0_18px_38px_rgba(0,5,20,.24)]"

function AnimatedValue({ value, digits = 0 }: { value: number; digits?: number }) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    if (reduced) return
    const animation = animate(display, value, { duration: .75, ease: "easeOut", onUpdate: setDisplay })
    return () => animation.stop()
  }, [value, reduced])
  return <>{(reduced ? value : display).toFixed(digits)}</>
}

function Ring({ value, size = 112, icon: Icon, label }: { value: number | null; size?: number; icon?: LucideIcon; label: string }) {
  const reduced = useReducedMotion()
  const circumference = 2 * Math.PI * 42
  return <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value === null ? "sin datos" : `${value}%`}`}>
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(168,147,213,.16)" strokeWidth="9" /><motion.circle cx="50" cy="50" r="42" fill="none" stroke="#ad62ff" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} initial={reduced ? false : { strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - (value || 0) / 100) }} transition={{ duration: 1, ease: "easeOut" }} className="drop-shadow-[0_0_7px_rgba(176,94,255,.7)]" /></svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">{Icon ? <Icon size={25} className="text-violet-300" /> : <strong className="text-2xl font-bold text-white">{value === null ? "—" : <AnimatedValue value={value} />}</strong>}{!Icon && <span className="text-[10px] text-slate-400">/100</span>}</div>
  </div>
}

function Heading({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: React.ReactNode }) {
  return <div className="flex min-w-0 items-center gap-2 border-b border-violet-200/10 pb-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-violet-300/25 bg-violet-400/12 text-violet-300"><Icon size={17} /></span><h2 className="min-w-0 flex-1 text-sm font-bold text-white">{title}</h2>{action}</div>
}

const moodLabel = (value: number) => value >= 9 ? "Excelente" : value >= 7 ? "Bien" : value >= 5 ? "Neutral" : value >= 3 ? "Bajo" : "Difícil"
const stressLabel = (value: number) => value >= 8 ? "Alto" : value >= 5 ? "Medio" : "Bajo"
const fmt = (value: number | null) => value === null ? "—" : value.toFixed(1)

export function PersonalCareCommandCenter({ logs, completions, routines, period, today, loading, onPeriodChange, onToggleRoutine, onManage }: Props) {
  const reduced = useReducedMotion()
  const [selectedComponent, setSelectedComponent] = useState<keyof ReturnType<typeof analyzePersonalCare>["components"] | null>(null)
  const [activeMoodBand, setActiveMoodBand] = useState<string | null>(null)
  const [activeStressDay, setActiveStressDay] = useState<string | null>(null)
  const [activeSleepPart, setActiveSleepPart] = useState<"quality" | "remaining" | null>(null)
  const data = useMemo(() => analyzePersonalCare(logs, completions, routines, period, today), [logs, completions, routines, period, today])
  const chart = useMemo(() => {
    if (data.daily.length <= 16) return data.daily
    const monthly = period.kind === "year" || data.daily.length > 80
    const buckets = new Map<string, { date: string; label: string; moods: number[]; stresses: number[]; sleeps: number[] }>()
    data.daily.forEach((entry) => {
      const key = monthly ? entry.date.slice(0, 7) : `${entry.date.slice(0, 7)}-S${Math.ceil(Number(entry.date.slice(8)) / 7)}`
      const bucket = buckets.get(key) || { date: key, label: monthly ? key.slice(5) : `${key.slice(5, 7)} · S${key.at(-1)}`, moods: [], stresses: [], sleeps: [] }
      if (entry.mood !== null) bucket.moods.push(entry.mood)
      if (entry.stress !== null) bucket.stresses.push(entry.stress)
      if (entry.sleep !== null) bucket.sleeps.push(entry.sleep)
      buckets.set(key, bucket)
    })
    return [...buckets.values()].map((item) => ({ date: item.date, label: item.label, mood: item.moods.length ? item.moods.reduce((a, b) => a + b, 0) / item.moods.length : null, stress: item.stresses.length ? item.stresses.reduce((a, b) => a + b, 0) / item.stresses.length : null, sleep: item.sleeps.length ? item.sleeps.reduce((a, b) => a + b, 0) / item.sleeps.length : null }))
  }, [data.daily, period.kind])
  const moodPoints = chart.filter((point) => point.mood !== null)
  const stressPoints = chart.filter((point) => point.stress !== null)
  const scoreParts = [
    { key: "emotional" as const, label: "Emocional", value: data.components.emotional, detail: "Promedio de ánimo y motivación" },
    { key: "sleep" as const, label: "Descanso", value: data.components.sleep, detail: "Calidad percibida del sueño" },
    { key: "stress" as const, label: "Estrés", value: data.components.stress, detail: "Estrés invertido: menos es mejor" },
    { key: "consistency" as const, label: "Constancia", value: data.components.consistency, detail: "Días con check-in sobre días transcurridos" },
  ]
  const latest = data.latest
  const moodValue = latest?.mood_level ?? null
  const stressValue = latest?.stress_level ?? null
  const sleepValue = data.sleep
  const dayPeriod = data.bounds.start === data.bounds.end && data.bounds.start === today
  const routineValue = dayPeriod ? `${data.completedToday}/${data.activeRoutines.length}` : String(data.periodCompletions.length)
  const sourceDate = latest?.date === today ? "Hoy" : latest?.date || "Sin registro"
  const componentDetail = scoreParts.find((part) => part.key === selectedComponent)

  return <div className="care-command space-y-3">
    <section className="care-hero relative isolate min-h-[235px] overflow-hidden rounded-xl border border-violet-300/25 bg-[#0a1430] p-4 sm:p-5">
      <Image src="/images/lifetrack/night-mountains.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-45 [filter:hue-rotate(38deg)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,15,34,.98),rgba(11,16,43,.72)_57%,rgba(8,14,39,.64))]" />
      <div className="absolute inset-y-0 right-[16%] w-[min(36vw,450px)] max-sm:right-[-18%] max-sm:w-64"><Image src="/images/lifetrack/care-meditation.webp" alt="" fill priority sizes="(max-width: 640px) 256px, 36vw" className="object-contain object-bottom opacity-85 [mask-image:linear-gradient(to_bottom,black_76%,transparent)] max-sm:opacity-35" /></div>
      <div className="relative z-10 flex h-full min-h-[205px] flex-col justify-between gap-4"><div className="max-w-[720px]"><div className="mb-3 flex flex-wrap items-center gap-2"><Link href="/pilares" className="inline-flex items-center gap-1.5 rounded-md border border-violet-300/30 bg-[#101d3a]/85 px-3 py-1.5 text-[11px] font-semibold text-violet-100 transition-colors hover:border-violet-300/70 hover:bg-violet-400/15"><ArrowLeft size={13} />Volver a Pilares</Link><span className="rounded-md border border-violet-300/30 bg-violet-400/12 px-2.5 py-1.5 text-[10px] font-bold uppercase text-violet-200">Cuidado personal</span></div><h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">Centro de <span className="text-violet-300">Cuidado Personal</span></h1><p className="mt-1 text-base text-sky-100 sm:text-lg">Conoce, cuida y potencia tu mejor versión.</p><p className="mt-2 max-w-[550px] text-xs leading-relaxed text-slate-300">Tu bienestar importa. Observa tu estado emocional, descanso y hábitos desde tus registros personales.</p></div><div className="flex flex-wrap items-end justify-between gap-2"><div className="flex items-center gap-1 rounded-md border border-violet-300/25 bg-[#0d1933]/85 p-1" role="group" aria-label="Vista de Cuidado Personal"><button type="button" aria-pressed className="rounded border border-violet-300/40 bg-violet-400/20 px-3 py-1.5 text-[11px] font-semibold text-violet-100">Resumen</button><button type="button" onClick={onManage} className="rounded px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-violet-400/15 hover:text-white">Gestionar</button></div><p className="hidden text-xs italic text-violet-200/85 lg:block">&ldquo;Cuidarte también es avanzar.&rdquo;</p></div></div>
    </section>

    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[11px] text-slate-400">{data.bounds.start} al {data.bounds.end} · {data.periodLogs.length} check-ins · {data.periodCompletions.length} rutinas completadas</p><CarePeriodFilter value={period} onChange={onPeriodChange} today={today} /></div>

    <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-6" aria-label="Indicadores de cuidado personal">
      <div className={`${panel} care-primary xl:col-span-2`}><div className="flex items-center gap-1 text-[11px] text-slate-300">Score de bienestar <span title="Índice orientativo: promedio de estado emocional, descanso, estrés invertido y constancia de check-ins. No es una valoración clínica."><Info size={13} className="text-violet-300" /></span></div><div className="mt-2 flex items-center gap-4"><Ring value={data.score} size={114} icon={Heart} label="Score de bienestar" /><div className="min-w-0 flex-1"><strong className="text-3xl text-white">{data.score === null ? "—" : <AnimatedValue value={data.score} />}</strong><span className="text-sm text-slate-400">/100</span><p className="mt-1 text-[10px] text-slate-400">{data.periodLogs.length > 0 && data.periodLogs.length < 3 && data.elapsedDays > 1 ? `Base limitada: ${data.periodLogs.length} check-in${data.periodLogs.length === 1 ? "" : "s"}` : "Índice orientativo del período"}</p><div className="mt-2 space-y-1">{scoreParts.map((part) => <button key={part.key} type="button" onMouseEnter={() => setSelectedComponent(part.key)} onMouseLeave={() => setSelectedComponent(null)} onFocus={() => setSelectedComponent(part.key)} onBlur={() => setSelectedComponent(null)} onClick={() => setSelectedComponent(part.key)} title={part.detail} className={`flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-[9px] transition-colors hover:bg-violet-400/10 ${selectedComponent === part.key ? "text-violet-100" : "text-slate-400"}`}><span className="w-16 shrink-0">{part.label}</span><span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-violet-200/10"><motion.span className="block h-full rounded-full bg-violet-400" initial={reduced ? false : { width: 0 }} animate={{ width: `${part.value || 0}%` }} transition={{ duration: .8 }} /></span><span className="w-6 text-right">{part.value ?? "—"}</span></button>)}</div></div></div><p className="mt-1 min-h-4 text-[9px] text-violet-200/85">{componentDetail?.detail || "Promedio de componentes disponibles; sin datos no hay score."}</p></div>
      <MetricCard icon={Smile} label="Estado de ánimo" value={moodValue === null ? "—" : moodLabel(moodValue)} detail={moodValue === null ? "Sin check-in" : `${moodValue}/10 · ${sourceDate}`} foot="Último registro del período" />
      <MetricCard icon={Leaf} label="Nivel de estrés" value={stressValue === null ? "—" : stressLabel(stressValue)} detail={stressValue === null ? "Sin check-in" : `${stressValue}/10 · ${sourceDate}`} foot="Menor valor significa menos estrés" />
      <MetricCard icon={Moon} label="Calidad de sueño" value={sleepValue === null ? "—" : `${fmt(sleepValue)}/10`} detail={`${data.periodLogs.length} check-ins`} foot="Calidad percibida, no horas" />
      <button type="button" onClick={onManage} className={`${panel} text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300`}><span className="flex items-center gap-2 text-[11px] text-slate-300"><ClipboardCheck size={18} className="text-violet-300" />Rutinas de autocuidado</span><strong className="mt-4 block text-2xl text-white">{routineValue}</strong><p className="mt-1 text-[10px] text-slate-400">{dayPeriod ? "Completadas hoy" : "Eventos completados en el período"}</p><p className="mt-5 flex items-center gap-1 text-[10px] text-emerald-300">{data.completionDays} días con actividad <ArrowRight size={12} /></p></button>
    </section>

    <div className="grid gap-2.5 xl:grid-cols-[1.2fr_.95fr_1fr]">
      <section className={panel}><Heading icon={Smile} title="Evolución de tu estado de ánimo" /><div className="mt-2 flex flex-wrap gap-1">{[{ label: "Excelente", min: 9, color: "#22d3a0" }, { label: "Bien", min: 7, color: "#b56bff" }, { label: "Neutral", min: 5, color: "#f5c969" }, { label: "Bajo", min: 3, color: "#fb8b6d" }, { label: "Difícil", min: 1, color: "#ef667c" }].map((band) => <button key={band.label} type="button" aria-pressed={activeMoodBand === band.label} onMouseEnter={() => setActiveMoodBand(band.label)} onMouseLeave={() => setActiveMoodBand(null)} onFocus={() => setActiveMoodBand(band.label)} onBlur={() => setActiveMoodBand(null)} onClick={() => setActiveMoodBand(activeMoodBand === band.label ? null : band.label)} className={`rounded-md border px-1.5 py-1 text-[9px] transition-colors ${activeMoodBand === band.label ? "border-violet-300/50 bg-violet-400/12 text-white" : "border-transparent text-slate-400 hover:border-violet-300/25"}`}><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: band.color }} />{band.label}</button>)}</div>{moodPoints.length ? <div className="mt-2 h-[195px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={190} initialDimension={{ width: 320, height: 195 }}><AreaChart data={chart} margin={{ top: 12, right: 10, bottom: 0, left: -25 }}><defs><linearGradient id="careMoodArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a855f7" stopOpacity={.42} /><stop offset="100%" stopColor="#a855f7" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#293351" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ba9c1" }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis domain={[1, 10]} tick={{ fontSize: 9, fill: "#9ba9c1" }} axisLine={false} tickLine={false} ticks={[1, 3, 5, 7, 10]} /><Tooltip contentStyle={{ background: "#101b36", border: "1px solid #7d4fb2", borderRadius: 6, color: "white", fontSize: 11 }} formatter={(value) => [`${Number(value).toFixed(1)}/10`, "Ánimo"]} /><Area type="monotone" dataKey="mood" connectNulls stroke="#bc78ff" strokeWidth={2.5} fill="url(#careMoodArea)" isAnimationActive={!reduced} dot={(props) => { const value = Number(props.payload?.mood); const band = moodLabel(value); return <circle key={props.payload?.date} cx={props.cx} cy={props.cy} r={activeMoodBand === band ? 5 : 3} fill={activeMoodBand && activeMoodBand !== band ? "#536078" : "#c88aff"} stroke="#f4e7ff" strokeWidth={1.5} onMouseEnter={() => setActiveMoodBand(band)} onMouseLeave={() => setActiveMoodBand(null)} /> }} /></AreaChart></ResponsiveContainer></div> : <EmptyChart text="Sin registros de ánimo en este período." />}<p className="mt-1 text-[10px] text-slate-400">{data.daily.length > 16 ? "Promedios agrupados" : "Registros diarios"} · {data.periodLogs.length} check-ins</p></section>
      <section className={panel}><Heading icon={Moon} title="Calidad del descanso" /><div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap"><button type="button" onMouseEnter={() => setActiveSleepPart("quality")} onMouseLeave={() => setActiveSleepPart(null)} onFocus={() => setActiveSleepPart("quality")} onBlur={() => setActiveSleepPart(null)} onClick={() => setActiveSleepPart(activeSleepPart === "quality" ? null : "quality")} className={`rounded-full transition-[filter,transform] hover:scale-[1.02] focus-visible:outline focus-visible:outline-violet-300 ${activeSleepPart === "remaining" ? "opacity-50" : ""}`}><Ring value={sleepValue === null ? null : Math.round(sleepValue * 10)} size={135} label="Calidad de sueño" /></button><div className="min-w-[130px] flex-1 space-y-1.5 text-[11px]"><button type="button" onMouseEnter={() => setActiveSleepPart("quality")} onMouseLeave={() => setActiveSleepPart(null)} onFocus={() => setActiveSleepPart("quality")} onBlur={() => setActiveSleepPart(null)} onClick={() => setActiveSleepPart(activeSleepPart === "quality" ? null : "quality")} className={`flex w-full justify-between rounded-md border px-2 py-1.5 text-left transition-colors ${activeSleepPart === "quality" ? "border-violet-300/55 bg-violet-400/12" : "border-white/8 hover:border-violet-300/25"}`}><span className="text-slate-300">Calidad media</span><strong className="text-white">{sleepValue === null ? "—" : `${fmt(sleepValue)}/10`}</strong></button><button type="button" onMouseEnter={() => setActiveSleepPart("remaining")} onMouseLeave={() => setActiveSleepPart(null)} onFocus={() => setActiveSleepPart("remaining")} onBlur={() => setActiveSleepPart(null)} onClick={() => setActiveSleepPart(activeSleepPart === "remaining" ? null : "remaining")} className={`flex w-full justify-between rounded-md border px-2 py-1.5 text-left transition-colors ${activeSleepPart === "remaining" ? "border-violet-300/55 bg-violet-400/12" : "border-white/8 hover:border-violet-300/25"}`}><span className="text-slate-300">Días registrados</span><strong className="text-white">{data.periodLogs.filter((log) => log.sleep_quality !== null).length}</strong></button><p className="pt-1 text-[10px] leading-4 text-slate-400">El registro actual mide calidad percibida; no almacena horas ni horarios de sueño.</p></div></div><div className="mt-3 rounded-md border border-violet-300/15 bg-violet-400/6 px-3 py-2 text-[10px] text-violet-200">{sleepValue === null ? "Registra la calidad de tu descanso en un check-in." : `Promedio de calidad del sueño: ${fmt(sleepValue)}/10 en este período.`}</div></section>
      <section className={panel}><Heading icon={Leaf} title="Niveles de estrés" />{stressPoints.length ? <div className="mt-4 h-[217px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={210} initialDimension={{ width: 320, height: 217 }}><BarChart data={chart} margin={{ top: 12, right: 8, bottom: 0, left: -25 }} onMouseLeave={() => setActiveStressDay(null)}><CartesianGrid stroke="#293351" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ba9c1" }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "#9ba9c1" }} axisLine={false} tickLine={false} ticks={[0, 5, 10]} /><Tooltip contentStyle={{ background: "#101b36", border: "1px solid #7d4fb2", borderRadius: 6, color: "white", fontSize: 11 }} formatter={(value) => [`${Number(value).toFixed(1)}/10`, "Estrés"]} /><Bar dataKey="stress" radius={[3, 3, 0, 0]} isAnimationActive={!reduced} onMouseEnter={(entry) => setActiveStressDay(String(entry.payload?.date || ""))}>{chart.map((point) => <Cell key={point.date} fill={activeStressDay && activeStressDay !== point.date ? "#454a79" : "#9254df"} />)}</Bar></BarChart></ResponsiveContainer></div> : <EmptyChart text="Sin registros de estrés en este período." />}<p className="mt-1 text-[10px] text-slate-400">{activeStressDay ? `Registro ${activeStressDay}` : `Promedio: ${data.stress === null ? "—" : `${fmt(data.stress)}/10`}`}</p></section>
    </div>

    <div className="grid gap-2.5 xl:grid-cols-[1fr_1fr_1.05fr]">
      <section className={panel}><Heading icon={ClipboardCheck} title="Checklist de autocuidado de hoy" action={<span className="text-[10px] text-violet-200">{data.completedToday}/{data.activeRoutines.length}</span>} /><div className="care-scroll mt-2 max-h-[250px] space-y-1 overflow-y-auto pr-1">{data.activeRoutines.map((routine) => { const done = data.completedTodayIds.has(routine.id); return <button key={routine.id} type="button" aria-pressed={done} onClick={() => onToggleRoutine(routine)} className="group/check flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left transition-[border-color,background-color] hover:border-violet-300/30 hover:bg-violet-400/9 focus-visible:outline focus-visible:outline-violet-300"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${done ? "border-violet-300/65 bg-violet-500 text-white" : "border-violet-300/40 bg-[#101b35] text-transparent"}`}><Check size={13} /></span><span className="min-w-0 flex-1 truncate text-[11px] text-slate-200" title={routine.name}>{routine.name}</span><span className="text-[9px] text-slate-500">{categoryStyles[routine.category]?.label || "General"}</span><CheckCircle2 size={14} className={done ? "text-emerald-400" : "text-slate-600"} /></button> })}{!data.activeRoutines.length && <p className="py-8 text-center text-xs text-slate-400">No hay rutinas activas.</p>}</div><button type="button" onClick={onManage} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-200 hover:text-white"><Plus size={12} />Gestionar rutinas</button></section>
      <section className={panel}><Heading icon={Moon} title="Tu rutina de hoy" action={<button type="button" onClick={onManage} className="text-[10px] text-violet-200 hover:text-white">Gestionar <ArrowRight size={12} className="inline" /></button>} /><div className="care-scroll mt-3 max-h-[265px] space-y-2 overflow-y-auto pr-1">{data.activeRoutines.map((routine, index) => { const Icon = categoryStyles[routine.category]?.icon || Sparkles; const done = data.completedTodayIds.has(routine.id); return <div key={routine.id} className="flex items-center gap-2"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] ${done ? "border-violet-300/65 bg-violet-400/25 text-violet-100" : "border-violet-300/20 text-slate-500"}`}>{index + 1}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-400/12 text-violet-300"><Icon size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-white" title={routine.name}>{routine.name}</p><p className="truncate text-[9px] text-slate-400" title={routine.description || ""}>{routine.description || categoryStyles[routine.category]?.label || "Rutina personal"}</p></div><span className={`text-[9px] ${done ? "text-emerald-300" : "text-slate-500"}`}>{done ? "Hecha" : "Pendiente"}</span></div> })}{!data.activeRoutines.length && <p className="py-8 text-center text-xs text-slate-400">Crea una rutina para empezar.</p>}</div><p className="mt-2 text-[9px] leading-4 text-slate-500">No hay horarios programados; se muestra el orden de creación.</p></section>
      <section className={`${panel} care-primary`}><Heading icon={Brain} title="Lectura de tus registros" action={<span className="rounded-md border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[9px] text-violet-200">Basada en datos</span>} /><div className="mt-3 flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-300/40 bg-violet-400/15 text-violet-200 shadow-[0_0_18px_rgba(168,85,247,.22)]"><Sparkles size={22} /></span><p className="text-[11px] leading-relaxed text-slate-200">{loading ? "Cargando registros..." : data.insight}</p></div><div className="mt-3 rounded-md border border-violet-300/25 bg-violet-400/8 p-3"><p className="flex items-center gap-1 text-[10px] font-semibold text-violet-200"><Sparkles size={13} />Siguiente paso</p><p className="mt-1 text-[11px] leading-relaxed text-slate-300">{data.recommendation}</p></div><p className="mt-2 text-[9px] text-slate-500">Lectura automática descriptiva, no diagnóstico ni consejo clínico.</p></section>
    </div>
  </div>
}

function MetricCard({ icon: Icon, label, value, detail, foot }: { icon: LucideIcon; label: string; value: string; detail: string; foot: string }) {
  return <div className={`${panel} group`}><span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-300/25 bg-violet-400/12 text-violet-300 transition-transform duration-300 group-hover:scale-105"><Icon size={19} /></span><p className="mt-3 text-[11px] text-slate-300">{label}</p><strong className="mt-1 block text-xl leading-tight text-white">{value}</strong><p className="mt-1 text-[10px] text-slate-400">{detail}</p><p className="mt-5 border-t border-violet-300/10 pt-2 text-[10px] text-emerald-300">{foot}</p></div>
}

function EmptyChart({ text }: { text: string }) {
  return <div className="mt-3 flex h-[195px] items-center justify-center rounded-md border border-dashed border-violet-300/15 bg-[#0a1730]/60 px-3 text-center text-xs text-slate-400">{text}</div>
}
