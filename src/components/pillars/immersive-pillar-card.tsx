"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

export type PillarTone = "health" | "career" | "care"
const imagery = {
  health: "/images/lifetrack/health-anatomy.png",
  career: "/images/lifetrack/career-bars.png",
  care: "/images/lifetrack/care-meditation.webp",
}

// Only the visual planes move. Text, metrics, and the navigation target stay still.
export function PillarArtwork({ tone, compact = false }: { tone: PillarTone; compact?: boolean }) {
  return <div className={`pillar-artwork ${compact ? "pillar-artwork--compact" : ""}`} aria-hidden="true">
    <Image src={imagery[tone]} alt="" fill sizes={compact ? "240px" : "(max-width: 760px) 90vw, 600px"} className="pillar-artwork-image" />
  </div>
}

export function ImmersivePillarCard({ tone, title, description, href, action, icon: Icon, topics, metrics, status }: {
  tone: PillarTone; title: string; description: string; href: string; action: string; icon: LucideIcon;
  topics: readonly string[]; metrics: Array<{ label: string; value: string; icon: LucideIcon }>;
  status: "loading" | "ready" | "error";
}) {
  const reduced = useReducedMotion()
  const [interactive, setInteractive] = useState(false)
  const bounds = useRef<DOMRect | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 100, damping: 20, mass: 1 })
  const sy = useSpring(y, { stiffness: 100, damping: 20, mass: 1 })
  const visualTransform = useTransform([sx, sy], ([px, py]) =>
    `translate3d(${Number(px) * 12}px, ${Number(py) * 9}px, 28px) rotateX(${Number(py) * -4}deg) rotateY(${Number(px) * 6}deg)`)
  const backTransform = useTransform([sx, sy], ([px, py]) =>
    `translate3d(${Number(px) * -8}px, ${Number(py) * -5}px, -20px) rotateY(${Number(px) * -2}deg)`)
  const lightTransform = useTransform([sx, sy], ([px, py]) =>
    `translate3d(${Number(px) * 35}px, ${Number(py) * 24}px, 48px) rotate(${Number(px) * 9}deg)`)
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setInteractive(media.matches && !reduced)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [reduced])
  const reset = () => { x.set(0); y.set(0); bounds.current = null }
  const move = (event: PointerEvent<HTMLElement>) => {
    if (!interactive || event.pointerType === "touch") return
    const rect = bounds.current
    if (!rect) return
    x.set(Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)))
    y.set(Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)))
  }
  return <article className="pillar-immersive-card" data-tone={tone} data-motion={interactive ? "depth" : "static"}
    onPointerEnter={(event) => { bounds.current = event.currentTarget.getBoundingClientRect() }}
    onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}>
    <div className="pillar-visual-stage" aria-hidden="true">
      <motion.div className="pillar-plane pillar-plane--back" style={{ transform: interactive ? backTransform : "none" }}>
        <Image src="/images/lifetrack/night-mountains.webp" alt="" fill sizes="800px" className="pillar-terrain" />
      </motion.div>
      <motion.div className="pillar-plane pillar-plane--subject" style={{ transform: interactive ? visualTransform : "none" }}>
        <PillarArtwork tone={tone} />
      </motion.div>
      <motion.div className="pillar-plane pillar-plane--light" style={{ transform: interactive ? lightTransform : "none" }} />
    </div>
    <div className="pillar-card-content">
      <div className="pillar-card-top"><Icon size={22} strokeWidth={1.6} /><span role="status">{status === "loading" ? "Cargando registros" : status === "error" ? "Datos no disponibles" : "Datos sincronizados"}</span></div>
      <div className="pillar-card-intro"><h2>{title}</h2><p>{description}</p></div>
      <div className="pillar-card-bottom">
        <ul className="pillar-topics">{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
        <dl className="pillar-card-metrics" aria-busy={status === "loading"}>{metrics.map(({ label, value, icon: MetricIcon }) =>
          <div key={label}><dt><MetricIcon size={14} />{label}</dt><dd>{value}</dd></div>)}</dl>
        <Link href={href} className="pillar-enter">{action}<ArrowUpRight size={20} /></Link>
      </div>
    </div>
  </article>
}
