"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { Pause, Play } from "lucide-react"
import { PillarArtwork } from "@/components/pillars/immersive-pillar-card"
import { PillarInteractiveSubject } from "@/components/pillars/pillar-interactive-subject"

export function CareerHeroFlow() {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const phase = useRef(0)
  const inView = useInView(root)
  const reduced = useReducedMotion()
  const { resolvedTheme } = useTheme()
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  const active = !reduced && !paused && visible && inView
  useEffect(() => {
    const node = canvas.current
    const context = node?.getContext("2d")
    if (!node || !context) return
    let frame = 0
    let last = 0
    const color = resolvedTheme === "light" ? "164,84,28" : "241,177,120"
    // Data packets converge toward the existing growth artwork, not a random star field.
    const draw = () => {
      context.clearRect(0, 0, 420, 220)
      for (let i = 0; i < 72; i++) {
        const lane = i % 3
        const progress = ((i * .618033 + phase.current / (11 + lane * 2)) % 1)
        const x = 22 + progress * 300
        const spread = (1 - progress) * (28 + lane * 12)
        const y = 158 - progress * 66 + Math.sin(progress * Math.PI * 2 + lane * 1.4) * spread
        const alpha = Math.sin(progress * Math.PI) * (.3 + lane * .14)
        const size = 1.4 + lane * .65
        context.fillStyle = `rgba(${color},${alpha})`
        context.fillRect(x, y, size * 2.4, size)
      }
    }
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      node.width = 420 * ratio
      node.height = 220 * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }
    resize()
    const tick = (now: number) => {
      if (now - last >= 33) {
        if (last) phase.current += Math.min((now - last) / 1000, .1)
        last = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    if (active) frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, resolvedTheme])
  return <div ref={root} className="pillar-hero-art career-hero-flow" data-tone="career" data-playing={active}>
    <div className="career-flow-stage" aria-hidden="true">
      <canvas ref={canvas} className="career-flow-canvas" />
    </div>
    <PillarInteractiveSubject active={active}><PillarArtwork tone="career" compact /></PillarInteractiveSubject>
    {!reduced && <button type="button" className="pillar-hero-motion" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Reanudar ambientación" : "Pausar ambientación"} title={paused ? "Reanudar ambientación" : "Pausar ambientación"}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
  </div>
}
