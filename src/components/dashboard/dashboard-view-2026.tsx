"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts"
import { ArrowDownRight, ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, Droplets, Flame, HeartPulse, Info, Moon, Plus, Scale, Smile, UserRound, Zap, type LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DashboardMockupData } from "./dashboard-mockup-view"

type Pillar = "health" | "career" | "care"
type Props = { data: DashboardMockupData; onRegister: () => void; loading: Record<Pillar, boolean> }
const number = (value: number | null, digits = 0) => value === null ? "—" : new Intl.NumberFormat("es-PE", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
const clamp = (value: number) => Math.max(0, Math.min(100, value))
const pillars: { key: Pillar; label: string; href: string; icon: LucideIcon; scope: string; description: string }[] = [
  { key: "health", label: "Salud física", href: "/pilares/salud", icon: HeartPulse, scope: "Rutina semanal", description: "Cumplimiento de tu rutina de entrenamiento esta semana. Nutrición, agua y peso se muestran por separado." },
  { key: "career", label: "Data & Carrera", href: "/pilares/carrera", icon: BriefcaseBusiness, scope: "Tareas · historial", description: "Avance de las tareas profesionales registradas en todos tus proyectos. No representa solamente esta semana." },
  { key: "care", label: "Cuidado personal", href: "/pilares/cuidado-personal", icon: UserRound, scope: "Check-ins semanales", description: "Constancia del registro personal esta semana. No es una evaluación clínica de tu bienestar." },
]

function Meter({ value, label }: { value: number; label: string }) {
  return <div className="lt26-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamp(value)}><span style={{ transform: `scaleX(${clamp(value) / 100})` }} /></div>
}

function ModuleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="lt26-link" href={href}>{children}<ArrowUpRight size={17} aria-hidden="true" /></Link>
}

function Reading({ insight, available }: { insight: DashboardMockupData["insights"][Pillar]; available: boolean }) {
  return <details className="lt26-reading"><summary>Lectura de registros<ChevronDown size={16} aria-hidden="true" /></summary><div>{available ? <><p><Check size={16} /><span><strong>Avance</strong>{insight.good}</span></p><p><Info size={16} /><span><strong>Atención</strong>{insight.improve}</span></p><p><ArrowRight size={16} /><span><strong>Siguiente paso</strong>{insight.recommendation}</span></p></> : <p>Aún no hay suficientes registros para describir tendencias. Empieza registrando tu actividad en este pilar.</p>}<small>Resumen descriptivo de los registros. No utiliza IA ni constituye consejo clínico.</small></div></details>
}

