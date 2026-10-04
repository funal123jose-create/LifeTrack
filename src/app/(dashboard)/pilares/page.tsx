"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight, BrainCircuit, ChartNoAxesColumnIncreasing, ChevronRight,
  CircleCheck, Droplets, Dumbbell, Flame, Flower2, Heart, Moon, Smile, Target,
  type LucideIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentWeekStartString } from "@/lib/date"
import { LifeTrackFooter } from "@/components/lifetrack-footer"

type PillarKey = "health" | "career" | "care"
type LoadStatus = "loading" | "ready" | "error"
type Metric = { label: string; value: string; icon: LucideIcon; color: string }
type Snapshot = {
  health: { water: number | null; calories: number | null; training: number; planned: number }
  career: { productivity: number | null; tasksDone: number | null; tasksTotal: number | null; projects: number | null }
  care: { mood: number | null; sleep: number | null; routineDays: number | null }
}

const pillars = [
  { key: "health", title: "Salud Física", eyebrow: "Cuerpo en alto rendimiento",
    description: "Monitorea tu hidratación diaria, presupuesto calórico y planifica tu calendario semanal de entrenamientos.",
    href: "/pilares/salud", action: "Entrar a Salud", icon: Heart,
    topics: ["Hidratación", "Calorías", "Rutinas", "Hábitos"] },
  { key: "career", title: "Data & Carrera", eyebrow: "Portafolio profesional",
    description: "Gestiona tu portafolio de proyectos, tecnologías dominadas y haz seguimiento a tus metas profesionales.",
    href: "/pilares/carrera", action: "Entrar a Data & Carrera", icon: ChartNoAxesColumnIncreasing,
    topics: ["Proyectos", "Tecnologías", "Metas Tech", "Aprendizaje"] },
  { key: "care", title: "Cuidado Personal", eyebrow: "Bienestar y autocuidado",
    description: "Registra tu check-in diario, estado de ánimo, estrés, descanso y rutinas de autocuidado personal.",
    href: "/pilares/cuidado-personal", action: "Entrar a Cuidado Personal", icon: BrainCircuit,
    topics: ["Check-in", "Sueño", "Mindfulness", "Bienestar"] },
] as const

const theme = {
  health: {
    card: "border-emerald-400/65 bg-[linear-gradient(145deg,#06342d_0%,#05211f_48%,#07151d_100%)] hover:shadow-[0_0_34px_rgba(16,211,150,.30)]",
    color: "text-emerald-300", border: "border-emerald-400/45", tile: "border-emerald-400/35 bg-emerald-400/10",
    button: "border-emerald-400/60 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-800 hover:from-emerald-400 hover:to-teal-700",
    chip: "border-emerald-400/55 hover:bg-emerald-400/15", dot: "bg-emerald-400",
  },
  career: {
    card: "border-orange-400/65 bg-[linear-gradient(145deg,#2b201c_0%,#201b1c_47%,#111722_100%)] hover:shadow-[0_0_34px_rgba(255,145,55,.30)]",
    color: "text-orange-300", border: "border-orange-400/45", tile: "border-orange-400/35 bg-orange-400/10",
    button: "border-orange-400/60 bg-gradient-to-r from-amber-500 via-orange-600 to-orange-900 hover:from-amber-400 hover:to-orange-700",
    chip: "border-orange-400/55 hover:bg-orange-400/15", dot: "bg-orange-400",
  },
  care: {
    card: "border-violet-400/65 bg-[linear-gradient(145deg,#251b42_0%,#191930_48%,#101523_100%)] hover:shadow-[0_0_34px_rgba(165,90,255,.30)]",
    color: "text-violet-300", border: "border-violet-400/45", tile: "border-violet-400/35 bg-violet-400/10",
    button: "border-violet-400/60 bg-gradient-to-r from-violet-500 via-violet-700 to-purple-900 hover:from-violet-400 hover:to-purple-700",
    chip: "border-violet-400/55 hover:bg-violet-400/15", dot: "bg-violet-400",
  },
} as const

function routineCounts(
  routines: { dia_semana: number; descripcion_rutina: string | null }[],
  completions: { dia_semana: number; routine_type: string }[],
) {
  const completed = new Set(completions.map((row) => `${Number(row.dia_semana)}-${row.routine_type}`))
  let planned = 0
  let training = 0
  for (const row of routines) {
    let strength = false
    let cardio = false
    try {
      const parsed = JSON.parse(row.descripcion_rutina || "{}")
      strength = String(parsed.fuerza || "").trim() !== ""
      cardio = String(parsed.cardio || "").trim() !== ""
    } catch {
      strength = String(row.descripcion_rutina || "").trim() !== ""
    }
    if (!strength && !cardio) continue
    planned++
    if ((!strength || completed.has(`${Number(row.dia_semana)}-fuerza`)) &&
      (!cardio || completed.has(`${Number(row.dia_semana)}-cardio`))) training++
  }
  return { training, planned }
}

