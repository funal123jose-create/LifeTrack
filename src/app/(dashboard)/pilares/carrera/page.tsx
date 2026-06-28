"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FolderPlus, ChevronLeft, BrainCircuit, CheckCircle2,
  Trash2, Plus, ListTodo, X, Maximize2, Activity, Sparkles,
  Tags, Database, Cpu, Layers3, FileText, Save, BookOpen,
  ExternalLink, Download, FileArchive,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CyberBackground } from "@/components/career/cyber-background"
import { RichTaskDocumentEditor } from "@/components/career/rich-task-document-editor"
import Link from "next/link"
import { cardVariants, containerVariants, macroColumns, microColumns } from "@/lib/career-page-config"
import { generateCaseStudyExportHtml } from "@/lib/career-export"
import {
  buildEmptyTaskDoc,
  getCaseStudySummaryMetrics,
  getProjectProfessionalScore,
  getProjectStatusCount,
  getProjectTaskCompletionPct,
  getProjectSkillIds,
  getProjectSkills,
  getProjectTechnicalSummary as getProjectTechnicalSummaryFromMap,
  getProfessionalScoreMetrics,
  getProjectsByStatus,
  getTechnicalSummaryMetrics,
  getTasksByStatus,
  getTaskSkillIds,
  groupCareerSkills,
  mapProfessionalScores,
  mapProjectCaseStudy,
  mapRawProjects,
  mapTechnicalSummaries,
  sanitizeStatusForDB,
} from "@/lib/career-page-helpers"
import { getErrorMessage } from "@/lib/errors"
import type {
  Project,
  ProjectCaseStudyDetail,
  ProjectProfessionalScore,
  ProjectTechnicalSummary,
  RawProjectCaseStudyDetail,
  RawProjectProfessionalScore,
  RawProjectTechnicalSummary,
  Task,
} from "@/lib/career-page-models"
import {
  buildRichDocumentSeed,
  formatAssetSize,
  getCaseStudyDocHasContent,
  getAssetVisual,
  getScoreTone,
  getTaskStatusTone,
  mapCareerSkill,
  mapSkillLink,
  splitStack,
  toOptionalString,
  type CareerSkill,
  type PriorityLevel,
  type ProjectStatus,
  type ProjectTaskDoc,
  type ProjectTaskSkillLink,
  type ProjectUpdate,
  type RawCareerSkill,
  type RawProject,
  type RawSkillLink,
  type RichEditorJSON,
  type TaskStatus,
} from "@/lib/career"

