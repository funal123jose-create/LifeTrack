"use client"

import { motion } from "framer-motion"
import { FileText, Trash2 } from "lucide-react"

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

  return (
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
          {getVisibleTaskSkillLinks(task.task_skills).map((link) => {
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

          {hiddenTaskSkillCount > 0 && (
            <span className="inline-flex items-center rounded-lg border border-white/[0.06] bg-black/28 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              +{hiddenTaskSkillCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-white/[0.05] pt-2">
        <select
          className="max-w-[122px] cursor-pointer rounded-lg border border-white/10 bg-[#02040a] px-1.5 py-1 text-[9px] font-extrabold uppercase text-slate-400 outline-none transition-all focus:border-orange-400/50"
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
        >
          <option value="SIN EMPEZAR" className="bg-[#02040a]">🔘 Sin empezar</option>
          <option value="EN CURSO" className="bg-[#02040a]">🔵 En curso</option>
          <option value="COMPLETADO" className="bg-[#02040a]">🟢 Completado</option>
          <option value="ARCHIVADO" className="bg-[#02040a]">📦 Archivado</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenDocumentation(task)}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-orange-500/10 hover:text-orange-300"
            title="Abrir documentación"
          >
            <FileText size={12} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            title="Purgar Tarea"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