function usePillarSnapshot() {
  const supabase = useMemo(() => createClient(), [])
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [status, setStatus] = useState<Record<PillarKey, LoadStatus>>({ health: "loading", career: "loading", care: "loading" })

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      if (sessionError || !session?.user) {
        setStatus({ health: "error", career: "error", care: "error" })
        return
      }
      const userId = session.user.id
      const weekStart = getCurrentWeekStartString()
      const [health, career, care, routines, completions] = await Promise.all([
        supabase.from("vw_weekly_health_summary").select("total_water_liters, avg_daily_calories")
          .eq("user_id", userId).eq("week_start", weekStart).maybeSingle(),
        supabase.from("vw_weekly_career_summary").select("weekly_productivity_percentage, completed_tasks, total_tasks, active_projects")
          .eq("user_id", userId).order("week_start", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("vw_weekly_personal_care_summary").select("avg_mood_level, avg_sleep_quality, routine_completed_days")
          .eq("user_id", userId).eq("week_start", weekStart).maybeSingle(),
        supabase.from("rutinas_entrenamiento").select("dia_semana, descripcion_rutina")
          .eq("user_id", userId).eq("activo", true),
        supabase.from("health_routine_completions").select("dia_semana, routine_type")
          .eq("user_id", userId).eq("week_start", weekStart).eq("completed", true),
      ])
      if (!active) return
      setSnapshot({
        health: {
          water: health.data?.total_water_liters == null ? null : Number(health.data.total_water_liters),
          calories: health.data?.avg_daily_calories == null ? null : Number(health.data.avg_daily_calories),
          ...routineCounts(routines.data ?? [], completions.data ?? []),
        },
        career: {
          productivity: career.data?.weekly_productivity_percentage == null ? null : Number(career.data.weekly_productivity_percentage),
          tasksDone: career.data?.completed_tasks == null ? null : Number(career.data.completed_tasks),
          tasksTotal: career.data?.total_tasks == null ? null : Number(career.data.total_tasks),
          projects: career.data?.active_projects == null ? null : Number(career.data.active_projects),
        },
        care: {
          mood: care.data?.avg_mood_level == null ? null : Number(care.data.avg_mood_level),
          sleep: care.data?.avg_sleep_quality == null ? null : Number(care.data.avg_sleep_quality),
          routineDays: care.data?.routine_completed_days == null ? null : Number(care.data.routine_completed_days),
        },
      })
      setStatus({
        health: health.error || routines.error || completions.error ? "error" : "ready",
        career: career.error ? "error" : "ready",
        care: care.error ? "error" : "ready",
      })
    }
    load().catch((error) => {
      console.error("No se pudieron cargar los indicadores de Pilares:", error)
      if (active) setStatus({ health: "error", career: "error", care: "error" })
    })
    return () => { active = false }
  }, [supabase])
  return { snapshot, status }
}

function metricsFor(key: PillarKey, snapshot: Snapshot | null, status: LoadStatus): Metric[] {
  const absent = status === "loading" ? "…" : "—"
  if (key === "health") return [
    { label: "Agua semanal", value: snapshot?.health.water == null || status === "error" ? absent : `${snapshot.health.water.toFixed(2)} L`, icon: Droplets, color: "text-cyan-300" },
    { label: "Calorías / día", value: snapshot?.health.calories == null || status === "error" ? absent : Math.round(snapshot.health.calories).toLocaleString("es-PE"), icon: Flame, color: "text-orange-300" },
    { label: "Entrenamiento", value: snapshot && status !== "error" ? `${snapshot.health.training}/${snapshot.health.planned} días` : absent, icon: Dumbbell, color: "text-emerald-300" },
  ]
  if (key === "career") return [
    { label: "Productividad", value: snapshot?.career.productivity == null || status === "error" ? absent : `${Math.round(snapshot.career.productivity)}%`, icon: ChartNoAxesColumnIncreasing, color: "text-orange-300" },
    { label: "Subtareas", value: snapshot?.career.tasksDone == null || snapshot.career.tasksTotal == null || status === "error" ? absent : `${snapshot.career.tasksDone}/${snapshot.career.tasksTotal}`, icon: Target, color: "text-amber-300" },
    { label: "Proyectos activos", value: snapshot?.career.projects == null || status === "error" ? absent : `${snapshot.career.projects}`, icon: CircleCheck, color: "text-emerald-300" },
  ]
  return [
    { label: "Ánimo", value: snapshot?.care.mood == null || status === "error" ? absent : `${snapshot.care.mood.toFixed(1)}/10`, icon: Smile, color: "text-violet-300" },
    { label: "Sueño (calidad)", value: snapshot?.care.sleep == null || status === "error" ? absent : `${snapshot.care.sleep.toFixed(1)}/10`, icon: Moon, color: "text-violet-300" },
    { label: "Autocuidado", value: snapshot?.care.routineDays == null || status === "error" ? absent : `${snapshot.care.routineDays} días`, icon: Flower2, color: "text-violet-300" },
  ]
}

