"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { Pause, Play } from "lucide-react"
import { PillarArtwork, type PillarTone } from "./immersive-pillar-card"
import { CareerHeroFlow } from "@/components/career/career-hero-flow"
import { CareHeroVeil } from "./care-hero-veil"
import "./hero-interaction.css"

export function PillarHeroArt({ tone }: { tone: PillarTone }) {
  return tone === "career" ? <CareerHeroFlow /> : tone === "care" ? <CareHeroVeil /> : <StandardPillarHeroArt tone={tone} />
}

function StandardPillarHeroArt({ tone }: { tone: "health" }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 90, damping: 22 })
  const sy = useSpring(y, { stiffness: 90, damping: 22 })
  const transform = useTransform([sx, sy], ([px, py]) => `translate3d(${Number(px) * 7}px,${Number(py) * 4}px,18px) rotateY(${Number(px) * 7}deg) rotateX(${Number(py) * -4}deg)`)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  const active = !reduced && !paused && inView && visible
  return <div ref={ref} className="pillar-hero-art" data-tone={tone} data-playing={active}>
    <div className="pillar-hero-scene" aria-hidden="true"
      onPointerMove={(event) => { if (!active || event.pointerType === "touch") return; const rect = event.currentTarget.getBoundingClientRect(); x.set((event.clientX - rect.left) / rect.width * 2 - 1); y.set((event.clientY - rect.top) / rect.height * 2 - 1) }}
      onPointerLeave={() => { x.set(0); y.set(0) }} onPointerCancel={() => { x.set(0); y.set(0) }}>
      <svg className="pillar-hero-trace" viewBox="0 0 320 220" fill="none">
        <path d="M10 145H68L89 111L109 160L135 66L159 148H210L233 126H310" />
      </svg>
      <motion.div className="pillar-hero-subject" style={{ transform: active ? transform : "none" }}><PillarArtwork tone={tone} compact /></motion.div>
    </div>
    {!reduced && <button type="button" className="pillar-hero-motion" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Reanudar ambientación" : "Pausar ambientación"} title={paused ? "Reanudar ambientación" : "Pausar ambientación"}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
  </div>
}
