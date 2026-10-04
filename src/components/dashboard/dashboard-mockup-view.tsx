"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  siFigma, siGithub, siNextdotjs, siNotion, siPostgresql,
  siPython, siReact, siSupabase, siTypescript,
  type SimpleIcon,
} from "simple-icons"
import {
  Activity, ArrowRight, BarChart3, BookOpenCheck, BriefcaseBusiness,
  CalendarCheck2, Check, CircleAlert, CircleCheck, Code2,
  Database, Droplets, Flame, Heart, HeartPulse, Layers3, Lightbulb,
  Moon, Plus, Scale, Sparkles, Target,
  TrendingUp, UserRound, type LucideIcon,
} from "lucide-react"
import { LifeTrackFooter } from "@/components/lifetrack-footer"

type Insight = { good: string; improve: string; recommendation: string }
type Value = number | null

export type DashboardMockupData = {
  name: string
  photo: string
  week: string
  progress: { general: number; health: number; career: number; care: number }
  health: {
    planned: number; completed: number; trainingPct: number
    waterLiters: Value; waterPct: number
    calories: Value; calorieTarget: Value; caloriePct: number
    energy: Value; weight: Value; weightRecords: number; recentWeights: number[]
  }
  career: {
    activeProjects: number; totalProjects: number
    completedTasks: number; totalTasks: number; taskPct: number
    weeklyPct: number; weeklyCompleted: Value
    usedSkills: Value; totalSkills: Value; skillsPct: number
    events: number; activityPct: number; totalSkillLinks: number
    topSkills: { name: string; projectsCount: number; color: string | null }[]
  }
  care: {
    checkins: number; checkinPct: number
    routines: number; activeRoutines: number; routinePct: number
    mood: Value; stress: Value; motivation: Value; sleepQuality: Value
    reflections: number
  }
  insights: { health: Insight; career: Insight; care: Insight }
}

const tone = {
  blue: { color: "#56b8ff", border: "border-sky-400/55", glow: "shadow-[inset_0_0_30px_rgba(25,115,214,.13)]", tint: "bg-sky-400/10", text: "text-sky-300" },
  green: { color: "#35d9a3", border: "border-emerald-400/55", glow: "shadow-[inset_0_0_30px_rgba(15,175,121,.12)]", tint: "bg-emerald-400/10", text: "text-emerald-300" },
  orange: { color: "#ff9c4a", border: "border-orange-400/55", glow: "shadow-[inset_0_0_30px_rgba(241,112,34,.12)]", tint: "bg-orange-400/10", text: "text-orange-300" },
  violet: { color: "#c67dff", border: "border-violet-400/55", glow: "shadow-[inset_0_0_30px_rgba(147,62,225,.13)]", tint: "bg-violet-400/10", text: "text-violet-300" },
} as const
type Tone = keyof typeof tone

const brandIcons: Record<string, SimpleIcon> = {
  figma: siFigma, github: siGithub, nextjs: siNextdotjs,
  next: siNextdotjs, notion: siNotion, postgresql: siPostgresql,
  postgres: siPostgresql, python: siPython, react: siReact,
  supabase: siSupabase, typescript: siTypescript,
}

function BrandIcon({ name }: { name: string }) {
  const icon = brandIcons[name.toLowerCase().replace(/[^a-z0-9]/g, "")]
  if (!icon) return name.toLowerCase().includes("sql") ? <Database size={15} /> : <Code2 size={15} />
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg>
}

function AnimatedFill({ value, color }: { value: number; color: string }) {
  const reduced = useReducedMotion()
  return <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={reduced ? false : { width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ duration: .8, ease: "easeOut" }} />
}

