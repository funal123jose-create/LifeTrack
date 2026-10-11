"use client"

import { motion, useReducedMotion } from "framer-motion"
import { clampPct } from "@/lib/dashboard-page-config"

export function PortfolioProgress({ value, label }: { value: number; label: string }) {
  const reduced = useReducedMotion()
  const progress = clampPct(value)
  return <div className="portfolio-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
    <motion.span initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: progress / 100 }} transition={{ duration: reduced ? 0 : .25, ease: "easeOut" }} />
  </div>
}
