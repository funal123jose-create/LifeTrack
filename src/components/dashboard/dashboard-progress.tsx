"use client"

import { motion } from "framer-motion"

import { clampPct } from "@/lib/dashboard-page-config"

type DashboardProgressBarProps = {
  value: number
  fillClassName: string
  heightClassName?: string
}

export function DashboardProgressBar({
  value,
  fillClassName,
  heightClassName = "h-2.5",
}: DashboardProgressBarProps) {
  return (
    <div className={`${heightClassName} relative w-full overflow-hidden rounded-full border border-white/[0.055] bg-black/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.32)]`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)] opacity-35" />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampPct(value)}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`relative h-full rounded-full shadow-[0_0_18px_rgba(255,255,255,0.16)] ${fillClassName}`}
      />
    </div>
  )
}

type DashboardProgressRingProps = {
  value: number
  color: string
  size?: string
  inner?: string
  label?: string
}

export function DashboardProgressRing({
  value,
  color,
  size = "h-24 w-24",
  inner = "h-[74px] w-[74px]",
  label = `${clampPct(value)}%`,
}: DashboardProgressRingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={`relative grid ${size} shrink-0 place-items-center rounded-full border border-white/[0.055] shadow-[0_16px_34px_rgba(0,0,0,0.24)]`}
      style={{
        background: `conic-gradient(${color} ${clampPct(value) * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
      }}
    >
      <div className="absolute inset-0 rounded-full opacity-35 blur-xl" style={{ backgroundColor: color }} />
      <div className="absolute inset-[3px] rounded-full border border-white/[0.04]" />
      <div className={`relative z-10 grid ${inner} place-items-center rounded-full bg-[#09111f]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-white/[0.075]`}>
        <span className="whitespace-nowrap text-[clamp(0.9rem,1.6vw,1.45rem)] font-extrabold leading-none tracking-[-0.045em] text-white [overflow-wrap:normal]">{label}</span>
      </div>
    </motion.div>
  )
}