function Stat({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <div className="lt26-stat"><span><Icon size={17} aria-hidden="true" />{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

export function DashboardView2026({ data, onRegister, loading }: Props) {
  const [selected, setSelected] = useState<Pillar>("health")
  const reduced = useReducedMotion()
  const selectedPillar = pillars.find((pillar) => pillar.key === selected)!
  const { health: h, career: c, care: p } = data
  const weights = h.recentWeights.map((weight, index) => ({ record: index + 1, weight }))
  const allLoading = loading.health || loading.career || loading.care
  const weightDelta = weights.length > 1 ? weights[weights.length - 1].weight - weights[weights.length - 2].weight : null

  return <div className="dashboard-2026" id="lt26-content" tabIndex={-1}>
    <header className="lt26-page-header"><div><span className="lt26-page-label">Dashboard</span><span className="lt26-date"><CalendarDays size={15} />{data.week}</span></div><Link href="/historial" className="lt26-link">Ver registros<ArrowUpRight size={17} /></Link></header>
    <section className="lt26-welcome" aria-labelledby="lt26-title"><div><p>{data.name === "Cargando..." ? "Tu espacio personal" : `Hola, ${data.name.split(" ")[0]}.`}</p><h1 id="lt26-title">Tu progreso, en perspectiva.</h1><p className="lt26-welcome-sub">Salud, proyectos y bienestar. Cada registro cuenta.</p></div><div className="lt26-welcome-actions"><Image src={data.photo} alt="Retrato personal de José Luis" width={72} height={86} className="lt26-portrait" priority /><button className="lt26-primary" type="button" onClick={onRegister}><Plus size={18} />Registrar avance</button></div></section>

    <section className="lt26-overview" aria-labelledby="lt26-overview-title">
      <div className="lt26-overview-total"><div><h2 id="lt26-overview-title">Visión integral</h2><Tooltip><TooltipTrigger asChild><button className="lt26-info" type="button" aria-label="Cómo se calcula el avance general"><Info size={17} /></button></TooltipTrigger><TooltipContent className="lt26-tooltip">Promedio simple de los tres avances existentes: rutina semanal, tareas históricas y check-ins semanales. Es un indicador del aplicativo, no de salud.</TooltipContent></Tooltip></div><strong className={allLoading ? "lt26-value-loading" : ""}>{allLoading ? "—" : data.progress.general}<span>{allLoading ? "" : "%"}</span></strong><p>Avance general registrado</p><span className="lt26-total-note">Tres pilares · distintos periodos</span></div>
      <div className="lt26-progress-matrix" role="group" aria-label="Explorar avance por pilar">{pillars.map(({ key, label, icon: Icon, scope }) => <button type="button" key={key} data-tone={key} aria-pressed={selected === key} onClick={() => setSelected(key)} className="lt26-progress-row"><span className="lt26-progress-name"><Icon size={18} /><span>{label}<small>{scope}</small></span></span><Meter value={loading[key] ? 0 : data.progress[key]} label={`Avance de ${label}`} /><strong>{loading[key] ? "—" : `${data.progress[key]}%`}</strong><ArrowRight size={17} aria-hidden="true" /></button>)}</div>
      <div className="lt26-scope" data-tone={selected}><AnimatePresence mode="wait" initial={false}><motion.p key={selected} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .12 }}>{selectedPillar.description}</motion.p></AnimatePresence><ModuleLink href={selectedPillar.href}>Abrir {selectedPillar.label}</ModuleLink></div>
    </section>

    <div className="lt26-personal-grid">
      <section className="lt26-health lt26-module" data-tone="health" aria-labelledby="lt26-health-title" aria-busy={loading.health}>
        <div className="lt26-section-head"><div><HeartPulse size={22} /><h2 id="lt26-health-title">Tu ritmo físico</h2></div><ModuleLink href="/pilares/salud">Salud</ModuleLink></div>
        {loading.health ? <Loading label="Cargando tus registros de salud" /> : <>
          <div className="lt26-health-workspace"><div className="lt26-training"><span className="lt26-label">Entrenamiento · esta semana</span><div className="lt26-training-value"><strong>{h.completed}<span>/{h.planned}</span></strong><span>días completados<br /><b>{h.trainingPct}% del plan</b></span></div><Meter value={h.trainingPct} label="Cumplimiento de entrenamiento semanal" /><p>{h.planned > 0 ? `${Math.max(0, h.planned - h.completed)} días del plan sin completar` : "No hay días de entrenamiento planificados."}</p><div className="lt26-health-small-stats"><Stat icon={Zap} label="Energía" value={h.energy === null ? "—" : `${number(h.energy, 1)}/10`} detail="Media semanal o último registro" /><Stat icon={Scale} label="Último peso" value={h.weight === null ? "—" : `${number(h.weight, 1)} kg`} detail={`${h.weightRecords} registros históricos`} /></div></div>
            <div className="lt26-weight"><span className="lt26-label">Peso · registros recientes</span>{weights.length > 1 ? <><div className="lt26-weight-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weights} margin={{ top: 12, left: 0, right: 8, bottom: 0 }} accessibilityLayer><XAxis dataKey="record" tickLine={false} axisLine={false} tick={{ fill: "var(--lt26-muted)", fontSize: 12 }} tickFormatter={(value) => `R${value}`} /><YAxis domain={["dataMin - 1", "dataMax + 1"]} hide /><ChartTooltip content={({ active, payload }) => active && payload?.length ? <div className="lt26-chart-tooltip">Registro {payload[0].payload.record}<strong>{payload[0].value} kg</strong></div> : null} /><Area type="monotone" dataKey="weight" stroke="var(--lt26-health)" fill="var(--lt26-health)" fillOpacity={.08} strokeWidth={2} isAnimationActive={false} dot={{ r: 3, fill: "var(--lt26-health)", strokeWidth: 0 }} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div><p className="lt26-weight-change">{weightDelta !== null && weightDelta < 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}{weightDelta === null ? "—" : `${weightDelta > 0 ? "+" : ""}${number(weightDelta, 1)} kg`}<span>frente al anterior</span></p><details className="lt26-chart-records"><summary>Ver valores<ChevronDown size={14} /></summary><ol>{weights.map((row) => <li key={row.record}>Registro {row.record}: {row.weight} kg</li>)}</ol></details></> : <div className="lt26-empty-compact">{weights.length === 1 ? `Un registro de ${weights[0].weight} kg. La evolución aparece con más registros.` : "La evolución de peso aparecerá cuando registres tu progreso físico."}</div>}</div>
          </div>
          <div className="lt26-nutrition"><div><span className="lt26-label"><Droplets size={17} />Agua registrada · semana</span><strong>{number(h.waterLiters, 2)}<small> L</small></strong><Meter value={h.waterPct} label="Porcentaje de hidratación semanal" /><p>{h.waterLiters === null ? "Sin resumen disponible" : `${h.waterPct}% de la referencia semanal`}</p></div><div><span className="lt26-label"><Flame size={17} />Calorías · media diaria</span><strong>{number(h.calories)}<small> kcal</small></strong><Meter value={h.caloriePct} label="Calorías frente a la referencia diaria" /><p>Referencia diaria: {number(h.calorieTarget)} kcal · {h.caloriePct}%</p></div></div>
          <Reading insight={data.insights.health} available={h.planned > 0 || h.waterLiters !== null || h.weight !== null} />
        </>}
      </section>

      <section className="lt26-care lt26-module" data-tone="care" aria-labelledby="lt26-care-title" aria-busy={loading.care}>
        <div className="lt26-section-head"><div><UserRound size={22} /><h2 id="lt26-care-title">Un espacio para ti</h2></div><ModuleLink href="/pilares/cuidado-personal">Cuidado</ModuleLink></div>
        {loading.care ? <Loading label="Cargando tus registros personales" /> : <>
          <div className="lt26-care-records"><div><strong>{p.checkins}<span>/7</span></strong><p>Check-ins esta semana</p></div><span>{p.checkinPct}%<small>constancia</small></span></div>
          {p.checkins === 0 && <div className="lt26-care-empty"><Moon size={25} /><p><strong>Tu semana aún no tiene check-ins.</strong>Registra cómo te sientes para empezar a observar tus propios patrones.</p><ModuleLink href="/pilares/cuidado-personal">Registrar en Cuidado</ModuleLink></div>}
          <dl className="lt26-wellbeing">{[{ label: "Ánimo", value: p.mood, icon: Smile }, { label: "Estrés", value: p.stress, icon: Zap }, { label: "Motivación", value: p.motivation, icon: ArrowUpRight }, { label: "Calidad de sueño", value: p.sleepQuality, icon: Moon }].map(({ label, value, icon: Icon }) => <div key={label}><dt><Icon size={16} />{label}</dt><dd>{value === null ? "Sin registro" : `${number(value, 1)}/10`}</dd></div>)}</dl>
          <div className="lt26-care-bottom"><Stat icon={Check} label="Rutinas completadas" value={number(p.routines)} detail={`${p.activeRoutines} activas · ${p.routinePct}% de cumplimiento`} /><Stat icon={HeartPulse} label="Reflexiones" value={number(p.reflections)} detail="Días registrados esta semana" /></div>
          <Reading insight={data.insights.care} available={p.checkins > 0 || p.routines > 0} />
        </>}
      </section>
    </div>

    <section className="lt26-career lt26-module" data-tone="career" aria-labelledby="lt26-career-title" aria-busy={loading.career}>
      <div className="lt26-section-head"><div><BriefcaseBusiness size={22} /><h2 id="lt26-career-title">Lo que estás construyendo</h2></div><ModuleLink href="/pilares/carrera">Data & Carrera</ModuleLink></div>
      {loading.career ? <Loading label="Cargando tus proyectos y habilidades" /> : <>
        <div className="lt26-career-grid"><div className="lt26-career-projects"><span className="lt26-label">Proyectos · historial</span><strong>{c.activeProjects}<span> en curso</span></strong><p>de {c.totalProjects} proyectos registrados</p><ModuleLink href="/portafolio">Explorar portafolio</ModuleLink></div>
          <div className="lt26-career-tasks"><span className="lt26-label">Tareas completadas · historial</span><div><strong>{c.completedTasks}<span>/{c.totalTasks}</span></strong><b>{c.taskPct}%</b></div><Meter value={c.taskPct} label="Tareas profesionales completadas" /><p>{Math.max(0, c.totalTasks - c.completedTasks)} tareas sin completar</p></div>
          <div className="lt26-career-week"><Stat icon={Check} label="Esta semana" value={c.weeklyCompleted === null ? "—" : `${number(c.weeklyCompleted)} ${c.weeklyCompleted === 1 ? "tarea" : "tareas"}`} detail={`${c.weeklyPct}% · productividad semanal`} /><Stat icon={CalendarDays} label="Actividad profesional" value={`${c.events} eventos`} detail={`${c.activityPct}% · indicador semanal existente`} /></div>
          <div className="lt26-career-skills"><span className="lt26-label">Habilidades aplicadas</span><strong>{number(c.usedSkills)}<span>/{number(c.totalSkills)}</span><b>{c.skillsPct}%</b></strong><p>del catálogo · {c.totalSkillLinks} vínculos registrados</p><div className="lt26-skills-list">{c.topSkills.length > 0 ? c.topSkills.map((skill) => <span key={skill.name}>{skill.name}<b>{skill.projectsCount}</b></span>) : <p>Sin habilidades vinculadas.</p>}</div><small>Recuento de vínculos por tecnología</small></div>
        </div><Reading insight={data.insights.career} available={c.totalProjects > 0} />
      </>}
    </section>
    <footer className="lt26-footer"><span>LifeTrack · Tu vida, tus datos.</span><Link href="/calendario">Ver tu calendario<ArrowRight size={16} /></Link></footer>
  </div>
}

function Loading({ label }: { label: string }) {
  return <div className="lt26-loading" role="status" aria-label={label}><span /><span /><span /><p>{label}</p></div>
}
