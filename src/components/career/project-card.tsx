"use client"

import { motion } from "framer-motion"
import { Maximize2 } from "lucide-react"

import { cardVariants } from "@/lib/career-page-config"
import {
  getHiddenProjectSkillCount,
  getProjectTaskCompletionPct,
  getVisibleProjectSkills,
} from "@/lib/career-page-helpers"
import type { Project, ProjectProfessionalScore } from "@/lib/career-page-models"
import { getProjectPriorityTone, getScoreTone } from "@/lib/career"

type ProjectCardProps = {
  project: Project
  score?: ProjectProfessionalScore | null
  onSelect: (project: Project) => void
}

export function ProjectCard({ project, score, onSelect }: ProjectCardProps) {
  const pct = getProjectTaskCompletionPct(project)
  const scoreValue = score?.professional_score ?? 0
  const scoreTone = getScoreTone(scoreValue)
  const visibleProjectSkills = getVisibleProjectSkills(project)
  const hiddenProjectSkillCount = getHiddenProjectSkillCount(project)

  return (
    <motion.div
      key={project.id}
      variants={cardVariants}
      layoutId={`card-${project.id}`}
      onClick={() => onSelect(project)}
      whileHover={{
        y: -7,
        scale: 1.025,
        borderColor: "rgba(249, 115, 22, 0.42)",
        boxShadow: "0 24px 45px -18px rgba(249, 115, 22, 0.34)",
      }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className="group/card relative cursor-pointer overflow-hidden rounded-[1.15rem] border border-white/[0.065] bg-gradient-to-b from-white/[0.075] via-slate-900/70 to-slate-950/70 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(249,115,22,0.15),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
      <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-white/[0.07] to-transparent transition-all group-hover/card:from-orange-500/15" />
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-all duration-500 group-hover/card:via-orange-300/35" />

      <div className="relative z-10 flex items-center justify-between">
        <span className={`rounded-lg border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${getProjectPriorityTone(project.priority)}`}>
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
          {visibleProjectSkills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full border border-orange-300/10 bg-orange-500/[0.055] px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-orange-200/80"
            >
              {skill.name}
            </span>
          ))}
          {hiddenProjectSkillCount > 0 && (
            <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              +{hiddenProjectSkillCount}
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
            className={`h-full rounded-full bg-gradient-to-r ${pct === 100 ? "from-emerald-500 via-teal-300 to-lime-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_12px_rgba(249,115,22,0.62)]"}`}
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
}
