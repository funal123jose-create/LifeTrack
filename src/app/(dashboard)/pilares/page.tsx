"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BrainCircuit, ChartNoAxesColumnIncreasing,
  CircleCheck, Droplets, Dumbbell, Flame, Flower2, Heart, Moon, Smile, Target,
  type LucideIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentWeekStartString } from "@/lib/date"
import { LifeTrackFooter } from "@/components/lifetrack-footer"
import { ImmersivePillarCard } from "@/components/pillars/immersive-pillar-card"
import "./pillars-2026.css"

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

export default function PilaresMenuPage() {
  const { snapshot, status } = usePillarSnapshot()

  return <div className="pillar-2026 pillars-index" id="lt26-content" tabIndex={-1}>
    <header className="pillar-index-heading">
      <div><h1>Tus pilares de vida</h1><p>Un espacio para tu salud, tu crecimiento y tu bienestar.</p></div>
      <span className="pillar-index-period">Salud y bienestar: esta semana<br />Carrera: último resumen disponible</span>
    </header>
    <div className="pillar-immersive-grid">
      {pillars.map((pillar) => <ImmersivePillarCard key={pillar.key} tone={pillar.key} title={pillar.title}
        description={pillar.description} href={pillar.href} action={pillar.action} icon={pillar.icon}
        topics={pillar.topics} metrics={metricsFor(pillar.key, snapshot, status[pillar.key])} status={status[pillar.key]} />)}
    </div>
    <LifeTrackFooter current />
  </div>
}
