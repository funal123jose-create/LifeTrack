"use client"

import { motion } from "framer-motion"

export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden lifetrack-shell">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#111419_0%,#12151b_58%,#17181d_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(29,78,216,0.20),transparent_28%),radial-gradient(circle_at_72%_76%,rgba(34,211,238,0.13),transparent_28%),radial-gradient(circle_at_74%_18%,rgba(124,58,237,0.13),transparent_26%)]" />
      <motion.div
        animate={{ x: [0, 18, -10, 0], y: [0, -12, 10, 0], scale: [1, 1.05, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.12] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -16, 12, 0], y: [0, 14, -10, 0], scale: [1, 0.98, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[18%] h-[25rem] w-[25rem] rounded-full bg-violet-500/[0.10] blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-[18%] h-px w-full bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(10,12,17,0.86)_100%)]" />
    </div>
  )
}
