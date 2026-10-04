"use client"

import { motion, useReducedMotion } from "framer-motion"

export function HealthWaterGlass({ percent, large = false }: { percent: number; large?: boolean }) {
  const reduced = useReducedMotion()
  const level = Math.max(0, Math.min(100, percent))

  return <div className={`health-water-glass ${large ? "health-water-glass--large" : ""}`} role="img" aria-label={`Vaso con ${Math.round(level)}% de la meta de agua`}>
    <div className="health-water-glass__body">
      <motion.div className="health-water-glass__liquid" initial={reduced ? false : { height: 0 }} animate={{ height: `${level}%` }} transition={{ type: "spring", stiffness: 95, damping: 22 }}>
        <span className="health-water-glass__surface" />
      </motion.div>
      <span className="health-water-glass__shine" />
      <span className="health-water-glass__mark health-water-glass__mark--top" />
      <span className="health-water-glass__mark health-water-glass__mark--middle" />
      <span className="health-water-glass__mark health-water-glass__mark--bottom" />
    </div>
    <span className="health-water-glass__rim" />
    <span className="health-water-glass__base" />
  </div>
}
