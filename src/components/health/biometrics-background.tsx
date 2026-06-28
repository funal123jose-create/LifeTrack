"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Droplet, Dumbbell, Flame } from "lucide-react"

export function BiometricsBackground() {
  const particles = Array.from({ length: 34 }, (_, i) => ({
    id: i,
    size: 2.2 + (i % 5) * 1.05,
    left: `${3 + ((i * 11) % 94)}%`,
    top: `${4 + ((i * 17) % 88)}%`,
    duration: 8 + (i % 8),
    delay: (i % 10) * 0.34,
    x: (i % 2 === 0 ? 14 : -14) + (i % 5) * 3,
    y: -16 - (i % 6) * 6,
    opacity: 0.12 + (i % 5) * 0.035,
  }))

  const microParticles = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: `${4 + ((i * 19) % 92)}%`,
    top: `${6 + ((i * 23) % 84)}%`,
    duration: 9 + (i % 9),
    delay: (i % 8) * 0.46,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02050a]">
      {/* BASE DARK CLEAN: el fondo ya no se pinta verde, solo tiene acentos saludables sutiles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(16,185,129,0.105),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.075),transparent_32%),radial-gradient(circle_at_52%_92%,rgba(245,158,11,0.045),transparent_36%),linear-gradient(135deg,#02050a_0%,#050b12_44%,#030504_100%)]" />

      {/* GRID / TEXTURA TECNOLÓGICA MUY SUAVE */}
      <div className="absolute inset-0 opacity-[0.38] bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:82px_82px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(115deg,transparent_0%,rgba(16,185,129,0.055)_48%,transparent_52%)] bg-[length:280px_280px]" />

      {/* SCANLINES CASI IMPERCEPTIBLES */}
      <div className="absolute inset-0 opacity-[0.032] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.52)_50%,transparent_100%)] bg-[length:100%_10px]" />

      {/* GLOWS AMBIENTALES CONTROLADOS */}
      <motion.div
        animate={{ x: [0, 26, -14, 0], y: [0, -18, 14, 0], scale: [1, 1.08, 0.97, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/[0.075] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -22, 18, 0], y: [0, 18, -16, 0], scale: [1, 0.96, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[6%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.055] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 18, -18, 0], y: [0, -22, 14, 0], scale: [1, 1.12, 0.98, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-5%] left-[42%] h-[30rem] w-[30rem] rounded-full bg-orange-500/[0.035] blur-3xl"
      />

      {/* ANILLOS HUD MINIMALISTAS */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-300/[0.045]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 88, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[690px] w-[690px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-300/[0.035]"
      />

      {/* BARRIDO VITAL MUY SUTIL */}
      <motion.div
        animate={{ y: ["-18%", "120%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 top-0 h-52 w-full bg-gradient-to-b from-transparent via-emerald-300/[0.032] to-transparent"
      />

      {/* ECG / SIGNOS VITALES SUTIL */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.12, 0.26, 0.12] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-[21%] w-[120%]"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L120 100 L170 100 L210 95 L250 110 L290 58 L330 140 L375 100 L470 100 L620 100 L660 96 L690 112 L725 62 L760 138 L800 100 L940 100 L1020 100 L1060 95 L1100 110 L1140 60 L1185 140 L1225 100 L1380 100 L1600 100"
            fill="none"
            stroke="rgba(16,185,129,0.20)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: ["8%", "-6%", "8%"], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 bottom-[14%] w-[120%]"
      >
        <svg viewBox="0 0 1600 180" className="h-[180px] w-full" preserveAspectRatio="none">
          <path
            d="M0 100 L140 100 L190 102 L220 96 L250 108 L280 76 L320 128 L355 100 L470 100 L620 100 L650 102 L690 97 L720 110 L755 76 L790 130 L835 100 L980 100 L1050 100 L1090 96 L1120 109 L1160 74 L1195 132 L1240 100 L1400 100 L1600 100"
            fill="none"
            stroke="rgba(59,130,246,0.12)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* PARTÍCULAS FLOTANTES CLEAN */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-slate-100"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              boxShadow:
                p.id % 3 === 0
                  ? "0 0 14px rgba(16,185,129,0.44), 0 0 28px rgba(16,185,129,0.06)"
                  : p.id % 3 === 1
                    ? "0 0 14px rgba(59,130,246,0.32), 0 0 28px rgba(59,130,246,0.10)"
                    : "0 0 14px rgba(245,158,11,0.26), 0 0 28px rgba(245,158,11,0.08)",
            }}
            animate={{
              y: [0, p.y, 0],
              x: [0, p.x, 0],
              scale: [1, 1.25, 1],
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

      {/* MICRO POLVO BIOMÉTRICO */}
      <div className="absolute inset-0">
        {microParticles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-[2px] w-[2px] rounded-full bg-emerald-100/45"
            style={{
              left: p.left,
              top: p.top,
              boxShadow: "0 0 10px rgba(110,231,183,0.32)",
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

      {/* PULSOS MINIMALISTAS */}
      <motion.div
        animate={{ opacity: [0.05, 0.16, 0.05], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[17%] top-[32%] h-32 w-32 rounded-full border border-emerald-300/12 bg-emerald-400/[0.025]"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], scale: [0.92, 1.12, 0.92] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[18%] bottom-[24%] h-28 w-28 rounded-full border border-blue-300/10 bg-blue-400/[0.02]"
      />

      {/* VIÑETA FUERTE PARA MANTENER FONDO OSCURO Y LIMPIO */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_14%,rgba(2,5,10,0.90)_100%)]" />
      <div className="absolute inset-0 bg-[#02050a]/28" />
    </div>
  )
}

export function FloatingBioChips() {
  const chips = [
    {
      label: "HYDRATION",
      icon: Droplet,
      className: "left-[3%] top-[24%] text-blue-200/70 border-blue-300/10 bg-blue-500/[0.045]",
    },
    {
      label: "CALORIC CORE",
      icon: Flame,
      className: "right-[3%] top-[34%] text-orange-200/70 border-orange-300/10 bg-orange-500/[0.045]",
    },
    {
      label: "TRAINING MODE",
      icon: Dumbbell,
      className: "left-[4%] bottom-[22%] text-emerald-200/70 border-emerald-300/10 bg-emerald-500/[0.045]",
    },
    {
      label: "AI NUTRITION",
      icon: BrainCircuit,
      className: "right-[4%] bottom-[18%] text-cyan-200/70 border-cyan-300/10 bg-cyan-500/[0.04]",
    },
  ]

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden 2xl:block">
      {chips.map((chip, index) => {
        const Icon = chip.icon
        return (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 0.72, y: [0, -6, 0], scale: 1 }}
            transition={{
              opacity: { delay: 0.4 + index * 0.12 },
              y: { duration: 5 + index, repeat: Infinity, ease: "easeInOut" },
            }}
            className={`absolute rounded-2xl border px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl ${chip.className}`}
          >
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em]">
              <Icon size={13} /> {chip.label}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function HudCornerFrame() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden md:block">
      <div className="absolute left-6 top-6 h-12 w-12 border-l border-t border-slate-300/[0.08]" />
      <div className="absolute right-6 top-6 h-12 w-12 border-r border-t border-slate-300/[0.08]" />
      <div className="absolute bottom-6 left-6 h-12 w-12 border-b border-l border-slate-300/[0.08]" />
      <div className="absolute bottom-6 right-6 h-12 w-12 border-b border-r border-slate-300/[0.08]" />
    </div>
  )
}
