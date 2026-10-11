"use client"

import { useId, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Activity, BookOpen, ChevronDown, ExternalLink, FileArchive, Layers3, ListTodo } from "lucide-react"
import { PillarModalFrame } from "@/components/pillars/pillar-modal-frame"
import { getCaseStudySummaryMetrics } from "@/lib/career-page-helpers"
import { formatAssetSize, getAssetVisual, getCaseStudyDocHasContent, getScoreTone, getTaskStatusTone, splitStack } from "@/lib/career"
import type { ProjectCaseStudyDetail } from "@/lib/career-page-models"
import { TechnologyMark } from "./technology-mark"
import { MetricGrid } from "./metric-grid"

export function CareerCaseStudy({ study, onClose, actions }: {
  study: ProjectCaseStudyDetail; onClose: () => void; actions: ReactNode
}) {
  const id = useId().replace(/:/g, "")
  const reduced = useReducedMotion()
  const scoreTone = getScoreTone(study.professional_score)
  const plannedStack = splitStack(study.project_stack)
  const appliedStack = splitStack(study.task_stack)
  const summaryId = `${id}-summary`
  const taskId = (index: number) => `${id}-task-${index}`

  return <PillarModalFrame title="Caso técnico del proyecto" onClose={onClose}>
    <motion.div className="career-modal-overlay career-case-overlay fixed inset-0 z-[70] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }}>
      <motion.div className="career-modal-panel career-case-panel" initial={reduced ? false : { y: 8 }} animate={{ y: 0 }} transition={{ duration: reduced ? 0 : .18, ease: "easeOut" }}>
        <header className="career-case-header">
          <div><h2><BookOpen size={18} aria-hidden="true" />Caso técnico consolidado</h2><h3>{study.project_title}</h3></div>
          <div className="career-case-controls">{actions}</div>
        </header>
        <div className="career-case-layout">
          <nav className="career-case-index" aria-label="Índice del caso técnico">
            <a href={`#${summaryId}`}><Activity size={16} aria-hidden="true" />Resumen ejecutivo</a>
            <p><ListTodo size={16} aria-hidden="true" />Desarrollo por subtareas</p>
            <ol>{study.tasks_json.map((task, index) => <li key={task.task_id}><a href={`#${taskId(index)}`}><span>{index + 1}</span>{task.task_title}</a></li>)}</ol>
          </nav>
          <div className="career-case-reading" role="region" aria-label="Contenido del caso técnico" tabIndex={0}>
            <section id={summaryId} className="career-case-summary" tabIndex={-1}>
              <p className="career-case-description">{study.project_description || "Caso técnico generado desde las subtareas, documentación, skills y evidencias registradas en LifeTrack."}</p>
              <div className="career-case-summary-heading"><div><h4>Resumen ejecutivo del caso</h4><p>Este consolidado resume el proyecto como caso de estudio técnico: ejecución, documentación, stack real aplicado y evidencias.</p></div><div className="career-case-score"><strong className={scoreTone.text}>{study.professional_score.toFixed(1)}%</strong><span>Score profesional</span></div></div>
              <MetricGrid metrics={getCaseStudySummaryMetrics(study)} className="career-case-metrics" />
              <div className="career-case-stacks">
                <section><h5><Layers3 size={16} aria-hidden="true" />Stack planificado</h5><div className="career-case-technologies">{plannedStack.length === 0 ? <p>Sin stack planificado.</p> : plannedStack.map(skill => <span key={skill}><TechnologyMark name={skill} size={14} />{skill}</span>)}</div></section>
                <section><h5><Activity size={16} aria-hidden="true" />Stack aplicado</h5><div className="career-case-technologies">{appliedStack.length === 0 ? <p>Sin stack aplicado en subtareas.</p> : appliedStack.map(skill => <span key={skill}><TechnologyMark name={skill} size={14} />{skill}</span>)}</div></section>
              </div>
            </section>
            <section className="career-case-development" aria-label="Desarrollo por subtareas">
              <h4><ListTodo size={17} aria-hidden="true" />Desarrollo por subtareas</h4>
              {study.tasks_json.length === 0 ? <p className="career-case-empty">Este proyecto aún no tiene subtareas registradas.</p> : study.tasks_json.map((task, index) => {
                const doc = task.documentation || {}
                const hasDocContent = getCaseStudyDocHasContent(doc)
                const docHtml = doc.document_content_html || ""
                return <article className="career-case-task" id={taskId(index)} key={task.task_id} tabIndex={-1}>
                  <header><div className="career-case-task-meta"><span>Paso {index + 1}</span><span className={getTaskStatusTone(task.task_status)}>{task.task_status}</span><span>{task.skills?.length || 0} skills</span><span>{task.total_assets || 0} evidencias</span></div><h5>{task.task_title}</h5></header>
                  {task.skills && task.skills.length > 0 && <div className="career-case-technologies">{task.skills.map(skill => <span key={`${task.task_id}-${skill.skill_id}`}><TechnologyMark name={skill.name} size={14} />{skill.name}</span>)}</div>}
                  {hasDocContent ? <details className="career-case-document" open><summary><BookOpen size={16} aria-hidden="true" />Documentación<ChevronDown size={16} aria-hidden="true" /></summary>
                    {docHtml ? <div className="rich-task-editor career-case-prose" dangerouslySetInnerHTML={{ __html: docHtml }} /> : <div className="career-case-prose">
                      {doc.objective && <p><strong>Objetivo:</strong> {doc.objective}</p>}
                      {doc.content && <p><strong>Proceso:</strong> {doc.content}</p>}
                      {doc.technical_notes && <p><strong>Notas técnicas:</strong> {doc.technical_notes}</p>}
                      {doc.challenges && <p><strong>Problemas:</strong> {doc.challenges}</p>}
                      {doc.solution && <p><strong>Solución:</strong> {doc.solution}</p>}
                      {doc.learnings && <p><strong>Aprendizajes:</strong> {doc.learnings}</p>}
                      {doc.result_summary && <p><strong>Resultado:</strong> {doc.result_summary}</p>}
                      {doc.reference_links && <p><strong>Referencias:</strong> {doc.reference_links}</p>}
                    </div>}
                  </details> : <p className="career-case-empty">Subtarea sin documentación detallada todavía.</p>}
                  {task.assets && task.assets.length > 0 && <section className="career-case-evidence"><h6>Evidencias adjuntas</h6>{task.assets.map(asset => {
                    const visual = getAssetVisual(asset.mime_type, asset.file_name)
                    return <a key={asset.asset_id} href={asset.file_url} target="_blank" rel="noopener noreferrer"><FileArchive size={17} className={visual.accent} aria-hidden="true" /><span><strong>{asset.file_name}</strong><small>{formatAssetSize(asset.file_size)}</small></span><ExternalLink size={15} aria-hidden="true" /></a>
                  })}</section>}
                </article>
              })}
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </PillarModalFrame>
}
