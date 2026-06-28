"use client"

import { motion } from "framer-motion"

export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden lifetrack-shell">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.060),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.07),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.055),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.24] bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:86px_86px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
      <motion.div
        animate={{ x: [0, 18, -10, 0], y: [0, -12, 10, 0], scale: [1, 1.05, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.085] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -16, 12, 0], y: [0, 14, -10, 0], scale: [1, 0.98, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[18%] h-[25rem] w-[25rem] rounded-full bg-orange-500/[0.065] blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-[18%] h-px w-full bg-gradient-to-r from-transparent via-slate-300/20 to-transparent"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(5,7,12,0.86)_100%)]" />
    </div>
  )
}
