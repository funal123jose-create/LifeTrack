"use client"

import { motion } from "framer-motion"
import { Sparkles, type LucideIcon } from "lucide-react"

import { DashboardProgressBar } from "@/components/dashboard/dashboard-progress"
import { clampPct } from "@/lib/dashboard-page-config"

type DashboardSectionHeaderProps = {
  title: string
  subtitle: string
  accentClassName: string
}

export function DashboardSectionHeader({ title, subtitle, accentClassName }: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className={`mb-2 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase shadow-[0_10px_26px_rgba(0,0,0,0.12)] ${accentClassName}`}>
          <Sparkles size={12} />
          <span className="truncate">Dashboard analítico</span>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl break-words text-balance text-[clamp(1.5rem,2.3vw,2.15rem)] font-extrabold tracking-[-0.055em] text-white"
        >
          {title}
        </motion.h2>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

type DashboardKpiCardProps = {
  title: string
  value: string
  helper: string
  Icon: LucideIcon
  shellClassName: string
  iconClassName: string
  progress?: number
}

export function DashboardKpiCard({
  title,
  value,
  helper,
  Icon,
  shellClassName,
  iconClassName,
  progress,
}: DashboardKpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`group relative min-w-0 overflow-hidden rounded-[1.55rem] border p-5 shadow-[0_24px_55px_rgba(0,0,0,0.22)] transition-all ${shellClassName}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.28),transparent_25%),radial-gradient(circle_at_0%_100%,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${iconClassName}`}>
          <Icon size={18} />
        </span>
        {typeof progress === "number" ? (
          <span className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1 text-[11px] font-bold text-white/80">
            {clampPct(progress)}%
          </span>
        ) : null}
      </div>

      <p className="relative z-10 break-words text-sm font-semibold text-white/82">{title}</p>
      <p className="relative z-10 mt-2 break-words text-[clamp(1.9rem,3vw,2.35rem)] font-extrabold leading-none tracking-[-0.06em] text-white">{value}</p>
      <p className="relative z-10 mt-2 min-h-[48px] break-words text-sm leading-6 text-white/70">{helper}</p>

      {typeof progress === "number" ? (
        <div className="relative z-10 mt-5">
          <DashboardProgressBar value={progress} fillClassName="bg-white/95" />
        </div>
      ) : null}
    </motion.div>
  )
}

type DashboardSoftMetricProps = {
  title: string
  value: string
  helper: string
  Icon: LucideIcon
  colorClasses: string
}

export function DashboardSoftMetric({ title, value, helper, Icon, colorClasses }: DashboardSoftMetricProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="min-w-0 overflow-hidden rounded-[1.35rem] border border-white/[0.075] bg-white/[0.045] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${colorClasses}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="break-words text-[13px] font-semibold text-slate-400">{title}</p>
      <p className="mt-1 break-words text-[clamp(1.55rem,2.5vw,1.95rem)] font-extrabold leading-none tracking-[-0.055em] text-white">{value}</p>
      <p className="mt-2 break-words text-xs leading-5 text-slate-500">{helper}</p>
    </motion.div>
  )
}

type DashboardInsightCardProps = {
  title: string
  whatGood: string
  whatBad: string
  focus: string
  best: string
  recommendation: string
  Icon: LucideIcon
  accentShell: string
  accentText: string
}

export function DashboardInsightCard({
  title,
  whatGood,
  whatBad,
  focus,
  best,
  recommendation,
  Icon,
  accentShell,
  accentText,
}: DashboardInsightCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`overflow-hidden rounded-[1.55rem] border p-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] ${accentShell}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accentText}`}>
            <Icon size={17} />
          </span>
          <div>
            <p className="break-words text-lg font-bold tracking-[-0.03em] text-white">{title}</p>
            <p className="text-xs text-slate-500">Lectura breve del desempeño actual</p>
          </div>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
          Insight
        </span>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-400/12 bg-emerald-500/[0.06] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">Qué va bien</p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-300">{whatGood}</p>
        </div>
        <div className="rounded-xl border border-rose-400/12 bg-rose-500/[0.05] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-300">Qué va mal</p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-300">{whatBad}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">En qué enfocarte</p>
            <p className="mt-1 break-words text-sm leading-6 text-slate-300">{focus}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">Aspecto excelente</p>
            <p className="mt-1 break-words text-sm leading-6 text-slate-300">{best}</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-300">Recomendación útil</p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-300">{recommendation}</p>
        </div>
      </div>
    </motion.div>
  )
}
