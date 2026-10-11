"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CareerSelect } from "./career-filters"
import { FileText, Trash2 } from "lucide-react"
import { TechnologyMark } from "./technology-mark"

import {
  getHiddenTaskSkillCount,
  getVisibleTaskSkillLinks,
} from "@/lib/career-page-helpers"
import type { Task } from "@/lib/career-page-models"
import type { TaskStatus } from "@/lib/career"

type TaskCardProps = {
  task: Task
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void
  onOpenDocumentation: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onStatusChange, onOpenDocumentation, onDelete }: TaskCardProps) {
  const hiddenTaskSkillCount = getHiddenTaskSkillCount(task.task_skills)
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={task.id}
      initial={reduced ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : .16, ease: "easeOut" }}
      className="career-task-card group/task" data-status={task.status}
    >
      <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="pr-4 text-xs font-semibold leading-snug text-slate-300 break-words">{task.title}</p>

      {task.task_skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {getVisibleTaskSkillLinks(task.task_skills).map((link) => {
            const skill = link.career_skills
            if (!skill) return null

            return (
              <span
                key={link.id}
                className="career-task-technology"
                title={skill.name}
              >
                <TechnologyMark name={skill.name} size={14} />
                <span>{skill.name}</span>
              </span>
            )
          })}

          {hiddenTaskSkillCount > 0 && (
            <span className="career-task-technology career-task-technology--count">
              +{hiddenTaskSkillCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-white/[0.05] pt-2">
        <CareerSelect
          label={`Estado de ${task.title}`}
          value={task.status}
          onChange={(value) => onStatusChange(task.id, value as TaskStatus)}
        >
          <option value="SIN EMPEZAR">Sin empezar</option>
          <option value="EN CURSO">En curso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="ARCHIVADO">Archivado</option>
        </CareerSelect>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenDocumentation(task)}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-orange-500/10 hover:text-orange-300"
            title="Abrir documentación"
            aria-label="Abrir documentación"
          >
            <FileText size={12} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            title="Purgar Tarea"
            aria-label="Purgar Tarea"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