export default function DataCarreraPage() {
  const supabase = createClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectScores, setProjectScores] = useState<Record<string, ProjectProfessionalScore>>({})
  const [technicalSummaries, setTechnicalSummaries] = useState<Record<string, ProjectTechnicalSummary>>({})
  const [careerSkills, setCareerSkills] = useState<CareerSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const selectedProjectId = selectedProject?.id
  const [newTaskText, setNewTaskText] = useState("")

  const [selectedTaskForDoc, setSelectedTaskForDoc] = useState<Task | null>(null)
  const [taskDoc, setTaskDoc] = useState<ProjectTaskDoc | null>(null)
  const [loadingTaskDoc, setLoadingTaskDoc] = useState(false)
  const [savingTaskDoc, setSavingTaskDoc] = useState(false)

  const [selectedTaskSkillLinks, setSelectedTaskSkillLinks] = useState<ProjectTaskSkillLink[]>([])
  const [loadingTaskSkills, setLoadingTaskSkills] = useState(false)

  const [selectedCaseStudy, setSelectedCaseStudy] = useState<ProjectCaseStudyDetail | null>(null)
  const [loadingCaseStudy, setLoadingCaseStudy] = useState(false)

  const getProjectScore = (project?: Project | null) => {
    return getProjectProfessionalScore(project, projectScores)
  }

  const getProjectTechnicalSummary = (project?: Project | null) => {
    return getProjectTechnicalSummaryFromMap(project, technicalSummaries)
  }

  const groupedCareerSkills = groupCareerSkills(careerSkills)

  const selectedProjectSkillIds = getProjectSkillIds(selectedProject)
  const selectedTaskSkillIds = getTaskSkillIds(selectedTaskSkillLinks)

  const taskSkillCatalog = careerSkills

  const updateTaskDocRichContent = (json: RichEditorJSON, html: string) => {
    setTaskDoc((prev) => ({
      ...(prev || buildEmptyTaskDoc(selectedTaskForDoc)),
      document_content_json: json,
      document_content_html: html,
    }))
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

      setCareerSkills(((data || []) as RawCareerSkill[]).map(mapCareerSkill))
    } catch (err: unknown) {
      console.error("Error sincronizando catálogo de skills:", getErrorMessage(err))
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
          project_tasks (
            id,
            title,
            status,
            project_task_skills (
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
          ),
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
        const mapped = mapRawProjects(data as RawProject[])

        setProjects(mapped)

        const targetId = updateModalId || selectedProjectId
        if (targetId) {
          const updated = mapped.find(p => p.id === targetId)
          if (updated) setSelectedProject(updated)
        }
      }
    } catch (err: unknown) {
      console.error("Error crítico en sincronización de la matriz:", getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedProjectId])

  const fetchProfessionalScores = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('vw_project_professional_score')
        .select(`
          project_id,
          total_tasks,
          completed_tasks,
          documented_tasks,
          total_task_skills,
          total_assets,
          task_completion_percentage,
          documentation_percentage,
          skill_coverage_percentage,
          evidence_coverage_percentage,
          professional_score
        `)
        .eq('user_id', session.user.id)

      if (error) throw error

      setProjectScores(mapProfessionalScores((data || []) as RawProjectProfessionalScore[]))
    } catch (err: unknown) {
      console.error("Error cargando score profesional de proyectos:", getErrorMessage(err))
    }
  }, [supabase])

  const fetchTechnicalSummaries = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('vw_project_technical_summary')
        .select(`
          project_id,
          project_title,
          project_description,
          project_summary,
          project_status,
          project_priority,
          start_date,
          end_date,
          total_tasks,
          completed_tasks,
          in_progress_tasks,
          pending_tasks,
          archived_tasks,
          documented_tasks,
          total_project_skills,
          total_task_skills,
          tasks_with_skills,
          total_assets,
          total_images,
          total_documents,
          tasks_with_assets,
          project_stack,
          task_stack,
          task_completion_percentage,
          documentation_percentage,
          skill_coverage_percentage,
          evidence_coverage_percentage,
          professional_score
        `)
        .eq('user_id', session.user.id)

      if (error) throw error

      setTechnicalSummaries(mapTechnicalSummaries((data || []) as RawProjectTechnicalSummary[]))
    } catch (err: unknown) {
      console.error("Error cargando resumen técnico de proyectos:", getErrorMessage(err))
    }
  }, [supabase])

  const fetchProjectCaseStudy = useCallback(async (projectId: string) => {
    try {
      setLoadingCaseStudy(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('vw_project_case_study_detail')
        .select(`
          project_id,
          project_title,
          project_description,
          project_summary,
          project_status,
          project_priority,
          start_date,
          end_date,
          total_tasks,
          completed_tasks,
          in_progress_tasks,
          pending_tasks,
          archived_tasks,
          documented_tasks,
          total_project_skills,
          total_task_skills,
          tasks_with_skills,
          total_assets,
          total_images,
          total_documents,
          tasks_with_assets,
          project_stack,
          task_stack,
          project_stack_json,
          tasks_json,
          task_completion_percentage,
          documentation_percentage,
          skill_coverage_percentage,
          evidence_coverage_percentage,
          professional_score
        `)
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .single()

      if (error) throw error

      setSelectedCaseStudy(mapProjectCaseStudy(data as RawProjectCaseStudyDetail))
    } catch (err: unknown) {
      console.error("Error cargando caso técnico del proyecto:", getErrorMessage(err))
      alert(`No se pudo cargar el caso técnico: ${getErrorMessage(err)}`)
    } finally {
      setLoadingCaseStudy(false)
    }
  }, [supabase])

  const handleExportCaseStudy = useCallback(() => {
    if (!selectedCaseStudy) {
      alert("Primero carga el caso técnico del proyecto.")
      return
    }

    const exportWindow = window.open("", "_blank")

    if (!exportWindow) {
      alert("El navegador bloqueó la ventana de exportación. Permite ventanas emergentes para LifeTrack e inténtalo nuevamente.")
      return
    }

    exportWindow.document.open()
    exportWindow.document.write(generateCaseStudyExportHtml(selectedCaseStudy))
    exportWindow.document.close()
    exportWindow.focus()
  }, [selectedCaseStudy])

  useEffect(() => {
    let isActive = true

    queueMicrotask(() => {
      if (!isActive) return

      fetchCareerSkills()
      fetchProjects()
      fetchProfessionalScores()
      fetchTechnicalSummaries()
    })

    return () => {
      isActive = false
    }
  }, [fetchCareerSkills, fetchProjects, fetchProfessionalScores, fetchTechnicalSummaries])

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
      await fetchProjects()
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      alert(`No se pudo inicializar el nodo de proyecto: ${getErrorMessage(err)}`)
    }
  }

  const handleUpdateProjectFields = async (fields: Partial<Omit<Project, 'id' | 'project_tasks'>>) => {
    if (!selectedProject) return

    const payload: ProjectUpdate = { ...fields }

    if ('status' in payload && payload.status) {
      payload.status = sanitizeStatusForDB(payload.status)
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', selectedProject.id)

      if (error) throw error
      await fetchProjects(selectedProject.id)
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error al mutar datos del proyecto en Supabase:", getErrorMessage(err))
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("⚠️ ADVERTENCIA: ¿Confirmas la desintegración total de este nodo de proyecto de la base de datos?")) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      setSelectedProject(null)
      setSelectedTaskForDoc(null)
      setTaskDoc(null)
      setSelectedTaskSkillLinks([])
      await fetchProjects()
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error en protocolo de eliminación:", getErrorMessage(err))
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
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error actualizando stack del proyecto:", getErrorMessage(err))
      alert(`No se pudo actualizar el stack del proyecto: ${getErrorMessage(err)}`)
    }
  }

  const fetchTaskSkills = useCallback(async (taskId: string) => {
    try {
      setLoadingTaskSkills(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('project_task_skills')
        .select(`
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
        `)
        .eq('user_id', session.user.id)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped: ProjectTaskSkillLink[] = ((data || []) as RawSkillLink[])
        .map((link) => ({
          ...mapSkillLink(link),
          proficiency_level: toOptionalString(link.proficiency_level) || "Aplicado",
        }))

      setSelectedTaskSkillLinks(mapped)
    } catch (err: unknown) {
      console.error("Error sincronizando skills de subtarea:", getErrorMessage(err))
    } finally {
      setLoadingTaskSkills(false)
    }
  }, [supabase])

  const handleToggleTaskSkill = async (skill: CareerSkill) => {
    if (!selectedProject || !selectedTaskForDoc) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const isLinked = selectedTaskSkillIds.has(skill.id)

      if (isLinked) {
        const { error } = await supabase
          .from('project_task_skills')
          .delete()
          .eq('task_id', selectedTaskForDoc.id)
          .eq('skill_id', skill.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('project_task_skills')
          .insert([{
            user_id: session.user.id,
            project_id: selectedProject.id,
            task_id: selectedTaskForDoc.id,
            skill_id: skill.id,
            proficiency_level: 'Aplicado'
          }])

        if (error) throw error
      }

      await fetchTaskSkills(selectedTaskForDoc.id)
      await fetchProjects(selectedProject.id)
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error actualizando skills de subtarea:", getErrorMessage(err))
      alert(`No se pudo actualizar la skill de la subtarea: ${getErrorMessage(err)}`)
    }
  }

  const handleOpenTaskDocumentation = async (task: Task) => {
    if (!selectedProject) return

    setSelectedTaskForDoc(task)
    setTaskDoc(buildEmptyTaskDoc(task))
    setSelectedTaskSkillLinks([])
    setLoadingTaskDoc(true)
    fetchTaskSkills(task.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('project_task_docs')
        .select(`
          id,
          title,
          objective,
          content,
          technical_notes,
          challenges,
          solution,
          learnings,
          result_summary,
          reference_links,
          document_content_json,
          document_content_html
        `)
        .eq('user_id', session.user.id)
        .eq('task_id', task.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setTaskDoc({
          id: data.id,
          title: data.title || task.title,
          objective: data.objective || "",
          content: data.content || "",
          technical_notes: data.technical_notes || "",
          challenges: data.challenges || "",
          solution: data.solution || "",
          learnings: data.learnings || "",
          result_summary: data.result_summary || "",
          reference_links: data.reference_links || "",
          document_content_json: data.document_content_json || null,
          document_content_html: data.document_content_html || "",
        })
      }
    } catch (err: unknown) {
      console.error("Error cargando documentación de subtarea:", getErrorMessage(err))
      alert(`No se pudo cargar la documentación: ${getErrorMessage(err)}`)
    } finally {
      setLoadingTaskDoc(false)
    }
  }

  const handleSaveTaskDocumentation = async () => {
    if (!selectedProject || !selectedTaskForDoc || !taskDoc) return

    try {
      setSavingTaskDoc(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const payload = {
        user_id: session.user.id,
        project_id: selectedProject.id,
        task_id: selectedTaskForDoc.id,
        title: taskDoc.title || selectedTaskForDoc.title,
        objective: taskDoc.objective || null,
        content: taskDoc.content || null,
        technical_notes: taskDoc.technical_notes || null,
        challenges: taskDoc.challenges || null,
        solution: taskDoc.solution || null,
        learnings: taskDoc.learnings || null,
        result_summary: taskDoc.result_summary || null,
        reference_links: taskDoc.reference_links || null,
        document_content_json: taskDoc.document_content_json || buildRichDocumentSeed(selectedTaskForDoc.title, taskDoc),
        document_content_html: taskDoc.document_content_html || null,
      }

      const { data, error } = await supabase
        .from('project_task_docs')
        .upsert(payload, { onConflict: 'task_id' })
        .select(`
          id,
          title,
          objective,
          content,
          technical_notes,
          challenges,
          solution,
          learnings,
          result_summary,
          reference_links,
          document_content_json,
          document_content_html
        `)
        .single()

      if (error) throw error

      setTaskDoc({
        id: data.id,
        title: data.title || selectedTaskForDoc.title,
        objective: data.objective || "",
        content: data.content || "",
        technical_notes: data.technical_notes || "",
        challenges: data.challenges || "",
        solution: data.solution || "",
        learnings: data.learnings || "",
        result_summary: data.result_summary || "",
        reference_links: data.reference_links || "",
        document_content_json: data.document_content_json || null,
        document_content_html: data.document_content_html || "",
      })

      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error guardando documentación de subtarea:", getErrorMessage(err))
      alert(`No se pudo guardar la documentación: ${getErrorMessage(err)}`)
    } finally {
      setSavingTaskDoc(false)
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
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      alert(`Error de inyección en subtareas: ${getErrorMessage(err)}`)
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
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error en transición de microestado:", getErrorMessage(err))
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProject) return
    try {
      const { error } = await supabase.from('project_tasks').delete().eq('id', taskId)
      if (error) throw error
      await fetchProjects(selectedProject.id)
      await fetchProfessionalScores()
      await fetchTechnicalSummaries()
    } catch (err: unknown) {
      console.error("Error al purgar microtarea:", getErrorMessage(err))
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-6 overflow-x-hidden bg-[#02040a] px-4 pb-12 pt-6 font-sans text-slate-100 antialiased selection:bg-orange-500/[0.10] selection:text-orange-100 md:px-8 [overflow-wrap:anywhere]" style={{ fontFamily: "'Poppins', 'Nunito Sans', 'Inter', 'Manrope', system-ui, sans-serif" }}>
      <CyberBackground />

      {/* HEADER PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 space-y-4"
      >
        <Link href="/pilares" className="group flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-orange-400/35 hover:bg-orange-500/[0.08] hover:text-orange-200">
          <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1.5" /> [ VOLVER A PILARES ]
        </Link>

        <div className="relative overflow-hidden rounded-[2rem] border border-orange-300/[0.10] bg-[linear-gradient(135deg,rgba(18,13,10,0.92),rgba(8,11,18,0.76))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.075),transparent_28%),radial-gradient(circle_at_92%_80%,rgba(59,130,246,0.045),transparent_30%)]" />
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/[0.055] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-300/35 to-transparent" />

          <div className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.045] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.20em] text-orange-200/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <BrainCircuit size={14} className="animate-spin text-amber-300 [animation-duration:7s]" /> MATRIX CENTRAL TERMINAL
              </div>
              <h2 className="max-w-5xl text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.035em]er md:text-7xl">
                Pilar <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-slate-100 bg-clip-text text-transparent">Data & Carrera</span>
              </h2>
              <p className="max-w-2xl break-words text-xs font-medium leading-relaxed text-slate-400 md:text-sm">
                Centro visual para controlar proyectos, avances y subtareas con una experiencia tipo dashboard premium.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-3 gap-2 rounded-2xl border border-white/[0.07] bg-black/24 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <div className="min-w-0 rounded-xl bg-[#080b12]/68 px-4 py-3 text-center">
                <p className="break-words text-[9px] font-bold uppercase tracking-[0.10em] text-slate-500">Nodos</p>
                <p className="break-words text-2xl font-extrabold text-white">{projects.length}</p>
              </div>
              <div className="min-w-0 rounded-xl bg-orange-500/[0.08] px-4 py-3 text-center">
                <p className="break-words text-[9px] font-bold uppercase tracking-[0.10em] text-orange-300/80">Activos</p>
                <p className="break-words text-2xl font-extrabold text-orange-300">{getProjectStatusCount(projects, "En curso")}</p>
              </div>
              <div className="min-w-0 rounded-xl bg-emerald-500/[0.08] px-4 py-3 text-center">
                <p className="break-words text-[9px] font-bold uppercase tracking-[0.10em] text-emerald-300/80">Completados</p>
                <p className="break-words text-2xl font-extrabold text-emerald-300">{getProjectStatusCount(projects, "Completado")}</p>
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
        <Card className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(8,11,18,0.80),rgba(18,13,10,0.52))] shadow-[0_22px_68px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.060),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_35%)] opacity-90" />
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50 transition-all duration-700 group-hover:opacity-100" />
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/[0.055] blur-3xl transition-all duration-700 group-hover:bg-orange-400/[0.10]" />

          <CardHeader className="relative pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-300">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/[0.055] shadow-[0_0_22px_rgba(249,115,22,0.15)]">
                <FolderPlus size={16} className="animate-pulse text-orange-300" />
              </span>
              INICIALIZAR NODO DE DATA-STREAM
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleCreateProject} className="grid items-end gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">⚡ Identificador</label>
                <Input
                  placeholder="Ej. Dashboard Core Analytics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-12 rounded-2xl border-white/[0.08] bg-black/30 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 placeholder:text-slate-700 focus:border-orange-300/35 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">⚙️ Enfoque Técnico / Stacks</label>
                <Input
                  placeholder="Ej. Power BI, Modelado Estrella, DAX Avanzado, SQL Server"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="h-12 rounded-2xl border-white/[0.08] bg-black/30 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 placeholder:text-slate-700 focus:border-orange-300/35 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-2xl border border-orange-300/14 bg-orange-500/[0.12] text-[10px] font-extrabold uppercase tracking-[0.10em] text-orange-100 shadow-[0_14px_34px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/24 hover:bg-orange-500/[0.18] active:scale-[0.98]"
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
            <div className="animate-pulse text-[10px] font-extrabold uppercase tracking-[0.45em] text-orange-300/75">Sincronizando Matriz Cuántica...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 lg:grid-cols-6">
            {macroColumns.map((col) => {
              const filtered = getProjectsByStatus(projects, col.id)
              return (
                <div key={col.id} className="group flex min-w-0 flex-col gap-3">
                  <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] ${col.bg} p-3 shadow-[0_12px_35px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all duration-300 ${col.borderGlow}`}>
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/25">
                          <col.icon size={13} className={`${col.color} shrink-0`} />
                        </span>
                        <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-300">{col.label}</span>
                      </div>
                      <span className={`rounded-lg border border-white/5 bg-black/42 px-2 py-1 font-mono text-[9px] font-extrabold ${col.color}`}>{filtered.length}</span>
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
                        <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.015] text-[9px] font-extrabold uppercase tracking-[0.3em] text-slate-700">
                          [ vacío ]
                        </div>
                      ) : (
                        filtered.map((project) => {
                          const pct = getProjectTaskCompletionPct(project)
                          const score = getProjectScore(project)
                          const scoreValue = score?.professional_score ?? 0
                          const scoreTone = getScoreTone(scoreValue)

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
                                <span className={`rounded-lg border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${
                                  project.priority === 'Alta' ? 'border-red-400/25 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.16)]' :
                                    project.priority === 'Media' ? 'border-amber-400/25 bg-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.12)]' :
                                      'border-blue-400/25 bg-blue-500/10 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.12)]'
                                  }`}>
                                  {project.priority}
                                </span>
                                <Maximize2 size={12} className="scale-75 text-slate-600 opacity-0 transition-all duration-300 group-hover/card:scale-100 group-hover/card:text-orange-300 group-hover/card:opacity-100" />
                              </div>

                              <div className="relative z-10 mt-4 space-y-2">
                                <h4 className="line-clamp-2 text-sm font-extrabold tracking-[-0.035em] text-slate-100 transition-colors duration-300 group-hover/card:text-orange-300">
                                  {project.title}
                                </h4>
                                <p className="line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300">
                                  {project.description || "Sin descripción técnica."}
                                </p>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {getProjectSkills(project).slice(0, 3).map((skill) => (
                                    <span
                                      key={skill.id}
                                      className="rounded-full border border-orange-300/10 bg-orange-500/[0.055] px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-orange-200/80"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                  {getProjectSkills(project).length > 3 && (
                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                      +{getProjectSkills(project).length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="relative z-10 mt-4 space-y-2 pt-1">
                                <div className="flex justify-between text-[8px] font-extrabold uppercase tracking-[0.10em] text-slate-500">
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

                              <div className={`relative z-10 mt-3 rounded-2xl border ${scoreTone.border} ${scoreTone.bg} p-3`}>
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="break-words text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                    Score profesional
                                  </span>
                                  <span className={`text-[10px] font-extrabold ${scoreTone.text}`}>
                                    {scoreValue.toFixed(1)}%
                                  </span>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full border border-white/[0.04] bg-[#02040a]">
                                  <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${scoreTone.gradient}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(scoreValue, 100)}%` }}
                                    transition={{ duration: 0.9, ease: "easeOut" }}
                                  />
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                                  <span>Doc {score?.documentation_percentage ?? 0}%</span>
                                  <span>Skills {score?.skill_coverage_percentage ?? 0}%</span>
                                  <span>Evid {score?.evidence_coverage_percentage ?? 0}%</span>
                                  <span className={scoreTone.text}>{scoreTone.label}</span>
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
                  <span className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.3em] text-orange-200/85">
                    <Sparkles size={12} className="animate-pulse text-amber-300" /> MATRIX REQUIREMENT CONTROL PANEL
                  </span>
                  <input
                    className="w-full border-b border-transparent bg-transparent pb-1 text-2xl font-extrabold tracking-[-0.035em] text-white outline-none transition-all hover:border-white/10 focus:border-orange-400/50 md:text-4xl"
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
                    onClick={() => {
                      setSelectedProject(null)
                      setSelectedTaskForDoc(null)
                      setTaskDoc(null)
                      setSelectedTaskSkillLinks([])
                      setSelectedCaseStudy(null)
                    }}
                    className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="custom-scrollbar relative flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
                {(() => {
                  const score = getProjectScore(selectedProject)
                  const scoreValue = score?.professional_score ?? 0
                  const scoreTone = getScoreTone(scoreValue)

                  return (
                    <div className={`relative overflow-hidden rounded-[1.7rem] border ${scoreTone.border} ${scoreTone.bg} p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl`}>
                      <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-orange-500/[0.045] blur-3xl" />
                      <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-200/85">
                            <Activity size={14} className="text-orange-300" />
                            Score profesional del proyecto
                          </div>
                          <p className="mt-2 max-w-3xl text-xs font-medium leading-relaxed text-slate-500">
                            Este score combina avance operativo, documentación, skills aplicadas y evidencias adjuntas. No solo mide tareas completadas: mide qué tan sólido está el proyecto como caso profesional.
                          </p>
                        </div>

                        <div className="min-w-[190px] rounded-2xl border border-white/[0.06] bg-black/28 p-4 text-right">
                          <p className={`text-4xl font-extrabold tracking-[-0.035em] ${scoreTone.text}`}>
                            {scoreValue.toFixed(1)}%
                          </p>
                          <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                            {scoreTone.label}
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-5 h-2 overflow-hidden rounded-full border border-white/[0.04] bg-[#02040a]">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${scoreTone.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(scoreValue, 100)}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>

                      <div className="relative mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {getProfessionalScoreMetrics(score).map((metric) => (
                          <div key={metric.label} className="rounded-2xl border border-white/[0.06] bg-black/24 p-3">
                            <div className="flex items-center justify-between">
                              <span className="break-words text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                {metric.label}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-200">
                                {Number(metric.value).toFixed(1)}%
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/45">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Number(metric.value), 100)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <p className="mt-2 text-[9px] font-medium text-slate-600">
                              {metric.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {(() => {
                  const technicalSummary = getProjectTechnicalSummary(selectedProject)
                  const plannedStack = splitStack(technicalSummary?.project_stack)
                  const appliedStack = splitStack(technicalSummary?.task_stack)
                  const scoreTone = getScoreTone(technicalSummary?.professional_score ?? 0)

                  return (
                    <div className="relative overflow-hidden rounded-[1.7rem] border border-white/[0.06] bg-[#080b12]/68 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                      <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-cyan-500/[0.045] blur-3xl" />
                      <div className="pointer-events-none absolute right-0 bottom-0 h-44 w-44 rounded-full bg-orange-500/[0.045] blur-3xl" />

                      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-200/85">
                            <Database size={14} className="text-cyan-300" />
                            Resumen técnico del proyecto
                          </div>
                          <p className="mt-2 max-w-4xl text-xs font-medium leading-relaxed text-slate-500">
                            Vista consolidada del proyecto como caso técnico: compara el stack planificado con el stack realmente aplicado en subtareas, además de documentación y evidencias.
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() => fetchProjectCaseStudy(selectedProject.id)}
                            disabled={loadingCaseStudy}
                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/14 bg-cyan-500/[0.10] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.10em] text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-500/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <BookOpen size={14} />
                            {loadingCaseStudy ? "Cargando..." : "Ver caso técnico"}
                          </button>

                          <div className={`w-fit rounded-2xl border ${scoreTone.border} ${scoreTone.bg} px-4 py-3 text-right`}>
                            <p className={`text-2xl font-extrabold ${scoreTone.text}`}>
                              {(technicalSummary?.professional_score ?? 0).toFixed(1)}%
                            </p>
                            <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                              madurez técnica
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {getTechnicalSummaryMetrics(technicalSummary).map((item) => (
                          <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-black/24 p-3">
                            <p className="break-words text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                            <p className="mt-2 text-2xl font-extrabold text-slate-100">{item.value}</p>
                            <p className="mt-1 text-[9px] font-medium text-slate-600">{item.detail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="relative mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-orange-300/10 bg-orange-500/[0.045] p-4">
                          <div className="mb-3 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-200/85">
                            <Layers3 size={13} />
                            Stack planificado del proyecto
                          </div>

                          {plannedStack.length === 0 ? (
                            <p className="text-xs font-medium text-slate-600">Sin stack general asignado todavía.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {plannedStack.map((skill) => (
                                <span key={skill} className="rounded-full border border-orange-300/12 bg-black/24 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-orange-100/85">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.045] p-4">
                          <div className="mb-3 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-200/85">
                            <Cpu size={13} />
                            Stack aplicado en subtareas
                          </div>

                          {appliedStack.length === 0 ? (
                            <p className="text-xs font-medium text-slate-600">Aún no hay skills aplicadas directamente a subtareas.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {appliedStack.map((skill) => (
                                <span key={skill} className="rounded-full border border-cyan-300/12 bg-black/24 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-cyan-100/85">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="relative space-y-5 overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#080b12]/68 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-orange-500/[0.045] blur-3xl" />

                    <div className="relative space-y-2">
                      <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">📊 Estado Macro</label>
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
                      <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">⚠️ Prioridad Crítica</label>
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
                      <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">🛠️ Enfoque Stack Completo</label>
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
                      <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-400">📜 Resumen de Criterio / Entregables Técnicos</label>
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
                      <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-200/85">
                        <Tags size={15} className="animate-pulse" /> STACK & SKILLS DEL PROYECTO
                      </label>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                        Selecciona las tecnologías y habilidades que estás desarrollando con este proyecto. Esto alimentará la analítica de skills del Dashboard.
                      </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.055] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.10em] text-orange-200/80">
                      <Database size={12} />
                      {getProjectSkills(selectedProject).length} skills vinculadas
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#080b12]/60 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/[0.055] blur-3xl" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="break-words text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Stack seleccionado</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">Skills activas en este nodo de proyecto.</p>
                        </div>
                        <Cpu size={18} className="text-orange-300" />
                      </div>

                      <div className="relative mt-5 flex min-h-[92px] flex-wrap content-start gap-2 rounded-2xl border border-white/[0.045] bg-black/24 p-3">
                        {getProjectSkills(selectedProject).length === 0 ? (
                          <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/[0.04] bg-white/[0.015] px-4 py-8 text-center">
                            <span className="break-words text-[9px] font-bold uppercase tracking-[0.16em] text-slate-700">
                              [ Sin skills vinculadas ]
                            </span>
                          </div>
                        ) : (
                          getProjectSkills(selectedProject).map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleToggleProjectSkill(skill)}
                              className="group/selected inline-flex items-center gap-2 rounded-full border border-orange-300/16 bg-orange-500/[0.10] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-200"
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
                          <p className="break-words text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Catálogo de skills</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">Haz clic para asociar o quitar tecnologías.</p>
                        </div>
                        <Layers3 size={18} className="text-amber-300" />
                      </div>

                      <div className="custom-scrollbar relative mt-5 max-h-[300px] space-y-4 overflow-y-auto pr-1">
                        {loadingSkills ? (
                          <div className="rounded-2xl border border-white/[0.045] bg-black/24 p-5 text-center text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-600">
                            Sincronizando skills...
                          </div>
                        ) : careerSkills.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/[0.045] bg-black/24 p-5 text-center text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-700">
                            No hay skills creadas en Supabase
                          </div>
                        ) : (
                          Object.entries(groupedCareerSkills).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                                <span className="break-words text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">{category}</span>
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
                                      className={`group/skill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] transition-all duration-300 ${
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
                    <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-200/85">
                      <ListTodo size={15} className="animate-pulse" /> MATRIZ DE MICRO-SUBTAREAS
                    </label>

                    <div className="flex w-full max-w-md gap-2 rounded-2xl border border-white/[0.06] bg-black/30 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <Input
                        placeholder="Inyectar nueva subtarea..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        className="h-9 border-0 bg-transparent text-xs font-bold text-white placeholder:text-slate-600 focus-visible:ring-0"
                      />
                      <Button onClick={handleAddTask} className="h-9 shrink-0 rounded-xl border border-orange-300/14 bg-orange-500/[0.12] px-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-orange-100 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500/[0.18]">
                        <Plus size={14} className="mr-1" /> Insertar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-4">
                    {microColumns.map((col) => {
                      const tasksInCol = getTasksByStatus(selectedProject.project_tasks, col.id)

                      return (
                        <div key={col.id} className="flex min-w-0 flex-col gap-3 rounded-[1.35rem] border border-white/[0.055] bg-[#080b12]/60 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30">
                                <col.icon size={12} className={`${col.color} shrink-0`} />
                              </span>
                              <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{col.label}</span>
                            </div>
                            <span className="rounded-lg border border-white/5 bg-black/42 px-2 py-1 font-mono text-[9px] font-bold text-slate-400">{tasksInCol.length}</span>
                          </div>

                          <div className="custom-scrollbar flex max-h-[270px] min-h-[190px] flex-col gap-2 overflow-y-auto pr-1">
                            <AnimatePresence mode="popLayout">
                              {tasksInCol.length === 0 ? (
                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.015] p-4 text-center">
                                  <span className="text-[8px] font-bold uppercase tracking-[0.10em] text-slate-700">[ Vacío ]</span>
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

                                    {task.task_skills.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {task.task_skills.slice(0, 3).map((link) => {
                                          const skill = link.career_skills
                                          if (!skill) return null

                                          return (
                                            <span
                                              key={link.id}
                                              className="inline-flex max-w-[92px] items-center gap-1 rounded-lg border border-cyan-300/12 bg-cyan-500/[0.075] px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.08em] text-cyan-100/85"
                                              title={skill.name}
                                            >
                                              <span
                                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: skill.color || "#22d3ee" }}
                                              />
                                              <span className="truncate">{skill.name}</span>
                                            </span>
                                          )
                                        })}

                                        {task.task_skills.length > 3 && (
                                          <span className="inline-flex items-center rounded-lg border border-white/[0.06] bg-black/28 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                            +{task.task_skills.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between border-t border-white/[0.05] pt-2">
                                      <select
                                        className="max-w-[122px] cursor-pointer rounded-lg border border-white/10 bg-[#02040a] px-1.5 py-1 text-[9px] font-extrabold uppercase text-slate-400 outline-none transition-all focus:border-orange-400/50"
                                        value={task.status}
                                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                      >
                                        <option value="SIN EMPEZAR" className="bg-[#02040a]">🔘 Sin empezar</option>
                                        <option value="EN CURSO" className="bg-[#02040a]">🔵 En curso</option>
                                        <option value="COMPLETADO" className="bg-[#02040a]">🟢 Completado</option>
                                        <option value="ARCHIVADO" className="bg-[#02040a]">📦 Archivado</option>
                                      </select>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenTaskDocumentation(task)}
                                          className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-orange-500/10 hover:text-orange-300"
                                          title="Abrir documentación"
                                        >
                                          <FileText size={12} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                                          title="Purgar Tarea"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
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

            <AnimatePresence>
              {selectedTaskForDoc && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-[#02040a]/82 p-4 backdrop-blur-2xl"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#02040a]/96 text-white shadow-[0_0_80px_rgba(0,0,0,0.62)] backdrop-blur-2xl"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(249,115,22,0.075),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(59,130,246,0.075),transparent_30%)]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-300/35 to-transparent" />

                    <div className="relative flex shrink-0 flex-col gap-4 border-b border-white/[0.065] bg-[#080b12]/74 p-6 backdrop-blur-xl md:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-orange-200/85">
                            <BookOpen size={13} className="animate-pulse text-amber-300" />
                            TASK DOCUMENTATION NODE
                          </div>

                          <div>
                            <p className="break-words text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Subtarea documental</p>
                            <h3 className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-[-0.035em] text-white md:text-4xl">
                              {selectedTaskForDoc.title}
                            </h3>
                            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                              Documenta el proceso, decisiones técnicas, problemas, solución y aprendizajes de esta subtarea.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/34 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <button
                            type="button"
                            onClick={handleSaveTaskDocumentation}
                            disabled={savingTaskDoc || loadingTaskDoc}
                            className="flex items-center gap-2 rounded-xl border border-emerald-300/14 bg-emerald-500/[0.10] px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.10em] text-emerald-100 transition-all hover:bg-emerald-500/[0.16] disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            <Save size={14} />
                            {savingTaskDoc ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskForDoc(null)
                              setTaskDoc(null)
                              setSelectedTaskSkillLinks([])
                            }}
                            className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="custom-scrollbar relative flex-1 overflow-y-auto p-6 md:p-8">
                      {loadingTaskDoc || !taskDoc ? (
                        <div className="flex min-h-[720px] flex-col items-center justify-center gap-4">
                          <Activity className="animate-spin text-orange-400 drop-shadow-[0_0_16px_rgba(249,115,22,0.55)]" size={40} />
                          <p className="break-words text-[10px] font-bold uppercase tracking-[0.35em] text-orange-300/75">
                            Sincronizando documentación...
                          </p>
                        </div>
                      ) : (
                        <div className="mx-auto w-full max-w-6xl">
                          <div className="mb-5 rounded-[1.6rem] border border-white/[0.06] bg-[#080b12]/60 p-5 shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                              <div>
                                <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-orange-200/80">
                                  Editor enriquecido tipo Notion
                                </p>
                                <p className="mt-2 max-w-3xl text-xs font-medium leading-relaxed text-slate-500">
                                  Usa la barra superior para aplicar títulos, listas, links, color de texto, resaltados e insertar imágenes. Los documentos se gestionan abajo como referencias adjuntas.
                                </p>
                              </div>

                              <div className="flex w-fit items-center gap-2 rounded-full border border-orange-300/12 bg-orange-500/[0.055] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.10em] text-orange-200/80">
                                <BookOpen size={12} />
                                Documento vivo
                              </div>
                            </div>
                          </div>

                          <div className="mb-5 overflow-hidden rounded-[1.6rem] border border-white/[0.06] bg-[#080b12]/60 p-5 shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                              <div>
                                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-200/85">
                                  <Tags size={14} className="text-cyan-300" />
                                  Skills aplicadas en esta subtarea
                                </div>
                                <p className="mt-2 max-w-3xl text-xs font-medium leading-relaxed text-slate-500">
                                  Marca las herramientas o habilidades que realmente usaste en esta subtarea. Esto hará que el análisis de carrera sea más preciso que solo asignar skills al proyecto general.
                                </p>
                              </div>

                              <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-300/12 bg-cyan-500/[0.055] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.10em] text-cyan-200/80">
                                <Cpu size={12} />
                                {selectedTaskSkillLinks.length} skills
                              </div>
                            </div>

                            {loadingTaskSkills ? (
                              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/24 p-4 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-600">
                                Sincronizando skills de subtarea...
                              </div>
                            ) : taskSkillCatalog.length === 0 ? (
                              <div className="mt-4 rounded-2xl border border-dashed border-white/[0.06] bg-black/24 p-5 text-center">
                                <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                  Aún no tienes skills registradas
                                </p>
                                <p className="mt-2 text-xs font-medium text-slate-700">
                                  Primero crea o registra skills en tu catálogo para poder asociarlas a cada subtarea.
                                </p>
                              </div>
                            ) : (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {taskSkillCatalog.map((skill) => {
                                  const isSelected = selectedTaskSkillIds.has(skill.id)
                                  const isProjectSkill = selectedProjectSkillIds.has(skill.id)

                                  return (
                                    <button
                                      key={skill.id}
                                      type="button"
                                      onClick={() => handleToggleTaskSkill(skill)}
                                      className={`group/skill inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] transition-all ${
                                        isSelected
                                          ? "border-cyan-300/30 bg-cyan-500/[0.14] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)]"
                                          : isProjectSkill
                                            ? "border-orange-300/16 bg-orange-500/[0.065] text-orange-100/80 hover:border-cyan-300/24 hover:bg-cyan-500/[0.09] hover:text-cyan-100"
                                            : "border-white/[0.06] bg-black/24 text-slate-500 hover:border-cyan-300/20 hover:bg-cyan-500/[0.08] hover:text-cyan-100"
                                      }`}
                                      title={isProjectSkill ? "Skill ya vinculada al proyecto" : "Skill disponible del catálogo"}
                                    >
                                      <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: skill.color || "#f97316" }}
                                      />
                                      {skill.name}
                                      {isSelected && <CheckCircle2 size={12} className="text-cyan-200" />}
                                      {!isSelected && isProjectSkill && (
                                        <span className="rounded-md border border-orange-300/14 bg-orange-500/[0.08] px-1.5 py-0.5 text-[7px] text-orange-200/80">
                                          proyecto
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <RichTaskDocumentEditor
                            key={`${selectedTaskForDoc.id}-${taskDoc.id || "draft"}`}
                            taskTitle={selectedTaskForDoc.title}
                            initialContent={(taskDoc.document_content_json as RichEditorJSON | null) || buildRichDocumentSeed(selectedTaskForDoc.title, taskDoc)}
                            onContentChange={updateTaskDocRichContent}
                            supabase={supabase}
                            projectId={selectedProject.id}
                            taskId={selectedTaskForDoc.id}
                            docId={taskDoc.id || null}
                            disabled={savingTaskDoc}
                          />
                        </div>
                      )}

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {selectedCaseStudy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center bg-[#02040a]/88 p-4 backdrop-blur-2xl"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#02040a]/96 text-white shadow-[0_0_90px_rgba(0,0,0,0.70)] backdrop-blur-2xl"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.070),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(249,115,22,0.075),transparent_30%)]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />

                    <div className="relative flex shrink-0 flex-col gap-4 border-b border-white/[0.065] bg-[#080b12]/74 p-6 backdrop-blur-xl md:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-300/12 bg-cyan-500/[0.06] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-cyan-200/85">
                            <BookOpen size={13} className="text-cyan-300" />
                            Caso técnico consolidado
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-2xl font-extrabold tracking-[-0.035em] text-white md:text-5xl">
                            {selectedCaseStudy.project_title}
                          </h3>

                          <p className="mt-3 max-w-5xl text-sm font-medium leading-relaxed text-slate-500">
                            {selectedCaseStudy.project_description || "Caso técnico generado desde las subtareas, documentación, skills y evidencias registradas en LifeTrack."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/34 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <button
                            type="button"
                            onClick={handleExportCaseStudy}
                            className="inline-flex items-center gap-2 rounded-xl border border-orange-300/14 bg-orange-500/[0.12] px-3 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.10em] text-orange-100 transition-all duration-200 hover:bg-orange-500/[0.20] hover:text-white"
                            title="Abrir versión imprimible para guardar como PDF"
                          >
                            <Download size={15} />
                            Exportar
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCaseStudy(null)}
                            className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="custom-scrollbar relative flex-1 overflow-y-auto p-6 md:p-8">
                      <div className="mx-auto max-w-6xl space-y-7">
                        {(() => {
                          const scoreTone = getScoreTone(selectedCaseStudy.professional_score)
                          const plannedStack = splitStack(selectedCaseStudy.project_stack)
                          const appliedStack = splitStack(selectedCaseStudy.task_stack)

                          return (
                            <div className={`relative overflow-hidden rounded-[1.8rem] border ${scoreTone.border} ${scoreTone.bg} p-5`}>
                              <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div>
                                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-200/85">
                                    <Activity size={14} className="text-orange-300" />
                                    Resumen ejecutivo del caso
                                  </div>
                                  <p className="mt-2 max-w-3xl text-xs font-medium leading-relaxed text-slate-500">
                                    Este consolidado resume el proyecto como caso de estudio técnico: ejecución, documentación, stack real aplicado y evidencias.
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-white/[0.06] bg-black/28 p-4 text-right">
                                  <p className={`text-4xl font-extrabold tracking-[-0.035em] ${scoreTone.text}`}>
                                    {selectedCaseStudy.professional_score.toFixed(1)}%
                                  </p>
                                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                                    score profesional
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                                {getCaseStudySummaryMetrics(selectedCaseStudy).map((metric) => (
                                  <div key={metric.label} className="rounded-2xl border border-white/[0.06] bg-black/24 p-3">
                                    <p className="break-words text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                                    <p className="mt-2 text-2xl font-extrabold text-slate-100">{metric.value}</p>
                                    <p className="mt-1 text-[9px] font-medium text-slate-600">{metric.detail}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-orange-300/10 bg-black/24 p-4">
                                  <p className="mb-3 text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-200/85">Stack planificado</p>
                                  <div className="flex flex-wrap gap-2">
                                    {plannedStack.length === 0 ? (
                                      <span className="text-xs text-slate-600">Sin stack planificado.</span>
                                    ) : plannedStack.map((skill) => (
                                      <span key={skill} className="rounded-full border border-orange-300/12 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-orange-100/85">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-cyan-300/10 bg-black/24 p-4">
                                  <p className="mb-3 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-200/85">Stack aplicado</p>
                                  <div className="flex flex-wrap gap-2">
                                    {appliedStack.length === 0 ? (
                                      <span className="text-xs text-slate-600">Sin stack aplicado en subtareas.</span>
                                    ) : appliedStack.map((skill) => (
                                      <span key={skill} className="rounded-full border border-cyan-300/12 bg-cyan-500/[0.06] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-cyan-100/85">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}

                        <div className="rounded-[1.8rem] border border-white/[0.06] bg-[#080b12]/68 p-5">
                          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-200/85">
                            <ListTodo size={14} className="text-orange-300" />
                            Desarrollo por subtareas
                          </div>

                          <div className="mt-5 space-y-5">
                            {selectedCaseStudy.tasks_json.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-white/[0.06] bg-black/24 p-7 text-center">
                                <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                  Este proyecto aún no tiene subtareas registradas.
                                </p>
                              </div>
                            ) : (
                              selectedCaseStudy.tasks_json.map((task, index) => {
                                const doc = task.documentation || {}
                                const hasDocContent = getCaseStudyDocHasContent(doc)
                                const docHtml = doc.document_content_html || ""

                                return (
                                  <div key={task.task_id} className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.06] bg-black/24 p-5">
                                    <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-white/[0.035]" />

                                    <div className="relative flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                            Paso {index + 1}
                                          </span>
                                          <span className={`rounded-xl border px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${getTaskStatusTone(task.task_status)}`}>
                                            {task.task_status}
                                          </span>
                                        </div>
                                        <h4 className="mt-3 text-xl font-extrabold tracking-[-0.035em] text-white">
                                          {task.task_title}
                                        </h4>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <span className="rounded-xl border border-cyan-300/10 bg-cyan-500/[0.06] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-cyan-100">
                                          {task.skills?.length || 0} skills
                                        </span>
                                        <span className="rounded-xl border border-emerald-300/10 bg-emerald-500/[0.06] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-emerald-100">
                                          {task.total_assets || 0} evidencias
                                        </span>
                                      </div>
                                    </div>

                                    {task.skills && task.skills.length > 0 && (
                                      <div className="relative mt-4 flex flex-wrap gap-2">
                                        {task.skills.map((skill) => (
                                          <span
                                            key={`${task.task_id}-${skill.skill_id}`}
                                            className="rounded-full border border-cyan-300/12 bg-cyan-500/[0.055] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-cyan-100/85"
                                          >
                                            {skill.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {hasDocContent ? (
                                      <div className="relative mt-5 rounded-2xl border border-white/[0.06] bg-[#080b12]/70 p-5">
                                        {docHtml ? (
                                          <div
                                            className="rich-task-editor prose prose-invert max-w-none text-sm text-slate-300 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-white [&_h2]:mt-8 [&_h2]:border-l [&_h2]:border-orange-300/30 [&_h2]:pl-4 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-[0.14em] [&_h2]:text-orange-100 [&_p]:my-3 [&_a]:text-cyan-300 [&_img]:my-5 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/[0.08] [&_img]:object-contain"
                                            dangerouslySetInnerHTML={{ __html: docHtml }}
                                          />
                                        ) : (
                                          <div className="space-y-4 text-sm leading-7 text-slate-300">
                                            {doc.objective && <p><span className="font-extrabold text-orange-200">Objetivo:</span> {doc.objective}</p>}
                                            {doc.content && <p><span className="font-extrabold text-orange-200">Proceso:</span> {doc.content}</p>}
                                            {doc.technical_notes && <p><span className="font-extrabold text-orange-200">Notas técnicas:</span> {doc.technical_notes}</p>}
                                            {doc.challenges && <p><span className="font-extrabold text-orange-200">Problemas:</span> {doc.challenges}</p>}
                                            {doc.solution && <p><span className="font-extrabold text-orange-200">Solución:</span> {doc.solution}</p>}
                                            {doc.learnings && <p><span className="font-extrabold text-orange-200">Aprendizajes:</span> {doc.learnings}</p>}
                                            {doc.result_summary && <p><span className="font-extrabold text-orange-200">Resultado:</span> {doc.result_summary}</p>}
                                            {doc.reference_links && <p><span className="font-extrabold text-orange-200">Referencias:</span> {doc.reference_links}</p>}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="relative mt-5 rounded-2xl border border-dashed border-white/[0.06] bg-black/20 p-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-600">
                                        Subtarea sin documentación detallada todavía.
                                      </div>
                                    )}

                                    {task.assets && task.assets.length > 0 && (
                                      <div className="relative mt-5">
                                        <p className="mb-3 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-200/85">
                                          Evidencias adjuntas
                                        </p>
                                        <div className="grid gap-3 md:grid-cols-2">
                                          {task.assets.map((asset) => {
                                            const visual = getAssetVisual(asset.mime_type, asset.file_name)

                                            return (
                                              <a
                                                key={asset.asset_id}
                                                href={asset.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`group/evidence rounded-2xl border ${visual.border} ${visual.bg} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055]`}
                                              >
                                                <div className="flex items-center gap-3">
                                                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${visual.border} bg-black/28 ${visual.accent}`}>
                                                    <FileArchive size={17} />
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-extrabold text-slate-100">{asset.file_name}</p>
                                                    <p className="mt-1 text-[9px] font-medium text-slate-600">{formatAssetSize(asset.file_size)}</p>
                                                  </div>
                                                  <ExternalLink size={13} className="text-slate-500 transition-colors group-hover/evidence:text-cyan-300" />
                                                </div>
                                              </a>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
