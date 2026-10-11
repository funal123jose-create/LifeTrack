"use client"

import { type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"

export function PillarInteractiveSubject({ children, active }: { children: ReactNode; active: boolean }) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 90, damping: 22 })
  const sy = useSpring(y, { stiffness: 90, damping: 22 })
  const transform = useTransform([sx, sy], ([px, py]) => `translate3d(${Number(px) * 7}px,${Number(py) * 4}px,18px) rotateY(${Number(px) * 7}deg) rotateX(${Number(py) * -4}deg)`)
  const reset = () => { x.set(0); y.set(0) }
  return <div className="pillar-interactive-art" aria-hidden="true"
    onPointerMove={event => {
      if (!active || reduced || event.pointerType === "touch" || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return
      const rect = event.currentTarget.getBoundingClientRect()
      x.set((event.clientX - rect.left) / rect.width * 2 - 1)
      y.set((event.clientY - rect.top) / rect.height * 2 - 1)
    }} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.div className="pillar-interactive-subject" style={{ transform: active && !reduced ? transform : "none" }}>{children}</motion.div>
  </div>
}