function Ring({ value, color, size = 52, center = "percent" }: { value: number; color: string; size?: number; center?: "percent" | "check" }) {
  const pct = Math.min(100, Math.max(0, value))
  const reduced = useReducedMotion()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${pct}%`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(141,166,202,.14)" strokeWidth="7" />
        <motion.circle cx="32" cy="32" r="25" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={157.08} initial={reduced ? false : { strokeDashoffset: 157.08 }} animate={{ strokeDashoffset: 157.08 * (1 - pct / 100) }} transition={{ duration: .9, ease: "easeOut" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-white">{center === "check" ? <Check size={15} strokeWidth={2.5} className="text-emerald-300" aria-hidden="true" /> : `${pct}%`}</span>
    </div>
  )
}

function Headline({ icon: Icon, title, detail, action }: { icon: LucideIcon; title: string; detail: string; action?: string }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/10 pb-2">
      <Icon size={18} className="shrink-0 text-sky-300" />
      <h2 className="text-base font-extrabold leading-5 text-white">{title}</h2>
      <p className="min-w-0 text-[11px] text-slate-400">{detail}</p>
      {action && <span className="ml-auto rounded-md border border-sky-300/20 px-2.5 py-1 text-[10px] font-semibold text-sky-200">{action}</span>}
    </div>
  )
}

function ProgressCard({ label, value, detail, Icon, kind }: { label: string; value: number; detail: string; Icon: LucideIcon; kind: Tone }) {
  const reduced = useReducedMotion()
  const style = tone[kind]
  return (
    <motion.div whileHover={reduced ? undefined : { y: -3, boxShadow: `0 0 26px ${style.color}40, inset 0 0 24px ${style.color}18` }} transition={{ duration: .22 }} className={`group min-w-0 rounded-[17px] border bg-[#08162a]/85 p-3.5 backdrop-blur-sm ${style.border} ${style.glow}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/30 motion-safe:transition-transform motion-safe:group-hover:scale-105 ${style.tint} ${style.text}`}><Icon size={17} /></span>
        <span className="min-w-0 text-[11px] font-bold leading-4 text-slate-200">Avance<br />{label}</span>
      </div>
      <div className="mt-2 flex min-w-0 items-center gap-2.5">
        <Ring value={value} color={style.color} size={54} />
        <div className="min-w-0"><strong className="block text-xl leading-none text-white">{value}%</strong><span className="mt-1 block text-[10px] leading-4 text-slate-400">{detail}</span></div>
      </div>
      <div className={`mt-2 h-1 overflow-hidden rounded-full ${style.tint}`}><AnimatedFill value={value} color={style.color} /></div>
    </motion.div>
  )
}

