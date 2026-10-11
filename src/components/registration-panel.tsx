"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { LayoutList, ChevronDown, CheckCircle2, Clock, Circle, Plus, Loader2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

type ProjectTask = {
  id: string
  title: string
  status: string | null
  parent_id: string | null
}

type ProjectWithTasks = {
  id: string
  title: string
  status: string | null
  project_tasks: ProjectTask[] | null
}

export function RegistrationPanel({ open, setOpen, visual2026 = false }: { open: boolean, setOpen: (open: boolean) => void; visual2026?: boolean }) {
  const reducedMotion = useReducedMotion()
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const supabase = createClient()

  // --- NUEVA FUNCIÓN: LOGICA DE CHECKLIST ---
  const handleToggleTask = async (taskId: string, currentStatus: string | null) => {
    // Definimos el siguiente estado basado en las constraints de tu DB
    const nextStatus = currentStatus === 'completado' ? 'en_progreso' : 'completado';

    // 1. Actualización Optimista (UI instantánea)
    setProjects(prevProjects => 
      prevProjects.map(project => ({
        ...project,
        project_tasks: project.project_tasks?.map((task) => 
          task.id === taskId ? { ...task, status: nextStatus } : task
        ) ?? null
      }))
    );

    // 2. Sincronización con Supabase
    const { error } = await supabase
      .from('project_tasks')
      .update({ status: nextStatus })
      .eq('id', taskId);

    if (error) {
      console.error("Error al actualizar la tarea:", error);
      // Opcional: Aquí podrías revertir el estado local si la red falla
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!open) return; 
      
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          title, 
          status,
          project_tasks (id, title, status, parent_id)
        `)
        .returns<ProjectWithTasks[]>()
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProjects(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [open, supabase])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent onCloseAutoFocus={(event) => {
        if (visual2026) {
          event.preventDefault()
          document.querySelector<HTMLButtonElement>(".dashboard-2026 .lt26-primary")?.focus()
        }
      }} className={visual2026 ? "lt26-register" : "w-[400px] sm:w-[540px] bg-[#020617] border-l border-white/10 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]"}>
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-blue-600/10 to-transparent">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              <LayoutList className="text-blue-500" /> {visual2026 ? "Registrar avance" : "COMMAND CENTER"}
            </SheetTitle>
            <SheetDescription className="text-slate-400 font-medium italic">
              {visual2026 ? "Marca las tareas realizadas en tus proyectos de Data & Carrera." : "Gestionando el Pilar de Carrera & Datos"}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 h-[calc(100vh-100px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-slate-500">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando con Supabase...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">{visual2026 ? "Tus proyectos" : "Proyectos en Curso"}</h3>
              {visual2026 && projects.length === 0 && <p className="text-sm text-slate-400">No hay proyectos disponibles en esta vista. Puedes revisarlos en <Link href="/pilares/carrera" className="underline">Data & Carrera</Link>.</p>}
              
              {projects.map((project) => (
                <div key={project.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all hover:border-blue-500/30">
                  <button 
                    aria-expanded={expandedProject === project.id}
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{project.title}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${
                          project.status === 'activo' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-slate-500/50 text-slate-400'
                        }`}>
                          {project.status?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{project.project_tasks?.length || 0} tareas asignadas</span>
                    </div>
                    <ChevronDown className={`text-slate-500 transition-transform ${expandedProject === project.id ? "rotate-180" : ""}`} size={16} />
                  </button>

                  <AnimatePresence>
                    {expandedProject === project.id && (
                      <motion.div 
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : .18 }}
                        className="bg-black/40 border-t border-white/5"
                      >
                        <div className="p-4 space-y-3">
                          {/* TAREAS PADRE */}
                          {project.project_tasks?.filter((task) => !task.parent_id).map((task) => (
                            <div key={task.id} className="space-y-2">
                              <div className="flex items-center gap-3 group">
                                <button 
                                  aria-label={`${task.status === 'completado' ? 'Reabrir' : 'Completar'} tarea: ${task.title}`}
                                  onClick={() => handleToggleTask(task.id, task.status)}
                                  className="transition-transform active:scale-90 hover:brightness-125"
                                >
                                  <StatusIcon status={task.status} />
                                </button>
                                <span className={`text-xs font-bold transition-all duration-300 ${
                                  task.status === 'completado' ? 'text-slate-500 line-through opacity-60' : 'text-slate-200'
                                }`}>
                                  {task.title}
                                </span>
                              </div>
                              
                              {/* SUBTAREAS */}
                              <div className="ml-7 space-y-2 border-l border-white/10 pl-4">
                                {project.project_tasks?.filter((subtask) => subtask.parent_id === task.id).map((sub) => (
                                  <div key={sub.id} className="flex items-center gap-2 group">
                                    <button 
                                      aria-label={`${sub.status === 'completado' ? 'Reabrir' : 'Completar'} subtarea: ${sub.title}`}
                                      onClick={() => handleToggleTask(sub.id, sub.status)}
                                      className="transition-transform active:scale-90 hover:brightness-125"
                                    >
                                      <StatusIcon status={sub.status} size={14} />
                                    </button>
                                    <span className={`text-[11px] transition-all duration-300 ${
                                      sub.status === 'completado' ? 'text-slate-600 line-through opacity-50' : 'text-slate-400'
                                    }`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                ))}
                                {visual2026 ? <Link href="/pilares/carrera" className="lt26-link">Editar tareas en Carrera</Link> : <button className="flex items-center gap-1 text-[9px] font-bold text-blue-500/50 hover:text-blue-400 py-1 uppercase tracking-tighter transition-colors">
                                  <Plus size={12} /> Añadir Subtarea
                                </button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StatusIcon({ status, size = 18 }: { status: string | null, size?: number }) {
  switch (status) {
    case 'completado':
      return <CheckCircle2 className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" size={size} />;
    case 'en_progreso':
      return <Clock className="text-blue-500 animate-pulse" size={size} />;
    case 'pendiente':
      return <Circle className="text-slate-600" size={size} />;
    case 'cancelado':
      return <XCircle className="text-red-500/50" size={size} />;
    default:
      return <Circle className="text-slate-600" size={size} />;
  }
}
