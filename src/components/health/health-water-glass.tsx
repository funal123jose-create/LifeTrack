"use client"

import { motion, useReducedMotion } from "framer-motion"

export function HealthWaterGlass({ percent, large = false }: { percent: number; large?: boolean }) {
  const reduced = useReducedMotion()
  const level = Math.max(0, Math.min(100, percent))

  return <div className={`health-water-glass ${large ? "health-water-glass--large" : ""}`} role="img" aria-label={`Vaso con ${Math.round(level)}% de la meta de agua`}>
    <div className="health-water-glass__body">
      <motion.div className="health-water-glass__liquid" style={{ height: "100%", transformOrigin: "bottom" }} initial={false} animate={{ transform: `scaleY(${level / 100})`, opacity: level > 0 ? 1 : 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.22, 1, .36, 1] }}>
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