function QuickMetric({ Icon, label, value, detail, kind, pct, visual }: { Icon: LucideIcon; label: string; value: string; detail: string; kind: Tone; pct?: number; visual?: "routine" | "activity" | "bars" | "skills" }) {
  const style = tone[kind]
  const reduced = useReducedMotion()
  return (
    <motion.div whileHover={reduced ? undefined : { y: -3, boxShadow: `0 0 24px ${style.color}22` }} className="group flex min-w-0 items-center gap-2 rounded-xl border border-sky-200/10 bg-[#071524]/75 p-2.5 transition-colors hover:border-sky-200/25">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 ${style.tint} ${style.text}`}><Icon size={18} /></span>
      <div className="min-w-0 flex-1"><span className="block truncate text-[10px] text-slate-300">{label}</span><strong className="block truncate text-lg leading-6 text-white" title={value}>{value}</strong><span className={`block truncate text-[10px] ${style.text}`}>{detail}</span></div>
      {visual === "routine" && <div className="w-12 shrink-0" aria-hidden="true"><div className="flex items-end gap-1">{Array.from({ length: 5 }, (_, index) => <motion.span key={index} className="w-1.5 rounded-t-sm" style={{ backgroundColor: index < Math.round((pct ?? 0) / 20) ? style.color : "#233447" }} initial={reduced ? false : { height: 2 }} animate={{ height: 11 + index * 4 }} transition={{ delay: index * .07, duration: .4 }} />)}</div><span className="mt-1 block text-right text-[9px]" style={{ color: style.color }}>{pct ?? 0}%</span></div>}
      {visual === "activity" && <div className="flex w-16 shrink-0 flex-col gap-1.5" aria-label={`${pct ?? 0}% de actividad profesional`} role="img"><Flame size={16} className={style.text} /><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><AnimatedFill value={pct ?? 0} color={style.color} /></div><span className={`text-right text-[9px] font-semibold ${style.text}`}>{pct ?? 0}%</span></div>}
      {visual === "bars" && <div className="flex h-10 w-14 shrink-0 items-end gap-1" aria-label={`Progreso ${pct ?? 0}%`} role="img">{Array.from({ length: 7 }, (_, index) => <motion.span key={index} className="w-1.5 rounded-t-sm" style={{ backgroundColor: index < Math.ceil((pct ?? 0) / (100 / 7)) ? style.color : "#293447" }} initial={reduced ? false : { height: 2 }} animate={{ height: 8 + index * 4 }} transition={{ delay: index * .06, duration: .45 }} />)}</div>}
      {visual === "skills" && <div className="flex w-16 shrink-0 flex-col gap-1.5" aria-label={`${pct ?? 0}% del catálogo`} role="img"><Layers3 size={16} className={style.text} /><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><AnimatedFill value={pct ?? 0} color={style.color} /></div><span className={`text-right text-[9px] font-semibold ${style.text}`}>{pct ?? 0}%</span></div>}
    </motion.div>
  )
}

function MiniMetric({ label, value, detail, pct, Icon, kind, iconOnly = false, ringCenter }: { label: string; value: string; detail: string; pct?: number; Icon: LucideIcon; kind: Tone; iconOnly?: boolean; ringCenter?: "check" }) {
  const style = tone[kind]
  const reduced = useReducedMotion()
  return (
    <motion.div whileHover={reduced ? undefined : { y: -2 }} className="flex min-w-0 items-center gap-1.5 rounded-xl border border-sky-100/[.09] bg-[#071422]/80 p-2 transition-colors hover:border-sky-200/25">
      {pct === undefined || iconOnly ? <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.tint} ${style.text}`}><Icon size={17} /></span> : <Ring value={pct} color={style.color} size={34} center={ringCenter} />}
      <div className="min-w-0"><p className="break-words text-[10px] leading-3 text-slate-300">{label}</p><p className="whitespace-nowrap text-sm font-extrabold leading-5 text-white" title={value}>{value}</p><p className={`break-words text-[10px] leading-3 ${style.text}`}>{detail}</p></div>
    </motion.div>
  )
}

