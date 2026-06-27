"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

// --- COMPONENTE INTERACTIVO DE FONDO DARK MINIMALISTA CON ACENTOS NARANJA, PARTÍCULAS Y MOUSE TRACKING ---
export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  const floatingParticles = Array.from({ length: 34 }, (_, i) => ({
    id: i,
    size: 2.2 + (i % 6) * 1.15,
    left: `${3 + ((i * 13) % 94)}%`,
    top: `${5 + ((i * 19) % 88)}%`,
    duration: 7 + (i % 8),
    delay: (i % 10) * 0.36,
    x: (i % 2 === 0 ? 16 : -16) + (i % 5) * 3,
    y: -16 - (i % 6) * 6,
    opacity: 0.14 + (i % 5) * 0.04,
  }))

  const emberDust = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${4 + ((i * 17) % 92)}%`,
    top: `${6 + ((i * 23) % 84)}%`,
    duration: 9 + (i % 9),
    delay: (i % 8) * 0.48,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      originalRadius: number
      hue: number
    }[] = []

    const particleCount = Math.min(115, Math.floor(width / 13))

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.45 + 0.55
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        radius,
        originalRadius: radius,
        hue: Math.random() > 0.5 ? 28 : 43,
      })
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Aura naranja sutil alrededor del mouse. Mantiene el efecto interactivo sin pintar todo el fondo.
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        390
      )

      mouseGradient.addColorStop(0, "rgba(251,146,60,0.145)")
      mouseGradient.addColorStop(0.34, "rgba(249,115,22,0.065)")
      mouseGradient.addColorStop(0.66, "rgba(245,158,11,0.026)")
      mouseGradient.addColorStop(1, "rgba(2,6,23,0)")

      ctx.fillStyle = mouseGradient
      ctx.fillRect(0, 0, width, height)

      // Red de partículas naranja/ámbar más minimalista.
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const mouseDistance = Math.hypot(p.x - mouseRef.current.x, p.y - mouseRef.current.y)
        const isNearMouse = mouseDistance < 155

        if (isNearMouse) {
          p.radius = p.originalRadius * 2.65
          ctx.fillStyle = "rgba(255,214,102,0.82)"
        } else {
          p.radius = p.originalRadius
          ctx.fillStyle = p.hue === 28 ? "rgba(251,146,60,0.46)" : "rgba(245,158,11,0.38)"
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        if (isNearMouse) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(251,191,36,0.055)"
          ctx.fill()
        }
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y)

          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.20
            ctx.strokeStyle = `rgba(251, 146, 60, ${opacity})`
            ctx.lineWidth = (1 - dist / 130) * 0.78
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Franjitas diagonales naranjas en movimiento: se mantiene el efecto que te gustó, pero más premium.
      const time = Date.now() * 0.00035
      ctx.strokeStyle = "rgba(245,158,11,0.040)"
      ctx.lineWidth = 1

      for (let i = -height; i < width; i += 155) {
        ctx.beginPath()
        ctx.moveTo(i + Math.sin(time + i) * 24, height)
        ctx.lineTo(i + height + Math.cos(time + i) * 24, 0)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      {/* BASE DARK MINIMALISTA: ya no se siente naranja, solo acentos */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_12%,rgba(249,115,22,0.105),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(245,158,11,0.075),transparent_32%),radial-gradient(circle_at_52%_92%,rgba(59,130,246,0.035),transparent_36%),linear-gradient(135deg,#02040a_0%,#08070b_42%,#030303_100%)]" />

      {/* CANVAS DE RED INTERACTIVA */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-100" />

      {/* GRID TECNOLÓGICO MÁS FINO */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.42] bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:82px_82px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      {/* SCANLINES MUY SUTILES */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.032] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.55)_50%,transparent_100%)] bg-[length:100%_10px]" />

      {/* ANILLOS HUD NARANJA SUTILES */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="fixed left-1/2 top-1/2 z-0 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-orange-300/[0.045] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 88, repeat: Infinity, ease: "linear" }}
        className="fixed left-1/2 top-1/2 z-0 h-[690px] w-[690px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/[0.04] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.04, 1] }}
        transition={{
          rotate: { duration: 96, repeat: Infinity, ease: "linear" },
          scale: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        className="fixed left-1/2 top-1/2 z-0 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/[0.032] pointer-events-none"
      />

      {/* BARRIDO VERTICAL NARANJA MUY LIGERO */}
      <motion.div
        animate={{ y: ["-18%", "120%"] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
        className="fixed left-0 top-0 z-0 h-56 w-full bg-gradient-to-b from-transparent via-orange-300/[0.032] to-transparent pointer-events-none"
      />

      {/* ONDAS DE DATA STREAM SUTILES */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.10, 0.24, 0.10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-0 top-[21%] z-0 w-[120%] pointer-events-none"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L120 100 L170 92 L220 108 L270 58 L315 142 L370 100 L500 100 L650 100 L700 95 L745 112 L790 60 L835 142 L890 100 L1040 100 L1110 100 L1150 92 L1190 108 L1240 58 L1288 142 L1340 100 L1600 100"
            fill="none"
            stroke="rgba(251,146,60,0.155)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: ["8%", "-6%", "8%"], opacity: [0.07, 0.16, 0.07] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-0 bottom-[16%] z-0 w-[120%] pointer-events-none"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L140 100 L190 102 L230 96 L265 110 L310 72 L350 132 L405 100 L540 100 L680 100 L730 98 L770 112 L810 75 L850 135 L905 100 L1080 100 L1130 98 L1175 112 L1220 70 L1260 137 L1320 100 L1600 100"
            fill="none"
            stroke="rgba(245,158,11,0.10)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* PARTÍCULAS FLOTANTES NEÓN, MÁS LIMPIAS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingParticles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              boxShadow:
                p.id % 3 === 0
                  ? "0 0 14px rgba(251,146,60,0.46), 0 0 28px rgba(249,115,22,0.060)"
                  : p.id % 3 === 1
                    ? "0 0 14px rgba(245,158,11,0.38), 0 0 28px rgba(245,158,11,0.12)"
                    : "0 0 14px rgba(255,214,102,0.34), 0 0 28px rgba(251,191,36,0.10)",
            }}
            animate={{
              y: [0, p.y, 0],
              x: [0, p.x, 0],
              scale: [1, 1.28, 1],
              opacity: [p.opacity * 0.45, p.opacity, p.opacity * 0.42],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* MICRO PARTÍCULAS / POLVO DIGITAL */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {emberDust.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-[2px] w-[2px] rounded-full bg-orange-200/45"
            style={{
              left: p.left,
              top: p.top,
              boxShadow: "0 0 10px rgba(251,191,36,0.32)",
            }}
            animate={{
              y: [0, -34, 0],
              x: [0, p.id % 2 === 0 ? 10 : -10, 0],
              opacity: [0.06, 0.28, 0.06],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* PULSOS CIRCULARES MINIMALISTAS */}
      <motion.div
        animate={{ opacity: [0.05, 0.16, 0.05], scale: [0.88, 1.15, 0.88] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="fixed left-[14%] top-[34%] z-0 h-32 w-32 rounded-full border border-orange-300/12 bg-orange-400/[0.025] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], scale: [0.9, 1.12, 0.9] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed right-[18%] bottom-[22%] z-0 h-28 w-28 rounded-full border border-amber-300/10 bg-amber-400/[0.02] pointer-events-none"
      />

      {/* VIÑETA DARK PARA EVITAR FONDO MUY NARANJA */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(2,4,10,0.90)_100%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#02040a]/34" />
    </>
  )
}
