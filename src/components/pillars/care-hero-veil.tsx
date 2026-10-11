"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { Pause, Play } from "lucide-react"
import { PillarArtwork } from "./immersive-pillar-card"
import { PillarInteractiveSubject } from "./pillar-interactive-subject"
import "./hero-interaction.css"

export function CareHeroVeil() {
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
    const ctx = node?.getContext("2d")
    if (!node || !ctx) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    node.width = 300 * ratio
    node.height = 220 * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    let frame = 0
    let last = 0
    const draw = () => {
      ctx.clearRect(0, 0, 300, 220)
      const color = resolvedTheme === "light" ? "106,71,152" : "195,181,237"
      // Open silk-like strands, never circular rings; slow movement stays behind the subject.
      for (let i = 0; i < 30; i++) {
        const offset = i * 3.3
        const breath = Math.sin(phase.current * .6 + i * .06) * 15
        ctx.strokeStyle = `rgba(${color},${.04 + Math.sin(i / 30 * Math.PI) * .15})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(64 + offset, -8)
        ctx.bezierCurveTo(12 + offset + breath, 66, 176 + offset - breath, 121, 48 + offset, 224)
        ctx.stroke()
      }
    }
    draw()
    const tick = (now: number) => {
      if (now - last >= 33) { if (last) phase.current += Math.min((now - last) / 1000, .1); last = now; draw() }
      frame = requestAnimationFrame(tick)
    }
    if (active) frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, resolvedTheme])
  return <div ref={root} className="pillar-hero-art care-hero-veil" data-tone="care" data-playing={active}>
    <canvas ref={canvas} className="care-veil-canvas" aria-hidden="true" />
    <PillarInteractiveSubject active={active}><PillarArtwork tone="care" compact /></PillarInteractiveSubject>
    {!reduced && <button type="button" className="pillar-hero-motion" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Reanudar ambientación" : "Pausar ambientación"} title={paused ? "Reanudar ambientación" : "Pausar ambientación"}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
  </div>
}