function IndicatorBars({ title, rows, color }: { title: string; rows: { label: string; value: number; display: string }[]; color: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-[#061320]/75 p-2.5">
      <h4 className="mb-2 text-[11px] font-semibold text-slate-200">{title}</h4>
      <div className="space-y-1.5">
        {rows.map((row) => <div key={row.label} title={`${row.label}: ${row.display}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-md px-1 py-0.5 text-[10px] transition-colors hover:bg-white/5"><span className="truncate text-slate-400 transition-colors group-hover:text-slate-200">{row.label}</span><span className="font-semibold text-white">{row.display}</span><div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/10 transition-[filter,box-shadow] duration-200 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(255,255,255,.12)]"><AnimatedFill value={row.value} color={color} /></div></div>)}
      </div>
    </div>
  )
}

function WeightTrend({ values }: { values: number[] }) {
  const reduced = useReducedMotion()
  if (values.length < 2) return <p className="text-[10px] text-slate-400">Se necesitan dos registros para mostrar la evolución.</p>
  const min = Math.min(...values), max = Math.max(...values)
  const span = Math.max(max - min, 1)
  const points = values.map((value, index) => `${12 + index * 176 / (values.length - 1)},${64 - (value - min) / span * 42}`)
  const line = `M${points.join(" L")}`
  const area = `${line} L188,76 L12,76 Z`
  return <div className="h-14 w-full overflow-hidden" role="img" aria-label={`Evolución de los últimos ${values.length} pesos registrados: ${values.join(", ")} kg`}><svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true"><defs><linearGradient id="dashboard-weight-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#37dbbd" stopOpacity=".28" /><stop offset="1" stopColor="#37dbbd" stopOpacity="0" /></linearGradient></defs><path d={area} fill="url(#dashboard-weight-fill)" /><motion.path d={line} fill="none" stroke="#4be9d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} /></svg></div>
}

function StackUsage({ skills, totalLinks }: { skills: DashboardMockupData["career"]["topSkills"]; totalLinks: number }) {
  return <div className="min-w-0 rounded-xl border border-white/10 bg-[#061320]/75 p-2.5"><p className="mb-2 text-[11px] font-semibold text-slate-200">Stack en uso <span className="font-normal text-slate-500">· vínculos a proyectos</span></p>{skills.length && totalLinks > 0 ? <div className="space-y-1.5">{skills.map((skill) => { const pct = Math.round(skill.projectsCount / totalLinks * 100); const color = /^#[\da-f]{3,8}$/i.test(skill.color ?? "") ? skill.color! : tone.blue.color; return <div key={skill.name} className="group grid grid-cols-[16px_minmax(54px,auto)_minmax(0,1fr)_28px] items-center gap-1.5 rounded px-0.5 py-0.5 text-[10px] text-slate-300 transition-colors hover:bg-white/5" title={`${skill.name}: ${skill.projectsCount} vínculos a proyectos`}><span className="motion-safe:transition-transform motion-safe:group-hover:scale-110" style={{ color }}><BrandIcon name={skill.name} /></span><span className="truncate">{skill.name}</span><span className="h-1.5 overflow-hidden rounded-full bg-white/10"><AnimatedFill value={pct} color={color} /></span><span className="text-right text-slate-400">{pct}%</span></div> })}</div> : <p className="text-[10px] leading-4 text-slate-400">Aún no hay skills vinculadas a proyectos.</p>}</div>
}

function PillarPanel({ kind, title, subtitle, Icon, href, metrics, children }: { kind: Exclude<Tone, "blue">; title: string; subtitle: string; Icon: LucideIcon; href: string; metrics: React.ReactNode; children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const style = tone[kind]
  return (
    <motion.section whileHover={reduced ? undefined : { y: -2 }} className={`relative min-w-0 overflow-hidden rounded-2xl border bg-[#071523]/90 p-2.5 ${style.border} ${style.glow}`}>
      <div className="mb-2 flex min-w-0 items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 ${style.tint} ${style.text}`}><Icon size={18} /></span>
        <div className="min-w-0 flex-1"><h3 className="truncate text-[13px] font-extrabold text-white" title={title}>{title}</h3><p className="truncate text-[10px] text-slate-400">{subtitle}</p></div>
        <Link href={href} className={`flex shrink-0 items-center gap-1 rounded-md px-1 py-1 text-[10px] font-semibold ${style.text} hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>Ver más <ArrowRight size={12} /></Link>
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-1.5 2xl:grid-cols-4">{metrics}</div>
      <div className="mt-1.5 grid min-w-0 gap-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">{children}</div>
    </motion.section>
  )
}

function InsightCard({ kind, title, Icon, insight }: { kind: Exclude<Tone, "blue">; title: string; Icon: LucideIcon; insight: Insight }) {
  const style = tone[kind]
  return (
    <div className={`min-w-0 rounded-xl border p-2.5 ${style.border} ${style.tint}`}>
      <div className="mb-2 flex items-center gap-2"><Icon size={15} className={style.text} /><h3 className="text-xs font-bold text-white">{title}</h3></div>
      <div className="grid gap-1.5 sm:grid-cols-3">
        <div className="group min-w-0 rounded-lg bg-black/25 p-2 transition-colors hover:bg-emerald-400/10"><span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300"><CircleCheck size={13} className="motion-safe:transition-transform motion-safe:group-hover:scale-110" />Lo que va bien</span><p className="mt-1 text-[10px] leading-4 text-slate-300">{insight.good}</p></div>
        <div className="group min-w-0 rounded-lg bg-black/25 p-2 transition-colors hover:bg-orange-400/10"><span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-300"><CircleAlert size={13} className="motion-safe:transition-transform motion-safe:group-hover:scale-110" />A mejorar</span><p className="mt-1 text-[10px] leading-4 text-slate-300">{insight.improve}</p></div>
        <div className="group min-w-0 rounded-lg bg-black/25 p-2 transition-colors hover:bg-sky-400/10"><span className="flex items-center gap-1.5 text-[10px] font-bold text-sky-300"><Lightbulb size={13} className="motion-safe:transition-transform motion-safe:group-hover:scale-110" />Recomendación</span><p className="mt-1 text-[10px] leading-4 text-slate-300">{insight.recommendation}</p></div>
      </div>
    </div>
  )
}

function formatTen(value: Value) { return value === null || value <= 0 ? "—" : `${value.toFixed(1)}/10` }

export function DashboardMockupView({ data, onRegister }: { data: DashboardMockupData; onRegister: () => void }) {
  const reduced = useReducedMotion()
  const h = data.health, c = data.career, p = data.care
  const enter = reduced ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: .45 } }
  return (
    <div className="dashboard-mockup relative mx-auto flex w-full max-w-[1760px] flex-col gap-2.5 text-slate-100">
      <motion.section {...enter} className="relative isolate overflow-hidden rounded-2xl border border-sky-200/15 bg-[#071a31] p-3 sm:p-4">
        <Image src="/images/lifetrack/night-mountains.webp" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06182e]/90 via-[#071b31]/60 to-[#051323]/50" />
        <div className="absolute right-5 top-3 z-10 hidden border-l border-sky-200/40 pl-3 text-[9px] font-bold uppercase leading-[14px] tracking-[.18em] text-sky-200/85 2xl:block">DISCIPLINA<br />PROGRESO<br />LIBERTAD</div>
        <div className="relative grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.7fr)_minmax(0,2.15fr)] lg:items-end">
          <div className="relative z-10 flex min-w-0 flex-col items-start py-1">
            <span className="text-[10px] font-bold uppercase tracking-[.14em] text-sky-200">Centro de comando personal</span>
            <h1 className="mt-2 text-balance text-3xl font-extrabold leading-[1.02] text-white sm:text-4xl 2xl:text-[2.65rem]">Hola, <span className="text-sky-200">{data.name}</span> <span aria-hidden="true" className="text-2xl">👋</span></h1>
            <p className="mt-2 max-w-[500px] text-xs leading-5 text-slate-300">Tu panel de control para mantener el foco y ver tu progreso integral en Salud, Data/Carrera y Cuidado Personal.</p>
            <div className="mt-auto flex w-full flex-wrap items-center gap-2 pt-3">
              <button type="button" onClick={onRegister} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-sky-300/35 bg-sky-400/15 px-3 text-[11px] font-bold text-sky-100 transition hover:bg-sky-400/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"><Plus size={13} />Registrar entrada</button>
              <span className="text-[10px] text-slate-400">{data.week}</span>
            </div>
          </div>
          <div className="relative hidden h-[210px] self-end lg:block"><Image src={data.photo} alt="" fill sizes="280px" className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_85%,transparent)]" /></div>
          <div className="relative z-10 grid min-w-0 grid-cols-1 gap-2 min-[430px]:grid-cols-2 2xl:grid-cols-4">
            <ProgressCard label="General" value={data.progress.general} detail="Los tres pilares" Icon={BarChart3} kind="blue" />
            <ProgressCard label="Salud" value={data.progress.health} detail="Bienestar físico" Icon={Heart} kind="green" />
            <ProgressCard label="Data / Carrera" value={data.progress.career} detail="Progreso profesional" Icon={BriefcaseBusiness} kind="orange" />
            <ProgressCard label="Cuidado Personal" value={data.progress.care} detail="Equilibrio personal" Icon={UserRound} kind="violet" />
          </div>
        </div>
      </motion.section>

      <motion.section {...enter} className="rounded-2xl border border-sky-200/10 bg-[#081a2b]/90 p-3">
        <Headline icon={Sparkles} title="Principales indicadores" detail="Un vistazo rápido a lo más importante de esta semana." action={data.week} />
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <QuickMetric Icon={HeartPulse} label="Rutina semanal" value={`${h.completed}/${h.planned}`} detail={`${h.trainingPct}% completado`} kind="green" pct={h.trainingPct} visual="routine" />
          <QuickMetric Icon={Activity} label="Actividad profesional" value={`${c.events}`} detail="Eventos esta semana" kind="orange" pct={c.activityPct} visual="activity" />
          <QuickMetric Icon={BarChart3} label="Productividad semanal" value={`${c.weeklyPct}%`} detail={c.weeklyCompleted === null ? "Sin desglose semanal" : `${c.weeklyCompleted} tareas completadas`} kind="violet" pct={c.weeklyPct} visual="bars" />
          <QuickMetric Icon={Layers3} label="Skills utilizadas" value={c.usedSkills === null ? "—" : `${c.usedSkills}/${c.totalSkills ?? 0}`} detail={`${c.skillsPct}% del catálogo`} kind="blue" pct={c.skillsPct} visual="skills" />
          <motion.div whileHover={reduced ? undefined : { y: -3, boxShadow: "0 0 22px rgba(86,184,255,.26), inset 0 0 22px rgba(86,184,255,.10)" }} transition={{ duration: .22 }} className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-sky-300/20 bg-[#07182a] p-3">
            <Image src="/images/lifetrack/night-mountains.webp" alt="" fill sizes="240px" loading="eager" className="object-cover object-center opacity-35 transition-opacity duration-200 group-hover:opacity-50" />
            <Target size={22} className="relative shrink-0 text-emerald-300 motion-safe:transition-transform motion-safe:group-hover:scale-110" />
            <p className="relative text-xs italic leading-5 text-slate-200">Tu progreso se construye un día a la vez.</p>
          </motion.div>
        </div>
      </motion.section>

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
        <PillarPanel kind="green" title="Indicadores clave de Salud" subtitle="Tu energía de hoy construye el mañana." Icon={HeartPulse} href="/pilares/salud" metrics={<>
          <MiniMetric label="Rutina" value={`${h.completed}/${h.planned}`} detail={`${h.trainingPct}% semanal`} pct={h.trainingPct} Icon={CalendarCheck2} kind="green" />
          <MiniMetric label="Agua" value={h.waterLiters === null ? "—" : `${h.waterLiters.toFixed(2)} L`} detail={`${h.waterPct}% semanal`} Icon={Droplets} kind="blue" iconOnly />
          <MiniMetric label="Calorías" value={h.calories === null ? "—" : `${Math.round(h.calories).toLocaleString("es-PE")}`} detail={h.calorieTarget === null ? "Sin meta" : `Meta ${Math.round(h.calorieTarget).toLocaleString("es-PE")}`} Icon={Flame} kind="orange" iconOnly />
          <MiniMetric label="Energía" value={formatTen(h.energy)} detail="Último/sem." Icon={Activity} kind="green" iconOnly />
        </>}>
          <IndicatorBars title="Lectura semanal de hábitos" color={tone.green.color} rows={[{ label: "Rutina", value: h.trainingPct, display: `${h.trainingPct}%` }, { label: "Hidratación", value: h.waterPct, display: `${h.waterPct}%` }, { label: "Calorías vs. meta", value: h.caloriePct, display: `${h.caloriePct}%` }, { label: "Energía", value: (h.energy ?? 0) * 10, display: formatTen(h.energy) }]} />
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-[#061320]/75 p-2.5"><p className="flex items-center gap-1.5 text-[11px] text-slate-300"><Scale size={15} className="text-sky-300" />Último peso</p><div className="flex items-center justify-between gap-2"><p className="text-xl font-extrabold text-white">{h.weight === null ? "—" : `${h.weight} kg`}</p><p className="text-[10px] text-slate-400">{h.weightRecords} registros</p></div><WeightTrend values={h.recentWeights} /><div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-300"><CircleCheck size={12} />{h.weight === null ? "Sin peso registrado" : "Datos registrados en Salud"}</div></div>
        </PillarPanel>

        <PillarPanel kind="orange" title="Indicadores de Data/Carrera" subtitle="Aprende, construye y crea oportunidades." Icon={BriefcaseBusiness} href="/pilares/carrera" metrics={<>
          <MiniMetric label="Proyectos" value={`${c.activeProjects}/${c.totalProjects}`} detail="En curso" pct={c.totalProjects ? c.activeProjects / c.totalProjects * 100 : 0} Icon={BriefcaseBusiness} kind="orange" />
          <MiniMetric label="Tareas" value={`${c.completedTasks}/${c.totalTasks}`} detail={`${c.taskPct}% listo`} pct={c.taskPct} Icon={Check} kind="green" ringCenter="check" />
          <MiniMetric label="Prod. semanal" value={`${c.weeklyPct}%`} detail="Esta semana" Icon={TrendingUp} kind="violet" iconOnly />
          <MiniMetric label="Skills" value={c.usedSkills === null ? "—" : `${c.usedSkills}/${c.totalSkills ?? 0}`} detail={`${c.skillsPct}%`} Icon={BookOpenCheck} kind="blue" iconOnly />
        </>}>
          <IndicatorBars title="Progreso profesional" color={tone.orange.color} rows={[{ label: "Subtareas", value: c.taskPct, display: `${c.taskPct}%` }, { label: "Productividad semanal", value: c.weeklyPct, display: `${c.weeklyPct}%` }, { label: "Uso del stack", value: c.skillsPct, display: `${c.skillsPct}%` }, { label: "Actividad demostrable", value: c.activityPct, display: `${c.activityPct}%` }]} />
          <StackUsage skills={c.topSkills} totalLinks={c.totalSkillLinks} />
        </PillarPanel>

        <PillarPanel kind="violet" title="Indicadores de Cuidado Personal" subtitle="Una mente tranquila también te lleva lejos." Icon={UserRound} href="/pilares/cuidado-personal" metrics={<>
          <MiniMetric label="Check-ins" value={`${p.checkins}/7`} detail={`${p.checkinPct}%`} pct={p.checkinPct} Icon={CalendarCheck2} kind="violet" />
          <MiniMetric label="Rutinas" value={`${p.routines}`} detail={`${p.activeRoutines} activas`} Icon={CircleCheck} kind="violet" iconOnly />
          <MiniMetric label="Ánimo" value={formatTen(p.mood)} detail="Promedio" Icon={Heart} kind="orange" iconOnly />
          <MiniMetric label="Estrés" value={formatTen(p.stress)} detail="Promedio" Icon={Flame} kind="violet" iconOnly />
        </>}>
          <IndicatorBars title="Lectura emocional semanal" color={tone.violet.color} rows={[{ label: "Ánimo", value: (p.mood ?? 0) * 10, display: formatTen(p.mood) }, { label: "Motivación", value: (p.motivation ?? 0) * 10, display: formatTen(p.motivation) }, { label: "Sueño (calidad)", value: (p.sleepQuality ?? 0) * 10, display: formatTen(p.sleepQuality) }, { label: "Estrés", value: (p.stress ?? 0) * 10, display: formatTen(p.stress) }]} />
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-[#061320]/75 p-3"><p className="flex items-center gap-1.5 text-[11px] text-slate-300"><Moon size={13} className="text-violet-300" />Calidad del sueño</p><p className="text-xl font-extrabold text-white">{formatTen(p.sleepQuality)}</p><p className="text-[10px] text-slate-400">Percepción promedio semanal</p><div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-violet-300">{p.reflections} días con reflexión</div></div>
        </PillarPanel>
      </div>

      <motion.section {...enter} className="rounded-2xl border border-sky-200/10 bg-[#081a2b]/90 p-3">
        <Headline icon={Sparkles} title="Análisis inteligente por pilar" detail="Lecturas basadas en tus datos reales." />
        <div className="mt-2 grid gap-2 xl:grid-cols-3">
          <InsightCard kind="green" title="Salud" Icon={HeartPulse} insight={data.insights.health} />
          <InsightCard kind="orange" title="Data/Carrera" Icon={BriefcaseBusiness} insight={data.insights.career} />
          <InsightCard kind="violet" title="Cuidado Personal" Icon={UserRound} insight={data.insights.care} />
        </div>
      </motion.section>
      <LifeTrackFooter />
    </div>
  )
}
