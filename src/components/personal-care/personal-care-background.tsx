"use client"

import { motion } from "framer-motion"

export function PersonalCareBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#111419]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#111419_0%,#12151b_58%,#17181d_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_72%_76%,rgba(34,211,238,0.13),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.13),transparent_26%)]" />
      <motion.div
        animate={{ x: [0, 36, -24, 0], y: [0, -22, 24, 0], scale: [1, 1.12, 0.98, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] top-[14%] h-[34rem] w-[34rem] rounded-full bg-purple-500/[0.13] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -28, 24, 0], y: [0, 22, -18, 0], scale: [1, 0.96, 1.10, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/[0.09] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, -18, 0], y: [0, -16, 16, 0], opacity: [0.10, 0.24, 0.12, 0.10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[36%] h-[24rem] w-[24rem] rounded-full bg-indigo-500/[0.12] blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(10,12,17,0.82)_100%)]" />
    </div>
  )
}