function WaveLine({ text, offset, reducedMotion }: { text: string; offset: number; reducedMotion: boolean | null }) {
  return <span aria-hidden="true">{Array.from(text).map((letter, index) =>
    <motion.span
      key={index}
      className="inline-block"
      animate={reducedMotion ? undefined : { y: [0, -4, 1, 0], color: ["#e2e8f0", "#b8eaff", "#e2e8f0"], textShadow: ["0 0 0px #7dd3fc", "0 0 9px #7dd3fc", "0 0 0px #7dd3fc"] }}
      transition={{ duration: .85, repeat: Infinity, repeatDelay: 4, delay: (offset + index) * .055, ease: "easeInOut" }}
    >{letter === " " ? "\u00a0" : letter}</motion.span>
  )}</span>
}

export default function PilaresMenuPage() {
  const reducedMotion = useReducedMotion()
  const { snapshot, status } = usePillarSnapshot()

  return (
    <div className="pillars-command-center lifetrack-redesign relative min-h-screen px-2 pb-8 pt-2 font-sans text-slate-100 sm:px-4 sm:pt-3">
      <div className="mx-auto w-full max-w-[1728px] space-y-4">
        <section className="relative isolate overflow-hidden rounded-2xl border border-sky-200/15 bg-[#081b30]">
          <Image src="/images/lifetrack/night-mountains.webp" alt="" fill priority sizes="(min-width: 1600px) 1600px, 100vw" className="object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#051421]/90 via-[#061729]/60 to-[#071624]/65" />
          <div className="relative grid min-h-[245px] gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,.76fr)_minmax(225px,.58fr)] lg:items-end">
            <div className="min-w-0 self-center">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-sky-200"><span className="h-2 w-2 rounded-full border border-teal-300" />Centro de pilares de vida <span className="h-px w-5 bg-sky-300/70" /></p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[.98] text-white sm:text-5xl xl:text-[58px]">Gestión de<br /><span className="bg-gradient-to-r from-teal-300 via-sky-300 to-orange-200 bg-clip-text text-transparent">Pilares de Vida</span></h1>
              <p className="mt-3 max-w-[650px] text-sm leading-6 text-slate-300">Selecciona un pilar fundamental para registrar actividades, auditar proyectos, planificar rutinas y controlar tu evolución personal desde un solo centro visual.</p>
            </div>
            <blockquote className="min-w-0 rounded-2xl border border-sky-300/20 bg-[#081c34]/70 p-4 shadow-[0_12px_28px_rgba(0,0,0,.20)] backdrop-blur-sm">
              <span className="text-3xl font-extrabold leading-none text-sky-300">“</span>
              <p aria-label="Disciplina hoy, una vida extraordinaria mañana." className="-mt-2 pl-8 text-lg italic leading-6 text-slate-100">
                <WaveLine text="Disciplina hoy," offset={0} reducedMotion={reducedMotion} /><br aria-hidden="true" />
                <WaveLine text="una vida extraordinaria mañana." offset={15} reducedMotion={reducedMotion} />
              </p>
              <cite className="mt-2 block pl-8 text-xs italic text-sky-200/75">— LifeTrack</cite>
            </blockquote>
            <div className="min-w-0 rounded-2xl border border-sky-200/20 bg-[#081b31]/75 p-4 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase leading-5 tracking-[.24em] text-sky-200">Tres pilares<br />un mismo propósito</p>
              <div className="mt-3 flex justify-center gap-3">
                {(["health", "career", "care"] as const).map((key) => {
                  const Icon = key === "health" ? Heart : key === "career" ? ChartNoAxesColumnIncreasing : BrainCircuit
                  return <motion.span key={key} whileHover={reducedMotion ? undefined : { y: -4, scale: 1.07 }} className={`flex h-12 w-12 items-center justify-center rounded-xl border ${theme[key].tile} ${theme[key].color}`}><Icon size={25} /></motion.span>
                })}
              </div>
              <p className="mt-3 text-[9px] font-semibold uppercase tracking-[.17em] text-sky-200/85">Salud · Carrera · Bienestar</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-sky-200/70">Una mejor versión de ti</p>
            </div>
          </div>
        </section>

        <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            const accent = theme[pillar.key]
            const state = status[pillar.key]
            const metrics = metricsFor(pillar.key, snapshot, state)
            return <motion.article key={pillar.key} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: index * .08 }} className={`group relative flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-[21px] border p-4 shadow-[0_16px_45px_rgba(0,0,0,.24)] transition-[box-shadow,transform] duration-300 motion-safe:hover:-translate-y-1 sm:p-6 lg:last:col-span-2 xl:last:col-span-1 ${accent.card}`}>
              {pillar.key === "health" && <div className="pointer-events-none absolute right-[-10%] top-[14%] h-[65%] w-[70%] opacity-75 [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"><Image src="/images/lifetrack/health-anatomy.png" alt="" fill sizes="(min-width: 1280px) 26vw, 60vw" className="object-contain object-right" /></div>}
              {pillar.key === "career" && <div className="pointer-events-none absolute right-[-7%] top-[18%] h-[63%] w-[77%] opacity-75 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"><Image src="/images/lifetrack/career-bars.png" alt="" fill sizes="(min-width: 1280px) 28vw, 65vw" className="object-contain object-right" /></div>}
              {pillar.key === "care" && <div className="pointer-events-none absolute right-[-12%] top-[14%] h-[65%] w-[72%] opacity-70 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"><Image src="/images/lifetrack/care-meditation.webp" alt="" fill sizes="(min-width: 1280px) 26vw, 60vw" className="object-contain object-right" /></div>}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#041018]/55 via-transparent to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-2">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${accent.tile} ${accent.color}`}><Icon size={29} /></span>
                <Link href={pillar.href} className={`flex items-center gap-2 rounded-full border bg-[#071520]/60 px-3 py-2 text-[10px] font-bold uppercase tracking-[.05em] backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${accent.border} ${accent.color}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${state === "error" ? "bg-rose-400" : accent.dot}`} />{state === "loading" ? "Cargando" : state === "error" ? "No disponible" : "Sincronizado"}<ChevronRight size={15} />
                </Link>
              </div>
              <div className="relative z-10 mt-5 max-w-[76%] sm:max-w-[70%]">
                <p className={`text-[11px] font-extrabold uppercase tracking-[.15em] ${accent.color}`}>{pillar.eyebrow}</p>
                <h2 className="mt-1.5 text-[27px] font-extrabold leading-tight text-white sm:text-[31px]">{pillar.title}</h2>
                <p className="mt-2 text-[13px] leading-[1.65] text-slate-200">{pillar.description}</p>
              </div>
              <div className="relative z-10 mt-auto pt-5">
                <div className="grid grid-cols-3 gap-2">
                  {metrics.map((metric) => {
                    const MetricIcon = metric.icon
                    return <div key={metric.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/15 bg-[#07121d]/70 p-2.5 backdrop-blur-sm transition-[background,transform,border-color] duration-200 hover:-translate-y-1 hover:border-white/30 hover:bg-[#10243a]/90" title={`${metric.label}: ${metric.value}`}>
                      <MetricIcon size={20} className={`shrink-0 ${metric.color}`} />
                      <div className="min-w-0"><strong className="block break-words text-sm font-extrabold leading-5 text-white sm:text-base">{metric.value}</strong><span className="block break-words text-[10px] leading-3 text-slate-300">{metric.label}</span></div>
                    </div>
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pillar.topics.map((topic) => <span key={topic} className={`rounded-full border bg-[#07131c]/40 px-2 py-2 text-center text-[11px] text-slate-200 transition-[background,transform] duration-200 motion-safe:hover:-translate-y-0.5 ${accent.chip}`}>{topic}</span>)}
                </div>
                <Link href={pillar.href} className={`mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border px-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,.25)] transition-[filter,transform] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${accent.button}`}><ArrowRight size={20} />{pillar.action}<ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
              </div>
            </motion.article>
          })}
        </div>

        <LifeTrackFooter />
      </div>
    </div>
  )
}
