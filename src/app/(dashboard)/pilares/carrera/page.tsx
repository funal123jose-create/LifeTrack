"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FolderPlus, ChevronLeft, BrainCircuit, CheckCircle2, Circle,
  Trash2, Plus, Clock, Play, ListTodo, HelpCircle, AlertCircle, X, Maximize2, Archive, Activity, Sparkles,
  Tags, Database, Cpu, Layers3
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// --- COMPONENTE INTERACTIVO DE FONDO DARK MINIMALISTA CON ACENTOS NARANJA, PARTÍCULAS Y MOUSE TRACKING ---
function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  const floatingParticles = Array.from({ length: 34 }, (_, i) => ({
    id: i,
    size: 2.2 + (i % 6) * 1.15,
    left: `${3 + ((i * 13) % 94)}%`,
    top: `${5 + ((i * 19) % 88)}%`,
    duration: 7 + (i % 8),
    delay: (i % 10) * 0.36,
    x: (i % 2 === 0 ? 16 : -16) + (i % 5) * 3,
    y: -16 - (i % 6) * 6,
    opacity: 0.14 + (i % 5) * 0.04,
  }))

  const emberDust = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${4 + ((i * 17) % 92)}%`,
    top: `${6 + ((i * 23) % 84)}%`,
    duration: 9 + (i % 9),
    delay: (i % 8) * 0.48,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      originalRadius: number
      hue: number
    }[] = []

    const particleCount = Math.min(115, Math.floor(width / 13))

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.45 + 0.55
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        radius,
        originalRadius: radius,
        hue: Math.random() > 0.5 ? 28 : 43,
      })
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Aura naranja sutil alrededor del mouse. Mantiene el efecto interactivo sin pintar todo el fondo.
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        390
      )

      mouseGradient.addColorStop(0, "rgba(251,146,60,0.145)")
      mouseGradient.addColorStop(0.34, "rgba(249,115,22,0.065)")
      mouseGradient.addColorStop(0.66, "rgba(245,158,11,0.026)")
      mouseGradient.addColorStop(1, "rgba(2,6,23,0)")

      ctx.fillStyle = mouseGradient
      ctx.fillRect(0, 0, width, height)

      // Red de partículas naranja/ámbar más minimalista.
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const mouseDistance = Math.hypot(p.x - mouseRef.current.x, p.y - mouseRef.current.y)
        const isNearMouse = mouseDistance < 155

        if (isNearMouse) {
          p.radius = p.originalRadius * 2.65
          ctx.fillStyle = "rgba(255,214,102,0.82)"
        } else {
          p.radius = p.originalRadius
          ctx.fillStyle = p.hue === 28 ? "rgba(251,146,60,0.46)" : "rgba(245,158,11,0.38)"
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        if (isNearMouse) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(251,191,36,0.055)"
          ctx.fill()
        }
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y)

          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.20
            ctx.strokeStyle = `rgba(251, 146, 60, ${opacity})`
            ctx.lineWidth = (1 - dist / 130) * 0.78
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Franjitas diagonales naranjas en movimiento: se mantiene el efecto que te gustó, pero más premium.
      const time = Date.now() * 0.00035
      ctx.strokeStyle = "rgba(245,158,11,0.040)"
      ctx.lineWidth = 1

      for (let i = -height; i < width; i += 155) {
        ctx.beginPath()
        ctx.moveTo(i + Math.sin(time + i) * 24, height)
        ctx.lineTo(i + height + Math.cos(time + i) * 24, 0)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      {/* BASE DARK MINIMALISTA: ya no se siente naranja, solo acentos */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_12%,rgba(249,115,22,0.105),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(245,158,11,0.075),transparent_32%),radial-gradient(circle_at_52%_92%,rgba(59,130,246,0.035),transparent_36%),linear-gradient(135deg,#02040a_0%,#08070b_42%,#030303_100%)]" />

      {/* CANVAS DE RED INTERACTIVA */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-100" />

      {/* GRID TECNOLÓGICO MÁS FINO */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.42] bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:82px_82px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      {/* SCANLINES MUY SUTILES */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.032] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.55)_50%,transparent_100%)] bg-[length:100%_10px]" />

      {/* ANILLOS HUD NARANJA SUTILES */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="fixed left-1/2 top-1/2 z-0 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-orange-300/[0.045] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 88, repeat: Infinity, ease: "linear" }}
        className="fixed left-1/2 top-1/2 z-0 h-[690px] w-[690px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/[0.04] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.04, 1] }}
        transition={{
          rotate: { duration: 96, repeat: Infinity, ease: "linear" },
          scale: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        className="fixed left-1/2 top-1/2 z-0 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/[0.032] pointer-events-none"
      />

      {/* BARRIDO VERTICAL NARANJA MUY LIGERO */}
      <motion.div
        animate={{ y: ["-18%", "120%"] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
        className="fixed left-0 top-0 z-0 h-56 w-full bg-gradient-to-b from-transparent via-orange-300/[0.032] to-transparent pointer-events-none"
      />

      {/* ONDAS DE DATA STREAM SUTILES */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.10, 0.24, 0.10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-0 top-[21%] z-0 w-[120%] pointer-events-none"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L120 100 L170 92 L220 108 L270 58 L315 142 L370 100 L500 100 L650 100 L700 95 L745 112 L790 60 L835 142 L890 100 L1040 100 L1110 100 L1150 92 L1190 108 L1240 58 L1288 142 L1340 100 L1600 100"
            fill="none"
            stroke="rgba(251,146,60,0.155)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: ["8%", "-6%", "8%"], opacity: [0.07, 0.16, 0.07] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-0 bottom-[16%] z-0 w-[120%] pointer-events-none"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L140 100 L190 102 L230 96 L265 110 L310 72 L350 132 L405 100 L540 100 L680 100 L730 98 L770 112 L810 75 L850 135 L905 100 L1080 100 L1130 98 L1175 112 L1220 70 L1260 137 L1320 100 L1600 100"
            fill="none"
            stroke="rgba(245,158,11,0.10)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* PARTÍCULAS FLOTANTES NEÓN, MÁS LIMPIAS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingParticles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              boxShadow:
                p.id % 3 === 0
                  ? "0 0 14px rgba(251,146,60,0.46), 0 0 28px rgba(249,115,22,0.060)"
                  : p.id % 3 === 1
                    ? "0 0 14px rgba(245,158,11,0.38), 0 0 28px rgba(245,158,11,0.12)"
                    : "0 0 14px rgba(255,214,102,0.34), 0 0 28px rgba(251,191,36,0.10)",
            }}
            animate={{
              y: [0, p.y, 0],
              x: [0, p.x, 0],
              scale: [1, 1.28, 1],
              opacity: [p.opacity * 0.45, p.opacity, p.opacity * 0.42],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* MICRO PARTÍCULAS / POLVO DIGITAL */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {emberDust.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-[2px] w-[2px] rounded-full bg-orange-200/45"
            style={{
              left: p.left,
              top: p.top,
              boxShadow: "0 0 10px rgba(251,191,36,0.32)",
            }}
            animate={{
              y: [0, -34, 0],
              x: [0, p.id % 2 === 0 ? 10 : -10, 0],
              opacity: [0.06, 0.28, 0.06],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* PULSOS CIRCULARES MINIMALISTAS */}
      <motion.div
        animate={{ opacity: [0.05, 0.16, 0.05], scale: [0.88, 1.15, 0.88] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-[14%] top-[34%] z-0 h-32 w-32 rounded-full border border-orange-300/12 bg-orange-400/[0.025] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], scale: [0.9, 1.12, 0.9] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed right-[18%] bottom-[22%] z-0 h-28 w-28 rounded-full border border-amber-300/10 bg-amber-400/[0.02] pointer-events-none"
      />

      {/* VIÑETA DARK PARA EVITAR FONDO MUY NARANJA */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(2,4,10,0.90)_100%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#02040a]/34" />
    </>
  )
}

type ProjectStatus = 'Backlog' | 'En planeación' | 'En curso' | 'En pausa' | 'Completado' | 'Cancelado'
type TaskStatus = 'SIN EMPEZAR' | 'EN CURSO' | 'COMPLETADO' | 'ARCHIVADO'
type PriorityLevel = 'Baja' | 'Media' | 'Alta'

interface Task {
  id: string
  title: string
  status: TaskStatus
}

interface CareerSkill {
  id: string
  name: string
  category: string
  color: string | null
  icon: string | null
}

interface ProjectSkillLink {
  id: string
  skill_id: string
  proficiency_level: string | null
  notes: string | null
  career_skills: CareerSkill | null
}

interface Project {
  id: string
  title: string
  summary: string | null
  description: string | null
  status: ProjectStatus
  priority: PriorityLevel
  start_date: string | null
  end_date: string | null
  project_tasks: Task[]
  project_skills: ProjectSkillLink[]
}

export default function DataCarreraPage() {
  const supabase = createClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [careerSkills, setCareerSkills] = useState<CareerSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newTaskText, setNewTaskText] = useState("")

  const macroColumns: { id: ProjectStatus; label: string; color: string; bg: string; borderGlow: string; icon: any }[] = [
    { id: 'Backlog', label: 'Backlog', color: 'text-slate-400', bg: 'bg-slate-500/5', borderGlow: 'group-hover:border-slate-500/30', icon: HelpCircle },
    { id: 'En planeación', label: 'Planeación', color: 'text-amber-500', bg: 'bg-amber-500/5', borderGlow: 'group-hover:border-amber-500/30', icon: Clock },
    { id: 'En curso', label: 'En Curso', color: 'text-blue-500', bg: 'bg-blue-500/5', borderGlow: 'group-hover:border-blue-500/30', icon: Play },
    { id: 'En pausa', label: 'En Pausa', color: 'text-purple-400', bg: 'bg-purple-500/5', borderGlow: 'group-hover:border-purple-500/30', icon: AlertCircle },
    { id: 'Completado', label: 'Completado', color: 'text-emerald-500', bg: 'bg-emerald-500/5', borderGlow: 'group-hover:border-emerald-500/30', icon: CheckCircle2 },
    { id: 'Cancelado', label: 'Cancelado', color: 'text-rose-400', bg: 'bg-rose-500/5', borderGlow: 'group-hover:border-rose-500/30', icon: X }
  ]

  const microColumns: { id: TaskStatus; label: string; color: string; border: string; icon: any }[] = [
    { id: 'SIN EMPEZAR', label: 'Sin empezar', color: 'text-slate-400', border: 'border-slate-500/10', icon: Circle },
    { id: 'EN CURSO', label: 'En curso', color: 'text-blue-400', border: 'border-blue-500/10', icon: Clock },
    { id: 'COMPLETADO', label: 'Completado', color: 'text-emerald-400', border: 'border-emerald-400/10', icon: CheckCircle2 },
    { id: 'ARCHIVADO', label: 'Archivado', color: 'text-zinc-500', border: 'border-zinc-500/10', icon: Archive }
  ]

  const getProjectSkillLinks = (project?: Project | null) => {
    return project?.project_skills || []
  }

  const getProjectSkills = (project?: Project | null) => {
    return getProjectSkillLinks(project)
      .map((link) => link.career_skills)
      .filter((skill): skill is CareerSkill => Boolean(skill))
  }

  const groupedCareerSkills = careerSkills.reduce<Record<string, CareerSkill[]>>((acc, skill) => {
    const category = skill.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})

  const selectedProjectSkillIds = new Set(
    getProjectSkillLinks(selectedProject).map((link) => link.skill_id)
  )

  const sanitizeStatusForDB = (status: string): string => {
    const lower = status.toLowerCase().trim();
    if (lower === 'backlog') return 'Backlog';
    if (lower === 'en planeación' || lower === 'en planeacion' || lower === 'planeación' || lower === 'planeacion') return 'En planeación';
    if (lower === 'en curso') return 'En curso';
    if (lower === 'en pausa') return 'En pausa';
    if (lower === 'completado') return 'Completado';
    if (lower === 'cancelado') return 'Cancelado';
    return 'Backlog';
  }

  const fetchCareerSkills = useCallback(async () => {
    try {
      setLoadingSkills(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('career_skills')
        .select('id, name, category, color, icon')
        .eq('user_id', session.user.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      setCareerSkills((data || []).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category || 'General',
        color: skill.color || '#f97316',
        icon: skill.icon || 'Cpu'
      })))
    } catch (err: any) {
      console.error("Error sincronizando catálogo de skills:", err?.message || err)
    } finally {
      setLoadingSkills(false)
    }
  }, [supabase])

  const fetchProjects = useCallback(async (updateModalId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, title, summary, description, status, priority, start_date, end_date,
          project_tasks (id, title, status),
          project_skills (
            id,
            skill_id,
            proficiency_level,
            notes,
            career_skills (
              id,
              name,
              category,
              color,
              icon
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const mapped: Project[] = data.map((proj: any) => {
          let currentStatus: ProjectStatus = 'Backlog'
          const dbStatus = String(proj.status).toLowerCase().trim()

          if (dbStatus === 'en planeación' || dbStatus === 'en planeacion') currentStatus = 'En planeación'
          else if (dbStatus === 'en curso') currentStatus = 'En curso'
          else if (dbStatus === 'en pausa') currentStatus = 'En pausa'
          else if (dbStatus === 'completado') currentStatus = 'Completado'
          else if (dbStatus === 'cancelado') currentStatus = 'Cancelado'

          const cleanPriority = (proj.priority === 'Baja' || proj.priority === 'Media' || proj.priority === 'Alta') ?
            proj.priority : 'Media'

          const tasks: Task[] = (Array.isArray(proj.project_tasks) ? proj.project_tasks : []).map((t: any) => {
            const rawStatus = String(t.status || 'SIN EMPEZAR').toUpperCase() as TaskStatus
            return {
              id: t.id,
              title: t.title || '',
              status: ['SIN EMPEZAR', 'EN CURSO', 'COMPLETADO', 'ARCHIVADO'].includes(rawStatus) ? rawStatus : 'SIN EMPEZAR'
            }
          })

          const skillLinks: ProjectSkillLink[] = (Array.isArray(proj.project_skills) ? proj.project_skills : []).map((link: any) => ({
            id: link.id,
            skill_id: link.skill_id,
            proficiency_level: link.proficiency_level || 'Practicando',
            notes: link.notes || null,
            career_skills: link.career_skills ? {
              id: link.career_skills.id,
              name: link.career_skills.name,
              category: link.career_skills.category || 'General',
              color: link.career_skills.color || '#f97316',
              icon: link.career_skills.icon || 'Cpu'
            } : null
          }))

          return {
            id: proj.id,
            title: proj.title,
            summary: proj.summary,
            description: proj.description,
            status: currentStatus,
            priority: cleanPriority,
            start_date: proj.start_date,
            end_date: proj.end_date,
            project_tasks: tasks,
            project_skills: skillLinks
          }
        })

        setProjects(mapped)

        const targetId = updateModalId || selectedProject?.id
        if (targetId) {
          const updated = mapped.find(p => p.id === targetId)
          if (updated) setSelectedProject(updated)
        }
      }
    } catch (err: any) {
      console.error("Error crítico en sincronización de la matriz:", err?.message || err)
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedProject?.id])

  useEffect(() => {
    fetchCareerSkills()
    fetchProjects()
  }, [fetchCareerSkills, fetchProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from('projects')
        .insert([{
          user_id: session.user.id,
          title: newTitle.trim(),
          description: newDescription.trim(),
          summary: "",
          status: 'Backlog',
          priority: 'Media'
        }])

      if (error) throw error

      setNewTitle("")
      setNewDescription("")
      fetchProjects()
    } catch (err: any) {
      alert(`No se pudo inicializar el nodo de proyecto: ${err?.message}`)
    }
  }

  const handleUpdateProjectFields = async (fields: Partial<Omit<Project, 'id' | 'project_tasks'>>) => {
    if (!selectedProject) return

    const payload: any = { ...fields }

    if ('status' in payload && payload.status) {
      payload.status = sanitizeStatusForDB(payload.status)
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', selectedProject.id)

      if (error) throw error
      fetchProjects(selectedProject.id)
    } catch (err: any) {
      console.error("Error al mutar datos del proyecto en Supabase:", err?.message)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("⚠️ ADVERTENCIA: ¿Confirmas la desintegración total de este nodo de proyecto de la base de datos?")) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      setSelectedProject(null)
      fetchProjects()
    } catch (err: any) {
      console.error("Error en protocolo de eliminación:", err?.message || err)
    }
  }

  const handleToggleProjectSkill = async (skill: CareerSkill) => {
    if (!selectedProject) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const isLinked = selectedProjectSkillIds.has(skill.id)

      if (isLinked) {
        const { error } = await supabase
          .from('project_skills')
          .delete()
          .eq('project_id', selectedProject.id)
          .eq('skill_id', skill.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('project_skills')
          .insert([{
            user_id: session.user.id,
            project_id: selectedProject.id,
            skill_id: skill.id,
            proficiency_level: 'Practicando'
          }])

        if (error) throw error
      }

      await fetchProjects(selectedProject.id)
    } catch (err: any) {
      console.error("Error actualizando stack del proyecto:", err?.message || err)
      alert(`No se pudo actualizar el stack del proyecto: ${err?.message}`)
    }
  }

  const handleAddTask = async () => {
    if (!selectedProject || !newTaskText.trim()) return
    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: selectedProject.id,
          title: newTaskText.trim(),
          status: 'SIN EMPEZAR'
        }])

      if (error) throw error
      setNewTaskText("")
      await fetchProjects(selectedProject.id)
    } catch (err: any) {
      alert(`Error de inyección en subtareas: ${err?.message}`)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    if (!selectedProject) return
    try {
      const { error: taskError } = await supabase
        .from('project_tasks')
        .update({ status: nextStatus })
        .eq('id', taskId)

      if (taskError) throw taskError

      await fetchProjects(selectedProject.id)
    } catch (err: any) {
      console.error("Error en transición de microestado:", err?.message || err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProject) return
    try {
      const { error } = await supabase.from('project_tasks').delete().eq('id', taskId)
      if (error) throw error
      await fetchProjects(selectedProject.id)
    } catch (err: any) {
      console.error("Error al purgar microtarea:", err?.message || err)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.055 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.96, filter: "blur(5px)" },
    show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-6 overflow-x-hidden bg-[#02040a] px-4 pb-12 pt-6 font-sans text-slate-100 antialiased selection:bg-orange-500/[0.10] selection:text-orange-100 md:px-8">
      <CyberBackground />

      {/* HEADER PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 space-y-4"
      >
        <Link href="/pilares" className="group flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-orange-400/30 hover:bg-orange-500/[0.06] hover:text-orange-300">
          <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1.5" /> [ VOLVER A PILARES ]
        </Link>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[#080b12]/72 p-6 shadow-[0_24px_75px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.075),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.045),transparent_28%)]" />
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/[0.055] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-300/35 to-transparent" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.045] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.42em] text-orange-200/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <BrainCircuit size={14} className="animate-spin text-amber-300 [animation-duration:7s]" /> MATRIX CENTRAL TERMINAL
              </div>
              <h2 className="max-w-5xl text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                Pilar <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-slate-100 bg-clip-text text-transparent">Data & Carrera</span>
              </h2>
              <p className="max-w-2xl text-xs font-medium leading-relaxed text-slate-400 md:text-sm">
                Centro visual para controlar proyectos, avances y subtareas con una experiencia tipo dashboard premium.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.06] bg-black/24 p-2 backdrop-blur-xl">
              <div className="rounded-xl bg-[#080b12]/68 px-4 py-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nodos</p>
                <p className="text-2xl font-black text-white">{projects.length}</p>
              </div>
              <div className="rounded-xl bg-orange-500/[0.07] px-4 py-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-300/80">Activos</p>
                <p className="text-2xl font-black text-orange-300">{projects.filter(p => p.status === 'En curso').length}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.07] px-4 py-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">Completados</p>
                <p className="text-2xl font-black text-emerald-300">{projects.filter(p => p.status === 'Completado').length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FORMULARIO DE INICIALIZACIÓN */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: "easeOut", delay: 0.08 }}
        className="relative z-10"
      >
        <Card className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#080b12]/72 shadow-[0_20px_65px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.060),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_35%)] opacity-90" />
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50 transition-all duration-700 group-hover:opacity-100" />
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/[0.055] blur-3xl transition-all duration-700 group-hover:bg-orange-400/[0.10]" />

          <CardHeader className="relative pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-300">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/[0.055] shadow-[0_0_22px_rgba(249,115,22,0.15)]">
                <FolderPlus size={16} className="animate-pulse text-orange-300" />
              </span>
              // INICIALIZAR NODO DE DATA-STREAM
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleCreateProject} className="grid items-end gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">⚡ Identificador</label>
                <Input
                  placeholder="Ej. Dashboard Core Analytics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-12 rounded-2xl border-white/[0.08] bg-black/30 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 placeholder:text-slate-700 focus:border-orange-300/35 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">⚙️ Enfoque Técnico / Stacks</label>
                <Input
                  placeholder="Ej. Power BI, Modelado Estrella, DAX Avanzado, SQL Server"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="h-12 rounded-2xl border-white/[0.08] bg-black/30 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 placeholder:text-slate-700 focus:border-orange-300/35 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-2xl border border-orange-300/14 bg-orange-500/[0.12] text-[10px] font-black uppercase tracking-widest text-orange-100 shadow-[0_14px_34px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/24 hover:bg-orange-500/[0.18] active:scale-[0.98]"
              >
                Desplegar Nodo
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* TABLERO KANBAN EXTERNO */}
      <div className="relative z-10 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-5 py-40">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full border border-orange-400/10 bg-orange-500/5 blur-sm" />
              <Activity className="absolute animate-spin text-orange-400 drop-shadow-[0_0_16px_rgba(249,115,22,0.55)]" size={42} />
              <div className="h-20 w-20 animate-ping rounded-full border border-orange-500/25 [animation-duration:2s]" />
              <div className="absolute h-32 w-32 animate-pulse rounded-full border border-amber-400/10" />
            </div>
            <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.45em] text-orange-300/75">Sincronizando Matriz Cuántica...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 lg:grid-cols-6">
            {macroColumns.map((col) => {
              const filtered = projects.filter(p => p.status === col.id)
              return (
                <div key={col.id} className="group flex min-w-0 flex-col gap-3">
                  <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] ${col.bg} p-3 shadow-[0_12px_35px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all duration-300 ${col.borderGlow}`}>
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/25">
                          <col.icon size={13} className={`${col.color} shrink-0`} />
                        </span>
                        <span className="truncate text-[9px] font-black uppercase tracking-[0.15em] text-slate-300">{col.label}</span>
                      </div>
                      <span className={`rounded-lg border border-white/5 bg-black/42 px-2 py-1 font-mono text-[9px] font-black ${col.color}`}>{filtered.length}</span>
                    </div>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex min-h-[420px] flex-col gap-3 rounded-[1.35rem] border border-dashed border-white/[0.045] bg-black/18 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-sm"
                  >
                    <AnimatePresence mode="popLayout">
                      {filtered.length === 0 ? (
                        <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.015] text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
                          [ vacío ]
                        </div>
                      ) : (
                        filtered.map((project) => {
                          const total = project.project_tasks.length
                          const done = project.project_tasks.filter(t => t.status === 'COMPLETADO').length
                          const pct = total > 0 ? Math.round((done / total) * 100) : 0

                          return (
                            <motion.div
                              key={project.id}
                              variants={cardVariants}
                              layoutId={`card-${project.id}`}
                              onClick={() => setSelectedProject(project)}
                              whileHover={{
                                y: -7,
                                scale: 1.025,
                                borderColor: "rgba(249, 115, 22, 0.42)",
                                boxShadow: "0 24px 45px -18px rgba(249, 115, 22, 0.34)"
                              }}
                              transition={{ type: "spring", stiffness: 360, damping: 22 }}
                              className="group/card relative cursor-pointer overflow-hidden rounded-[1.15rem] border border-white/[0.065] bg-gradient-to-b from-white/[0.075] via-slate-900/70 to-slate-950/70 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
                            >
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(249,115,22,0.15),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
                              <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-white/[0.07] to-transparent transition-all group-hover/card:from-orange-500/15" />
                              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-all duration-500 group-hover/card:via-orange-300/35" />

                              <div className="relative z-10 flex items-center justify-between">
                                <span className={`rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${
                                  project.priority === 'Alta' ? 'border-red-400/25 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.16)]' :
                                    project.priority === 'Media' ? 'border-amber-400/25 bg-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.12)]' :
                                      'border-blue-400/25 bg-blue-500/10 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.12)]'
                                  }`}>
                                  {project.priority}
                                </span>
                                <Maximize2 size={12} className="scale-75 text-slate-600 opacity-0 transition-all duration-300 group-hover/card:scale-100 group-hover/card:text-orange-300 group-hover/card:opacity-100" />
                              </div>

                              <div className="relative z-10 mt-4 space-y-2">
                                <h4 className="line-clamp-2 text-sm font-black tracking-tight text-slate-100 transition-colors duration-300 group-hover/card:text-orange-300">
                                  {project.title}
                                </h4>
                                <p className="line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300">
                                  {project.description || "Sin descripción técnica."}
                                </p>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {getProjectSkills(project).slice(0, 3).map((skill) => (
                                    <span
                                      key={skill.id}
                                      className="rounded-full border border-orange-300/10 bg-orange-500/[0.055] px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-orange-200/80"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                  {getProjectSkills(project).length > 3 && (
                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-slate-400">
                                      +{getProjectSkills(project).length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="relative z-10 mt-4 space-y-2 pt-1">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                                  <span>PROGRESO NODO</span>
                                  <span className={pct === 100 ? "text-emerald-300" : "text-orange-300"}>{pct}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full border border-white/[0.04] bg-[#02040a] shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]">
                                  <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${pct === 100 ? 'from-emerald-500 via-teal-300 to-lime-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_12px_rgba(249,115,22,0.62)]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* POPUP MODAL CONTROL PANEL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#02040a]/88 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ scale: 0.94, opacity: 0, y: 30, filter: "blur(8px)" }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative my-8 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#02040a]/90 text-white shadow-[0_0_60px_rgba(0,0,0,0.52)] backdrop-blur-2xl"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_0%,rgba(249,115,22,0.060),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.08),transparent_28%)]" />
              <div className="pointer-events-none absolute left-5 top-5 h-5 w-5 border-l-2 border-t-2 border-orange-300/35" />
              <div className="pointer-events-none absolute right-5 top-5 h-5 w-5 border-r-2 border-t-2 border-orange-300/35" />
              <div className="pointer-events-none absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-orange-300/35" />
              <div className="pointer-events-none absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-orange-300/35" />

              <div className="relative flex shrink-0 items-start justify-between border-b border-white/[0.06] bg-[#080b12]/68 p-6 backdrop-blur-xl md:p-8">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-orange-300/18 to-transparent" />

                <div className="mr-4 flex-1 space-y-3">
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-orange-200/85">
                    <Sparkles size={12} className="animate-pulse text-amber-300" /> MATRIX REQUIREMENT CONTROL PANEL
                  </span>
                  <input
                    className="w-full border-b border-transparent bg-transparent pb-1 text-2xl font-black tracking-tight text-white outline-none transition-all hover:border-white/10 focus:border-orange-400/50 md:text-4xl"
                    value={selectedProject.title}
                    onChange={(e) => {
                      setSelectedProject({ ...selectedProject, title: e.target.value })
                      handleUpdateProjectFields({ title: e.target.value })
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-black/34 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
                    title="Destruir Nodo"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="custom-scrollbar relative flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="relative space-y-5 overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#080b12]/68 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-orange-500/[0.045] blur-3xl" />

                    <div className="relative space-y-2">
                      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">📊 Estado Macro</label>
                      <select
                        className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-black/42 px-3 text-xs font-bold text-slate-200 outline-none transition-all focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                        value={selectedProject.status}
                        onChange={(e) => {
                          const nextSt = e.target.value as ProjectStatus
                          setSelectedProject({ ...selectedProject, status: nextSt })
                          handleUpdateProjectFields({ status: nextSt })
                        }}
                      >
                        {macroColumns.map(c => <option key={c.id} value={c.id} className="bg-[#02040a]">{c.label}</option>)}
                      </select>
                    </div>

                    <div className="relative space-y-2">
                      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">⚠️ Prioridad Crítica</label>
                      <select
                        className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-black/42 px-3 text-xs font-bold text-slate-200 outline-none transition-all focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                        value={selectedProject.priority}
                        onChange={(e) => {
                          const nextPr = e.target.value as PriorityLevel
                          setSelectedProject({ ...selectedProject, priority: nextPr })
                          handleUpdateProjectFields({ priority: nextPr })
                        }}
                      >
                        <option value="Baja" className="bg-[#02040a]">🟢 Baja Presión</option>
                        <option value="Media" className="bg-[#02040a]">🟡 Media Estándar</option>
                        <option value="Alta" className="bg-[#02040a]">🔴 Alta Prioridad</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-5 md:col-span-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">🛠️ Enfoque Stack Completo</label>
                      <Input
                        value={selectedProject.description || ""}
                        placeholder="Arquitectura de datos, tecnologías y stacks aplicados..."
                        className="h-12 rounded-2xl border-white/10 bg-black/25 text-xs font-bold text-white transition-all placeholder:text-slate-700 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                        onChange={(e) => {
                          setSelectedProject({ ...selectedProject, description: e.target.value })
                          handleUpdateProjectFields({ description: e.target.value })
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">📜 Resumen de Criterio / Entregables Técnicos</label>
                      <Textarea
                        placeholder="Detalla las especificaciones del entregable, lógica de negocio DAX, modelos de datos, etc..."
                        className="custom-scrollbar min-h-[112px] rounded-2xl border-white/10 bg-black/25 text-xs font-medium leading-relaxed text-slate-200 transition-all placeholder:text-slate-700 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                        value={selectedProject.summary || ""}
                        onChange={(e) => {
                          setSelectedProject({ ...selectedProject, summary: e.target.value })
                          handleUpdateProjectFields({ summary: e.target.value })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* STACK / SKILLS DEL PROYECTO */}
                <div className="space-y-5 border-t border-white/[0.06] pt-6">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-200/85">
                        <Tags size={15} className="animate-pulse" /> // STACK & SKILLS DEL PROYECTO
                      </label>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                        Selecciona las tecnologías y habilidades que estás desarrollando con este proyecto. Esto alimentará la analítica de skills del Dashboard.
                      </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.055] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-orange-200/80">
                      <Database size={12} />
                      {getProjectSkills(selectedProject).length} skills vinculadas
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#080b12]/60 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/[0.055] blur-3xl" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Stack seleccionado</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">Skills activas en este nodo de proyecto.</p>
                        </div>
                        <Cpu size={18} className="text-orange-300" />
                      </div>

                      <div className="relative mt-5 flex min-h-[92px] flex-wrap content-start gap-2 rounded-2xl border border-white/[0.045] bg-black/24 p-3">
                        {getProjectSkills(selectedProject).length === 0 ? (
                          <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/[0.04] bg-white/[0.015] px-4 py-8 text-center">
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-700">
                              [ Sin skills vinculadas ]
                            </span>
                          </div>
                        ) : (
                          getProjectSkills(selectedProject).map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleToggleProjectSkill(skill)}
                              className="group/selected inline-flex items-center gap-2 rounded-full border border-orange-300/16 bg-orange-500/[0.10] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-orange-100 transition-all hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-200"
                              title="Quitar skill del proyecto"
                            >
                              <span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_12px_rgba(251,191,36,0.65)]" />
                              {skill.name}
                              <X size={10} className="opacity-45 transition-opacity group-hover/selected:opacity-100" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#080b12]/60 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                      <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-blue-500/[0.040] blur-3xl" />
                      <div className="relative flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Catálogo de skills</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">Haz clic para asociar o quitar tecnologías.</p>
                        </div>
                        <Layers3 size={18} className="text-amber-300" />
                      </div>

                      <div className="custom-scrollbar relative mt-5 max-h-[300px] space-y-4 overflow-y-auto pr-1">
                        {loadingSkills ? (
                          <div className="rounded-2xl border border-white/[0.045] bg-black/24 p-5 text-center text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">
                            Sincronizando skills...
                          </div>
                        ) : careerSkills.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/[0.045] bg-black/24 p-5 text-center text-[9px] font-black uppercase tracking-[0.25em] text-slate-700">
                            No hay skills creadas en Supabase
                          </div>
                        ) : (
                          Object.entries(groupedCareerSkills).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">{category}</span>
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => {
                                  const isSelected = selectedProjectSkillIds.has(skill.id)

                                  return (
                                    <button
                                      key={skill.id}
                                      type="button"
                                      onClick={() => handleToggleProjectSkill(skill)}
                                      className={`group/skill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                                        isSelected
                                          ? 'border-emerald-300/24 bg-emerald-500/[0.11] text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.10)]'
                                          : 'border-white/[0.065] bg-black/24 text-slate-400 hover:-translate-y-0.5 hover:border-orange-300/24 hover:bg-orange-500/[0.085] hover:text-orange-100'
                                      }`}
                                    >
                                      <span
                                        className={`h-2 w-2 rounded-full ${
                                          isSelected
                                            ? 'bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.65)]'
                                            : 'bg-orange-300/70 shadow-[0_0_10px_rgba(251,191,36,0.28)]'
                                        }`}
                                      />
                                      {skill.name}
                                      {isSelected ? <CheckCircle2 size={11} /> : <Plus size={11} className="opacity-55 transition-opacity group-hover/skill:opacity-100" />}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBTAREAS & MICRO KANBAN INTERNO */}
                <div className="space-y-5 border-t border-white/[0.06] pt-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-200/85">
                      <ListTodo size={15} className="animate-pulse" /> // MATRIZ DE MICRO-SUBTAREAS
                    </label>

                    <div className="flex w-full max-w-md gap-2 rounded-2xl border border-white/[0.06] bg-black/30 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <Input
                        placeholder="Inyectar nueva subtarea..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        className="h-9 border-0 bg-transparent text-xs font-bold text-white placeholder:text-slate-600 focus-visible:ring-0"
                      />
                      <Button onClick={handleAddTask} className="h-9 shrink-0 rounded-xl border border-orange-300/14 bg-orange-500/[0.12] px-4 text-[10px] font-black uppercase tracking-wider text-orange-100 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500/[0.18]">
                        <Plus size={14} className="mr-1" /> Insertar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-4">
                    {microColumns.map((col) => {
                      const tasksInCol = selectedProject.project_tasks.filter(t => t.status === col.id)

                      return (
                        <div key={col.id} className="flex min-w-0 flex-col gap-3 rounded-[1.35rem] border border-white/[0.055] bg-[#080b12]/60 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30">
                                <col.icon size={12} className={`${col.color} shrink-0`} />
                              </span>
                              <span className="truncate text-[9px] font-black uppercase tracking-wider text-slate-400">{col.label}</span>
                            </div>
                            <span className="rounded-lg border border-white/5 bg-black/42 px-2 py-1 font-mono text-[9px] font-bold text-slate-400">{tasksInCol.length}</span>
                          </div>

                          <div className="custom-scrollbar flex max-h-[270px] min-h-[190px] flex-col gap-2 overflow-y-auto pr-1">
                            <AnimatePresence mode="popLayout">
                              {tasksInCol.length === 0 ? (
                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.015] p-4 text-center">
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700">[ Vacío ]</span>
                                </div>
                              ) : (
                                tasksInCol.map((task) => (
                                  <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, scale: 0.96, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.93, x: -10 }}
                                    whileHover={{ y: -2, borderColor: "rgba(249,115,22,0.22)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="group/task relative flex flex-col gap-2 rounded-2xl border border-white/[0.055] bg-black/32 p-3 shadow-[0_12px_25px_rgba(0,0,0,0.25)] transition-colors duration-300"
                                  >
                                    <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <p className="pr-4 text-xs font-semibold leading-snug text-slate-300 break-words">{task.title}</p>

                                    <div className="mt-1 flex items-center justify-between border-t border-white/[0.05] pt-2">
                                      <select
                                        className="max-w-[122px] cursor-pointer rounded-lg border border-white/10 bg-[#02040a] px-1.5 py-1 text-[9px] font-black uppercase text-slate-400 outline-none transition-all focus:border-orange-400/50"
                                        value={task.status}
                                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                      >
                                        <option value="SIN EMPEZAR" className="bg-[#02040a]">🔘 Sin empezar</option>
                                        <option value="EN CURSO" className="bg-[#02040a]">🔵 En curso</option>
                                        <option value="COMPLETADO" className="bg-[#02040a]">🟢 Completado</option>
                                        <option value="ARCHIVADO" className="bg-[#02040a]">📦 Archivado</option>
                                      </select>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                                        title="Purgar Tarea"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
