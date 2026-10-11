"use client"

import { motion, useReducedMotion } from "framer-motion"

export function PillarProgress({ value, color }: { value: number; color?: string }) {
  const reduced = useReducedMotion()
  const level = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) / 100 : 0
  return <motion.span data-pillar-progress initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: level }}
    transition={{ duration: reduced ? 0 : .38, ease: [.22, 1, .36, 1] }} style={{ background: color, transformOrigin: "left" }} />
}
