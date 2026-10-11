"use client"

import Image from "next/image"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function LoginScene({ paused, theme }: { paused: boolean; theme?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 45, damping: 22 })
  const smoothY = useSpring(y, { stiffness: 45, damping: 22 })
  return <div className="lt-login__scene" aria-hidden="true" data-paused={paused} onPointerMove={(event) => {
    if (paused || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    x.set(((event.clientX - bounds.left) / bounds.width - .5) * 12)
    y.set(((event.clientY - bounds.top) / bounds.height - .5) * 8)
  }} onPointerLeave={() => { x.set(0); y.set(0) }}>
    <motion.div className="lt-login__scene-depth" style={{ x: paused ? 0 : smoothX, y: paused ? 0 : smoothY }}>
      <div className="lt-login__scene-drift"><Image src={theme === "light" ? "/images/lifetrack/2026/login-paths-light.png" : "/images/lifetrack/2026/login-paths.png"} alt="" fill sizes="100vw" quality={75} priority draggable={false} /></div>
    </motion.div>
  </div>
}
